## Découvrir les Services par DNS

Ton app ne doit jamais coder une IP en dur. À la place, elle appelle `http://web` et laisse le cluster trouver où `web` se trouve. C'est la découverte par DNS, qui fonctionne parce que CoreDNS crée automatiquement un nom pour chaque Service.

Le format du nom complet est :

```text
<service>.<namespace>.svc.cluster.local
```

Dans le **même namespace**, le nom court suffit : juste `web`.

### Vois-le en direct

Lance un Pod de debug jetable et cherche le Service par son nom :

```bash
kubectl run tmp --rm -it --image=busybox --restart=Never -- sh
```

Dans le shell, essaie :

```bash
nslookup web
wget -qO- http://web
wget -qO- http://web.default.svc.cluster.local
```

- `nslookup web` montre quel ClusterIP CoreDNS retourne.
- `wget` affiche la page nginx, atteinte par nom sans aucune IP codée en dur.

> [!NOTE]
> Le fichier `/etc/resolv.conf` de chaque Pod pointe déjà vers CoreDNS et définit un chemin `search` incluant `default.svc.cluster.local`. C'est pourquoi le nom court `web` se résout sans config supplémentaire.

> [!IMPORTANT]
> Dans ton code d'app, appelle toujours les Services par leur nom (`http://web`, `http://payments`). Laisse DNS et kube-proxy gérer le routage. C'est la base de toute architecture microservices sur Kubernetes.

📖 Docs : [DNS pour Services et Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) · [Service](https://kubernetes.io/docs/concepts/services-networking/service/)

Tu connais maintenant les trois piliers du réseau Kubernetes : les **Services** (identité stable), les **Endpoints** (Pods actifs derrière eux) et le **DNS** (découverte). Bien joué.
