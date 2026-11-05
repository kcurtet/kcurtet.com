---
title: "2 · El centro de administración: usuarios, licencias, grupos y roles"
description: "El admin center es a M365 lo que ADUC al dominio: el 90% de tu día son diez clics bien dados y saber a quién NO se los das."
curso: "microsoft-365"
capitulo: 2
orden: 2
---
> «El admin center es a M365 lo que ADUC al dominio: el 90% de tu día son diez clics bien dados y saber a quién NO se los das.»

## Objetivos

- Moverte por el M365 admin center y ejecutar el ciclo de vida del usuario: alta, edición, bloqueo, baja y restauración.
- Asignar y quitar licencias entendiendo qué pasa con los datos.
- Elegir el tipo de grupo correcto (M365 vs seguridad vs distribución) sin dudar.
- Conocer los roles administrativos y aplicar mínimo privilegio: qué rol pedirías tú como N1.

## 2.1 El M365 admin center

Todo vive en **admin.microsoft.com**: la barra lateral izquierda (Usuarios, Equipos y grupos, Facturación, Salud, Ajustes…) y la barra de búsqueda superior, que es tu mejor amiga cuando Microsoft mueve algo de sitio (y lo mueve). En un tenant de producción verás también avisos del Message Center y el estado del servicio en el dashboard.

Regla de oro del recién llegado: **antes de tocar nada, mira**. Este portal es producción real: cada clic afecta a usuarios vivos. Los permisos se otorgan por rol (sección 2.5), y en una empresa seria tu cuenta tendrá exactamente los que tu puesto necesita.

## 2.2 Ciclo de vida del usuario

Es el equivalente cloud de [usuarios y grupos de tu curso de AD](/cursos/active-directory/03-usuarios-y-grupos/): mismos conceptos, otro portal. Ruta: **Usuarios → Usuarios activos**.

**Alta** (Agregar usuario): nombre, nombre de usuario con su dominio (se genera el UPN), contraseña (temporal + forzar cambio en el primer login) y, en el mismo asistente, asignación de licencia y rol. También puedes crear en bloque con CSV, pero eso suele ser tarea de N2 o de una automatización.

**Chequeos rápidos al abrir un usuario** (lo primero que miras en cualquier ticket «este usuario no puede X»):

1. **Sign-in status**: ¿está bloqueado? (Bloquear inicio de sesión — el equivalente a deshabilitar la cuenta en AD).
2. **Licencias**: ¿tiene la que da acceso al servicio que falla?
3. **Cuentas**: pestañas de correo, OneDrive, dispositivos — para ver qué tiene realmente.

**Baja (offboarding)** — el runbook que te pueden pedir en la entrevista, en orden:

1. **Recuperar lo necesario**: delegar el buzón (Full Access + Send As, ver capítulo 3) y el OneDrive (acceso de administrador a su OneDrive) a su sustituto o jefe.
2. **Convertir si toca**: ¿le llegaba correo de clientes? Plantear convertir el buzón en compartido antes de quitar licencia (capítulo 3).
3. **Quitar licencia** (liberas el asiento para otro usuario; los datos aguantan ~30 días).
4. **Bloquear el inicio de sesión** — al instante corta su acceso a TODO M365 (correo, Teams, ficheros).
5. **Borrar el usuario** solo tras el periodo de gracia de la empresa. Al borrar: el objeto queda **30 días en «Usuarios eliminados»**, restaurable con un clic (mientras exista, su UPN no se puede reutilizar — como el SID en AD, no se recycle a lo ligero).
6. Revocar sesiones activas y resetear MFA (capítulo 7) si la baja es conflictiva.

> **Nota híbrida:** si el usuario nació en AD on-prem (sincronizado), TODO esto se gestiona en origen: lo deshabilitas en AD y la próxima sincronización (~30 min) lo bloquea en la nube. Borrar un usuario sincronizado solo en la nube es imposible/da guerra: el sync lo recrea. Detalle en el [cap. 10 de curso de AD](/cursos/active-directory/10-entra-id-e-hibrido/).

**Bloquear vs borrar** (pregunta de entrevista garantizada): bloquear es reversible y conservador; borrar entra en cuenta atrás de 30 días. Jamás borres para «recrear y que funcione».

## 2.3 Licencias

Ruta: **Usuarios → usuario → Licencias y aplicaciones**, o **Facturación → Licencias** para la vista de inventario (compradas vs asignadas).

- Asignar licencia = activar servicios para ese usuario. Sin licencia de Exchange → sin buzón; sin licencia que incluya Teams → sin Teams. La mitad de los tickets «no me sale la app» acaban aquí.
- Puedes desactivar servicios concretos dentro de una licencia (p. ej. dar E3 sin Planner): es la granularidad fina, tarea más de N2 pero buena saber que existe.
- **Asignación por grupo**: las licencias pueden heredarse de grupos (cloud). Si un usuario «pierde» la licencia tras cambiarle de grupo, esa es la causa.
- **Quitar licencia**: el buzón queda inaccesible y se conserva ~30 días (recuperable reasignando), OneDrive igual. Después, borrado definitivo.

Dato práctico que sorprende: **el buzón compartido no necesita licencia** mientras sea ≤50 GB y no tenga archivador ni retención legal (capítulo 3). Es el truco estándar para conservar el correo de un empleado que se va.

## 2.4 Grupos: cuatro tipos, una decisión

M365 hereda de Exchange y de AD una fauna de grupos que confunde a todo el mundo nuevo. La tabla decisiva (y la comparación con lo que ya conoces):

| Tipo | Para qué sirve | Notas clave |
|------|----------------|-------------|
| **Grupo de M365** (unificado) | El «equipo»: buzón compartido + calendario + sitio SharePoint + Planner + (opcional) el team de Teams | Se crea desde Teams, Outlook o admin center; es la base de la colaboración moderna. ~30 días recuperable tras borrar. |
| **Grupo de seguridad** | Permisos: asignar licencias, acceso a recursos, roles | Igual que un security group de AD. No tiene correo por defecto. Puede ser dinámico (miembros por regla, requiere Entra ID P1). |
| **Distribución** | Solo lista de correo: ventas@ reparte a sus miembros | El «grupo de Google clásico». No da permisos de nada. |
| **Seguridad habilitada para correo** | Híbrido raro: lista de correo QUE además da permisos | Legacy de Exchange; se ve en empresas con historia. |

Cómo elegir en 5 segundos: ¿envían correo y colaboran? → grupo M365. ¿Solo reparte correo? → distribución. ¿Es para asignar permisos/licencias? → seguridad. 

El grupo M365 es la pieza que más te va a cruzar: **crear un equipo en Teams crea por debajo un grupo M365, un sitio SharePoint y un buzón** (capítulo 4). Borrar el equipo borra todo eso — con sus 30 días de gracia. Y al revés: los miembros del grupo se gestionan desde el grupo; si «añades a alguien al equipo pero no aparece», el problema suele estar en la membresía del grupo subyacente.

Los **grupos dinámicos** (membresía por regla de atributo: `departamento eq "Ventas"`) necesitan Entra ID P1; su existencia explica usuarios que «entran y salen solos» de un grupo — clásico ticket raro de L1.

## 2.5 Roles administrativos y mínimo privilegio

Los roles se asignan en **Usuarios → [usuario] → Roles** (o en Entra ID). Un usuario puede ser admin global, admin o usuario normal. Los que un N1 tiene que reconocer a la primera:

| Rol | Qué puede | Notas |
|-----|-----------|-------|
| **Global admin** | Todo | Pocas cuentas (2-4), protegidas con MFA fuerte. Break-glass aparte. |
| **User admin** | Usuarios y grupos: crear, resetear contraseñas, licencias | Muy habitual para helpdesk. |
| **Helpdesk admin** | Resetear contraseñas de NO-admins, forzar re-login, tickets a Microsoft | El rol «diseñado» para L1. No toca admins ni licencias. |
| **Password admin** | Solo resetear contraseñas de no-admins | Mínimo posible para esa tarea. |
| **License admin** | Asignar/quitar licencias | Se combina con el anterior para formar un L1 completo. |
| **Exchange admin** | Todo Exchange: buzones, reglas, transporte | N2/correo; L1 a veces lo tiene en empresas pequeñas. |
| **Teams / SharePoint admin** | Sus respectivos servicios | N2 habitual. |
| **Security admin** | Seguridad: políticas, MFA, Defender | N2/N3. |
| **Global reader / Reports reader / Service support** | Leer todo / ver informes / gestionar tickets con Microsoft | Roles de solo lectura ideales para L1 ampliado. |

**Principio de mínimo privilegio** — la idea que la entrevista quiere oír: cada cuenta con los permisos mínimos para su función, porque un robo de credenciales escala tan lejos como lleguen sus permisos, y porque los errores humanos hacen menos daño. Frase para la entrevista: «Para un puesto L1 pediría Helpdesk admin + License admin; Global admin solo para 2-3 cuentas protegidas». Existe además **PIM** (Privileged Identity Management, Entra ID P2): activar rol admin *just-in-time* con aprobación — nombrarlo suma puntos; administrarlo es N3.

Y la regla L1 final: **la cuenta de administración es aparte**. Tu cuenta diaria de correo no debe ser tu cuenta de admin global — mismo criterio que no usar root en Linux para todo.

## Esto te preguntarán en la entrevista

**P: ¿Cómo das de baja a un empleado en M365?**
R: Runbook: delegar buzón y OneDrive al sucesor, decidir si convertir el buzón en compartido, quitar licencia, bloquear inicio de sesión (corta todo el acceso al instante) y borrar tras el periodo de gracia. El usuario borrado queda 30 días restaurable. En híbrido, se gestiona en el AD de origen.

**P: Diferencia entre bloquear y eliminar un usuario.**
R: Bloquear (Bloquear inicio de sesión) es deshabilitar: reversible, corta acceso a todo M365 al instante. Eliminar mueve el objeto a Usuarios eliminados durante 30 días, restaurable; después, borrado definitivo con pérdida de buzón/OneDrive.

**P: ¿Qué pasa si quitas la licencia a un usuario?**
R: Pierde acceso a los servicios (buzón, Teams) de inmediato, pero los datos se conservan ~30 días: si reasignas la licencia a tiempo, vuelve todo. Pasado ese plazo, borrado.

**P: ¿Grupo de distribución, de seguridad o de M365?**
R: Distribución: solo lista de correo. Seguridad: permisos y asignación de licencias. Grupo M365: colaboración — incluye buzón compartido, calendario, sitio SharePoint y opcionalmente el equipo de Teams. Para un equipo de trabajo moderno, grupo M365.

**P: ¿Qué rol administrativo pedirías para un puesto L1?**
R: Helpdesk admin (reseteos, forzar re-login) y License admin (licencias); a menudo User admin. Exchange/Teams/Security admin para N2, y Global admin solo en 2-3 cuentas protegidas: mínimo privilegio.

## Ejercicios prácticos

1. **De papel:** escribe el runbook de offboarding completo (incluida la conversión de buzón a compartido del capítulo 3) y márcalo con el orden de los pasos. Justifica por qué «quitar licencia» va antes de «borrar usuario» y por qué «bloquear» va antes que ambos.
2. **De papel:** clasifica: (a) soporte@empresa.es que reciben 4 técnicos; (b) permiso para ver el sitio SharePoint de Calidad; (c) equipo de proyecto con chat, ficheros y calendario; (d) lista de todo el personal de planta. (Respuestas: compartido o grupo M365 / grupo de seguridad / grupo M365 + Teams / distribución.)
3. **De laboratorio (cap. 8):** crea dos usuarios, asígnales licencias; bloquea a uno, verifica que no puede hacer login; bórralo y restáuralo desde Usuarios eliminados. Cronometra: estos deben ser tus 10 clics de siempre.
4. **De laboratorio:** crea un grupo M365 desde Teams y otro desde el admin center; abre el segundo en el EAC y encuentra el buzón y el sitio que se crearon debajo. Este es el truco mental del capítulo 4.
