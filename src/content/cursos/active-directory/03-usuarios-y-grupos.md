---
title: "3 · Usuarios y grupos: el pan de cada día del N1"
description: "El 70% de los tickets L1 relacionados con AD son una de estas cuatro cosas: crear, deshabilitar, desbloquear, resetear. Aquí está el 100% de lo que hay que saber de ellas."
curso: "active-directory"
capitulo: 3
orden: 3
---
> «El 70% de los tickets L1 relacionados con AD son una de estas cuatro cosas: crear, deshabilitar, desbloquear, resetear. Aquí está el 100% de lo que hay que saber de ellas.»

## Objetivos

- Dominar el ciclo de vida de una cuenta: alta, cambios, baja.
- Distinguir sin dudar los 4 estados de cuenta: activa, **bloqueada**, **deshabilitada**, **expirada** — y el fix de cada uno.
- Crear y gestionar usuarios con ADUC y con PowerShell.
- Entender grupos de seguridad vs distribución, los scopes, y AGDLP a nivel conceptual.

## 3.1 Anatomía de una cuenta de usuario

Tres identificadores que se confunden constantemente:

| Identificador | Ejemplo | Para qué sirve |
|---------------|---------|----------------|
| **sAMAccountName** (login legacy) | `kmas` | Nombre de inicio de sesión pre-Windows 2000. Único en el dominio. Es lo que ves en ADUC como «nombre de cuenta de usuario». |
| **UPN** (User Principal Name) | `kmas@corp.lab` | Lo que el usuario escribe para loguearse, formato email. |
| **DN** (Distinguished Name) | `CN=John Doe,OU=Soporte,DC=corp,DC=lab` | Posición en el árbol LDAP. |

Y debajo, el **SID** (Security Identifier, tipo `S-1-5-21-...-1103`): el identificador real que usan los permisos y el sistema. Windows muestra nombres, pero autoriza por SID. Esto explica una regla de oro que veremos en 3.3: **nunca borres una cuenta para recrearla.**

Atributos que tocarás como L1: display name, descripción (¡úsala: «Alta 05/11, ticket #4213»!), departamento, teléfono, email, manager, si la cuenta expira.

## 3.2 Alta de usuario: GUI y PowerShell

**Con ADUC (Active Directory Users and Computers):** clic derecho en la OU → Nuevo → Usuario. Rellenar nombre, sAMAccountName, contraseña, desmarcar «El usuario debe cambiar la contraseña» solo si hay motivo, dejar marcado «Nunca expira la contraseña» solo para cuentas de servicio. Colocar SIEMPRE en la OU correcta (no en `Users`).

**Con PowerShell** (equivalente exacto, el que te hará parecer senior):

```powershell
$pass = Read-Host "Contraseña" -AsSecureString

New-ADUser -Name "Ana Ruiz" `
  -GivenName Ana -Surname Ruiz `
  -SamAccountName aruiz `
  -UserPrincipalName aruiz@corp.lab `
  -Path "OU=Ventas,OU=Empleados,DC=corp,DC=lab" `
  -AccountPassword $pass `
  -Enabled $true `
  -ChangePasswordAtLogon $true `
  -Description "Alta manual - ticket #4213"
```

Notas de realidad de empresa: en sitios serios no das altas a mano — llegan del RRHH vía script/orquestador (a veces desde Entra ID, capítulo 10). Pero saber hacer una a mano es requisito de entrevista y te saca de apuros.

**Verificación inmediata** (hábito de verification-before-completion):

```powershell
Get-ADUser aruiz -Properties Enabled, LockedOut, PasswordExpired, MemberOf
```

## 3.3 El ciclo de vida y la regla de oro de la baja

Flujo de baja estándar:

1. **Deshabilitar** la cuenta el último día (acceso cortado ya).
2. Esperar el periodo de gracia de la empresa (30-90 días, por si vuelve o algo depende de ella).
3. **Borrar** después, junto a su buzón/equipos según el runbook.

**Regla de oro: nunca borres de primeras, y nunca borres-para-recrear.** Cada cuenta nueva recibe un SID nuevo. Si borras a Ana y la recreas, la nueva Ana **no** tiene ninguno de sus permisos antiguos (los permisos apuntan al SID viejo): ficheros «huérfanos», buzones descolgados, líos de auditoría. Deshabilitar es reversible y gratis; borrar es quirúrgico.

## 3.4 Los 4 estados que confunden: tabla de oro L1

Memoriza esta tabla. Es literalmente el pan de cada día:

| Estado | Qué es | Síntoma del usuario | Se ve en ADUC como | Fix |
|--------|--------|--------------------|--------------------|-----|
| **Activa** | Cuenta normal | — | cuenta normal | — |
| **Bloqueada** (locked out) | AD bloqueó la cuenta por demasiados intentos fallidos (política del dominio) | «Pongo la contraseña BIEN y me dice cuenta bloqueada» | Casilla «La cuenta está bloqueada» marcada | `Unlock-ADAccount aruiz` + investigar causa (cap. 8) |
| **Deshabilitada** (disabled) | Un admin la apagó: no puede iniciar sesión en nada | «No puedo entrar y creo que me dieron de baja / vuelvo de vacaciones» | Flecha abajo sobre la cuenta | `Enable-ADAccount aruiz` (si procede) |
| **Expirada** (account expired) | La cuenta tenía fecha de caducidad y llegó | «Era temporal y dejo de funcionar» | Pestaña Cuenta: fecha pasada | `Set-ADAccountExpiration -Identity aruiz -DateTime "2027-12-31"` |

Y no es un «estado» pero suele confundirse: **contraseña caducada** (password expired) → el usuario debe cambiarla al iniciar sesión; si algo (VPN, app vieja) no soporta el cambio, fallará hasta que la cambie: `Set-ADUser aruiz -ChangePasswordAtLogon $true`.

**Los tres cmdlets que harás mil veces:**

```powershell
# Reset de contraseña (fuerza cambio en el próximo login)
Set-ADAccountPassword aruiz -Reset -NewPassword (Read-Host "Nueva" -AsSecureString)
Set-ADUser aruiz -ChangePasswordAtLogon $true

# Desbloquear
Unlock-ADAccount aruiz

# Deshabilitar / habilitar
Disable-ADAccount aruiz
Enable-ADAccount aruiz
```

**Batch de lujo** (desbloquear todo lo bloqueado — típico lunes):

```powershell
Search-ADAccount -LockedOut | Unlock-ADAccount
Search-ADAccount -LockedOut -UsersOnly | Format-Table Name, LastLockoutDate
```

En ADUC todo esto es clic derecho sobre el usuario: *Reset password*, *Unlock account*, y las cuentas deshabilitadas se buscan con una *Saved Query*.

## 3.5 Grupos: tipos y scopes

### Seguridad vs distribución

- **Grupo de seguridad**: otorga permisos (a ficheros, carpetas, GPOs filtradas…). Es el que usas para TODO lo que es acceso. Se puede usar también como lista de correo.
- **Grupo de distribución**: solo sirve de lista de correo (Exchange). No sirve para permisos.

Regla L1: si la duda es «¿este grupo puede entrar a esta carpeta?», la respuesta lleva grupo de **seguridad**.

### Scopes: dominio local, global, universal

Esto existe por los bosques multi-dominio. En un dominio único lo simplificas, pero la pregunta cae en entrevistas:

| Scope | Para qué | Analogía |
|-------|----------|----------|
| **Global** | Agrupar usuarios del MISMO dominio por rol/departamento (`GG-Soporte`) | Tu grupo local de siempre |
| **Domain Local** | Agrupar *a quién* se le da un permiso sobre un recurso de este dominio (`DL-FS01-Datos-Escritura`) | El grupo al que le haces `chgrp` en la carpeta |
| **Universal** | Usuarios/grupos de TODO el bosque (para Exchange / recursos del bosque) | Grupo de clúster global |

### AGDLP: la receta clásica

**A**ccounts van en grupos **G**lobales; los globales van en grupos **D**omain **L**ocal; los domain local reciben los **P**ermissions. Con nombres:

```
Usuario aruiz ──miembro de──> GG-Ventas ──miembro de──> DL-FS01-Datos-Lectura ──permiso NTFS lectura──> \\FS01\Datos
```

Ventajas: añadir/quitar gente del departamento sin tocar permisos de carpetas; auditoría clarísima. En un dominio único mucha gente simplifica a «global directo a permisos» (A-G-P), pero AGDLP es la respuesta que esperan en la entrevista.

### Grupos que debes conocer de vista

| Grupo | Qué es |
|-------|--------|
| **Domain Admins** | Root del dominio. Nunca te meten aquí; nunca pidas estar aquí. |
| **Enterprise Admins** | Root del bosque. Igual que arriba, más. |
| **Administrators** (Builtin) | Admins locales de cada máquina… con Domain Admins dentro. |
| **Account Operators** | Puede gestionar usuarios/grupos (legado; en sitios serios se prefiere delegación por OU). |
| **Domain Users** | Todos los usuarios del dominio. |

Buenas prácticas de nombres (los verás en cualquier empresa): `GG-<depto>` para globales, `DL-<recurso>-<permiso>` para domain local, `HD-` para grupos de helpdesk.

```powershell
# Ver miembros de un grupo (recursivo)
Get-ADGroupMember GG-Ventas -Recursive | Select-Object Name, SamAccountName

# Añadir / quitar de grupo
Add-ADGroupMember GG-Ventas -Members aruiz
Remove-ADGroupMember GG-Ventas -Members aruiz

# ¿En qué grupos está un usuario?
Get-ADUser aruiz -Properties MemberOf | Select-Object -ExpandProperty MemberOf
```

## 3.6 Errores típicos de novato (no los cometas)

- Dejar cuentas nuevas en `CN=Users` en vez de la OU correcta → se pierden GPOs y delegación.
- Borrar para «reiniciar» una cuenta → SIDs huérfanos (sección 3.3).
- Dar permisos a usuarios individuales en carpetas en vez de a grupos → deuda eterna.
- Resetear contraseña sin marcar «cambiar en el próximo login» cuando la política lo exige / o al contrario, marcarlo cuando el usuario está en remoto sin forma de cambiarla. Pregunta antes.
- Desbloquear una cuenta 5 veces al día sin investigar por qué se bloquea (capítulo 8: casi siempre hay una credencial vieja guardada en algún sitio).

## Esto te preguntarán en la entrevista

**P: Un usuario se ha bloqueado. ¿Qué haces?**
R: Desbloqueo con `Unlock-ADAccount` (o clic derecho en ADUC), reseteo la contraseña si procede y —lo importante— investigo la causa: el bloqueo casi nunca es el usuario tecleando mal, suele ser una credencial antigua guardada en un servicio, unidad mapeada o app (móvil con el correo). Si se repite, busco el evento 4740 en el DC para ver desde qué equipo vienen los intentos.

**P: ¿Diferencia entre deshabilitar y borrar una cuenta?**
R: Deshabilitar es reversible: la cuenta existe, conserva su SID y permisos, pero no puede iniciar sesión. Es lo correcto en una baja inmediata o sospecha de compromiso. Borrar elimina el objeto y su SID; los permisos asociados quedan huérfanos y recrear la cuenta no los recupera. Política habitual: deshabilitar, esperar el periodo de gracia, borrar con runbook.

**P: ¿Grupos de seguridad vs distribución?**
R: Los de seguridad sirven para asignar permisos y políticas; los de distribución solo para listas de correo. Para acceso a recursos siempre, grupos de seguridad.

**P: ¿Qué es AGDLP?**
R: Patrón de anidamiento: cuentas (A) en grupos globales (G), que se meten en grupos domain local (DL), que reciben los permisos (P). Permite gestionar miembros y permisos por separado y escala a bosques multi-dominio.

**P: ¿Cómo reseteas una contraseña por PowerShell?**
R: `Set-ADAccountPassword aruiz -Reset -NewPassword ($pass)` con la contraseña como SecureString, y habitualmente `Set-ADUser aruiz -ChangePasswordAtLogon $true` para forzar el cambio.

## Ejercicios prácticos

1. **Lab (cap. 11):** crea la OU `Empleados/Ventas` y con ella a `aruiz` por PowerShell. Verifica con `Get-ADUser aruiz -Properties *` que está Enabled, en la OU correcta y con ChangePasswordAtLogon.
2. **Lab:** deshabilita a `aruiz`, intenta iniciar sesión con su cuenta en el cliente, re-habilítala.
3. **Lab:** crea `GG-Ventas` y `DL-FS01-Datos-Lectura`, mete a aruiz en ambos según AGDLP y compruébalo con `Get-ADGroupMember -Recursive`.
4. **Lab:** fuerza un bloqueo: pon mal la contraseña 5 veces desde el cliente (o bloquea a mano en ADUC). Encuentra el candado con `Search-ADAccount -LockedOut` y desbloquea.
5. **De papel:** un ex-empleado vuelve tras 2 meses. ¿Recreas su cuenta o re-habilitas la vieja? Justa con SIDs. (Respuesta: re-habilitar la vieja, o si el runbook ya la borró, alta nueva + reasignar permisos vía grupos, nunca «restaurar» a mano el SID.)
