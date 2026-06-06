## Diagnostiquer et corriger un Service sans endpoints

Celui-ci est subtil : rien ne plante. Le Pod est sain, le Service existe, pourtant le trafic ne passe nulle part. C'est le mystère de production le plus fréquent.

### Diagnostiquer

**1. Repérer le symptôme** : le Pod semble correct :

```bash
kubectl get pods -l app=api
```

```text
NAME                   READY   STATUS    RESTARTS   AGE
api-7c9f6b8c5-m3xpw   1/1     Running   0          45s
```

**2. Vérifier le Service** : il a un ClusterIP mais quelque chose cloche :

```bash
kubectl get svc api
kubectl get endpoints api
```

```text
NAME   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
api    ClusterIP   10.96.45.102   <none>        80/TCP    45s

NAME   ENDPOINTS   AGE
api    <none>      45s
```

`<none>` : voilà le signe révélateur. Un Service sans endpoints transmet le trafic vers... rien.

**3. Comparer le selector aux labels des Pods** : un Service trouve ses Pods par label selector :

```bash
kubectl get svc api -o jsonpath='{.spec.selector}{"\n"}'
```

```text
{"app":"api-v2"}
```

```bash
kubectl get pods -l app=api --show-labels
```

```text
NAME                   LABELS
api-7c9f6b8c5-m3xpw   app=api, pod-template-hash=7c9f6b8c5
```

`app=api-v2` (Service) ≠ `app=api` (Pod). Le selector pointe vers un label qu'aucun Pod ne possède : le Service est une coquille vide.

> [!WARNING]
> Cette incompatibilité est la **cause n°1** du « mon Service ne retourne rien » en production. Une faute de frappe dans le selector, un suffixe de version oublié, un copier-coller depuis un autre Deployment, tout produit le même échec silencieux : le Pod est sain mais injoignable.

**4. Confirmer en comparant les objets bruts** : le Service ne génère pas d'event pour ce cas ; compare directement les YAML :

```bash
kubectl get svc api -o yaml | grep -A3 selector
kubectl get deploy api -o yaml | grep -A3 matchLabels
```

### Ta tâche

**1. Ré-appliquer le Service** avec le selector correct, conserve le même nom de Service :

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api          # correspond aux labels des Pods
  ports:
  - port: 80
    targetPort: 80
EOF
```

**2. Confirmer que les endpoints affichent maintenant une IP de Pod :**

```bash
kubectl get endpoints api
```

```text
NAME   ENDPOINTS         AGE
api    10.42.0.12:80     45s
```

> [!TIP]
> Les endpoints apparaissent en moins d'une seconde dès que le selector correspond à un Pod Ready. Si tu vois encore `<none>`, vérifie `kubectl get pods -l app=api` : le Pod doit être `1/1 Running`.

Puis clique sur **Vérifier**. ✅
