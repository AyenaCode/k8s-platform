# K8s Learn — a hands-on Kubernetes learning platform

A self-hosted, **bilingual (English / French)** web app to learn Kubernetes by doing:
short courses plus **incident-style debugging exercises**, all running on a local
[kind](https://kind.sigs.k8s.io/) cluster you spin up with a single command.

```
git clone <this-repo> && cd k8s-platform
make up          # create the kind cluster, build + load the image, deploy the app
# open http://localhost:8088
```

No external registry, no cloud account — everything is local.

> **3-tier architecture.** The platform is a scalable, strongly typed **3-tier**
> stack: a **Go 1.26** backend (`backend/`), a **React 19 + TanStack +
> TypeScript 6** SPA (`frontend/`), and a **Postgres** data tier. It uses a
> single **full-access lab terminal** (kubectl, vim, `kubectl edit` —
> Killercoda-style) over a WebSocket-driven PTY. The legacy vanilla-JS app has
> been removed; some pages (courses, i18n, gamification) are still being ported.
> See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full design and run guide.

---

## Prerequisites

| Tool | Why |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) | builds and runs the cluster nodes + app image |
| [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) | runs Kubernetes inside Docker |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | talks to the cluster |
| `make` | runs the workflow |
| [Go](https://go.dev/dl/) ≥ 1.26 | builds the new backend (Tier 2) |
| [Node](https://nodejs.org/) ≥ 20 + npm | builds the new frontend (Tier 1) |

Check the cluster tooling at once: `make check`

---

## Make commands

```
make up        Create cluster, build + load image, deploy the platform
make down      Delete the kind cluster
make redeploy  Rebuild the image and restart the deployment
make status    Show the platform resources
make logs      Tail the platform logs
make reset     Clean up all exercise namespaces (exo-*)
make check     Verify Docker / kind / kubectl are installed
```

---

## Running the new 3-tier stack

The kind cluster above is the substrate the exercises run against. The new app
that talks to it lives in `backend/` (Go) and `frontend/` (React).

**Dev — two processes, hot reload:**

```bash
cd backend  && go run ./cmd/server          # :8080  (in-memory store, no DB needed)
cd frontend && npm install && npm run dev    # :5173  (proxies /api and /ws to :8080)
```

**Prod — one Go binary serves the built SPA:**

```bash
cd frontend && npm run build                          # -> frontend/dist
cd backend  && STATIC_DIR=../frontend/dist go run ./cmd/server
# open http://localhost:8080  (single origin, no CORS)
```

**Optional Postgres data tier** (progress / XP): `cd backend && docker compose up -d`,
then set `DATABASE_URL` and run the migrations — see
[ARCHITECTURE.md](ARCHITECTURE.md#with-the-postgres-data-tier).

> The new terminal is an unauthenticated interactive shell — **local use only**
> until auth lands. See the Security section of [ARCHITECTURE.md](ARCHITECTURE.md#security--read-before-exposing-this).

---

## Doing the exercises

Each exercise is a production "incident ticket", and you run them entirely from the
web app at **http://localhost:8088**:

1. Open **Exercises** and pick an incident ticket.
2. Click **Launch exercise** — it deploys the deliberately broken setup into its own
   namespace and streams the output into an in-browser terminal.
3. Read the ticket, then diagnose and fix it with `kubectl`.
4. Click **Reset** when you're done to clean up before the next one.

The standalone `k8s-diag.sh` scans a namespace and reports what is broken, with hints:

```bash
./k8s-diag.sh exo-001
```

---

## License

[MIT](LICENSE) © AyenaCode
