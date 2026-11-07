---
title: "Watchtower deja de actualizar: \"client version 1.25 is too old\" con Docker 29"
categoria: Docker
sintoma: "el contenedor watchtower (containrrr/watchtower) entra en crash-loop con «Error response from daemon: client version 1.25 is too old. Minimum supported API version is 1.40». Ninguna imagen se actualiza y los logs se llenan del mismo error cada ciclo."
fecha: 2026-11-07
---
## Diagnóstico

La imagen `containrrr/watchtower` lleva **sin publicarse desde 2022** y su
cliente de la API de Docker habla la versión 1.25. Docker 29 eliminó el
soporte de versiones de API tan antiguas → el contenedor arranca, intenta
listar contenedores y el daemon lo rechaza.

```bash
sudo docker logs watchtower | tail -3
# level=error msg="Error response from daemon: client version 1.25 is too old..."
```

## Solución

Fuera watchtower; un timer de systemd con `docker compose` hace el mismo
trabajo sin contenedor extra y con control total:

```bash
#!/usr/bin/env bash
# update.sh — actualizar todos los stacks compose + apps dokku
while IFS= read -r compose_file; do
  dir="$(dirname "$compose_file")"
  (cd "$dir" && docker compose pull --quiet --ignore-buildable \
    && docker compose up -d --remove-orphans)
done < <(find ~/dev/homelab -name docker-compose.yml -not -path "*/data/*")

command -v dokku >/dev/null && sudo -n dokku ps:rebuild --all >/dev/null
docker image prune --force >/dev/null
```

Con dos refinos que watchtower no daba:

- **`update.skip`**: lista de servicios que el ciclo nocturno NO toca (el
  reverse proxy de entrada se actualiza a mano — que un breaking change de
  traefik no tire el lab a las 04:00 sin nadie delante).
- **Solo stacks desplegados**: si un stack está caído o inerte (sin token de
  Cloudflare, por ejemplo), se salta — si no, el timer lo "levanta" y lo
  mete en un crash-loop.

```ini
# homelab-update.timer
[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true
```

## Moraleja

Antes de echarle un contenedor perpetuo a una tarea, comprueba si el
sistema de unidades ya lo resuelve: un `Type=oneshot` + timer es
revisable, loguea al journal y no añade superficie de ataque ni imágenes
muertas al daemon.
