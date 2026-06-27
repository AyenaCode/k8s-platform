#!/usr/bin/env bash
# K8s Lab one-line installer (macOS + Linux).
#
#   curl -fsSL https://raw.githubusercontent.com/AyenaCode/k8s-platform/main/install.sh | bash
#
# What it does: checks Docker, downloads the prebuilt `klab` binary for your
# OS/arch into ~/.k8s-lab, puts it on your PATH, then runs `klab setup` (fetch
# the compose files, pick free ports, pre-pull the image). It does NOT start the
# lab — you start it yourself with `klab run`.
#
# The ONLY requirement on your machine is Docker (Desktop or Engine).
#
# Knobs (env vars):
#   LAB_REF      git ref for the compose files   (default: main)
#   LAB_IMAGE    app image to run                 (default: ghcr.io/ayenacode/k8s-platform:latest)
#   LAB_HOME     install directory                (default: ~/.k8s-lab)
#   LAB_PORT     host port for the app            (default: 8088; auto-bumped if busy)
set -euo pipefail

REPO="AyenaCode/k8s-platform"
HOME_DIR="${LAB_HOME:-$HOME/.k8s-lab}"

# Pretty output (no-op if not a TTY).
if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; N=$'\033[0m'; else B=; G=; Y=; R=; N=; fi
say()  { printf '%s\n' "${B}==>${N} $*"; }
ok()   { printf '%s\n' "${G}✓${N} $*"; }
warn() { printf '%s\n' "${Y}!${N} $*" >&2; }
die()  { printf '%s\n' "${R}✗${N} $*" >&2; exit 1; }

# ── 1) Preconditions ─────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || die "Docker is not installed. Get it at https://docs.docker.com/get-docker/ then re-run this."
docker info >/dev/null 2>&1       || die "Docker is installed but not running. Start Docker Desktop / the docker daemon, then re-run this."
command -v curl >/dev/null 2>&1   || die "curl is required to download klab."
ok "Docker is ready."

# ── 2) Download the prebuilt klab binary for this OS/arch ────────────────────
os="$(uname -s | tr '[:upper:]' '[:lower:]')"
case "$os" in linux|darwin) ;; *) die "Unsupported OS: ${os} (this installer is for Linux/macOS; use install.ps1 on Windows)." ;; esac
case "$(uname -m)" in
  x86_64|amd64)  arch=amd64 ;;
  aarch64|arm64) arch=arm64 ;;
  *) die "Unsupported CPU architecture: $(uname -m)." ;;
esac
asset="klab_${os}_${arch}"

say "Installing into ${HOME_DIR}"
mkdir -p "${HOME_DIR}"
say "Downloading klab (${asset})…"
curl -fsSL "https://github.com/${REPO}/releases/latest/download/${asset}" -o "${HOME_DIR}/klab" \
  || die "Could not download the klab binary (${asset}). Has a release been published yet?"
chmod +x "${HOME_DIR}/klab"
ok "klab downloaded."

# ── 2b) Put the `klab` command on the PATH ───────────────────────────────────
# The binary lives in HOME_DIR; we just drop a symlink on the PATH so the user
# can run `klab` from anywhere. Prefer a system bin, fall back to a user one.
install_cli() {
  local target="${HOME_DIR}/klab" dir
  for dir in /usr/local/bin "$HOME/.local/bin"; do
    if [ -d "$dir" ] && [ -w "$dir" ]; then
      ln -sf "$target" "$dir/klab" && { CLI_BIN="$dir/klab"; return 0; }
    fi
  done
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    sudo ln -sf "$target" /usr/local/bin/klab && { CLI_BIN="/usr/local/bin/klab"; return 0; }
  fi
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

# ── 3) Hand off to the binary: fetch files, pick ports, pre-pull images ──────
# Everything else lives in one place now (the Go binary), shared by every OS.
KLAB_HOME="${HOME_DIR}" "${HOME_DIR}/klab" setup

cat <<EOF

Manage the lab from anywhere with the ${B}klab${N} command:
  klab run         # start the lab (background) + open the browser
  klab logs        # watch the services
  klab stop        # stop (keeps progress + cluster)
  klab update      # update klab + pull the latest version
  klab uninstall   # wipe EVERYTHING off this PC
  klab help        # all commands

(If 'klab' is not found, restart your terminal or run ${HOME_DIR}/klab)

Full guide:  ${HOME_DIR}/README.md      Help:  ayenacode1@gmail.com
EOF
