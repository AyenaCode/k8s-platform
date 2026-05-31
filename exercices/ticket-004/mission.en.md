# TICKET-004 : Pods in crash loop

## Incident Report

**From** : Backend team
**Urgency** : Critical
**Time** : 08:03

> "The cache service has been in CrashLoopBackOff since this morning.
> We made a configuration change last night via a ConfigMap.
> Since then, nothing starts anymore. The service is critical, other
> microservices depend on it."

## Your mission

The pods must start and the Service must respond. The configuration must be correctly injected.
