# K8s Learn — a hands-on Kubernetes learning platform

A self-hosted, **bilingual (English / French)** platform to learn Kubernetes by doing.
It ships a small web app that serves short courses and **incident-style debugging
exercises**, all running on a local [kind](https://kind.sigs.k8s.io/) cluster you spin
up with a single command.

The app itself runs *inside* the cluster (Deployment + Service + RBAC), so you also learn
by looking at how it is deployed.

```
git clone <this-repo> && cd k8s-platform
make up          # create the kind cluster, build + load the image, deploy the app
# open http://localhost:8088
```

That's it. No external registry, no cloud account — everything is local.

---

## Features

- **8 short courses** — architecture, core objects, imperative `kubectl`, first deployment,
  scale/update/rollback, networking & Services, debugging in production, and a "diagnostic
  reflex" cheat-sheet.
- **10 incident tickets** — each one deploys a deliberately broken setup into its own
  namespace. You diagnose and fix it with `kubectl` only. The broken config is encoded in
  the deploy script, so you can't peek at the answer.
- **Bilingual UI and content** — switch between English and French with one click
  (top-right toggle). Your choice is remembered.
- **Gamified progress** — XP, levels, streaks, and achievements stored in your browser.
- **`k8s-diag.sh`** — a standalone namespace diagnostic script that reports what is broken
  (pods, Services, endpoints, ConfigMaps/Secrets, probes, quotas…) with actionable hints.

---

## Prerequisites

You need these installed and on your `PATH`:

| Tool | Why |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) | builds and runs the cluster nodes + app image |
| [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) | runs Kubernetes inside Docker |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | talks to the cluster |
| `make` | runs the workflow (optional — you can run the commands by hand) |

Check everything at once:

```bash
make check
```

---

## Quick start

```bash
make up
```

This will:

1. Create a kind cluster named `k8s-learn` from `kind-config.yaml`
   (which maps the app's NodePort `30080` to `localhost:8088`).
2. Build the app image (`k8s-platform:local`).
3. Load that image into the cluster (`kind load docker-image`).
4. Apply `k8s-platform.yml` (Namespace, RBAC, Deployment with 3 replicas, Service).
5. Wait for the rollout to finish.

Then open **http://localhost:8088**.

To tear everything down:

```bash
make down        # deletes the kind cluster
```

### Port already in use?

If cluster creation fails with `Bind for 0.0.0.0:8088 failed: port is already allocated`,
another process (often a previous kind cluster) is using the host port. Either free it
(e.g. `kind delete cluster --name kind` if you no longer need that one), or change
`hostPort` in `kind-config.yaml` (and the matching `URL` in the `Makefile`) to a free port.

---

## Make commands

```
make up        Create cluster, build + load image, deploy the platform
make down      Delete the kind cluster
make redeploy  Rebuild the image and restart the deployment
make status    Show the platform resources (kubectl -n courses get all)
make logs      Tail the platform logs
make reset     Clean up all exercise namespaces (exo-*)
make check     Verify Docker / kind / kubectl are installed
make help      List all commands
```

---

## Doing the exercises

Each exercise is a production "incident ticket". The easiest way to run one is from the
web app: open an exercise, click **Launch exercise** (it streams `deploy.sh` into an
in-browser terminal), then diagnose and fix it with `kubectl` in your own terminal.

You can also run them by hand:

```bash
# 1. Read the ticket
cat exercices/ticket-001/mission.en.md     # or mission.fr.md

# 2. Deploy the broken setup
./exercices/ticket-001/deploy.sh

# 3. Diagnose and fix with kubectl (get, describe, logs, events, edit, patch...)
kubectl get all -n exo-001

# 4. Clean up before the next one
./exercices/reset.sh
```

See [`exercices/README.md`](exercices/README.md) for the full list and recommended order.

### The diagnostic helper

`k8s-diag.sh` scans a namespace and reports what is broken, with hints:

```bash
./k8s-diag.sh exo-001
```

---

## Project structure

```
.
├── app/
│   ├── server.js          # Node.js API + static server (bilingual content, SSE for scripts)
│   └── public/            # Vanilla-JS single-page app
│       └── js/i18n.js     # FR/EN strings + language toggle
├── courses/
│   ├── en/                # English courses (*.md)
│   └── fr/                # French courses  (*.md)
├── exercices/
│   ├── ticket-XXX/
│   │   ├── deploy.sh      # deploys the broken setup (config encoded inside)
│   │   ├── mission.en.md  # the incident ticket (English)
│   │   └── mission.fr.md  # the incident ticket (French)
│   └── reset.sh           # deletes every exo-* namespace
├── essentials/            # bash / terminal / vim cheat-sheets (en + fr)
├── kind-config.yaml       # kind cluster: maps NodePort 30080 -> localhost:8088
├── k8s-platform.yml       # Namespace + RBAC + Deployment + Service
├── k8s-diag.sh            # namespace diagnostic tool
├── Dockerfile             # builds the app image (bundles kubectl + content)
└── Makefile               # the workflow
```

---

## How the app is deployed (a learning artifact in itself)

`k8s-platform.yml` is intentionally readable:

- A **Namespace** `courses`.
- A **ServiceAccount** + **ClusterRole** + **ClusterRoleBinding** so the app can run the
  exercise scripts (which use `kubectl`) from inside the cluster.
- A **Deployment** with 3 replicas, plus readiness and liveness probes.
- A **NodePort Service** on `30080`, mapped to `localhost:8088` by the kind config.

Want to see a liveness probe restart a pod? Hit `http://localhost:8088/error` — the server
exits with code 1 and Kubernetes brings it back.

---

## Contributing

Issues and pull requests are welcome — new exercises, course fixes, or translations.
Content lives in plain Markdown under `courses/<lang>/` and `exercices/ticket-XXX/`.

## License

[MIT](LICENSE) © AyenaCode
