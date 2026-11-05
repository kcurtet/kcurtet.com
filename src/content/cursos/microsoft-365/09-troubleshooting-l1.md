---
title: "9 · Troubleshooting L1 en M365: síntoma → acción"
description: "El método L1 es una diana: primero el anillo más ancho (¿afecta a todos?), después el siguiente (¿es un servicio?), y solo al final la diana del usuario concreto. Los novelos hacen diana al revés."
curso: "microsoft-365"
capitulo: 9
orden: 9
---
> «El método L1 es una diana: primero el anillo más ancho (¿afecta a todos?), después el siguiente (¿es un servicio?), y solo al final la diana del usuario concreto. Los novelos hacen diana al revés.»

## Objetivos

- Aplicar un método de diagnóstico M365: delimitar → comprobar salud → localizar la capa → actuar o escalar.
- Usar Service Health, Message Center y las señales de «¿es Microsoft o soy yo?».
- Manejar la tabla síntoma → acción de los tickets más frecuentes.
- Saber qué se escala, a quién y con qué documentación.

## 9.1 El método (el mismo de siempre, adaptado)

Como en tu [capítulo de troubleshooting de AD](/cursos/active-directory/09-herramientas-y-troubleshooting-l1/), todo ticket empieza por delimitar el radio:

1. **¿Quién?** Un usuario, un equipo/departamento, ¿toda la empresa? — Tres respuestas, tres mundos distintos de diagnóstico.
2. **¿Qué exactamente?** La descripción del usuario nunca es el síntoma: «no funciona Teams» puede ser login (cap. 7), licencia (cap. 2), reunión (cap. 4) o cliente. Pide el error literal y una captura.
3. **¿Cuándo empezó?** — Correlaciona con cambios: Message Center, nuevo equipo, móvil nuevo, viaje.
4. **¿Dónde?** Web vs cliente vs móvil; oficina vs casa vs aeropuerto — la respuesta separa red/dispositivo de servicio.
5. **¿Antes funcionaba?** ¿Qué cambió? (El usuario jura que nada; el 50% de las veces algo cambió.)

Con el radio delimitado, el flujo decide solo: mucho afectado → sección 9.2 (¿es Microsoft?); un solo usuario → su capa específica (tabla 9.3); y **siempre**: reproducirlo tú mismo antes de escalar.

## 9.2 ¿Es Microsoft o soy yo?: Service Health y Message Center

**Service Health** (admin.microsoft.com → Salud → Estado del servicio): el tablero de incidentes por servicio, **para tu tenant**. Tres niveles: incidente (algo roto), aviso (degradación/limitación) y — lo más frecuente — nada (todo en verde y el problema es tuyo o del usuario). También tiene historial: «esto ya pasó el martes pasado» es información.

**Message Center** (Salud → Centro de mensajes): los cambios futuros de Microsoft — «el día 15 cambia el comportamiento de X», avisos de features, retiradas. Ticket clásico que responde: «desde ayer algunos usuarios ven la interfaz distinta». Como L1: leerlo (o el resumen que mande N2) forma parte del oficio; el rol «Message Center reader» existe para eso.

Señales para decidir «es Microsoft»:

| Señal | Indica |
|-------|--------|
| Service Health muestra incidente activo en el servicio | Es Microsoft: comunicar y esperar (sección 9.5) |
| Varios usuarios SIN relación entre sí, a la vez | Muy probable Microsoft o cambio global |
| Solo un usuario / solo un equipo / solo una app | Casi nunca Microsoft |
| La web funciona y el cliente no (o al revés) | Problema local: cliente, caché, red |
| Empezó exactamente tras un cambio (nuevo proxy, política) | Eres vosotros |

Regla de oro del incidente confirmado: **no cambies configuración durante un incidente de Microsoft** (no sabrás después qué era del incidente y qué tuyo) — documentar, comunicar y esperar, salvo contención de seguridad.

## 9.3 La tabla síntoma → acción

La chuleta de todo el libro condensada (capítulo entre paréntesis):

| Síntoma | Primera acción | Si no es eso | Cap. |
|---------|----------------|--------------|------|
| «No puedo iniciar sesión» (uno) | Estado de la cuenta (¿bloqueada?), reset de contraseña | MFA atascado → re-registro; CA en sign-in logs | 2, 7 |
| «No puedo iniciar sesión» (muchos) | Service Health + ¿caducó/rotó algo global? | Incidente de Entra: comunicar | 9 |
| «No me llegan correos» | ¿Solo él? ¿Solo externos? NDR si lo hay | Cuarentena → junk → reglas de bandeja → transporte → cuota → message trace | 3 |
| «Mis correos salen a spam» | SPF/DKIM activo/DMARC del dominio (tu terreno) | Reputación de dominio/IP nueva; filtro del destinatario | 3 |
| «No puedo entrar a la reunión» | ¿Quién falla: interno o externo? Error literal | Vestíbulo → guest/external tenant → cliente desactualizado → web | 4 |
| «No me sale Teams» | Licencia del usuario | Membresía del equipo; cliente/reinicio | 2, 4 |
| «Se me borró el archivo» | ¿Dónde vivía? (OneDrive vs sitio) | Papelera 1ª → 2ª → versiones → fecha límite | 5 |
| «El archivo no sincroniza» | ¿Se ve bien en la web? | Nombre/ruta inválidos, sesión pausada, reset del cliente | 5 |
| «No me puedo unir al enlace externo» | Tipo de enlace y caducidad | Sharing del sitio; cuenta personal vs corporativa | 5 |
| «No me llega correo al móvil» | Cadena: credenciales → MFA → CA → compliance | Inscripción Intune rota → re-enroll | 6, 7 |
| «Perdí el móvil» | Revocar sesiones + reset MFA | Lock → wipe según titularidad | 6, 7 |
| «Hice clic en un phishing» | Contención: sesiones + contraseña + MFA | Reglas de bandeja, message trace, avisar seguridad | 7 |
| «Todo va lento» (oficina) | ¿Servicio sano? ¿Red local? | Otros servicios/sistemas OK → red local (fuera de M365) | 9 |
| «A este usuario no le sale X» | Licencia incluye X | Plan/plan de servicio; asignación por grupo | 1, 2 |

Herramientas de diagnóstico que atraviesan la tabla: **message trace** (correo), **sign-in logs** de Entra (accesos y por qué fallaron), **fichas de usuario del admin center** (licencia, estado, MFA), **diagnósticos del TAC** (Teams) y la técnica universal: **reproducir en InPrivate desde otra máquina** (aisla cliente/caché/dispositivo).

## 9.4 Cuándo escalas y a quién

L1 resuelve lo rutinario con runbooks y contención; escala lo que exige más privilegios, más riesgo o más hondura:

| Escala a | Cuando |
|----------|--------|
| **N2 (admin del servicio)** | Cambiar reglas de transporte globales, políticas CA/Intune, conectores, recuperación profunda de datos, cuentas admin |
| **N3 / seguridad** | Incidente de seguridad (cuenta comprometida confirmada, exfiltración), forense, eDiscovery/Purview |
| **Microsoft (soporte)** | Incidente confirmado por Service Health que no tiene ETA, o fallo técnico del tenant; lo abre quien tiene el rol Service Support admin — L1 aporta los datos |

Criterios de decisión en una frase: **si la solución requiere cambiar algo que afecta a más de un usuario, no es tuyo; si arregla solo al usuario con un runbook, es tuyo.**

## 9.5 El ticket bien documentado (lo que te distingue)

Todo ticket escalado (o cerrado) lleva:

```text
Usuario (UPN)  : ana.garcia@contoso-electronics.es
Síntoma        : no recibe correo externo de un remitente concreto desde el martes 12 10:00
Alcance        : solo ella; resto de affected OK. Web OK.
Evidencias     : NDR 550 5.7.604 del remitente; message trace ID <id> (no aparece entrada)
Hipótesis      : política antispam del tenant rechazando al remitente
Hechos         : revisada cuarentena/junk/reglas de bandeja sin hallazgo
Siguiente paso : escalar a N2 para revisar política anti-spam con el NDR adjunto
```

Ese formato (quién, qué, alcance, evidencia con IDs, qué has descartado, propuesta) es exactamente lo que hace que N2 te coja cariño y que las entrevistas técnicas de escenario te salgan solas.

Y el cierre de incidentes comunicativo: si era Microsoft (incidente confirmado), comunica a los afectados cuándo se restauró y qué se hizo; si era tuyo, documenta la causa para el runbook de la próxima vez.

## Esto te preguntarán en la entrevista

**P: Varios usuarios a la vez reportan que Teams no funciona. Primer paso.**
R: Delimitar alcance y comprobar Service Health del tenant antes de tocar nada: si hay incidente activo, comunicar y esperar sin cambios de configuración; si está verde, reproducir yo mismo y bajar al común de los afectados (red, cliente, cambio reciente del Message Center).

**P: ¿Qué es Service Health y en qué se diferencia del Message Center?**
R: Service Health es el tablero de estado de los servicios para mi tenant (incidentes y avisos activos e historial); el Message Center anuncia cambios y novedades futuras de Microsoft. Uno dice «está roto», el otro «va a cambiar».

**P: ¿Cómo decides si escalar un ticket?**
R: Si la solución es un runbook de un solo usuario, lo resuelvo yo; si cambia configuración que afecta a más gente (reglas globales, políticas, CA), va a N2; seguridad comprometida a N3; fallo del servicio a Microsoft vía Service Support con evidencias. Siempre con ticket documentado: alcance, evidencias con IDs y descartes hechos.

**P: Un usuario no puede entrar a M365 desde el aeropuerto. Ideas.**
R: Patrón clásico de Conditional Access o MFA: reviso el error literal y los sign-in logs de Entra para ver si una política bloquea por ubicación/dispositivo; compruebo métodos MFA; regularizo (dispositivo conforme) o escalo con la política identificada. Igual que en híbridos: el «no puedo entrar» rara vez es la contraseña.

**P: ¿Qué lleva un buen ticket escalado?**
R: UPN del afectado, síntoma exacto con hora de inicio, alcance (uno/muchos), evidencias con IDs (NDR, message trace, error literal), qué he comprobado y descartado, y mi hipótesis con el siguiente paso propuesto. Ahorrarle el diagnóstico a N2 es el trabajo de L1.

## Ejercicios prácticos

1. **De papel:** memoriza la diana del método: quién (radio), qué (síntoma literal), cuándo (cambios), dónde (canal/dispositivo), ¿antes funcionaba? Escribe las cinco preguntas y úsalas en voz alta con cualquier ticket de la tabla 9.3.
2. **De papel:** para cada caso, di «Microsoft, tuyo o del usuario» y por qué: (a) 40 personas sin correo a las 9:00; (b) un usuario no ve los ficheros del canal en su móvil pero sí en la web; (c) nadie puede compartir enlaces «cualquiera» desde ayer; (d) un usuario recibe todos los externos con 2 horas de retraso. (Respuestas: Service Health primero / cliente móvil / cambio de política (Message Center o N2) / flujo/filtros con message trace.)
3. **De laboratorio (cap. 8):** rompe algo a propósito (regla de transporte que redirige, licencia quitada, MFA revocado) y diagnostícalo solo con las herramientas del capítulo: message trace, sign-in logs, fichas de usuario. Diagnóstico por herramientas, no por memoria.
4. **De papel:** rellena la plantilla del ticket bien documentado (9.5) para el caso «perdí el móvil y con él el MFA». Completo, con las acciones de contención incluidas — es el mejor ejercicio de síntesis del libro.
