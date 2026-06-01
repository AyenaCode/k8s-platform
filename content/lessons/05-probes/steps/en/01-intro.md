## Liveness vs readiness vs startup

"Is the container process running?" is a weak definition of healthy. A process can
be **up but useless** — deadlocked, still warming a cache, or waiting on a DB. The
kubelet can only know what *healthy* means if **you** tell it, with **probes**.

There are three, and they do very different things:

| Probe | What it answers | What happens on failure |
|---|---|---|
| **readiness** | "Can I serve traffic *right now*?" | Pod is removed from its Service endpoints — **no restart** |
| **liveness** | "Am I still alive, or stuck?" | kubelet **kills and restarts** the container |
| **startup** | "Have I finished booting?" | gates the other two until the app has started |

The two you will use most:

- **Readiness** protects your users. A Pod that fails readiness keeps running but
  receives **no traffic** until it recovers. Great for warm-up and temporary
  overload.
- **Liveness** protects your app from itself. A Pod that fails liveness gets
  **restarted**, breaking a deadlock without a human.

Each probe can check in three ways: `httpGet` (an HTTP endpoint), `exec` (run a
command, exit 0 = healthy), or `tcpSocket` (port open).

> **Trap:** pointing a **liveness** probe at something slow or flaky causes endless
> restarts. When unsure, prefer **readiness** — it never restarts, it only steps
> the Pod out of rotation.

Next you will watch readiness gate traffic, then watch liveness restart a stuck
container. →
