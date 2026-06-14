## Migrate a deprecated API manifest

Click **Prepare**. It creates a working backend Service and writes an obsolete
Ingress manifest to **`/root/ckad-deprecated-ingress.yaml`**.

### Your task

Edit that file so it uses the current Ingress API:

- `apiVersion: networking.k8s.io/v1`
- `kind: Ingress`
- namespace: `ckad-observe`
- name: `legacy-ing`
- `pathType: Prefix`
- backend service name: `legacy-web`
- backend service port number: `80`

Then apply it:

```bash
vi /root/ckad-deprecated-ingress.yaml
kubectl apply -f /root/ckad-deprecated-ingress.yaml
kubectl get ingress legacy-ing -n ckad-observe -o yaml
```

Verify checks the live Ingress object.
