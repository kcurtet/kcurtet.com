---
title: 'Un día roto, un lab entero: de GRUB sin kernels a homelab con dokku'
description: 'El portátil-staging se quedó sin kernels tras un pacman interrumpido y solo arrancaba en snapshots de solo lectura. Un día después, el mismo portátil es el servidor del homelab completo. Bitácora y todas las trampas cazadas en el camino.'
fecha: 2026-11-07
tags: [homelab, Docker, Dokku, btrfs, Tailscale, ufw]
---

<!-- REVISAR: post redactado a partir de las notas del día. Pásalo a tu voz antes de publicar. -->

Esta semana el homelab me dio dos lecciones en un solo día: la primera, que
un sistema puede estar roto de una forma que nadie te avisa; la segunda,
que "probar desde el propio host" no es probar.

## El portátil que solo arrancaba en snapshots

El staging del [homelab](https://github.com/kcurtet/homelab) es un portátil
CachyOS que está siempre encendido. Un día su `pacman -Syu` murió a mitad —
y se llevó por delante los kernels de `/boot` dejando la base de datos de
pacman *consistente*: el sistema seguía creyendo que el kernel estaba
instalado.

El síntoma era rarísimo: en GRUB, la entrada normal fallaba en silencio y
lo único arrancable era el submenú de snapshots, donde lo primero que ves
son filas de fechas en vez de las imágenes de kernel. Acabas siempre en un
[snapshot de solo lectura](/notas/grub-arranca-siempre-en-snapshot/) sin
darte cuenta: `/home` y los logs siguen siendo escribibles, así que todo
"funciona"… salvo pacman, nginx y cualquier cosa que toque la raíz.

Arreglarlo fue un chroot al subvolumen raíz real con tres gotchas:
el cache de pacman vive en un subvolumen aparte, `resolv.conf` es un
symlink a `/run`, y reinstalar "lo mismo que ya está instalado" es
exactamente lo que repone los ficheros perdidos.

## El mismo día: podman → docker, y por qué no era una preferencia

Los tres servicios que corrían en podman rootless (uptime-kuma, un nginx y
un dnsmasq para split-DNS de Tailscale) llevaban semanas fallando: un
restart-loop de 159 intentos (el puerto 80 no se puede bindear sin
privilegios), un dnsmasq que no podía bindear la IP de tailscale… Pasarlos
a docker rootful no fue estética: fue el fix.

El diseño que quedó:

- **traefik** como único edge en el `:80` — vhosts por labels, añadir un
  servicio son tres líneas.
- **dokku** para hosting: `git push` y a correr, cada app un contenedor
  plano detrás del mismo traefik.
- **watchtower jubilado** el mismo día que lo desplegué: su imagen lleva
  muerta desde 2022 y Docker 29 la rechaza. Un [timer de
  systemd](/notas/watchtower-roto-docker-29/) con `docker compose pull` hace
  el mismo trabajo sin contenedor extra.
- **AdGuard Home de pruebas**: DNS atado a la IP de la wifi, DHCP apagado,
  y solo los dispositivos que apunto a mano. La casa ni se entera.

## La trampa de ufw

La mejor del día: todo el lab funcionaba… probado desde el propio host. El
primer monitor DNS de kuma fallaba con ETIMEOUT y resultó que
[ufw llevaba bloqueando AdGuard para toda la LAN desde el
principio](/notas/ufw-bloquea-docker-red-host/). Los contenedores con puertos
publicados pasan por FORWARD y ufw no los toca; los de red host caen en
INPUT y el deny por defecto se los come. Y desde el host todo va por `lo`,
que siempre pasa — por eso las pruebas "funcionaban".

## Cómo quedó

En un día: kernels restaurados, edge con traefik, dokku desplegando con
`git push` (con su [overlay AUR arreglado](https://github.com/kcurtet/aur-dokku)
porque el oficial no compilaba), dashboard, backups con restic verificados
con restauración real, actualizaciones nocturnas con el edge protegido, CI
en el repo y kuma avisando por Telegram.

Lo que más me quedó: **un test solo vale desde fuera** — otro dispositivo,
otro contenedor, otro punto de vista. Todo lo demás es `lo` hablándote bonito.
