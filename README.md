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

---

## Prerequisites

| Tool | Why |
|---|---|
| [Docker](https://docs.docker.com/get-docker/) | builds and runs the cluster nodes + app image |
| [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) | runs Kubernetes inside Docker |
| [kubectl](https://kubernetes.io/docs/tasks/tools/) | talks to the cluster |
| `make` | runs the workflow |

Check everything at once: `make check`

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
