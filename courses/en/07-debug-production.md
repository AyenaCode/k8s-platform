# 07 — Debug in production: what breaks and how to fix it

> **Objective**: Identify common problems, know where to look, and fix things fast. This chapter is your survival guide in prod.

---

## Universal debug method

When something is not working, always follow this order:

```
1. kubectl get pods -o wide            → what is the STATUS?
2. kubectl describe pod <name>         → look at "Events:" at the bottom
3. kubectl logs <name>                 → what is the app saying?
4. kubectl get events --sort-by='.lastTimestamp'  → what happened?
```

**The Events in `describe` are your gold mine.** They tell you exactly what happened in chronological order.

---

## Pod statuses — what they mean

| Status | Meaning | Severity |
|---|---|---|
| **Running** | The pod is running normally | OK |
| **Pending** | The pod is waiting to be scheduled on a node | Blocking |
| **ContainerCreating** | The image is being pulled | Normal (temporary) |
| **CrashLoopBackOff** | The container keeps crashing, K8s waits before restarting | Critical |
| **Error** | The container exited with an error | Critical |
| **ImagePullBackOff** | Unable to download the image | Blocking |
| **ErrImagePull** | Image pull failed | Blocking |
| **OOMKilled** | The container exceeded its memory limit | Critical |
| **Evicted** | The node evicted the pod (lack of resources) | Investigate |
| **Terminating** | The pod is being deleted | Normal |
| **Unknown** | The node is not responding | Critical |

---

## Problem 1: Pod in CrashLoopBackOff

**Symptom**: The pod starts, crashes, K8s restarts it, it crashes again — in a loop.

```bash
# 1. View the crash logs
kubectl logs <pod>

# 2. If the pod crashes too fast to read the logs, view the previous crash
kubectl logs <pod> --previous

# 3. Common causes
```

| Cause | How to check |
|---|---|
| App crashes on startup | `kubectl logs <pod>` → error in the code |
| Missing environment variable | `kubectl logs <pod>` → "env var X not set" |
| Missing config file | `kubectl describe pod <pod>` → ConfigMap/Secret mount |
| Port already in use | `kubectl logs <pod>` → "address already in use" |
| Incorrect start command | `kubectl describe pod <pod>` → "Command:" |
| Liveness probe too aggressive | The app doesn't have time to start → K8s kills it |

**Action**:
```bash
# View the last crash
kubectl logs <pod> --previous

# If the image starts but crashes immediately, enter the pod
# with a command that doesn't crash
kubectl run debug --image=<meme-image> --rm -it --restart=Never -- sh
```

---

## Problem 2: Pod in Pending

**Symptom**: The pod stays in Pending indefinitely.

```bash
kubectl describe pod <pod>
# Look at Events: at the bottom
```

| Cause (in Events) | Solution |
|---|---|
| `Insufficient cpu` / `Insufficient memory` | Nodes don't have enough resources. Scale the nodes or reduce requests. |
| `0/3 nodes are available` | All nodes are saturated or have taints. |
| `no nodes match pod topology spread constraints` | Affinity/anti-affinity constraint not satisfied. |
| `persistentvolumeclaim "X" not found` | The requested PVC does not exist. Create it. |
| `node(s) had taint` | The node has a taint the pod does not tolerate. |

**Actions**:
```bash
# View available resources on nodes
kubectl describe nodes | grep -A5 "Allocated resources"

# View taints on nodes
kubectl describe nodes | grep Taints
```

---

## Problem 3: ImagePullBackOff / ErrImagePull

**Symptom**: K8s cannot download the Docker image.

```bash
kubectl describe pod <pod>
# Events:
#   Failed to pull image "user/mon-app:v99": ... not found
```

| Cause | Solution |
|---|---|
| Incorrect image name | Check the exact spelling, the tag exists |
| Non-existent tag | `docker pull user/mon-app:v99` locally to verify |
| Private registry without authentication | Create an imagePullSecret |
| Unreachable registry | Check network connectivity on the node |

**Action for a private registry**:
```bash
# Create the authentication secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass

# Add it to the Deployment
# spec.template.spec.imagePullSecrets:
# - name: regcred
```

---

## Problem 4: OOMKilled

**Symptom**: The pod is killed because it consumes too much memory.

```bash
kubectl describe pod <pod>
# Last State: Terminated
#   Reason: OOMKilled
#   Exit Code: 137
```

**Actions**:
```bash
# View the current memory limit
kubectl describe pod <pod> | grep -A2 "Limits:"

# View the actual consumption
kubectl top pod <pod>
```

| Solution |
|---|
| Increase the memory limit in the Deployment |
| Look for a memory leak in the application |
| Add the `--max-old-space-size` flag for Node.js |

---

## Problem 5: Service unreachable

**Symptom**: `curl http://mon-service:80` does not respond or times out.

```bash
# 1. Does the Service exist?
kubectl get svc mon-service

# 2. Are the EndpointSlices populated?
kubectl get endpointslices -l kubernetes.io/service-name=mon-service
# If empty → the selector does not match any pod

# 3. Check the Service selector
kubectl describe svc mon-service
# Selector: app=mon-app

# 4. Check the pod labels
kubectl get pods --show-labels
# Do the labels match the selector?
```

**Most common cause**: The Service selector does not match the pod labels. This often happens when:
- You renamed the labels in the Deployment without updating the Service
- You created the Service manually with the wrong selector

**Test from inside the cluster**:
```bash
# Launch a debug pod
kubectl run debug --image=busybox --rm -it --restart=Never -- sh

# From the debug pod:
wget -qO- http://mon-service:80
nslookup mon-service
```

---

## Problem 6: Node NotReady

**Symptom**: A node switches to NotReady status.

```bash
kubectl get nodes
# NAME       STATUS     ROLES    AGE   VERSION
# worker-1   Ready      <none>   10d   v1.29
# worker-2   NotReady   <none>   10d   v1.29

kubectl describe node worker-2
# Conditions:
#   Ready   False   KubeletNotReady   ...
```

| Cause | Action |
|---|---|
| kubelet crashed | SSH onto the node, `systemctl status kubelet`, check the logs |
| Node saturated (CPU/RAM at 100%) | `kubectl top node`, identify resource-hungry pods |
| Disk full | SSH, `df -h`, clean up |
| Network cut | Check connectivity between the node and the Control Plane |

**Impact**: Pods on a NotReady node are not immediately deleted. K8s waits ~5 minutes (pod-eviction-timeout) before rescheduling them elsewhere. During this time, those pods are unreachable.

---

## Problem 7: Stuck rollout

**Symptom**: `kubectl rollout status` stays stuck, new pods never become Ready.

```bash
# See where it is stuck
kubectl rollout status deployment/mon-app
# Waiting for deployment "mon-app" rollout to finish: 1 out of 3 new replicas have been updated...

# Check the pods in the new ReplicaSet
kubectl get pods
# Are the new pods in CrashLoopBackOff? ImagePullBackOff?
```

**Immediate action**:
```bash
# Rollback!
kubectl rollout undo deployment/mon-app

# Then diagnose the problem on the new pods
kubectl logs <pod-qui-crash> --previous
```

---

## Problem 8: Evicted Pods

**Symptom**: Pods are Evicted on a node.

```bash
kubectl get pods | grep Evicted
```

**Cause**: The node is low on resources (disk, memory). The kubelet evicts pods to protect the node.

**Actions**:
```bash
# Clean up Evicted pods (they do not delete themselves)
kubectl delete pods --field-selector=status.phase=Failed

# Check node resources
kubectl describe node <node> | grep -A5 "Conditions:"
```

---

## Production reflexes

### Before intervening

```bash
# Always know where you are
kubectl config current-context       # which cluster?
kubectl config get-contexts          # list contexts

# Never perform destructive operations without checking the context
# A "kubectl delete" on the wrong cluster = disaster
```

### First-response commands

```bash
# Quick overview
kubectl get pods -A | grep -v Running    # everything that is not Running
kubectl get nodes                        # are all nodes Ready?
kubectl get events --sort-by='.lastTimestamp' | tail -20  # recent events

# If a service is down
kubectl get endpointslices -l kubernetes.io/service-name=<service>  # does the service see any pods?
kubectl describe svc <service>           # correct selector?
kubectl get pods -l app=<label>          # do the target pods exist?
```

### The logs that matter

```bash
# App logs
kubectl logs <pod> -f                    # real-time
kubectl logs <pod> --previous            # the previous crash
kubectl logs <pod> --since=5m            # the last 5 minutes
kubectl logs <pod> -c <conteneur>        # specific container

# If you have multiple pods, view all their logs at once
kubectl logs -l app=mon-app --all-containers
```

---

## Decision tree: my app is not working

```
The app is not responding
  │
  ├─ Are the pods running?
  │   ├─ No → kubectl describe pod (see Events)
  │   │   ├─ Pending → insufficient resources / taints
  │   │   ├─ CrashLoopBackOff → kubectl logs --previous
  │   │   ├─ ImagePullBackOff → image name / registry / auth
  │   │   └─ OOMKilled → increase memory limits
  │   │
  │   └─ Yes, Running
  │       │
  │       ├─ Does the app respond inside the pod?
  │       │   kubectl exec <pod> -- curl localhost:<port>
  │       │   ├─ No → application issue (logs)
  │       │   └─ Yes → network issue
  │       │
  │       └─ Is the Service routing correctly?
  │           kubectl get endpointslices -l kubernetes.io/service-name=<svc>
  │           ├─ Empty → selector does not match labels
  │           └─ Populated → check NodePort/LB/Ingress
  │
  └─ Are the nodes Ready?
      kubectl get nodes
      ├─ No → SSH, check kubelet, disk, network
      └─ Yes → the problem is elsewhere (DNS, Ingress, cloud LB)
```

---

## Summary table

| Symptom | First command | Probable cause |
|---|---|---|
| Pod CrashLoopBackOff | `kubectl logs <pod> --previous` | App crashes on startup |
| Pod Pending | `kubectl describe pod <pod>` | No resources / taints |
| Pod ImagePullBackOff | `kubectl describe pod <pod>` | Image not found / auth |
| Pod OOMKilled | `kubectl top pod <pod>` | Memory limit exceeded |
| Service timeout | `kubectl get endpointslices -l kubernetes.io/service-name=<svc>` | Selector does not match |
| Node NotReady | `kubectl describe node <node>` | kubelet / network / disk |
| Stuck rollout | `kubectl rollout undo` | New version is broken |
| Pods Evicted | `kubectl describe node` | Node saturated |

---

> **Experience tip**: In production, diagnostic speed matters as much as the solution. Learn to read Events and logs quickly. 80% of problems are diagnosed with `describe` + `logs` + `endpointslices`.
