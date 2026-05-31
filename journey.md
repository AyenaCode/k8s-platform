# Learning journal

A personal log of Kubernetes commands and lessons as I build this platform.

## May 14, 2026

- `kubectl create deploy my-deploy --image=image-name` — create a Deployment object
- `kubectl get deploy` — list the Deployments in the current namespace
- `kubectl set image deploy/my-deploy container-name=new-image` — update the app to a new image
- `kubectl scale deploy my-app --replicas=3` — scale the Deployment to 3 instances
