---
title: "1 · El universo Microsoft 365"
description: "M365 no es un producto: es un barrio entero con identificación a la entrada (Entra ID), servicios dentro y una única llave por vecino. Quien entiende el plano del barrio no se pierde en ningún portal."
curso: "microsoft-365"
capitulo: 1
orden: 1
---
> «M365 no es un producto: es un barrio entero con identificación a la entrada (Entra ID), servicios dentro y una única llave por vecino. Quien entiende el plano del barrio no se pierde en ningún portal.»

## Objetivos

- Explicar qué es Microsoft 365 y qué servicios incluye cada plan.
- Definir **tenant**, **suscripción** y **licencia** — y no volver a confundirlos jamás.
- Trazar el mapa mental: AD on-prem ↔ Entra ID ↔ M365, conectando con tu [curso de AD](/cursos/active-directory/10-entra-id-e-hibrido/).
- Reconocer los centros de administración y dónde vive cada tarea.

## 1.1 Qué es Microsoft 365

Microsoft 365 es la suite corporativa de Microsoft: correo, ofimática, videollamadas, almacenamiento, identidad y gestión de dispositivos, todo bajo suscripción y administrado desde portales web. La traducción desde lo que ya conoces es casi directa:

| Mundo Google (tú ya lo sabes) | Mundo Microsoft 365 |
|-------------------------------|---------------------|
| Gmail con dominio propio | Exchange Online + Outlook |
| Admin Console (admin.google.com) | Microsoft 365 admin center (admin.microsoft.com) |
| Calendar | Outlook Calendar / shared calendars de EXO |
| Drive personal | OneDrive |
| Shared drives | SharePoint / Teams |
| Docs, Sheets, Slides | Word/Excel/PowerPoint (web y escritorio) |
| Meet / Chat | Teams |
| Vault (retención, eDiscovery) | Purview |
| MDM de Workspace | Intune |

Dos diferencias de fondo que te van a explicar por qué M365 «se siente» distinto aunque haga lo mismo:

1. **M365 no es un producto monolítico**: es un conjunto de servicios (Exchange Online, SharePoint, Teams, Intune...) con historias, portales y límites propios, unificados por una identidad común (Entra ID). En Workspace, Google integró todo desde el diseño; en M365 hay costuras visibles, y el trabajo L1 es con frecuencia coser entre ellas.
2. **El modelo de negocio es por licencia y por nivel**: hay media docena de planes y *lo que puede hacer un usuario depende de su licencia*. «A mí no me sale esa opción» tiene a menudo la misma respuesta: tu plan no la incluye.

¿Por qué te importa para el trabajo? En España M365 domina empresa grande y buena parte de la mediana, mientras Workspace domina pyme/startup. En las ofertas N1 verás «M365 o Google Workspace»; dentro del contrato, gran parte de los tickets de una oficina son de M365: contraseñas, correo, Teams, ficheros.

## 1.2 El tenant: la organización en la nube

Un **tenant** es la instancia de tu organización en la nube de Microsoft: un contenedor con directorio de identidades, dominios y suscripciones. Cuando alguien dice «el tenant de Iberia» significa: la organización Iberia en Microsoft, con sus usuarios, su correo y sus datos, aislada del resto del mundo.

Hechos que debes poder recitar:

- Todo tenant nace con un **dominio inicial** del tipo `contosoelectronics.onmicrosoft.com` — único, no se puede cambiar y sigue existiendo aunque añadas tu dominio custom. Es como el `@gtempaccount`... no: es como el dominio por defecto que Google te da al crear la organización antes de verificar el tuyo.
- Después se **verifican dominios propios** (`contoso-electronics.es`) añadiendo un registro TXT en tu DNS (`MS=msXXXXXXXXXXX`) — exactamente el mismo proceso que ya hiciste con Cloudflare para Workspace. Los usuarios pueden entonces tener `usuario@contoso-electronics.es`.
- Cada tenant tiene un **ID de tenant** (un GUID) y un **nombre inicial**. En soporte, «tenant» también se usa para el directorio mismo (Entra ID).

La tríada que confunde a todo el mundo nuevo:

| Concepto | Qué es | Analogía Workspace |
|----------|--------|--------------------|
| **Tenant** | La organización completa: directorio + dominios + suscripciones | La «organización» de Google |
| **Suscripción** | El contrato: qué productos, cuántas licencias, hasta cuándo | El plan (Business Standard…) |
| **Licencia** | Un asiento de la suscripción, asignado a un usuario | Una licencia de usuario del plan |

Un tenant puede tener varias suscripciones (p. ej. una de Business Premium y otra de E5). El tenant no muere cuando caduca una suscripción; los datos entran en periodo de gracia (típicamente 30-90 días según servicio) y luego se eliminan.

## 1.3 Planes y licencias: qué hay que reconocer

No hace falta memorizar precios; sí reconocer los nombres y la línea que los separa, porque el plan condiciona qué tickets verás.

**Planes Business (hasta 300 usuarios):**

- **Business Basic** — web y móvil (sin apps de escritorio), correo, Teams, 1 TB de OneDrive. El «Starter» de Microsoft.
- **Business Standard** — añade las apps de escritorio de Office. El plan de pyme por excelencia.
- **Business Premium** — añade Intune, Entra ID P1 (SSPR, Conditional Access básico) y Defender para empresas. El que contrata quien se toma la seguridad en serio.

**Planes Enterprise (sin límite de usuarios):**

- **Office 365 E1 / E3 / E5** — solo productividad (correo, Office, Teams). E1: buzones de 50 GB y Office web; E3: buzones de 100 GB + apps de escritorio + archivo ilimitado práctico; E5: añade teléfono, análisis y la seguridad avanzada de correo (Defender for Office P2).
- **Microsoft 365 E3 / E5** — los de arriba **más** el stack de gestión y seguridad: E3 incluye Windows Enterprise, Intune y Entra ID P1; E5 añade Entra ID P2, Defender for Endpoint, Purview completo.

**Frontline (F1/F3):** licencias baratas para personal de campo (cajeros, logística) que no tiene escritorio propio.

Dos consecuencias prácticas de nivel L1:

- **El usuario sin licencia no tiene servicio**: puede existir la cuenta (login, MFA) pero sin licencia no tiene buzón ni Teams. Ticket clásico: «al nuevo no le sale Teams» → mirar licencia antes que nada.
- **Quitar licencia no borra datos al instante**: el buzón se conserva ~30 días (recuperable si reasignas) y luego se elimina. Ese margen salva vidas en offboarding mal hecho.

## 1.4 El mapa: AD on-prem ↔ Entra ID ↔ M365

Este es el plano del barrio. Son **tres capas**, y saber qué vive en cada una responde la mitad de las preguntas de entrevista:

```
┌─────────────────────────────────────────────────────┐
│  SERVICIOS M365 (Exchange Online, Teams,            │
│  SharePoint/OneDrive, Intune, Purview…)             │
│  → datos y apps. Se administran en sus admin        │
│    centers, y CONSUMEN identidad de la capa debajo. │
├─────────────────────────────────────────────────────┤
│  ENTRA ID (antes Azure AD)                          │
│  → el directorio del tenant: usuarios, grupos,      │
│    MFA, Conditional Access. Autentica a la capa     │
│    de arriba. Web tokens (OIDC/SAML), sin OUs ni    │
│    GPOs.                                            │
├─────────────────────────────────────────────────────┤
│  AD DS on-prem (tu curso de AD)                     │
│  → LDAP/Kerberos, OUs, GPOs, dominio corp.local.    │
│    Opcional: puede estar sincronizado con Entra     │
│    (Entra Connect) en entornos híbridos.            │
└─────────────────────────────────────────────────────┘
```

Reglas del mapa:

- **M365 no existe sin Entra ID.** Todo servicio M365 autentica contra Entra ID: es la puerta única (single sign-on) del barrio. Entra ID, en cambio, existe perfectamente sin M365 (empresas que solo usan Azure o apps SaaS).
- **AD DS y Entra ID se relacionan solo si hay sincronización híbrida** (Entra Connect: objetos creados on-prem suben a la nube cada ~30 min; los objetos sincronizados se gestionan en origen). El detalle completo — PHS/PTA/federación, estados de dispositivo — está en el [capítulo 10 de tu curso de AD](/cursos/active-directory/10-entra-id-e-hibrido/); aquí solo lo invocamos.
- **Cloud-only**: una startup sin AD on-prem tiene solo las dos capas superiores. Los usuarios se crean directamente en Entra/M365 admin center. Muchísimas pymes españolas funcionan así.

Pregunta trampa típica: «¿M365 necesita Active Directory?». Respuesta: no — necesita **Entra ID**, que viene incluido; el AD on-prem solo aparece en empresas con historia Windows, conectado vía Entra Connect.

## 1.5 Los centros de administración

Cada servicio tiene su portal. Como L1 vivirás sobre todo en el M365 admin center y el de Exchange; los demás los visitarás para leer:

| Portal | URL | Qué se hace ahí (nivel L1) |
|--------|-----|----------------------------|
| **M365 admin center** | admin.microsoft.com | Usuarios, licencias, grupos, salud del servicio. Tu casa. |
| **Exchange admin center** (EAC) | admin.exchange.microsoft.com | Buzones, reglas de transporte, grupos de distribución, message trace. |
| **Teams admin center** (TAC) | admin.teams.microsoft.com | Políticas de Teams, diagnósticos de usuario. |
| **Portal de Entra ID** | entra.microsoft.com | Usuarios/grupos, MFA, sign-in logs, Conditional Access (leer). |
| **SharePoint admin center** | admin.microsoft.com/sharepoint | Sitios, compartir externo. |
| **Defender / Purview** | security.microsoft.com / purview.microsoft.com | Cuarentena, anti-spam / retención, eDiscovery. |
| **Intune** | intune.microsoft.com | Dispositivos, compliance, wipe. |

> **Aviso de realidad:** estos portales cambian de piel constantemente (Microsoft migra secciones, añade «nueva experiencia», deprecata vistas). Si una pantalla no coincide con un tutorial de hace un año, no es tu error: usa la búsqueda integrada del portal (la barra superior), que suele ser el camino más rápido hoy. En entrevistas nombra los portales por concepto, no por captura de pantalla.

## Esto te preguntarán en la entrevista

**P: ¿Qué es Microsoft 365?**
R: La suite corporativa en suscripción de Microsoft: Exchange Online para correo, Teams, SharePoint/OneDrive, apps de Office, más gestión de dispositivos (Intune) y seguridad, todo autenticado por Entra ID y administrado desde portales web. Es el equivalente de Google Workspace, pero compuesto por servicios con portales propios.

**P: ¿Qué es un tenant?**
R: La instancia de una organización en la nube de Microsoft: su directorio de identidades, dominios y suscripciones. Nace con un dominio inicial `empresa.onmicrosoft.com` y se le añaden dominios verificados por TXT. Un tenant puede tener varias suscripciones.

**P: ¿Diferencia entre suscripción y licencia?**
R: La suscripción es el contrato (qué productos y cuántos asientos); la licencia es cada asiento, asignada a un usuario. Un usuario sin licencia existe pero no tiene servicios: sin buzón ni Teams. Al quitar una licencia, los datos se conservan ~30 días antes de borrarse.

**P: ¿Se puede tener M365 sin Active Directory?**
R: Sí. M365 requiere Entra ID (incluido), no AD on-prem. En entornos con historia Windows se conectan ambos con Entra Connect: los objetos nacen en AD y se sincronizan a la nube.

**P: ¿Diferencia entre Office 365 y Microsoft 365?**
R: Office 365 es solo productividad (correo, Office, Teams). Microsoft 365 = Office 365 + seguridad y gestión: Intune, Entra ID Premium y Windows Enterprise. M365 E3/E5 son los planes estrella de empresa.

## Ejercicios prácticos

1. **De papel:** dibuja las tres capas (AD DS / Entra ID / servicios M365) y marca sobre el dibujo: dónde se resetea una contraseña en cloud-only vs híbrido, dónde vive el buzón de un usuario, y qué capa autentica el login de Teams.
2. **De papel:** para cada uno, di tenant, suscripción o licencia: «Compramos 50 E3»; «El usuario p.lopez se quedó sin buzón»; «Vamos a cambiar el dominio inicial»; «La factura mensual». (Respuestas: suscripción, licencia, tenant, suscripción.)
3. **Manos libres:** entra en [microsoft365.com](https://www.microsoft.com/microsoft-365) y compara la tabla de planes Business y Enterprise. Anota: en qué plan aparecen por primera vez Intune, SSPR y el buzón de 100 GB.
4. **Ancla mental:** escribe en dos frases la diferencia entre tu experiencia con Workspace («una consola, un plan») y M365 («servicios unificados por identidad»). Es tu respuesta de repaso para el capítulo 10.
