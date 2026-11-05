---
title: "11 · Laboratorio en casa: tu propio dominio en 16 GB"
description: "Leer AD es como nadar en seco. Este capítulo te monta un dominio real en tu máquina: a partir de aquí, cada capítulo anterior se convierte en un comando que ejecutas."
curso: "active-directory"
capitulo: 11
orden: 11
---
> «Leer AD es como nadar en seco. Este capítulo te monta un dominio real en tu máquina: a partir de aquí, cada capítulo anterior se convierte en un comando que ejecutas.»

## Objetivos

- Montar un dominio completo (DC + cliente Windows) en KVM/VirtualBox con 16 GB de RAM.
- Promocionar el DC íntegramente por PowerShell (guía copiable).
- Tener la alternativa ultra-ligera: un DC de Samba en Docker.
- Disponer de la lista de «cosas que romper a propósito» para convertir el lab en experiencia real.

## 11.1 Decisiones previas

**Hipervisor:** en tu Linux nativo, **KVM/virt-manager** (o GNOME Boxes) es la opción natural y más eficiente; VirtualBox también vale si prefieres su ecosistema. Todo lo que sigue es igual en ambos.

**RAM (reparto para 16 GB):**

| VM | RAM | vCPU | Disco |
|----|-----|------|-------|
| DC1 (Windows Server 2022/2025 Eval) | 3-4 GB | 2 | 40-60 GB |
| W11 (Windows 10/11 Enterprise Eval) | 3 GB | 2 | 40 GB |
| Host Linux (tu escritorio) | el resto (~8-9 GB) | — | — |

Con ese reparto vas sobrado. Si un día vas justo: el cliente puede bajar a 2,5 GB (sufre) o bajarle efectos visuales.

**ISOs (gratuitas y legales):** *Microsoft Evaluation Center* — busca «Windows Server 2022/2025 Evaluation ISO» (180 días) y «Windows 11 Enterprise Evaluation» (90 días) o las VMs de desarrollo de Microsoft («Windows 11 development environment»). Descarga desde un Windows/edge si la web lo exige, o desde tu Linux con user-agent.

**Red:** crea una **red interna/aislada** `192.168.56.0/24` (sin DHCP del exterior: control total):
- DC1: `192.168.56.10`
- W11: `192.168.56.20` (DHCP del DC o estática; DNS = `192.168.56.10` SIEMPRE — cap. 5)

Nombre de dominio del lab: **`corp.lab`** (evita `.local` por el lío con mDNS que ya conoces).

## 11.2 Paso a paso: el DC

**1) Instala Windows Server** en la VM. Al terminar: contraseña de Administrator fuerte, sin desktop experience innecesaria (Server con experiencia de escritorio es más cómodo para aprender; Core para valientes).

**2) Configura red e identidad** (PowerShell como admin):

```powershell
# IP estática y DNS apuntando a sí mismo (cap. 5: regla de oro)
New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.56.10 -PrefixLength 24
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1

Rename-Computer -Name DC1 -Restart
```

**3) Instala el rol y promociona a DC** (esto *crea* el dominio — `Install-ADDSForest` hace todo: DNS integrado, base de datos, SYSVOL):

```powershell
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools

$dsrm = Read-Host "Password DSRM (modo restauración)" -AsSecureString
Install-ADDSForest `
  -DomainName corp.lab `
  -DomainNetBIOSName CORP `
  -SafeModeAdministratorPassword $dsrm `
  -InstallDns:$true
# Reinicia solo. Al volver, eres un DC.
```

**4) Verificación (ejecuta y pegotea las salidas en tus notas):**

```powershell
Get-ADDomain                      # info del dominio
Get-ADDomainController -Discover  # ¿el DC se ve a sí mismo?
nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.lab    # ¿el DNS se registró? (cap. 5)
```

Si esa consulta SRV funciona, tu dominio existe de verdad. Si no: revisa que la zona `corp.lab` existe en `dnsmgmt.msc` con los registros `_msdcs`.

## 11.3 Estructura mínima post-instalación

Copia y adapta (es la estructura del capítulo 2 + usuarios de los ejercicios de los capítulos 3-7):

```powershell
$dom = "DC=corp,DC=lab"
"Empleados","Estaciones","Grupos","Servidores" | ForEach-Object {
    New-ADOrganizationalUnit -Name $_ -Path $dom
}
"Ventas","Finanzas","Soporte" | ForEach-Object {
    New-ADOrganizationalUnit -Name $_ -Path "OU=Empleados,$dom"
}

# Usuario admin del lab + usuario de prueba
$pw = Read-Host "Password lab" -AsSecureString
New-ADUser -Name "Kevin Lab" -SamAccountName klab -UserPrincipalName klab@corp.lab `
  -Path "OU=Soporte,OU=Empleados,$dom" -AccountPassword $pw -Enabled $true
New-ADUser -Name "Ana Ruiz" -SamAccountName aruiz -UserPrincipalName aruiz@corp.lab `
  -Path "OU=Ventas,OU=Empleados,$dom" -AccountPassword $pw -Enabled $true

# Grupos de los ejercicios AGDLP
New-ADGroup GG-Ventas -GroupScope Global -Path "OU=Grupos,$dom"
New-ADGroup DL-FS01-Datos-Lectura -GroupScope DomainLocal -Path "OU=Grupos,$dom"
Add-ADGroupMember GG-Ventas -Members aruiz
Add-ADGroupMember DL-FS01-Datos-Lectura -Members GG-Ventas
```

Crea también un share de pruebas en el DC (para capítulos 6-7):

```powershell
New-Item C:\Compartido -ItemType Directory
New-SmbShare -Name Datos -Path C:\Compartido -FullAccess "Authenticated Users"
```

## 11.4 El cliente: join y RSAT

1. Instala Windows 10/11 en la segunda VM. Red interna, DNS `192.168.56.10` (estático o DHCP que instales en el DC — sí, el rol DHCP en el DC es opcional y elegante para el lab).
2. Únelo: `sysdm.cpl` → dominio `corp.lab` → credenciales (cap. 4). Mueve el objeto de equipo a `OU=Estaciones`.
3. Inicia sesión como `CORP\klab`. **Momento marca de la casa: has iniciado sesión en un dominio que has construido.**
4. Instala RSAT (cap. 9):

```powershell
Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDAPTools~~~~0.0.1.0"
```

## 11.5 Checkpoints de logro

Tu lab está «completo» cuando puedes marcar todo:

- [ ] La consulta SRV responde desde el cliente (cap. 5)
- [ ] `klist` muestra TGT tras login de dominio (cap. 8)
- [ ] Crear/deshabilitar/desbloquear/resetear usuarios desde RSAT del cliente (cap. 3)
- [ ] El cliente está en `OU=Estaciones` y una GPO le aplica (cap. 6)
- [ ] `\\DC1\Datos` accesible con permisos por grupos verificados (cap. 7)
- [ ] Has roto y reparado la confianza del cliente UNA vez (cap. 4)
- [ ] `ldapsearch` desde tu host Linux contra el DC funciona (cap. 9 — puede requerir red puente momentánea o `virt-viewer` port-forwarding; documentado como reto extra)

## 11.6 Alternativa ligera: Samba AD DC (para días de RAM justa)

**Samba** implementa un controlador de dominio **compatible con AD** (lo que Microsoft llama «AD DC»). No es perfecto (sin GUI de server, algunas políticas avanzadas cojean), pero para aprender conceptos, PowerShell del módulo AD contra él, joins de Windows y DNS integrado: sobra. Y consume ~512 MB-1 GB.

La vía más didáctica (contenedor Debian plano, tú mandas):

```bash
docker network create adlab --subnet 192.168.57.0/24
docker run -itd --name dc1 --hostname dc1 --network adlab --ip 192.168.57.10 \
  --privileged -v /opt/samba:/var/lib/samba debian:bookworm sleep infinity

docker exec -it dc1 bash -c "apt update && apt install -y samba win-bind smbclient"
docker exec -it dc1 bash -c "mv /etc/samba/smb.conf /etc/samba/smb.conf.orig && \
  samba-tool domain provision --realm=CORP.LAB --domain=CORP \
  --server-role=dc --dns-backend=SAMBA_INTERNAL --adminpass='LabPassw0rd!'"

docker exec -d dc1 samba-ad-dc   # o /usr/sbin/samba -D según paquete
```

Y administra con las herramientas de siempre, que es la gracia:

```bash
docker exec dc1 samba-tool user list
docker exec dc1 samba-tool user create aruiz 'Passw0rd!'
docker exec dc1 samba-tool group addmembers "Domain Users" aruiz
dig +short -p 53 @192.168.57.10 SRV _ldap._tcp.dc._msdcs.corp.lab
```

Puedes unir un Windows a este dominio Samba (funciona de verdad). Para el curriculum del lab «corporativo» completo (GPMC a fondo, Server Manager), el Windows Server eval sigue siendo la referencia; Samba es tu gym de conceptos de lunes a viernes con 4 GB libres.

## 11.7 Rompe a propósito (la sección más valiosa del libro)

Cada rotura = un ticket de práctica. Antes de cada una, haz **snapshot** de la VM:

| Rotura | Ejercicio | Capítulo |
|--------|-----------|----------|
| Snapshot antiguo del cliente restaurado | Confianza rota → diagnosticar y reparar | 4 |
| DNS del cliente → 8.8.8.8 | «No se encuentra el dominio» → SRV lookup → fix | 5 |
| Deshabilitar la cuenta de equipo del cliente | Login de dominio imposible (local sí) | 4 |
| 5 contraseñas fallidas | Bloqueo → 4740 → desbloqueo → investigación | 8 |
| Quitar `Authenticated Users` del filtro de una GPO | «GPO filtrada» en gpresult | 6 |
| Romper herencia NTFS de una subcarpeta | Acceso denegado puntual → icacls | 7 |
| Adelantar el reloj del cliente 20 min | Login Kerberos falla → lección NTP | 8 |
| Denegar escritura por un grupo extra | Deny pisa Allow | 7 |

Regla: cada vez que rompas algo, **escribe el ticket** (síntoma, hipótesis, comando de diagnóstico, fix, verificación). Diez roturas documentadas = diez historias para la entrevista («en mi laboratorio reproduje…»).

## Esto te preguntarán en la entrevista

**P: ¿Tienes experiencia práctica con AD?**
R: Sí, de laboratorio propio: monté un dominio completo (Windows Server evaluación promocionado a DC con PowerShell + cliente unido), y trabajo a diario con él: altas, GPOs, permisos, y diagnóstico (SRV, secure channel, bloqueos). Además administro el DC con el módulo de PowerShell y consulto el directorio con ldapsearch desde Linux.

**P: ¿Cómo instalarías un nuevo dominio?**
R: Windows Server con IP estática y DNS apuntando a sí mismo, `Install-WindowsFeature AD-Domain-Services` y `Install-ADDSForest` con el nombre del dominio (instala también el DNS integrado). Después: estructura de OUs, grupos y delegación antes de meter usuarios.

**P: ¿Qué harías antes de un cambio arriesgado en producción?**
R: Snapshot/backup del afectado (y nunca restaurar snapshots de equipos de dominio sin asumir el re-join), plan de rollback, ventana horaria y verificación post-cambio documentada. Es exactamente lo que practico en el lab con las roturas controladas.

## Ejercicios prácticos

1. **Obligatorio:** monta el lab completo (secciones 11.1-11.4) y marca todos los checkpoints de 11.5.
2. Ejecuta al menos **5 roturas** de la tabla 11.7 con su ticket escrito.
3. **Extra Linux:** consigue que `ldapsearch` y `dig` desde tu host consulten el DC (red puente o port-forward) y documenta los comandos.
4. **Extra Samba:** monta el DC Samba de 11.6 en 30 minutos y une algo a él (cliente Windows o `realm join` desde un Linux).
