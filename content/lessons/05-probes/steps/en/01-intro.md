## Know what "healthy" means before you deploy

"Is the process running?" is a weak definition of healthy. A container can be
**up but useless**: deadlocked, still warming a cache, waiting on a database.
You define what healthy means with **probes**. The kubelet uses them to act.

Two analogies to keep in mind:

- **Readiness** = "Are you ready to take customers?" A new shop that is not set
  up yet should not have customers sent in. No restart, just no traffic.
- **Liveness** = "Are you still alive?" A shop that has frozen and cannot serve
  anyone should be closed and reopened. The kubelet kills and restarts the container.

| Probe | Question it answers | Failure action |
|---|---|---|
| **readiness** | "Can I serve traffic right now?" | Removed from Service endpoints, no restart |
| **liveness** | "Am I still alive, or stuck?" | kubelet kills and restarts the container |
| **startup** | "Have I finished booting?" | Gates readiness and liveness until the app is up |

Each probe checks state in one of three ways: `exec` (run a command; exit 0 = healthy),
`httpGet` (HTTP endpoint; 2xx-3xx = healthy), or `tcpSocket` (port open = healthy).

Explore the full field list yourself:

```bash
kubectl explain pod.spec.containers.readinessProbe --recursive
kubectl explain pod.spec.containers.livenessProbe --recursive
```

> [!WARNING]
> Pointing a **liveness** probe at something slow or flaky causes endless restarts.
> When in doubt, prefer **readiness**: it never restarts, it only steps the Pod
> out of rotation.

📖 Docs: [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

Next, you will make readiness gate traffic, then watch liveness restart a stuck container.

**Continue →**
