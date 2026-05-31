# TICKET-007 : Cache crashing in a loop

## Incident Report

**From** : Backend team
**Urgency** : High
**Time** : 03:42 (night)

> "Our cache Redis keeps restarting every 20 seconds. The pods go from
> Running to Error and then start again. We checked the image, it's the right one.
> The logs show nothing abnormal on the application side.
> The microservices that depend on the cache are starting to collapse."

## Your mission

The Redis pods must be Running and stable (0 restarts for 1 minute).
The service must accept connections.

## Hint (if you're stuck)

The app-side logs are empty because the app doesn't have time to log anything.
When a pod dies without saying anything, `describe pod` often reveals a `Last State`
with a specific reason. Read it carefully.
