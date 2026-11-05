---
title: "4. Las herramientas: GLPI, ServiceNow, Jira Service Management"
description: "Objetivo del capítulo: entender qué comparten todas las herramientas de ticketing (el 80%), qué diferencia a las tres grandes que te cruzarás en España, y cómo responder a \"¿has usado un ticketing?\"…"
curso: "itil-ticketing"
capitulo: 4
orden: 4
---
> **Objetivo del capítulo:** entender qué comparten todas las herramientas de ticketing (el 80%), qué diferencia a las tres grandes que te cruzarás en España, y cómo responder a "¿has usado un ticketing?" sin experiencia real.

## 4.1 La idea que quita el miedo

Los ITSM se parecen mucho más entre sí de lo que parece. Si entiendes el flujo del capítulo 3 (crear → categorizar → priorizar → asignar → trabajar → resolver → cerrar), ya sabes usar el 80% de cualquier herramienta: lo único que cambia es **dónde están los botones**. En el trabajo te dan una cuenta y en una semana de cola ya eres funcional; el método es lo que cuesta, y ya lo tienes.

## 4.2 El 80% común a todas

| Pieza | Qué es | Para qué te sirve |
|---|---|---|
| Portal de autoservicio | Web donde el usuario crea tickets y consulta estado | Reduce llamadas; los tickets llegan ya con formulario |
| Cola (queue) | Bandeja del equipo, filtrable por categoría/prioridad/SLA | Tu pantalla de trabajo: qué toca ahora |
| Formulario de ticket | Campos: usuario, categoría, servicio, prioridad, descripción | Dónde aplicas el capítulo 3 |
| Estados y transiciones | El ciclo de vida del ticket | Saber en qué está cada cosa |
| Temporizadores de SLA | Relojes de respuesta/resolución por prioridad | Priorizar tu día; detectar SLA en riesgo |
| Base de conocimiento (KB) | Artículos de soluciones | Tu primera parada antes de escalar |
| CMDB / inventario | Registro de CIs (equipos, software, servicios) y sus relaciones | Historial del equipo "PORTATIL-1234": dueño, garantía, tickets previos |
| Notificaciones y automatizaciones | Emails y reglas automáticas | Enterarte de asignaciones y vencimientos |

**CMDB en una frase** (pregunta habitual): *"el inventario vivo de todos los elementos de configuración y de cómo se relacionan entre sí: este portátil, con esta licencia, conectado a este servicio, asignado a esta persona"*. Como N1 la consultas (y debes enlazar tus tickets a los CIs); no la administras.

## 4.3 Las tres grandes, a nivel usuario

### GLPI

- **Qué es:** ITSM open source (Gestionnaire Libre de Parc Informatique), gratuito y mantenido por Teclib'. Referencia en Francia y **muy usado en España en pymes y administraciones**.
- **Fuerte en:** gestión de **inventario** de activos (agentes que inventarían los equipos automáticamente) + ticketing ITIL completo: categorías, SLA con calendarios laborales, plantillas, seguimientos (follow-ups), actores (solicitante, técnico, observador).
- **Como agente notas:** interfaz densa y funcional antes que bonita; todo gira alrededor del activo afectado; los estados son Nuevo / En curso / En espera / Resuelto / Cerrado, con "pendiente" muy desarrollado (recordatorios y resolución automáticos si el usuario no contesta).
- **Por qué te importa:** en ofertas españolas de N1 aparece constantemente. Y es el más fácil de **probar gratis** (demo pública o instalarlo).

### ServiceNow

- **Qué es:** la plataforma empresarial líder (SaaS, de pago, "la de las grandes cuentas"). ITSM completo + HR, seguridad, etc. Muy habitual en multinacionales y empresas de outsourcing (IBM, Accenture, etc.).
- **Como agente notas:** todo son **listas y formularios**; los módulos se llaman Incident, Request, Problem, Change, Knowledge; trabajas con **grupos de asignación**; separas *additional comments* (al usuario) de *work notes* (internas); estados New / In Progress / On Hold / Resolved / Closed.
- **Por qué te importa:** si la oferta es de cuenta grande, casi seguro es esto. Su ecosistema de certificaciones es de los mejor pagados si algún día quieres crecer.

### Jira Service Management (JSM)

- **Qué es:** el ITSM de Atlassian, nacido de Jira. Muy común en **empresas de software y entornos ágiles**.
- **Como agente notas:** **colas visuales** muy claras; los **SLA se ven como contadores en vivo** en cada ticket (tiempo consumido/restante); comentarios públicos vs internos; integración natural con los equipos de desarrollo (tu bug escalado entra en su tablero).
- **Por qué te importa:** tiene **plan gratuito para equipos pequeños**, así que puedes montarte una instancia real en una tarde.

### Otros nombres que te puedes cruzar

Zendesk (soporte al cliente generalista), Freshservice (ITSM moderno), OTRS/Znuny (open source clásico), BMC Remedy (veterano en banca y seguros), ManageEngine ServiceDesk Plus, TOPDESK, Ivanti/HEAT. Si aparece uno que no conoces en la oferta: mira un vídeo de 10 min de "agente primer día" antes de la entrevista.

## 4.4 "¿Has usado un sistema de tickets?" — responder sin experiencia

Estructura de respuesta en 3 pasos: **honestidad rápida + transferencia del método + demostración de iniciativa**.

> *"No he usado [ServiceNow] en producción todavía, pero conozco el flujo ITIL completo: registrar, categorizar, priorizar por impacto y urgencia según SLA, documentar lo probado y lo descartado, escalar funcionalmente cuando toca y mantener informado al usuario. Para conocer la herramienta me he montado una cuenta gratuita de Jira Service Management y he probado la demo de GLPI: crear tickets, mover estados, enlazar la KB. La herramienta se aprende en días; el método ya lo tengo."*

Y hazlo de verdad: **una tarde con la demo de GLPI o un JSM gratuito** convierte esa respuesta en verdad comprobable. En la entrevista puedes soltar: *"en GLPI, el ticket en espera lanza recordatorios automáticos y hasta puede auto-resolverse"* — ese nivel de detalle, escuchado de un candidato sin experiencia, contrata.

## Esto te preguntarán en la entrevista

- **"¿Conoces GLPI / ServiceNow / Jira?"** → usa la estructura del apartado 4.4, adaptada a la herramienta de la oferta.
- **"¿Qué comparten todas las herramientas de ticketing?"** → *"El concepto: cola, ciclo de estados, priorización con SLA, base de conocimiento e inventario. Cambian nombres y pantallas, no el método."*

## Ejercicios

1. **Mapea estados:** un ticket ServiceNow pasa a "On Hold — Awaiting Caller". ¿Cómo se llamaría en GLPI y en Jira SM? → *GLPI: "En espera" (con motivo pendiente); Jira SM: "Waiting for customer".*
2. **Escribe tu respuesta de 30 segundos** a "¿has usado ticketing?", con la herramienta concreta de una oferta real que hayas visto.
3. **Toca una herramienta:** entra en la demo pública de GLPI o crea una cuenta gratuita de Jira SM. Crea un ticket, priorízalo, muévelo de estado y enlázalo a un artículo de KB. Total: 60-90 minutos que valen una entrevista.

---
[← Cap. 3: ciclo de vida del ticket](/cursos/itil-ticketing/03-ciclo-de-vida-del-ticket/) · [Índice](/cursos/itil-ticketing/) · [Siguiente: base de conocimiento →](/cursos/itil-ticketing/05-base-de-conocimiento/)
