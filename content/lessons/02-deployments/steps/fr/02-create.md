## Créer un Deployment

Une seule commande crée un Deployment, un ReplicaSet et trois Pods — tous liés entre eux.

### Votre tâche

**1. Créez le Deployment** nommé `web` avec 3 replicas nginx :

```bash
kubectl create deployment web --image=nginx --replicas=3
```

**2. Observez toute la chaîne de propriété apparaître :**

```bash
kubectl get deploy,rs,pods
```

Ce que « bon » donne :

```text
NAME                  READY   UP-TO-DATE   AVAILABLE
deployment.apps/web   3/3     3            3

NAME                          DESIRED   CURRENT   READY
replicaset.apps/web-74d9c     3         3         3

NAME                    READY   STATUS
pod/web-74d9c-aaaa      1/1     Running
pod/web-74d9c-bbbb      1/1     Running
pod/web-74d9c-cccc      1/1     Running
```

> [!NOTE]
> Les noms de Pods suivent le motif `web-<hash-replicaset>-<aléatoire>`.
> Le Deployment a créé le ReplicaSet ; le ReplicaSet a créé les Pods.
> Vous n'aurez jamais besoin de toucher le ReplicaSet directement.

> [!TIP]
> **Pods bloqués sur `ContainerCreating` ?** Le nœud télécharge l'image `nginx`
> pour la première fois. Patientez quelques secondes et relancez la commande — ça
> se résout tout seul.

Quand `web` affiche **3/3 ready**, puis cliquez sur **Vérifier**. ✅
