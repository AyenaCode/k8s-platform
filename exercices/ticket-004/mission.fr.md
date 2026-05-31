# TICKET-004 : Pods en crash loop

## Rapport d'incident

**De** : Equipe backend
**Urgence** : Critique
**Heure** : 08:03

> "Le service de cache est en CrashLoopBackOff depuis ce matin.
> On a fait un changement de configuration hier soir via un ConfigMap.
> Depuis, plus rien ne demarre. Le service est critique, les autres
> microservices dependent de lui."

## Ta mission

Les pods doivent demarrer et le Service doit repondre. La configuration doit etre correctement injectee.
