---
title: 'De Linux a Active Directory: empiezo una serie'
description: Llevo años en Linux y nunca he administrado un dominio Windows. Voy a aprender Active Directory en público, anclando cada concepto a algo que ya conozco.
fecha: 2026-11-05
serie: De Linux a Active Directory
tags: [Active Directory, Windows, DNS, soporte]
---

<!-- REVISAR: este post lo he redactado a partir de tus notas. Cámbialo a tu voz antes de publicar. -->

Uso Linux a diario desde hace años: mi portátil corre NixOS, tengo un homelab con contenedores y la red de casa la gobierna un AdGuard Home. Pero hay un mundo que casi no he tocado y que sostiene casi todas las oficinas: **Windows con Active Directory**.

En soporte IT es el pan de cada día: desbloquear cuentas, resetear contraseñas, unir equipos al dominio, entender por qué no se aplica una GPO o por qué alguien no ve una carpeta compartida. Así que voy a aprenderlo, y a contarlo aquí mientras lo hago.

## Por qué en público

- Explicar algo es la mejor manera de comprobar si lo entiendo.
- Quien venga de Linux encontrará pocas guías que le hablen en su idioma.
- Y, sinceramente, es una forma de enseñar cómo aprendo y cómo razono a quien esté pensando en contratarme.

## El enfoque: anclar cada concepto a algo conocido

| En AD | Lo que ya conozco |
| --- | --- |
| Controlador de dominio (DC) | Un servidor LDAP + Kerberos + DNS, todo en uno |
| Registros SRV | Lo mismo que `_sip._tcp` o un MX: un servicio que se anuncia por DNS |
| GPO | Configuración declarativa impuesta, como mi [configuración de NixOS](/proyectos/nixos/) |
| Unir un equipo al dominio | Pasar de cuentas locales en `/etc/passwd` a autenticación central |
| RSAT | Las herramientas de administración en tu PC, como tener `ldapsearch` y `ssh` |

## Lo que viene

1. Qué es un dominio y qué problema resuelve.
2. Anatomía: bosque, dominio, OU y DC.
3. Usuarios y grupos: lo que más hace un helpdesk.
4. Unir equipos al dominio y cuando se rompe la confianza.
5. **DNS, el corazón de AD**, con un caso real: qué pasa cuando metes un dominio en una red donde el DNS es un AdGuard Home.
6. GPO, permisos NTFS frente a permisos de compartido, Kerberos, y Entra ID.

Todo lo practico en un laboratorio con máquinas virtuales en casa, y contaré también cómo montarlo.

> Si trabajas en sistemas y ves que digo algo mal, escríbeme. Prefiero que me corrijan aquí que en mi primer día.
