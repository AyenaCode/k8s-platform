## Know what "healthy" means before you deploy

"Is the process running?" is a weak definition of healthy. A container can be
**up but useless**: deadlocked, still warming a cache, waiting on a DB. The
kubelet only knows what *healthy* means if **you** define it with **probes**.

There are three, and they do very different things:

| Probe | What it answers | Failure action |
|---|---|---|
| **readiness** | "Can I serve traffic *right now*?" | Removed from Service endpoints, **no restart** |
| **liveness** | "Am I still alive, or stuck?" | kubelet **kills and restarts** the container |
| **startup** | "Have I finished booting?" | Gates readiness + liveness until app is up |

The two you will use in nearly every deployment:

- **Readiness** protects your users. A failing Pod keeps running but receives
  **no traffic** until it recovers, ideal for warm-up and temporary overload.
- **Liveness** protects your app from itself. A failing Pod is **restarted**,
  breaking deadlocks without a human.

Each probe checks in one of three ways: `exec` (run a command; exit 0 = healthy),
`httpGet` (HTTP endpoint; 2xx–3xx = healthy), or `tcpSocket` (port open = healthy).

> [!WARNING]
> Pointing a **liveness** probe at something slow or flaky causes endless restarts.
> When in doubt, prefer **readiness**: it never restarts, it only steps the Pod
> out of rotation.

Next, watch readiness gate traffic, then watch liveness restart a stuck container.

**Continue →**
