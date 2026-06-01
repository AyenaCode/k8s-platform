# Roadmap — scaling to advanced courses & troubleshooting labs

Assessment of whether the current infra/content engine can host advanced Kubernetes
courses and advanced troubleshooting labs, plus the concrete work to unlock everything.
(Grounded in a live probe of the running k3s — May 2026.)

## TL;DR

- **Content engine: no limit.** Add a course or a troubleshooting lab by dropping a
  folder under `content/lessons/NN-xxx/` (manifest + markdown + scripts). Zero code.
- **k3s covers ~90% of advanced topics out of the box.**
- **3 small infra tweaks** unlock the rest. Only multi-node is a (small) real change.

## Content engine — already sufficient

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
| **NetworkPolicies** | ✅ | k3s **enforces** them (built-in controller) — a real plus |
| PodDisruptionBudgets, PriorityClasses, ResourceQuota, LimitRange | ✅ | |
| CRDs / Operators / Helm | ✅ | `helm` is in the lab terminal |
| Ingress | ⚠️ | API present, but traefik is **disabled** (`--disable traefik`) |
| **HPA / autoscaling** | ⚠️ | metrics-server **disabled** → no `metrics.k8s.io` |
| Scheduling: taints/tolerations, affinity, **drain/cordon**, node NotReady | ⚠️ | cluster is **single-node** |

## The 3 unlocks (do when the first lab needs them)

1. **HPA / autoscaling** — remove `--disable metrics-server` from the `k3s` command in
   `docker-compose.yml`. (1 line.)
2. **Ingress** — remove `--disable traefik` (or install ingress-nginx). Thanks to
   `network_mode: service:k3s`, the ingress is reachable on `localhost`. (1 line.)
3. **Multi-node** (taints/affinity/drain/node-failure labs) — add one or two **k3s agent**
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

Fundamentals beyond v1: ConfigMaps & Secrets · Namespaces & RBAC · Probes & health ·
Resource requests/limits & QoS · Jobs/CronJobs · StatefulSets & storage · Ingress · HPA.
Troubleshooting track: ImagePullBackOff · CrashLoopBackOff · OOMKilled · Service has no
endpoints (selector mismatch) · failing readiness probe · missing ConfigMap/Secret ·
Pending pods (resources/taints) · Init container stuck.
