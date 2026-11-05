---
title: "4 · Equipos: unirse al dominio y la confianza rota"
description: "En AD, un ordenador no es un mueble: es un usuario más, con su cuenta y su contraseña. Y las contraseñas de máquina también se olvidan."
curso: "active-directory"
capitulo: 4
orden: 4
---
> «En AD, un ordenador no es un mueble: es un usuario más, con su cuenta y su contraseña. Y las contraseñas de máquina también se olvidan.»

## Objetivos

- Unir un equipo a un dominio (join) y saber qué ocurre técnicamente debajo.
- Entender la cuenta de equipo y su contraseña rotatoria.
- Diagnosticar y arreglar el error estrella: *«La relación de confianza entre esta estación de trabajo y el dominio principal ha fallado»*.
- Manejar el ticket clásico del perfil temporal.

## 4.1 Workgroup vs dominio: qué cambia al hacer join

Un Windows recién instalado está en **workgroup**: cada máquina es una isla, con usuarios locales (`PC005\Administrador`, `PC005\aruiz`). Como L1 ya sabes lo que es esto: es el modo «cuenta local», soporte básico.

Al hacer **join** al dominio:

1. El PC crea (o adopta) un **objeto de equipo** en AD: una cuenta de máquina, `PC005$`, en el contenedor `Computers` (o en la OU pre-creada si se hizo *pre-staging*).
2. PC y dominio acuerdan una **contraseña de máquina** que rota cada 30 días por defecto. Es el corazón de la relación de confianza (*secure channel*).
3. A partir de ahí, en la pantalla de login aparecen cuentas del dominio (`CORP\aruiz` o `aruiz@corp.lab`) y el PC autentica contra los DC.

> **Para tu cerebro Linux:** la contraseña de máquina es conceptualmente los *host keys* de SSH en un mundo con rotación automática: ambas partes deben conocer el mismo secreto para confiar la una en la otra. Si una de las dos pierde la sincronía, el otro lado responde «no eres quien dices ser» — y ahí nace el error de confianza rota.

## 4.2 El join paso a paso

**Requisitos previos (la checklist que evita el 95% de fallos de join):**

- [ ] El PC apunta por DHCP/estático a un DNS que resuelva el dominio (el DNS del DC — capítulo 5).
- [ ] Red alcance a los DC (no VPN rara, no firewall que corte 88/389/445 — tabla de puertos en cap. 9).
- [ ] Credenciales con derecho a unir equipos (Domain Admin, Account Operators, o delegado; por defecto, *Authenticated Users* pueden unir hasta 10 equipos — cuota `ms-DS-MachineAccountQuota`).

**Pasos (GUI):** `Win+R` → `sysdm.cpl` → Cambiar… → Dominio: `corp.lab` → credenciales → reinicio. En Windows modernos también Configuración → Sistema → Acerca de → «Conectar a un dominio».

**PowerShell local (equivalente):**

```powershell
Add-Computer -DomainName corp.lab -Credential CORP\admin -Restart
```

**Post-join obligatorio (hábito L1):** mover el objeto de equipo de `Computers` a su OU (p.ej. `OU=Estaciones,OU=Oficina-Madrid`), o no le aplicarán las GPOs correctas:

```powershell
Move-ADObject "CN=PC005,CN=Computers,DC=corp,DC=lab" `
  -TargetPath "OU=Oficina-Madrid,OU=Estaciones,DC=corp,DC=lab"
```

**Pre-staging** (mención para entrevistas): crear antes la cuenta de equipo en la OU correcta; así el join la adopta y cae ya bien ubicada.

## 4.3 La cuenta de equipo en AD

En ADUC aparecen como objetos de tipo *Equipo*. Clic derecho → **Reset account**: regenera la contraseña de máquina (el equipo y el dominio vuelven a acordarla). Ojo: después de un reset, el equipo suele necesitar re-join o un `Reset-ComputerMachinePassword` local.

Renombrar un equipo del dominio se hace desde el propio equipo (al renombrar, Windows actualiza su objeto en AD). Nunca renombres el objeto a mano en ADUC pensando que el PC se enterará.

## 4.4 La confianza rota: el error estrella

Mensaje exacto (lo verás en la entrevista y en la vida):

> *«La relación de confianza entre esta estación de trabajo y el dominio principal ha producido un error»* / EN: *"The trust relationship between this workstation and the primary domain failed"*

**Causa raíz (única):** el PC tiene una contraseña de máquina que el DC no reconoce. Escenarios típicos:

- **Snapshot/imagen antigua restaurada** en VM: el PC «recuerda» una contraseña de hace meses; el DC ya rotó varias veces. El caso #1 hoy, por VMs clonadas/restauradas.
- Equipo apagado **meses** (más allá de varias rotaciones) y luego reactivado.
- Duplicado de nombre/objeto o join a medias.

**Síntomas asociados:** no puedes iniciar sesión con usuario de dominio («no se puede conectar ahora al dominio»), pero sí con el usuario local (`.\\Administrador` — piénsalo como entrar en modo single-user cuando el clúster te rechaza).

**Fixes, del más rápido al más clásico:**

```powershell
# En el equipo afectado, como admin local. Prueba el canal:
Test-ComputerSecureChannel

# Reparar la relación (renegocia la contraseña):
Test-ComputerSecureChannel -Repair -Credential CORP\admin
# o equivalentemente:
Reset-ComputerMachinePassword -Server DC1.corp.lab -Credential CORP\admin
```

**Fix clásico:** entrar con admin local → quitar del dominio (a workgroup) → reinicio → re-join → mover a su OU. Más lento pero infalible, y es el que esperan que describas en una entrevista N1.

**Regla de oro anti-recidiva:** si te pasa con una VM, avisa: *no se restauran snapshots de equipos de dominio* sin más; si se hace, hay que asumir el re-join.

## 4.5 El ticket del perfil temporal

Síntoma: el usuario inicia sesión y aparece: *«Ha iniciado sesión con un perfil temporal»*. Su escritorio está vacío, Outlook sin configurar, pánico.

Qué pasa: Windows no pudo cargar su perfil (`C:\Users\<usuario>`) y crea uno desechable. Causas típicas: perfil corrupto, entrada huérfana en `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList` (una clave con sufijo `.bak`), permisos NTFS del perfil, o disco lleno.

Primeras acciones L1: identificar la causa (Visor de eventos > Application, errores de `User Profile Service`), y el fix habitual es arreglar/renombrar la entrada `.bak` del registro en `ProfileList` o renombrar el perfil viejo para que se regenere. Antes de tocar: ¿hay datos importantes en ese perfil? Si hay que regenerar, copia de seguridad primero. Si el perfil está en red (roaming) o hay redirección de carpetas, avísalo: el fix cambia.

## 4.6 Resumen operativo

| Tarea | Comando/acción |
|-------|----------------|
| Unir equipo | `sysdm.cpl` → dominio, o `Add-Computer` |
| Mover equipo a su OU | ADUC arrastrar, o `Move-ADObject` |
| Probar confianza (local) | `Test-ComputerSecureChannel` |
| Reparar confianza (local) | `Test-ComputerSecureChannel -Repair -Credential CORP\admin` |
| Reparar confianza (clásico) | workgroup → reinicio → re-join |
| Renombrar equipo | desde el propio equipo (`Rename-Computer -DomainCredential ... -Restart`) |

## Esto te preguntarán en la entrevista

**P: ¿Qué es la relación de confianza (trust relationship) con el dominio y por qué se rompe?**
R: Es el vínculo basado en una contraseña de máquina que el PC y el dominio rotan periódicamente (cada 30 días). Se rompe cuando se desincronizan: típicamente por restaurar una imagen/snapshot antigua de VM o dejar el equipo apagado meses. El PC presenta una contraseña que el DC ya no reconoce.

**P: ¿Cómo lo arreglas?**
R: Con admin local: `Test-ComputerSecureChannel -Repair` o `Reset-ComputerMachinePassword`, que renegocian la contraseña sin re-join. Si no va, método clásico: quitar del dominio, reiniciar y volver a unir. Después, mover el equipo a su OU y avisar de que no se restauran snapshots de equipos del dominio.

**P: ¿Qué pasa cuando unes un equipo al dominio?**
R: Se crea un objeto de equipo (cuenta `PC$`) en el contenedor Computers —o se adopta la pre-creada—, se establece la contraseña de máquina que ambos rotan cada 30 días, y desde entonces el equipo autentica usuarios contra los DC y aplica GPOs según su OU.

**P: Un usuario ve «perfil temporal». ¿Qué es?**
R: Que Windows no pudo cargar su perfil local y creó uno desechable: suele ser perfil corrupto o una entrada `.bak` huérfana en ProfileList del registro. Se diagnostica con el visor de eventos (User Profile Service) y se arregla reparando esa entrada o regenerando el perfil, siempre salvando datos antes.

**P: ¿Puede haber equipos en AD sin ser Windows?**
R: Sí: Linux puede unirse mediante winbind/SSSD/realmd y usar el dominio para login y recursos. El concepto de cuenta de equipo es el mismo. (Bonus que juega a tu favor si vienes de Linux: menciona `realm join`.)

## Ejercicios prácticos

1. **Lab:** une tu cliente Windows al dominio (cap. 11, sección 5). Verifica en el DC que el objeto de equipo apareció y muévelo a `OU=Estaciones`.
2. **Lab:** inicia sesión con `aruiz` en el cliente. Luego, desde el DC, deshabilita la *cuenta de equipo* del PC e intenta iniciar sesión de nuevo con otro usuario de dominio. Observa el error. Re-habilita.
3. **Lab — confianza rota a propósito (el mejor ejercicio del libro):** apaga el cliente, restaura un snapshot del cliente de hace 2 días (o cambia la fecha de la VM varios meses y fuerza rotación), enciéndelo e intenta login de dominio. Repáralo con `Test-ComputerSecureChannel -Repair` y luego, repite el proceso y arréglalo con re-join clásico. Has de saber hacer los dos.
4. **De papel:** lista las 3 causas más comunes de que un join falle («no se puede contactar con un controlador de dominio») y a qué capítulo de troubleshooting pertenece cada una. (Pista: DNS, puertos, credenciales.)
