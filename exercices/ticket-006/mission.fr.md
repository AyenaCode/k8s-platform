# TICKET-006 : Pods qui ne deviennent jamais Ready

## Rapport d'incident

**De** : Equipe SRE
**Urgence** : Haute
**Heure** : 16:20

> "On a deploye une nouvelle webapp ce matin. Les pods affichent Running
> mais le READY reste bloque a 0/1 et ne passe jamais a 1/1.
> En plus, les pods se redemarrent toutes les 30 secondes.
> Le service ne renvoie aucune reponse, les utilisateurs voient une page d'erreur."

## Ta mission

Les pods doivent atteindre l'etat Ready 1/1 et rester stables (0 restart en regime permanent).
Le Service doit repondre.

## Indice (si tu seches)

Quand un pod est `Running` mais `0/1 READY`, regarde les conditions et les events
du `describe pod`. Cherche les mots "Readiness probe failed" ou "Liveness probe failed".
