---
title: "7 · Seguridad L1: MFA, SSPR, Conditional Access y phishing"
description: "El 90% de la seguridad de un helpdesk son dos tickets: 'perdí el móvil del MFA' y 'creo que hice clic en algo'. Quien los ejecuta rápido y sin dejarse engañar vale su peso en oro."
curso: "microsoft-365"
capitulo: 7
orden: 7
---
> «El 90% de la seguridad de un helpdesk son dos tickets: 'perdí el móvil del MFA' y 'creo que hice clic en algo'. Quien los ejecuta rápido y sin dejarse engañar vale su peso en oro.»

## Objetivos

- Entender MFA en M365: métodos, registro y el reset completo de MFA (el ticket más frecuente del libro).
- Explicar SSPR y su relación con el registro combinado.
- Manejar Conditional Access a nivel concepto: leer sus bloqueos y saber cuándo es él.
- Ejecutar la respuesta a phishing y cuenta comprometida a nivel L1.

## 7.1 MFA en M365

M365 usa **Entra ID** para autenticar, y su MFA ya te sonará del [capítulo 10 del curso de AD](/cursos/active-directory/10-entra-id-e-hibrido/). Métodos actuales, en orden de preferencia de Microsoft:

1. **Authenticator app**: aprobación con **number matching** (te muestra un número que debes escribir en la app — mata el «aprobar sin mirar»), y **passkeys** (biometría en la app, sin contraseña). El camino oficial.
2. **Código TOTP** generado por Authenticator u otras apps.
3. **SMS / llamada** — en retirada progresiva por Microsoft (fácil de interceptar por SIM-swap); no se ofrezcan como método principal.

Cada usuario registra sus métodos en el primer inicio de sesión («añade información de seguridad», aka.ms/mfasetup). Ese registro **es** la llave: quien controla los métodos controla la cuenta.

Dos formas de gestionar MFA a nivel tenant (basta con nombrarlas): los **Security Defaults** (gratis: MFA obligatorio para todos, bloqueo de autenticación legacy) y las **políticas de Conditional Access** (de pago, Entra ID P1: MFA condicional por ubicación, app, riesgo… — sección 7.4). La empresa pequeña vive con defaults; la mediana-grande vive de CA.

## 7.2 El ticket clásico: reset de MFA

«Cambié de móvil y la app pide códigos que no me llegan» / «perdí el teléfono». El usuario no puede aprobar el segundo factor y está fuera de TODO M365. El reset desde el lado admin:

Ruta actual (portal de Entra, entra.microsoft.com): **Usuarios → [usuario] → Authentication methods** (o Métodos de autenticación) →

1. **Requerir nuevo registro de MFA** (Require re-register multifactor authentication): invalida los métodos actuales; el usuario vuelve a registrar en el próximo login (aka.ms/mfasetup).
2. Además, **Revocar sesiones** (Revoke sessions / Sign-out everywhere): mata tokens activos — imprescindible si hay sospecha de compromiso (sección 7.5), buena práctica en cualquier reset.
3. Si un CA le exige MFA para todo, el usuario podrá registrar porque el «acceso temporal» / flujo de registro lo permite; si se queda en bucle, existe el **Temporary Access Pass** (código de un solo uso que N2 emite para re-registrar) — saber nombrarlo suma.

**La regla de oro antes de resetear**: verificar la identidad del solicitante (callback al número de agenda, verificación presencial, el procedimiento de la empresa). Un reset de MFA solicitado por atacante = entregar la cuenta. Es la pregunta ética favorita de los entrevistadores de soporte.

Y el matiz L1 real: en muchas empresas, L1 tiene permiso para esto (Helpdesk/User admin permite re-register de usuarios no-admin); resets de cuentas **admin** van a N2/seguridad.

## 7.3 SSPR: que se la reseteen solos

**SSPR** (Self-Service Password Reset): el usuario resetea su propia contraseña tras verificar dos métodos registrados (teléfono + correo alternativo + preguntas…, configurable). Como el «¿olvidaste tu contraseña?» de cualquier web, pero corporativo, con auditoría y writeback.

- **Licencia**: requiere Entra ID P1 (viene con Business Premium y E3+). En tenant sin P1, los reseteos son siempre tarea de admin — dato que explica por qué en unas empresas «se resetea solo» y en otras no.
- **Registro combinado**: el mismo portal (aka.ms/mysecurityinfo) registra métodos para MFA y SSPR a la vez. Un usuario «sin métodos registrados» no puede SSPR → toca reseteo admin.
- **Writeback**: en híbrido, el reset en la nube se escribe de vuelta al AD on-prem (cap. 10 del curso de AD).

Flujo L1 del ticket «no puedo entrar, se me olvidó la contraseña»: ¿está habilitado SSPR y tiene métodos? → sí: usuario se autorresetea en aka.ms/sspr (2 minutos, le enseñas una vez). No: reset admin (M365 admin center → usuario → Restablecer contraseña, forzando cambio). En híbrido: ojo a dónde vive la cuenta (reset en origen si está sincronizada).

## 7.4 Conditional Access, a nivel concepto

La idea en una frase: **políticas si-entonces de acceso** — *si* un usuario entra desde una ubicación/dispositivo/aplicación concreta, *entonces* exigir MFA, bloquear, o permitir solo desde dispositivos conformes. Vive en Entra ID y es la religión de seguridad de las empresas con P1.

Ejemplos reales que verás: «MFA siempre», «desde país no habitual → bloquear», «correo en móvil → exigir dispositivo conforme (Intune, capítulo 6)», «bloquear autenticación legacy».

Lo que L1 debe hacer con CA: **reconocerlo**. Síntomas: usuarios bloqueados solo en ciertas condiciones (viaje, casa, móvil nuevo), con mensajes que citan políticas o piden «dispositivo aprobado». Dónde mirar: **Entra → Monitoring → Sign-in logs** (con los roles de lectura adecuados): cada login fallido dice si lo bloqueó CA y **qué política exacta**. Después: regularizar (inscribir el dispositivo, re-registrar MFA) o escalar a quien gestiona las políticas — que nunca es L1.

Trampa de entrevista relacionada: «¿MFA vs Conditional Access?» → MFA es un factor de autenticación; CA es la política que decide cuándo/por qué exigirlo. Security defaults vs CA → gratis y a ciegas vs granular y de pago.

## 7.5 Phishing y cuenta comprometida

**Caso rutinario** («me llegó este correo raro»): no hacer clic, comprobar remitente/enlaces, usar el botón **Reportar phishing** de Outlook (alimenta Defender y llega a seguridad/quarantine), verificar si llegó a más gente, borrar del resto si toca. A nivel L1: triaje y comunicación, no investigación forense.

**Caso grave** («hice clic y puse mi contraseña» / señales de compromiso: reglas raras, envíos que no reconoce, MFA no pedido, bloqueo por riesgo): el reloj corre y el orden importa:

1. **Revocar sesiones** y **resetear contraseña** (aunque no sepamos si la usaron).
2. **Re-registro de MFA** (si el atacante añadió su método — muy común: buscan notificaciones a SU teléfono).
3. **Buscar las huellas**: reglas de bandeja/redirecciones nuevas (cap. 3: el atacante se autoenvía el correo a otra dirección), métodos MFA añadidos, message trace de envíos raros.
4. **Avisar a seguridad/N2** inmediatamente con todo lo recogido: cuenta, hora, evidencias. Esto es incidente, no ticket.

Por qué el atacante ama las reglas de transporte/bandeja: silencio. Una regla que borra todo lo que contenga «factura» mantiene la bandeja limpia mientras negocia con el proveedor. En cuentas comprometidas, revisar reglas es protocolo — y saberlo demuestra que entiendes al enemigo.

Menciones de vocabulario que suman: **Defender for Office 365** (Safe Links reescribe URLs para verificarlas al vuelo; Safe Attachments detona adjuntos en sandbox) y **detección de riesgo de Entra** (logins anómalos → usuario en riesgo → N3 investiga, L1 ejecuta las acciones de contención).

## Esto te preguntarán en la entrevista

**P: Un usuario perdió el móvil con su MFA. ¿Qué haces?**
R: Verifico su identidad con el procedimiento de la empresa (callback, etc.) — un reset de MFA pedido por un atacante entrega la cuenta. Luego: revocar sesiones y requerir nuevo registro de MFA desde el portal de Entra (métodos de autenticación del usuario); el usuario re-registra con Authenticator en su próximo login. Si es cuenta admin, lo escala a seguridad.

**P: ¿Qué es SSPR?**
R: Self-Service Password Reset: el usuario resetea su contraseña solo verificando dos métodos pre-registrados (mismo registro que MFA, registro combinado). Requiere Entra ID P1 (incluido en Business Premium/E3+); con writeback en híbrido, el cambio baja también al AD on-prem. Ahorra la mayor parte de los reseteos de helpdesk.

**P: Explica Conditional Access en una frase.**
R: Políticas si-entonces del acceso a los servicios: si la señal es X (ubicación, dispositivo, app, riesgo), entonces exigir MFA, bloquear o exigir dispositivo conforme. Se gestiona en Entra ID y como L1 lo reconozco en los sign-in logs y escalo: no lo administro.

**P: ¿Qué haces si un usuario introdujo su contraseña en un phishing?**
R: Contención inmediata: revocar sesiones, resetear contraseña y re-registrar MFA; reviso reglas de bandeja y métodos añadidos por el atacante, hago message trace de envíos, y aviso a seguridad con evidencias. Es incidente, no ticket normal.

**P: ¿Por qué no se debe resetear MFA sin verificar identidad?**
R: Porque el reset de MFA entregado a un atacante le da la cuenta con permiso del propio helpdesk: es el vector clásico de ingeniería social. Verificación por callback/agenda o procedimiento equivalente antes de tocar nada.

**P: ¿Diferencia entre MFA y Conditional Access?**
R: MFA es un método de autenticación (algo que tienes/eres además de la contraseña); Conditional Access es la política que decide en qué condiciones se exige MFA o se bloquea. Security Defaults es la versión gratuita y fija de esas políticas; CA es la granular, de pago.

## Ejercicios prácticos

1. **De papel:** escribe el runbook de reset de MFA paso a paso incluyendo la verificación de identidad, y marca qué pasos puede hacer un Helpdesk admin y cuáles no (cuenta admin → escalar).
2. **De papel:** cinco señales de cuenta comprometida y su comprobación (reglas de bandeja nuevas / métodos MFA desconocidos / envíos anómalos en message trace / login desde geografía imposible en sign-in logs / usuario bloqueado por riesgo). Ordena tu respuesta por urgencia.
3. **De laboratorio (cap. 8):** registra MFA (Authenticator o TOTP) para tu usuario de prueba; luego revoca sesiones y fuerza re-registro, y comprueba el flujo completo del usuario. Hazlo dos veces: la segunda debe ser automática.
4. **De laboratorio:** explora los sign-in logs del portal de Entra con un login fallido a propósito: encuentra el motivo del fallo y la política implicada si la hay. Nombrar ese flujo es lo que se espera de un L1 moderno.
5. **Ancla mental:** adapta tu experiencia: reset de 2SV en Workspace ↔ reset de MFA en Entra. Escribe las dos rutas (admin.google.com → Seguridad → 2SV ↔ entra.microsoft.com → usuario → Authentication methods) para fijar la correspondencia.
