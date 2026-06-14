## Create and use a CRD

The CKAD curriculum includes resources that extend Kubernetes. You do not need to
write an operator here; you need to recognize and use a CustomResourceDefinition.

### Your task

Create cluster-scoped CRD **`widgets.ckad.dev`**:

- group: `ckad.dev`
- kind: `Widget`
- plural: `widgets`
- scope: `Namespaced`
- version: `v1`
- schema includes `spec.size` as a string

Then create namespaced custom resource **`sample`** in namespace **`ckad-sec`**:

```yaml
apiVersion: ckad.dev/v1
kind: Widget
metadata:
  name: sample
  namespace: ckad-sec
spec:
  size: small
```

Verify with:

```bash
kubectl get crd widgets.ckad.dev
kubectl get widget sample -n ckad-sec -o yaml
```
