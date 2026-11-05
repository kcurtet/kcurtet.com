---
title: Homelab y red de casa
resumen: Empezó para quitarle la publicidad a mi familia y hoy es donde enseño webs a clientes, me conecto a mis equipos desde cualquier sitio y guardo las copias de seguridad.
stack: [Pi-hole, Tailscale, Wake-on-LAN, Docker, Dokku, Coolify, Cloudflare Tunnel, Let's Encrypt]
orden: 1
---

<!-- REVISAR: si quieres, añade el hardware concreto (modelo de la Raspberry, la torre, el disco de backups) y una captura del panel de Pi-hole. -->

## Por qué empecé

En casa somos tres: mi madre, mi hermano y yo. Yo podía bloquear la publicidad en mi navegador, pero ellos no, y no iba a ir instalando extensiones dispositivo por dispositivo, sobre todo en móviles y en la tele, donde ni siquiera se puede.

Así que lo resolví a nivel de red: monté un **Pi-hole** y lo convertí en el DNS de toda la casa. Para que todos los dispositivos lo usaran sin configurar nada, le di también el **DHCP**: desactivé el del router y ahora es Pi-hole quien reparte las IPs y se anuncia como DNS. Mi madre y mi hermano no tuvieron que hacer nada; simplemente dejaron de ver anuncios.

Esa decisión tiene una consecuencia que siempre tengo presente: **en mi casa, yo soy el helpdesk**. Si el Pi-hole se cae, para ellos "no va Internet", aunque la conexión funcione perfectamente. Es exactamente el síntoma de [Hay Internet pero no se resuelven nombres](/notas/dns-no-resuelve/).

Y el helpdesk no siempre está en casa. Por eso dejé un **plan B que no depende de mí**: un segundo Wi-Fi que da acceso a la misma red pero no pasa por el Pi-hole. Si algo falla cuando no estoy, mi madre o mi hermano solo tienen que conectarse a ese otro Wi-Fi y siguen con Internet (con anuncios, eso sí) hasta que vuelva y lo arregle.

## Conectarme a casa desde cualquier sitio

Con **Tailscale** todos mis equipos están en una misma red privada, estén donde estén, sin abrir un solo puerto en el router. Desde fuera puedo:

- entrar a mi **torre** y, desde ella, saltar a lo que necesite de la red de casa;
- **despertar el portátil con Wake-on-LAN** si está apagado y conectarme a él;
- consultar mis archivos de casa en cualquier momento.

## Enseñar trabajo a clientes

El homelab también trabaja para [Nutux Labs](https://nutuxlabs.com). Lo uso para alojar webs temporales y personales con **Dokku** y **Coolify** (despliegue con `git push`, cada web en su contenedor), y las publico con **Cloudflare Tunnel** sin exponer mi IP.

Lo mejor que me ha dado: a una clienta le preparé **varias versiones de su web** y se las enseñé desde mi propio servidor. Pudo verlas, elegir la que más le gustaba e incluso **combinar partes de varias**. Fue mucho más ágil que ir y venir con capturas y cambios.

## HTTPS: de mi propia CA a Let's Encrypt

Para algunas webs personales que solo quería ver yo, al principio monté **mi propia autoridad de certificación**: generaba los certificados yo mismo e instalaba la CA en mi móvil para que el navegador confiara en ellos. Funcionaba, y me sirvió para entender cómo funciona la cadena de confianza de un certificado.

Pero cada dispositivo nuevo era instalar la CA otra vez. Al final me pasé a **Let's Encrypt**: certificados de confianza pública que se renuevan solos. Es la opción práctica; la CA propia fue la que me enseñó por qué.

## Copias de seguridad

Lo último que añadí: **backups a un disco duro viejo conectado por USB**. Un disco que ya no usaba ahora guarda las copias de lo que no quiero perder.

## Qué me ha enseñado

- **El DNS es un punto único de fallo, y hay que diseñar para cuando falle.** Si centralizas el DNS, todos dependen de él; por eso existe el Wi-Fi de respaldo, y por eso tiene que poder usarlo alguien que no sabe qué es un DNS.
- **DHCP y DNS van juntos.** Saber quién reparte qué IP y qué DNS anuncia es la mitad del diagnóstico de cualquier red.
- **Abrir puertos es el último recurso.** Con una VPN de malla y túneles casi nunca hace falta.
- **Entender lo complicado para elegir lo práctico.** La CA propia me enseñó cómo funcionan los certificados; por eso sé por qué Let's Encrypt es la buena opción.

Todo esto es la base para lo que estoy aprendiendo ahora: en Active Directory, [el DNS es el corazón del dominio](/blog/de-linux-a-active-directory/).
