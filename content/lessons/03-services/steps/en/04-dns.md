## Discover Services by DNS

Your app should never hardcode an IP. Instead it calls `http://web` and lets the cluster figure out where `web` lives. This is DNS discovery, and it works because CoreDNS automatically creates a name for every Service.

The full name pattern is:

```text
<service>.<namespace>.svc.cluster.local
```

Inside the **same namespace**, the short name works on its own: just `web`.

### See it live

Spin up a throwaway debug Pod and look up the Service by name:

```bash
kubectl run tmp --rm -it --image=busybox --restart=Never -- sh
```

Inside the shell, try:

```bash
nslookup web
wget -qO- http://web
wget -qO- http://web.default.svc.cluster.local
```

- `nslookup web` shows which ClusterIP CoreDNS returns.
- `wget` shows the nginx page, reached by name with no IP hardcoded.

> [!NOTE]
> Every Pod's `/etc/resolv.conf` already points to CoreDNS and sets a `search` path including `default.svc.cluster.local`. That is why the short name `web` resolves without extra config.

> [!IMPORTANT]
> Always call Services by name in your app code (`http://web`, `http://payments`). Let DNS and kube-proxy handle routing. This is the backbone of every microservice architecture on Kubernetes.

📖 Docs: [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) · [Service](https://kubernetes.io/docs/concepts/services-networking/service/)

You now know the three pillars of Kubernetes networking: **Services** (stable identity), **Endpoints** (live Pods behind them), and **DNS** (discovery). Well done.
