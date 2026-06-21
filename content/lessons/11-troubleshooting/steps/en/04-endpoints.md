## Case 3: Service has no endpoints

This one is the trickiest. Nothing is crashing. The Pod is healthy, the Service exists. But traffic goes nowhere. This is a silent failure: no error, no log, just nothing. Your job: find why the Service is not reaching the Pod and fix it.

### 🎯 Mission

| Field | Value |
|-------|-------|
| Deployment | `api` |
| Service | `api` |
| Target state | Service `api` has at least one endpoint |

The Pod is already `Running`. Get the Service to route traffic to it.

### 🔍 How to investigate

Start by checking whether the Pod looks healthy:

```bash
kubectl get pods -l app=api
```

Then check what the Service is actually routing to:

```bash
kubectl get endpoints api
```

If you see `<none>`, the Service has no Pods to send traffic to. That is your smoking gun.

Now compare two things side by side. First, what the Service is looking for:

```bash
kubectl get svc api -o yaml
```

Look at the `spec.selector` block.

Then, what labels the Pods actually have:

```bash
kubectl get pods -l app=api --show-labels
```

Compare them carefully. A Service finds Pods by matching its selector to Pod labels. If they do not match exactly, the Service routes to nothing.

```bash
kubectl get events --sort-by=.lastTimestamp
```

> [!TIP]
> Services do not emit events when their selector matches nothing. That is why this failure is silent. The only clue is comparing `kubectl get endpoints` (shows `<none>`) against the selector and the Pod labels yourself.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When `kubectl get endpoints api` shows a Pod IP instead of `<none>`, hit **Verify**. ✅
