## Creer et utiliser une CRD

Le curriculum CKAD inclut les ressources qui etendent Kubernetes. Ici tu n'as
pas besoin d'ecrire un operator ; tu dois reconnaitre et utiliser une
CustomResourceDefinition.

### Ta tache

Cree la CRD cluster-scoped **`widgets.ckad.dev`** :

- group : `ckad.dev`
- kind : `Widget`
- plural : `widgets`
- scope : `Namespaced`
- version : `v1`
- le schema inclut `spec.size` comme string

Puis cree la custom resource namespaced **`sample`** dans le namespace
**`ckad-sec`** :

```yaml
apiVersion: ckad.dev/v1
kind: Widget
metadata:
  name: sample
  namespace: ckad-sec
spec:
  size: small
```

Verifie avec :

```bash
kubectl get crd widgets.ckad.dev
kubectl get widget sample -n ckad-sec -o yaml
```
