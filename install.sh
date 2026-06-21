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
free_port() { local p="$1"; while port_busy "$p"; do p=$((p+1)); [ "$p" -gt 8200 ] && break; done; printf '%s' "$p"; }

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
ok "Lab files downloaded."

# ── 3) Start the stack (auto-falling back if the port is taken) ──────────────
export LAB_IMAGE="${LAB_IMAGE:-ghcr.io/ayenacode/k8s-platform:latest}"
export LAB_PORT="$PORT"
say "Pulling images and starting the lab (first boot pulls k3s + the app image)…"
( cd "${HOME_DIR}" && $COMPOSE pull --quiet 2>/dev/null || true )

errf="$(mktemp)"
start() { ( cd "${HOME_DIR}" && $COMPOSE up -d ) 2>"$errf"; }
if ! start; then
  # A foreign process on the port makes the k3s container fail to bind. If the
  # user didn't pin LAB_PORT, retry once on the next free port.
  if [ "$PORT_PINNED" -eq 0 ] && grep -qiE 'already in use|already allocated|bind for|failed to bind' "$errf"; then
    newp="$(free_port $((PORT + 1)))"
    warn "Port ${PORT} is already in use on this machine. Retrying on free port ${newp}…"
    PORT="$newp"; export LAB_PORT="$PORT"; URL="http://localhost:${PORT}"
    ( cd "${HOME_DIR}" && $COMPOSE down >/dev/null 2>&1 || true )   # drop the half-started stack
    if ! start; then cat "$errf" >&2; rm -f "$errf"; die "Still could not start. See: cd ${HOME_DIR} && $COMPOSE logs"; fi
  else
    cat "$errf" >&2; rm -f "$errf"
    die "Failed to start the stack. See: cd ${HOME_DIR} && $COMPOSE logs"
  fi
fi
rm -f "$errf"
ok "Stack started on port ${PORT}."

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

Manage it:
  cd ${HOME_DIR}
  ${COMPOSE} logs -f app     # watch logs
  ${COMPOSE} stop            # stop (keeps progress + cluster)
  ${COMPOSE} up -d           # start again
  ${COMPOSE} down -v         # remove everything (fresh start)
EOF
