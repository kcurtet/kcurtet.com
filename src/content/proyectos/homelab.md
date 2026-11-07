---
title: Homelab y red de casa
resumen: Empezó para quitarle la publicidad a mi familia y acabó siendo donde enseño webs a clientes, me conecto a mis equipos y guardo copias. Ahora lo estoy reconstruyendo para que no dependa de mí.
stack: [AdGuard Home, Tailscale, Docker, Dokku, Coolify, Cloudflare Tunnel, Let's Encrypt, restic]
orden: 1
---

## Por qué empecé

En casa somos tres: mi madre, mi hermano y yo. Yo podía bloquear la publicidad en mi navegador, pero ellos no, y no iba a ir instalando extensiones dispositivo por dispositivo, sobre todo en móviles y en la tele, donde ni siquiera se puede.

Así que lo resolví a nivel de red: monté **AdGuard Home** y lo convertí en el DNS de toda la casa. Para que todos los dispositivos lo usaran sin configurar nada, le di también el **DHCP**: desactivé el del router y AdGuard Home pasó a repartir las IPs y a anunciarse como DNS. Mi madre y mi hermano no tuvieron que hacer nada; simplemente dejaron de ver anuncios.

## El fallo de diseño

Esa decisión tenía una consecuencia: **en mi casa, yo era el helpdesk**. Si AdGuard Home se caía, para ellos "no iba Internet", aunque la conexión funcionara perfectamente. Es exactamente el síntoma de [Hay Internet pero no se resuelven nombres](/notas/dns-no-resuelve/).

Y no tenía plan B. Si yo no estaba, se quedaban sin Internet hasta que volviera. Había convertido una Raspberry Pi en un **punto único de fallo** para toda la casa. Funcionaba, pero no estaba bien diseñado.

## Conectarme a casa desde cualquier sitio

Con **Tailscale** todos mis equipos están en una misma red privada, estén donde estén, sin abrir un solo puerto en el router. Desde fuera puedo entrar a mi **torre** y, desde ella, saltar a lo que necesite de la red de casa o consultar mis archivos.

## Enseñar trabajo a clientes

El homelab también trabaja para [Nutux Labs](https://nutuxlabs.com). Lo he usado para alojar webs temporales y personales con **Dokku** y **Coolify** (despliegue con `git push`, cada web en su contenedor), publicadas con **Cloudflare Tunnel** sin exponer mi IP.

Lo mejor que me ha dado: a una clienta le preparé **varias versiones de su web** y se las enseñé desde mi propio servidor. Pudo verlas, elegir la que más le gustaba e incluso **combinar partes de varias**. Fue mucho más ágil que ir y venir con capturas y cambios.

## HTTPS: de mi propia CA a Let's Encrypt

Para algunas webs personales que solo quería ver yo, al principio monté **mi propia autoridad de certificación**: generaba los certificados yo mismo e instalaba la CA en mi móvil para que el navegador confiara en ellos. Funcionaba, y me sirvió para entender cómo funciona la cadena de confianza de un certificado.

Pero cada dispositivo nuevo era instalar la CA otra vez. Al final me pasé a **Let's Encrypt**: certificados de confianza pública que se renuevan solos. Es la opción práctica; la CA propia fue la que me enseñó por qué.

## Ahora: reconstruirlo bien

Estoy rehaciendo todo el homelab en una **Raspberry Pi 5 con SSD**, esta vez de forma reproducible: cada parte es un Docker Compose con su guía paso a paso, en un [repositorio público](https://github.com/kcurtet/homelab). Lo que cambia:

- **Failover de DNS automático.** El DHCP de AdGuard Home anunciará dos DNS: AdGuard Home como primario y el router como secundario. Si AdGuard Home cae, los dispositivos pasan solos al router: vuelven los anuncios, pero nadie se queda sin Internet ni tiene que esperarme. El coste lo acepto: algunos dispositivos consultan a veces el secundario aunque todo funcione, y se cuela algo de publicidad.
- **Migración del DHCP con plan de vuelta atrás.** Primero compruebo el DNS del router, luego activo el DHCP de AdGuard Home, después apago el del router y verifico dispositivo por dispositivo. Si algo falla, hay un procedimiento para volver al estado anterior.
- **Copias con restic** a un disco USB viejo, programadas cada noche, y con la **restauración probada**: un backup que no has restaurado nunca no es un backup.

Estado: lo estoy probando en un portátil. La red de casa todavía no la he tocado; ahora mismo el DNS y el DHCP los da el router, y el AdGuard Home solo vuelve cuando el failover esté verificado en la Raspberry.

## Qué me ha enseñado

- **El DNS es un punto único de fallo, y hay que diseñar para cuando falle.** La primera vez no lo hice; ahora el diseño parte de ahí.
- **DHCP y DNS van juntos.** Saber quién reparte qué IP y qué DNS anuncia es la mitad del diagnóstico de cualquier red.
- **Abrir puertos es el último recurso.** Con una VPN de malla y túneles casi nunca hace falta.
- **Entender lo complicado para elegir lo práctico.** La CA propia me enseñó cómo funcionan los certificados; por eso sé por qué Let's Encrypt es la buena opción.

Todo esto es la base para lo que estoy aprendiendo ahora: en Active Directory, [el DNS es el corazón del dominio](/blog/de-linux-a-active-directory/).

## ¿Quieres montarlo tú?

Todo está en [github.com/kcurtet/homelab](https://github.com/kcurtet/homelab): los Docker Compose de cada fase y las guías de instalación, migración del DHCP y restauración de copias.
