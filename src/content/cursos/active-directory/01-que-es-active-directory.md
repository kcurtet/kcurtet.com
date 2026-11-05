---
title: "1 · Qué es Active Directory y por qué existe"
description: "Un directorio es una base de datos; Active Directory es la base de datos que gobierna una oficina Windows."
curso: "active-directory"
capitulo: 1
orden: 1
---
> «Un directorio es una base de datos; Active Directory es la base de datos que gobierna una oficina Windows.»

## Objetivos

- Explicar qué problema resuelve un dominio en una oficina (la pregunta 1 de toda entrevista).
- Situar AD respecto a LDAP, Kerberos y DNS: qué es cada cosa y qué se inventó Microsoft.
- Leer un Distinguished Name sin miedo.
- Manejar el vocabulario mínimo del día 1: dominio, DC, join, OU, GPO.

## 1.1 El problema: 200 ordenadores, 200 cuentas locales

Imagina una oficina con 200 PCs Windows sin nada centralizado. Cada PC tiene sus cuentas locales (`Administrador`, algún usuario). Ya sabes cómo es esto: es como administrar 200 máquinas Linux con `/etc/passwd` local en cada una.

Las consecuencias:

- **Onboarding**: dar de alta a una persona nueva = crear su cuenta en los N equipos a los que necesita acceder. Alta de 45 minutos. Offboarding: borrar de N equipos, y ojalá no se te olvide ninguno.
- **Contraseñas**: la gente usa la misma en todo, o la apunta en un post-it. No puedes exigir rotación ni complejidad de forma centralizada.
- **Permisisos**: ¿quién puede entrar al servidor de ficheros? Cada máquina decide. No hay auditoría posible.
- **Configuración**: fondo corporativo, bloqueo de USB, proxy… se configura a mano, equipo a equipo. O no se configura.

La solución en el mundo Unix fue centralizar el *identity* (NIS en los 80, LDAP después, FreeIPA hoy). En el mundo Windows, la solución se llama **dominio**, y el software que lo implementa es **Active Directory**.

**Un dominio = una autoridad central de autenticación + una base de datos de identidades + un mecanismo de política.** En vez de 200 bases de datos locales, hay una central; en vez de autenticar contra cada máquina, autenticas una vez contra el dominio y esa identidad te sirve en todas partes (*single sign-on*).

## 1.2 Qué es exactamente: desmontando la sigla

Active Directory **no es una sola tecnología**, es un producto que integra varias piezas estándar más cosas propias. Desmontarlo te da el modelo mental exacto:

| Pieza | Estándar/origen | Qué aporta |
|-------|-----------------|-----------|
| Base de datos de objetos jerárquica consultable | **LDAP/X.500** | Estructura de árbol, atributos, consultas |
| Protocolo de consulta | **LDAP** (puerto 389/636) | Buscar y leer/escribir objetos |
| Autenticación | **Kerberos** (puerto 88) + NTLM como fallback | Tickets, no contraseñas por la red |
| Localización de servicios | **DNS** con registros **SRV** | «¿Dónde está un DC?» se responde vía DNS |
| Política y automatización | Propietario: **GPO**, replication vía SMB/RPC | Configuración obligatoria a escala |

> **Para tu cerebro Linux:** AD es a LDAP+Kerberos+DNS lo que FreeIPA es a LDAP+Kerberos+DNS: una integración producto con extras propios. Y de hecho **Samba** implementa un controlador de dominio compatible con AD (lo usaremos en el capítulo 11 como lab ligero). Cuando en una entrevista digan «AD es LDAP», ya sabes que es *más* que LDAP: LDAP es el protocolo de consulta; AD añade autenticación Kerberos, localización por DNS y réplicas multi-master.

**AD DS** (Active Directory **Domain Services**) es el nombre del rol de Windows Server que implementa todo esto. Cuando alguien dice «el AD», dice AD DS.

## 1.3 El modelo mental: iniciar sesión en un dominio

Qué pasa físicamente cuando Kevin se sienta en un PC del dominio `corp.lab` y pone su contraseña:

1. El PC ya está **unido al dominio** (*join*, capítulo 4): sabe que su autoridad es `corp.lab`.
2. Para encontrar un controlador de dominio (DC), **consulta DNS**: pide los registros SRV de `_ldap._tcp.dc._msdcs.corp.lab` (capítulo 5).
3. Con la IP del DC, negocia con **Kerberos** (puerto 88): el DC le devuelve un *ticket* (TGT, capítulo 8) que acredita que es `kevin` sin volver a mandar la contraseña.
4. Con ese ticket, el PC inicia sesión y, además, puede abrir `\\fileserver\datos` **sin volver a poner la contraseña**: presenta el ticket al servidor de ficheros.
5. Al iniciar sesión, el equipo aplica las **GPO** que le correspondan (capítulo 6).

Todo lo demás del libro son detalles de estas cinco líneas.

## 1.4 Objetos y el árbol: el Distinguished Name

La base de datos de AD es un **árbol** de **objetos** (usuarios, equipos, grupos, OU…). Cada objeto tiene atributos (nombre, email, departamento…) y una posición única en el árbol: su **Distinguished Name (DN)**.

El usuario Kevin en la OU de Soporte del dominio `corp.lab`:

```
CN=Kevin Mas,OU=Soporte,OU=Empleados,DC=corp,DC=lab
```

Léelo de izquierda a derecha como «el objeto llamado *Kevin Mas* que está dentro de OU Soporte, dentro de OU Empleados, dentro del dominio corp.lab». Componentes:

- **CN** (Common Name): nombre del objeto.
- **OU** (Organizational Unit): contenedor organizativo (capítulo 2).
- **DC** (Domain Component): trozos del dominio DNS, al revés que un FQDN. `corp.lab` → `DC=corp,DC=lab`.

> **Para tu cerebro Linux:** es el mismo truco que un FQDN invertido o que el DN de OpenLDAP (`uid=kevin,ou=people,dc=corp,dc=lab`). Si has hecho `ldapsearch -b "dc=corp,dc=local"`, ya has escrito la mitad de un DN de AD.

El **esquema** (schema) define qué clases de objetos y atributos existen: es el equivalente al esquema de un servidor LDAP. Como L1 no lo tocarás nunca; basta saber que existe y que es compartido por todo el bosque.

## 1.5 Qué NO es Active Directory

Tan importante como saber qué es:

- **No es «el DNS»**, aunque lo use intensivamente (capítulo 5). Un DC *incluye* un servidor DNS casi siempre, pero son cosas distintas.
- **No es un servidor de ficheros.** El DC autentica; los ficheros pueden estar en cualquier otro servidor del dominio.
- **No es la nube.** *Entra ID* (antes Azure AD) es otro producto distinto (capítulo 10). Comparten nombre comercial, no tecnología.
- **No es solo un directorio LDAP**: sin Kerberos y DNS, AD no funciona. Quien entiende esto entiende el troubleshooting.

## 1.6 Vocabulario mínimo del día 1

| Término | Definición de una línea |
|---------|------------------------|
| **Dominio** | El reino de autenticación: `corp.lab`. Límite administrativo y de seguridad básico. |
| **DC** | Servidor con una copia de la base de datos del dominio; autentica y sirve políticas. |
| **Join** | Acto de unir un equipo al dominio; a partir de ahí se autentica contra los DC. |
| **OU** | Contenedor dentro del dominio para organizar objetos, delegar y colgar GPOs. |
| **GPO** | Política de configuración aplicada a equipos/usuarios según su posición. |
| **Forest / Bosque** | Conjunto de dominios relacionados con confianza mutua (capítulo 2). |

## Esto te preguntarán en la entrevista

**P: ¿Qué es Active Directory y para qué se usa?**
R: Es el servicio de directorio de Microsoft: una base de datos centralizada de usuarios, equipos y grupos que permite autenticación única (Kerberos), administración delegada y aplicación de políticas (GPO) a toda la organización. Resuelve el problema de gestionar identidad y configuración de cientos de equipos de forma centralizada.

**P: ¿Qué protocolos usa AD?**
R: LDAP para consultar el directorio, Kerberos como autenticación principal (con NTLM por compatibilidad) y DNS con registros SRV para que clientes y DC se encuentren. SMB/RPC para replicación y políticas.

**P: ¿AD y LDAP son lo mismo?**
R: No. LDAP es el protocolo estándar de consulta del directorio; AD es un producto que implementa LDAP y añade Kerberos, integración DNS, réplicas multi-master y GPOs. OpenLDAP solo implementa el directorio LDAP.

**P: ¿Qué es un dominio en este contexto?**
R: El límite administrativo y de seguridad donde viven las cuentas: un namespace DNS (corp.lab) con sus usuarios, grupos y equipos, administrado por uno o más controladores de dominio. Un usuario del dominio puede iniciar sesión en cualquier equipo unido a él, con los permisos que le correspondan.

## Ejercicios prácticos

1. **De papel:** dibuja el DN de una usuaria «Ana Ruiz» del departamento Ventas de la empresa `acme.local` dentro de la estructura `OU=Empleados`. Compáralo con el DN LDAP equivalente.
2. **De papel:** escribe de memoria los 5 pasos del login en dominio de la sección 1.3. Si te bloqueas en uno, ese es tu capítulo a repasar.
3. **Rápido:** tu oficina tiene 50 PCs sin dominio. Enumera 4 problemas concretos que un dominio resolvería y cómo.
4. **Relaciona conceptos:** para cada pieza de AD (LDAP, Kerberos, DNS/SRV, GPO) escribe qué problema de la sección 1.1 resuelve.
