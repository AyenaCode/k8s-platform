#!/bin/sh
# App entrypoint. Because the app shares k3s's network namespace
# (network_mode: service:k3s), the kubeconfig's 127.0.0.1:6443 server address
# works as-is, no rewrite needed. We just wait until k3s has written the
# kubeconfig and the node is Ready, then hand off to the Go server (which also
# spawns the learner's PTY terminal, inheriting KUBECONFIG).
set -e

echo "[entrypoint] waiting for kubeconfig at $KUBECONFIG ..."
i=0
until [ -f "$KUBECONFIG" ]; do
  i=$((i + 1))
  if [ "$i" -gt 120 ]; then
    echo "[entrypoint] kubeconfig never appeared after 120s: is the k3s service healthy?"
    exit 1
  fi
  sleep 1
done

echo "[entrypoint] waiting for the cluster node to be Ready ..."
i=0
until kubectl get nodes 2>/dev/null | grep -q ' Ready'; do
  i=$((i + 1))
  if [ "$i" -gt 120 ]; then
    echo "[entrypoint] node never became Ready: continuing anyway, the terminal still works."
    break
  fi
  sleep 2
done

echo "[entrypoint] cluster is up, starting the lab server on $ADDR"
exec /app/server
