# Kubernetes Exercises — Incident Tickets

## How to use

Each `ticket-XXX` folder simulates a production incident.
The broken configs are encoded inside the scripts — you can't cheat.

> The easiest way to run these is from the web app (Courses & Exercises UI),
> which streams `deploy.sh` / `reset.sh` straight into an in-browser terminal.
> You can also run them by hand, as shown below.

### Workflow per exercise

```bash
# 1. Read the incident ticket
cat ticket-001/mission.en.md   # or mission.fr.md

# 2. Deploy the broken config
./ticket-001/deploy.sh

# 3. Diagnose and fix it with kubectl only
#    kubectl get, describe, logs, events, exec, edit, patch, set image...

# 4. Validate against the mission's success criterion

# 5. Clean up before the next exercise
./reset.sh
```

### Recommended order

| Ticket | Difficulty | Key concept |
|---|---|---|
| 001 | Easy | Selector typo (service ↔ pods) |
| 002 | Easy | ImagePullBackOff |
| 003 | Medium | targetPort vs containerPort |
| 004 | Medium | Misinjected ConfigMap |
| 005 | Hard | Full frontend + backend stack |
| 006 | Medium | Misconfigured liveness/readiness probe |
| 007 | Medium | OOMKilled (memory limit) |
| 008 | Medium | Reference to a non-existent Secret |
| 009 | Easy | Wrong command/args (read the logs) |
| 010 | Medium | Init container blocked by a dependency |

### Prerequisites

A running cluster and `kubectl` pointing at it. From the repo root:

```bash
make up              # create the kind cluster + deploy the platform
kubectl get nodes    # must show a node in the Ready state
```
