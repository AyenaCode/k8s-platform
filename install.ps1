# K8s Lab one-line installer (Windows, PowerShell).
#
#   irm https://raw.githubusercontent.com/AyenaCode/k8s-platform/main/install.ps1 | iex
#
# What it does: checks Docker Desktop, downloads the release compose file + its two
# helper files into %USERPROFILE%\.k8s-lab, picks free host ports and pre-pulls the
# PREBUILT image (no local build). It does NOT start the lab — you start it
# yourself with `docker compose up -d`.
#
# The ONLY requirement is Docker Desktop (with the WSL 2 backend enabled).
#
# Knobs (env vars before running, e.g.  $env:LAB_REF="v1.0.0"):
#   LAB_REF      git ref to pull files from   (default: main)
#   LAB_IMAGE    app image to run             (default: ghcr.io/ayenacode/k8s-platform:latest)
#   LAB_HOME     install directory            (default: %USERPROFILE%\.k8s-lab)
#   LAB_PORT     host port for the app        (default: 8088; auto-bumped if busy)

$ErrorActionPreference = "Stop"

$Repo    = "AyenaCode/k8s-platform"
$Ref     = if ($env:LAB_REF)  { $env:LAB_REF }  else { "main" }
$Raw     = "https://raw.githubusercontent.com/$Repo/$Ref"
$HomeDir = if ($env:LAB_HOME) { $env:LAB_HOME } else { Join-Path $env:USERPROFILE ".k8s-lab" }
$PortPinned = [bool]$env:LAB_PORT
$Port    = if ($env:LAB_PORT) { [int]$env:LAB_PORT } else { 8088 }
$Url     = "http://localhost:$Port"

function Say  ($m) { Write-Host "==> $m" -ForegroundColor Cyan }
function Ok   ($m) { Write-Host "OK  $m" -ForegroundColor Green }
function Warn ($m) { Write-Host "!   $m" -ForegroundColor Yellow }
function Die  ($m) { Write-Host "X   $m" -ForegroundColor Red; exit 1 }

function PortBusy ($p) { [bool](Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue) }
function FreePort ($p) { while ((PortBusy $p) -and $p -lt 8200) { $p++ }; $p }

# ── 1) Preconditions ─────────────────────────────────────────────────────────
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Die "Docker is not installed. Get Docker Desktop at https://docs.docker.com/desktop/ then re-run this."
}
try { docker info *> $null } catch { Die "Docker is installed but not running. Start Docker Desktop, then re-run this." }
if ($LASTEXITCODE -ne 0) { Die "Docker is installed but not running. Start Docker Desktop, then re-run this." }

docker compose version *> $null
if ($LASTEXITCODE -eq 0) { $Compose = @("docker","compose") }
elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) { $Compose = @("docker-compose") }
else { Die "Docker Compose is missing. Docker Desktop bundles it — update Docker Desktop." }
Ok "Docker and Compose are ready."

# ── 2) Fetch the release files ───────────────────────────────────────────────
Say "Installing into $HomeDir"
New-Item -ItemType Directory -Force -Path (Join-Path $HomeDir "docker") | Out-Null
function Fetch ($src, $dst) {
  try { Invoke-WebRequest -UseBasicParsing -Uri "$Raw/$src" -OutFile (Join-Path $HomeDir $dst) }
  catch { Die "Could not download $src (ref: $Ref)." }
}
Fetch "docker-compose.release.yml" "docker-compose.yml"
Fetch "docker/registries.yaml"     (Join-Path "docker" "registries.yaml")
Fetch "docker/warm-cache.sh"       (Join-Path "docker" "warm-cache.sh")
Fetch "release-readme.md"          "README.md"
Ok "Lab files downloaded."

# ── 3) Pick free host ports, persist them, and pre-pull the images ───────────
if (-not $env:LAB_IMAGE) { $env:LAB_IMAGE = "ghcr.io/ayenacode/k8s-platform:latest" }

# Both host ports can clash: 8088 (app) and 6443 (k8s API). Pick a free one for
# each unless the user pinned it. We only RESERVE them (no bind until you start).
if (-not $PortPinned -and (PortBusy $Port)) {
  $new = FreePort ($Port + 1)
  Warn "Port $Port (app) is already in use on this machine — using $new instead."
  $Port = $new; $Url = "http://localhost:$Port"
}
$env:LAB_PORT = "$Port"

$ApiPinned = [bool]$env:LAB_API_PORT
$ApiPort   = if ($env:LAB_API_PORT) { [int]$env:LAB_API_PORT } else { 6443 }
if (-not $ApiPinned -and (PortBusy $ApiPort)) {
  $na = FreePort ($ApiPort + 1)
  Warn "Port $ApiPort (k8s API) is already in use on this machine — using $na instead."
  $ApiPort = $na
}
$env:LAB_API_PORT = "$ApiPort"

# Persist the resolved image + ports so `docker compose up -d` in this folder
# reuses the SAME ports (Compose auto-loads .env).
@"
# Written by the K8s Lab installer. Compose loads this automatically.
LAB_IMAGE=$($env:LAB_IMAGE)
LAB_PORT=$Port
LAB_API_PORT=$ApiPort
"@ | Set-Content -Path (Join-Path $HomeDir ".env") -Encoding ascii

# Pre-pull the images so the first start is fast and any pull error shows up now,
# not mid-lesson. We do NOT start the stack — you start it yourself.
Say "Pulling images (first boot pulls k3s + the app image)…"
Push-Location $HomeDir
try {
  & $Compose[0] $Compose[1..($Compose.Count-1)] pull
  if ($LASTEXITCODE -ne 0) { Warn "Could not pre-pull every image; the first start will pull what's missing." }
} finally { Pop-Location }
Ok "Images ready (app port $Port, k8s API port $ApiPort)."

Write-Host ""
Write-Host "K8s Lab is installed." -ForegroundColor Green
Write-Host @"

Start it whenever you want:
  cd $HomeDir
  $($Compose -join ' ') up -d           # start in the background
Then open:  $Url   (ready ~30s on first boot)

Manage it:
  $($Compose -join ' ') logs -f app     # watch logs
  $($Compose -join ' ') stop            # stop (keeps progress + cluster)
  $($Compose -join ' ') up -d           # start again
  $($Compose -join ' ') down            # remove containers (keeps progress)
  $($Compose -join ' ') down -v         # remove EVERYTHING (fresh start)

Full guide:  $HomeDir\README.md      Help:  ayenacode1@gmail.com
"@
