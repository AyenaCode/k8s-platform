## Exposer avec un ClusterIP

Cliquez d'abord sur **Préparer la tâche** — ça déploie une app `web` à 2 replicas
que vous allez exposer.

Créez maintenant un Service **ClusterIP** devant elle :

```bash
kubectl expose deployment web --port=80
```

Inspectez-le et — surtout — vérifiez ses **endpoints** (les IP de Pods routées) :

```bash
kubectl get svc web
kubectl get endpoints web
# web   10.42.0.7:80,10.42.0.8:80   ← une entrée par Pod Ready
```

> **Réflexe n°1 de debug d'un Service :** si `endpoints` est *vide*, le sélecteur
> du Service ne correspond à aucun Pod Ready — le trafic ne va nulle part.
> Vérifiez toujours les endpoints.

Joignez-le depuis l'intérieur du cluster via son ClusterIP :

```bash
kubectl get svc web -o jsonpath='{.spec.clusterIP}'   # ex. 10.43.12.34
curl <cette-ip>                                        # page d'accueil nginx
```

Quand le Service `web` a **au moins un endpoint**, cliquez sur **Vérifier**. ✅
