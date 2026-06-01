## Router le trafic avec un Ingress

Créez maintenant la porte d'entrée. Cet Ingress indique : *toute requête vers l'hôte
`site.local`, chemin `/`, est transmise au Service `site-svc` sur le port 80.*

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

Examinez-le — après un moment, Traefik renseigne une adresse :

```bash
kubectl get ingress site
# NAME   CLASS     HOSTS        ADDRESS       PORTS   AGE
# site   traefik   site.local   172.x.x.x     80      10s
```

**Prouvez maintenant le routage.** Il n'y a pas de DNS pour `site.local`, nous simulons donc le
nom d'hôte avec un en-tête `Host:` — Traefik route sur cet en-tête seul :

```bash
curl -H "Host: site.local" http://localhost/
# <!DOCTYPE html> ... Welcome to nginx!   (HTTP 200, served via the Ingress)
```

Comparez : une requête avec un hôte **incorrect** reçoit un 404 de Traefik, car aucune règle
ne correspond :

```bash
curl -i -H "Host: wrong.local" http://localhost/ | head -1
# HTTP/1.1 404 Not Found
```

C'est tout l'intérêt — un seul proxy, qui route par hôte vers de nombreux backends.

Lorsque `curl -H "Host: site.local" http://localhost/` retourne **HTTP 200**, cliquez
**Vérifier**. ✅
