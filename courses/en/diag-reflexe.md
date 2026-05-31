# K8s Diagnostic Reflex — the sequence to know by heart

> **Rule**: always in this order, no improvising until you have done all 7 steps.
> Objective: go from 30 min to 3 min of diagnosis.

---

## The sequence (NS = your namespace)

### 1. Overview
```bash
k -n $NS get all
```
**You are looking for:** what exists and what is missing (no svc? no deploy?). Count the pods vs the expected replicas.

---

### 2. Pod status
```bash
k -n $NS get pods
```
**You are looking for, in this order:**
- `STATUS` ≠ `Running` → go straight to step 3
- `READY` `0/1` or `1/2` → probe failing, go to step 3
- `RESTARTS` > 0 → unstable, go to step 4 with `--previous`
- `AGE` very recent that keeps resetting → CrashLoop

**If everything is `1/1 Running`** → skip to step 5 (problem on the service/network side).

---

### 3. Describe the broken pod
```bash
k -n $NS describe pod <pod>
```
**You read from BOTTOM to TOP:**
- **`Events` section** at the bottom → 90% of the answers are there
- Look for `Failed`, `BackOff`, `Unhealthy`, `FailedScheduling`
- `Containers` section: check `State`, `Last State`, `Reason`
- `Conditions` section: `Ready: False` confirms a probe issue

**Common Reasons and action:**
| Reason | Immediate action |
|---|---|
| `ImagePullBackOff` | Check image name (typo? tag?) |
| `CrashLoopBackOff` | Step 4 with `--previous` |
| `CreateContainerConfigError` | Missing ConfigMap/Secret |
| `FailedScheduling` | Resources, taints, PVC pending |
| `Unhealthy` | readiness/liveness probe — check path/port |

---

### 4. Container logs
```bash
k -n $NS logs <pod>
k -n $NS logs <pod> --previous   # if CrashLoop
k -n $NS logs <pod> -c <container>   # if multi-container
```
**You are looking for:** the last line before the crash. DB connection errors, port already in use, file not found, missing env var.

---

### 5. Services
```bash
k -n $NS get svc
```
**You are looking for:**
- `CLUSTER-IP` = `<none>` → headless (normal for StatefulSet)
- `PORT(S)`: note the exposed ports, you will compare them later

---

### 6. ⭐ Endpoints — THE reflex that saves you
```bash
k -n $NS get endpoints
# or shorter:
k -n $NS get ep
```
**The golden rule:**
- **`ENDPOINTS` populated (IPs)** → the service finds its pods, problem is elsewhere
- **`ENDPOINTS` = `<none>`** → 🚨 the service does NOT find its pods

**If `<none>`, 2 possible causes:**

1. **Selector does not match any pod:**
```bash
k -n $NS get svc <svc> -o yaml | grep -A3 selector
k -n $NS get pods --show-labels
# Compare manually → typo? different key?
```

2. **Pods match but are not Ready** (readinessProbe failing):
```bash
k -n $NS get pods -l <selector-du-svc>
# If you see pods 0/1 → go back to step 3
```

**If endpoints OK but service unreachable → check targetPort vs containerPort:**
```bash
k -n $NS get svc <svc> -o yaml | grep -A2 targetPort
k -n $NS get pod <pod> -o yaml | grep -A2 containerPort
# Must match (number OR name)
```

---

### 7. Global namespace events
```bash
k -n $NS get events --sort-by=.lastTimestamp
```
**You are looking for:** recent `Warning` events at the bottom. Often this reveals something you missed (FailedMount, FailedScheduling, BackOff).

---

## Cheat sheet: symptom → step that resolves it

| Symptom | Key step |
|---|---|
| Pod `Pending` | 3 (describe → Events) |
| Pod `CrashLoopBackOff` | 4 (logs --previous) |
| Pod `ImagePullBackOff` | 3 (describe → message) |
| Pod `0/1 Running` | 3 (describe → Readiness probe) |
| Service not responding, pods OK | **6 (endpoints)** |
| `wget: connection refused` | 6 (targetPort mismatch) |
| `wget: bad address` | DNS — check service name |
| Everything looks OK but it doesn't work | 7 (events) |

---

## The 3 commands you must type WITHOUT THINKING

```bash
k -n $NS get pods                          # status
k -n $NS describe pod <pod>                # events
k -n $NS get ep                            # the reflex that saves you
```

**Personal test:** time yourself. If it takes you more than 5 seconds to type any of these 3 commands, do the exercise again.

---

## Junior anti-patterns

- ❌ Running `kubectl edit` directly without having read the events
- ❌ Recreating the pod without understanding why it was crashing (the bug comes back)
- ❌ Ignoring `Warning` events because "it seems fine"
- ❌ Reading the logs BEFORE the describe (events are faster to scan)
- ❌ Forgetting `-n <namespace>` and debugging in `default`

---

## Minimal setup for working fast

```bash
# In ~/.bashrc
alias k='kubectl'
export NS=exo-001    # change according to the current exercise
source <(kubectl completion bash)
complete -o default -F __start_kubectl k
```

Then you just type: `k -n $NS get pods` everywhere.
