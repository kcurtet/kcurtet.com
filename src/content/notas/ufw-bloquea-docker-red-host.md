---
title: "ufw bloquea los servicios Docker con red host (y no lo ves probando desde el propio host)"
categoria: Docker
sintoma: "un contenedor con network_mode: host (p. ej. AdGuard Home en el puerto 53 y su UI en el 3000) funciona probándolo desde el propio host, pero desde cualquier otro dispositivo de la LAN hace timeout. También fallan otros contenedores que intentan alcanzar la IP del host (un monitor DNS de Uptime Kuma da ETIMEOUT)."
fecha: 2026-11-07
---
## Diagnóstico

Dos caminos distintos y dos reglas distintas:

- **Contenedores en bridge con puertos publicados** (traefik `:80`, dnsmasq
  en la IP de tailscale): el tráfico pasa por DNAT y las cadenas
  FORWARD/DOCKER — la política INPUT de ufw **nunca lo ve**. Funcionan
  siempre.
- **Contenedores con `network_mode: host`**: sus puertos viven en la pila
  del host → cadena INPUT → **DROP por defecto de ufw**. Bloqueados para la
  LAN y para otros contenedores que llamen a la IP del host.

La trampa: desde el propio host las pruebas van por la interfaz `lo`, que
ufw permite → todo parece funcionar hasta que pruebas desde otro
dispositivo o desde dentro de un contenedor:

```bash
sudo ufw status | head -3     # "Status: active" + política deny incoming
sudo iptables -L INPUT -n | head -2   # "Chain INPUT (policy DROP)"

# reproducir el fallo desde un contenedor (lo que hace kuma):
sudo docker exec uptime-kuma node -e \
  'const d=new (require("dns").Resolver)();d.setServers(["192.168.1.100"]);
   d.resolve4("kuma.int.ntux.link",(e,a)=>console.log(e?"ERR "+e.code:a))'
# ERR ETIMEOUT
```

## Solución

Allows explícitos para los servicios host-network, por origen:

```bash
sudo ufw allow from 192.168.1.0/24 to any port 53 proto tcp comment 'AdGuard DNS LAN'
sudo ufw allow from 192.168.1.0/24 to any port 53 proto udp comment 'AdGuard DNS LAN'
sudo ufw allow from 172.16.0.0/12 to any port 53 comment 'DNS host desde docker'
sudo ufw allow from 192.168.1.0/24 to any port 3000 proto tcp comment 'AdGuard UI LAN'
```

Tras las reglas, el mismo comando del contenedor resuelve la IP — y los
dispositivos de la LAN ven el servicio por primera vez (llevaba
silenciosamente bloqueado desde el despliegue).

## Moraleja

Con ufw en deny incoming, cualquier cosa que escuche en el host (red host o
servicios nativos) necesita su allow — y probarla solo desde el host no
cuenta: `lo` siempre pasa. Probar desde otro dispositivo o desde un
contenedor es lo único que demuestra que el puerto está abierto.
