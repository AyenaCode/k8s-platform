# K8s Lab — learn Kubernetes by doing

A self-hosted, **bilingual (EN/FR)** interactive lab to learn Kubernetes the way
Killercoda / KodeKloud do: **read a concept, then practise it immediately** in a
**real cluster**, from a terminal that lives right next to the lesson — earning
**XP and badges** as you go.

> **The only thing you need is Docker.** No `kind`, no `kubectl`, no Go, no Node to
> install. One command boots a real (lightweight) Kubernetes cluster, the app, and
> a database.

```bash
git clone <this-repo> && cd k8s-platform
docker compose up --build        # or: make up
# open http://localhost:8088   (k3s takes ~30s on first boot)
```

---

## How it works

Three containers, started by `docker-compose.yml`:

| Service | Role |
|---|---|
| **k3s** | a real, lightweight Kubernetes cluster (in a container) |
| **postgres** | stores your progress / XP |
| **app** | Go backend + React SPA + the interactive terminal |

The **app shares k3s's network namespace** (`network_mode: service:k3s`), so the
in-browser terminal *is* the cluster node: `kubectl`, Pod IPs, ClusterIPs and
`localhost:<nodePort>` all work with **zero config**. The terminal is a complete
learning host — `bash`, `kubectl`, `helm`, `vim`, `jq`, `curl`, `git`.

---

## Doing the lessons

Open **http://localhost:8088** and pick a lesson. Each lesson is a sequence of
**steps**: a concept on the left, the live terminal on the right.

1. Read the concept.
2. Run the suggested commands in the terminal.
3. Hit **Verify** — a script checks your cluster. Pass → **+XP**, a step ✓, and
   maybe a new **badge**. Stuck? Reveal the **Hint**.
4. Finish every task in a lesson → it's marked complete (🎉 confetti).

Track your **level, XP, streak and badges** on the **Dashboard**. Switch the UI and
content language anytime with the **EN/FR** toggle.

**Reset** (button in any lesson, or `make reset`) wipes your scratch cluster state
so you can start a task clean.

### Lessons in v1

1. **Pods & kubectl** — create, inspect, logs, exec.
2. **Deployments & ReplicaSets** — declarative, scale, self-healing, rollout/rollback.
3. **Services & networking** — ClusterIP, NodePort, endpoints, DNS discovery.

More concepts and troubleshooting modules will be added — see *Adding a lesson*.

---

## Make commands

```
make up      Build + start the whole lab
make down    Stop (keeps progress + cluster data)
make clean   Stop and DELETE all volumes (fresh start)
make logs    Tail the app logs
make shell   Shell into the lab container (same as the in-app terminal)
make reset   Wipe the learner's scratch cluster state
```

---

## Adding a lesson (no code change)

The curriculum is **manifest-driven** — drop a directory under `content/lessons/`:

```
content/lessons/04-configmaps/
  lesson.json                 # title, summary, ordered steps, XP (bilingual)
  steps/en/01-intro.md        # step prose (en + fr)
  steps/fr/01-intro.md
  scripts/02-setup.sh         # optional: pre-seed cluster state for a step
  scripts/02-verify.sh        # optional: exit 0 => step solved, awards XP
```

`lesson.json` lists the steps and points each at its markdown and optional
`setup`/`verify` scripts. Rebuild the image (`make up`) and it appears
automatically — ordered by directory name. See `content/lessons/01-pods/` as the
canonical example.

---

## License

[MIT](LICENSE) © AyenaCode
