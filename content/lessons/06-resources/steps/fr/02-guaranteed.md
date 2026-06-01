## Construire un Pod Guaranteed

La classe QoS la plus haute, **Guaranteed**, obéit à une règle stricte : **chaque** conteneur doit définir **à la fois** le cpu et la mémoire, et pour chaque ressource `limits` doit **égaler** `requests`. Construisez-en un :

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

Une fois qu'il tourne, demandez à Kubernetes quelle classe il lui a attribuée :

```bash
kubectl get pod guaranteed-demo -o jsonpath='{.status.qosClass}{"\n"}'
# -> Guaranteed
```

Faites le test : modifiez une valeur de `limits` pour qu'elle ne soit plus égale à la request (par exemple la limite mémoire à `128Mi`) et réappliquez — la classe passe à **Burstable**. Supprimez toutes les requests/limits et elle devient **BestEffort**, la première à être évictée.

```bash
kubectl describe pod guaranteed-demo | grep -i qos
```

Quand `guaranteed-demo` affiche **QoS Class: Guaranteed**, cliquez **Vérifier**. ✅
