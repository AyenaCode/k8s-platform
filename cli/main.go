// klab — a small, cross-platform manager for the K8s Lab.
//
// It is a thin driver around `docker compose`: it remembers WHERE the lab is
// installed (~/.k8s-lab) and runs Compose with the right -f / --project-directory
// so you never have to cd into the folder. All the real work lives in Docker.
//
//	klab setup | run | stop | restart | status | logs | shell | reset
//	klab update | url | uninstall | clean | version | help
//
// Knobs (env vars):
//
//	KLAB_HOME           install directory          (default: ~/.k8s-lab)
//	LAB_REF             git ref to pull files from  (default: main)
//	LAB_IMAGE           app image to run            (default: ghcr.io/ayenacode/k8s-platform:latest)
//	LAB_PORT            host port for the app       (default: 8088; auto-bumped if busy)
//	LAB_API_PORT        host port for the k8s API   (default: 6443; auto-bumped if busy)
//	KLAB_BROWSER_DELAY  seconds before opening the browser on `run` (default: 6; 0 = at once)
package main

import (
	"bufio"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

// version is overridden at build time with -ldflags "-X main.version=<tag>".
var version = "dev"

const (
	repo         = "AyenaCode/k8s-platform"
	appService   = "app"
	defaultImage = "ghcr.io/ayenacode/k8s-platform:latest"
)

// ── small helpers ────────────────────────────────────────────────────────────

var (
	bold, green, yellow, red, reset string
)

func init() {
	if isTTY(os.Stdout) && os.Getenv("NO_COLOR") == "" {
		bold, green, yellow, red, reset = "\033[1m", "\033[32m", "\033[33m", "\033[31m", "\033[0m"
	}
}

func isTTY(f *os.File) bool {
	fi, err := f.Stat()
	return err == nil && fi.Mode()&os.ModeCharDevice != 0
}

func say(m string)  { fmt.Printf("%s==>%s %s\n", bold, reset, m) }
func ok(m string)   { fmt.Printf("%s✓%s %s\n", green, reset, m) }
func warn(m string) { fmt.Fprintf(os.Stderr, "%s!%s %s\n", yellow, reset, m) }
func die(m string)  { fmt.Fprintf(os.Stderr, "%s✗%s %s\n", red, reset, m); os.Exit(1) }
func must(err error) {
	if err != nil {
		die(err.Error())
	}
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func atoiDefault(s string, def int) int {
	if n, err := strconv.Atoi(strings.TrimSpace(s)); err == nil {
		return n
	}
	return def
}

// ── paths & sources ──────────────────────────────────────────────────────────

func homeDir() string {
	if d := os.Getenv("KLAB_HOME"); d != "" {
		return d
	}
	h, err := os.UserHomeDir()
	if err != nil {
		die("Could not find your home directory: " + err.Error())
	}
	return filepath.Join(h, ".k8s-lab")
}

func composeFile() string { return filepath.Join(homeDir(), "docker-compose.yml") }
func ref() string         { return env("LAB_REF", "main") }
func rawBase() string     { return "https://raw.githubusercontent.com/" + repo + "/" + ref() }
func releaseBase() string { return "https://github.com/" + repo + "/releases/latest/download" }

// ── docker compose plumbing ──────────────────────────────────────────────────

// compose is the resolved Compose command, e.g. {"docker","compose"} or
// {"docker-compose"}. Filled once by ensureCompose.
var compose []string

func ensureCompose() {
	if compose != nil {
		return
	}
	if exec.Command("docker", "compose", "version").Run() == nil {
		compose = []string{"docker", "compose"}
		return
	}
	if _, err := exec.LookPath("docker-compose"); err == nil {
		compose = []string{"docker-compose"}
		return
	}
	die("Docker Compose is missing. Install Docker Desktop or the compose plugin.")
}

// dc builds a Compose command bound to the lab's file + project directory, with
// stdio wired to this process so progress and prompts pass through.
func dc(args ...string) *exec.Cmd {
	full := append([]string{}, compose[1:]...)
	full = append(full, "-f", composeFile(), "--project-directory", homeDir())
	full = append(full, args...)
	cmd := exec.Command(compose[0], full...)
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	return cmd
}

func dcRun(args ...string) error { return dc(args...).Run() }

// ── networking: free-port resolution ─────────────────────────────────────────

func portBusy(p int) bool {
	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", p))
	if err != nil {
		return true
	}
	_ = ln.Close()
	return false
}

func freePort(p int) int {
	for portBusy(p) && p < 65000 {
		p++
	}
	return p
}

// resolvePort keeps a pinned port as-is, otherwise bumps past anything already
// listening so `klab run` won't fail to bind later.
func resolvePort(p int, pinned bool, label string) int {
	if !pinned && portBusy(p) {
		np := freePort(p + 1)
		warn(fmt.Sprintf("Port %d (%s) is already in use — using %d instead.", p, label, np))
		return np
	}
	return p
}

// ── file download / sync ─────────────────────────────────────────────────────

func download(url, dest string) error {
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GET %s: %s", url, resp.Status)
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}
	f, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, resp.Body)
	return err
}

// syncFiles re-downloads the lab's runtime files (NOT the klab binary — that is
// handled by selfUpdate). Leaves .env (the user's ports) untouched.
func syncFiles() error {
	// ordered so the message stream reads sensibly
	files := []struct{ src, dst string }{
		{"docker-compose.release.yml", "docker-compose.yml"},
		{"docker/registries.yaml", filepath.Join("docker", "registries.yaml")},
		{"docker/warm-cache.sh", filepath.Join("docker", "warm-cache.sh")},
		{"release-readme.md", "README.md"},
	}
	for _, f := range files {
		if err := download(rawBase()+"/"+f.src, filepath.Join(homeDir(), f.dst)); err != nil {
			return fmt.Errorf("could not download %s (ref: %s): %w", f.src, ref(), err)
		}
	}
	return nil
}

// ── .env (resolved image + ports) ────────────────────────────────────────────

func writeEnv(image string, port, apiPort int) error {
	content := fmt.Sprintf(
		"# Written by klab. Compose loads this automatically.\nLAB_IMAGE=%s\nLAB_PORT=%d\nLAB_API_PORT=%d\n",
		image, port, apiPort,
	)
	return os.WriteFile(filepath.Join(homeDir(), ".env"), []byte(content), 0o644)
}

func labPort() int {
	f, err := os.Open(filepath.Join(homeDir(), ".env"))
	if err != nil {
		return 8088
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		if v, found := strings.CutPrefix(sc.Text(), "LAB_PORT="); found {
			return atoiDefault(v, 8088)
		}
	}
	// Scan() also returns false on a read error (not just EOF); surface it so a
	// truncated .env doesn't silently fall back to the default port.
	if err := sc.Err(); err != nil {
		warn("Could not read .env: " + err.Error())
	}
	return 8088
}

func labURL() string { return fmt.Sprintf("http://localhost:%d", labPort()) }

// ── browser ──────────────────────────────────────────────────────────────────

// openBrowser launches the OS default browser. Best-effort: a failure is fine,
// we already printed the URL. Same per-OS commands the pkg/browser lib uses.
func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", "", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}

func browserDelay() time.Duration {
	return time.Duration(atoiDefault(os.Getenv("KLAB_BROWSER_DELAY"), 6)) * time.Second
}

// ── self-update (the klab binary) ────────────────────────────────────────────

func assetName() string {
	name := fmt.Sprintf("klab_%s_%s", runtime.GOOS, runtime.GOARCH)
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	return name
}

// selfUpdate downloads the matching binary from the latest GitHub release and
// atomically replaces the running executable. Works on Windows too: a running
// .exe cannot be overwritten in place, so we move it aside first.
func selfUpdate() error {
	url := releaseBase() + "/" + assetName()
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download %s: %s", url, resp.Status)
	}

	self, err := os.Executable()
	if err != nil {
		return err
	}
	if resolved, err := filepath.EvalSymlinks(self); err == nil {
		self = resolved // update the real file, not the PATH symlink
	}

	dir := filepath.Dir(self)
	tmp, err := os.CreateTemp(dir, "klab-*.new")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	if _, err := io.Copy(tmp, resp.Body); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return err
	}
	tmp.Close()
	if err := os.Chmod(tmpName, 0o755); err != nil {
		os.Remove(tmpName)
		return err
	}

	old := self + ".old"
	os.Remove(old)
	if err := os.Rename(self, old); err != nil {
		os.Remove(tmpName)
		return err
	}
	if err := os.Rename(tmpName, self); err != nil {
		os.Rename(old, self) // roll back
		os.Remove(tmpName)
		return err
	}
	os.Remove(old) // best-effort (Windows may keep the old file locked)
	return nil
}

func needInstall() {
	if _, err := os.Stat(composeFile()); err != nil {
		die("Lab is not installed at " + homeDir() + ".\n" +
			"  Install it:  curl -fsSL https://raw.githubusercontent.com/" + repo + "/main/install.sh | bash")
	}
}

// removeCliLink drops the klab symlink the installer placed on the PATH (unix).
func removeCliLink() {
	home, _ := os.UserHomeDir()
	for _, dir := range []string{"/usr/local/bin", filepath.Join(home, ".local", "bin")} {
		p := filepath.Join(dir, "klab")
		if fi, err := os.Lstat(p); err == nil && fi.Mode()&os.ModeSymlink != 0 {
			os.Remove(p)
		}
	}
}

// ── commands ─────────────────────────────────────────────────────────────────

// cmdSetup is what the installer runs after dropping the binary on the PATH:
// fetch the runtime files, pick free ports, persist them, and pre-pull images.
// It does NOT start the lab — the user does that with `klab run`.
func cmdSetup() {
	ensureCompose()
	say("Downloading the lab files…")
	must(syncFiles())
	ok("Lab files downloaded.")

	image := env("LAB_IMAGE", defaultImage)
	port := resolvePort(atoiDefault(os.Getenv("LAB_PORT"), 8088), os.Getenv("LAB_PORT") != "", "app")
	apiPort := resolvePort(atoiDefault(os.Getenv("LAB_API_PORT"), 6443), os.Getenv("LAB_API_PORT") != "", "k8s API")
	must(writeEnv(image, port, apiPort))

	say("Pulling images (first boot pulls k3s + the app image)…")
	if err := dcRun("pull"); err != nil {
		warn("Could not pre-pull every image; 'klab run' will pull what's missing on first start.")
	}
	ok(fmt.Sprintf("Images ready (app port %d, k8s API port %d).", port, apiPort))

	fmt.Println()
	fmt.Printf("%sK8s Lab is installed.%s  Start it:  %sklab run%s\n", bold, reset, bold, reset)
	fmt.Printf("Then open:  %s%s%s\n", bold, labURL(), reset)
}

// cmdRun starts the stack in the BACKGROUND and prints only the essentials. We
// deliberately do NOT stream logs here (use `klab logs`), so closing this
// terminal never stops the lab.
func cmdRun() {
	needInstall()
	ensureCompose()
	url := labURL()

	say("Starting the lab in the background…")
	if err := dcRun("up", "-d"); err != nil {
		die("Failed to start the lab. Inspect it with:  klab logs")
	}

	fmt.Println()
	ok("Lab is up (running in the background).")
	fmt.Printf("  %sOpen%s    %s%s%s   (ready ~30s on first boot)\n", bold, reset, bold, url, reset)
	fmt.Printf("  %sLogs%s    klab logs     watch the services (Ctrl-C just stops watching)\n", bold, reset)
	fmt.Printf("  %sStop%s    klab stop     stop the lab (keeps your progress)\n", bold, reset)
	fmt.Printf("  %sHelp%s    klab -h       all commands\n", bold, reset)

	if d := browserDelay(); d > 0 {
		fmt.Printf("\nOpening your browser in %ds…\n", int(d.Seconds()))
		time.Sleep(d)
	}
	openBrowser(url)
}

func cmdUpdate() {
	needInstall()
	ensureCompose()

	say("Updating the klab command…")
	if err := selfUpdate(); err != nil {
		warn("Could not self-update the klab binary: " + err.Error())
	} else {
		ok("klab updated to the latest release.")
	}

	say(fmt.Sprintf("Re-downloading the latest lab files (ref: %s)…", ref()))
	must(syncFiles())
	ok("Lab files updated.")

	if err := dcRun("pull"); err != nil {
		warn("Some images could not be pulled.")
	} else {
		ok("Pulled the latest image.")
	}

	// Drop the OLD containers so the freshly pulled image takes effect on the
	// next start. `down` (NO -v) removes containers + the network only; the named
	// volumes (pgdata = progress, k3s-data = cluster, registry-cache) survive, so
	// this is NOT `klab uninstall`.
	if err := dcRun("down"); err != nil {
		warn("compose down reported errors.")
	}
	ok("Update ready. Old containers removed (progress + cluster data kept).")
	fmt.Printf("Start the new version when you want:  %sklab run%s\n", bold, reset)
}

// cmdUninstall fully removes the lab from this machine: containers, volumes, all
// of its images, the install dir, and the klab command itself.
func cmdUninstall(args []string) {
	yes := len(args) > 0 && (args[0] == "-y" || args[0] == "--yes")
	if !yes {
		fmt.Printf("This deletes the lab's containers, volumes, ALL its Docker images, %s, and the klab command. Continue? [y/N] ", homeDir())
		line, _ := bufio.NewReader(os.Stdin).ReadString('\n')
		switch strings.ToLower(strings.TrimSpace(line)) {
		case "y", "yes":
		default:
			die("Cancelled.")
		}
	}
	ensureCompose()
	if _, err := os.Stat(composeFile()); err == nil {
		if err := dcRun("down", "-v", "--rmi", "all", "--remove-orphans"); err != nil {
			warn("Compose teardown reported errors; continuing.")
		}
	} else {
		warn("No install found at " + homeDir() + "; just cleaning up leftovers.")
	}
	removeCliLink()
	if err := os.RemoveAll(homeDir()); err != nil {
		warn("Could not remove " + homeDir() + " (a running binary may be locked on Windows): " + err.Error())
	} else {
		ok("Removed " + homeDir() + ".")
	}
	ok("Done. The K8s Lab is fully removed from this machine.")
}

func cmdVersion() {
	fmt.Printf("klab %s\n", version)
	if _, err := os.Stat(composeFile()); err == nil {
		ensureCompose()
		_ = dcRun("config", "--images")
	}
}

func usage() {
	fmt.Printf(`%sklab%s — manage your K8s Lab from anywhere (install dir: %s)

%sUsage:%s  klab <command>

%sCommands:%s
  run            Start the lab in the background, then print the URL + open it.
  stop           Stop the lab (keeps your progress + cluster data).
  restart        Stop, then start again in the background.
  status         Show service status.
  logs           Stream the app logs (Ctrl-C stops watching, NOT the lab).
  shell          Open a shell inside the lab container.
  reset          Wipe the scratch cluster state (keeps the install).
  update         Self-update klab + pull the latest image (keeps progress).
  url            Print the lab URL.
  clean          Remove containers + volumes for a fresh start (keeps install).
  uninstall      FULL removal: containers, volumes, images, install dir, command.
  version        Show klab + the running app image.
  setup          (installer) Fetch files, pick ports, pre-pull images.
  help           Show this help (also: klab -h, klab --help).
`, bold, reset, homeDir(), bold, reset, bold, reset)
}

func main() {
	args := os.Args[1:]
	cmd := "help"
	if len(args) > 0 {
		cmd = args[0]
		args = args[1:]
	}

	switch cmd {
	case "run", "up", "start":
		cmdRun()
	case "stop", "down":
		needInstall()
		ensureCompose()
		must(dcRun("stop"))
		ok("Lab stopped (data kept). Start again: klab run")
	case "restart":
		needInstall()
		ensureCompose()
		// `down` (NO -v) removes the old containers + network so they are
		// recreated fresh; the named volumes (progress + cluster) survive.
		if err := dcRun("down"); err != nil {
			warn("compose down reported errors.")
		}
		cmdRun()
	case "status", "ps":
		needInstall()
		ensureCompose()
		must(dcRun("ps"))
	case "logs":
		needInstall()
		ensureCompose()
		_ = dcRun("logs", "-f", appService) // Ctrl-C here just ends the stream
	case "shell", "sh", "exec":
		needInstall()
		ensureCompose()
		_ = dcRun("exec", appService, "bash")
	case "reset":
		needInstall()
		ensureCompose()
		must(dcRun("exec", appService, "bash", "/app/content/reset.sh"))
		ok("Scratch cluster state wiped.")
	case "update", "upgrade":
		cmdUpdate()
	case "setup", "internal-sync":
		cmdSetup()
	case "url":
		fmt.Println(labURL())
	case "clean":
		needInstall()
		ensureCompose()
		must(dcRun("down", "-v"))
		ok("Containers and data removed — fresh start (images + install kept).")
		fmt.Printf("  To remove klab entirely from this PC, run: %sklab uninstall%s\n", bold, reset)
	case "uninstall", "rm", "destroy", "nuke", "purge":
		cmdUninstall(args)
	case "version", "--version", "-v":
		cmdVersion()
	case "help", "-h", "--help":
		usage()
	default:
		warn("Unknown command: " + cmd)
		usage()
		os.Exit(1)
	}
}
