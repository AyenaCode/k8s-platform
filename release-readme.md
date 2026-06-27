# K8s Lab — managing your install

This folder (`~/.k8s-lab`, or `%USERPROFILE%\.k8s-lab` on Windows) is your
running copy of the **K8s Lab**: a self-hosted, interactive lab to learn
Kubernetes by doing. **The only thing you need installed is Docker.**

It was set up by the one-line installer, which also put a `klab` command on your
PATH. You manage everything with **`klab`** — from any directory, you never need
to `cd` into this folder.

```bash
klab help        # list every command (also: klab -h)
```

---

## Start the lab

```bash
klab run
```

`klab run` starts the lab **in the background** and prints the URL, then opens
your browser. The cluster (k3s) takes ~30 seconds to become ready on the
**first** boot, so the page may be blank for a moment.

Don't want it to open the browser, or want a different delay?

```bash
KLAB_BROWSER_DELAY=0 klab run     # open immediately (0 = no wait)
```

To just print the URL (e.g. the port the installer picked if 8088 was busy):

```bash
klab url
```

---

## Everyday commands

```bash
klab status        # what's running
klab logs          # follow the app logs (Ctrl-C stops WATCHING, not the lab)
klab shell         # open a shell in the lab (same as the in-app terminal)

klab stop          # stop the lab          (keeps your progress + cluster)
klab run           # start it again (background)
klab restart       # recreate fresh containers (keeps progress + cluster)
```

Because `klab run` runs in the background, closing your terminal never stops the
lab. Use `klab stop` for that.

### Reset your practice cluster (keep your XP / progress)

```bash
klab reset
```

### Start fresh — wipe containers + data (keeps the install)

```bash
klab clean         # removes containers + volumes (progress + cluster), then:
klab run
```

---

## Update to the latest version

```bash
klab update
```

`klab update` self-updates the `klab` command, re-downloads the lab files, pulls
the newest image, and removes the old containers (your progress + cluster data
are kept). When it's done, start the new version with `klab run`.

To pin a specific version instead, edit `.env` (see below), set
`LAB_IMAGE=ghcr.io/ayenacode/k8s-platform:1.2.0`, then run `klab run`.

---

## Configuration — the `.env` file

The installer wrote a `.env` in this folder. Compose reads it automatically, so
your image and ports stay consistent every time.

| Variable | What it does | Default |
|---|---|---|
| `LAB_IMAGE` | which app image to run | `ghcr.io/ayenacode/k8s-platform:latest` |
| `LAB_PORT` | host port for the lab UI | `8088` |
| `LAB_API_PORT` | host port for the Kubernetes API (only needed if you run `kubectl` from your own machine) | `6443` |

After changing `.env`, apply it with `klab restart`.

---

## Troubleshooting

- **"port is already allocated"** — another program uses that port. Edit `.env`,
  change `LAB_PORT` and/or `LAB_API_PORT` to a free value, then `klab restart`.
- **The page doesn't load yet** — give k3s ~30s on first boot, then watch
  `klab logs`.
- **Something looks stuck** — `klab restart` recreates the containers without
  touching your progress.
- **Start over from zero** — `klab clean` then `klab run`.

---

## Uninstall

```bash
klab uninstall     # removes containers, volumes, all the lab's images,
                   # this folder, AND the klab command — everything.
```

For a lighter reset that keeps the install (so the next `klab run` is fast), use
`klab clean` instead.

---

## Need help?

Found a bug, stuck, or have an idea? Contact:

**📧 ayenacode1@gmail.com**

Project: https://github.com/AyenaCode/k8s-platform — issues and contributions welcome.
