## Why Kubernetes exists

You have an app in a container. Easy. Now run **50 containers across 10 servers** —
and keep them alive at 3 a.m. when a machine dies. *That* is the problem
Kubernetes solves.

Without an orchestrator, you do all of this by hand:

- decide **which server** runs **which container** — and rebalance when one fills up
- restart containers that crash; reschedule them when a whole node dies
- ship a new version with **zero downtime**, and roll back when it breaks
- give containers stable names and **load-balance** traffic across them
- **scale up** under load, scale down to save money

> [!NOTE]
> Kubernetes (written **K8s** — "K", 8 letters, "s") is a **container orchestrator**:
> you declare the *desired state* of your system, and it works non-stop to make
> reality match.

That last sentence is the whole philosophy. You don't say *"start this container on
that server"*. You **declare** what you want — *"I want 3 copies of this app,
always"* — and Kubernetes figures out the how, and **keeps it true** even as
machines fail.

In the next steps you'll meet the machinery that makes this happen. **Continue →**
