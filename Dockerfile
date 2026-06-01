# syntax=docker/dockerfile:1
#
# The lab "app" image: the Go backend serves the built React SPA on :8080 and
# spawns the interactive PTY terminal. The terminal is a COMPLETE host for
# learning Kubernetes — bash, kubectl, helm, vim, jq, curl, git — and (via
# `network_mode: service:k3s` in docker-compose) talks to the local k3s cluster
# with zero config. Build Go + React happen here, so a learner needs only Docker.

# ── 1) Build the frontend (Tier 1) ───────────────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build                       # -> /fe/dist

# ── 2) Build the backend (Tier 2) ────────────────────────────────────────────
FROM golang:1.26-alpine AS backend
WORKDIR /src
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
# Pure-Go build (creack/pty, coder/websocket, pgx are CGO-free) -> static binary.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# ── 3) kubectl binary (no runtime download) ──────────────────────────────────
FROM bitnami/kubectl:latest AS kubectl

# ── 4) Runtime — the learner's lab host ───────────────────────────────────────
FROM alpine:3.20
WORKDIR /app

# bash: PTY terminal + scripts use #!/bin/bash. The rest is the learner's toolkit
# (vim/jq/curl/git/helm). Retry once to ride out flaky mirror fetches.
RUN apk update \
 && (apk add --no-cache bash ca-certificates curl vim jq git helm \
     || (sleep 3 && apk update && apk add --no-cache bash ca-certificates curl vim jq git helm))

COPY --from=kubectl  /opt/bitnami/kubectl/bin/kubectl /usr/local/bin/kubectl
COPY --from=backend  /out/server                      /app/server
COPY --from=frontend /fe/dist                         /app/dist

# Content tier (lesson manifests, markdown, scripts) ships in the image.
COPY content/ /app/content/
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh /app/content/reset.sh \
 && find /app/content -name '*.sh' -exec chmod +x {} + \
 # A friendly shell prompt + kubectl alias for the lab terminal.
 && printf 'alias k=kubectl\nexport PS1="\\[\\e[36m\\]lab\\[\\e[0m\\]:\\w$ "\n' > /root/.bashrc

ENV ADDR=:8080 \
    CONTENT_ROOT=/app \
    LESSONS_DIR=/app/content/lessons \
    STATIC_DIR=/app/dist \
    WORK_DIR=/root \
    PTY_SHELL=/bin/bash \
    KUBECONFIG=/kubeconfig/k3s.yaml
# DATABASE_URL is provided by docker-compose (Postgres data tier).

EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
