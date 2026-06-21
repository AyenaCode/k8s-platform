## Hit a memory limit (OOMKilled)

When a container eats more memory than its limit allows, the Linux kernel's OOM-killer sends it SIGKILL (exit 137). Kubernetes calls this state **OOMKilled**. This is the number one reason a "healthy" container keeps restarting in production.

You will make it happen on purpose so you can recognise the signals.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Kind | Pod |
| Name | `hog` |
| Image | `busybox:1.36` |
| Command | `sh -c "tail /dev/zero"` (allocates memory without bound) |
| memory request | `10Mi` |
| memory limit | `20Mi` |
| Expected outcome | Pod is OOMKilled within seconds |

### 🔍 How to find it yourself

Look up the command field and the resources field:

```bash
kubectl explain pod.spec.containers.command
kubectl explain pod.spec.containers.resources.limits
```

After the Pod starts, watch it tip over:

```bash
kubectl get pod hog -w
```

The STATUS column will flash `OOMKilled`, then `CrashLoopBackOff`. The reliable proof is the **last terminated state**, which persists across restarts:

```bash
kubectl get pod hog -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}{"\n"}'
kubectl describe pod hog | grep -A3 "Last State"
```

> [!IMPORTANT]
> Exit code **137** means killed by SIGKILL from the OOM-killer. `CrashLoopBackOff` alone does not tell you why: always read `lastState.terminated.reason` and the exit code.

> [!WARNING]
> `CrashLoopBackOff` is not always OOMKilled. It only means the container keeps crashing. The reason could be anything: bad config, crash, or a too-tight memory limit.

📖 Docs: [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) · [Pod QoS Classes](https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/)

Once `hog` has been OOMKilled at least once, hit **Verify**. ✅
