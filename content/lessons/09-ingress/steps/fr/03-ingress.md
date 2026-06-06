## Router le trafic HTTP avec un Ingress

Créez la porte d'entrée. Cet Ingress indique à Traefik : toute requête avec `Host: site.local` est transmise à `site-svc` sur le port 80.

### Votre tâche

**1. Appliquez l'Ingress.**

```bash
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: site
spec:
  ingressClassName: traefik
  rules:
  - host: site.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: site-svc
            port:
              number: 80
EOF
```

**2. Attendez que Traefik assigne une adresse** (quelques secondes peuvent être nécessaires).

```bash
kubectl get ingress site
```

Ce que « bon » donne :

```text
NAME   CLASS     HOSTS        ADDRESS       PORTS   AGE
site   traefik   site.local   172.x.x.x     80      10s
```

**3. Prouvez le routage.** Il n'y a pas de DNS pour `site.local` ; simulez le nom d'hôte avec un en-tête `Host:` — Traefik route sur cet en-tête seul.

```bash
curl -H "Host: site.local" http://localhost/
```

Vous devriez voir la page d'accueil nginx (HTTP 200).

**4. Confirmez que les mauvais hôtes sont rejetés** — aucune règle ne correspond, Traefik renvoie 404.

```bash
curl -i -H "Host: wrong.local" http://localhost/ | head -1
```

Ce que « bon » donne :

```text
HTTP/1.1 404 Not Found
```

> [!TIP]
> Traefik peut mettre quelques secondes à charger un Ingress nouvellement appliqué. Si `curl` renvoie 404 immédiatement, patientez 5 secondes et réessayez.

> [!IMPORTANT]
> `ingressClassName: traefik` indique à Traefik que cet Ingress lui appartient. Sans ce champ, Traefik ignore complètement l'objet — votre curl retournera 404 quoi qu'il arrive.

Lorsque `curl -H "Host: site.local" http://localhost/` retourne HTTP 200, puis cliquez sur **Vérifier**. ✅
