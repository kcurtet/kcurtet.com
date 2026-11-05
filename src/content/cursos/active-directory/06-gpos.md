---
title: "6 · GPO: Group Policy, la configuración obligatoria a escala"
description: "Una GPO es como puppet/ansible para Windows, pero nativa, jerárquica y con veinte años de rodaje. Con tres conceptos (vinculación, LSDOU, refresh) ya operas en N1."
curso: "active-directory"
capitulo: 6
orden: 6
---
> «Una GPO es como puppet/ansible para Windows, pero nativa, jerárquica y con veinte años de rodaje. Con tres conceptos (vinculación, LSDOU, refresh) ya operas en N1.»

## Objetivos

- Explicar qué es una GPO, dónde vive y quién la aplica.
- Dominar el orden de aplicación (LSDOU) y la herencia (incluido Enforced y Block Inheritance).
- Hacer los tres ejemplos N1 clásicos: bloquear USB, fondo corporativo, mapear unidad de red.
- Diagnosticar «la GPO no se aplica» con gpupdate/gpresult.

## 6.1 Qué es una GPO (y qué no es)

Una **GPO** (Group Policy Object) es un contenedor de **cientos de configuraciones posibles** para equipos y usuarios: seguridad, escritorio, firewall, registros, scripts, software… Se define una vez en el dominio y los propios clientes la **descargan y aplican** de forma obligatoria (no es un script que corre una vez: es estado deseado que se re-aplica).

Dónde vive: cada GPO se guarda en dos partes — plantilla en SYSVOL del DC (`\\corp.lab\SYSVOL\...`, accesible por SMB) + objeto que la registra en AD. Se gestiona desde **GPMC** (`gpmc.msc`).

Quién la aplica: el cliente (Windows) cada **90 minutos ± 30 aleatorio** y en inicio/login. Excepciones conocidas: las políticas de contraseña o de scripts de inicio se procesan en el momento del login, no al refresco.

Qué NO es: no es un paquete de software (aunque puede instalar software), no es un perfil, y las **Preferencias (GPP)** —una familia dentro de las GPOs— son *set-and-forget*: aplican el valor una vez pero si el usuario lo cambia, no lo re-fuerzan (tatuaje). Matiz que impresiona en entrevista.

## 6.2 Dónde se vinculan y el orden LSDOU

Las GPOs se vinculan a **sitios, dominios y OUs**. Un mismo objeto (equipo o usuario) recibe TODAS las GPOs aplicables a su posición, y se procesan en este orden — memorízalo:

```
L → S → D → OU → OU hija → OU nieta...
Local  Site  Domain  (Organizational Units, de arriba abajo)
```

**Reglas de herencia:**

- Se acumulan todas (como capas).
- Si dos configuran lo mismo, **gana la última procesada** (la más profunda/cercana al objeto). Por eso «la GPO de la OU hija pisa a la del dominio».
- **Enforced** (antes «No Override»): forzada — pisa incluso a las OUs hijas. Se marca en el *link* de la GPO.
- **Block Inheritance**: una OU dice «ignoro lo de arriba» (no bloquea links Enforced: estos siempre ganan).
- En GPMC, dentro de una misma OU, el **Link Order** ordena: 1 = gana.

Las GPO tienen dos mitades: **Configuración del equipo** (se aplica al objeto equipo, al iniciarse este) y **Configuración de usuario** (al usuario, al iniciar sesión él). Filtro de seguridad y WMI filtering existen para afinar quién la recibe — saber que existen basta en N1.

## 6.3 Ejemplo guiado completo: mapear la unidad H: de cada usuario

Caso: «todo el mundo de Ventas tiene que tener `\\FS01\Compartido` como unidad H:». Es el ejemplo perfecto porque mezcla GPP + seguridad por grupos:

1. `gpmc.msc` → clic derecho en `OU=Ventas` → *Crear un objeto GPO en este dominio y vincularlo aquí* → nombre: `GPO-Ventas-UnidadH`.
2. Editar → **Configuración de usuario → Preferencias → Configuración de Windows → Unidades de red** → Nueva → Unidad asignada: `H:`, ruta `\\FS01\Compartido`.
3. Pestaña *Común*: marcar **«Volver a aplicar en cada inicio de sesión»**; *Segmentación de elementos (Item-Level Targeting)* → solo si el usuario es miembro de `GG-Ventas`. (El targeting es el «when» de Ansible de toda la vida.)
4. Aplicar. En el cliente: `gpupdate /force` y ver la H: aparecer al reiniciar sesión.

Ojo con la combinación clásica de permisos (capítulo 7): mapear la unidad no basta si el grupo no tiene permiso NTFS/de compartido sobre `\\FS01\Compartido`. GPO da el *atajo*, los permisos dan el *acceso*.

## 6.4 Los otros dos clásicos N1

**Bloquear almacenamiento USB** (`Configuración del equipo → Plantillas administrativas → Sistema → Acceso a almacenamiento extraíble`): «Discos extraíbles: denegar todo acceso» = Enabled. Se aplica al equipo: requiere reinicio o refresco. Es la política favorita de toda entrevista.

**Fondo de pantalla corporativo** (`Configuración de usuario → Plantillas administrativas → Panel de control → Personalización`): «Forzar pantalla de bloqueo específica» / fondo de escritorio con ruta a un fichero accesible (típicamente SYSVOL o un share de solo lectura).

**La gran excepción — contraseñas:** la política de contraseñas/bloqueo del dominio se configura en la **Default Domain Policy** a nivel de **dominio** (no por OU — eso sí existe, se llama Fine-Grained Password Policies/PSO, y es N2). Detalle del capítulo 8; mencionarlo aquí porque todo el mundo intenta «colgar» la política de contraseñas de una OU y no funciona así.

## 6.5 Diagnóstico: «la GPO no se aplica»

Los tres comandos sagrados, en el cliente:

```powershell
gpupdate /force          # forzar proceso ahora (muestra errores de proceso)
gpresult /r              # resumen: qué GPOs aplican y cuáles NO + por qué (filtradas)
gpresult /h report.html  # informe completo legible en navegador
```

Checklist ante «no aplica»:

1. ¿Está el objeto (equipo O usuario) en la OU donde cuelga la GPO? (El 50% de los casos: el equipo sigue en `CN=Computers`.)
2. ¿Se aplicó al lado correcto? Una GPO de «Configuración de usuario» no hace nada al equipo si el usuario no inicia sesión (y viceversa). `gpresult /r` muestra ambos apartados.
3. ¿Filtro de seguridad? Por defecto aplican a *Authenticated Users*; si alguien quitó ese grupo y no añadió el grupo correcto, la GPO queda huérfana (aparece como «filtrada» en gpresult).
4. ¿La pisó otra GPO más profunda o Enforced? (LSDOU, sección 6.2.)
5. ¿Es una **Preferencia** (GPP)? No re-fuerza el valor si el usuario lo cambió.
6. ¿Reinicio pendiente? Políticas de equipo requieren arranque; con `gpupdate /force` pregunta si quiere rearrancar.

Menciones de vocabulario N2 para no perderse: **loopback** (aplicar políticas de usuario según el equipo — quioscos), WMI filters, GPO modeling. Saber nombrarlos, no operarlos.

## Esto te preguntarán en la entrevista

**P: ¿Qué es una GPO y cómo se aplica?**
R: Un objeto de directiva: un conjunto de configuraciones para equipos/usuarios que se vincula a sitios, dominios y OUs, y que los clientes procesan al inicio (equipo), al iniciar sesión (usuario) y en refresco cada 90±30 minutos. La gestión es vía GPMC.

**P: ¿Cuál es el orden de aplicación de las GPOs?**
R: LSDOU: Local, Site, Domain y luego las OUs de más general a más profunda. Se acumulan y, en conflicto, gana la última procesada (la más cercana al objeto). Un link marcado como Enforced se impone incluso a OUs inferiores; Block Inheritance permite a una OU ignorar las superiores.

**P: ¿Cómo compruebas qué GPOs recibe un equipo?**
R: Con `gpresult /r` (resumen con GPOs aplicadas y filtradas) o `gpresult /h report.html` para informe completo; y `gpupdate /force` para forzar el procesado y ver errores.

**P: ¿Cómo bloquearías el uso de USB en toda la empresa?**
R: GPO vinculada al dominio (o a las OUs de estaciones) con la plantilla administrativa «Acceso a almacenamiento extraíble: Discos extraíbles: denegar todo acceso» en Configuración del equipo. Aplica al equipo: reinicio o refresco, y verificar con gpresult.

**P: Una GPO de usuario no se aplica a un usuario. ¿Qué miras?**
R: Que el usuario esté en la OU correcta; que la GPO tenga la mitad de usuario y no solo la de equipo; filtro de seguridad (¿Authenticated Users o su grupo?); que otra GPO más profunda o Enforced no la pise; y si es Preferencia, que el valor no fue cambiado a mano después. `gpresult /r` responde casi todo esto.

## Ejercicios prácticos

1. **Lab:** crea la GPO de la unidad H: de la sección 6.3 sobre `OU=Ventas` y comprueba con `gpresult /r` en el cliente que aparece como aplicada. Mapea también `\\DC1\Compartido` (crea el share primero si no existe).
2. **Lab:** aplica el bloqueo de USB a `OU=Estaciones`, mete una memoria USB (o simúlalo) y verifica con `gpresult /h`.
3. **Lab — herencia:** crea una GPO a nivel de dominio que ponga un fondo genérico y una GPO en `OU=Ventas` que ponga otro distinto. Comprueba cuál gana. Marca la del dominio como Enforced y vuelve a comprobar.
4. **Lab — el fallo más común:** mueve un equipo de `OU=Estaciones` a `CN=Computers` y observa en `gpresult /r` cómo desaparecen sus GPOs. Devuélvelo a su OU.
5. **De papel:** describe la GPO que configurarías para: (a) bloquear el panel de control, (b) obligar pantalla de bloqueo a los 5 minutos, (c) impedir que usuarios cambien la IP. Indica para cada una: mitad equipo o usuario, y dónde la vincularías.
