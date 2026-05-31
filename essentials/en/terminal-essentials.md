# Terminal — Commands to type without thinking

## Exam setup (do this FIRST on every session)

```bash
alias k=kubectl
export do='--dry-run=client -o yaml'
export now='--grace-period=0 --force'
source <(kubectl completion bash)
complete -F __start_kubectl k
```

## Context

```bash
k config get-contexts
k config use-context <name>
k config current-context
```

## Inspect

```bash
k get pods -A                                          # all namespaces
k get pods -n <ns> -o wide                             # with IP and node
k get all -n <ns>                                      # everything in a namespace
k describe pod <pod> -n <ns>                           # details + events
k logs <pod> -n <ns>                                   # logs
k logs <pod> -n <ns> --previous                        # logs from the previous container (crash)
k get events -n <ns> --sort-by=.metadata.creationTimestamp
```

## Create (always imperative first)

```bash
k run <pod> --image=nginx --port=80 $do > pod.yaml
k create deploy <name> --image=nginx --replicas=3 $do > deploy.yaml
k create ns <name>
k create cm <name> --from-literal=KEY=value
k create secret generic <name> --from-literal=KEY=value
k expose deploy <name> --port=80 --target-port=8080 --name=<svc>
k create sa <name> -n <ns>
```

## Modify

```bash
k edit deploy <name> -n <ns>
k set image deploy/<name> <container>=nginx:1.26
k scale deploy <name> --replicas=5
k label pod <pod> env=prod
k annotate pod <pod> description="test"
```

## Rollout

```bash
k rollout status deploy/<name>
k rollout history deploy/<name>
k rollout undo deploy/<name>
k rollout undo deploy/<name> --to-revision=2
```

## Debug

```bash
k exec -it <pod> -- bash
k exec -it <pod> -c <container> -- sh          # multi-container
k cp <pod>:/etc/config ./config                # copy a file
k port-forward svc/<name> 8080:80 -n <ns>
k auth can-i create pods --as=<user> -n <ns>
```

## Nodes

```bash
k get nodes -o wide
k cordon <node>          # prevent new pods from being scheduled
k drain <node> --ignore-daemonsets --delete-emptydir-data
k uncordon <node>
k top node
k top pod -n <ns>
```

## Static pods (control plane)

```bash
# Manifest files on the node:
ls /etc/kubernetes/manifests/
# Modify a broken component:
vi /etc/kubernetes/manifests/kube-scheduler.yaml
```

## RBAC

```bash
k create role <name> --verb=get,list --resource=pods -n <ns>
k create rolebinding <name> --role=<role> --user=<user> -n <ns>
k create clusterrole <name> --verb=get,list --resource=pods
k create clusterrolebinding <name> --clusterrole=<role> --user=<user>
k auth can-i list pods --as=<user> -n <ns>
```

## Resource shortcuts

```
po   → pods
deploy → deployments
svc  → services
cm   → configmaps
sa   → serviceaccounts
ns   → namespaces
pv   → persistentvolumes
pvc  → persistentvolumeclaims
no   → nodes
```
