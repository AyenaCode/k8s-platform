## Découverte de service (DNS)

C'est ainsi que les microservices se trouvent. Chaque Service obtient un nom DNS
automatique via le CoreDNS du cluster :

```
<service>.<namespace>.svc.cluster.local
```

Dans le **même namespace**, le nom court suffit — juste `web`.

Essayez depuis un Pod jetable :

```bash
kubectl run tmp --rm -it --image=busybox --restart=Never -- \
  wget -qO- http://web
# affiche le HTML nginx — "web" résolu par DNS, réparti vers un Pod
```

Depuis un **autre** namespace, on utiliserait la forme longue :

```bash
wget -qO- http://web.default.svc.cluster.local
```

> **Modèle mental :** le code ne code jamais en dur les IP de Pods. Il appelle le
> *nom du Service* (`http://web`, `http://payments`, …) et le DNS + le load
> balancing de Kubernetes font le reste. C'est l'épine dorsale de toute
> architecture microservices sur K8s.

Vous connaissez maintenant les trois piliers du réseau Kubernetes : les
**Services** (identité stable), les **endpoints** (les Pods vivants derrière) et le
**DNS** (la découverte). Ça complète la trilogie des fondamentaux — bravo ! 🎉

Cette étape est conceptuelle — cliquez sur **Suivant**/terminer une fois la
résolution DNS observée.
