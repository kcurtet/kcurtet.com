---
title: "3 · Exchange Online: el rey de los tickets"
description: "En soporte de oficina, el correo es como el agua: nadie piensa en él hasta que falla. Y cuando falla, el teléfono suena antes de que termines el café."
curso: "microsoft-365"
capitulo: 3
orden: 3
---
> «En soporte de oficina, el correo es como el agua: nadie piensa en él hasta que falla. Y cuando falla, el teléfono suena antes de que termines el café.»

## Objetivos

- Entender el flujo de correo en Exchange Online y mapear tu conocimiento de SPF/DKIM/DMARC/MX al mundo Microsoft.
- Dominar tipos de buzón, aliases, grupos de distribución y reglas de transporte.
- Resolver con método el ticket rey: **«no me llegan correos»** (cuarentena, spam, reglas, buzón lleno, NDR).
- Distinguir Full Access, Send As y Send on Behalf para delegaciones.

## 3.1 Qué es Exchange Online

Exchange Online (EXO) es el buzón como servicio: sin servidores tuyos, sin mantener una base de datos de colas, pero con el mismo protocolo de siempre — **SMTP sigue siendo SMTP**. Todo lo que ya configuraste para tu dominio (MX, SPF, DKIM, DMARC en Cloudflare) funciona idéntico; solo cambian los valores. Incluido en todos los planes viene **EOP** (Exchange Online Protection), el filtro anti-spam/anti-malware que decide qué entra, qué va a spam y qué va a cuarentena.

Se administra desde el **Exchange admin center** (admin.exchange.microsoft.com), y la parte de protección/cuarentena desde el portal de **Defender** (security.microsoft.com) — esa costura entre portales es muy M365.

## 3.2 El DNS del correo en M365 (tu terreno)

Ya hiciste esto para Workspace; aquí va la traducción de chuleta. Al añadir y verificar el dominio (`contoso-electronics.es` con el TXT `MS=msXXXXXXXXXXX`), el asistente te pide:

| Registro | Valor M365 típico | Qué hace |
|----------|-------------------|----------|
| MX | `contoso-electronics-es.mail.protection.outlook.com` (prioridad 0) | El correo entra por EOP primero. |
| TXT (SPF) | `v=spf1 include:spf.protection.outlook.com -all` | Autoriza a M365 a enviar en tu nombre. |
| CNAME (autodiscover) | `autodiscover.outlook.com` | Autoconfigura Outlook con solo el email. |
| CNAME ×2 (DKIM) | `selector1._domainkey` y `selector2._domainkey` → `selectorN-contoso…._domainkey.tenant.domains.microsoftonline.com` | Firma DKIM. **Hay que activarlos** en Defender → Email & collaboration → DKIM. |
| TXT (DMARC) | `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:…` | Idéntico al que ya escribiste para Google. |

```bash
# Tus comandos de siempre sirven igual contra un tenant M365:
dig MX contoso-electronics.es +short
dig TXT contoso-electronics.es +short          # SPF
dig CNAME selector1._domainkey.contoso-electronics.es +short
```

Tres detalles que diferencian a M365:

1. **El dominio inicial** `contosoelectronics.onmicrosoft.com` existe siempre: es el dominio por defecto de los buzones y el que firma el correo **si no activas DKIM para tu dominio custom**. Correo sin firmar = receptor con sospecha = spam. Activar DKIM del dominio custom es checklist de cualquier alta.
2. **MX apunta a EOP, no al buzón**: EOP filtra y entrega. Por eso el «no me llegan correos» de M365 tiene un actor más en la cadena (remitente → su servidor → EOP → cuarentena/spam/buzón).
3. Si la empresa venía de Exchange on-prem, puede haber **conectores** (connectors) y flujo híbrido que enrutan por el servidor viejo — a nivel L1 basta saber que existen y que «connector raro en el flujo» es razón de escalado.

## 3.3 Tipos de buzón

| Tipo | Qué es | Licencia |
|------|--------|----------|
| **Usuario** | El buzón de una persona, asociado a su cuenta | Requiere licencia. 50 GB (planes base) o 100 GB (E3+). |
| **Compartido** | Buzón genérico (soporte@, info@) al que acceden varias personas desde su Outlook | **Gratis** si es ≤50 GB, sin archivador ni retención. Nadie hace login directo con él. |
| **Recurso** | Salas y equipos: se reservan desde el calendario y aceptan/rechazan solos | Gratis con ciertos límites. |

El buzón compartido es la respuesta estándar a dos necesidades distintas: «que varios lean soporte@» y «conservar el correo del que se va sin gastar licencia». Para usarlo, el usuario accede a él desde su Outlook (añadir buzón compartido) — nunca con usuario/contraseña propios, porque no los tiene.

**Permisos de delegación** (los tres que se confunden):

- **Full Access**: abrir y leer el buzón de otro. El clásico jefe-asistente.
- **Send As**: enviar correos que salen literalmente *como* la otra persona (`De: direccion@…`).
- **Send on Behalf**: enviar en nombre de — el destinatario ve «Ana en nombre de Dirección». Menos habitual.

Se asignan en EAC → Recipients → Mailbox → Delegation. Pregunta de entrevista fácil si los tienes claros; desastre si no.

## 3.4 Aliases y direcciones

Un buzón tiene una **dirección SMTP primaria** (la que sale en sus correos) y cero o más **aliases** (proxy addresses): `soporte@`, `ayuda@` y `info@` pueden caer todas en el mismo buzón. Gratis, sin licencias, sin configuración DNS extra — igual que los aliases de Gmail/Workspace. Se añaden desde el buzón en el EAC o en el admin center → usuario → gestionar alias de correo.

Detalle útil: cambiar la primaria cambia lo que sale en el `From` de todo lo que envía ese buzón; añadir alias solo añade entrada. **No existe catch-all nativo** (que ANYTHING@dominio caiga en un buzón): se puede imitar con regla de transporte, y las empresas lo suelen desactivar por spam — saberlo evita prometerlo a un usuario.

## 3.5 Grupos de distribución y reglas de transporte

**Grupos de distribución**: la dirección `ventas@` reparte a los miembros. En EAC → Groups. Diferencia con el grupo M365 (capítulo 2): el de distribución solo reparte correo; el grupo M365 además tiene sitio SharePoint, calendario y equipo Teams. Confundirlos es el error clásico del usuario — y del entrevistado.

**Reglas de transporte** (mail flow rules) = las routing rules de Gmail: condiciones → acciones, evaluadas en orden en el servidor, antes de que el mensaje llegue a la bandeja. En EAC → Mail flow → Rules. Ejemplos que verás en producción:

```text
Condición: el remitente es externo
Acción: anteponer al asunto [EXTERNO] y añadir disclaimer en el cuerpo

Condición: el mensaje lleva adjunto .exe/.bat/.js
Acción: rechazar con NDR explicativo   (política de seguridad clásica)

Condición: destinatario es antiguos-empleados@
Acción: redirigir a rrhh@empresa.es     (bounce-management humano)
```

Conceptos para la entrevista: tienen **prioridad** (orden de evaluación), pueden **detener** el procesamiento de reglas posteriores (Stop processing more rules), y afectan a TODO el flujo del tenant — un cambio mal hecho es incidente de empresa entera. Como L1 las *lees* con respeto; crearlas suele ser N2 (aunque en pymes te tocará).

## 3.6 El ticket rey: «no me llegan correos»

Método antes que checklist. Primero delimita — dos preguntas que recortan el 80% del espacio de búsqueda:

1. **¿Es solo este usuario o hay más?** (Más afectados → salud del servicio / regla de transporte / MX; ver capítulo 9.)
2. **¿No le llega TODO, o solo de remitentes externos?** (Solo externos → filtro EOP; todo incluido interno → regla/buzón.)

Y pide siempre la máxima evidencia disponible: el correo de **NDR/rebote** del remitente (contiene el código SMTP), la fecha/hora exacta y el remitente afectado.

Checklist ordenada del caso «solo este usuario»:

| # | Dónde miras | Qué buscas |
|---|-------------|------------|
| 1 | **Cuarentena** (Defender → Email & collaboration → Review → Quarantine) | EOP lo retuvo: phishing/malware/alto spam. El usuario puede liberar spam desde su propia vista; phishing/malware los libera un admin. |
| 2 | **Junk del usuario** | Filtrado más suave. Ver también la lista de remitentes bloqueados del usuario (se bloquean solos sin darse cuenta). |
| 3 | **Reglas de bandeja del usuario** (OWA → Configuración → Reglas) | Regla que mueve/borra correo: creada por el usuario, por un asistente, o por un atacante (capítulo 7). La más traicionera. |
| 4 | **Reglas de transporte** | ¿Alguna regla reciente redirige o bloquea? (Compara con la fecha en que empezó el problema.) |
| 5 | **Cuota del buzón** | Buzón lleno (50/100 GB según plan): el correo rebota con 5.2.2. Se ve en el EAC (usage). |
| 6 | **Message trace** | La herramienta de la verdad — ver abajo. |

**Message trace** (EAC → Mail flow → Message trace): la traza de cada mensaje que pasa por el tenant — cuándo entró, de quién, a quién, qué filtro lo tocó y dónde acabó (Delivered / Junk / Quarantined / Failed). Es el `grep` del correo: si el trace dice «Delivered» y el usuario no lo ve, el problema está **después** de la entrega (regla de bandeja, vista, otro dispositivo). Si no aparece el mensaje, el problema está **antes** (DNS del remitente, EOP, MX). Este razonamiento divide-bien-es-oro es lo que un entrevistador quiere oír.

**Lectura de NDRs** — los códigos que valen la pena:

| Código | Significado | Acción L1 |
|--------|-------------|-----------|
| `550 5.4.1 recipient address rejected` | El destinatario no existe en este tenant | ¿Alias mal escrito? ¿El buzón se borró? |
| `550 5.2.2 mailbox full` | Buzón lleno | Comunicar cuota / pedir archivador a N2 |
| `550 5.1.10 mailbox unavailable` | No hay buzón para esa dirección | Igual que 5.4.1: dirección vs objeto |
| `550 5.7.606-608 access denied, banned sending IP` | El servidor remitente está en lista negra de Microsoft | Es problema DEL REMITENTE: su IP está bloqueada; se lo comunicas |
| `550 5.7.604 denied by policy` | Política antispam del tenant rechazó al remitente | Revisar reglas/anti-spam del tenant |

Y el caso espejo — **«me salen a spam los que YO envío»**: es tu especialidad. Checklist: SPF incluye `spf.protection.outlook.com`, DKIM activado para el dominio custom (si no, firma el `.onmicrosoft.com` y el alineamiento DMARC falla), DMARC correcto en Cloudflare. Si el dominio es nuevo, reputación; si solo falla con UN destinatario, su filtro — su problema.

## 3.7 Higiene del buzón: de papel y de verdad

Dos tickets frecuentes con respuesta rápida:

- **«Mi buzón está lleno»**: se sube de plan (50→100 GB con E3), archivador online (licencia), o limpieza con quota tools. L1: comunicar el uso real y las opciones; la compra la decide otro.
- **«Necesito el correo de mi antecesor en esta dirección»**: delegación (Full Access) sobre el buzón compartido resultante del offboarding (capítulo 2). Ojo: convertir el buzón de un usuario en compartido **antes** de quitar la licencia conserva todo gratis.

## Esto te preguntarán en la entrevista

**P: Un usuario dice que no le llegan correos. ¿Pasos?**
R: Delimito primero: ¿solo él o más gente?, ¿todo o solo externos? Pido NDR y fecha/hora. Luego: cuarentena (EOP), carpeta junk, reglas de bandeja del usuario, reglas de transporte recientes, cuota del buzón. Con el message trace confirmo si el mensaje llegó al tenant y dónde acabó: Delivered pero no lo ve = problema post-entrega; no aparece = problema en origen/filtrado.

**P: ¿Qué es la cuarentena y quién puede liberar?**
R: Donde EOP retiene correo peligroso (malware, phishing, spam de confianza alta) en vez de entregarlo. El usuario puede autorregularse el spam desde sus notificaciones/vista; phishing y malware los libera un administrador tras revisar. Se gestiona desde el portal de Defender.

**P: ¿Diferencia entre buzón de usuario, compartido y de recurso?**
R: Usuario: persona, con licencia. Compartido: genérico (soporte@) sin login directo, gratis hasta 50 GB, usado por varias personas con permisos Full Access/Send As. Recurso: sala/equipo que se reserva por calendario con auto-respuesta.

**P: ¿Qué es una regla de transporte? Pon un ejemplo.**
R: Regla servidor de flujo de correo: condiciones → acciones, ordenadas por prioridad, sobre todo el tenant. Ejemplo: marcar [EXTERNO] en asunto de correo entrante externo, o rechazar adjuntos ejecutables con NDR. Equivalente a las routing rules de Gmail pero a nivel de organización.

**P: ¿Cómo configuras DKIM en M365?**
R: Verificado el dominio, se activa en el portal de Defender → DKIM tras crear los dos CNAME de selector; con eso M365 firma con el dominio propio. Sin activarlo, firma con el dominio inicial `tenant.onmicrosoft.com` y falla el alineamiento DMARC, que está basado en SPF/DKIM idéntico al estándar que ya conozco.

**P: Diferencia entre Full Access y Send As.**
R: Full Access es permiso para abrir y leer un buzón ajeno; Send As permite enviar como si fuera ese buzón (el correo sale con su dirección). Send on Behalf es la variante «en nombre de». Se asignan en la delegación del buzón en el EAC.

## Ejercicios prácticos

1. **De papel:** dibuja el camino completo de un correo externo hasta una bandeja: DNS/MX del remitente → su servidor → EOP (filtros) → entrega/buzón → reglas de bandeja → vista del usuario. Escribe al lado de cada flecha el síntoma que produce su fallo y la herramienta que lo diagnostica (message trace cubre casi todo el tramo central).
2. **De papel:** a cada NDR su acción: `5.4.1`, `5.2.2`, `5.7.606`, `5.7.604`. Añade el caso «el remitente dice que me escribió pero el trace no muestra nada» (respuesta: mensaje que nunca llegó al tenant: dominio equivocado o problema en origen; pide el NDR exacto).
3. **De laboratorio (cap. 8):** crea un buzón compartido `soporte@`, dale Full Access y Send As a un usuario de prueba, y envía un correo comprobando ambas cosas. Luego crea una regla de transporte que anteponga `[EXTERNO]` al asunto de todo correo entrante y verifícala desde una cuenta externa.
4. **De laboratorio:** ejecuta `dig MX`, `dig TXT` y los CNAME de DKIM contra tu dominio de lab; activa DKIM en Defender y envía un correo a una cuenta externa; revisa en las cabeceras del destinatario la línea `DKIM-Signature` y el resultado SPF/DKIM/DMARC. Es tu terreno: hazlo sin mirar.
5. **Trampa de entrevista:** un usuario con buzón lleno no recibe correos. ¿Qué NDR reciben quienes le escriben? ¿Quién lo puede arreglar y qué opciones hay? (5.2.2; el dueño limpia, L1 comunica, N2/empresa decide archivador o plan.)
