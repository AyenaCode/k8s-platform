## base64 ≠ encryption

One thing every engineer must know about Secrets: by default they are **not
encrypted**. They are only **base64-encoded**, which is just a reversible text
format — anyone with read access can decode them.

See it yourself. The raw value in the API is base64:

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}'
# -> czNjcjN0   (this is NOT encryption)
```

Decode it in one line:

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}' | base64 -d
# -> s3cr3t
```

So what makes a Secret different from a ConfigMap?

- It is **not** shown in plain text by `kubectl describe`.
- Access can be locked down separately with **RBAC**.
- The kubelet only sends a Secret to nodes that actually run a Pod using it.
- The cluster *can* be configured for **encryption at rest** (and you should, in
  production).

> **Key idea:** a Secret is about *handling* and *access control*, not magic
> encryption. Treat the contents as real secrets — lock down who can `get` them.

You now know the two ways to inject config (env + files) and the truth about
base64. This lesson is complete — hit **Next** to keep going. →
