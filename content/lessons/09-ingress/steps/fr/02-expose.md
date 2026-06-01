## Un Service pour le backend

Un Ingress route vers un **Service**, jamais directement vers les Pods. Nous avons donc besoin
d'un Service en premier. La plateforme a pré-créé un Deployment nommé **`site`** (nginx) pour
vous — cliquez **Préparer la tâche** si ce n'est pas déjà fait.

Confirmez qu'il est présent :

```bash
kubectl get deploy site
```

Exposez-le maintenant avec un Service ClusterIP nommé **`site-svc`** sur le port 80 :

```bash
kubectl expose deployment site --name=site-svc --port=80
```

Vérifiez que le Service a trouvé ses Pods (il doit avoir des **endpoints**, sinon l'Ingress ne
routera vers rien) :

```bash
kubectl get svc site-svc
kubectl get endpoints site-svc
# site-svc   10.42.x.y:80    ...   (an endpoint = a ready Pod behind the Service)
```

Un Service ClusterIP est accessible **uniquement à l'intérieur** du cluster — parfait comme
backend d'Ingress. L'Ingress (étape suivante) devient la porte publique devant lui.

Lorsque `site-svc` existe sur **le port 80 avec au moins un endpoint**, cliquez **Vérifier**. ✅
