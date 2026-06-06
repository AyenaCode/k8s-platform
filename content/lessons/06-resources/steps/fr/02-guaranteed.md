## Construire un Pod Guaranteed

**Guaranteed** est la classe QoS la plus haute. La règle est stricte : chaque
conteneur doit définir **à la fois** le cpu et la mémoire, et `limits` doit
**égaler** `requests` pour chaque ressource.

> [!NOTE]
> Les champs de ressources d'un Pod sont immuables après sa création. Pour les
> modifier, supprime le Pod et réapplique-le. Le cluster l'impose : tu ne
> peux pas changer les valeurs de ressources via `kubectl apply` sur un Pod
> existant.

### Ta tâche

**1. Applique le Pod Guaranteed :**

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-demo
spec:
  containers:
  - name: app
    image: nginx:1.27
    resources:
      requests: { cpu: "100m", memory: "64Mi" }
      limits:   { cpu: "100m", memory: "64Mi" }
EOF
```

**2. Confirme la classe QoS que Kubernetes lui a attribuée :**

```bash
kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}{"\n"}'
```

Ce que « bon » donne :

```text
Guaranteed
```

**3. Vérifie via describe :**

```bash
kubectl describe pod guaranteed-demo | grep -i qos
```

Ce que « bon » donne :

```text
QoS Class:  Guaranteed
```

> [!TIP]
> Pour observer les autres classes QoS sans toucher à `guaranteed-demo`, applique
> un second Pod avec `limits != requests` (→ **Burstable**) ou sans aucun champ de
> ressources (→ **BestEffort**, évicté en premier). Supprime-le ensuite.

Puis clique sur **Vérifier**. ✅
