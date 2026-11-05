---
title: "4 · Teams: reunión, equipo, canal — y sus tres capas ocultas"
description: "Teams es un matryoshka: abres un equipo y hay un grupo M365, abres el grupo y hay un sitio SharePoint, abres el canal y hay una carpeta. Quien sabe abrir las muñecas no se asusta con ningún ticket."
curso: "microsoft-365"
capitulo: 4
orden: 4
---
> «Teams es un matryoshka: abres un equipo y hay un grupo M365, abres el grupo y hay un sitio SharePoint, abres el canal y hay una carpeta. Quien sabe abrir las muñecas no se asusta con ningún ticket.»

## Objetivos

- Entender la arquitectura de Teams (qué hay debajo de cada equipo y canal) y por qué importa para diagnosticar.
- Distinguir miembros, propietarios e invitados; acceso externo vs acceso de invitado.
- Resolver con método el clásico «no puedo entrar a la reunión».
- Reconocer los tickets Teams típicos de N1 y cuándo son de otro servicio.

## 4.1 Qué es Teams (y qué tiene debajo)

Teams es chat, llamadas, reuniones y colaboración en un cliente. Lo importante para soporte no es el cliente: es la **arquitectura subyacente**, porque casi ningún ticket de Teams se resuelve solo en Teams:

```text
Equipo (team)
 ├─ Grupo de M365  →  membresía y permisos (cap. 2)
 ├─ Buzón y calendario compartidos (Exchange) → conversaciones del canal
 ├─ Sitio SharePoint  →  TODOS los ficheros del equipo
 │    └─ Canal estándar  →  carpeta en la librería "Documentos"
 │         (canal privado  →  sitio SharePoint aparte)
 └─ Otros: Planner, Forms, OneNote…
```

Consecuencias prácticas inmediatas:

- **«El fichero del canal no está»** se busca en SharePoint (capítulo 5), no en Teams.
- **«El usuario no entra al equipo»** suele ser membresía del grupo M365.
- **Un equipo sin Exchange/SharePoint sanos** falla aunque el cliente Teams esté perfecto.

## 4.2 Equipos, canales y membresía

- **Equipo**: la unidad de gente y contenido. Lo crea cualquier miembro con permiso (política permitida) y al crearlo se convierte en su **propietario**.
- **Canal**: las «habitaciones» dentro del equipo (General nace siempre). Estándar: abierto a todos los miembros. **Privado**: subconjunto de gente, con su propio sitio SharePoint — dato de entrevista. **Compartido**: para colaborar con gente de fuera sin invitarla al equipo (concepto, suficiente).
- **Membresía**: propietario / miembro / invitado. El propietario gestiona, quita y añade; es el «admin local» del equipo. Añadir miembros = añadirlos al grupo M365; se ve igual desde Teams que desde el admin center.

Ticket típico de membresía: «añadieron a X al equipo y no le aparecen ficheros antiguos» — sincronización/permisos de SharePoint tardando en propagarse (minutos), o el usuario debe refrescar. Si «no le aparece el equipo» del todo: licencia de Teams (capítulo 1), membresía efectiva, o cliente desactualizado.

**Borrar un equipo borra el grupo M365, el sitio y el buzón** — con 30 días de gracia recuperable (igual que borrar el grupo). Antes de borrar: pensar en los ficheros, porque ese contenido pertenece al equipo, no a ninguna persona.

## 4.3 Invitados y externos

Dos mecanismos distintos que se confunden siempre (pregunta de entrevista segura):

| | **Acceso de invitado** (guest access) | **Acceso externo** (external access/federación) |
|---|----------------------------------------|--------------------------------------------------|
| Qué es | Invitas a una **persona concreta de otra organización** (B2B) a un equipo/canal concreto | Tu tenant puede chatear/reunirse con **otras organizaciones enteras** (federación, incluye Skype for Business legacy) |
| Cómo entra | Cuenta de invitado creada en TU Entra ID (`pepe_gmail.com#EXT#@tuentant…`) | Con su cuenta de su propio tenant; no crea cuenta en el tuyo |
| Qué puede hacer | Casi todo lo de un miembro, dentro de su equipo, limitado por políticas | Chat 1:1 y reuniones básicas; no colabora en equipos |
| Analogía | Invitar con su email a un shared drive concreto | «Confianza» entre dominios de correo |

El flujo L1 cuando un invitado no puede entrar: ¿está habilitado el acceso de invitado a nivel tenant? (si está deshabilitado org-wide, ningún equipo puede tener invitados — lo controla N2/seguridad), ¿la invitación se aceptó?, ¿está en el equipo como miembro guest?, ¿le bloquea una política de Conditional Access de viaje (capítulo 7)? Y ojo: **los permisos de invitado también los limita el sitio SharePoint** (capítulo 5): sharing settings por sitio.

## 4.4 Reuniones: «no puedo entrar a la reunión»

El ticket con más pánico por minuto. El método es siempre el mismo: **¿quién es el que no entra?**

**Caso A — un interno de tu tenant:**

1. ¿Cliente o web? Probar «unirse desde el navegador» — descarta cliente desactualizado/caché (el cliente Teams se actualiza solo, pero solo si se cierra; reiniciar Teams es el primer remedio de barrio).
2. ¿Es la primera vez que usa Teams? Login con su UPN y MFA (capítulo 7) — puede estar atascado ahí.
3. Mirar el **error exacto**: «Alguien en la reunión le ha denegado la entrada» = el organizador tiene que admitirlo desde el vestíbulo (lobby). «No tiene permiso para unirse» = política de reunión (meeting policy) o reunión de un grupo del que no es miembro.

**Caso B — un externo:**

1. ¿Permite la reunión unirse sin cuenta? (la configuración «Quién puede omitir el vestíbulo» y «Personas de acceso telefónico pueden omitir el vestíbulo» las define el organizador al crear).
2. ¿Está el acceso externo/guest habilitado en tu tenant (sección 4.3)? Un cambio de seguridad a nivel tenant «rompe» de golpe a todos los externos.
3. Conditional Access: en empresas exigentes, el externo sin dispositivo conforme puede quedarse fuera — ahí se escala, no se «arregla».

**Caso C — falla la reunión en sí** (nadie entra): ¿está el servicio sano? (capítulo 9), ¿la reunión la creó un tenant caído? Comprobar con otra reunión de otro organizador.

**Sintomatología secundaria** que también caerá en tu cola: no se oye / no le oyen (dispositivos y permisos del navegador/sistema — probar la llamada de prueba de Configuración → Dispositivos), no puede presentar (meeting policy de screen share), «no veo el contenido compartido» (cliente desactualizado — la web de nuevo).

## 4.5 El cliente y el Teams admin center

El **TAC** (admin.teams.microsoft.com) es el centro de administración: políticas de mensajería/reunión/llamadas por usuario, voz, teléfonos… Nivel L1: **lectura y diagnósticos**. El TAC tiene herramientas de diagnóstico por usuario («User troubleshooting»: busca al usuario y lanza el test de reunión/llamada/membresía) que te dicen en qué capa falla. Cambiar políticas globales es N2.

Tickets de cliente que se resuelven en dos minutos y no necesitan el TAC:

- **Teams no arranca / va raro**: cerrar del todo (bandeja → Salir) y reabrir; si persiste, limpiar caché (en Windows, `%appdata%\Microsoft\Teams` para el clásico; el nuevo Teams se reinstala/actualiza desde la app). Como en todo cliente web-derivado: la caché miente.
- **«No me salen los equipos nuevos»**: cerrar/reabrir; la membresía reciente tarda en refrescar.
- **«No tengo Teams»**: licencia (capítulos 1-2). El diagnóstico de 30 segundos: abrir el usuario en el admin center y mirar Licencias.

## Esto te preguntarán en la entrevista

**P: ¿Qué hay debajo de un equipo de Teams?**
R: Un grupo de M365 (membresía y permisos), un buzón y calendario compartidos en Exchange para las conversaciones del canal, y un sitio SharePoint con una carpeta por canal para los ficheros. Por eso los tickets de Teams muchas veces se resuelven mirando el grupo, Exchange o SharePoint.

**P: ¿Diferencia entre acceso de invitado y acceso externo?**
R: Invitado (B2B): persona concreta de otra organización con cuenta de invitado en mi Entra ID, colabora dentro de un equipo concreto. Acceso externo (federación): relación entre organizaciones para chat y reuniones sin crear cuentas; no da acceso a equipos. El invitado colabora; el externo solo se comunica.

**P: ¿Canal privado vs canal estándar?**
R: El estándar es visible a todos los miembros del equipo y sus ficheros son una carpeta del sitio SharePoint del equipo. El privado es para un subconjunto de miembros y tiene su propio sitio SharePoint aparte con permisos propios.

**P: Un externo no puede entrar a una reunión de Teams. ¿Qué miras?**
R: Primero el error exacto y quién la organizó. ¿Está en el vestíbulo esperando a que le admitan? ¿Permite la reunión acceso anónimo/externo? ¿Están habilitados guest/external access a nivel tenant? ¿Le bloquea Conditional Access? Si es un solo externo, su equipo y su cliente; si son todos, cambio de configuración del tenant o incidente.

**P: ¿Dónde están los ficheros que se comparten en un canal de Teams?**
R: En el sitio SharePoint del equipo: cada canal estándar es una carpeta de la biblioteca de documentos. Se accede desde Teams (Abrir en SharePoint) o desde OneDrive/SharePoint web. Por eso la restauración de versiones y la papelera son las de SharePoint.

## Ejercicios prácticos

1. **De papel:** para cada ticket, di en qué capa vive (grupo M365 / Exchange / SharePoint / cliente / política TAC): «no veo los ficheros del canal», «el invitado no puede escribir en el chat», «no me llega el resumen de conversaciones del canal por correo», «no puedo entrar a la reunión», «no me sale el equipo nuevo».
2. **De papel:** escribe el árbol de decisión de «externo no entra a la reunión» con al menos 5 ramas (vestíbulo, configuración de la reunión, guest/external tenant, CA, cliente del externo) y qué preguntas harías al organizador.
3. **De laboratorio (cap. 8):** crea un equipo, dentro un canal privado; abre el sitio SharePoint del equipo y localiza la carpeta del canal estándar y el sitio separado del canal privado. Luego crea una reunión e invita a una cuenta externa de tu propiedad; observa el flujo del vestíbulo y pruébalo también desde el navegador.
4. **De laboratorio:** en el TAC, busca a un usuario y lanza un diagnóstico de reunión (User troubleshooting). Léelo entero: es exactamente el razonamiento en capas que este capítulo describe.
