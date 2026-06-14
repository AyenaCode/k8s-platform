## ServiceAccount and RBAC

Authentication gives a workload an identity. RBAC decides what that identity may
do. You can test both with `kubectl auth can-i`.

### Your task

In namespace **`ckad-sec`**:

- ServiceAccount `reader`
- Role `pod-reader`
  - apiGroups: `[""]`
  - resources: `["pods"]`
  - verbs: `["get", "list", "watch"]`
- RoleBinding `read-pods`
  - binds ServiceAccount `reader` to Role `pod-reader`

Validate manually:

```bash
kubectl auth can-i list pods -n ckad-sec --as=system:serviceaccount:ckad-sec:reader
kubectl auth can-i delete pods -n ckad-sec --as=system:serviceaccount:ckad-sec:reader
```

The first should be `yes`; the second should be `no`.
