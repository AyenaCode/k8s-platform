## Exposer un Deployment avec ClusterIP

Le script de préparation a déjà déployé une app `web` à 2 replicas. Votre mission :
lui donner une adresse stable.

### Votre tâche

**1. Cliquez sur "Préparer la tâche"** pour confirmer que le Deployment `web` est prêt.

**2. Créez le Service ClusterIP.**

```bash
kubectl expose deployment web --port=80
```

Cela crée un Service nommé `web` avec `selector: app=web` — le même label que
`kubectl create deployment` pose sur chaque Pod qu'il gère.

**3. Inspectez le Service et ses endpoints.**

```bash
kubectl get svc web
kubectl get endpoints web
```

Ce que « bon » donne :

```text
NAME   TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
web    ClusterIP   10.43.12.34   <none>        80/TCP    5s

NAME   ENDPOINTS                       AGE
web    10.42.0.7:80,10.42.0.8:80       5s
```

Une entrée par Pod Ready — deux ici car le Deployment a 2 replicas.

> [!IMPORTANT]
> Endpoints vides = le trafic ne passe nulle part. Si vous voyez `<none>`,
> le sélecteur ne correspond à aucun Pod Ready. Vérifiez avec :
> `kubectl get pods -l app=web`

**4. Joignez le Service via son ClusterIP.**

```bash
IP=$(kubectl get svc web -o jsonpath='{.spec.clusterIP}')
curl $IP
```

Vous obtenez la page d'accueil nginx — routée par l'IP virtuelle, pas par une IP de Pod.

Puis cliquez sur **Vérifier**. ✅
