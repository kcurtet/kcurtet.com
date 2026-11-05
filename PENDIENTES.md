# Pendientes

## Homelab: que el DNS de casa no dependa de mí

Contexto: Pi-hole hace de DNS **y** DHCP de toda la casa. Hoy el único plan B es el Wi-Fi de respaldo que no pasa por Pi-hole.
Cuando algo de esto esté montado → añadirlo a `src/content/proyectos/homelab.md` (solo lo que esté hecho de verdad) o escribir el post *"Cómo hice que el DNS de casa no dependa de mí"*.

### 0. Comprobar el plan B actual (5 min)
- [ ] Verificar que el Wi-Fi de respaldo reparte IPs desde el **router**, no desde Pi-hole. Si no, con la Raspberry apagada los equipos se quedan en 169.254.x.x y el plan B no sirve.
  - Prueba: apagar Pi-hole, conectar el móvil al Wi-Fi de respaldo, comprobar IP y que navega.

### 1. Enterarme antes que mi familia (≈30 min) — prioridad alta
- [ ] Uptime Kuma (torre o VPS) con monitor DNS contra el Pi-hole + aviso al móvil (Telegram o ntfy).
- [ ] Alternativa ligera: script en cron con `dig @<IP-pihole> google.com` que avise si falla (reutilizar estilo de `sysadmin-scripts/check-services.sh`).

### 2. Que se recupere solo (≈15 min) — prioridad alta
- [ ] Docker: `restart: unless-stopped` · o systemd: `Restart=always`.
- [ ] Activar el watchdog hardware de la Raspberry (reinicia si se cuelga).

### 3. Quitar la causa más habitual: la tarjeta SD
- [ ] Arrancar la Raspberry desde SSD por USB, o al menos `log2ram` para reducir escrituras.
- [ ] Backup periódico de la configuración con **Teleporter** (exportación de Pi-hole) → al disco USB de backups.
- [ ] Probar una restauración una vez (un backup sin probar no es un backup).

### 4. Segundo Pi-hole — la solución de verdad
- [ ] Segunda instancia en un equipo siempre encendido (contenedor en la torre si no se apaga).
- [ ] Sincronizar con **nebula-sync** (Pi-hole v6; Gravity Sync está abandonado).
- [ ] Anunciar los dos DNS por DHCP. Probar apagando el principal.

### 5. Alta disponibilidad con IP virtual — para aprender
- [ ] keepalived (VRRP) entre los dos Pi-hole compartiendo una IP.
- [ ] Usarlo en la serie de AD: mismo concepto que tener dos controladores de dominio.

**No hacer:** poner `1.1.1.1` como DNS secundario en el DHCP. Los clientes alternan entre DNS a su criterio y se cuela la publicidad.

## Web

- [ ] Revisar y pasar a mi voz los ficheros con `<!-- REVISAR -->` (homelab, post de AD).
- [ ] Revisar el francés de `src/pages/fr/a-propos.astro`.
- [ ] Decidir si el CV público (`public/cv/`) lleva el teléfono o hago una versión sin él.
- [ ] Opcional: añadir hardware concreto y captura de Pi-hole al caso del homelab.
- [ ] Explicar en una frase cómo está montado el Wi-Fi de respaldo (lo preguntarán en entrevista).
- [ ] Primer commit + crear repo `kcurtet/kcurtet.com` en GitHub.
- [ ] Cloudflare Pages: build `npm run build`, salida `dist`, `NODE_VERSION=22`, dominio `kcurtet.com`.
- [ ] Enlazar la web desde LinkedIn, el README de GitHub y el CV.
- [ ] Ritmo: 1 post o nota por semana (serie de AD), sin quitar tiempo a las candidaturas.
