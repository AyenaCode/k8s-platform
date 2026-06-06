## Exposer le backend avec un Service

Un Ingress route vers un **Service**, jamais directement vers les Pods. Avant de créer un Ingress, il faut un Service en place.

La plateforme a pré-créé un Deployment nommé **`site`** (nginx) — cliquez **Préparer la tâche** si ce n'est pas encore fait.

### Votre tâche

**1. Confirmez que le Deployment est prêt.**

```bash
kubectl get deploy site
```

**2. Exposez-le en Service ClusterIP nommé `site-svc` sur le port 80.**

```bash
kubectl expose deployment site --name=site-svc --port=80
```

**3. Vérifiez que le Service a des endpoints** (au moins un Pod prêt derrière lui).

```bash
kubectl get endpoints site-svc
```

Ce que « bon » donne :

```text
NAME       ENDPOINTS         AGE
site-svc   10.42.x.y:80      5s
```

Un endpoint est un Pod prêt vers lequel le Service peut transmettre. Si cette colonne affiche `<none>`, le sélecteur n'a trouvé aucun Pod en cours d'exécution — attendez quelques secondes et réessayez.

> [!NOTE]
> Un Service ClusterIP est accessible **uniquement à l'intérieur** du cluster, ce qui est exactement ce qu'il faut pour un backend d'Ingress. L'Ingress (étape suivante) devient la porte d'entrée publique.

> [!WARNING]
> Si vous avez déjà exécuté `kubectl expose` et obtenez `Error: service "site-svc" already exists`, le Service est en place — passez directement à l'étape 3.

Lorsque `site-svc` existe sur le port 80 avec au moins un endpoint, puis cliquez sur **Vérifier**. ✅
