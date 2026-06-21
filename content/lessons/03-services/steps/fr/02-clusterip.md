## Exposer un Deployment avec ClusterIP

Le script de préparation a déjà créé un Deployment `web` à 2 replicas. Ta mission : lui donner une adresse stable. Aucune commande fournie ici : tu la cherches toi-même et tu la construis.

### 🎯 Mission

| Champ | Valeur |
|-------|--------|
| Ressource à créer | Service |
| Nom | `web` |
| Type | `ClusterIP` (défaut) |
| Port exposé | `80` |
| Cible du sélecteur | le Deployment `web` |
| Preuve | au moins une IP listée dans `kubectl get endpoints web` |

### 🔍 Comment la trouver toi-même

Tu veux *exposer* quelque chose. Demande à l'outil :

```bash
kubectl expose --help        # lis le SYNOPSIS et les premiers exemples
kubectl explain service.spec # comprends à quoi servent les champs
```

Après avoir créé le Service, inspecte ce qui a été créé :

```bash
kubectl get svc web
kubectl get endpoints web
```

Une entrée par Pod Ready. Deux Pods = deux IPs dans la liste.

> [!TIP]
> Des endpoints vides signifient que le sélecteur ne correspond à aucun Pod Ready. Lance `kubectl get pods -l app=web` pour vérifier les labels.

📖 Docs : [Service](https://kubernetes.io/docs/concepts/services-networking/service/) · [Aide-mémoire kubectl](https://kubernetes.io/docs/reference/kubectl/quick-reference/)

Quand `kubectl get endpoints web` affiche au moins une IP, clique sur **Vérifier**. ✅
