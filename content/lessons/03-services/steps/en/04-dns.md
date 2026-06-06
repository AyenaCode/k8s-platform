## Discover Services by DNS

This is how microservices find each other at runtime. CoreDNS, the cluster's
built-in DNS server, automatically creates an A record for every Service:

```text
<service>.<namespace>.svc.cluster.local
```

Inside the **same namespace**, the short name resolves too: just `web`.

### See it live

**1. Spin up a throwaway Pod and call the Service by name.**

```bash
kubectl run tmp --rm -it --image=busybox --restart=Never -- \
  wget -qO- http://web
```

What good looks like:

```text
<!DOCTYPE html>
<html>
<head><title>Welcome to nginx!</title>
...
```

CoreDNS resolved `web` → the ClusterIP → one of the ready Pods. No IP hardcoding.

**2. From a different namespace, use the full FQDN.**

```bash
wget -qO- http://web.default.svc.cluster.local
```

> [!NOTE]
> Every Pod's `/etc/resolv.conf` already points to the CoreDNS ClusterIP and
> sets `search default.svc.cluster.local svc.cluster.local cluster.local`.
> That's why the short name `web` works without any extra config.

> [!IMPORTANT]
> Never hardcode Pod IPs in your app. Call the **Service name** (`http://web`,
> `http://payments`) and let DNS + kube-proxy handle routing and load balancing.
> This is the backbone of every microservice architecture on Kubernetes.

You now know the three pillars of Kubernetes networking: **Services** (stable
identity), **Endpoints** (the live Pods behind them), and **DNS** (discovery).
That closes the networking fundamentals, well done.
