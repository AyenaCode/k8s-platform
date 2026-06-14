## ServiceAccount et RBAC

L'authentification donne une identite a un workload. RBAC decide ce que cette
identite peut faire. Tu peux tester les deux avec `kubectl auth can-i`.

### Ta tache

Dans le namespace **`ckad-sec`** :

- ServiceAccount `reader`
- Role `pod-reader`
  - apiGroups : `[""]`
  - resources : `["pods"]`
  - verbs : `["get", "list", "watch"]`
- RoleBinding `read-pods`
  - lie le ServiceAccount `reader` au Role `pod-reader`

Valide manuellement :

```bash
kubectl auth can-i list pods -n ckad-sec --as=system:serviceaccount:ckad-sec:reader
kubectl auth can-i delete pods -n ckad-sec --as=system:serviceaccount:ckad-sec:reader
```

Le premier doit repondre `yes`; le second `no`.
