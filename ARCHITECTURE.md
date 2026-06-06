# K8s Lab: Architecture

An interactive, self-hosted Kubernetes learning lab. The design goal: **a learner
clones the repo, runs `docker compose up`, and learns + practises against a real
cluster, with Docker as the only dependency.**

## The stack (`docker-compose.yml`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ k3s         rancher/k3s (privileged)                                   │
│   A real, lightweight single-node Kubernetes cluster in a container.   │
│   Writes its kubeconfig to a shared volume. Publishes the app's :8080  │
│   on the host (because the app shares this container's network).       │
└───────────────▲──────────────────────────────────────────────────────┘
                │ network_mode: service:k3s   (shared network namespace)
┌───────────────┴──────────────────────────────────────────────────────┐
│ app         Go 1.26 + React 19 SPA + interactive PTY terminal          │
│   - Serves the SPA and the REST/SSE API on :8080 (one origin, no CORS) │
│   - The PTY terminal is a full host: bash, kubectl, helm, vim, jq,     │
│     curl, git, and KUBECONFIG points at k3s, so kubectl just works.    │
│   - Because it shares k3s's netns, the terminal IS the node:           │
│     localhost:<nodePort>, Pod IPs and ClusterIPs are all reachable.    │
└───────────────┬──────────────────────────────────────────────────────┘
                │ pgx
┌───────────────▼──────────────────────────────────────────────────────┐
│ postgres    progress / XP / streak (data tier)                         │
│   Schema is applied in-process on startup (idempotent DDL), no         │
│   separate migration binary in the image.                              │
└────────────────────────────────────────────────────────────────────────┘
```

Why `network_mode: service:k3s` (not a separate network + kubeconfig rewrite):
it gives the terminal **node-level network fidelity**: the canonical "expose a
Service, then `curl localhost:<nodePort>`" works for real, and the kubeconfig's
`127.0.0.1:6443` is valid as-is, so there's nothing to rewrite.

## Backend (Go): `backend/`

| Package | Role |
|---|---|
| `internal/content` | **Manifest-driven** lesson loader: reads `content/lessons/*/lesson.json` + step markdown + script paths. Adding a lesson is purely additive. |
| `internal/httpapi` | REST (lessons), SSE (step `setup`/`verify`, `reset`), progress summary. |
| `internal/exec` | Streams a `bash` script over SSE; `StreamScriptResult` reports the exit code so a passed `verify` can award XP. |
| `internal/terminal` | The PTY-over-WebSocket shell (inherits `KUBECONFIG`). |
| `internal/progress` | Data tier: `Store` interface (in-memory + Postgres), `Level`, `Badges`, `Streak`. String-keyed records namespaced `step:<lesson>/<id>` and `lesson:<slug>`. |

### API surface

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/lessons?lang=` | catalog |
| GET | `/api/lessons/{slug}?lang=` | lesson + ordered steps (localized) |
| POST | `/api/lessons/{slug}/steps/{id}/setup` | SSE; optional pre-seed |
| POST | `/api/lessons/{slug}/steps/{id}/verify` | SSE; on exit 0 → award step XP, maybe complete the lesson |
| POST | `/api/reset` | SSE; wipe scratch cluster state |
| GET | `/api/progress/summary` | records + XP + level + streak + badges |
| WS | `/ws/terminal` | interactive PTY |

**Lesson completion rule:** a lesson is complete once every step that has a
`verify` script is solved (concept-only steps don't block).

## Frontend (React): `frontend/`

Vite 8 · React 19 · TanStack Router/Query · TypeScript 6. Key pieces:

- **`LabLayout`**: a pathless route (`_lab`) that keeps **one persistent terminal**
  mounted while lesson content swaps in its `<Outlet/>`, so the shell session
  survives navigation.
- **`features/lessons/LessonPage`**, the core: stepped concept prose
  (`MarkdownView` + `react-shiki`), **Prepare task** / **Verify** / **Hint**
  buttons (SSE), auto-advance, and per-step ✓.
- **`features/gamification`**: `XpBar`, `LevelChip`, `BadgeGrid`, `RewardToast`,
  `Confetti`; the dashboard shows XP, streak and per-lesson mastery.
- **`core/i18n`**: global EN/FR toggle (persisted), wired through every content query.

## Content tier: `content/`

`content/lessons/<NN-slug>/`: `lesson.json` manifest + `steps/{en,fr}/*.md` +
optional `scripts/*.sh`. `content/reset.sh` cleans the cluster. This is the only
place you touch to add curriculum.

## Security: read before exposing this

`/ws/terminal` is an **unauthenticated interactive shell** with cluster-admin on
the lab's k3s (remote code execution by design); `OriginPatterns` is empty
(same-origin only). The terminal lives in the `app` container, not in k3s, so a
learner breaking the cluster doesn't kill the app, but this is still a
**single-user, local-only** design. Before exposing it to more than one trusted
user on localhost you must add: authentication, one isolated cluster + PTY per
session, and an origin allow-list.

## Status

- [x] Docker-only stack (k3s + app + postgres), validated end-to-end (boot, node
      Ready, NodePort `curl localhost`, verify → XP → badge).
- [x] Manifest-driven lessons; 3 fundamentals authored (Pods, Deployments, Services).
- [x] Gamification: XP, levels, streak, badges, confetti; EN/FR.
- [ ] More lessons + troubleshooting modules.
- [ ] Auth + per-session isolation (required before multi-user).
