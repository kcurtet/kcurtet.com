---
title: "1. Qué es ITIL y por qué existe"
description: "Objetivo del capítulo: saber qué es ITIL en 30 segundos, para qué sirve en la práctica y quién es quién alrededor de la mesa de servicio. Sin historia de los años 80: solo lo que necesitas para…"
curso: "itil-ticketing"
capitulo: 1
orden: 1
---
> **Objetivo del capítulo:** saber qué es ITIL en 30 segundos, para qué sirve en la práctica y quién es quién alrededor de la mesa de servicio. Sin historia de los años 80: solo lo que necesitas para trabajar y para la entrevista.

## 1.1 Qué es ITIL, sin humo

ITIL (**Information Technology Infrastructure Library**) es el marco de buenas prácticas más usado del mundo para **gestionar servicios de TI**: cómo se entregan, se soportan y se mejoran. La versión actual es **ITIL 4**.

Lo importante para ti:

- **No es software.** Nadie "instala ITIL". Es un conjunto de prácticas que las empresas adoptan, completas o en parte.
- **No es una norma certificable** tipo ISO. Nadie audita el "cumplimiento ITIL": cada empresa coge lo que le sirve.
- **Es un lenguaje común.** Cuando un jefe de soporte dice "eso no es un incidente, ábrelo como solicitud" o "escálalo funcionalmente", está hablando ITIL. Este libro te enseña ese idioma.

**Por qué existe:** durante años, TI se gestionó como "arreglar ordenadores". ITIL parte de otra idea: la TI existe para **prestar servicios** al negocio. Nadie contrata a un técnico para mantener un servidor; lo contratan para que 200 personas puedan trabajar. Ese cambio de enfoque —de la máquina al servicio— es toda la filosofía ITIL que necesitas.

## 1.2 Dos palabras que lo cambian todo: servicio y valor

**Servicio:** un medio de **entregar valor** a un cliente, facilitándole un resultado que este quiere lograr **sin asumir costes ni riesgos específicos**.

Traducción: el usuario quiere enviar y recibir correo. No quiere saber nada de servidores, certificados ni DNS. El **servicio de correo** le entrega ese resultado; el coste y el riesgo los gestiona TI. Ejemplos de servicios en una empresa: correo, VPN, wifi, impresión, portátiles corporativos, ERP, telefonía, acceso a carpetas compartidas.

**Valor:** el beneficio que percibe el usuario. Detalle clave de ITIL 4: el valor se **co-crea** — el servicio funciona cuando proveedor y usuario colaboran. Tú co-creas valor cada vez que un usuario te da un dato que acelera el diagnóstico o tú le enseñas a resolverlo él mismo la próxima vez.

## 1.3 ITIL 4 en 60 segundos (solo lo que se toca)

ITIL 4 organiza todo en un **Sistema de Valor de Servicio** con una **cadena de valor** (planificar, mejorar, involucrar al cliente, diseñar y transicionar, obtener y construir, **entregar y soportar**) y **34 prácticas**. La actividad "entregar y soportar" es donde vive la mesa de servicio, es decir, tú.

Las 8 prácticas que tocarás como N1:

| Práctica | En cristiano | Tu papel |
|----------|--------------|----------|
| Mesa de servicio | Punto único de contacto entre usuarios y TI | **Eres esto.** Recibes por teléfono, portal, email y chat |
| Gestión de incidentes | Restaurar el servicio lo antes posible | Resuelves o escalas (cap. 2 y 3) |
| Gestión de solicitudes | Entregar lo que el usuario pide (licencias, accesos...) | Gestionas el catálogo (cap. 2) |
| Gestión de problemas | Buscar la causa raíz de incidentes repetidos | La llevan N2/N3; tú alimentas con patrones (cap. 2) |
| Gestión de cambios | Modificar la infraestructura de forma controlada | No tocas producción; ejecutas cambios estándar (cap. 2) |
| Gestión del conocimiento | Base de conocimiento (KB) | Documentas y consultas (cap. 5) |
| Gestión de activos y configuración | Inventario vivo: la CMDB | Consultas el historial del equipo (cap. 4) |
| Gestión de niveles de servicio | Los SLA: los relojes de cada ticket | Cumples tiempos y avisas si hay riesgo (cap. 2) |

Si en la entrevista citas los **principios rectores** de ITIL 4, con dos basta: *"enfoque en el valor"* y *"empieza donde estás"*. No recites los siete.

## 1.4 El mapa de actores

```
Usuario ──► Mesa de servicio (N1) ──► N2: especialistas ──► N3: desarrollo / proveedor
(cliente)     punto único de contacto     redes, sistemas,        administradores senior,
              (SPOC), primera línea       aplicaciones            soporte del fabricante
```

- **Usuario:** la persona que usa el servicio y te llama. El **cliente** es quien paga el servicio (en soporte interno, "el cliente" es la propia empresa).
- **Service desk / mesa de servicio (N1):** el **punto único de contacto** (SPOC) entre usuarios y TI. Filtra, clasifica, resuelve y escala. Primera línea.
- **N2:** especialistas por área (redes, sistemas, aplicaciones). Reciben lo escalado por N1 y analizan más hondo.
- **N3:** desarrollo, administradores senior y **proveedores externos** (soporte del fabricante, operadora). Última línea.
- **Gestor de incidentes / responsable de soporte:** coordina cuando algo es grave o masivo.

Ejemplo del recorrido completo: cae el correo → 40 usuarios llaman → N1 detecta el patrón, abre un incidente mayor y escala a N2 → N2 identifica el servidor → el fabricante (N3) publica el parche. Fíjate en lo importante: **el usuario nunca habló con N2 ni con N3**. Aunque no lo arregles tú, **al usuario le informa N1**. Esa es la regla de oro de la primera línea: eres la única voz de TI hacia el usuario.

## 1.5 Tu papel como N1 (lo que de verdad te contratan para)

1. **Filtro:** el 60-80% de las incidencias se resuelven en primera línea. Todo lo que no pasa de ti es tiempo que N2 dedica a otras cosas.
2. **Clasificador:** un ticket bien categorizado y priorizado está medio resuelto.
3. **Comunicador:** gestionas expectativas del usuario; eres la cara de TI.
4. **Documentador:** dejas rastro en el ticket y alimentas la base de conocimiento (cap. 5).

## Esto te preguntarán en la entrevista

- **"¿Conoces ITIL?"** → *"Sí, a nivel práctico. Es el marco de buenas prácticas para la gestión de servicios TI. De él uso los conceptos de incidente, solicitud, problema y cambio, la priorización por impacto y urgencia, y el flujo de vida del ticket. No tengo la certificación Foundation todavía, pero manejo el vocabulario y el método."*
- **"¿Qué es un servicio para TI?"** → *"Un medio de entregar valor al usuario sin que él cargue con el coste ni el riesgo: el usuario quiere enviar correo, no mantener un servidor de correo."*

## Ejercicios

1. **Explica ITIL en 3 frases**, en voz alta y sin mirar. *Guía: marco de buenas prácticas → gestión de servicios, no máquinas → yo uso el vocabulario (incidente, SLA, escalado...).*
2. **En una oficina de 50 personas, lista 6 servicios TI.** *Trampa habitual: listar tecnologías (Exchange, Active Directory). Servicio = lo que usa el usuario: correo, wifi, impresión, VPN, carpetas, ERP.*
3. **Sigue el recorrido de "no puedo imprimir en 3ª planta" por N1 → N2 → N3.** ¿Qué hace cada nivel? *Guía: N1 diagnostica (¿solo esa persona? ¿solo esa impresora?) y descarta lo básico; N2 revisa servidor de impresión/red; N3/fabricante si es fallo del driver o hardware.*

---
[← Volver al índice](/cursos/itil-ticketing/) · [Siguiente: el vocabulario que te van a preguntar →](/cursos/itil-ticketing/02-vocabulario-itil/)
