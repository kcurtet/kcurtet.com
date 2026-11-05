---
title: "5 · OneDrive y SharePoint: ficheros, permisos y resurrecciones"
description: "OneDrive es de la persona; SharePoint es del equipo. Esa frase de diez palabras evita la mitad de los dramas de 'se me perdió el archivo' — y la otra mitad se arregla sabiendo que casi nada se borra…"
curso: "microsoft-365"
capitulo: 5
orden: 5
---
> «OneDrive es de la persona; SharePoint es del equipo. Esa frase de diez palabras evita la mitad de los dramas de 'se me perdió el archivo' — y la otra mitad se arregla sabiendo que casi nada se borra de verdad a la primera.»

## Objetivos

- Distinguir OneDrive de SharePoint y saber qué contenido vive en cada uno.
- Manejar compartir externo con enlaces (tipos, caducidad, contraseñas) y permisos de sitio.
- Diagnosticar problemas de sincronización del cliente OneDrive.
- Ejecutar con método el ticket «se me borró el archivo»: versiones, papelera de dos etapas, restauración.

## 5.1 El mapa: OneDrive vs SharePoint

La analogía con tu Google Workspace es literal: **OneDrive es el Drive personal; SharePoint (sitios de equipo) son los shared drives**. Mismas reglas de juego, mismos dolores:

| | **OneDrive** | **SharePoint** |
|---|--------------|----------------|
| De quién es | De cada usuario (1 TB por defecto) | Del sitio/equipo |
| Qué guarda | Sus documentos personales | Documentos del equipo (incluidos TODOS los ficheros de Teams, cap. 4) |
| Si el dueño se va | Se retiene ~30 días y se borra (salvo delegación en offboarding, cap. 2) | Nada se pierde: el contenido es del sitio |
| Compartir | Sí, con enlaces | Sí, además con permisos granulares por sitio |

Consecuencia cultural que explican en toda empresa: **el trabajo importante va en el sitio del equipo, no en OneDrive personal**, porque la persona puede irse. Ticket emocional clásico: «el comercial se fue y con él las ofertas» → si estaban en su OneDrive, hay ~30 días de ventana para rescatarlas delegando acceso (capítulo 2); si estaban en el sitio del equipo, ni siquiera hubo problema.

El «sitio SharePoint» de un equipo de Teams es el mismo del capítulo 4: una biblioteca de documentos con una carpeta por canal. Cuando en Soporte hablan de «los ficheros de Teams», están hablando de SharePoint.

## 5.2 Compartir: enlaces y permisos

Los **enlaces para compartir** (sharing links) tienen tres tipos — la traducción de Workspace es directa:

- **Cualquiera** (Anyone): quien tenga el enlace, sin login. Como «cualquiera con el enlace de Google». El más cómodo y el más odiado por seguridad.
- **Personas de la organización**: cualquier empleado con login.
- **Personas específicas**: correos concretos, con login. El único tipo razonable para externos con datos sensibles.

Todo enlace puede llevar **caducidad** y **contraseña** (los «anyone» deberían llevar ambas siempre), y se puede bloquear la descarga o dar solo vista. La **configuración de uso compartido externo** existe a dos niveles: global del tenant y por sitio — y el más restrictivo gana. Por eso a veces «este equipo sí puede compartir con cualquiera y este no»: es configuración, no capricho.

Flujo L1 del ticket «no puedo abrir el enlace que me mandaron»: ¿qué tipo de enlace es? (si es «específico» y tú no estabas en la lista → te añaden), ¿caducó?, ¿pide login con la cuenta equivocada (cuenta personal de Microsoft vs cuenta del trabajo — error diario universal), ¿está habilitado el externo en ese sitio? La pista del error te dice cuál: «necesita permisos» vs «el enlace ha expirado» vs «inicie sesión con su cuenta de organización».

Permisos dentro de un sitio: **propietarios / miembros / visitantes** (control total / editar / leer), heredados de la membresía del grupo M365 del equipo (capítulos 2 y 4). Romper la herencia en una carpeta concreta es posible (granular) — a nivel L1: mirar el botón «Acceso» / «Administrar acceso» del ítem antes de prometer nada.

## 5.3 El cliente de sincronización

**OneDrive.exe** sincroniza SharePoint y OneDrive al Explorador de Windows (y hay cliente para Mac). Conceptos útiles:

- **Files On-Demand**: los ficheros se muestran en el explorador pero solo ocupan disco al abrirse (estados: nube, disponible, siempre aquí). Explica «tengo el archivo pero pesa 0 bytes».
- **Known Folder Move**: Escritorio/Documentos/Imágenes redirigidos a OneDrive — por eso en muchos portátiles corporativos «el escritorio se sincroniza».
- El icono de la bandeja es tu tablero: nube azul = sano; pausado, atención roja = problemas.

Tickets de sync y su solución rápida:

| Síntoma | Causa típica | Acción |
|---------|--------------|--------|
| Pausado | El usuario pausó o se quedó sin conexión/quota | Reanudar desde el icono |
| X roja, «los cambios no se pueden cargar» | Fichero bloqueado o **nombre inválido** | Renombrar: Windows prohíbe `* " : < > ? / \ |` y nombres acabados en punto/espacio; y ojo a rutas >256 caracteres |
| «Firmado fuera» constantemente | Caché/credenciales | Cerrar sesión y re-autenticar; «Restablecer OneDrive» (reset del cliente) |
| «No puedo añadir otra cuenta» | Licencia o permisos sobre la biblioteca | Verificar licencia y acceso al sitio |

La pregunta de always: **¿es un problema del fichero, del cliente o del servicio?** Probar en la web primero: si el fichero se ve bien en la web, el problema es del cliente local (sync), no de los datos. Esa partición web-vs-cliente resuelve el 70% de tickets de ficheros.

## 5.4 Versiones y papelera: casi nada muere a la primera

Dos mecanismos de resurrección, ambos gratuitos y a nivel usuario:

1. **Historial de versiones** (clic derecho → Version history): cada guardado es una versión. Sirve para el caso «el archivo está pero con contenido equivocado» — se sobrescribió, no se borró.
2. **Papelera en dos etapas, 93 días**: papelera del usuario (primera etapa; se vacía sola a los 93 días) → papelera de la colección de sitios (segunda etapa; otros 93 días desde que se vació la primera). OneDrive y SharePoint funcionan igual. La ruta exacta: icono de engranaje → Papelera de reciclaje; la segunda etapa se abre desde el enlace de abajo («restaurar del conjunto de sitios»).

Y el tercer mecanismo, corporativo: **restaurar sitio completo** (site restore, primeros 93 días) y **OneDrive «Restaurar todo»** — una línea temporal para deshacer un incidente masivo (ransomware, sincronización con borrar masivo). A nivel L1 saben que existen; los ejecutan (N2) en incidentes.

**Retención (Purview) en una frase de entrevista**: las políticas de retención de Purview mantienen copias de datos (correo, Teams, SharePoint) durante un periodo fijado aunque el usuario los borre — si hay retención, hasta lo borrado es recuperable por N2/compliance. Es el Vault de Microsoft. «Hay hold» es respuesta aceptada.

## 5.5 El ticket: «se me borró el archivo»

Método en cuatro preguntas:

1. **¿Dónde vivía?** (OneDrive personal / sitio de equipo / canal de Teams → SharePoint). Define qué papelera mirar.
2. **¿Borrado o sobrescrito/desaparecido?** Sobrescrito → versiones. Borrado → papelera. «Desapareció» → quizá lo movió otra persona con acceso (buscar por nombre en el sitio) o lo retiene un sync del cliente.
3. **¿Cuándo?** (las papeleras tienen reloj: 93+93 días)
4. **¿Quién más tenía acceso?** (actividad del sitio: engranaje → Configuración del sitio → informe de actividad, o el propietario lo ve)

Y el último recurso con plazo: si venía de un usuario borrado, su OneDrive tiene ~30 días de delegación (capítulo 2) — corre.

Fallo típico de diagnóstico: buscar en la papelera **de OneDrive** algo que vivía en el **sitio del equipo**. Volver a la sección 5.1 antes de prometer nada.

## Esto te preguntarán en la entrevista

**P: ¿Diferencia entre OneDrive y SharePoint?**
R: OneDrive es la biblioteca personal de cada usuario; SharePoint son los sitios de equipo, incluidos los ficheros de Teams. El contenido de OneDrive se va con el usuario (retención ~30 días tras la baja); el de SharePoint pertenece al sitio y sobrevive a las personas. Uno es personal, el otro es del equipo.

**P: ¿Cuánto dura la papelera de SharePoint/OneDrive?**
R: Dos etapas: 93 días en la papelera del usuario y otros 93 en la papelera del sitio tras vaciarse la primera. Además, el historial de versiones cubre sobrescrituras, y las políticas de retención de Purview pueden conservar datos borrados durante el periodo que la empresa fije.

**P: Un usuario borró un fichero del canal de Teams hace dos días. Pasos.**
R: Ese fichero vive en el sitio SharePoint del equipo: abro la papelera del sitio desde el propio Teams (Abrir en SharePoint) o la web, localizo el ítem y lo restauro. Si no aparece, segunda etapa y versiones; y si el borrado fue masivo, restauración del sitio / escalado con fecha exacta.

**P: Tipos de enlace para compartir y cuál usarías con un externo.**
R: Cualquiera (sin login), personas de la organización y personas específicas. Con externos y datos sensibles: personas específicas con inicio de sesión, idealmente con caducidad; los «cualquiera» solo para contenido insensible y siempre con caducidad/contraseña. La política de externos del tenant y del sitio puede restringirlo todo.

**P: El archivo de un usuario se sincronizó mal y ahora pesa 0 bytes.**
R: Files On-Demand: el fichero está en la nube y solo es un marcador local hasta abrirse — no es un error. Si además hay X roja, reviso errores del cliente (nombre inválido, ruta larga, sesión pausada) y confirmo en la web que el fichero está íntegro; la web es la fuente de verdad frente al cliente local.

## Ejercicios prácticos

1. **De papel:** dibuja el árbol de decisión de «se me borró el archivo» completo (¿dónde vivía?, ¿borrado o sobrescrito?, ¿cuándo?, ¿quién tenía acceso?) y ponle tiempos límite a cada rama (93+93 días, 30 días baja, versiones ilimitadas en la práctica).
2. **De papel:** clasifica dónde vive cada contenido: «la presentación de mi evaluación», «la wiki del departamento», «los ficheros del canal General del equipo de Marketing», «los documentos del escritorio del portátil del CEO» (OneDrive / sitio / sitio-SharePoint / OneDrive por Known Folder Move).
3. **De laboratorio (cap. 8):** sube un fichero a un sitio de equipo, edítalo tres veces, borra una versión antigua y recupérala con el historial; borra el fichero, vacía la papelera de primera etapa y recupéralo de la segunda. Cronometra cuánto tarda cada resurrección.
4. **De laboratorio:** crea los tres tipos de enlace sobre el mismo documento (cualquiera / organización / específico) y ábrelos desde una ventana privada. Anota el mensaje de error de cada caso incorrecto: esos mensajes son los que traducirás en tickets reales.
5. **Trampa:** una empresa prohíbe los enlaces «cualquiera». Un usuario necesita que 300 asistentes externos a un evento vean un PDF. ¿Qué solución das? (Enlace «personas específicas» no escala: opción razonable — pedir excepción temporal con caducidad a N2 o publicar por otro canal; lo que NO se hace es incumplir la política por comodidad.)
