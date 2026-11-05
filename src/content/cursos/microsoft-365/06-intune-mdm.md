---
title: "6 · Intune por encima: el MDM del siglo Microsoft"
description: "Intune es el GPO que se fue a vivir a la nube y aprendió a hablar con móviles. No necesitas desplegarlo — necesitas reconocer sus tickets: el dispositivo no conforme bloquea al usuario aunque la…"
curso: "microsoft-365"
capitulo: 6
orden: 6
---
> «Intune es el GPO que se fue a vivir a la nube y aprendió a hablar con móviles. No necesitas desplegarlo — necesitas reconocer sus tickets: el dispositivo no conforme bloquea al usuario aunque la contraseña sea correcta.»

## Objetivos

- Explicar qué es Intune/MDM y en qué se parece (y diferencia) de las GPOs de tu curso de AD y del MDM de Workspace.
- Entender la inscripción (enroll), los perfiles y las políticas de cumplimiento.
- Dominar la pareja de entrevista: **wipe vs retire**, y el runbook del móvil perdido.
- Saber exactamente qué es asunto L1 y qué se escala.

## 6.1 Qué es Intune y por qué existe

**Intune** es el sistema de gestión de dispositivos (MDM/MAM) de Microsoft: móvil, portátil y escritorio, en la nube. Aparece con licencia Business Premium, Microsoft 365 E3/E5 o por separado.

Tu chuleta de traducción:

- Viene de **GPO + AD** (capítulos 6 y 10 de tu curso de AD): Intune aplica **perfiles de configuración** a dispositivos, igual que las GPOs aplicaban políticas — pero no necesita dominio: la máquina se inscribe y habla con la nube. En empresas híbridas conviven: GPOs dentro de la oficina para lo gordo, Intune para lo remoto y los móviles.
- Viene de **MDM de Workspace**: ya usaste el panel de dispositivos de Google para bloquear/borrar móviles. Intune es eso escalado a empresa real: políticas finas, inventario, actualizaciones de Windows, despliegue de apps y antivirus (Defender) gestionado.

La palabra clave que conecta todo el libro: **compliance (conformidad)**. Un dispositivo inscrito puede estar *conforme* (cifrado, PIN, versión soportada, sin jailbreak…) o *no conforme*, y esa condición la consumen las políticas de Conditional Access (capítulo 7): **dispositivo no conforme = sin correo ni Teams aunque las credenciales sean válidas**. Gran parte de los tickets «no puedo entrar desde el móvil» de una empresa con Intune son, en realidad, tickets de compliance.

## 6.2 Inscripción (enrollment)

La **inscripción** es el handshake: el dispositivo pasa a estar gestionado por Intune y le llegan políticas. Dos mundos:

| | **BYOD** (dispositivo personal) | **Corporativo** |
|---|----------------------------------|-----------------|
| Cómo se inscribe | El usuario desde la app **Company Portal** (Portal de empresa), o al añadir la cuenta en iOS/Android; en Windows: Configuración → Cuentas → Conectar con cuenta profesional o educativa | El equipo lo prepara la empresa: **Windows Autopilot** (el portátil se configura solo al primer arranque, cero imagen manual) o inscripción masiva |
| Qué ve el usuario | En Android: **perfil de trabajo** (el correo y apps corporativas viven en un compartimento separado, como dos contenedores); en iOS: perfil de gestión | El dispositivo entero es de la empresa |
| Qué controla la empresa | Solo el compartimento corporativo | Todo el dispositivo |

Se administra (y se mira) en **intune.microsoft.com** → Devices: cada dispositivo tiene su ficha con estado de inscripción, compliance y últimas sincronizaciones. A nivel L1 la ficha del dispositivo es tu primera parada.

Ticket típico de inscripción: «el usuario cambió de móvil y no sincroniza» → el dispositivo viejo sigue listado, el nuevo no está inscrito; se instala Company Portal en el nuevo y se inscribe (o N2 lo hace por Autopilot). Otro clásico: usuario que **borra la app Company Portal** o quita el perfil de trabajo «para ganar batería» — al rato, sin correo. La ficha del dispositivo en Intune te cuenta la película.

## 6.3 Qué gestiona Intune (catálogo de concepto)

Para responder en entrevistas con vocabulario exacto:

- **Políticas de cumplimiento (compliance)**: reglas que el dispositivo debe cumplir (PIN, cifrado, versión de SO…) → marca el dispositivo conforme/no conforme. Es la pieza que alimenta Conditional Access.
- **Perfiles de configuración**: imponer/establecer ajustes (Wi-Fi corporativa, VPN, bloquear cámara, quitar la tienda de apps…). Las GPOs modernas.
- **Apps**: desplegar aplicaciones requeridas (se instalan solas) o disponibles (el usuario las pide en Company Portal).
- **Windows Update rings**: grupos de actualización de Windows con ritmos distintos (piloto → todos) — adiós WSUS manual.
- **Defender / seguridad del endpoint**: estado del antivirus y detecciones (la parte profunda es N3, pero la ficha del dispositivo la ve L1).

L1 no crea políticas: **lee y diagnostica**. El flujo mental correcto ante un ticket de dispositivo: ficha del dispositivo → estado de inscripción y compliance → si no conforme, qué regla falla (la ficha lo dice) → ¿solución de usuario (re-sincronizar Company Portal, actualizar, poner PIN) o escalado?

## 6.4 Wipe vs retire, y el móvil perdido

La pareja de entrevista más clásica de Intune:

| Acción | Qué hace | Cuándo |
|--------|----------|--------|
| **Wipe** (borrado) | Reset de fábrica: se borra TODO, incluido lo personal | Dispositivo corporativo, o BYOD perdido/irrecuperable por política |
| **Retire** (retirar) | Quita SOLO los datos y apps corporativas; lo personal queda intacto | BYOD cuyo dueño se va de la empresa o deja de necesitar acceso |

Regla mnemónica: retire es «devuélveme las llaves del piso» (se lleva sus muebles); wipe es «derribo el edificio». La diferencia protege la privacidad del empleado y evita demandas: hacer wipe a un móvil personal sin causa es incidente legal, no técnico.

**Runbook del móvil perdido** (te lo pueden pedir paso a paso):

1. **Contener**: revocar sesiones y reset de contraseña/MFA del usuario (capítulo 7) — el correo es el botín real.
2. **Localizar/Bloquear**: desde Intune → dispositivo → acciones remotas (localizar, bloquear con mensaje).
3. **Decidir el wipe** según política de la empresa y titularidad del dispositivo (corporativo: wipe; BYOD: wipe solo si la política lo permite — está en el consentimiento del BYOD que firmó al inscribir).
4. **Registrar**: IMEI/descripción en el inventario, comunicación a seguridad, y si es robo, denuncia.
5. Inscribir el sustituto y verificar que el viejo ya no aparece como conforme.

## 6.5 Cuándo es L1 y cuándo se escala

**Hace L1** (con los roles adecuados): comprobar inscripción y compliance en la ficha, guiar re-sincronización de Company Portal, re-enrollar un dispositivo, guiar al usuario en las acciones remotas básicas, documentar el caso de pérdida y coordinar el runbook de la sección 6.4.

**Se escala a N2/N3**: crear/cambiar políticas (compliance, configuración, actualizaciones), despliegues con Autopilot, certificados y VPN, dispositivos que no inscriben («error de inscripción» con código), decisiones de wipe masivo, lo profundo de Defender.

Y el ticket puente que amarra el libro: «**no me llega el correo en el móvil**». Cadena: correo con MFA/CA (cap. 7) → CA exige dispositivo conforme → Intune dice no conforme (PIN quitado, OS sin actualizar) → arreglar el compliance o escalar. Si sabes recorrer esa cadena en voz alta, has demostrado entender M365 de verdad.

## Esto te preguntarán en la entrevista

**P: ¿Qué es Intune y para qué sirve?**
R: El MDM/la gestión de endpoints en la nube de Microsoft: inscribe dispositivos (móviles y Windows), les aplica perfiles de configuración y políticas de cumplimiento, despliega apps y gestiona actualizaciones. Es la evolución de las GPOs sin depender de dominio, y su estado de conformidad alimenta el Conditional Access.

**P: ¿Diferencia entre wipe y retire?**
R: Wipe es reset de fábrica: borra todo, incluido lo personal (dispositivo corporativo o pérdida). Retire elimina solo datos y apps corporativas y respeta lo personal (BYOD de una baja). Elegir bien entre ambas es una decisión de privacidad, no solo técnica.

**P: ¿Qué es un dispositivo conforme (compliant)?**
R: El inscrito que cumple las políticas de cumplimiento de la empresa: PIN, cifrado, versión de SO soportada, sin jailbreak… Si no lo está, Conditional Access puede bloquearle el acceso al correo y Teams aunque las credenciales sean válidas.

**P: ¿Se pierde el móvil de un empleado? Qué haces.**
R: Contengo primero la identidad: revoco sesiones y reseteo contraseña/MFA. Luego desde Intune localizo/bloqueo y, según titularidad y política, lanzo wipe. Registro el IMEI, aviso a seguridad y preparamos el sustituto. El correo es el activo a proteger, más que el hierro.

**P: ¿En qué se parece Intune a las GPOs de AD?**
R: Ambos aplican configuración obligatoria a dispositivos; las GPOs viajan por el dominio (LDAP/Kerberos, OUs) y solo alcanzan equipos dentro de la red, mientras Intune lo hace por la nube a dispositivos inscritos, móviles incluidos. En entornos híbridos conviven: GPOs en oficina, Intune para lo remoto.

## Ejercicios prácticos

1. **De papel:** el ticket «no me llega el correo en el móvil» — escribe la cadena completa de diagnóstico de cinco eslabones (credenciales → MFA → CA → compliance → correo) con la pregunta y la herramienta que prueba cada eslabón.
2. **De papel:** decide wipe o retire y justifica: (a) portátil corporativo robado; (b) móvil propio de un empleado que se va; (c) tablet corporativa que pasa de departamento; (d) móvil propio perdido con política BYOD sin wipe remoto consentido. (Respuestas: wipe / retire / wipe (o reasignar) / no se puede wipe: revocar identidad y sesiones, cuenta gestionada fuera.)
3. **De laboratorio (cap. 8):** desde intune.microsoft.com, explora Devices y las acciones remotas de un dispositivo ficticio/listado. No hay móviles en el sandbox: el objetivo es reconocer dónde están las fichas, el estado de compliance y los botones de wipe/retire para nombrarlos con soltura.
4. **Ancla mental:** dibuja el paralelismo de tres columnas — GPO+AD / MDM Workspace / Intune — con una fila por concepto: dónde viven las políticas, qué dispositivos alcanzan, quién las aplica, y cómo se llama el estado «sano» de un dispositivo (no aplica/inscrito/conforme).
