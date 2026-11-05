---
title: "8 · Autenticación: Kerberos, NTLM, bloqueos y contraseñas"
description: "No necesitas leer un RFC de Kerberos. Necesitas explicar por qué un móvil con la contraseña vieja bloquea una cuenta cada 10 minutos. Eso es autenticación de N1."
curso: "active-directory"
capitulo: 8
orden: 8
---
> «No necesitas leer un RFC de Kerberos. Necesitas explicar por qué un móvil con la contraseña vieja bloquea una cuenta cada 10 minutos. Eso es autenticación de N1.»

## Objetivos

- Explicar Kerberos alto nivel (TGT, tickets, KDC) con la analogía del festival.
- Situar NTLM: qué es, cuándo aparece todavía.
- Diagnosticar bloqueos de cuenta por causa raíz (la habilidad L1 más valorada del tema).
- Entender la política de contraseñas del dominio y dónde se configura.

## 8.1 El objetivo: demostrar identidad sin mandar contraseñas

Ni AD ni ningún sistema serio manda tu contraseña por la red al abrir un recurso. Kerberos (el estándar que AD adoptó del MIT) resuelve esto con **claves simétricas derivadas de la contraseña** y **tickets con tiempo limitado**:

> **Para tu cerebro Linux:** el DC no guarda tu contraseña, guarda su hash (como `/etc/shadow`), y con ese hash verifica/descifra tickets. Kerberos es protocolo estándar: en Linux lo has usado con `kinit`/`klist` (y probablemente en tu servidor SSH con GSSAPI sin saberlo).

## 8.2 Kerberos en 90 segundos: la analogía del festival

Piensa en un festival con taquilla central (el **DC**, que hace de **KDC**: Kerberos Key Distribution Center):

1. **Compras la entrada y te dan una pulsera** (= haces login: **AS exchange**). El usuario demuestra que conoce su contraseña *derivada en clave*; el KDC responde con el **TGT** (Ticket Granting Ticket): la pulsera que dice «ya te autentiqué, válido 10 horas» (valor por defecto en AD).
2. **Con la pulsera, pides tickets para cada atracción** (= abrir un recurso: **TGS exchange**). Quieres `\\FS01\Compartido` → presentas el TGT al KDC → te da un **service ticket** específico para FS01.
3. **Presentas el ticket en la atracción** (= SS): FS01 descifra el ticket con su propia clave (que solo él y el KDC comparten) y te deja pasar. **Tu contraseña nunca viajó**; ni siquiera FS01 la conoce.

Glosario mínimo: **KDC** = servicio dentro del DC (AS + TGS). **TGT** = pulsera (10 h por defecto). **Service ticket (ST)** = ticket por recurso. Todo cifrado con claves derivadas de contraseñas de usuarios y equipos.

Tres consecuencias prácticas que explicarás en la entrevista:

- **El reloj importa muchísimo:** Kerberos tolera un desfase máximo de **5 minutos** entre cliente y KDC. Sincronía de tiempo (NTP, puerto 123 UDP) no es cosmética: un PC con la fecha mal «no puede iniciar sesión» con errores crípticos. El dominio entero se sincroniza en cadena acabando en el rol FSMO PDC Emulator del bosque.
- **Tras cambiar la contraseña, las sesiones viejas siguen funcionando un rato**: los tickets ya emitidos siguen válidos hasta caducar. Esto explica «cambié la contraseña pero Outlook del móvil sigue con la vieja».
- **Kerberos necesita nombres**: se piden tickets por SPN (nombre de servicio); entrar por IP (`\\192.168.1.5\share`) suele caer en NTLM, porque un ticket Kerberos va ligado al nombre.

## 8.3 NTLM: el viejo que no muere

**NTLM** (challenge-response, hoy NTLMv2) es el mecanismo anterior. Sin tickets: el servidor pide al DC que verifique un reto matemático hecho con el hash de la contraseña. Más simple, más lento, y con problemas de seguridad serios (relay/pass-the-hash) — Microsoft lleva años desincentivándolo, y aún convive en todo AD por:

- Acceso por IP o nombre corto (sin SPN → sin Kerberos).
- Sistemas viejos, appliances, NAS, impresoras con auth SMB.
- Trusts entre dominios sin las condiciones para Kerberos.

Lectura L1: cuando veas NTLM en un diagnóstico no te asustes: es normal verlo; lo anómalo es *depender* de él en masa. Su desactivación progresiva es cosa de N2/seguridad.

## 8.4 Bloqueos de cuenta: la investigación que te hace parecer senior

La política (Default Domain Policy): **umbral** de intentos fallidos (típico 5), **duración** del bloqueo (típico 15 min) y **ventana de recuento**. Por defecto un dominio nuevo viene con bloqueo *desactivado* (umbral 0); las empresas lo activan. Bloquear ≠ deshabilitar: el bloqueo es automático y temporal; deshabilitar es manual (cap. 3).

**La clave L1: el bloqueo casi nunca es el usuario tecleando mal.** Es casi siempre una **credencial vieja guardada en algún sitio** que sigue intentándolo en bucle. La lista de sospechosos habituales, en orden de frecuencia:

1. **Móvil/tablet** con el correo corporativo y la contraseña anterior (el sospechoso #1 absoluto).
2. **Credenciales guardadas** en el Administrador de credenciales (`cmdkey /list` lo lista).
3. **Unidades de red mapeadas** con la contraseña vieja.
4. **Tareas programadas o servicios** corriendo con la cuenta del usuario.
5. **Sesión RDP cerrada sin cerrar sesión** en otro equipo.
6. Sí, a veces: el propio usuario con bloq mayús o teclado en otro idioma (sonrisa: tú, trilingüe, lo entiendes).

**Flujo profesional ante «me vuelven a bloquear»:**

```powershell
# En el DC: ¿quién se bloquea y desde dónde? (necesita auditoría activa; cae sola casi siempre)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4740} -MaxEvents 5 |
  Format-List TimeCreated, Message
```

El evento **4740** (lockout) incluye el *Caller Computer Name*: el equipo origen de los intentos. Con eso: si es el portátil → `cmdkey /list` + revisar drives/tareas; si es un servidor de correo/móvil → actualizar contraseña en el dispositivo. Luego desbloqueas (`Unlock-ADAccount`) y cambias contraseña si procede. Desbloquear sin investigar = el bloqueo vuelve mañana a las 8:59.

## 8.5 Políticas de contraseña del dominio

Dónde: **Default Domain Policy** → Configuración del equipo → Directivas → Configuración de Windows → Configuración de seguridad → Directivas de cuenta → Directiva de contraseñas. Es la excepción real a «las GPO se aplican por OU»: la política de contraseñas es **de dominio** (excepción técnica, no capricho).

| Parámetro | Clásico | Guía moderna (NIST-style, Microsoft también) |
|-----------|---------|-----------------------------------------------|
| Longitud mínima | 7 | 12-14+: manda la **longitud**, frases de contraseña |
| Complejidad | Activada | En desuso como requisito rígido |
| Caducidad | 42 días | Sin caducidad para usuarios normales (rotar solo ante sospecha) |
| Historial | 24 recordadas | Igual concepto, valor menor |
| Mínimo antes de cambiar | 1 día | Evita el `contraseña1 → contraseña2 → contraseña1` |

Como L1 no defines la política, pero **debes explicar por qué el cambio de contraseña del usuario falla** (no cumple longitud/historial/etc.) y saber que existen las **Fine-Grained Password Policies (PSO)** para políticas distintas por grupo (mencionarlas = punto extra).

**Cached logons**: un portátil fuera de la red inicia sesión con la última credencial cacheada (por defecto 10) aunque no haya DC accesible. Explica el clásico «en casa entra, pero el correo no»: la sesión es cacheada; lo que requiere DC (nuevos tickets, cambio de contraseña, recursos del dominio) no funciona.

## 8.6 Eventos de seguridad que reconocerás

| Event ID | Significado |
|----------|-------------|
| 4624 | Inicio de sesión correcto |
| 4625 | Inicio de sesión fallido |
| 4740 | **Cuenta bloqueada** (con equipo origen) |
| 4768 | Solicitud de TGT (Kerberos AS) |
| 4769 | Solicitud de service ticket (TGS) |

Se ven en el Visor de eventos del DC (Security) o con `Get-WinEvent`. Filtrar el 4740 del dominio entero es script de lunes por la mañana.

## Esto te preguntarán en la entrevista

**P: Explica Kerberos a alto nivel.**
R: Es el protocolo de autenticación principal de AD, basado en tickets y claves simétricas derivadas de contraseñas. El DC actúa de KDC: al iniciar sesión me da un TGT (válido ~10 h) y con él obtengo service tickets por cada recurso. Las contraseñas nunca viajan por la red. Requiere sincronía de reloj (±5 min) y funciona por nombres (SPN).

**P: ¿Diferencia entre Kerberos y NTLM?**
R: Kerberos usa tickets emitidos por el KDC del DC; NTLM es challenge-response más antiguo, verificado contra el DC, sin tickets. NTLM sigue apareciendo por compatibilidad: accesos por IP, sistemas viejos, appliances. Microsoft lo está retirando progresivamente.

**P: Una cuenta se bloquea cada día. ¿Qué haces?**
R: Desbloquear es lo inmediato, pero investigo la causa: busco el evento 4740 en el DC para ver desde qué equipo vienen los intentos y cazo la credencial vieja: móvil con el correo, credenciales guardadas (cmdkey), unidades mapeadas, tareas programadas o sesiones RDP colgadas. Desbloqueo, cambio contraseña si toca y actualizo/borro la credencial caducada; si no, vuelve a bloquearse.

**P: ¿Dónde se configura la política de contraseñas?**
R: En la Default Domain Policy a nivel de dominio (Directivas de cuenta): es la gran excepción a las GPO por OU. Existen políticas granulares (PSO) para excepciones por grupo. Conocer los parámetros: longitud mínima, complejidad, historial, caducidad.

**P: Un portátil fuera de la oficina inicia sesión sin red. ¿Cómo es posible?**
R: Windows usa credenciales cacheadas de los últimos inicios de sesión válidos. La sesión funciona, pero todo lo que requiera un DC (tickets nuevos, cambio de contraseña, recursos del dominio) fallará hasta reconectar.

## Ejercicios prácticos

1. **Lab:** desde el cliente, falla la contraseña 5 veces seguidas con `aruiz`. Comprueba el bloqueo con `Search-ADAccount -LockedOut`, mira el evento 4740 en el DC con `Get-WinEvent` y desbloquea.
2. **Lab — Kerberos de verdad:** en el cliente, con sesión de dominio iniciada, ejecuta `klist`: verás tu TGT y los tickets por servicio. Haz `klist purge`, cierra y abre un recurso `\\DC1\Compartido` y vuelve a mirar `klist`. Es la analogía del festival en vivo.
3. **Lab — reloj roto:** adelanta la fecha del cliente 20 minutos (o desactiva la sincronización y muévela) e intenta iniciar sesión con un usuario de dominio nuevo. Observa el error y arréglalo. Lección: NTP no es opcional.
4. **Lab:** cambia la política de contraseñas en la Default Domain Policy (longitud mínima 10) y verifica con `gpresult /r` + intento de cambio a una contraseña corta.
5. **De papel:** escribe el flujo de investigación de bloqueos en 6 pasos con el comando concreto de cada paso, de memoria, en menos de 10 líneas. Ese flujo es tu respuesta de entrevista.
