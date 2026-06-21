## Inspect, logs & exec: the daily toolkit

When something breaks, these four commands are what you reach for first. Here's
*what each is for*. You'll type them yourself.

- **describe** → full config + recent **Events**. Your first stop when a Pod won't start.
- **logs** → what the container printed (stdout/stderr). Add `-f` to follow, `--previous` after a crash.
- **exec** → open a shell *inside* the container to poke around.
- **get -o yaml** → the Pod exactly as the cluster stores it.

Don't remember the exact flags? `kubectl describe --help`, `kubectl logs --help`,
`kubectl exec --help`. Always ask the tool.

### 🎯 Mission

Your Pod landed on some node. **Find out which one**, then tag the Pod with it:

| | |
|-|-|
| Label key | `node` |
| Label value | the **name of the node** your `web` Pod runs on |

So if it runs on a node called `k3d-server-0`, you'd set `node=k3d-server-0`.

### 🔍 How to find it yourself

The node a Pod runs on shows up in the **wide** output and in `describe`:

```bash
kubectl get pods -o wide       # look at the NODE column
```

Found the name? Now you need the verb that *adds a label* to an object. Search
the cheat sheet for "label", or run `kubectl label --help` for the shape.

> [!TIP]
> `kubectl get pod web -o yaml` shows the raw object. The node also lives at
> `.spec.nodeName`. Learning where fields live in the YAML pays off forever.

📖 Docs: [Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

When the label matches the real node, hit **Verify**. ✅
