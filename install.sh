#!/usr/bin/env bash
# K8s Lab one-line installer (macOS + Linux).
#
#   curl -fsSL https://raw.githubusercontent.com/AyenaCode/k8s-platform/main/install.sh | bash
#
# What it does: checks Docker, downloads the release compose file + its two helper
# files into ~/.k8s-lab, starts the stack with the PREBUILT image (no local
# build), waits for the app, opens your browser and prints the URL.
#
# The ONLY requirement on your machine is Docker (Desktop or Engine).
#
# Knobs (env vars):
#   LAB_REF      git ref to pull files from        (default: main)
#   LAB_IMAGE    app image to run                   (default: ghcr.io/ayenacode/k8s-platform:latest)
#   LAB_HOME     install directory                  (default: ~/.k8s-lab)
#   LAB_PORT     host port for the app              (default: 8088; auto-bumped if busy)
#   LAB_NO_OPEN  set to 1 to not open the browser
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

# ── 2) Fetch the release files into the install dir ──────────────────────────
say "Installing into ${HOME_DIR}"
mkdir -p "${HOME_DIR}/docker"
fetch() { curl -fsSL "${RAW}/$1" -o "${HOME_DIR}/$2" || die "Could not download $1 (ref: ${REF})."; }
fetch "docker-compose.release.yml" "docker-compose.yml"
fetch "docker/registries.yaml"     "docker/registries.yaml"
fetch "docker/warm-cache.sh"       "docker/warm-cache.sh"
fetch "release-readme.md"          "README.md"
fetch "cli/klab"                   "klab"
chmod +x "${HOME_DIR}/klab"
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

# ── 3) Start the stack (auto-picking free host ports) ────────────────────────
export LAB_IMAGE="${LAB_IMAGE:-ghcr.io/ayenacode/k8s-platform:latest}"

# Both host ports can clash: 8088 (app) and 6443 (k8s API, only used if you run
# kubectl from the host). Pick a free one for each unless the user pinned it.
API_PINNED=0; [ -n "${LAB_API_PORT:-}" ] && API_PINNED=1
APORT="${LAB_API_PORT:-6443}"
PORT="$(resolve_port "$PORT"  "$PORT_PINNED" "app")"
APORT="$(resolve_port "$APORT" "$API_PINNED" "k8s API")"
export LAB_PORT="$PORT" LAB_API_PORT="$APORT"
URL="http://localhost:${PORT}"

say "Pulling images and starting the lab (first boot pulls k3s + the app image)…"
errf="$(mktemp)"
# Stream Compose progress live AND keep a copy, so a residual bind clash (a port
# taken between our check and the bind) can trigger one more retry. pipefail
# (set above) makes the pipeline report Compose's exit status, not tee's.
start() { ( cd "${HOME_DIR}" && $COMPOSE up -d ) 2>&1 | tee "$errf"; }
if ! start; then
  if grep -qiE 'already in use|already allocated|bind for|failed to bind' "$errf" \
     && { [ "$PORT_PINNED" -eq 0 ] || [ "$API_PINNED" -eq 0 ]; }; then
    warn "A port was taken at the last moment — re-picking and retrying once…"
    ( cd "${HOME_DIR}" && $COMPOSE down >/dev/null 2>&1 || true )   # drop the half-started stack
    PORT="$(resolve_port  "$PORT"  "$PORT_PINNED" "app")"
    APORT="$(resolve_port "$APORT" "$API_PINNED" "k8s API")"
    export LAB_PORT="$PORT" LAB_API_PORT="$APORT"; URL="http://localhost:${PORT}"
    start || { rm -f "$errf"; die "Still could not start. See: cd ${HOME_DIR} && $COMPOSE logs"; }
  else
    rm -f "$errf"
    die "Failed to start the stack. See: cd ${HOME_DIR} && $COMPOSE logs"
  fi
fi
rm -f "$errf"
ok "Stack started (app port ${PORT}, k8s API port ${APORT})."

# Persist the resolved image + ports. Compose reads this folder's .env on every
# run, so later `docker compose up -d` reuses the SAME ports (no surprise clash).
cat > "${HOME_DIR}/.env" <<ENV
# Written by the K8s Lab installer. Compose loads this automatically.
LAB_IMAGE=${LAB_IMAGE}
LAB_PORT=${PORT}
LAB_API_PORT=${APORT}
ENV

# ── 4) Wait for the app (k3s needs ~30s on a cold start) ─────────────────────
say "Waiting for the cluster + app to come up (up to ~3 min on first run)…"
i=0
until curl -fsS -o /dev/null "${URL}" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 90 ]; then
    warn "The app did not answer on ${URL} yet."
    warn "It may still be starting. Check logs: cd ${HOME_DIR} && $COMPOSE logs -f app"
    break
  fi
  sleep 2
done
[ "$i" -le 90 ] && ok "The lab is up."

# ── 5) Open the browser + print the link ─────────────────────────────────────
if [ "${LAB_NO_OPEN:-0}" != "1" ]; then
  if   command -v open      >/dev/null 2>&1; then open "${URL}"       >/dev/null 2>&1 || true   # macOS
  elif command -v xdg-open  >/dev/null 2>&1; then xdg-open "${URL}"   >/dev/null 2>&1 || true   # Linux
  fi
fi

cat <<EOF

${G}${B}K8s Lab is ready.${N}  Open:  ${B}${URL}${N}

Manage it from anywhere with the ${B}klab${N} command:
  klab logs        # watch logs
  klab stop        # stop (keeps progress + cluster)
  klab run         # start again
  klab update      # pull the latest version
  klab uninstall   # remove the lab's data (fresh start)
  klab clean       # wipe EVERYTHING off this PC (images + files + command)
  klab help        # all commands

(If 'klab' is not found, restart your terminal or run ${HOME_DIR}/klab)

Full guide:  ${HOME_DIR}/README.md      Help:  ayenacode1@gmail.com
EOF
