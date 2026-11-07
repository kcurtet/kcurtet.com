---
title: "5 · DNS: el corazón de Active Directory"
description: "Si tuviera que elegir un solo capítulo para ganar una entrevista de helpdesk, sería este. AD no \"usa\" DNS: AD vive dentro del DNS."
curso: "active-directory"
capitulo: 5
orden: 5
---
> «Si tuviera que elegir un solo capítulo para ganar una entrevista de helpdesk, sería este. AD no "usa" DNS: AD vive dentro del DNS.»

## Objetivos

- Explicar por qué AD depende radicalmente de DNS (la pregunta que separa candidatos).
- Leer los registros SRV de un dominio real y saber crear la consulta a mano.
- Configurar correctamente el DNS de clientes, DCs y forwarders.
- Diagnosticar «AD roto por DNS» con nslookup/nltest, y aplicar el caso real de convivencia con AdGuard Home.

## 5.1 Por qué AD eligió DNS

Un cliente del dominio necesita responder una pregunta constante: **«¿dónde hay un controlador de dominio, ahora mismo?»** Y la respuesta no puede ser «está en la IP X» hardcodeada: hay varios DCs, se añaden, se caen, hay uno «más cerca» en cada sede.

La solución es elegante: **los DC se anuncian ellos mismos en DNS mediante registros SRV**, como un correo anuncia sus MX. El cliente pregunta a DNS *«dame los DCs de corp.lab»* y DNS responde con la lista vigente. Descubierto un DC, para saber su IP se usa su registro A.

Consecuencia brutal para tu trabajo: **si DNS falla o miente, el dominio desaparece** para el cliente. No hay login, no hay join, no hay GPOs, no hay unidades de red. El error se verá como «no se puede contactar con un controlador de dominio», y la causa estará en DNS en el 80% de los casos.

> **Para tu cerebro Linux:** ya conoces los registros SRV (los has usado en Jabber/XMPP, VoIP/SIP o descubrimiento de servicios). AD hace exactamente eso mismo, a escala de identidad: `_ldap._tcp` es «el servicio LDAP por TCP», igual que `_sip._tcp` es «SIP por TCP».

## 5.2 Los registros que registra un DC

Cuando promocionas un DC (cap. 11), este registra en su zona DNS del dominio un conjunto estándar. Los que debes reconocer:

| Registro | Ejemplo | Qué responde |
|----------|---------|--------------|
| `_ldap._tcp.<dominio>` | SRV | «Dame servidores LDAP (DCs) de corp.lab» |
| `_kerberos._tcp.<dominio>` | SRV | Servidores Kerberos del dominio |
| `_ldap._tcp.dc._msdcs.<dominio>` | SRV | **Los DC del dominio** — la consulta clave para login/join |
| `_gc._tcp.<bosque>` | SRV | Global Catalog |
| `_ldap._tcp.<sitio>._sites.dc._msdcs.<dominio>` | SRV | DCs *del sitio* (sede) del cliente — afinar por cercanía |
| `dc1.<dominio>` | A | La IP del DC |

`_msdcs` es una subzona especial delegada dentro del dominio que concentra los registros de localización de DCs.

**La consulta de manual** (memorízala — la pedirán):

```bash
nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.lab

# en tu mundo:
dig +short SRV _ldap._tcp.dc._msdcs.corp.lab
```

Respuesta sana (lab del cap. 11):

```
_ldap._tcp.dc._msdcs.corp.lab  SRV service location:
  priority       = 0
  weight         = 100
  port           = 389
  svr hostname   = dc1.corp.lab
dc1.corp.lab  A  192.168.56.10
```

Si esta consulta funciona desde el cliente, el «esqueleto» de AD está vivo. Es el `ping` del dominio.

## 5.3 Zonas integradas en AD: el DNS del DC

En el 90% de despliegues, el DC **es también el servidor DNS** del dominio, y la zona `corp.lab` es una **zona integrada en Active Directory** (*AD-integrated zone*):

- La zona se guarda dentro de la base de datos de AD y se replica entre DCs con la misma replicación del dominio (una copia menos que mantener).
- Permite **actualizaciones dinámicas seguras** (*secure dynamic updates*): solo equipos autenticados del dominio pueden registrar/modificar sus registros. Es por eso que los DCs y clientes registran solos sus A/SRV: no hay playbook de DNS, el propio Windows lo hace.
- Por contraste, una *primary standard zone* es un fichero de zona clásico estilo BIND, con maestro único: legado, para casos raros.

Además, el DNS del DC suele tener **forwarders** (8.8.8.8, 1.1.1.1, o el DNS corporativo) para resolver internet; si no, usa root hints. El flujo de un cliente: pregunta al DNS del DC → si es `corp.lab`, resuelve él; si es internet, el DC lo reenvía.

> Nota lateral que te harán en charla de pasillo: el **aging/scavenging** (limpieza de registros dinámicos obsoletos) existe y mal configurado ha borrado registros vivos en más empresas de las que se admiten. N2.

## 5.4 La configuración correcta (y los tres pecados mortales)

**Regla de oro:**

- **Clientes del dominio**: DNS = la IP de los DCs (por DHCP se reparte). Ni el router, ni el 8.8.8.8, ni «el AdGuard Home de casa»… directamente.
- **DCs**: DNS = sí mismo (`127.0.0.1` o su propia IP) y como secundario, *otro DC*. Un DC nunca debe apuntar a un DNS externo como principal: es la causa clásica de «tras reiniciar el DC, el dominio medio funciona».
- **Forwarders** en el DNS del DC para lo que no sea el dominio.

**Los tres pecados mortales que te encontrarás (y diagnosticarás):**

1. Cliente con DNS `8.8.8.8`: internet funciona perfecto (¡engaña!), pero login/join/GPO fallan porque Google no sabe nada de `_ldap._tcp.dc._msdcs.corp.lab`. *Internet va, el dominio no → sospecha DNS.*
2. DHCP repartiendo el router como DNS con el DC «de vez en cuando»: fallos intermitentes por equipo — los que renovaron lease mal. Intermitencia = DNS.
3. DC apuntando a un DNS externo como primario: el propio DC «se pierde» de sí mismo tras reiniciar.

## 5.5 Diagnóstico: los 4 comandos

```bash
# 1) ¿Veo los DC? (desde el cliente con problemas)
nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.lab
dig +short SRV _ldap._tcp.dc._msdcs.corp.lab

# 2) ¿Resuelvo la IP del DC?
nslookup dc1.corp.lab
```

```powershell
# 3) ¿El equipo localiza un DC "oficialmente"? (nltest viene con Windows)
nltest /dsgetdc:corp.lab

# 4) ¿El DNS del DC está sano? (en el DC; N2 suele pedirte que lo pegues en el ticket)
dcdiag /test:dns
```

Flujo L1 ante «no puedo iniciar sesión / no se une al dominio»: primero el SRV del punto 1. Si falla → problema de DNS del cliente (¿a quién apunta?) o de la zona del DC (¿están los registros?). Si el SRV funciona → el problema ya no es de localización: sigue con puertos/credenciales (cap. 9).

## 5.6 Caso práctico personalizado: AD + AdGuard Home en la misma red

Escenario real para ti: red con AdGuard Home como DNS de todos (DHCP lo reparte) y un dominio `corp.lab` con su DC. Resultado típico: los clientes preguntan a AdGuard Home por `_ldap._tcp.dc._msdcs.corp.lab`; AdGuard Home consulta upstream y devuelve NXDOMAIN o nada. Los clientes no encuentran DC: logins lentos o fallidos, joins imposibles, GPOs erráticas.

**Dos soluciones correctas (elige una, no ambas):**

1. **La limpia — corporativa:** DHCP reparte como DNS la IP del DC (el DC tiene forwarders a AdGuard Home o a 1.1.1.1 para internet). El dominio se resuelve local; el resto se filtra igual. Es la que espera una empresa: *los clientes del dominio apuntan a los DC.*
2. **La casera — condicional:** los clientes siguen en AdGuard Home, y en AdGuard Home configuras un **DNS condicional**: `corp.lab` → `192.168.56.10` (el DC). En la GUI: Settings → DNS settings → Upstream DNS servers, con la entrada por dominio `[/corp.lab/]192.168.56.10`; equivalente a lo que en BIND sería:

```bind
zone "corp.lab" IN {
    type forward;
    forwarders { 192.168.56.10; };
};
```

Funciona para laboratorios y casas; en producción real casi siempre manda la opción 1 (menos capa de fallo). Saber explicar *por qué cada una* es una respuesta de entrevista de nivel.

**Trampa extra**: si el dominio se llama igual que un dominio público (`corp.com` real), los clientes pueden recibir respuestas públicas (split-brain): los SRV públicos no existirán y todo se rompe de formas sutiles. De ahí la moda histórica de `.local`… que hoy también apesta (colisiona con mDNS de macOS/Linux). Los dominios serios usan un subdominio dedicado (`ad.empresa.com`).

## 5.7 Por qué «el AD se rompe cuando se rompe el DNS» (el resumen para la entrevista)

1. El descubrimiento de DCs es 100% DNS vía SRV (`_ldap._tcp.dc._msdcs.<dom>`).
2. La base de datos de AD está sana aunque el DNS esté roto — pero *nadie la encuentra*.
3. Por eso el primer diagnóstico ante cualquier «no encuentro el dominio / no puedo iniciar sesión / GPO no aplica» es siempre la misma orden: la consulta SRV.

## Esto te preguntarán en la entrevista

**P: ¿Por qué DNS es tan importante en Active Directory?**
R: Porque los clientes localizan los controladores de dominio mediante registros SRV en DNS (`_ldap._tcp.dc._msdcs.<dominio>`). Si DNS falla, el cliente no encuentra DC: fallan login, join y GPOs aunque la base de datos de AD esté perfecta. Es lo primero que compruebo ante esos síntomas.

**P: ¿Qué registros DNS registra un DC?**
R: Registros SRV de localización (`_ldap._tcp`, `_kerberos._tcp`, `_ldap._tcp.dc._msdcs`, `_gc._tcp`, y variantes por sitio `_sites`), sus registros A, y la subzona delegada `_msdcs`. Se registran de forma dinámica y segura gracias a la zona integrada en AD.

**P: ¿A qué DNS debe apuntar un cliente del dominio? ¿Y un DC?**
R: El cliente, a los DNS de los DCs (nunca a DNS públicos o el router: resolverían internet pero no el dominio). El DC, a sí mismo (127.0.0.1 o su IP) o a otro DC, con forwarders para internet. Nunca un DC con DNS externo como principal.

**P: Un equipo no se puede unir al dominio: «no se puede contactar con un controlador de dominio». Primeros pasos.**
R: Comprobar que el cliente resuelve el dominio: `nslookup -type=SRV _ldap._tcp.dc._msdcs.<dominio>`. Si falla: revisar a qué DNS apunta el cliente (DHCP), que la zona del dominio exista y tenga los SRV, y que haya conectividad (ping al DC). Si resuelve: pasar a puertos (88/389/445) y credenciales.

**P: ¿Qué es una zona DNS integrada en AD?**
R: Una zona guardada dentro de la base de datos de AD y replicada entre DCs, que permite actualizaciones dinámicas seguras: solo máquinas autenticadas del dominio registran sus registros. Es la configuración típica frente a la zona primaria estándar de fichero.

## Ejercicios prácticos

1. **Lab:** tras montar el dominio (cap. 11), ejecuta desde el cliente `nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.lab` y pegotea la salida en tus notas. Anota cada campo y qué significa.
2. **Lab — romper a propósito:** cambia el DNS del cliente a `8.8.8.8`, intenta iniciar sesión con un usuario de dominio y observa el error exacto. Vuelve a ponerlo bien. Este contraste es la lección del capítulo entero.
3. **Lab — scavenging de registro:** borra a mano (en el DNS del DC) el registro A de `dc1`. Comprueba qué falla y qué no. Restáuralo (se re-registra solo tras `ipconfig /registerdns` o reinicio del servicio Netlogon en el DC).
4. **Personal:** monta en tu red el escenario AdGuard Home + lab de la sección 5.6 con el forwarding condicional y documenta qué síntomas ves antes del fix. Es experiencia real que contar en entrevista.
5. **De papel:** redacta en 4 líneas tu respuesta a «¿por qué el AD se rompe cuando se rompe el DNS?» sin mirar la sección 5.7.
