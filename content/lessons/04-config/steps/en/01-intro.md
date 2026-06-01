## Why ConfigMaps & Secrets?

A good container image is **the same everywhere** — dev, staging, prod. What
changes between environments is *configuration*: a log level, a database URL, an
API key. If you bake those into the image, you need a new image for every
environment. That is the wrong way.

Kubernetes gives you two objects to keep config **outside** the image:

- **ConfigMap** — non-sensitive settings (log level, feature flags, URLs).
- **Secret** — sensitive values (passwords, tokens, keys). Same idea, but stored
  and handled a little more carefully.

Both can be consumed by a Pod in two ways:

| Way | Looks like inside the container |
|---|---|
| **Environment variables** | `echo $LOG_LEVEL` |
| **Mounted files** | `cat /etc/config/log_level` |

> **Key idea:** the image stays generic; the cluster injects the right config at
> run time. Change the config, restart the Pod, done — no rebuild.

In this lesson you will create a ConfigMap, feed it to a Pod as env vars, then do
the same with a Secret mounted as a file. Hit **Next**. →
