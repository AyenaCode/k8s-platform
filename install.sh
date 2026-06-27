#!/usr/bin/env bash
# K8s Lab one-line installer (macOS + Linux).
#
#   curl -fsSL https://raw.githubusercontent.com/AyenaCode/k8s-platform/main/install.sh | bash
#
# What it does: checks Docker, downloads the release compose file + its two helper
# files into ~/.k8s-lab, installs the `klab` command, picks free host ports and
# pre-pulls the PREBUILT image (no local build). It does NOT start the lab — you
# start it yourself with `klab run` (same flow as `klab update`).
#
# The ONLY requirement on your machine is Docker (Desktop or Engine).
#
# Knobs (env vars):
#   LAB_REF      git ref to pull files from        (default: main)
#   LAB_IMAGE    app image to run                   (default: ghcr.io/ayenacode/k8s-platform:latest)
#   LAB_HOME     install directory                  (default: ~/.k8s-lab)
#   LAB_PORT     host port for the app              (default: 8088; auto-bumped if busy)
set -euo pipefail

REPO="AyenaCode/k8s-platform"
REF="${LAB_REF:-main}"
RAW="https://raw.githubusercontent.com/${REPO}/${REF}"
HOME_DIR="${LAB_HOME:-$HOME/.k8s-lab}"
# Did the user pin a port? If so we respect it and never auto-bump.
PORT_PINNED=0; [ -n "${LAB_PORT:-}" ] && PORT_PINNED=1
PORT="${LAB_PORT:-8088}"
URL="http://localhost:${PORT}"

# Pretty output (no-op if not a TTY).
if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; N=$'\033[0m'; else B=; G=; Y=; R=; N=; fi
say()  { printf '%s\n' "${B}==>${N} $*"; }
ok()   { printf '%s\n' "${G}✓${N} $*"; }
warn() { printf '%s\n' "${Y}!${N} $*" >&2; }
die()  { printf '%s\n' "${R}✗${N} $*" >&2; exit 1; }

# Is something already listening on this TCP port? (bash /dev/tcp, portable on mac+linux)
port_busy() { (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null && { exec 3>&- 3<&-; return 0; }; return 1; }
# First free port at/above the given one.
free_port() { local p="$1"; while port_busy "$p"; do p=$((p+1)); [ "$p" -gt 65000 ] && break; done; printf '%s' "$p"; }
# Resolve a host port: keep it if the user pinned it, else bump past anything
# already listening. Echoes the chosen port. Args: <port> <pinned 0|1> <label>
resolve_port() {
  local p="$1" pinned="$2" label="$3" np
  if [ "$pinned" -eq 0 ] && port_busy "$p"; then
    np="$(free_port $((p + 1)))"
    warn "Port ${p} (${label}) is already in use on this machine — using ${np} instead."
    p="$np"
  fi
  printf '%s' "$p"
}

# ── 1) Preconditions ─────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || die "Docker is not installed. Get it at https://docs.docker.com/get-docker/ then re-run this."
docker info >/dev/null 2>&1       || die "Docker is installed but not running. Start Docker Desktop / the docker daemon, then re-run this."

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  die "Docker Compose is missing. Install Docker Desktop (it bundles Compose) or the compose plugin."
fi
ok "Docker and Compose are ready."

command -v curl >/dev/null 2>&1 || die "curl is required to download the lab files."

# ── 2) Download the lab files (klab owns the list; we just bootstrap it) ─────
say "Installing into ${HOME_DIR}"
mkdir -p "${HOME_DIR}/docker"
# Bootstrap the manager script, then let it download everything else. The file
# list has a single source of truth: klab's sync_files() (run via internal-sync).
curl -fsSL "${RAW}/cli/klab" -o "${HOME_DIR}/klab" || die "Could not download cli/klab (ref: ${REF})."
chmod +x "${HOME_DIR}/klab"
KLAB_HOME="${HOME_DIR}" KLAB_REPO="${REPO}" LAB_REF="${REF}" bash "${HOME_DIR}/klab" internal-sync \
  || die "Could not download the lab files (ref: ${REF})."
ok "Lab files downloaded."

# ── 2b) Put the `klab` manager command on the PATH ───────────────────────────
# So the user can run `klab run|stop|logs|update|…` from anywhere, never needing
# to cd into the install dir. Prefer a system bin, fall back to a user one. The
# script itself lives in HOME_DIR; we just drop a symlink in the PATH.
install_cli() {
  local target="${HOME_DIR}/klab" dir
  for dir in /usr/local/bin "$HOME/.local/bin"; do
    if [ -d "$dir" ] && [ -w "$dir" ]; then
      ln -sf "$target" "$dir/klab" && { CLI_BIN="$dir/klab"; return 0; }
    fi
  done
  # /usr/local/bin usually needs sudo; try it without prompting hard.
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    sudo ln -sf "$target" /usr/local/bin/klab && { CLI_BIN="/usr/local/bin/klab"; return 0; }
  fi
  # Last resort: ~/.local/bin, creating it if needed.
  mkdir -p "$HOME/.local/bin" && ln -sf "$target" "$HOME/.local/bin/klab" \
    && { CLI_BIN="$HOME/.local/bin/klab"; return 0; }
  return 1
}
if install_cli; then
  ok "Installed the 'klab' command at ${CLI_BIN}."
  case ":${PATH}:" in
    *":$(dirname "$CLI_BIN"):"*) : ;;
    *) warn "$(dirname "$CLI_BIN") is not on your PATH. Add it, e.g.:  echo 'export PATH=\"$(dirname "$CLI_BIN"):\$PATH\"' >> ~/.bashrc" ;;
  esac
else
  warn "Could not install the 'klab' command on your PATH. You can still run it: ${HOME_DIR}/klab"
fi

# ── 3) Pick free host ports, persist them, and pre-pull the images ───────────
export LAB_IMAGE="${LAB_IMAGE:-ghcr.io/ayenacode/k8s-platform:latest}"

# Both host ports can clash: 8088 (app) and 6443 (k8s API, only used if you run
# kubectl from the host). Pick a free one for each unless the user pinned it.
# We only RESERVE them here (no bind happens until `klab run`).
API_PINNED=0; [ -n "${LAB_API_PORT:-}" ] && API_PINNED=1
APORT="${LAB_API_PORT:-6443}"
PORT="$(resolve_port "$PORT"  "$PORT_PINNED" "app")"
APORT="$(resolve_port "$APORT" "$API_PINNED" "k8s API")"
export LAB_PORT="$PORT" LAB_API_PORT="$APORT"
URL="http://localhost:${PORT}"

# Persist the resolved image + ports. Compose reads this folder's .env on every
# run, so `klab run` reuses the SAME ports (no surprise clash).
cat > "${HOME_DIR}/.env" <<ENV
# Written by the K8s Lab installer. Compose loads this automatically.
LAB_IMAGE=${LAB_IMAGE}
LAB_PORT=${PORT}
LAB_API_PORT=${APORT}
ENV

# Pre-pull the images so the first `klab run` is fast and any pull error shows up
# now, not mid-lesson. We do NOT start the stack — same flow as `klab update`:
# the user starts it themselves with `klab run`.
say "Pulling images (first boot pulls k3s + the app image)…"
( cd "${HOME_DIR}" && $COMPOSE pull ) \
  || warn "Could not pre-pull every image; 'klab run' will pull what's missing on first start."
ok "Images ready (app port ${PORT}, k8s API port ${APORT})."

cat <<EOF

${G}${B}K8s Lab is installed.${N}

Start it whenever you want:
  ${B}klab run${N}          # start in this terminal (Ctrl-C stops it)
  ${B}klab run -d${N}       # …or start it in the background
Then open:  ${B}${URL}${N}  (ready ~30s on first boot)

Other commands:
  klab logs        # watch logs
  klab stop        # stop (keeps progress + cluster)
  klab update      # pull the latest version
  klab uninstall   # remove the lab's data (fresh start)
  klab clean       # wipe EVERYTHING off this PC (images + files + command)
  klab help        # all commands

(If 'klab' is not found, restart your terminal or run ${HOME_DIR}/klab)

Full guide:  ${HOME_DIR}/README.md      Help:  ayenacode1@gmail.com
EOF
