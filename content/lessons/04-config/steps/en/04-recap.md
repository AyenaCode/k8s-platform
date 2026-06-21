## base64 is not encryption

Every engineer who touches Kubernetes must understand this: Secrets are **not encrypted at rest by default**. They are base64-encoded: a reversible format anyone can decode in one command.

Confirm it yourself on what you just created:

```bash
kubectl get secret app-secret -o jsonpath='{.data.API_KEY}'
```

Pipe that output through `base64 -d`. You get back the plain value immediately.

> [!WARNING]
> base64 is not ciphertext. It is a transport encoding. Any user who can run `kubectl get secret` reads your credentials instantly.

### What actually makes a Secret safer than a ConfigMap

| Property | ConfigMap | Secret |
|---|---|---|
| Shown in `kubectl describe` | Yes (plain) | No (omitted) |
| Separate RBAC resource | No | Yes: lock it down |
| kubelet delivery | All nodes | Only nodes running a consumer Pod |
| Encrypted at rest | No | Optional: enable `EncryptionConfiguration` |

> [!IMPORTANT]
> In production: enable encryption at rest (`EncryptionConfiguration` in the API server), use a secrets manager (Vault, AWS Secrets Manager, Sealed Secrets), and apply tight RBAC. base64 is a transport encoding, not a security control.

### Injection methods, quick reference

```text
ConfigMap / Secret → Pod

  envFrom      all keys  → env vars
  valueFrom    one key   → one var
  volume       all keys  → files  (auto-updates)
  + subPath    one file  (no auto-update)
```

You now know how to keep config out of images, inject it two ways, and why Secrets demand real access control.
