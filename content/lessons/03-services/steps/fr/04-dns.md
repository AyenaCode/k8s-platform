## Découvrir les Services par DNS

C'est ainsi que les microservices se trouvent à l'exécution. CoreDNS, le serveur
DNS intégré au cluster, crée automatiquement un enregistrement A pour chaque Service :

```text
<service>.<namespace>.svc.cluster.local
```

Dans le **même namespace**, le nom court suffit : juste `web`.

### Vois-le en direct

**1. Lance un Pod jetable et appelle le Service par son nom.**

```bash
kubectl run tmp --rm -it --image=busybox --restart=Never -- \
  wget -qO- http://web
```

Ce que « bon » donne :

```text
<!DOCTYPE html>
<html>
<head><title>Welcome to nginx!</title>
...
```

CoreDNS a résolu `web` → le ClusterIP → un Pod Ready. Aucune IP codée en dur.

**2. Depuis un autre namespace, utilise le FQDN complet.**

```bash
wget -qO- http://web.default.svc.cluster.local
```

> [!NOTE]
> Le fichier `/etc/resolv.conf` de chaque Pod pointe déjà vers le ClusterIP de
> CoreDNS et définit `search default.svc.cluster.local svc.cluster.local cluster.local`.
> C'est pourquoi le nom court `web` fonctionne sans aucune config supplémentaire.

> [!IMPORTANT]
> Ne code jamais des IP de Pods dans ton app. Appelle le **nom du Service**
> (`http://web`, `http://payments`) et laisse DNS + kube-proxy gérer le routage
> et le load balancing. C'est l'épine dorsale de toute architecture microservices
> sur Kubernetes.

Tu connais maintenant les trois piliers du réseau Kubernetes : les **Services**
(identité stable), les **Endpoints** (les Pods actifs derrière eux) et le **DNS**
(la découverte). Les fondamentaux réseau sont bouclés, bien joué.
