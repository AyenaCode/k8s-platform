## Service discovery (DNS)

This is how microservices find each other. Every Service gets an automatic DNS
name from the cluster's CoreDNS:

```
<service>.<namespace>.svc.cluster.local
```

Within the **same namespace**, the short name is enough — just `web`.

Try it from a throwaway Pod:

```bash
kubectl run tmp --rm -it --image=busybox --restart=Never -- \
  wget -qO- http://web
# prints the nginx HTML — resolved "web" by DNS, load-balanced to a Pod
```

From a **different** namespace you'd use the longer form:

```bash
wget -qO- http://web.default.svc.cluster.local
```

> **Mental model:** code never hardcodes Pod IPs. It calls the *Service name*
> (`http://web`, `http://payments`, …) and Kubernetes' DNS + load balancing does
> the rest. This is the backbone of every microservice architecture on K8s.

You now know the three things that make networking work on Kubernetes: **Services**
(stable identity), **endpoints** (the live Pods behind them), and **DNS**
(discovery). That completes the fundamentals trilogy — well done! 🎉

This step is conceptual — hit **Next**/finish when you've seen the DNS lookup work.
