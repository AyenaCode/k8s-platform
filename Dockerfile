# syntax=docker/dockerfile:1
#
# Multi-stage build for the 3-tier app. Produces a single image: the Go backend
# serves the built React SPA on :8080 (one origin, no CORS) and spawns the
# in-pod interactive terminal (bash + kubectl, driven by the ServiceAccount).

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
# Pure-Go build (creack/pty, coder/websocket, pgx are all CGO-free) -> static binary.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# ── 3) kubectl binary (no runtime download) ──────────────────────────────────
FROM bitnami/kubectl:latest AS kubectl

# ── 4) Runtime ───────────────────────────────────────────────────────────────
FROM alpine:3.20
WORKDIR /app

# bash: the PTY terminal + exercise scripts use #!/bin/bash. ca-certificates: TLS.
RUN apk add --no-cache bash ca-certificates

COPY --from=kubectl  /opt/bitnami/kubectl/bin/kubectl /usr/local/bin/kubectl
COPY --from=backend  /out/server                      /app/server
COPY --from=frontend /fe/dist                         /app/dist

# Content tier (markdown + exercise scripts) ships in the image.
COPY courses/    /app/courses/
COPY exercices/  /app/exercices/

ENV ADDR=:8080 \
    CONTENT_ROOT=/app \
    STATIC_DIR=/app/dist \
    PTY_SHELL=/bin/bash
# DATABASE_URL is unset -> in-memory progress store. Set it to enable Postgres.

EXPOSE 8080
CMD ["/app/server"]
