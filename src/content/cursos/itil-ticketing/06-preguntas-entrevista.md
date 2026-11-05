---
title: "6. Preguntas de entrevista con respuestas modelo"
description: "Objetivo del capítulo: 12 preguntas reales de procesos de Helpdesk/N1 en España, cada una con lo que el entrevistador quiere oír, una respuesta modelo y la trampa a evitar. Léelo dos veces: la…"
curso: "itil-ticketing"
capitulo: 6
orden: 6
---
> **Objetivo del capítulo:** 12 preguntas reales de procesos de Helpdesk/N1 en España, cada una con lo que el entrevistador quiere oír, una respuesta modelo y la trampa a evitar. Léelo dos veces: la segunda, en voz alta. Las respuestas modelo son guiones: hazlas tuyas con tus ejemplos.

## 6.1 ¿Qué es ITIL?

**Buscan:** que no te vayas por las ramas ni recites certification-speak.
**Respuesta modelo:** *"ITIL es el marco de buenas prácticas más usado para gestionar servicios TI. La idea clave: la TI existe para dar servicio al negocio, no al revés. En el día a día de un N1 se traduce en gestionar incidentes y solicitudes con un ciclo de vida del ticket, priorizar por impacto y urgencia según SLA, y escalar correctamente."*
**Trampa:** recitar la historia de ITIL o las 34 prácticas de memoria. Con el mapa mental basta.

## 6.2 Diferencia entre incidente y problema (la más preguntada)

**Buscan:** el concepto síntoma/causa en una frase.
**Respuesta modelo:** *"El incidente es el síntoma: una interrupción puntual, como 'no me llega el correo a mí'. El problema es la causa subyacente de uno o varios incidentes: 'el correo cae cada lunes a las 9'. La gestión de incidentes restaura el servicio rápido; la de problemas busca la causa raíz y la solución permanente. Como N1, resuelvo incidentes y reporto patrones que alimentan los problemas."*
**Trampa:** decir que el problema es "un incidente grave". No: son cosas distintas, no tamaños.

## 6.3 ¿Y entre incidente y solicitud de servicio?

**Respuesta modelo:** *"El incidente rompe o degrada algo que funcionaba: 'no me llega el correo'. La solicitud pide algo previsto y preaprobado del catálogo: una licencia, un acceso, un ratón. Clave práctica: si el servicio está roto, incidente; si pides algo nuevo estándar, solicitud. Y el reset de contraseña, aunque el usuario lo viva como urgente, es solicitud."*
**Trampa:** clasificar el reset de contraseña como incidente.

## 6.4 ¿Qué es un SLA y por qué importa?

**Respuesta modelo:** *"El acuerdo entre TI y el cliente sobre el nivel de servicio: tiempos de respuesta y resolución por prioridad, disponibilidad... Para mí es el reloj de cada ticket: me dice cuánto tengo para responder y resolver, cuándo pausar (pendiente del usuario) y cuándo avisar de que el SLA está en riesgo antes de que se incumpla. Un SLA incumplido tiene impacto contractual y de imagen."*
**Trampa:** definirlo como "un tiempo límite" sin hablar de comunicación proactiva. El valor del N1 está en avisar antes, no en disculparse después.

## 6.5 ¿Cómo decides la prioridad de un ticket?

**Respuesta modelo:** *"Impacto por urgencia, con la matriz de la empresa. Impacto: a cuántas personas o qué proceso crítico afecta. Urgencia: cuánto aprieta la situación. El resultado, P1 a P4, determina el SLA. Y se reevalúa: si resulta que afecta a más gente, subo prioridad y lo justifico en el ticket."*
**Trampa:** decir que priorizas por "quien grita más" o "quien es el jefe". Menciona VIP solo como matiz realista ("hay listas VIP, pero el criterio base es la matriz").

## 6.6 Tienes dos tickets urgentes a la vez. ¿Qué haces?

**Buscan:** método con sangre fría, no heroísmo.
**Respuesta modelo:** *"Primero comparo impacto real con la matriz: un servicio caído para toda la planta va antes que un P2 aunque quien lo reporte grite más. Compruebo si son el mismo incidente (las caídas masivas generan duplicados). Si ambos son realmente P1 y no puedo con los dos, activo al equipo/escalo el que tenga el SLA más apretado y al segundo usuario le doy respuesta de acuse con tiempo estimado. Y si detecto caída masiva, aviso a mi responsable: puede ser un incidente mayor."*
**Trampa:** "me pongo con el primero que llegó". FIFO no es priorización.

## 6.7 Un usuario te llama enfadado y te grita. ¿Cómo lo gestionas?

**Buscan:** madurez y técnica de comunicación.
**Respuesta modelo:** *"Le dejo desahogarse sin interrumpir; no me lo tomo personal: está enfadado con la situación, no conmigo. Valido el problema ('entiendo que llevo sin poder trabajar desde ayer, eso bloquea; vamos a verlo ahora mismo'), tomo datos y me centro en lo técnico. Cierro con un compromiso concreto: número de ticket y cuándo tendrá la próxima actualización. Si hay insultos o amenazas, mantengo la calma y lo derivo a mi responsable: eso ya es escalado jerárquico."*
**Trampa:** prometer soluciones inmediatas para que cuelgue, o discutir. El objetivo: que cuelgue sintiendo que alguien está encima de su problema.

## 6.8 No sabes resolver un ticket. ¿Qué haces?

**Buscan:** que escalas a tiempo y bien.
**Respuesta modelo:** *"Tengo una regla de tiempo: si en 15-20 minutos no avanzo, consulto la KB y a un compañero; si sigue sin avanzar, escalo funcionalmente a N2 con el ticket bien documentado: síntoma, contexto, lo probado y lo descartado. Es mejor escalar pronto y documentado que tener un ticket horas parado. Escalar no es fracasar: es el diseño del sistema. Y aunque escale, sigo siendo yo quien informa al usuario."*
**Trampa:** "no escalo nunca hasta agotar todas las opciones" (te quedas horas con el ticket) o "escalo al momento" (no aportas valor de filtro). El equilibrio es el tiempo acotado + la documentación.

## 6.9 Un usuario te pide algo que excede tus permisos (leer el buzón de otro, borrar datos, dar accesos). ¿Qué haces?

**Buscan:** criterio y compliance. Aquí se juegan la confianza.
**Respuesta modelo:** *"N1 trabaja con permisos limitados por diseño, y eso protege al usuario, a la empresa y a mí. No lo intento por mi cuenta: lo canalizo por el procedimiento correcto — ticket a N2 con la justificación, RRHH si es tema laboral, seguridad si hay algo raro — y le explico al usuario por qué camino va su petición. Si me lo pide insistiendo 'es urgente', igual: lo urgente no cambia el procedimiento."*
**Trampa:** decir que lo harías "si es un jefe". Los privilegios se piden por proceso, no por jerarquía al teléfono.

## 6.10 ¿Has usado GLPI / ServiceNow / Jira u otro ticketing? (sin experiencia)

**Respuesta modelo** (honestidad + transferencia + iniciativa, cap. 4): *"No en producción todavía, pero conozco el flujo ITIL completo — registrar, categorizar, priorizar por impacto y urgencia, documentar, escalar, resolver y cerrar — y he probado la demo de GLPI y una cuenta gratuita de Jira Service Management para trabajar una cola de verdad. La herramienta se aprende en días; el método ya lo tengo."*
**Trampa:** mentir con experiencia que no tienes (caes en la primera pregunta de seguimiento).

## 6.11 Cae un servicio y empiezan a entrar llamadas de media empresa. ¿Qué haces?

**Buscan:** visión de incidente mayor, no de ticket individual.
**Respuesta modelo:** *"Detecto el patrón: mismo servicio, muchos usuarios. No abro un ticket por llamada: identifico o abro el ticket maestro del incidente mayor, vinculo los demás como duplicados y a cada llamante le doy el mensaje de estado. Aviso a mi responsable y a N2 según procedimiento, y compruebo si hay aviso en el canal de comunicación oficial. Si es posible, publico comunicación proactiva (portal/email): cada aviso evita decenas de llamadas."*
**Trampa:** ponerte a diagnosticar solo mientras el teléfono echa humo. N1 coordina y comunica; la causa la ataca N2.

## 6.12 ¿Qué es para ti un buen soporte? / ¿Cómo sabes que lo hiciste bien?

**Buscan:** orientación a servicio, no a cerrar tickets como sea.
**Respuesta modelo:** *"El que el usuario apenas nota: las cosas funcionan y, cuando fallan, respuesta rápida y comunicación clara. Se mide: resolución en primer contacto, cumplimiento de SLA y satisfacción del usuario (CSAT). Mi parte: resolver en primera línea cuando se pueda y, si no puedo, que el usuario sepa siempre en qué punto está su problema."*
**Variante "¿por qué N1?":** *"Es donde se ve de todo — redes, sistemas, aplicaciones y usuarios — y donde se aprende el negocio real de TI. Quiero dominar el entorno y el método para crecer hacia N2 o una especialización."*

## Checklist de la noche antes

- [ ] Sé definir incidente / solicitud / problema / cambio con un ejemplo cada uno (cap. 2).
- [ ] Sé recitar la matriz impacto × urgencia y qué SLA suele asociarse a cada P (cap. 2).
- [ ] Sé contar el ciclo de vida del ticket en 30 segundos (cap. 3).
- [ ] Tengo mi respuesta de "ticketing sin experiencia" ensayada en voz alta (cap. 4).
- [ ] Tengo respuesta para: dos urgentes, usuario enfadado, no sé resolverlo, fuera de mis permisos, caída masiva (cap. 6).
- [ ] He tocado la demo de GLPI o JSM free al menos 20 minutos (cap. 4).

## Guion de tu primera semana (bonus)

1. **Día 1:** pide acceso, lee la KB interna (empieza por "cómo trabajamos") y la matriz de prioridad y SLA de la empresa. Aprende quién es N2 de qué.
2. **Días 2-3:** coge tickets P4/P3 con un compañero de referencia ("shadowing"). Pregunta por las plantillas de respuesta.
3. **Días 4-5:** intenta el FCR en lo básico (impresoras, accesos, perfiles) y documenta lo primero que resuelvas y no esté en la KB. Ese artículo es tu primer CV interno.

## Simulacro (ejercicios)

1. **En voz alta, cronometrado:** responde 60 segundos a: incidente vs problema, dos urgentes a la vez, usuario enfadado. Si te trabas, versión corta y reintentos hasta que salga fluido.
2. **Mock de 10 minutos:** pide a alguien (o a una IA de chat) que te haga 5 preguntas al azar de este capítulo sin avisarte cuáles. Entrevistar es un deporte de improvisación sobre base preparada.
3. **Tu ejemplo personal:** prepara un caso real tuyo (algo que arreglaste, aunque sea doméstico) en 4 frases: situación, qué hiciste, resultado, qué documentarías ahora. Es la munición para "cuéntame un caso difícil".

---
[← Cap. 5: base de conocimiento](/cursos/itil-ticketing/05-base-de-conocimiento/) · [Índice](/cursos/itil-ticketing/)
