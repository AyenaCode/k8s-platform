#!/busybox/sh
# Warm the pull-through cache (registry-cache) with the lab images at
# `docker compose up`, so a learner's very first pod pull is served locally
# instead of blocking on a flaky Docker Hub lookup mid-lesson. This front-loads
# the one network dependency to setup time (where `compose up` already needs the
# network anyway) instead of leaving it in the middle of a lesson.
#
# Runs inside the crane:debug image (busybox shell at /busybox/sh + crane at
# /ko-app/crane). It is:
#   - idempotent: a per-image marker in the warm-state volume means only the
#     first `up` downloads; later ups skip instantly (a full re-validate streams
#     every layer and takes ~minutes, so we must NOT do it on every boot).
#   - tolerant: if upstream is unreachable, it logs and moves on — the image
#     still caches lazily on the first real pod pull.
#   - non-blocking: nothing in the stack waits on it; learners can start at once.
#
# Override the list with LAB_IMAGES (space-separated, docker.io paths, e.g.
# "library/nginx:1.27 library/redis:7"). A missing image here is harmless: it
# just isn't pre-warmed and falls back to the on-demand cache.
set -u

: "${LAB_IMAGES:=library/nginx:1.27 library/nginx:1.26 library/busybox:1.36}"
CRANE=/ko-app/crane
CACHE=registry-cache:5000

for img in $LAB_IMAGES; do
  marker="/state/$(echo "$img" | tr '/:' '__')"
  if [ -f "$marker" ]; then
    echo "warm-cache: already warmed $img"
    continue
  fi
  echo "warm-cache: warming $img ..."
  # validate --remote streams every layer through the cache, which populates it.
  if "$CRANE" validate --remote "$CACHE/$img" --insecure >/dev/null 2>&1; then
    : > "$marker"
    echo "warm-cache: warmed $img"
  else
    echo "warm-cache: upstream unreachable for $img — will cache on first pod pull"
  fi
done
echo "warm-cache: done"
