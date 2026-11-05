---
title: "12 · Preguntas de entrevista N1: el consolidado final"
description: "Veinte preguntas que cubren el 95% de lo que se pregunta a un candidato a Helpdesk/Soporte N1 con AD en el puesto. Respóndelas EN VOZ ALTA antes de la entrevista. Si una te tiembla, su capítulo está…"
curso: "active-directory"
capitulo: 12
orden: 12
---
> «Veinte preguntas que cubren el 95% de lo que se pregunta a un candidato a Helpdesk/Soporte N1 con AD en el puesto. Respóndelas EN VOZ ALTA antes de la entrevista. Si una te tiembla, su capítulo está al lado.»

## Objetivos

- Consolidar en un único sitio las ~20 preguntas más frecuentes de entrevista N1 sobre AD.
- Disponer de respuestas modelo cortas (3 frases) para practicar en voz alta.
- Autoevaluarte con el checklist final antes de la entrevista real.

## Cómo responder (30 segundos de técnica)

- **Estructura fija:** qué es → cómo se hace en la práctica → con qué herramienta. Tres frases, no una charla.
- Si te preguntan algo que no sabes a fondo: «Eso está a nivel N2, yo como L1 lo que haría es X y lo escalaría con Y». Honestidad + criterio > invención.
- Usar el vocabulario exacto (SRV, LSDOU, secure channel, AGDLP, PHS) es lo que separa «leyó algo» de «sabe».

## Esto te preguntarán en la entrevista

Aquí están, agrupadas en cuatro bloques más los escenarios trampa. Cada respuesta modelo cabe en tres frases: esa es la longitud realista en una entrevista.

## Bloque A — Conceptos (capítulos 1-2)

**1. ¿Qué es Active Directory y para qué sirve?**
Una base de datos centralizada de identidades (usuarios, equipos, grupos) con autenticación (Kerberos/NTLM), localización por DNS (SRV) y políticas (GPO). Sirve para gestionar de forma central el acceso y la configuración de toda la organización: una sola cuenta para iniciar sesión en cualquier equipo del dominio.

**2. ¿Qué es un dominio, y diferencia con árbol y bosque?**
El dominio es la unidad básica de administración y seguridad (un namespace como corp.lab) con sus DCs. Un árbol son dominios con namespace contiguo jerárquico; el bosque es el conjunto de todos los dominios de la organización, con esquema compartido y trusts transitivos. En la mayoría de empresas solo hay un dominio.

**3. ¿Qué es un Domain Controller?**
Un servidor con el rol AD DS que guarda una copia de la base de datos (NTDS.dit) y SYSVOL, autentica usuarios y sirve políticas. Modelo multi-master con replicación entre DCs: si uno cae, los clientes encuentran otro por DNS.

**4. ¿Para qué sirven las OUs y qué es la delegación?**
Las OUs organizan objetos dentro del dominio y permiten vincular GPOs y delegar administración granular: dar a helpdesk solo reset de contraseñas sobre una OU, por ejemplo, sin más privilegios.

**5. ¿AD y LDAP son lo mismo?**
No: LDAP es el protocolo estándar de consulta de directorios; AD lo implementa y añade Kerberos, DNS/SRV, replicación multi-master y GPOs. OpenLDAP/Samba implementan partes del mismo mundo estándar.

## Bloque B — Operación diaria (capítulos 3-4)

**6. Un usuario llama: «no puedo iniciar sesión». ¿Pasos?**
Primero delimitar: ¿solo él? ¿en un equipo o en todos? Reviso el estado de la cuenta (bloqueada/deshabilitada/expirada: `Get-ADUser -Properties LockedOut,Enabled,PasswordExpired`), y si la cuenta está bien, localización de DC (consulta SRV / `nltest /dsgetdc`). Con eso sé si es cuenta, DNS o equipo, y actúo.

**7. ¿Cómo desbloqueas una cuenta y por qué se bloqueó?**
`Unlock-ADAccount` (o clic derecho en ADUC). Causa típica: no es el usuario fallando, sino una credencial vieja guardada en un móvil con correo, credenciales de Windows, unidades mapeadas, tareas programadas o sesión RDP colgada. Con el evento 4740 en el DC veo el equipo origen y lo cazo.

**8. ¿Diferencia entre cuenta deshabilitada, bloqueada y expirada?**
Deshabilitada: apagada manualmente, no entra en nada, reversible (Enable-ADAccount). Bloqueada: automática por intentos fallidos según política (Unlock-ADAccount). Expirada: tenía fecha de caducidad y llegó (Set-ADAccountExpiration para ampliar).

**9. ¿Por qué no se borra una cuenta al dar de baja, sino que se deshabilita?**
Porque borrar destruye el SID y los permisos asociados quedan huérfanos (recrear no los recupera). Se deshabilita, se espera el periodo de gracia y luego se borra con runbook. Lo mismo vale para nunca-borrar-para-recrear.

**10. Error «la relación de confianza entre esta estación de trabajo y el dominio ha fallado». ¿Causa y arreglo?**
La contraseña de máquina (que rota cada 30 días) está desincronizada — típico tras restaurar snapshot/imagen antigua de VM. Arreglo rápido: con admin local, `Test-ComputerSecureChannel -Repair` o `Reset-ComputerMachinePassword`. Clásico: quitar del dominio y re-unir. Y anotar: no se restauran snapshots de equipos del dominio.

## Bloque C — DNS, GPO y permisos (capítulos 5-7)

**11. ¿Por qué es tan crítico el DNS en AD?**
Porque clientes localizan los DCs mediante registros SRV (`_ldap._tcp.dc._msdcs.<dominio>`). Sin DNS correcto, la base de datos de AD puede estar sana pero nadie la encuentra: fallan login, join y GPOs. Es lo primero que compruebo ante esos síntomas.

**12. ¿Qué registros DNS registra un DC?**
SRV de localización (`_ldap._tcp`, `_kerberos._tcp`, `_ldap._tcp.dc._msdcs`, `_gc._tcp`, variantes por sitio), sus registros A y la subzona delegada `_msdcs`. Se registran dinámicamente gracias a la zona integrada en AD con actualizaciones seguras.

**13. ¿Qué GPOs aplicarías como ejemplo de N1 y cómo verificas que aplican?**
Ejemplos: bloqueo de USB, fondo corporativo, mapeo de unidad por grupo (preferencias con item-level targeting), timeout de pantalla. Verificación en cliente: `gpresult /r` (aplicadas y filtradas) y `gpupdate /force` para reprocesar.

**14. ¿Orden de aplicación de GPOs?**
LSDOU: Local, Site, Domain, y OUs de general a profunda; se acumulan y gana la última procesada. Enforced se impone a las inferiores; Block Inheritance ignora las superiores (salvo Enforced).

**15. Usuario con Control total en el share y Lectura en NTFS: ¿qué puede hacer por red? ¿Y en local?**
Por red: solo Lectura — manda el más restrictivo de las dos capas. En local: lo que diga NTFS (el share solo aplica a acceso por red). Es la combinación NTFS vs Share: primero acumulo permisos por grupos en cada capa, luego me quedo con la más restrictiva.

**16. ¿Cómo calculas el permiso efectivo NTFS?**
Se acumulan los permisos de todos los grupos del usuario (gana el más amplio) pero un Deny explícito gana sobre todo. La herencia aporta los del padre salvo que esté deshabilitada. La pestaña «Acceso efectivo» lo calcula; con icacls lo operativo.

## Bloque D — Autenticación, herramientas y nube (capítulos 8-10)

**17. Explica Kerberos y NTLM a alto nivel.**
Kerberos: el DC (KDC) me da un TGT al iniciar sesión (válido ~10 h) y con él pido tickets por recurso; contraseñas nunca viajan; exige relojes sincronizados (±5 min) y nombres (SPN). NTLM: challenge-response más antiguo que aún aparece por compatibilidad (acceso por IP, sistemas viejos); se está retirando.

**18. ¿Qué cmdlets de PowerShell de AD usas a diario?**
`Get-ADUser` (con `-Properties`, `-Filter`, `-SearchBase`), `Set-ADAccountPassword -Reset`, `Unlock-ADAccount`, `Disable/Enable-ADAccount`, `Search-ADAccount -LockedOut`, `Get-ADGroupMember`, `New-ADUser`, `Move-ADObject`. Y para GPOs `gpupdate`/`gpresult` en los clientes.

**19. ¿Qué es RSAT y cómo lo instalas?**
Remote Server Administration Tools: las herramientas de administración (ADUC, GPMC, DNS, módulo PowerShell de AD) para instalarlas en un cliente Windows y administrar el dominio sin RDP al DC. Con `Add-WindowsCapability -Online -Name "Rsat.ActiveDirectory.DS-LDAPTools~~~~0.0.1.0"` o desde Características opcionales.

**20. ¿Diferencia entre AD DS y Entra ID, y qué es la sincronización híbrida?**
AD DS: on-prem, LDAP/Kerberos, OUs y GPOs. Entra ID: IdP de la nube (OIDO/SAML), plano, sin GPOs (endpoint vía Intune), MFA y Conditional Access nativos. En híbrido, Microsoft Entra Connect sincroniza identidades de AD a la nube (~30 min delta) con PHS, PTA o federación; con PHS puede haber password writeback.

## Bonus — Los tres escenarios trampa favoritos de los entrevistadores

**B1. «Añadí al usuario al grupo de la carpeta compartida y sigue sin poder entrar.»**
El token de grupos se genera al iniciar sesión: cerrar y abrir sesión. Si persiste: permisos efectivos (Effective Access) y si el cambio llegó por replicación.

**B2. «Internet funciona pero no puede iniciar sesión en el dominio / unirse.»**
El DNS del cliente apunta fuera (8.8.8.8, router): resuelve internet pero no los SRV del dominio. Fix: DNS del cliente = DCs. Diagnóstico de un minuto: `nslookup -type=SRV _ldap._tcp.dc._msdcs.<dominio>`.

**B3. «Le cambio la contraseña y a los diez minutos vuelve a estar bloqueado.»**
Credencial vieja automática: móvil con el correo, creds guardadas (cmdkey /list), unidad mapeada, tarea programada, sesión RDP colgada. Evento 4740 para localizar el origen y actualizar esa credencial.

## Checklist final: ¿estás listo?

- [ ] Sé explicar AD, dominio, DC, OU y delegación sin mirar (Bloque A).
- [ ] Sé hacer de memoria el flujo de «no puedo iniciar sesión» y de «cuenta bloqueada que repite» (6-7, B3).
- [ ] Sé recitar la consulta SRV y por qué (11-12) — mi capítulo estrella.
- [ ] Sé responder la tabla NTFS×Share con el ejemplo numérico (15).
- [ ] Tengo el lab montado y he roto/reparado la confianza y el DNS al menos una vez (cap. 11).
- [ ] Puedo sostener 5 minutos de conversación sobre Entra ID y híbrido sin perder el hilo (20).

Si las seis casillas están marcadas, el gap de AD/Windows corporativo de la entrevista N1 está cerrado. El resto se aprende en el puesto — y sabrás a qué capítulo volver.

## Ejercicios prácticos

1. **Simulacro 1:** responde las 20 preguntas en voz alta, cronometrado (máx. 90 segundos por respuesta). Apunta las que flaqueen y relee su capítulo al día siguiente.
2. **Simulacro 2:** pide a alguien (o grábate) un mock interview de 20 minutos con 8 preguntas aleatorias del consolidado, empezando por la 1 y terminando con un escenario trampa (B1-B3).
3. **De papel:** para cada pregunta del Bloque B y D, escribe el comando exacto que usarías. En la entrevista, nombrar el comando (`Unlock-ADAccount`, `nslookup -type=SRV ...`) es lo que acredita práctica real.
4. **Repaso de lab:** el día antes de la entrevista, reproduce en tu laboratorio las tres roturas de los escenarios trampa y arréglalas sin mirar los capítulos 4, 5 y 8.

---

*[Volver al índice](/cursos/active-directory/)*
