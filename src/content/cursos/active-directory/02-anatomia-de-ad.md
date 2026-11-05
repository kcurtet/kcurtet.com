---
title: "2 · Anatomía de AD: DC, dominio, árbol, bosque, OU"
description: "Dominio, árbol y bosque son la misma idea a tres escalas; la OU es la única que tú vas a tocar a diario."
curso: "active-directory"
capitulo: 2
orden: 2
---
> «Dominio, árbol y bosque son la misma idea a tres escalas; la OU es la única que tú vas a tocar a diario.»

## Objetivos

- Dibujar de memoria el mapa mental: bosque > árbol > dominio > OU > objetos.
- Explicar qué es un DC, qué guarda y por qué suele haber varios.
- Entender la OU como herramienta de **delegación** y **GPOs** (lo que un L1 sí toca).
- Saber que existen FSMO roles, sitios y Global Catalog — y saber que *todavía* no son tu problema.

## 2.1 El dominio: la unidad básica

El dominio (`corp.lab`) es el contenedor maestro:

- Todas las cuentas de usuario, grupo y equipo viven en él.
- Define un **namespace DNS**: cada objeto es localizable dentro de `corp.lab`.
- Es un **límite de seguridad y administración**: los Domain Admins de `corp.lab` mandan en `corp.lab` (y en poco más).
- Tiene sus propias políticas de dominio (contraseñas, bloqueos: capítulo 8).

En una empresa mediana-pequeña, normalmente hay **un solo dominio**. Todo lo que viene ahora (árboles, bosques, trusts) existe para las grandes: saberlo te permite responder preguntas de entrevista y no perderte cuando veas un entorno grande.

## 2.2 El DC (Domain Controller): donde vive la base de datos

Un DC es un Windows Server con el rol **AD DS** instalado y el dominio *promocionado*. Guarda:

- **NTDS.dit**: la base de datos del directorio (usuarios, equipos, atributos, contraseñas hasheadas).
- **SYSVOL**: carpeta compartida con las políticas (GPO) y scripts, replicada entre DCs.

Características clave del modelo:

- **Multi-master**: cualquier DC acepta cambios (crear un usuario, cambiar una contraseña). No hay un «maestro» único de escritura, como sí lo hay en muchas arquitecturas primario/réplica.
- **Replicación**: los cambios se replican a los demás DCs (típicamente en segundos/minutos). Consecuencia L1: un cambio hecho en DC1 puede tardar un poco en verse desde DC2 — no es un bug.
- **Varios DCs = tolerancia a fallos**: si uno cae, los clientes encuentran otro por DNS. Consecuencia L1: «el dominio está caído» casi nunca es verdad; suele estar caído *un* DC o el DNS (capítulo 5).

Para tu cerebro Linux: piensa en un clúster tipo etcd/multi-master donde cada nodo sirve lecturas y escrituras y se sincronizan solos, aunque el protocolo y los detalles (KCC, topology) son propios.

## 2.3 Árbol y bosque: dominios a lo grande

Cuando una organización tiene varios dominios:

- **Árbol**: dominios que comparten un namespace contiguo y una jerarquía: `corp.lab` y `filial.corp.lab` forman un árbol (como subdominios DNS).
- **Bosque (forest)**: el conjunto de TODOS los dominios de la organización, con namespace compartido o no (`corp.lab` + `otra-marca.com` pueden vivir en el mismo bosque). Es el límite real de la organización: **esquema y configuración compartidos**.

La pieza que une todo: los **trusts** (relaciones de confianza). Dentro de un bosque, todos los dominios confían entre sí de forma **transitiva** (si A confía en B y B confía en C, A confía en C). Gracias a eso, un usuario de `corp.lab` puede, si tiene permisos, acceder a recursos de `filial.corp.lab`.

> **Nivel N1 real:** en el 90% de los helpdesks tocas un dominio. Saber nombrar bosque/árbol/trust basta para la entrevista y para no asustarte en la documentación. Gestionar trusts entre bosques es N2/N3.

**Global Catalog (GC)**: un DC adicional que guarda una copia *parcial* de todos los objetos del bosque (para búsquedas rápidas entre dominios). Saber que existe; nada más.

## 2.4 La OU: la herramienta del día a día

La **Organizational Unit** es un contenedor *dentro* de un dominio. A diferencia del dominio, crear OUs es barato y no añade límites de seguridad duros: es **organización pura**. Y es la base de las dos cosas que estructuran tu trabajo:

1. **GPOs**: las políticas se vinculan a sitios, dominios y OUs (capítulo 6). Estructura de OUs = estructura de configuración.
2. **Delegación**: puedes dar a un usuario/grupo permisos sobre una OU concreta («puede resetear contraseñas de OU=Empleados») sin darle nada más. **Así se otorgan los permisos del helpdesk en empresas serias: ni Domain Admin ni nada. Un L1 típico tiene derechos delegados sobre una OU.**

Estructura típica de OUs:

```
corp.lab
├── Empleados
│   ├── Ventas
│   ├── Finanzas
│   └── Soporte          ← aquí viven las cuentas que tú administras
├── Estaciones           ← los PCs unidos al dominio
│   ├── Oficina-Madrid
│   └── Portatiles
├── Servidores
└── Grupos
```

Reglas prácticas de diseño que te pueden preguntar:

- OUs por **función/ubicación/departamento**, lo que haga útiles las GPOs.
- **Nunca** dejes cuentas en los contenedores por defecto `Users` y `Computers`: son contenedores planos (ni siquiera OUs reales) a los que no se pueden vincular GPOs útiles. Al unir un equipo, muévelo a su OU (capítulo 4).
- Los grupos de seguridad suelen agruparse en una OU propia (`Grupos`), no junto a los usuarios.

## 2.5 Delegación: cómo te darán acceso tú

El flujo habitual cuando entras de L1 en una empresa:

1. Te crean una cuenta normal (en `OU=Soporte`).
2. La meten en un grupo tipo `HD-PasswordReset`.
3. Ese grupo tiene **control delegado** sobre `OU=Empleados` para dos tareas: *Reset password* y *Force change password at next logon* (y quizá *unlock account*).

Consecuencia práctica: verás usuarios y operaciones solo de tu OU. Si intentas tocar algo fuera, AD te dirá **Access Denied** — y eso está bien: escalarlo o pedir el permiso adecuado, nunca «apañarlo».

## 2.6 Lo que existe pero NO necesitas aún (señales de N2+)

Saber que existen te evita quedarte en blanco en una entrevista y reconocer cuándo escalar:

- **FSMO roles**: 5 roles especiales que solo puede tener un DC a la vez (PDC Emulator, RID Master, Infrastructure Master, Schema Master, Domain Naming Master). Frase de entrevista: «son roles únicos en el bosque/dominio que gestionan operaciones que no pueden ser multi-master; si un DC con un FSMO muere hay que *seize* el rol — eso es N2/N3».
- **Sitios (sites) y replicación inter-sitio**: agrupan subredes para optimizar replicación por WAN y localización de DC cercano.
- **Trusts externos/de bosque, AD CS, AD FS**: ecosistema. Nombres que ya reconocerás.

Regla del libro: **si no lo toca un L1 en una semana normal, aquí solo se nombra.**

## Esto te preguntarán en la entrevista

**P: ¿Diferencia entre dominio, árbol y bosque?**
R: El dominio es la unidad básica de seguridad y administración (un namespace como corp.lab). Un árbol es un conjunto de dominios con namespace contiguo y jerárquico. El bosque es el conjunto de todos los dominios de la organización: comparten esquema y configuración y se relacionan mediante trusts transitivos.

**P: ¿Qué es un Domain Controller?**
R: Un servidor con el rol AD DS que guarda una copia de la base de datos del directorio (NTDS.dit) y SYSVOL, autentica usuarios (Kerberos/NTLM) y sirve GPOs. El modelo es multi-master: cualquier DC acepta cambios y los replica al resto.

**P: ¿Para qué sirven las OUs?**
R: Para organizar objetos dentro del dominio, aplicar GPOs de forma granular y delegar administración: puedo dar a helpdesk permisos de reset de contraseñas solo sobre una OU sin darle nada más del dominio.

**P: ¿Qué es la delegación en AD?**
R: Conceder permisos administrativos finos sobre un contenedor (OU) a usuarios o grupos, mediante el wizard de Delegación o permisos de seguridad avanzados. Es la alternativa correcta a meter a todo el mundo en Domain Admins.

**P: ¿Has oído hablar de los roles FSMO?**
R: Sí: son cinco roles especiales de operaciones únicas (por ejemplo el PDC Emulator, que gestiona bloqueos y sincronía de tiempo). Si el DC que los tiene cae, hay que transferir o seize el rol; su gestión es de nivel N2/N3.

## Ejercicios prácticos

1. **De papel:** diseña la estructura de OUs para una empresa de 300 personas con dos sedes (Madrid, Barcelona), departamentos (IT, Ventas, RRHH, Finanzas) y dos tipos de equipo (fijo, portátil). Justifica por qué anidas por sede o por departamento.
2. **De papel:** el helpdesk necesita resetear contraseñas y desbloquear cuentas de todos los empleados, pero no puede crear usuarios ni tocar servidores. ¿Qué permiso delegado exacto le das y sobre qué OU?
3. **De papel:** una empresa tiene `corp.es` y `tiendascorp.es`. ¿Es árbol o solo dos dominios de un bosque? ¿Qué tendrían que compartir obligatoriamente?
4. **Prepara el lab:** lee la sección 4 del capítulo 11 y decide qué estructura de OUs vas a crear en tu laboratorio usando el ejercicio 1 como base.
