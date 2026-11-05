---
title: "5. Base de conocimiento y documentación"
description: "Objetivo del capítulo: entender por qué el N1 que documenta escala más rápido en todos los sentidos, y aprender a escribir artículos de KB que sirvan a usuarios y compañeros."
curso: "itil-ticketing"
capitulo: 5
orden: 5
---
> **Objetivo del capítulo:** entender por qué el N1 que documenta escala más rápido en todos los sentidos, y aprender a escribir artículos de KB que sirvan a usuarios y compañeros.

## 5.1 Por qué documenta el N1 que asciende

La paradoja del soporte: **quien comparte lo que sabe deja de ser el cuello de botella, y eso le hace imprescindible**. Razones concretas:

- **Tu FCR sube.** Lo que resolviste una vez y documentaste, la segunda vez lo resuelves en 2 minutos leyéndote a ti mismo.
- **El equipo responde igual de bien sin ti.** Turnos de noche, vacaciones, bajas: la KB es la memoria del equipo, no tu cabeza.
- **Dejas rastro medible.** "Kevin escribió 14 artículos usados 300 veces este trimestre" es un argumento de subida de nivel (a N2, a referente) que nadie puede discutir.
- **Educas al usuario.** Un buen artículo de autoservicio evita el próximo ticket.

La idea de fondo tiene nombre: **KCS** (Knowledge-Centered Service). En una línea: *captura el conocimiento mientras trabajas, no después* — el artículo se escribe al resolver, como parte del ticket, no como tarea extra el viernes. Y "arregla una vez, aprovecha muchas".

## 5.2 Qué vive en una KB

| Tipo | Responde a | Ejemplo |
|---|---|---|
| Solución de incidente | "Esto se ha roto, ¿cómo se arregla?" | "Outlook no recibe correo externo: NDR 550 5.4.1" |
| Procedimiento / how-to | "¿Cómo se hace X?" | "Configurar la VPN en portátil corporativo" |
| FAQ | "¿Dónde pido...?" | "Cómo pedir una licencia o un monitor nuevo" |
| Documentación interna (runbook) | "¿Cómo se opera esto sin romperlo?" | "Reinicio seguro del servicio de colas de impresión" |

## 5.3 Anatomía de un buen artículo

1. **Título = como buscaría la víctima:** síntoma + error literal + sistema. "Impresora 3ª planta no imprime: documento en error bloquea la cola (Windows 10/11)" — no "Problema con la impresora".
2. **Síntomas:** qué ve el usuario, literal, con el mensaje de error exacto (búsqueda por texto del error = el 90% de los usos de una KB).
3. **Causa** (si se conoce): una línea.
4. **Solución:** pasos numerados, verificables, con capturas cuando el camino no es obvio.
5. **Notas:** a qué sistemas/versiones aplica, desde cuándo, autor, fecha.

### Malo vs bueno

**❌ Artículo malo:**

```
Impresoras

A veces la impresora se atasca. Se reinicia la cola de impresión y se arregla.
```

No dice qué síntoma, qué impresora, qué sistema, ni cómo se reinicia "la cola".

**✅ Artículo bueno:**

```
Título: Impresora no imprime y aparece "Error - Imprimiendo" en la cola (Windows 10/11, impresoras de red HP)

Síntomas
- El usuario envía a imprimir y no sale nada.
- En Cola de impresión el documento queda en "Error - Imprimiendo".
- El resto de documentos se acumulan detrás (cola bloqueada).

Causa
Un documento en error bloquea la cola del spooler del equipo del usuario.
(No es fallo de la impresora: si otros imprimen bien, es esto.)

Solución
1. Configuración → Impresoras y escáneres → abrir la cola de la impresora.
2. Menú "Impresora" → "Cancelar todos los documentos".
3. Si algo no se borra: reiniciar el servicio "Cola de impresión" (services.msc
   → "Print Spooler" → Reiniciar).
4. Volver a enviar el documento.

Notas
- Aplica a equipos Windows 10/11 con impresoras de red HP (testeado en 3ª planta).
- Si la cola se bloquea a diario en el mismo equipo, abrir incidente para N2
  (posible driver corrupto: reinstalar con el paquete del portal).
- Autor: soporte N1 · Actualizado: 2024-XX · Revisión: anual
```

## 5.4 Qué NUNCA va a una KB

- Contraseñas o credenciales de ningún tipo (ni "las de pruebas").
- Datos personales de usuarios (RGPD): nombres, correos, capturas sin tapar.
- Detalles internos críticos (IPs, rutas, nombres de administradores) en KBs de acceso público.
- Soluciones de un caso concreto sin generalizar ("el portátil de María" no; "equipos con este modelo y esta versión" sí).

## 5.5 Cuándo escribir (el hábito)

- **Resuelves algo nuevo o raro** → 3-5 minutos extra al cerrar el ticket. Es el momento KCS: lo tienes fresco.
- **Lo mismo llega 3 veces** → artículo YA. La tercera repetición es el límite.
- **Algo que solo sabes tú** → el "bus factor" de un equipo N1 es real: si solo tú sabes reiniciar tal servicio, el equipo falla cuando faltas.
- **Encuentras un artículo obsoleto** → actualizarlo vale tanto como crearlo. Una KB vieja y mentirosa es peor que no tenerla.

## Esto te preguntarán en la entrevista

- **"¿Documentarías tu trabajo? ¿Cómo?"** → *"Sí: al resolver algo nuevo, dedico unos minutos a dejar un artículo en la KB con el síntoma literal, la causa y los pasos, y actualizo los que encuentro obsoletos. Documentar en el momento, no después: es la diferencia entre un equipo que aprende y uno que repite errores."*
- **"¿Cómo compartirías una solución con el equipo?"** → *"Artículo en la KB enlazable desde el ticket, no un mensaje de chat que se pierde. Y si es un fallo recurrente con causa común, lo reporto como posible problema."*

## Ejercicios

1. **Escribe un mini-artículo** (10 líneas) para algo que hayas arreglado de verdad alguna vez (impresora, wifi, móvil...). Comprueba: ¿el título contiene el síntoma? ¿los pasos son numerables? ¿dice a qué aplica?
2. **Encuentra los 3 fallos** de este título: "Cosas del correo cuando falla (varios)". → *No dice el síntoma concreto, no incluye el mensaje de error ni el sistema afectado, y "varios" no sirve para decidir si aplica a tu caso.*
3. **Tu turno:** piensa 3 preguntas que te hayan hecho dos o más veces en cualquier contexto técnico. Ese es tu material natural de KB.

---
[← Cap. 4: herramientas](/cursos/itil-ticketing/04-herramientas-ticketing/) · [Índice](/cursos/itil-ticketing/) · [Siguiente: preguntas de entrevista →](/cursos/itil-ticketing/06-preguntas-entrevista/)
