## Harden a Pod security context

SecurityContext tasks are exact-field tasks. Be careful whether a field belongs
to the Pod security context or the container security context.

### Your task

Create Pod **`hardened`** in namespace **`ckad-sec`**:

- image: `nginxinc/nginx-unprivileged:1.27`
- Pod security context:
  - `runAsNonRoot: true`
  - `seccompProfile.type: RuntimeDefault`
- container security context:
  - `allowPrivilegeEscalation: false`
  - drop capability `ALL`

The unprivileged nginx image listens on port `8080`, so it can run without root.
