## Run a replica-ratio canary

Kubernetes Services do not do weighted routing by themselves. A simple canary can
be represented by two Deployments behind one selector: many stable replicas, few
canary replicas.

### Your task

In namespace **`ckad-deploy`**:

- Deployment `web-stable`: `4` replicas, image `nginx:1.27`, labels `app=web,track=stable`
- Deployment `web-canary`: `1` replica, image `nginx:1.27`, labels `app=web,track=canary`
- Service `web`: port `80`, selector **only** `app=web`

The Service should see endpoints from both Deployments.
