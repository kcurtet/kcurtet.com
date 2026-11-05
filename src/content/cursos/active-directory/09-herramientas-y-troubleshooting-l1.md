---
title: "9 · Herramientas del día a día + Troubleshooting L1"
description: "ADUC para la vida diaria, PowerShell para brillar, nslookup/nltest para diagnosticar, y saber exactamente qué se le pasa a N2 con datos completos. Ese es el kit completo del N1."
curso: "active-directory"
capitulo: 9
orden: 9
---
> «ADUC para la vida diaria, PowerShell para brillar, nslookup/nltest para diagnosticar, y saber exactamente qué se le pasa a N2 con datos completos. Ese es el kit completo del N1.»

## Objetivos

- Instalar y dominar RSAT: ADUC, ADAC, GPMC, DNS.
- Tener un cheatsheet de PowerShell de AD operativo (no teórico).
- Usar ldp.exe como lo que es: un cliente LDAP con patas.
- Tener la tabla de síntoma→causa→acción de los tickets L1 más frecuentes.
- Saber cuándo y cómo escalar a N2.

## 9.1 RSAT: las herramientas del DC en tu PC

**RSAT** (Remote Server Administration Tools) es el paquete de Microsoft con los MMC de administración para instalar en tu Windows 10/11 *cliente* y administrar el dominio sin entrar al DC. En empresas serias, el L1 no hace RDP al DC: usa RSAT desde su puesto (y el acceso al DC queda auditado y restringido).

Instalación (GUI: Configuración → Aplicaciones → Características opcionales → «Herramientas de administración de servidor remoto» o pieza a pieza):

```powershell
# Como admin, la pieza de AD (ADUC + módulo PowerShell + ldp... no, ldp va aparte):
Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDAPTools~~~~0.0.1.0"
Get-WindowsCapability -Online -Name Rsat*        # ver todas las piezas
```

Lo que trae y usarás:

| Herramienta | Ejecutable | Para qué |
|-------------|-----------|----------|
| **ADUC** (Usuarios y equipos de AD) | `dsa.msc` | El cuchillo suizo: buscar, reset, unlock, mover, grupos |
| **ADAC** (Centro de administración) | `dsac.exe` | ADUC modernizado con histórico de PowerShell |
| **GPMC** | `gpmc.msc` | Gestión de GPOs (cap. 6) |
| **DNS** | `dnsmgmt.msc` | Ver zonas, registros SRV (cap. 5) |
| Módulo **ActiveDirectory** de PowerShell | `Import-Module ActiveDirectory` | Todo lo de 9.3 |

Truco de productividad ADUC: **Consultas guardadas** (Saved Queries) — crea una «Cuentas bloqueadas» con filtro y la tendrás en un clic cada mañana.

## 9.2 PowerShell de AD: el cheatsheet operativo

Asumimos el módulo cargado (en DC/RSAT viene de serie; si no: `Import-Module ActiveDirectory`).

```powershell
# ---- Consultar ----
Get-ADUser aruiz -Properties *                     # ficha completa
Get-ADUser -Filter {Enabled -eq $false} -SearchBase "OU=Empleados,DC=corp,DC=lab"   # deshabilitados de una OU
Get-ADUser -Filter "Department -eq 'Ventas'"       # por atributo
Get-ADComputer -Filter * -SearchBase "OU=Estaciones,DC=corp,DC=lab" | Select Name,LastLogonDate
Get-ADGroupMember GG-Ventas -Recursive
Get-ADPrincipalGroupMembership aruiz                # grupos de un usuario

# ---- Las operaciones L1 ----
Set-ADAccountPassword aruiz -Reset -NewPassword (Read-Host 'Nueva' -AsSecureString)
Set-ADUser aruiz -ChangePasswordAtLogon $true
Unlock-ADAccount aruiz
Disable-ADAccount aruiz
Enable-ADAccount aruiz
Search-ADAccount -LockedOut | Unlock-ADAccount      # lunes por la mañana

# ---- Crear y mover ----
New-ADUser -Name "Ana Ruiz" -SamAccountName aruiz -Path "OU=Ventas,OU=Empleados,DC=corp,DC=lab" -AccountPassword (Read-Host 'Pass' -AsSecureString) -Enabled $true
Move-ADObject "CN=PC005,CN=Computers,DC=corp,DC=lab" -TargetPath "OU=Estaciones,DC=corp,DC=lab"

# ---- Atributos ----
Set-ADUser aruiz -Department Ventas -Description "Ticket #4213"
Set-ADAccountExpiration aruiz -DateTime "2026-06-30"
```

> **Para tu cerebro Linux:** `Get-Command *-AD*` es tu `compgen`; `Get-Help Get-ADUser -Examples` tu `man`; el pipeline `| Where-Object`/`Select-Object` es tu `grep`/`awk`. La curva es corta: es un shell de verdad.

## 9.3 ldp.exe: LDAP con patas (y su hermano ldapsearch)

`ldp.exe` (viene con RSAT) es un **cliente LDAP gráfico**: conexión → bind (autenticación) → explorar el árbol → ver objetos y atributos crudos, con sus nombres LDAP reales (`distinguishedName`, `sAMAccountName`, `memberOf`…). Su uso canónico en soporte: verificar que **LDAP funciona y unas credenciales son válidas**, independiente de todo lo demás:

1. `ldp.exe` → Conexión → Conectar: `dc1.corp.lab`, puerto 389.
2. Conexión → Enlazar (bind): usuario + contraseña. Si enlaza, LDAP y tus credenciales van bien.
3. Ver → Tree: base `DC=corp,DC=lab` y navega. Verás el bosque tal y como lo vería cualquier cliente LDAP.

Equivalencia exacta en tu mundo:

```bash
ldapsearch -x -H ldap://dc1.corp.lab -D 'aruiz@corp.lab' -W \
  -b 'DC=corp,DC=lab' '(sAMAccountName=aruiz)' memberOf
```

Si en una entrevista mencionas que AD se puede consultar con `ldapsearch` desde Linux con esas líneas, has demostrado más comprensión de AD que muchos candidatos con años de ADUC.

## 9.4 Los comandos de diagnóstico (repaso operativo)

```bash
# DNS del dominio (cap. 5)
nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.lab
dig +short SRV _ldap._tcp.dc._msdcs.corp.lab
```

```powershell
nltest /dsgetdc:corp.lab          # localización oficial de DC por el cliente
Test-ComputerSecureChannel        # confianza del equipo (cap. 4)
gpresult /r                       # GPOs (cap. 6)
klist                            # tickets Kerberos (cap. 8)
dcdiag /test:dns                  # salud DNS del DC (suele pedirlo N2: sé quién lo ejecuta)
```

**Tabla de puertos** (cuando el firewall es sospechoso; cortesía de tu formación de red):

| Puerto | Servicio | Síntoma si está cortado |
|--------|----------|------------------------|
| 53 TCP/UDP | DNS | No se encuentra el dominio |
| 88 TCP/UDP | Kerberos | Login falla con DNS bien |
| 389 / 636 | LDAP / LDAPS | Consultas de directorio y joins fallan |
| 445 TCP | SMB (SYSVOL, shares) | GPOs y unidades de red fallan |
| 464 TCP/UDP | Cambio de contraseña Kerberos | No se puede cambiar la contraseña |
| 123 UDP | NTP | Desincronía → Kerberos rechaza |
| 135 + 49152-65535 TCP | RPC dinámico | Operaciones de gestión fallan |

## 9.5 Troubleshooting por síntoma: la tabla L1

| Síntoma | Causas más probables (en orden) | Primera acción |
|---------|--------------------------------|----------------|
| «No puedo iniciar sesión» (usuario) | Contraseña/bloqueo/deshabilitado; DNS; DC no alcanzable | ¿Puede otro usuario? ¿SRV responde? ¿Estado de cuenta? (tabla cap. 3) |
| «No puedo iniciar sesión en NINGÚN dominio, pero local sí» | Confianza rota (cap. 4) | `Test-ComputerSecureChannel` |
| «No se puede contactar con un DC» (al hacer join) | DNS del cliente; puertos; credenciales | `nslookup -type=SRV _ldap._tcp.dc._msdcs...` (cap. 5) |
| «Perfil temporal» | Perfil corrupto / `.bak` en registro (cap. 4) | Eventos de User Profile Service |
| «No veo la unidad de red» | GPP/permisos/credenciales; grupo añadido sin re-login (cap. 7) | `gpresult /r` + effective access |
| «La GPO no aplica» | OU equivocada; filtro; pisada (cap. 6) | `gpresult /r` |
| «Vuelven a bloquearme la cuenta» | Credencial vieja en móvil/creds guardadas (cap. 8) | Evento 4740 + cazar origen |
| Login lentísimo (2-5 min) | DNS lento/malo; perfil enorme; GPO con script colgado | Probar login con red cableada; SRV lookup timing |
| «Internet va pero el dominio no» | DNS apuntando fuera (8.8.8.8/router) (cap. 5) | Comprobar DNS del cliente |
| Aplicación «no responde» solo tras cambio de contraseña | Ticket viejo válido / creds cacheadas (cap. 8) | Re-login completo, `klist purge` |

Método general (vale para todo): **1)** reproducir y capturar el error exacto, **2)** delimitar alcance (¿un usuario? ¿un equipo? ¿todos?), **3)** la capa más probable según la tabla, **4)** verificar con el comando específico, **5)** si no cuadra, subir de capa (DNS→puertos→auth→AD).

## 9.6 Cuándo escalar a N2 y cómo

**Escala** (con datos, no con pánico):

- Problemas de **replicación** entre DCs (eventos de Directory Service en el DC, `repadmin` en rojo — se lo pasas, no lo curas).
- **Roles FSMO** (seize/transfer) y DCs caídos o a medio promocionar.
- **Trusts** entre dominios/bosques rotos.
- GPO que rompe a **muchos usuarios a la vez** (rollback rápido o N2 decide).
- **Certificados** (AD CS, LDAPS), backups/restauraciones de DC, y todo lo que toque *modificar* la estructura del dominio.
- Cualquier cosa que requiera Domain Admin para probar: se pide acceso formal, no se «apaña».

**Cómo escalar bien** (lo que te diferencia): un ticket con — usuario/equipo afectado, hora exacta, mensaje de error literal (captura), alcance (1 usuario vs departamento), qué has verificado ya (SRV ok, estado de cuenta ok, gpresult ok…) y qué cambia el patrón («solo en la wifi de la sede 2»). Cinco líneas que valen un oro.

## Esto te preguntarán en la entrevista

**P: ¿Qué es RSAT?**
R: Remote Server Administration Tools: el paquete de herramientas de administración de Windows Server (ADUC, GPMC, DNS, el módulo de PowerShell de AD…) para instalarlas en un cliente y administrar el dominio sin RDP al DC.

**P: ¿Qué cmdlets de AD usas a diario?**
R: `Get-ADUser`, `Set-ADAccountPassword -Reset`, `Unlock-ADAccount`, `Disable/Enable-ADAccount`, `Search-ADAccount -LockedOut`, `Get-ADGroupMember`, `New-ADUser` y `Move-ADObject`. Con `Read-Host -AsSecureString` para las contraseñas.

**P: ¿Cómo verificas que LDAP y unas credenciales funcionan, aisladamente?**
R: Con `ldp.exe`: conecto al DC por 389, hago bind con el usuario y contraseña en duda; si enlaza, LDAP y las credenciales son válidas. Desde Linux, equivalente con `ldapsearch -x -D usuario -W`.

**P: Un usuario no puede iniciar sesión. ¿Tus primeros pasos?**
R: Delimito alcance (¿solo él?), reviso el estado de la cuenta (`Get-ADUser -Properties LockedOut,Enabled,PasswordExpired`), y si la cuenta está bien, compruebo localización de DC con la consulta SRV y `nltest /dsgetdc`. Con eso ya sé si es cuenta, DNS o equipo.

**P: ¿Cuándo escalarías a N2?**
R: Cuando el problema toca infraestructura del dominio: replicación entre DCs, roles FSMO, DC caído, trusts rotos, GPO que afecta a muchos a la vez, certificados o restauraciones. Y siempre escalando con el ticket completo: error literal, alcance, hora y verificaciones ya hechas.

## Ejercicios prácticos

1. **Lab:** instala RSAT en tu cliente con `Add-WindowsCapability` y abre ADUC (`dsa.msc`). Crea la *Consulta guardada* «Cuentas bloqueadas» y úsala cada día del lab.
2. **Lab:** ejecuta el cheatsheet de 9.2 entero contra tu dominio, una línea a la vez, entendiendo cada salida. Cuenta errores: tienen que ser cero.
3. **Lab:** reproduce DOS filas de la tabla 9.5 a propósito (confianza rota y DNS externo) y practica el diagnóstico completo hasta la causa raíz, cronometrándote.
4. **Lab:** con `ldp.exe`, enlaza como `aruiz` y localiza su `distinguishedName` y `memberOf` navegando el árbol. Repite la consulta desde tu host Linux con `ldapsearch` si tienes el lab accesible.
5. **De papel:** escribe una plantilla de ticket de escalado a N2 con los 6 campos de la sección 9.6 y rellénala para el caso «replicación en rojo entre DC1 y DC2 que tú detectaste con dcdiag».
