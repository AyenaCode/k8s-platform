# Roadmap: scaling to advanced courses & troubleshooting labs

Assessment of whether the current infra/content engine can host advanced Kubernetes
courses and advanced troubleshooting labs, plus the concrete work to unlock everything.
(Grounded in a live probe of the running k3s, May 2026.)

## TL;DR

- **Content engine: no limit.** Add a course or a troubleshooting lab by dropping a
  folder under `content/lessons/NN-xxx/` (manifest + markdown + scripts). Zero code.
- **k3s covers ~90% of advanced topics out of the box.**
- **3 small infra tweaks** unlock the rest. Only multi-node is a (small) real change.

## Status, June 2026: intermediate tier shipped

The full intermediate curriculum is in (lessons 04–11, bilingual, every verify
script tested live against the running k3s). Two of the three unlocks are done:

- ✅ **metrics-server re-enabled** (`docker-compose.yml`) → `kubectl top` + HPA work.
- ✅ **traefik re-enabled** → Ingress works on `localhost:80` (IngressClass `traefik`).
- ⏳ **multi-node** still deferred to a future **advanced** tier (drain/cordon,
  taints/affinity, node-failure). It is the only non-trivial change; not needed
  for anything intermediate.

**Lessons added (all with EN+FR steps and tested setup/verify scripts):**

| # | Lesson | Teaches | Infra |
|---|---|---|---|
| 04 | ConfigMaps & Secrets | env vs file injection, base64≠encryption | - |
| 05 | Health probes | readiness gates traffic, liveness restarts | - |
| 06 | Resources & QoS | requests/limits, QoS classes, **OOMKilled** | - |
| 07 | Jobs & CronJobs | run-to-completion, schedules, manual trigger | - |
| 08 | Storage & StatefulSets | PVC dynamic provisioning, stable per-pod disks | - |
| 09 | Ingress & HTTP routing | host/path routing, real curl through Traefik | traefik |
| 10 | Autoscaling (HPA) | CPU-target scaling, why cpu requests are mandatory | metrics-server |
| 11 | Troubleshooting clinic | diagnose+fix ImagePull / CrashLoop / no-endpoints | - |

## Content engine: already sufficient

- Manifest-driven: `lesson.json` + `steps/{en,fr}/*.md` + optional `scripts/{setup,verify}.sh`.
- Troubleshooting labs map perfectly onto **setup → break / verify → confirm fix**
  (already proven by lesson 03's setup pre-seed). Verify scripts have full kubectl +
  cluster access, so they can check anything (jsonpath, events, `exec` into a pod,
  curl an endpoint, etc.).
- Nothing to build here to add content.

## Capability matrix (probed on the live cluster)

| Topic | State | Note |
|---|---|---|
| PV/PVC, StorageClass, **StatefulSets** | ✅ | `local-path` default StorageClass present |
| RBAC, ServiceAccounts | ✅ | native |
| Probes, CrashLoopBackOff, **OOMKilled** | ✅ | great for troubleshooting |
| ConfigMaps/Secrets, Jobs/CronJobs, DaemonSets | ✅ | |
| **NetworkPolicies** | ✅ | k3s **enforces** them (built-in controller), a real plus |
| PodDisruptionBudgets, PriorityClasses, ResourceQuota, LimitRange | ✅ | |
| CRDs / Operators / Helm | ✅ | `helm` is in the lab terminal |
| Ingress | ✅ | traefik **re-enabled**; reachable on `localhost:80` (lesson 09) |
| **HPA / autoscaling** | ✅ | metrics-server **re-enabled**; `kubectl top` + HPA live (lesson 10) |
| Scheduling: taints/tolerations, affinity, **drain/cordon**, node NotReady | ⚠️ | cluster is **single-node** (advanced tier) |

## The 3 unlocks (do when the first lab needs them)

1. ✅ **HPA / autoscaling**: *done.* Removed `--disable metrics-server` from the `k3s`
   command in `docker-compose.yml`. `kubectl top` and HPA now work.
2. ✅ **Ingress**: *done.* Removed `--disable traefik`. Thanks to
   `network_mode: service:k3s`, the ingress is reachable on `localhost:80`.
3. ⏳ **Multi-node** (taints/affinity/drain/node-failure labs): add one or two **k3s agent**
   containers to `docker-compose.yml` that join the server (k3s is natively multi-node).
   This is the only non-trivial change, and still small. Sketch:
   ```yaml
   k3s-agent:
     image: rancher/k3s:v1.36.1-k3s1
     command: agent
     privileged: true
     tmpfs: [/run, /var/run]
     environment:
       - K3S_URL=https://k3s:6443
       - K3S_TOKEN=${K3S_TOKEN:-labtoken}
     depends_on: { k3s: { condition: service_healthy } }
   ```
   (Decide CPU/RAM headroom; 1 server + 1 agent is enough to teach scheduling.)

> traefik + metrics-server were disabled on purpose for a lean v1 boot. Re-enabling is trivial.

## Conventions for future labs

- **Each lab creates its resources in its own namespace** (in `setup.sh`), not `default`,
  so parallel/sequential labs don't collide. The **Reset** button / `make reset` already
  cleans non-system namespaces.
- Keep `verify.sh` fast and read-only (just inspect state); put any waiting/seeding in
  `setup.sh`. The server caps setup/verify streams at 120s.
- Pin images in lab manifests (e.g. `nginx:1.27`) for reproducibility.

## Residual limitation (minor)

- `local-path` storage is single-node (no multi-node RWX). Distributed-storage labs would
  need an addon (Longhorn / NFS provisioner). Niche; add only if such a lab is planned.

## Suggested next content (when ready)

**Intermediate, shipped** (lessons 04–11): ConfigMaps & Secrets · Probes & health ·
Resource requests/limits & QoS (+OOMKilled) · Jobs/CronJobs · StatefulSets & storage ·
Ingress · HPA · Troubleshooting clinic (ImagePullBackOff · CrashLoopBackOff · Service
has no endpoints).

**Advanced, next:** Namespaces & RBAC (multi-tenant) · NetworkPolicies (k3s enforces
them) · CRDs/Operators/Helm · the multi-node scheduling track (taints/tolerations,
affinity, drain/cordon, node-failure) once unlock #3 lands · more troubleshooting cases
(missing ConfigMap/Secret → CreateContainerConfigError · Pending pods from
resources/taints · failing readiness probe · init container stuck).

> **Deploy note:** content ships **baked into the app image** (`COPY content/` in the
> Dockerfile), so new lessons appear only after `docker compose up --build app`. The
> infra unlocks (metrics-server/traefik) require recreating the `k3s` container, which
> is already done in this repo's running stack.
