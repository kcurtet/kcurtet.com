---
title: "2. El vocabulario que te van a preguntar"
description: "Objetivo del capítulo: dominar los cuatro tipos de caso (incidente, solicitud, problema, cambio), entender SLA y prioridad, y distinguir los dos tipos de escalado. Es el capítulo que más se pregunta…"
curso: "itil-ticketing"
capitulo: 2
orden: 2
---
> **Objetivo del capítulo:** dominar los cuatro tipos de caso (incidente, solicitud, problema, cambio), entender SLA y prioridad, y distinguir los dos tipos de escalado. Es el capítulo que más se pregunta en las entrevistas de N1. Apréndetelo de memoria activa.

## 2.1 Los cuatro términos

### Incidente

**Definición:** interrupción no planificada de un servicio, **reducción de su calidad**, o fallo de un componente que todavía no ha afectado al usuario.

**Objetivo de su gestión:** restaurar el servicio **lo antes posible**. No busca la causa raíz: busca que el usuario vuelva a trabajar.

**Ejemplos:**

- "No me llega el correo" → incidente.
- "La VPN no conecta desde casa" → incidente.
- "El ERP va lentísimo" → incidente (degradación de calidad también lo es: no hace estar roto del todo).
- "No arranca el portátil" → incidente.

**Trampa clásica:** "he olvidado la contraseña" el usuario lo vive como incidente, pero es una **solicitud** (flujo estándar preaprobado), no una interrupción inesperada.

### Solicitud de servicio (service request)

**Definición:** petición formal de un usuario para que se le entregue algo previsto: información, acceso, hardware estándar, software estándar o un reset de credenciales.

**Objetivo de su gestión:** entregar lo pedido de forma rápida, predecible y trazable, siguiendo flujos **predefinidos y preaprobados** (catálogo de servicios). Puede requerir aprobación si implica coste (una licencia de Photoshop sí; un ratón normalmente no).

**Ejemplos:**

- "Dame una licencia de Photoshop" → solicitud.
- "Necesito acceso a la carpeta del proyecto X" → solicitud.
- "Ratón nuevo / portátil de sustitución" → solicitud.
- "Alta del nuevo comercial: equipo, correo, accesos" (onboarding) → solicitud.

### Problema

**Definición:** la **causa subyacente** (o causa probable) de uno o varios incidentes.

**Objetivo de su gestión:** encontrar la **causa raíz** (RCA, root cause analysis) y eliminarla con una solución permanente. Mientras tanto, se documenta un **workaround** (solución temporal) como **error conocido**.

**Ejemplo estrella:** "el correo cae cada lunes a las 9:00". Cada lunes genera 30 incidentes ("no me llega correo", a 30 personas). Los 30 incidentes son síntomas; el **problema** es uno: la causa común (p. ej., el backup nocturno del domingo satura el servidor). La gestión de problemas la llevan N2/N3; **el N1 la alimenta**: quien detecta el patrón eres tú, que ves pasar los tickets.

### Cambio

**Definición:** añadir, modificar o retirar cualquier cosa que pueda afectar a los servicios.

**Objetivo de su gestión:** modificar con riesgo controlado: solicitud de cambio (RFC) → evaluación → **aprobación** → implementación → revisión posterior (PIR). El comité que asesora las aprobaciones es el **CAB** (Change Advisory Board).

**Tipos:**

- **Estándar:** preaprobado, de bajo riesgo, con plantilla (alta de usuario estándar, parcheo programado). El N1 puede ejecutarlos.
- **Normal:** requiere evaluación y aprobación (migrar el servidor de correo). N1 ni lo toca.
- **Urgente/emergente:** para restaurar un servicio caído: se actúa ya y se documenta después.

**Regla de oro del N1:** *no cambias nada en producción sin aprobación*. Si tu diagnóstico lleva a una solución que implica cambio, lo propones (RFC), no lo haces.

### Tabla comparativa (memorízala)

| | Incidente | Solicitud | Problema | Cambio |
|---|---|---|---|---|
| **Qué es** | Algo que funcionaba y se rompe o degrada | Petición estándar de algo previsto | Causa raíz de uno o más incidentes | Modificación controlada de algo que afecta al servicio |
| **Objetivo** | Restaurar YA | Entregar lo pedido, rápido y trazable | Causa raíz y solución permanente | Riesgo controlado |
| **Ejemplo** | "No me llega correo" | "Dame una licencia" | "El correo cae cada lunes" | "Migramos el correo este finde" |
| **Quién lo lleva** | N1 (escala a N2 si hace falta) | N1, con aprobaciones si hay coste | N2/N3 (gestor de problemas) | Equipo de cambios / N2-N3 |
| **Métrica típica** | Tiempo de resolución (MTTR) | Tiempo de entrega | Incidentes evitados | Cambios con éxito / retrabajos |

## 2.2 SLA: los relojes de tus tickets

**SLA** (Service Level Agreement): acuerdo entre el proveedor de servicio (TI) y el cliente sobre el nivel de servicio esperado: tiempos de **respuesta** y de **resolución** por prioridad, disponibilidad, etc.

Ejemplo de tabla de SLA (cada empresa tiene la suya):

| Prioridad | 1ª respuesta | Resolución objetivo |
|---|---|---|
| P1 Crítica | 15 min | 4 h |
| P2 Alta | 30 min | 8 h laborables |
| P3 Media | 4 h | 3 días laborables |
| P4 Baja | 8 h | 5 días laborables |

Dos parientes que se mencionan menos pero existen:

- **OLA** (Operational Level Agreement): acuerdo **interno** entre equipos de TI ("N2 responde los escalados de N1 en 30 min").
- **UC** (Underpinning Contract): contrato con el **proveedor externo** ("el soporte del fabricante responde P1 en 1 h").

Lo que te afecta como N1: cada ticket tiene **relojes corriendo**. Buenas prácticas que te pedirán: si un SLA va a incumplirse, se **avisa y escala antes** de que salte (no después), y cuando esperas datos del usuario, muchos SLA se **pausan** (estado "pendiente usuario").

## 2.3 Prioridad = impacto × urgencia

- **Impacto:** a cuánto negocio/personas afecta (1 persona, un departamento, toda la empresa). Es el "cuánto duele".
- **Urgencia:** la velocidad que la situación exige (bloqueo total vs molestia tolerable). Es el "cuánto aprieta".

La **matriz de prioridad** (cada empresa ajusta los umbrales):

| Impacto \ Urgencia | Alta | Media | Baja |
|---|---|---|---|
| **Alto** (toda la empresa / servicio crítico) | **P1** | **P2** | **P3** |
| **Medio** (un departamento) | **P2** | **P3** | **P3** |
| **Bajo** (un usuario, con alternativa) | **P3** | **P4** | **P4** |

Ejemplos de cálculo:

- Toda la planta sin ERP en cierre de mes → alto × alta = **P1**.
- Un departamento sin impresión, pero pueden imprimir en otra planta → alto × media = **P2**.
- Un usuario sin micrófono de Teams pero puede llamar por móvil → bajo × media = **P4**.

Notas que demuestran criterio: la prioridad **define el SLA** (P1 = relojes cortos); algunas empresas usan matrices 4×4; y "es el director" **no** cambia la matriz — lo que puede cambiar es el impacto real de su trabajo. En la práctica las empresas tienen listas VIP, pero en la entrevista quiere oírse: *impacto × urgencia, no volumen de voz*.

## 2.4 Escalado: funcional vs jerárquico

- **Escalado funcional:** paso el ticket a **más conocimiento** (N1 → N2 → N3, o a otro equipo experto). Motivo: *no sé / no puedo resolverlo yo*.
- **Escalado jerárquico:** aviso a **más autoridad** (técnico → responsable de soporte → dirección). Motivos: SLA en riesgo, falta de recursos, conflicto entre equipos, cliente VIP que exige, decisión que supera tu nivel.

Frase para la entrevista: *"Escalo funcional cuando me falta conocimiento; jerárquico cuando me falta autoridad o recursos."*

Regla de oro: **escalar no es fracasar; escalar sin documentar sí**. Al escalar, el ticket viaja con síntoma, lo probado y lo descartado (cap. 3).

## 2.5 Glosario exprés (una línea por término)

| Término | Significado |
|---|---|
| FCR / FTR | First Contact/Time Resolution: resuelto en el primer contacto, sin escalado |
| Workaround | Solución temporal que restaura el servicio sin eliminar la causa |
| Error conocido | Problema diagnosticado con workaround documentado |
| RCA | Root Cause Analysis: análisis de causa raíz |
| MTTR | Mean Time To Resolve: tiempo medio de resolución |
| Backlog | Acumulación de tickets pendientes |
| Cola (queue) | Bandeja de tickets de un equipo, filtrada por categorías/prioridad |
| CMDB / CI | Base de datos de configuración / cada elemento registrado en ella (un equipo, una licencia, un servicio) |
| KB | Knowledge Base: base de conocimiento |
| CAB | Change Advisory Board: comité que asesora aprobaciones de cambios |
| SPOC | Single Point Of Contact: punto único de contacto (la mesa de servicio) |
| Onboarding / offboarding | Alta / baja de un empleado (equipo, accesos, correo) |

## Esto te preguntarán en la entrevista

- **"¿Diferencia entre incidente y problema?"** → *"El incidente es el síntoma: interrupción puntual ('no me llega el correo a mí'). El problema es la causa subyacente de uno o varios incidentes ('el servidor de correo se satura cada lunes'). Incidentes: restaurar rápido. Problemas: causa raíz y solución permanente."*
- **"¿Qué es un SLA?"** → *"El acuerdo con el cliente sobre el nivel de servicio esperado: tiempos de respuesta y resolución por prioridad, disponibilidad. Para mí es el reloj de cada ticket: define cuánto tengo y cuándo debo avisar que está en riesgo."*
- **"¿Cómo decides la prioridad?"** → *"Impacto por urgencia, con la matriz de la empresa. El impacto mira a cuánta gente/negocio afecta; la urgencia, cuánto aprieta. La prioridad resultante define el SLA."*

## Ejercicios

1. **Clasifica** (incidente / solicitud / problema / cambio):
   1. "Se me ha bloqueado el Word y he perdido el trabajo" → *incidente*
   2. "Necesito Photoshop para mi puesto" → *solicitud*
   3. "El CRM va lento todos los lunes desde hace un mes" → *problema* (patrón; cada lunes genera incidentes)
   4. "Migramos el servidor de correo este finde" → *cambio*
   5. "He olvidado la contraseña" → *solicitud* (flujo estándar, aunque el usuario lo viva como urgente)
   6. "Toda la planta se ha quedado sin red" → *incidente* (P1, probable incidente mayor)
   7. "Cambiamos de oficina y hay que montar 20 puestos" → *solicitud* (servicio estándar de mudanza/alta)
   8. "Al parchear el servidor anoche, el ERP se cae cada madrugada" → *problema* (causa raíz probable: el parche)
2. **Prioriza** con la matriz: (a) contabilidad sin ERP en cierre de mes; (b) becario sin acceso a una carpeta desde ayer; (c) directora sin vídeo en Teams pero con audio. → *(a) P1; (b) P3/P4; (c) P4 (bajo impacto, hay alternativa).*
3. **Escalado:** un P2 tuyo lleva 6 h sin avance de N2 y el SLA vence en 1 h. ¿Funcional o jerárquico? → *Jerárquico: aviso a mi responsable con el contexto (SLA en riesgo pese a haber escalado y documentado correctamente).*

---
[← Cap. 1: qué es ITIL](/cursos/itil-ticketing/01-que-es-itil/) · [Índice](/cursos/itil-ticketing/) · [Siguiente: el ciclo de vida del ticket →](/cursos/itil-ticketing/03-ciclo-de-vida-del-ticket/)
