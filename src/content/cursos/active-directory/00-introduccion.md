---
title: "Introducción"
description: "Consejo de estudio: lee los capítulos 1-2 en una sentada, pero no toques los 3-10 sin tener el lab del capítulo 11 montado. AD se aprende rompiéndolo."
curso: "active-directory"
capitulo: 0
orden: 0
---
### De Linux a Helpdesk Windows — un curso en libro para cerrar el gap de AD

---

## Para quién es este libro

Para alguien que ya administra sistemas a diario (Linux, DNS, contenedores, servidores) pero que nunca ha trabajado en un entorno corporativo Windows. No explica qué es una IP ni qué es un servidor: explica **Active Directory** — el sistema que sostiene casi toda oficina Windows del planeta — desde cero corporativo hasta nivel de entrevista y primer día de Helpdesk N1.

Si conoces `dig`, `ldapsearch`, systemd y Docker, este libro te habla en tu idioma: cada concepto se ancla a algo que ya sabes.

## Cómo está montado cada capítulo

1. **Objetivos** — qué vas a saber hacer al terminar.
2. **Contenido** — el porqué antes del cómo, con comandos y ejemplos reales.
3. **Esto te preguntarán en la entrevista** — 3-5 preguntas típicas N1 con respuesta modelo corta.
4. **Ejercicios prácticos** — de papel y de laboratorio (capítulo 11).

> **Consejo de estudio:** lee los capítulos 1-2 en una sentada, pero no toques los 3-10 sin tener el lab del capítulo 11 montado. AD se aprende rompiéndolo.

## Índice

| Cap. | Fichero | De qué va |
|------|---------|-----------|
| 1 | [01-que-es-active-directory.md](/cursos/active-directory/01-que-es-active-directory/) | Qué es un dominio/AD y qué problema resuelve. Analogías con LDAP y DNS. |
| 2 | [02-anatomia-de-ad.md](/cursos/active-directory/02-anatomia-de-ad/) | DC, bosque, árbol, dominio, OU: el mapa mental completo. |
| 3 | [03-usuarios-y-grupos.md](/cursos/active-directory/03-usuarios-y-grupos/) | Crear, deshabilitar, desbloquear, resetear contraseñas. Grupos y AGDLP. **El pan de cada día L1.** |
| 4 | [04-equipos-y-join.md](/cursos/active-directory/04-equipos-y-join/) | Unir equipos al dominio, cuentas de máquina, la confianza rota. |
| 5 | [05-dns-el-corazon-de-ad.md](/cursos/active-directory/05-dns-el-corazon-de-ad/) | **Capítulo estrella**: SRV, zonas integradas, por qué el AD muere si muere el DNS. Caso Pi-hole. |
| 6 | [06-gpos.md](/cursos/active-directory/06-gpos/) | GPO: qué son, herencia LSDOU, ejemplos N1 (USB, fondo, unidades mapeadas). |
| 7 | [07-permisos-ntfs-vs-compartido.md](/cursos/active-directory/07-permisos-ntfs-vs-compartido/) | NTFS vs permisos de compartido y la combinación efectiva. Pregunta clásica de entrevista. |
| 8 | [08-autenticacion-kerberos-ntlm.md](/cursos/active-directory/08-autenticacion-kerberos-ntlm/) | Kerberos y NTLM alto nivel, bloqueos de cuenta, políticas de contraseña. |
| 9 | [09-herramientas-y-troubleshooting-l1.md](/cursos/active-directory/09-herramientas-y-troubleshooting-l1/) | RSAT, ADUC, PowerShell de AD, ldp + síntomas comunes y cuándo escalar a N2. |
| 10 | [10-entra-id-e-hibrido.md](/cursos/active-directory/10-entra-id-e-hibrido/) | Entra ID (Azure AD), sincronización híbrida, diferencias con AD on-prem. |
| 11 | [11-laboratorio-en-casa.md](/cursos/active-directory/11-laboratorio-en-casa/) | Mini-lab con KVM/VirtualBox en 16 GB de RAM. Alternativa ligera con Samba. |
| 12 | [12-preguntas-de-entrevista.md](/cursos/active-directory/12-preguntas-de-entrevista/) | ~20 preguntas N1 consolidadas con respuestas modelo. |

## Ruta de estudio sugerida (una semana intensiva)

- **Día 1-2:** Capítulos 1-2 + montar el lab (capítulo 11, secciones 1-5).
- **Día 3-4:** Capítulos 3-4 practicando cada operación en el lab.
- **Día 5:** Capítulo 5 (DNS) + 7 (permisos). El 5 es el que te diferenciará.
- **Día 6:** Capítulos 6, 8 y 9.
- **Día 7:** Capítulo 10 + repaso del 12 en voz alta.

## Glosario exprés

| Término | Traducción al mundo que ya conoces |
|---------|-----------------------------------|
| **AD DS** | Active Directory Domain Services: "el AD" de toda la vida, on-prem. |
| **DC** (Domain Controller) | Servidor que guarda la base de datos del dominio y autentica. El "core" del sistema. |
| **Dominio** | Un realm de autenticación + base de usuarios/equipos: `corp.local`. |
| **OU** (Organizational Unit) | Carpeta-contenedor dentro del dominio para organizar y delegar. |
| **GPO** | Política aplicada a máquinas/usuarios (config obligatoria tipo "dotfiles gestionados"). |
| **Join** | Unir un equipo al dominio: pasa de cuenta local a autenticación central. |
| **SRV** | Registro DNS que anuncia dónde está un servicio. Los DC se anuncian así. |
| **UPN** | Nombre principal de usuario: `jdoe@corp.local` (formato email para loguearse). |
| **RSAT** | Herramientas de administración remota: los mgmt tools del DC en tu PC. |
| **Entra ID** | El "AD de la nube" (antes Azure AD). Otro producto, no un AD migrado. |

---
*Licencia de uso: personal, para preparación de entrevista y formación. Los ejemplos usan el dominio ficticio `corp.lab`.*
