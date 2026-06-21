## Router le trafic HTTP avec un Ingress

Il est temps de créer la porte d'entrée. L'Ingress indique au réceptionniste (Traefik) : dès qu'un visiteur demande `site.local`, envoie-le vers le Service `site-svc` sur le port 80.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Kind | Ingress |
| Nom | `site` |
| `ingressClassName` | `traefik` |
| Règle host | `site.local` |
| Path | `/` (Prefix) |
| Service backend | `site-svc` sur le port `80` |
| Preuve | `curl -H "Host: site.local" localhost` retourne HTTP 200 |

### 🔍 Comment la trouver toi-même

Commence par explorer la spec Ingress pour connaître chaque champ dont tu as besoin :

```bash
kubectl explain ingress.spec --recursive
kubectl explain ingress.spec.rules --recursive
```

Ensuite, regarde l'aide de la commande impérative pour comprendre la forme :

```bash
kubectl create ingress --help
```

Lis les exemples. Ils te montrent le format du flag `--rule`. Tu peux utiliser ce flag pour créer l'Ingress, écrire un fichier YAML, ou utiliser `--dry-run=client -o yaml` pour générer un template de départ que tu complètes ensuite.

Après avoir créé l'Ingress, vérifie que Traefik lui a assigné une adresse :

```bash
kubectl get ingress site
kubectl describe ingress site
```

Puis prouve que le routage fonctionne. Comme il n'y a pas de vrai DNS pour `site.local`, tu simules le nom d'hôte avec un header `Host:` :

```bash
curl -H "Host: site.local" http://localhost/
```

> [!TIP]
> Traefik peut mettre quelques secondes à charger un nouvel Ingress. Si tu obtiens un 404 tout de suite, attends 5 secondes et relance le `curl`.

> [!IMPORTANT]
> Sans `ingressClassName: traefik`, Traefik ignore complètement l'Ingress. Ton `curl` retourne 404 quoi que tu fasses. Vérifie ce champ en premier si quelque chose ne va pas.

📖 Docs : [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) · [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Lorsque `curl -H "Host: site.local" http://localhost/` retourne HTTP 200, clique sur **Vérifier**. ✅
