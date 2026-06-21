## Ingress: one door, many apps

Imagine a hotel with one front desk. Every guest walks in, says their room name, and the receptionist sends them to the right floor. An **Ingress** works the same way: one public IP and port (80/443), and it reads the `Host` header on each HTTP request to send it to the right Service.

Without an Ingress you need one NodePort per app, each on a random high port. That is messy and does not scale. With an Ingress you get clean hostnames and one entry point.

The chain is always the same:

- Client sends a request to port 80 with a `Host` header.
- The **Ingress Controller** (Traefik on this cluster) reads the rules and picks the matching Service.
- The Service forwards to the right Pods.

> [!IMPORTANT]
> An Ingress object is just a config file. Without a running **Ingress Controller** to read it, nothing happens. This cluster runs **Traefik** as its controller. You must set `ingressClassName: traefik` on your Ingress so Traefik knows to pick it up.

Explore what Kubernetes knows about the Ingress resource before you start:

```bash
kubectl explain ingress.spec --recursive
```

📖 Docs: [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) · [Service](https://kubernetes.io/docs/concepts/services-networking/service/)

**Continue to the first task.**
