// Package exec runs shell scripts and the safe command box, streaming their
// output to the browser as Server-Sent Events. The safe command box keeps the
// anti-cheat denylist (no base64/python/...) ported from app/server.js, so the
// learner cannot decode the broken config and skip the exercise.
//
// The interactive PTY terminal (package terminal) is the *unrestricted* shell;
// this package is the *restricted* one used for solving exercises.
package exec

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
)

// event is one SSE frame. Shape matches what the frontend terminal expects.
type event struct {
	Type string `json:"type"`           // "out" | "err" | "done"
	Text string `json:"text,omitempty"` // for out/err
	OK   *bool  `json:"ok,omitempty"`   // for done
}

type sse struct {
	w  http.ResponseWriter
	rc *http.ResponseController
}

func newSSE(w http.ResponseWriter) (*sse, bool) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.WriteHeader(http.StatusOK)
	s := &sse{w: w, rc: http.NewResponseController(w)}
	s.rc.Flush()
	return s, true
}

func (s *sse) send(e event) {
	b, _ := json.Marshal(e)
	fmt.Fprintf(s.w, "data: %s\n\n", b)
	s.rc.Flush()
}

func (s *sse) out(text string)  { s.send(event{Type: "out", Text: text}) }
func (s *sse) err(text string)  { s.send(event{Type: "err", Text: text}) }
func (s *sse) done(ok bool)     { s.send(event{Type: "done", OK: &ok}) }
func (s *sse) reject(msg string) {
	s.err(msg + "\n")
	s.done(false)
}

// streamChild runs cmd and streams its stdout (out) and stderr (err) over SSE,
// then a final done event. The command is killed after timeout.
func streamChild(ctx context.Context, s *sse, cmd *exec.Cmd, timeout time.Duration) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		s.reject("Error: " + err.Error())
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		s.reject("Error: " + err.Error())
		return
	}
	if err := cmd.Start(); err != nil {
		s.reject("Error: " + err.Error())
		return
	}

	// Kill the process if the deadline passes or the client disconnects.
	go func() {
		<-ctx.Done()
		if cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
	}()

	var wg sync.WaitGroup
	pump := func(scan *bufio.Scanner, emit func(string)) {
		defer wg.Done()
		scan.Buffer(make([]byte, 0, 64*1024), 1024*1024)
		for scan.Scan() {
			emit(scan.Text() + "\n")
		}
	}
	wg.Add(2)
	go pump(bufio.NewScanner(stdout), s.out)
	go pump(bufio.NewScanner(stderr), s.err)
	wg.Wait()

	s.done(cmd.Wait() == nil)
}

// StreamScript runs `bash <script> [args...]` from dir and streams it.
func StreamScript(w http.ResponseWriter, r *http.Request, script, dir string, timeout time.Duration, args ...string) {
	s, _ := newSSE(w)
	cmd := exec.Command("bash", append([]string{script}, args...)...)
	cmd.Dir = dir
	streamChild(r.Context(), s, cmd, timeout)
}

// ── Safe command box (anti-cheat) ────────────────────────────────────────────
//
// This is a FULL bash shell with ONE restriction: decoders are blocked so the
// learner cannot reveal the base64-encoded broken config in deploy.sh and skip
// the exercise. Any other command, plus pipes / chaining / substitution /
// redirection, is allowed. (The PTY terminal is fully unrestricted; this box is
// the one used for solving, where the anti-cheat must hold.)

// deniedCmds are decoders, blocked wherever they appear in a command.
var deniedCmds = map[string]bool{
	"base64": true, "base32": true, "xxd": true, "od": true, "openssl": true,
	"python": true, "python3": true, "node": true, "perl": true, "ruby": true,
}

var (
	cdRe     = regexp.MustCompile(`^cd(\s|$)`)
	kAlias   = regexp.MustCompile(`^k(\s|$)`)
	subOpen  = regexp.MustCompile("\\$\\(|`|\\)") // command-substitution boundaries
	cmdSep   = regexp.MustCompile(`[;|&\n]+`)     // shell command separators
)

// commandWords extracts the word in each "command position" — start of line or
// just after a separator / substitution opener — so the denylist holds even
// inside pipes, chains and $(...). Mirrors the JS logic in the legacy server.
func commandWords(cmd string) []string {
	flat := subOpen.ReplaceAllString(cmd, " ; ")
	var out []string
	for _, seg := range cmdSep.Split(flat, -1) {
		if f := strings.Fields(seg); len(f) > 0 {
			out = append(out, f[0])
		}
	}
	return out
}

// CommandRunner executes commands typed in the safe box. cwd persists across
// commands (so `cd` sticks), guarded for concurrent requests.
type CommandRunner struct {
	root string
	mu   sync.Mutex
	cwd  string
}

func NewCommandRunner(exercisesDir string) *CommandRunner {
	return &CommandRunner{root: exercisesDir, cwd: exercisesDir}
}

// Run validates cmd against the allow/deny rules, then streams it over SSE.
func (cr *CommandRunner) Run(w http.ResponseWriter, r *http.Request, cmd string, timeout time.Duration) {
	s, _ := newSSE(w)
	cmd = strings.TrimSpace(cmd)
	if cmd == "" {
		s.reject("Empty command.")
		return
	}
	cmd = kAlias.ReplaceAllString(cmd, "kubectl$1")

	cr.mu.Lock()
	defer cr.mu.Unlock()

	// `cd` is a builtin; handle it so the directory sticks for later commands.
	if cdRe.MatchString(cmd) {
		arg := strings.TrimSpace(cmd[2:])
		target := cr.root
		if arg != "" {
			target = filepath.Clean(filepath.Join(cr.cwd, arg))
		}
		if fi, err := statDir(target); err != nil || !fi {
			s.reject("cd: no such directory: " + arg)
			return
		}
		cr.cwd = target
		s.out(cr.cwd + "\n")
		s.done(true)
		return
	}

	// Block decoders wherever they appear (pipes, chains, substitution).
	for _, name := range commandWords(cmd) {
		if deniedCmds[name] {
			s.reject(name + " is disabled to keep the exercises challenging (no decoding the answer).")
			return
		}
	}

	c := exec.Command("bash", "-c", cmd)
	c.Dir = cr.cwd
	streamChild(r.Context(), s, c, timeout)
}
