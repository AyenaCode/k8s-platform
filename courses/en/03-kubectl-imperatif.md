# 03 — kubectl imperative: commands to know by heart

> **Objective**: Be able to operate a cluster without opening the documentation. Every command here must become a reflex.

---

## Golden rule

In **dev/emergencies** → imperative (fast, direct).
In **prod/CI-CD** → declarative (`kubectl apply -f fichier.yaml`).

Imperative is your firefighter's tool. Declarative is your architect's tool.

---

## 1. Observe — see what is running

```bash
# List the pods in the current namespace
kubectl get pods

# List the pods of a specific namespace
kubectl get pods -n production

# List the pods of ALL namespaces
kubectl get pods -A

# See everything at once (pods, services, deployments)
kubectl get all

# See with more details (IP, node, status)
kubectl get pods -o wide

# Watch in real time (refreshes automatically)
kubectl get pods -w

# List the nodes of the cluster
kubectl get nodes

# List the namespaces
kubectl get namespaces

# List the services
kubectl get svc

# List the deployments
kubectl get deployments
```

---

## 2. Inspect — understand what is happening

```bash
# Full details of a pod (config + Events at the bottom = your goldmine for debugging)
kubectl describe pod <nom-du-pod>

# Details of a deployment
kubectl describe deployment <nom>

# Details of a service (check Endpoints to know if pods are targeted)
kubectl describe svc <nom>

# Details of a node (capacity, conditions, pods running on it)
kubectl describe node <nom-du-node>

# See the endpoints of a service (IP:port of targeted pods)
# Since K8s 1.33+, use EndpointSlice:
kubectl get endpointslices -l kubernetes.io/service-name=<nom-du-service>

# See recent cluster events (useful when you don't know where to look)
kubectl get events --sort-by='.lastTimestamp'

# Events of a specific namespace
kubectl get events -n production --sort-by='.lastTimestamp'
```

---

## 3. Create — deploy resources

```bash
# Create a deployment
kubectl create deployment mon-app --image=nginx:1.25

# Create a deployment with a number of replicas
kubectl create deployment mon-app --image=nginx:1.25 --replicas=3

# Expose a deployment with a Service
kubectl expose deployment mon-app --port=80 --target-port=80 --type=ClusterIP

# Expose via NodePort (access from outside)
kubectl expose deployment mon-app --port=80 --target-port=3000 --type=NodePort

# Create a namespace
kubectl create namespace production

# Create a ConfigMap
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=info \
  --from-literal=DB_HOST=postgres.svc

# Create a Secret
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=motdepasse123

# Create a ConfigMap from a file
kubectl create configmap nginx-conf --from-file=nginx.conf
```

---

## 4. Modify — change what is running

```bash
# Scale a deployment (change the number of replicas)
kubectl scale deployment mon-app --replicas=5

# Update the image of a deployment (triggers a rolling update)
kubectl set image deployment/mon-app mon-app=nginx:1.26

# Edit a resource live (opens in the editor)
kubectl edit deployment mon-app

# Add a label to a pod
kubectl label pod mon-pod env=production

# Add an annotation
kubectl annotate deployment mon-app description="App principale"
```

---

## 5. Delete — clean up

```bash
# Delete a pod (will be recreated by the Deployment)
kubectl delete pod <nom-du-pod>

# Delete a deployment (also deletes the pods)
kubectl delete deployment mon-app

# Delete a service
kubectl delete svc mon-app-svc

# Delete via a YAML file
kubectl delete -f deployment.yaml

# Delete all resources in a namespace (DANGEROUS)
kubectl delete all --all -n staging
```

---

## 6. Debug — diagnose problems

```bash
# See the logs of a pod
kubectl logs <nom-du-pod>

# Logs in real time (follow)
kubectl logs -f <nom-du-pod>

# Logs of a specific container (if multi-container pod)
kubectl logs <nom-du-pod> -c <nom-du-conteneur>

# Logs of the last N lines
kubectl logs --tail=100 <nom-du-pod>

# Logs from the last X minutes
kubectl logs --since=5m <nom-du-pod>

# Enter a pod (like docker exec)
kubectl exec -it <nom-du-pod> -- bash

# If bash is not available (alpine/distroless images)
kubectl exec -it <nom-du-pod> -- sh
kubectl exec -it <nom-du-pod> -- /bin/sh

# Execute a command without entering the pod
kubectl exec <nom-du-pod> -- cat /etc/hostname

# Test network connectivity from a pod
kubectl exec <nom-du-pod> -- curl -s http://mon-service:80

# Launch a temporary pod for network debugging
kubectl run debug --image=busybox --rm -it --restart=Never -- sh

# Copy a file from/to a pod
kubectl cp <nom-du-pod>:/app/logs/error.log ./error.log
kubectl cp ./config.json <nom-du-pod>:/app/config.json
```

---

## 7. Rolling update and rollback

```bash
# See the deployment history
kubectl rollout history deployment/mon-app

# See the details of a revision
kubectl rollout history deployment/mon-app --revision=2

# Watch an ongoing rolling update
kubectl rollout status deployment/mon-app

# Cancel the last deployment (rollback)
kubectl rollout undo deployment/mon-app

# Go back to a specific revision
kubectl rollout undo deployment/mon-app --to-revision=2

# Pause a rolling update
kubectl rollout pause deployment/mon-app

# Resume a rolling update
kubectl rollout resume deployment/mon-app
```

---

## 8. Declarative — for production and CI/CD

```bash
# Apply a YAML file (creates or updates)
kubectl apply -f deployment.yaml

# Apply all files in a folder
kubectl apply -f ./k8s/

# See what will change BEFORE applying (dry-run)
kubectl apply -f deployment.yaml --dry-run=client

# Generate the YAML of a command without executing it (useful for creating templates)
kubectl create deployment mon-app --image=nginx:1.25 --dry-run=client -o yaml

# Export the YAML of an existing resource
kubectl get deployment mon-app -o yaml
```

---

## 9. Cluster information

```bash
# General cluster information
kubectl cluster-info

# Client and server version
kubectl version

# See available API resources (useful for knowing apiVersion)
kubectl api-resources

# See CPU/RAM usage of nodes
kubectl top nodes

# See CPU/RAM usage of pods
kubectl top pods

# See which context/cluster you are in
kubectl config current-context

# List all contexts
kubectl config get-contexts

# Switch context (switch cluster)
kubectl config use-context mon-autre-cluster
```

---

## Useful shortcuts

| Resource | Full name | Shorthand |
|---|---|---|
| pods | pods | `po` |
| services | services | `svc` |
| deployments | deployments | `deploy` |
| namespaces | namespaces | `ns` |
| configmaps | configmaps | `cm` |
| secrets | secrets | `secret` |
| nodes | nodes | `no` |
| replicasets | replicasets | `rs` |
| endpointslices | endpointslices | `eps` |

```bash
# Examples with shortcuts
kubectl get po -A          # all pods
kubectl get svc -n prod    # services of the prod namespace
kubectl get deploy         # deployments
kubectl get ns             # namespaces
kubectl get eps -l kubernetes.io/service-name=mon-service  # endpointslices
```

---

## Cheat sheet: the 10 daily commands

```bash
kubectl get pods -o wide          # 1. Where are my pods?
kubectl describe pod <nom>        # 2. Why is it not working?
kubectl logs -f <nom>             # 3. What is the app saying?
kubectl get events --sort-by='.lastTimestamp'  # 4. What happened?
kubectl get svc                   # 5. Are my services there?
kubectl get endpointslices -l kubernetes.io/service-name=<svc>  # 6. Does the service see the pods?
kubectl exec -it <pod> -- sh      # 7. Enter the pod
kubectl scale deploy <nom> --replicas=N  # 8. More/fewer pods
kubectl rollout status deploy/<nom>      # 9. Is the deployment done?
kubectl rollout undo deploy/<nom>        # 10. Something broke? Roll back
```
