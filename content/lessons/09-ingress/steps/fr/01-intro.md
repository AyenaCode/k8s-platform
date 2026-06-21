## Ingress : une seule porte, plusieurs apps

Imagine un hôtel avec un seul accueil. Chaque client entre, donne le nom de sa chambre, et le réceptionniste l'envoie au bon étage. Un **Ingress** fonctionne pareil : une seule IP publique et un seul port (80/443), et il lit le header `Host` de chaque requête HTTP pour l'envoyer vers le bon Service.

Sans Ingress, il faut un NodePort par app, chacun sur un port élevé aléatoire. C'est ingérable. Avec un Ingress, tu obtiens des noms d'hôte propres et un seul point d'entrée.

La chaîne est toujours la même :

- Le client envoie une requête sur le port 80 avec un header `Host`.
- L'**Ingress Controller** (Traefik sur ce cluster) lit les règles et choisit le Service correspondant.
- Le Service transmet aux bons Pods.

> [!IMPORTANT]
> Un objet Ingress n'est qu'un fichier de configuration. Sans un **Ingress Controller** en cours d'exécution pour le lire, rien ne se passe. Ce cluster fait tourner **Traefik** comme contrôleur. Tu dois définir `ingressClassName: traefik` sur ton Ingress pour que Traefik sache qu'il doit le prendre en charge.

Explore ce que Kubernetes sait sur la ressource Ingress avant de commencer :

```bash
kubectl explain ingress.spec --recursive
```

📖 Docs : [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/) · [Service](https://kubernetes.io/docs/concepts/services-networking/service/)

**Continue vers la première tâche.**
