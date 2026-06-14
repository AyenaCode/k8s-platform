## Train for the public CKAD format

CKAD is a practical Kubernetes application-developer exam. Public Linux
Foundation material says the exam is online, proctored, performance-based, and
made of command-line tasks solved in a Kubernetes environment. The public exam
duration is **2 hours** and the listed software version is **Kubernetes v1.35**.

This track follows the public curriculum weights:

| Domain | Weight |
|---|---:|
| Application Design and Build | 20% |
| Application Deployment | 20% |
| Application Observability and Maintenance | 15% |
| Application Environment, Configuration and Security | 25% |
| Services and Networking | 20% |

The exercises here are **original drills**, not leaked or copied exam questions.
They are written to behave like exam work: clear objective, live cluster, strict
resource names, and automatic verification.

### Your target habit

For every task:

1. Read the exact resource names and namespace.
2. Create the fastest valid YAML or imperative command.
3. Verify with `kubectl get`, `kubectl describe`, `kubectl logs`, `kubectl auth can-i`, or `curl`.
4. Only then hit **Verify**.

Speed matters, but clean validation matters more.
