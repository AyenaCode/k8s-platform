# K8s Platform — 3-Tier Architecture

A migration of the original vanilla-JS + Node HTTP app to a scalable, strongly
typed 3-tier architecture. The legacy app has been removed; some pages (courses,
i18n, gamification) are still being ported to the new frontend.

## Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│ Tier 1 — Presentation   frontend/                                 │
│   Vite 8 · React 19 · TanStack Router · TanStack Query · TS 6     │
│   Pure SPA. No Node server at runtime. Talks to the Go API over   │
│   HTTP (REST), SSE (streamed output), and WebSocket (PTY).        │
└───────────────┬───────────────────────────────────────────────────┘
                │  /api (REST + SSE)   /ws/terminal (WebSocket)
┌───────────────▼───────────────────────────────────────────────────┐
│ Tier 2 — Application    backend/  (Go 1.26)                        │
│   chi router · coder/websocket · creack/pty · stdlib SSE          │
│   - REST: courses, exercises                                       │
│   - SSE: deploy / reset / check / run (safe command box)           │
│   - WebSocket: real interactive PTY (vim, kubectl edit)            │
│   - Serves the built SPA → single origin, no CORS                  │
└───────────────┬───────────────────────────────────────────────────┘
                │  pgx
┌───────────────▼───────────────────────────────────────────────────┐
│ Tier 3 — Data           backend/internal/progress + db/            │
│   Postgres (pgx + sqlc-ready + golang-migrate) for progress / XP.  │
│   Repository interface → in-memory store runs with zero setup.     │
│   Content (markdown, scripts) stays as files in the content tier.  │
└───────────────────────────────────────────────────────────────────┘
```

## One full-access terminal (Killercoda-style)

A single interactive terminal — a real PTY shell over a WebSocket
(`/ws/terminal`) — does everything: `kubectl`, `vim`, editing, piping, anything.
No restrictions, no anti-cheat. This mirrors hands-on labs like Killercoda.

The deploy / reset / check buttons are separate (they stream a fixed script over
SSE), but there is no restricted "command box".

## Running it

### Dev (two processes, hot reload)
```bash
# Tier 2 + 3
cd backend && go run ./cmd/server          # :8080  (in-memory store)

# Tier 1 (Vite proxies /api and /ws to :8080)
cd frontend && npm install && npm run dev   # :5173
```

### Prod (single Go binary serves everything)
```bash
cd frontend && npm run build                # -> frontend/dist
cd backend && STATIC_DIR=../frontend/dist go run ./cmd/server
# open http://localhost:8080
```

### With the Postgres data tier
```bash
cd backend
docker compose up -d
export DATABASE_URL=postgres://k8s:k8s@localhost:5432/k8s_platform?sslmode=disable
migrate -path internal/db/migrations -database "$DATABASE_URL" up
go run ./cmd/server
```

## API surface

| Method | Path | Tier | Notes |
|--------|------|------|-------|
| GET | `/api/courses?lang=` | content | course catalog |
| GET | `/api/courses/{slug}?lang=` | content | course markdown |
| GET | `/api/exercises?lang=` | content | exercise catalog |
| GET | `/api/exercises/{id}?lang=` | content | exercise + mission markdown |
| POST | `/api/deploy/{id}` | exec (SSE) | run the incident |
| POST | `/api/reset` | exec (SSE) | reset the cluster |
| POST | `/api/check/{id}` | exec (SSE) | verify solved |
| GET/POST | `/api/progress` , `/api/progress/{id}/solve` | data | progress / XP |
| WS | `/ws/terminal` | terminal | interactive PTY |

## Verified stack (researched May 2026)

Go 1.26.3 · chi v5.3.0 · coder/websocket v1.8.14 · creack/pty v1.1.24 ·
pgx v5.9.2 — React 19 · TanStack Router 1.170 · TanStack Query 5.100 ·
Vite 8 · TypeScript 6 · @xterm/xterm 6.0.

## Security — read before exposing this

`/ws/terminal` is an **unauthenticated interactive shell** (remote code
execution by design) and `OriginPatterns` is empty (same-origin only). The safe
command box also shares one process-wide working directory, and the PTY runs in
one shared `cwd`. This matches the legacy app's "local, single-user, never
expose it" stance and is fine for local use.

For the stated multi-user / "scalable to grow" goal this is **not optional
polish** — it is the work that makes it scalable: authentication, one isolated
PTY + working directory per session, and origin allow-listing must land before
this is reachable by more than one trusted user on localhost.

## Status / next steps

- [x] Tier 2 backend: content endpoints, deploy/reset/check SSE, full-access PTY WebSocket — built & verified end-to-end (curl + Node WS client: real shell exec)
- [x] Tier 3 data: repository interface + in-memory + Postgres impl + migration
- [x] Tier 1: build tooling, routing, exercises feature, both terminals — **builds clean; UI not yet exercised in a browser**
- [ ] Drive the UI in a browser to confirm xterm/SSE rendering at runtime
- [ ] Port courses pages + markdown rendering
- [ ] Port i18n (EN/FR) and gamification UI to consume `/api/progress`
- [ ] **Auth + per-session PTY/cwd isolation + origin allow-list** (required for multi-user scale; see Security)
- [x] Retire the legacy `app/` (done)
```
