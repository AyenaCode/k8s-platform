# TICKET-008 : Payment service down

## Incident Report

**From** : Payments team
**Urgency** : CRITICAL
**Time** : 12:55

> "The new payment service refuses to start. The pods remain
> stuck in some weird status, we're not sure what. The ConfigMaps
> look fine. The dev who wrote the YAML is on vacation and nobody
> knows what he configured. We're losing transactions every minute."

## Your mission

The pods must start (Running, Ready 1/1). The Service must respond.

> Note: you will discover that a resource is missing. Create it with
> `kubectl create secret generic ...` (values don't matter, we're in dev).

## Hint (if you're stuck)

When a pod has a status other than Running, `describe pod` will ALWAYS tell you
why in the Events section. Look for the word "not found"
or "MountVolume".
