---
title: "8 · Laboratorio gratis: tu propio tenant M365"
description: "En M365 no hay hackthebox: el lab es un tenant de verdad, tuyo, donde el peor caso es que rompas… tu propio dominio. Media tarde clicando aquí equivale a un mes de tutoriales."
curso: "microsoft-365"
capitulo: 8
orden: 8
---
> «En M365 no hay hackthebox: el lab es un tenant de verdad, tuyo, donde el peor caso es que rompas… tu propio dominio. Media tarde clicando aquí equivale a un mes de tutoriales.»

## Objetivos

- Conseguir un tenant de pruebas gratuito (Developer Program o trial) entendiendo sus límites y condiciones actuales.
- Dejar el sandbox montado: usuarios, licencias, dominio, recorridos.
- Ejecutar los tickets simulados que atan los capítulos 2-7.

## 8.1 Las opciones (estado actual, sin humo)

**Opción A — M365 Developer Program** (developer.microsoft.com/microsoft-365/dev-program): el clásico — una suscripción sandbox **Microsoft 365 E5** gratuita con 25 licencias de usuario. Sobre su estado real, para no perderte tiempo:

- Desde 2024 Microsoft **restringió la entrega instantánea del sandbox**: lo obtienen directamente quienes son suscriptores Visual Studio Enterprise, partners del programa, MVP y perfiles afines. El resto puede unirse al programa y quedar a la espera (o recibirlo tras revisión).
- El sandbox se **renueva cada 90 días si hay actividad** (logins, uso de servicios). Abandono = caducidad.
- Cuenta con una cuenta Microsoft personal; el tenant será tuyo, separado de cualquier empresa.

**Opción B — trial de M365 Business Premium** (30 días): plan B realista si el Developer Program no te da sandbox: microsoft.com/microsoft-365/business → «Prueba gratuita». Un tenant con ~25 licencias de Business Premium, que además **incluye Intune y Entra P1** (mejor que E5 para practicar capítulos 6-7… aunque E5 trae Defender P2 y Purview). Según región/fecha puede pedir método de pago: no se cobra si cancelas antes del fin del trial — desactiva la renovación automática el día uno.

**Opción C — trials desde dentro de un tenant**: si ya tienes cualquier tenant (p. ej. de la opción B), el admin center ofrece trials adicionales de servicios concretos en **Facturación → Servicios de compra → Pruebas**. Útil para activar un mes de E5 o Purview encima.

Estrategia recomendada: prueba A; si en 10 minutos no hay sandbox, monta B sin drama. Este capítulo funciona igual con cualquiera: en lo que sigue, «el tenant» es cualquiera de las tres.

## 8.2 Montaje paso a paso

1. **Cuenta**: crea (o usa) una cuenta Microsoft personal (outlook/hotmail) — NO uses una cuenta de empresa para esto.
2. **Alta del tenant**: Developer Program → «Join» con esa cuenta → elige «Instant sandbox» si te lo ofrece → configuración: región, nombre de empresa ficticia (`Contoso Electronics SL`) y el dominio inicial quedará tipo `contosoelectronics.onmicrosoft.com`. En el trial de Business Premium, el asistente te pedirá datos de facturación y te creará el tenant igualmente.
3. **Primer login**: entra en admin.microsoft.com con la cuenta admin global que te ha creado. Activa/desactiva la renovación automática del trial si aplica. Pon un recordatorio de calendario a los 85 días si es Developer Program («renovación por actividad»).
4. **Crea tus actores** (Usuarios → Agregar usuario): `ana.garcia@`, `luis.perez@` y `soporte-n1@` (este con rol de Helpdesk admin para probar el mínimo privilegio). Asígnales licencias E5/BP.
5. **(Opcional pero recomendado) dominio custom**: si quieres repetir tu hazaña de Workspace, añade un dominio de prueba que poseas (`midominio-lab.es`) verificándolo con el TXT `MS=msXXXX` en Cloudflare. **Precaución de oro**: NO muevas el MX de un dominio en uso real. O usa un subdominio (`lab.midominio.es`) para el correo, o deja el dominio verificado sin cambiar el MX — suficiente para practicar la verificación.

> **Regla del lab**: es tu tenant, no producción de nadie — pero práctica como si lo fuera: cada cosa que hagas, anótala como «ticket»: título, pasos, resultado. Al final tienes la libreta de tickets que enseñar («administro un tenant E5 de pruebas») — frase literal de entrevista.

## 8.3 El recorrido guiado: 15 tickets simulados

Hazlos EN ORDEN: cada uno usa al anterior. Son los capítulos 2-7 convertidos en clics. Registra horas y capturas.

| # | Ticket simulado | Practicas | Cap. |
|---|-----------------|-----------|------|
| 1 | «Alta de empleado nuevo: Ana García, licencia completa» | Crear usuario, licencia, contraseña temporal | 2 |
| 2 | «Ana necesita soporte@ y salir con esa dirección» | Buzón compartido + Full Access + Send As | 3 |
| 3 | «soporte@ debe salir en una lista de contacto: ayuda@» | Alias sobre el buzón compartido | 3 |
| 4 | «Marcar todo correo externo con [EXTERNO]» | Regla de transporte | 3 |
| 5 | «El dominio sale sin firmar / a spam» | Activar DKIM, revisar SPF/DMARC con `dig` | 3 |
| 6 | «Equipo de proyecto con ficheros y canal privado» | Team → grupo M365 → sitio SharePoint | 4 |
| 7 | «Reunión con cuenta externa propia: probando el vestíbulo» | Reuniones, invitados, lobby | 4 |
| 8 | «Fichero del canal borrado por error (dos veces)» | Papelera 1ª y 2ª etapa, versiones | 5 |
| 9 | «Compartir externo seguro: enlace específico con caducidad» | Tipos de enlace | 5 |
| 10 | «Inscribir tu móvil/tablet en Company Portal» | Enroll BYOD, ficha en Intune | 6 |
| 11 | «Móvil perdido (simulado): runbook completo» | Revocar sesiones, reset MFA, wipe/retire | 6-7 |
| 12 | «Perdí el móvil del MFA: reséteme» | Re-register MFA + verificación de identidad | 7 |
| 13 | «Autorestablecer contraseña (SSPR)» | aka.ms/sspr, registro combinado | 7 |
| 14 | «Login fallido a propósito: ¿quién lo bloqueó?» | Sign-in logs de Entra | 7 |
| 15 | «Offboarding completo de Luis» | Runbook del cap. 2: delegar, convertir, bloquear | 2 |

**Método de trabajo con cada ticket**: simula también el lado usuario (InPrivate/otro navegador con la cuenta de Ana) — la mitad del aprendizaje es ver el error desde fuera del admin.

## 8.4 Qué NO hacer en el lab (y sus límites)

- **No muevas el MX de un dominio con correo real** — romperías la entrega de ese dominio. Subdominio o nada.
- **No metas datos personales reales** (tuyos ni de nadie): usuarios ficticios.
- Límites del sandbox: ~25 licencias, algunos servicios E5 limitados, sin soporte real de Microsoft para tu sandbox, y caducidad si no lo usas.
- **No le des a nada que suene a producción si reusas la misma cuenta Microsoft en un futuro contrato**: mantén lab y trabajo separados siempre.

## 8.5 Después del lab: mantenerlo vivo

Diez minutos al día (o una sesión semanal) mantienen el sandbox activo y tus manos calientes: un login, un ticket del recorrido, una vuelta por el Message Center (capítulo 9) para ver qué cambia. Con el trial de 30 días, haz todo en las tres primeras semanas y anota qué te faltó; puedes repetir el trial con otra cuenta Microsoft.

Y el hábito que más te venderá: **capturas y notas por ticket**. En la entrevista, «lo he hecho en mi tenant de pruebas» con detalle de pantallas es indistinguible de experiencia real de trabajo — porque lo es.

## Esto te preguntarán en la entrevista

**P: ¿Has administrado un tenant de Microsoft 365?**
R: Sí, tengo un tenant sandbox E5 del Microsoft 365 Developer Program donde gestiono usuarios, licencias, Exchange (reglas, DKIM, cuarentena), Teams, SharePoint e Intune, y practico los tickets típicos de soporte con usuarios de prueba.

**P: ¿Cómo conseguiste el tenant de pruebas?**
R: Con el M365 Developer Program (suscripción sandbox E5 gratuita, renovable cada 90 días con actividad); Microsoft ha restringido la entrega instantánea a perfiles cualificados, así que la alternativa es un trial de Business Premium de 30 días, que además incluye Intune y Entra ID P1.

**P: ¿Qué es el Microsoft 365 Developer Program?**
R: El programa de Microsoft para desarrolladores/administradores de pruebas: da un tenant sandbox con 25 licencias E5 sin coste, para desarrollo y pruebas de administración. Lo uso para reproducir tickets reales (reset de MFA, reglas de transporte, offboarding) sin tocar producción.

**P: ¿Diferencia entre probar en un sandbox y trabajar en producción?**
R: El sandbox es un tenant real funcionalmente, pero aislado: sin usuarios ni datos de empresa, sin SLA de soporte, y caduca sin actividad. En producción cada cambio afecta a usuarios vivos: por eso hay cambios controlados, roles de mínimo privilegio y ventanas de comunicación.

## Ejercicios prácticos

1. **Ejecución:** monta el tenant (secciones 8.1-8.2) y completa los 15 tickets del recorrido con su registro escrito. Estimación realista: 4-6 horas repartidas.
2. **Extra:** tras el ticket 5, envía un correo desde tu tenant a una cuenta externa tuya y examina las cabeceras SPF/DKIM/DMARC del destinatario (te sonarán de Workspace: aquí repites la experiencia desde el otro lado).
3. **Extra difícil:** rompe algo a propósito — crea una regla de transporte que borre los correos con asunto «test», compruébalo con message trace y arreglo. La seguridad de poder romper es la gran ventaja del lab.
4. **De papel:** redacta tu «libreta de tickets» final: 10 líneas con los tickets que sabes resolver y las herramientas usadas. Es literalmente tu repaso de entrevista.
