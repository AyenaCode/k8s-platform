## Why Kubernetes exists

You have an app in a container. Easy. Now run **50 containers across 10 servers**
and keep them alive at 3 a.m. when a machine dies. That is the problem
Kubernetes solves.

Without an orchestrator you do all of this by hand:

- decide which server runs which container; rebalance when one fills up
- restart containers that crash; reschedule them when a whole node dies
- ship a new version with zero downtime, and roll back when it breaks

> [!NOTE]
> Kubernetes (written **K8s**: "K", 8 letters, "s") is a **container orchestrator**.
> You declare the *desired state* of your system, and it works non-stop to make
> reality match.

You don't say "start this container on that server". You **declare** what you want
("I want 3 copies of this app, always") and Kubernetes figures out the how, and
**keeps it true** even as machines fail.

In the next steps you will meet the machinery that makes this happen. **Continue →**

📖 Docs: [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/quick-reference/)
