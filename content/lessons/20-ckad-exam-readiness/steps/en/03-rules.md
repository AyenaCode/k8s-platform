## Train with the same constraints

Use this CKAD section with exam discipline:

- Work from the terminal and the built-in Kubernetes/Helm documentation.
- Avoid external search while solving a task.
- Keep your own scratch notes short.
- Prefer `kubectl create ... --dry-run=client -o yaml` when a manifest is faster
  than hand-writing everything.
- Use exact namespaces. Many failed CKAD tasks are correct YAML applied to the
  wrong namespace.
- Before moving on, run a final `kubectl get` or `kubectl describe` that proves
  the objective is true.

The remaining modules cover every public CKAD domain. Treat each **Verify** as
the grader: it checks the cluster state, not your intentions.
