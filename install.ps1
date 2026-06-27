# K8s Lab one-line installer (Windows, PowerShell).
#
#   irm https://raw.githubusercontent.com/AyenaCode/k8s-platform/main/install.ps1 | iex
#
# What it does: checks Docker Desktop, downloads the prebuilt `klab.exe` for your
# CPU into %USERPROFILE%\.k8s-lab, adds it to your PATH, then runs `klab setup`
# (fetch the compose files, pick free ports, pre-pull the image). It does NOT
# start the lab — you start it yourself with `klab run`.
#
# The ONLY requirement is Docker Desktop (with the WSL 2 backend enabled).
#
# Knobs (env vars before running, e.g.  $env:LAB_REF="v1.0.0"):
#   LAB_REF      git ref for the compose files  (default: main)
#   LAB_IMAGE    app image to run               (default: ghcr.io/ayenacode/k8s-platform:latest)
#   LAB_HOME     install directory              (default: %USERPROFILE%\.k8s-lab)
#   LAB_PORT     host port for the app          (default: 8088; auto-bumped if busy)

$ErrorActionPreference = "Stop"

$Repo    = "AyenaCode/k8s-platform"
$HomeDir = if ($env:LAB_HOME) { $env:LAB_HOME } else { Join-Path $env:USERPROFILE ".k8s-lab" }

function Say  ($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok   ($m) { Write-Host "OK  $m" -ForegroundColor Green }
function Warn ($m) { Write-Host "!   $m" -ForegroundColor Yellow }
function Die  ($m) { Write-Host "X   $m" -ForegroundColor Red; exit 1 }

# ── 1) Preconditions ─────────────────────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Die "Docker is not installed. Get Docker Desktop at https://docs.docker.com/desktop/ then re-run this."
}
try { docker info *> $null } catch { Die "Docker is installed but not running. Start Docker Desktop, then re-run this." }
if ($LASTEXITCODE -ne 0) { Die "Docker is installed but not running. Start Docker Desktop, then re-run this." }
Ok "Docker is ready."

# ── 2) Download the prebuilt klab.exe for this CPU ───────────────────────────
$arch  = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "amd64" }
$asset = "klab_windows_$arch.exe"
$exe   = Join-Path $HomeDir "klab.exe"

Say "Installing into $HomeDir"
New-Item -ItemType Directory -Force -Path $HomeDir | Out-Null
Say "Downloading klab ($asset)…"
try {
  Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/$Repo/releases/latest/download/$asset" -OutFile $exe
} catch {
  Die "Could not download the klab binary ($asset). Has a release been published yet?"
}
Ok "klab downloaded."

# ── 2b) Put the install dir on the user PATH ─────────────────────────────────
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (($userPath -split ';') -notcontains $HomeDir) {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$HomeDir", "User")
  Ok "Added $HomeDir to your PATH (new terminals will see 'klab')."
}
$env:Path = "$env:Path;$HomeDir"   # make it work in THIS session too

# ── 3) Hand off to the binary: fetch files, pick ports, pre-pull images ──────
& $exe setup

Write-Host @"

Manage the lab from anywhere with the klab command:
  klab run         # start the lab (background) + open the browser
  klab logs        # watch the services
  klab stop        # stop (keeps progress + cluster)
  klab update      # update klab + pull the latest version
  klab uninstall   # wipe EVERYTHING off this PC
  klab help        # all commands

(If 'klab' is not found, open a NEW terminal so it picks up the PATH change.)

Full guide:  $HomeDir\README.md      Help:  ayenacode1@gmail.com
"@
