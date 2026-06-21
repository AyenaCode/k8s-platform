# K8s Lab — managing your local install

This folder (`~/.k8s-lab`, or `%USERPROFILE%\.k8s-lab` on Windows) is your
running copy of the **K8s Lab**: a self-hosted, interactive lab to learn
Kubernetes by doing. **The only thing you need installed is Docker.**

It was set up by the one-line installer. Everything here is managed with plain
`docker compose` commands — **run them from inside this folder.**

> If your Docker is older and `docker compose` (with a space) doesn't work, use
> `docker-compose` (with a hyphen) instead.

---

## Open the lab

Open the URL printed by the installer. By default it is **http://localhost:8088**,
but if that port was busy the installer picked another one (e.g. 8089).

To check which port you're on:

```bash
grep LAB_PORT .env        # the app port chosen at install time
docker compose ps         # shows the published ports
```

The cluster (k3s) takes ~30 seconds to become ready on the **first** boot.

---

## Everyday commands

```bash
docker compose ps               # what's running
docker compose logs -f app      # follow the app logs (Ctrl-C to stop watching)

docker compose stop             # stop the lab        (keeps your progress + cluster)
docker compose up -d            # start it again
docker compose restart app      # restart just the app

docker compose exec app bash    # open a shell in the lab (same as the in-app terminal)
```

### Reset your practice cluster (keep your XP/progress)

```bash
docker compose exec app bash /app/content/reset.sh
```

### Wipe everything and start fresh (deletes progress + cluster data)

```bash
docker compose down -v
docker compose up -d
```

---

## Update to the latest version

```bash
docker compose pull             # fetch the newest image
docker compose up -d            # recreate the app with it
```

To pin a specific version instead, edit `.env` and set, for example:

```
LAB_IMAGE=ghcr.io/ayenacode/k8s-platform:1.2.0
```

then run `docker compose up -d`.

---

## Configuration — the `.env` file

The installer wrote a `.env` in this folder. Docker Compose reads it
automatically, so your image and ports stay consistent every time.

| Variable | What it does | Default |
|---|---|---|
| `LAB_IMAGE` | which app image to run | `ghcr.io/ayenacode/k8s-platform:latest` |
| `LAB_PORT` | host port for the lab UI | `8088` |
| `LAB_API_PORT` | host port for the Kubernetes API (only needed if you run `kubectl` from your own machine) | `6443` |

After changing `.env`, apply it with `docker compose up -d`.

---

## Troubleshooting

- **"port is already allocated"** — another program (or another cluster) uses
  that port. Edit `.env`, change `LAB_PORT` and/or `LAB_API_PORT` to a free
  value, then `docker compose up -d`.
- **The page doesn't load yet** — give k3s ~30s on first boot, then check
  `docker compose logs -f app`.
- **Start over from zero** — `docker compose down -v` then `docker compose up -d`.

---

## Uninstall

```bash
docker compose down -v          # remove containers + all data
cd .. && rm -rf ~/.k8s-lab      # remove this folder
```

---

## Need help?

Found a bug, stuck, or have an idea? Contact:

**📧 ayenacode1@gmail.com**

Project: https://github.com/AyenaCode/k8s-platform — issues and contributions welcome.
