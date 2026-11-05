---
title: "Introducción"
description: "Requisito conceptual: el capítulo 10 del curso de AD ([Entra ID e híbridos](/cursos/active-directory/10-entra-id-e-hibrido/)) cubre la diferencia AD DS vs Entra ID y la sincronización híbrida. Aquí…"
curso: "microsoft-365"
capitulo: 0
orden: 0
---
### De Google Workspace y Active Directory al helpdesk corporativo — un curso en libro para cerrar el gap de M365

---

## Para quién es este libro

Para alguien que ya administra su propio correo con dominio propio (SPF/DKIM/DMARC en Cloudflare, trial de Google Workspace), que ha completado el [curso de Active Directory](/cursos/active-directory/) y que se presenta a puestos de Helpdesk/Soporte IT N1 en España. No explica qué es un DNS ni qué es un dominio de correo: explica **Microsoft 365** — la suite que sostiene la mayoría de oficinas corporativas del país — desde cero corporativo hasta nivel de entrevista y primer día de helpdesk.

Si has peleado con registros MX y cuarentenas en la Admin Console de Google, este libro te habla en tu idioma: Exchange Online es el Gmail de empresa con otro acento, y el 80% de tu intuición se traduce directa. El 20% restante (tenant, licencias, Entra ID, roles administrativos) es exactamente lo que cubre este libro.

> **Requisito conceptual:** el capítulo 10 del curso de AD ([Entra ID e híbridos](/cursos/active-directory/10-entra-id-e-hibrido/)) cubre la diferencia AD DS vs Entra ID y la sincronización híbrida. Aquí lo damos por leído y lo referenciamos sin repetirlo.

## Cómo está montado cada capítulo

1. **Objetivos** — qué vas a saber hacer al terminar.
2. **Contenido** — el porqué antes del cómo, con ejemplos y casos de ticket reales.
3. **Esto te preguntarán en la entrevista** — 3-5 preguntas típicas N1 con respuesta modelo corta.
4. **Ejercicios prácticos** — de papel y de laboratorio (capítulo 8).

> **Consejo de estudio:** los capítulos 1-2 dan el mapa mental; no avances más sin el tenant de pruebas del capítulo 8 montado. M365 se aprende clicando y rompiendo, igual que AD.

## Índice

| Cap. | Fichero | De qué va |
|------|---------|-----------|
| 1 | [01-el-universo-m365.md](/cursos/microsoft-365/01-el-universo-m365/) | Qué es M365, qué es un tenant, suscripciones y licencias. Mapa mental: AD on-prem ↔ Entra ID ↔ M365. |
| 2 | [02-centro-de-administracion.md](/cursos/microsoft-365/02-centro-de-administracion/) | El admin center: ciclo de vida de usuarios, licencias, tipos de grupos, roles admin y mínimo privilegio. |
| 3 | [03-exchange-online.md](/cursos/microsoft-365/03-exchange-online/) | **Capítulo estrella**: flujo de correo, buzones, aliases, reglas de transporte. El ticket rey: «no me llegan correos». |
| 4 | [04-teams.md](/cursos/microsoft-365/04-teams/) | Equipos, canales, invitados y reuniones. «No puedo entrar a la reunión» — diagnóstico L1. |
| 5 | [05-onedrive-y-sharepoint.md](/cursos/microsoft-365/05-onedrive-y-sharepoint/) | OneDrive vs SharePoint, sync, permisos, compartir externo, versiones. «Se me borró el archivo». |
| 6 | [06-intune-mdm.md](/cursos/microsoft-365/06-intune-mdm/) | Intune por encima: enroll, políticas, wipe vs retire, el móvil perdido. Nivel «saber qué es y cuándo escalar». |
| 7 | [07-seguridad-l1.md](/cursos/microsoft-365/07-seguridad-l1/) | MFA y su reset (ticket clásico), SSPR, Conditional Access a nivel concepto, phishing y cuentas comprometidas. |
| 8 | [08-lab-gratis.md](/cursos/microsoft-365/08-lab-gratis/) | Tenant de laboratorio gratis (Developer Program / trials) + recorrido guiado por tickets simulados. |
| 9 | [09-troubleshooting-l1.md](/cursos/microsoft-365/09-troubleshooting-l1/) | Tabla síntoma→acción, Service Health, «¿es Microsoft o soy yo?», criterios de escalado. |
| 10 | [10-preguntas-de-entrevista.md](/cursos/microsoft-365/10-preguntas-de-entrevista/) | ~20 preguntas N1 consolidadas con respuestas modelo + escenarios trampa. |

## Ruta de estudio sugerida (una semana intensiva)

- **Día 1:** Capítulo 1 + montar el tenant del capítulo 8 (secciones 1-3).
- **Día 2:** Capítulo 2 practicando cada operación en el tenant (usuarios, licencias, grupos).
- **Día 3:** Capítulo 3 (Exchange) — el más importante para entrevistas de oficina. Con DKIM/SPF lo bordarás.
- **Día 4:** Capítulos 4 y 5 (Teams + ficheros).
- **Día 5:** Capítulos 6 y 7 (Intune + seguridad).
- **Día 6:** Capítulo 9 (troubleshooting) + tickets simulados del capítulo 8.
- **Día 7:** Capítulo 10 en voz alta. Repasar los «Esto te preguntarán» de cada capítulo.

## Glosario exprés

| Término | Traducción al mundo que ya conoces |
|---------|-----------------------------------|
| **Tenant** | La organización en la nube de Microsoft: tu dominio + usuarios + suscripciones. Como la «organización» de Workspace. |
| **Suscripción** | El contrato: qué productos compras. Como el plan de Workspace. |
| **Licencia** | Un asiento de la suscripción, por usuario. Como las licencias de Workspace admin console. |
| **Entra ID** | El directorio de identidades del tenant (antes Azure AD). Autentica todo M365. Ver [curso de AD, cap. 10](/cursos/active-directory/10-entra-id-e-hibrido/). |
| **Exchange Online (EXO)** | El correo: el Gmail de empresa de Microsoft. |
| **EOP** | Exchange Online Protection: el filtro anti-spam/anti-malware incluido en EXO. |
| **Cuarentena** | Donde EOP retiene correos sospechosos. Como la cuarentena de Gmail/Workspace. |
| **Regla de transporte** | Filtro servidor de correo: condiciones → acciones. Como las routing rules de Gmail. |
| **Message trace** | Traza de correo: qué llegó, cuándo y dónde acabó. Como el log de entrega de Gmail. |
| **TAC** | Teams Admin Center (admin.teams.microsoft.com). |
| **MDM / Intune** | Gestión de dispositivos móvil/escritorio. Como el MDM de Workspace, pero en serio. |
| **CA (Conditional Access)** | Política si-entonces de acceso: quién, desde dónde, con qué dispositivo. |
| **SSPR** | Self-Service Password Reset: el usuario se resetea solo su contraseña. |
| **Purview** | Suite de compliance: retención, eDiscovery. Como Vault de Workspace. |
| **NDR** | Non-Delivery Report: el correo de rebote con el código de error SMTP. |

---
*Licencia de uso: personal, para preparación de entrevista y formación. Los ejemplos usan el tenant ficticio `contosoelectronics.onmicrosoft.com` y el dominio `contoso-electronics.es`.*
