## L'ouvrir vers l'extérieur avec NodePort

Un ClusterIP n'est joignable qu'à l'intérieur du cluster. Un **NodePort** ouvre un
port dans la plage 30000–32767 sur chaque nœud et redirige le trafic vers le Service.

### Ta tâche

**1. Crée un Service NodePort nommé `web-np`.**

```bash
kubectl expose deployment web --name=web-np --type=NodePort --port=80
```

**2. Trouve le port de nœud attribué.**

```bash
kubectl get svc web-np
```

Ce que « bon » donne :

```text
NAME     TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE
web-np   NodePort   10.43.5.67    <none>        80:31234/TCP   5s
```

`80:31234` signifie que le port 80 du Service correspond au port 31234 du nœud.

**3. Appelle-le sur `localhost`**, ce terminal partage le réseau du nœud.

```bash
PORT=$(kubectl get svc web-np -o jsonpath='{.spec.ports[0].nodePort}')
curl localhost:$PORT
```

Tu obtiens la page nginx, atteinte depuis l'extérieur du cluster.

> [!NOTE]
> Sur un vrai cluster cloud, tu utiliserais l'IP externe du nœud plutôt que
> `localhost`. Pour un accès externe en production, préfère **type: LoadBalancer**
> (sur k3s, le ServiceLB intégré attribue automatiquement une vraie IP externe).

> [!TIP]
> Tu as déjà un Service ClusterIP `web` de l'étape précédente ? Parfait :
> on peut avoir les deux types en parallèle devant le même Deployment.

Puis clique sur **Vérifier**. ✅
