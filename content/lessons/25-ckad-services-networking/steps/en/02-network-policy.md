## Allow only the frontend to reach the API

NetworkPolicy is label logic. Select the target Pods, then describe which sources
may reach them.

### Your task

In namespace **`ckad-net`**:

1. Create Deployment `api`, image `nginx:1.27`, label `app=api`.
2. Create Pod `frontend`, image `busybox:1.36`, label `app=frontend`, command `sleep 3600`.
3. Create NetworkPolicy **`api-allow-frontend`**:
   - `podSelector`: `app=api`
   - `policyTypes`: `Ingress`
   - allow ingress from Pods with `app=frontend`
   - only TCP port `80`

The verifier checks the policy spec and that both workloads exist.
