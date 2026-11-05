---
title: "10 · Preguntas de entrevista N1: el consolidado final"
description: "Veinte preguntas que cubren el 95% de lo que se pregunta a un candidato a Helpdesk/Soporte N1 con M365 en el puesto. Respóndelas EN VOZ ALTA antes de la entrevista. Si una te tiembla, su capítulo…"
curso: "microsoft-365"
capitulo: 10
orden: 10
---
> «Veinte preguntas que cubren el 95% de lo que se pregunta a un candidato a Helpdesk/Soporte N1 con M365 en el puesto. Respóndelas EN VOZ ALTA antes de la entrevista. Si una te tiembla, su capítulo está al lado.»

## Objetivos

- Consolidar en un único sitio las ~20 preguntas más frecuentes de entrevista N1 sobre M365.
- Disponer de respuestas modelo cortas (2-4 frases) para practicar en voz alta.
- Autoevaluarte con el checklist final antes de la entrevista real.

## Cómo responder (30 segundos de técnica)

- **Estructura fija:** qué es → cómo se hace → con qué herramienta. Tres frases, no una charla.
- Tu ventaja real: **anclalo a lo que ya has hecho**. «Lo tengo montado en mi tenant de pruebas (E5 sandbox)» y «es el mismo principio que SPF/DKIM/DMARC que configuré con Cloudflare para mi dominio» valen doble: demuestran criterio y práctica.
- Si no lo sabes a fondo: «Eso a nivel L1 lo que hago es X y lo escalo con Y». Honestidad + criterio > invención.
- Vocabulario exacto (tenant, licencia, EOP, cuarentena, message trace, compliance, wipe/retire, sign-in logs): es lo que separa «leyó algo» de «sabe».

## Esto te preguntarán en la entrevista

Aquí están: seis bloques más los escenarios trampa. Cada respuesta modelo cabe en dos a cuatro frases — esa es la longitud realista en una entrevista.

## Bloque A — Conceptos y tenant (capítulos 1-2)

**1. ¿Qué es Microsoft 365 y qué servicios incluye?**
La suite corporativa en suscripción de Microsoft: Exchange Online (correo), Teams, SharePoint/OneDrive (ficheros), apps de Office, Intune (dispositivos) y seguridad — todo autenticado por Entra ID y administrado desde portales web (admin center, EAC, TAC…). Es el equivalente de Google Workspace con servicios de historia propia unificados por identidad.

**2. ¿Qué es un tenant?**
La instancia de la organización en la nube de Microsoft: su directorio de identidades (Entra ID), sus dominios y sus suscripciones. Nace con un dominio inicial `empresa.onmicrosoft.com` y se le añaden dominios propios verificados por TXT. Un tenant puede tener varias suscripciones.

**3. ¿Diferencia entre suscripción y licencia? ¿Qué pasa si quitas una licencia a un usuario?**
La suscripción es el contrato (productos y número de asientos); la licencia es cada asiento por usuario. Sin licencia el usuario existe pero no tiene servicios (sin buzón ni Teams). Al quitarla, los datos se conservan ~30 días y se recuperan reasignando; luego, borrado definitivo.

**4. ¿Diferencia entre Business y Enterprise? ¿Y Office 365 vs Microsoft 365?**
Business (Basic/Standard/Premium, hasta 300 usuarios) es pyme; Enterprise (E1/E3/E5) sin límite y con más capacidad/seguridad. Office 365 es solo productividad; Microsoft 365 añade gestión y seguridad: Intune, Entra ID Premium y Windows Enterprise. E3 es el plan corporativo común; E5 añade la seguridad avanzada y Purview.

**5. ¿Cómo se relacionan AD, Entra ID y M365?**
M365 necesita Entra ID (incluido): es el directorio que autentica todos sus servicios. El AD on-prem es opcional y aparece en empresas con historia Windows, conectado a Entra ID con Entra Connect: los objetos nacen on-prem y se sincronizan (~30 min), y se gestionan en origen. En cloud-only solo existen Entra ID y M365.

**6. ¿Qué es el mínimo privilegio y qué rol pedirías para un L1?**
Que cada cuenta tenga solo los permisos para su función: limita el daño de errores y de credenciales robadas. Para L1: Helpdesk admin (reseteos, forzar re-login) y License admin o User admin; Exchange/Teams/Security para N2; Global admin en 2-3 cuentas protegidas (idealmente con PIM just-in-time).

## Bloque B — Administración diaria (capítulo 2)

**7. Un empleado se va de la empresa: ¿qué haces con su cuenta?**
Runbook de offboarding: delego buzón (Full Access/Send As) y OneDrive al sucesor; decido si convierto el buzón en compartido (congela el correo sin licencia); quito licencia; bloqueo inicio de sesión (corta el acceso al instante); borro tras el periodo de gracia — 30 días restaurable. En híbrido, todo se gestiona en el AD de origen.

**8. ¿Diferencia entre bloquear y eliminar un usuario?**
Bloquear (Bloquear inicio de sesión) es deshabilitar: reversible y corta el acceso a todos los servicios ya. Eliminar lleva el objeto a «Usuarios eliminados» 30 días (restaurable, y el UPN no se reutiliza mientras tanto); después, borrado definitivo con pérdida de datos. Nunca se borra para «recrear y que funcione».

**9. ¿Tipos de grupo en M365 y cuál usarías para cada caso?**
Grupo M365 (unificado): colaboración — buzón compartido, calendario, sitio SharePoint y opcionalmente el equipo de Teams. Grupo de seguridad: permisos y licencias (los dinámicos necesitan Entra P1). Distribución: solo lista de correo. Y el híbrido legacy seguridad con correo. Para un equipo de trabajo, grupo M365; para permisos, seguridad; para una lista, distribución.

**10. ¿Qué es un buzón compartido y cómo lo montas para soporte@?**
Un buzón genérico sin login directo ni licencia (gratis hasta 50 GB) al que acceden varias personas delegadas: creo el compartido en el EAC y doy Full Access (leer) y Send As (responder como soporte@) a los técnicos. Es también el truco estándar para conservar el buzón de alguien que se va.

## Bloque C — Correo: Exchange Online (capítulo 3)

**11. Un usuario no recibe correos. ¿Pasos?**
Delimito: ¿solo él?, ¿todo o solo externos? Pido NDR y hora. Recorro: cuarentena (EOP) → junk y remitentes bloqueados → reglas de bandeja del usuario → reglas de transporte recientes → cuota. Con el message trace zanjo: si aparece «Delivered», el problema es post-entrega (reglas/vista); si no aparece, el mensaje no llegó al tenant (origen/filtrado).

**12. ¿Qué es la cuarentena y quién puede liberar un correo?**
Donde EOP retiene correo peligroso (phishing, malware, spam de confianza alta) en lugar de entregarlo. El usuario puede liberarse spam desde su vista de cuarentena; phishing y malware solo los libera un admin desde el portal de Defender tras revisar. Se retiene un periodo configurable (típicamente hasta 30 días).

**13. ¿Cómo configurarías un dominio nuevo en M365 para que el correo llegue y salga limpio?**
Verifico el dominio (TXT `MS=msXXXX`), pongo el MX hacia `*.mail.protection.outlook.com`, SPF con `include:spf.protection.outlook.com`, activo DKIM (los dos CNAME de selector y el toggle en Defender) y publico DMARC. Es el mismo stack que configuré para mi dominio en Google Workspace con Cloudflare — mismo estándar, valores Microsoft.

**14. ¿Qué es una regla de transporte? Ejemplo.**
Regla servidor de flujo de correo a nivel de tenant: condiciones → acciones con orden de prioridad. Ejemplo: anteponer `[EXTERNO]` al asunto de todo correo entrante externo, o rechazar adjuntos ejecutables con NDR. Equivale a las routing rules de Gmail pero para toda la organización — por eso los cambios son de N2.

**15. Un usuario recibe el NDR «550 5.2.2 mailbox full». ¿Qué significa y qué opciones hay?**
Buzón lleno: la cuota del plan (50/100 GB) está agotada y el correo rebota. El usuario limpia (a menudo con ayuda del asistente de quota), o la empresa amplía: plan superior, archivador online, o políticas de retención. L1 comunica y gestiona; la decisión de licencia no es suya.

## Bloque D — Teams y ficheros (capítulos 4-5)

**16. ¿Qué hay debajo de un equipo de Teams? ¿Dónde están sus ficheros?**
Un grupo de M365 (membresía), un buzón/calendario compartidos (conversaciones del canal) y un sitio SharePoint donde cada canal estándar es una carpeta — los canales privados tienen sitio aparte. Por eso «el fichero del canal» se busca/restaura en SharePoint, y los problemas de membresía se miran en el grupo.

**17. ¿Diferencia entre OneDrive y SharePoint? ¿Y qué pasa con el OneDrive de un usuario dado de baja?**
OneDrive es la biblioteca personal (1 TB); SharePoint son los sitios de equipo, incluidos los ficheros de Teams. El OneDrive del baja se retiene ~30 días con acceso delegable para rescatarlo; el contenido de SharePoint pertenece al sitio y no se pierde con las personas. El trabajo importante va en SharePoint.

**18. ¿Cuánto dura la papelera de SharePoint/OneDrive y qué más protege los datos?**
Dos etapas: 93 días en la papelera del usuario y otros 93 en la del sitio tras vaciarse la primera; versiones para sobrescrituras; restauración de sitio/OneDrive completo para incidentes; y políticas de retención de Purview que conservan datos incluso borrados durante el periodo fijado.

**19. ¿Tipos de enlace para compartir y cuál usar con externos?**
«Cualquiera» (sin login), «personas de la organización» y «personas específicas». Con externos: específicas con login y caducidad, y contraseña si es sensible. La política del tenant y del sitio puede restringir los tipos disponibles; los «cualquiera» solo para contenido insensible con caducidad.

## Bloque E — Seguridad y dispositivos (capítulos 6-7)

**20. ¿Cómo reseteas el MFA de un usuario que perdió el móvil?**
Primero verifico su identidad por el procedimiento (callback/presencial): un reset pedido por un atacante entrega la cuenta. Luego en el portal de Entra, en los métodos de autenticación del usuario: revocar sesiones y «requerir nuevo registro de MFA»; el usuario re-registra Authenticator en el próximo login. Cuentas admin: a seguridad/N2.

**21. ¿Qué es SSPR y qué necesita?**
Self-Service Password Reset: el usuario resetea su contraseña verificando dos métodos pre-registrados (registro combinado con MFA). Requiere Entra ID P1 (incluido en Business Premium/E3+); en híbrido con writeback, el cambio baja al AD on-prem. Reduce la mayoría de reseteos de helpdesk.

**22. ¿Conditional Access en una frase? ¿Y security defaults?**
Políticas si-entonces de acceso: si ubicación/dispositivo/app/riesgo X, entonces exigir MFA, bloquear o pedir dispositivo conforme — se gestionan en Entra ID (P1) y como L1 las identifico en los sign-in logs y escalo. Security defaults es la versión gratis y fija: MFA para todos y bloqueo de autenticación legacy.

**23. ¿Wipe vs retire en Intune?**
Wipe: reset de fábrica, se borra todo incluido lo personal (corporativo o pérdida). Retire: solo se quitan datos y apps corporativas, lo personal queda intacto (BYOD de una baja). Y el móvil perdido: primero contengo la identidad (revocar sesiones, reset MFA), luego lock/wipe según titularidad y política.

**24. ¿Un usuario no recibe correo en el móvil corporativo? ¿Cadena de diagnóstico?**
Credenciales → MFA → Conditional Access → compliance del dispositivo en Intune → servicio. El caso típico: CA exige dispositivo conforme y el móvil dejó de estarlo (sin PIN, OS viejo, Company Portal borrado). Lo reviso en la ficha de Intune, corrijo con el usuario o re-inscribo, y si es política, a N2.

## Bloque F — Escenarios trampa

**25. Viernes 17:00: «el correo está caído», te lo dicen tres personas.**
Primero delimito (¿todo el correo o solo envío externo?) y miro Service Health. Incidente activo: comunico a los afectados con la info del panel, abro ticket, documento y espero sin tocar configuración. Panel verde: reproduzco, pruebo un interno y un externo con message trace, y bajo al común de los afectados (¿cambió algo global?).

**26. «Entraron en mi cuenta»: viste envíos raros. Primeras acciones.**
Contención: revocar sesiones, reset de contraseña y re-registro de MFA. Después caza de huellas: reglas de bandeja/redirección nuevas, métodos MFA añadidos, message trace de envíos, sign-in logs. Y aviso inmediato a seguridad con toda la evidencia: es incidente, no ticket.

**27. Un usuario está de viaje en otro país y no puede entrar a nada.**
Patrón de Conditional Access (ubicación) o MFA sin cobertura. Leo el error literal y los sign-in logs: si una política bloquea por país, lo confirmo y escalo/regularizo según la política; si es MFA, método alternativo (número de teléfono de la política) o re-registro. Nada de «quitar la política por favor»: eso lo decide N2/seguridad.

## Checklist final antes de la entrevista

- [ ] Sé definir tenant / suscripción / licencia y el mapa AD ↔ Entra ↔ M365 sin dudar (cap. 1).
- [ ] Runbook de offboarding y bloquear-vs-borrar en voz alta (cap. 2).
- [ ] «No me llegan correos» completo con message trace y lectura de NDR (cap. 3).
- [ ] Qué hay debajo de un equipo de Teams (cap. 4) y las papeleras de 93+93 (cap. 5).
- [ ] Wipe vs retire y el runbook del móvil perdido (cap. 6).
- [ ] Reset de MFA con verificación de identidad, SSPR, CA en una frase (cap. 7).
- [ ] «¿Microsoft o soy yo?» con Service Health y la diana del método (cap. 9).
- [ ] Tengo el tenant del capítulo 8 montado y mi libreta de 15 tickets para contar.

## Ejercicios prácticos

1. **Simulacro real:** pide a alguien (o grábate) 10 preguntas al azar de las 27, sin avisar de cuáles. Objetivo: ninguna respuesta por encima de cuatro frases.
2. **De papel:** convierte los tickets 11, 24 y 26 en diagramas de decisión de al menos cinco ramas cada uno. Si puedes dibujarlo, puedes decirlo.
3. **Anclaje personal:** escribe tus dos frases puente — «lo monté en mi sandbox E5» y «mismo principio que SPF/DKIM/DMARC en mi dominio» — y úsalas en las respuestas 3, 13 y 22. La experiencia propia cuenta doble.
4. **Repaso final:** relee los «Esto te preguntarán en la entrevista» de los capítulos 1-9 una hora antes de la entrevista. Ese calentamiento es el último paso de la ruta.
