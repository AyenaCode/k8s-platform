## Cas 3 : le Service n'a pas d'endpoints

Celui-ci est sournois — **rien ne plante**. Le Pod est sain, le Service existe,
pourtant le trafic ne passe nulle part. Cliquez **Préparer la tâche**, puis diagnostiquez :

```bash
kubectl get pods -l app=api      # 1/1 Running — the Pod is fine
kubectl get svc api              # the Service exists, has a ClusterIP
kubectl get endpoints api
# NAME   ENDPOINTS   AGE
# api    <none>      30s          <- the smoking gun: no endpoints
```

Un Service trouve ses Pods par **label selector**. Des endpoints `<none>` signifient que le
selector ne correspond à **aucun Pod Ready**. Comparez les deux côtés :

```bash
kubectl get svc api -o jsonpath='{.spec.selector}{"\n"}'
# {"app":"api-v2"}     <- the Service is looking for app=api-v2

kubectl get pods -l app=api --show-labels
# ... app=api          <- but the Pods are labelled app=api
```

`api-v2` ≠ `api`. Le selector pointe vers un label qu'aucun Pod ne possède, donc le Service est
une coquille vide. C'est la **cause n°1** du « mon Service ne retourne rien » — un selector
qui ne correspond pas aux labels des Pods.

**Corrigez-le** — ré-appliquez le Service avec le selector correct :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api          # <- now matches the Pods
  ports:
  - port: 80
    targetPort: 80
EOF
```

Confirmez que les endpoints apparaissent :

```bash
kubectl get endpoints api
# api    10.42.x.y:80    ...      <- a Pod IP — traffic will flow now
```

Lorsque `kubectl get endpoints api` liste une **IP de Pod**, cliquez **Vérifier**. ✅
