---
title: "3. El ciclo de vida del ticket"
description: "Objetivo del capítulo: conocer el flujo de estados de un ticket de nacimiento a cierre, y aprender a escribir tickets que aceleren la resolución. El ticket es tu producto: lo que produzcas como N1…"
curso: "itil-ticketing"
capitulo: 3
orden: 3
---
> **Objetivo del capítulo:** conocer el flujo de estados de un ticket de nacimiento a cierre, y aprender a escribir tickets que aceleren la resolución. El ticket es tu producto: lo que produzcas como N1 son tickets bien gestionados.

## 3.1 El flujo de estados

```
NUEVO → ASIGNADO → EN CURSO ─┬─→ PENDIENTE (usuario / tercero) ─→ vuelve a EN CURSO
                             └─→ RESUELTO → CERRADO
                                   ↑                │
                                   └── REAPERTURA ──┘
```

Cada herramienta llama a los estados con su nombre, pero son los mismos:

| Fase | ServiceNow | GLPI | Jira SM |
|---|---|---|---|
| Nuevo | New | Nuevo | Open |
| En curso | In Progress | En curso (asignado / planificado) | In Progress |
| En espera | On Hold (Awaiting user / vendor / problem) | En espera | Pending / Waiting for customer |
| Resuelto | Resolved | Resuelto | Resolved |
| Cerrado | Closed | Cerrado | Closed |

Puntos clave de los estados:

- **Resuelto ≠ cerrado.** "Resuelto" suele activar un contador: si el usuario no replica en X días, se cierra solo. "Cerrado" es estado final; si vuelve el problema se **reabertura** (mismo ticket) o se crea uno nuevo si es otro síntoma.
- **Pendiente** es un estado legítimo, no una excusa para olvidar el ticket: muchos sistemas pausan el SLA en pendiente, envían recordatorios automáticos y hasta resuelven solos tras varios avisos sin respuesta.
- **Duplicado / cancelado** también existen: en una caída masiva se vinculan duplicados al ticket maestro en vez de resolver 50 tickets iguales.

## 3.2 El ciclo, paso a paso

### 1. Crear

Canales de entrada: portal de autoservicio, teléfono, email, chat, presencial, y la propia monitorización (que abre tickets sola ante alertas). **Regla: toda gestión genera ticket**, aunque resuelvas en la propia llamada. Sin ticket no hay historia, ni métrica, ni cobertura ("¿esto ya se avisó?" → el ticket es la respuesta).

Datos mínimos al crear: **quién** (usuario y forma de contacto), **qué** (síntoma literal, con mensajes de error exactos), **desde cuándo**, **a quién más afecta** (¿solo él? ¿su planta? ¿toda la empresa?), **desde qué equipo/servicio** y **qué necesidad de urgencia tiene** (su percepción, que luego matizas con la matriz).

### 2. Categorizar

Categoría → subcategoría → servicio afectado (ej.: Correo → Cliente Outlook → Recepción de mensajes). Por qué importa: las categorías **enrutan** a colas, sugieren artículos de la KB y hacen que los informes digan la verdad. Un plaga de tickets mal categorizados = datos basura para el jefe y tickets que se pierden.

### 3. Priorizar

Impacto × urgencia → P1-P4 → SLA asociado (cap. 2). Se reevalúa: si llega información ("¡van tres departamentos!"), se actualiza prioridad **y se explica en el ticket**.

### 4. Asignar

A ti mismo, a un compañero o a la cola de un equipo. En muchas herramientas la asignación inicial es automática por categoría; tú la corriges si cae mal.

### 5. Trabajar

- **Diagnóstico:** reproduce, aísla (¿pasa a otros usuarios? ¿en otros equipos? ¿solo en la red de la oficina? ¿solo con esa aplicación?). Cada descarte reduce el campo del que venga después.
- **Notas:** distingue comentarios **al usuario** (lenguaje claro, compromiso de siguiente actualización) de notas **internas** (hallazgos técnicos, lo probado). La mayoría de herramientas separan ambos.
- **Comunicación proactiva:** mejor un "sigo en ello, próxima actualización a las 16:00" que 6 llamadas del usuario preguntando. Un ticket silencioso parece un ticket abandonado.

### 6. Resolver

Se resuelve con **solución definitiva** o con **workaround** (y entonces, si el problema puede repetirse, se documenta el patrón: alimentas la gestión de problemas). Siempre: explicación al usuario en su idioma + qué hacer si vuelve a pasar. Ideal: resolución en primer contacto (FCR).

### 7. Cerrar

Tras confirmación del usuario (o del plazo automático). Verifica: categoría correcta, solución descrita, KB actualizada si procede, tiempo invertido registrado si se pide. Un cierre limpio es lo que evita reaperturas.

## 3.3 Cómo escribir un BUEN ticket

Anatomía de la descripción (el orden importa):

1. **Síntoma exacto**, con el mensaje de error literal (copiado, no parafraseado).
2. **Contexto:** equipo/servicio, ubicación, sistema, desde cuándo, qué cambió antes de fallar (¿actualización? ¿cambio de contraseña? ¿obra en la planta?).
3. **Alcance:** quién más está afectado (define el impacto real).
4. **Lo probado y su resultado** (reinicios, webmail, otro equipo, otra red...).
5. **Lo descartado** y por qué (red OK porque el vecino funciona; perfil OK porque falla igual en webmail).
6. **Usuario afectado + vía de contacto.**

### Malo vs bueno, lado a lado

**❌ Ticket malo:**

```
Asunto: correo
De: recepción (por teléfono)

"No me llega el correo, es urgentísimo, arregladlo ya. Llamad al 952 34X XXX."
```

Quien lo reciba tiene que llamar para preguntar: ¿correo interno o externo? ¿desde cuándo? ¿en qué equipo? ¿solo ella? Cuesta más averiguar que resolver.

**✅ Ticket bueno:**

```
Asunto: [Incidente] Outlook: no recibe correo EXTERNO desde ayer 14:00 (RECEP-PC07)

Usuario: María G. (Recepción, ext. 2140) — impacta solo a ella; 3 compañeros
de recepción funcionan con normalidad.
Servicio afectado: Correo (Outlook / Exchange).
Síntoma: no le llegan correos de fuera de la empresa; los internos sí le llegan.
         Al enviar hacia fuera recibe NDR: "550 5.4.1 Relay access denied".
Inicio: ayer ~14:00.
Contexto: cambió su contraseña el martes por la tarde.
Probado:
  - Reiniciado Outlook y el equipo → sin cambio.
  - Mismo fallo desde el webmail → descartado cliente/perfil local.
  - Compañeros en la misma VLAN OK → descartada red de la planta.
Siguiente paso: escalar a N2/Exchange para revisar la sincronización de credenciales.
```

El segundo ticket puede resolverlo **cualquiera** — incluso N2 sin llamar al usuario. Esa es la prueba de calidad: *cuánto avanza el ticket sin que nadie tenga que preguntar nada*.

## 3.4 Errores típicos del novato (y cómo no cometerlos)

- **Resolver sin ticket.** Si no está escrito, no pasó. Métrica, historia y cobertura se pierden.
- **Ticket fantasma:** días sin actualizaciones. Actualiza aunque sea "sin novedades, sigo encima".
- **Cerrar sin confirmación** ni explicación → reapertura + usuario enfadado.
- **Ping-pong estéril:** pases de equipo en equipo sin que nadie añada información. Corta el círculo documentando lo probado.
- **Jerga al usuario.** "El MX apunta al tenant equivocado" no; "la configuración que dice a los correos dónde entrar está mal, lo estamos corrigiendo" sí.
- **No registrar lo descartado.** El N2 repite tu trabajo; pierdes credibilidad y tiempo de todos.

## Esto te preguntarán en la entrevista

- **"Describe el ciclo de vida de un ticket."** → *"Se recibe por cualquier canal y se registra; se categoriza (qué servicio, qué tipo de caso); se prioriza por impacto y urgencia, que determina el SLA; se asigna; se trabaja con diagnóstico documentado y comunicación proactiva; se resuelve con solución o workaround explicado al usuario; y se cierra tras su confirmación o del plazo automático, con la solución documentada."*
- **"¿Qué haces si no puedes resolverlo?"** → *"Lo intento con tiempo acotado y consulta a la KB y a compañeros; si no avanza, escalo funcionalmente a N2 con el ticket bien documentado: síntoma, contexto, lo probado y lo descartado. Y sigo siendo yo quien informa al usuario."*

## Ejercicios

1. **Reescribe** este ticket malo: *"Asunto: no va nada. Todo el mundo sin nada, es desastre. LLAMAD YA."* → *Comprueba que tu versión tiene: alcance real (¿quiénes exactamente?), servicio/servicios afectados, inicio, mensajes de error, persona de contacto, y lo que tú ya has comprobado por teléfono (¿luz? ¿red? ¿solo una app?).*
2. **Escenario:** esperas una pieza del proveedor 3 días. ¿Estado del ticket? ¿Quién informa al usuario y con qué frecuencia? → *Pendiente de tercero/proveedor; N1 sigue siendo dueño de la comunicación; actualización proactiva diaria o según SLA, aunque no haya novedad.*
3. **Verdadero o falso:** (a) resuelto = cerrado; (b) si el usuario no contesta, puedo cerrar sin más; (c) en una caída masiva abro 50 tickets. → *(a) Falso: resuelto espera confirmación o plazo; (b) Falso: se sigue el procedimiento (avisos y cierre/resolución automáticos tras X días); (c) Falso: un ticket maestro + duplicados vinculados.*

---
[← Cap. 2: vocabulario](/cursos/itil-ticketing/02-vocabulario-itil/) · [Índice](/cursos/itil-ticketing/) · [Siguiente: las herramientas →](/cursos/itil-ticketing/04-herramientas-ticketing/)
