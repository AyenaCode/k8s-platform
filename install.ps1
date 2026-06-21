# K8s Lab one-line installer (Windows, PowerShell).
#
#   irm https://raw.githubusercontent.com/AyenaCode/k8s-platform/main/install.ps1 | iex
#
# What it does: checks Docker Desktop, downloads the release compose file + its two
# helper files into %USERPROFILE%\.k8s-lab, starts the stack with the PREBUILT
# image (no local build), waits for the app, opens your browser and prints the URL.
#
# The ONLY requirement is Docker Desktop (with the WSL 2 backend enabled).
#
# Knobs (env vars before running, e.g.  $env:LAB_REF="v1.0.0"):
#   LAB_REF      git ref to pull files from   (default: main)
#   LAB_IMAGE    app image to run             (default: ghcr.io/ayenacode/k8s-platform:latest)
#   LAB_HOME     install directory            (default: %USERPROFILE%\.k8s-lab)
#   LAB_NO_OPEN  set to 1 to not open the browser

$ErrorActionPreference = "Stop"

$Repo    = "AyenaCode/k8s-platform"
$Ref     = if ($env:LAB_REF)  { $env:LAB_REF }  else { "main" }
$Raw     = "https://raw.githubusercontent.com/$Repo/$Ref"
$HomeDir = if ($env:LAB_HOME) { $env:LAB_HOME } else { Join-Path $env:USERPROFILE ".k8s-lab" }
$Url     = "http://localhost:8088"

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
Ok "Lab files downloaded."

# ── 3) Start the stack ───────────────────────────────────────────────────────
if (-not $env:LAB_IMAGE) { $env:LAB_IMAGE = "ghcr.io/ayenacode/k8s-platform:latest" }
Say "Pulling images and starting the lab (first boot pulls k3s + the app image)…"
Push-Location $HomeDir
try {
  & $Compose[0] $Compose[1..($Compose.Count-1)] pull --quiet *> $null
  & $Compose[0] $Compose[1..($Compose.Count-1)] up -d
  if ($LASTEXITCODE -ne 0) { Die "Failed to start the stack. See: cd $HomeDir ; $($Compose -join ' ') logs" }
} finally { Pop-Location }

# ── 4) Wait for the app (k3s needs ~30s on a cold start) ─────────────────────
Say "Waiting for the cluster + app to come up (up to ~3 min on first run)…"
$up = $false
for ($i = 0; $i -lt 90; $i++) {
  try { Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 3 *> $null; $up = $true; break }
  catch { Start-Sleep -Seconds 2 }
}
if ($up) { Ok "The lab is up." }
else     { Warn "The app did not answer on $Url yet. Check: cd $HomeDir ; $($Compose -join ' ') logs -f app" }

# ── 5) Open the browser + print the link ─────────────────────────────────────
if ($env:LAB_NO_OPEN -ne "1") { Start-Process $Url }

Write-Host ""
Write-Host "K8s Lab is ready.  Open:  $Url" -ForegroundColor Green
Write-Host @"

Manage it:
  cd $HomeDir
  $($Compose -join ' ') logs -f app     # watch logs
  $($Compose -join ' ') stop            # stop (keeps progress + cluster)
  $($Compose -join ' ') up -d           # start again
  $($Compose -join ' ') down -v         # remove everything (fresh start)
"@
