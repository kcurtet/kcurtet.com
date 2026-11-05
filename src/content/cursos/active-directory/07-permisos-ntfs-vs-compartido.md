---
title: "7 · Permisos: NTFS vs permisos de compartido"
description: "Dos capas de permisos, una sola pregunta de examen: ¿cuál manda? La respuesta corta: al ir por red, la más restrictiva de las dos. La respuesta larga, este capítulo."
curso: "active-directory"
capitulo: 7
orden: 7
---
> «Dos capas de permisos, una sola pregunta de examen: ¿cuál manda? La respuesta corta: al ir por red, la más restrictiva de las dos. La respuesta larga, este capítulo.»

## Objetivos

- Entender por qué existen DOS sistemas de permisos y cuándo actúa cada uno.
- Calcular el permiso efectivo (acumulación, denegación, combinación NTFS×Share) con ejemplos.
- Operar con icacls y la GUI, y dejar permisos con la estructura AGDLP del capítulo 3.
- Diagnosticar el ticket «no puedo entrar a \\servidor\datos».

## 7.1 Dos capas, dos historias

Cuando compartes una carpeta en Windows Server, el acceso pasa por **dos puertas en serie**:

1. **Permiso de compartido (Share permissions)**: la puerta de la *red*. Solo aplica cuando entras por `\\servidor\recurso` (SMB). Es burdo: solo en la carpeta compartida, solo 3 niveles.
2. **Permisos NTFS**: la puerta del *sistema de ficheros*. Aplican SIEMPRE: acceso local, por red, RDP, backup. Finos: por carpeta/fichero, herencia, usuarios y grupos.

> **Para tu cerebro Linux:** NTFS ACLs son las POSIX ACLs de Windows (a esteroides): listas de entradas usuario/grupo→permisos, con herencia. Los permisos de compartido son como si el *daemon* de samba (que no casualmente es esto mismo) tuviera su propia capa de allow/deny por encima del FS: si te deja pasar el daemon pero el FS no, no pasas. Y al revés, igual.

Consecuencia del doble control: el usuario necesita **ambos** permisos para entrar por red, y basta que uno niegue para que no entre.

## 7.2 Permisos NTFS en serio

Los permisos «básicos» (que son combinaciones de los 14 permisos especiales — sí, catorce):

| Permiso básico | Qué deja hacer |
|----------------|----------------|
| **Control total** (Full Control) | todo + cambiar permisos (¡cuidado!) |
| **Modificar** (Modify) | leer, escribir, borrar, renombrar |
| **Leer y ejecutar** | ver contenido, leer, ejecutar |
| **Mostrar contenido de carpeta** | listar |
| **Lectura** | leer ficheros y atributos |
| **Escritura** | crear ficheros/carpetas, escribir |

Reglas de cálculo del permiso efectivo NTFS:

1. **Se acumulan los permisos de todos los grupos** a los que perteneces: si `GG-Ventas` da Lectura y `DL-FS01-Datos-Escritura` da Modificar → tienes Modificar (el más generoso gana).
2. **Denegar (Deny) explícito gana sobre todo**, incluso sobre otro Allow por otro grupo. El Deny es quirúrgico y raro: úsalo como excepción, no como política.
3. **Herencia**: las carpetas heredan permisos del padre por defecto (se ve como iconos grises). Se puede romper («Deshabilitar herencia»), y se puede forzar («Reemplazar permisos…»). El lío de herencias rotas es fuente clásica de tickets.

En la GUI: clic derecho → Propiedades → Seguridad → Opciones avanzadas → pestaña **Acceso efectivo** (*Effective Access*): eliges un usuario y te calcula el resultado final. Es tu `getfacl` de Windows, y también tu herramienta para responder «¿por qué no puedo entrar?» sin adivinar.

Por PowerShell/cmd, `icacls` es tu `setfacl`:

```cmd
:: Ver permisos (recursivo)
icacls "D:\Datos"

:: Dar Modificar a un grupo del dominio, con herencia (OI=objetos, CI=contenedores)
icacls "D:\Datos" /grant "CORP\DL-FS01-Datos-Escritura:(OI)(CI)M"

:: Quitar un permiso heredado explícito / resetear herencia
icacls "D:\Datos" /remove "CORP\Todos"
icacls "D:\Datos" /reset /T
```

## 7.3 Permisos de compartido

Solo tres niveles, solo sobre la carpeta compartida, solo aplican **por red**:

| Share | Equivalencia aproximada |
|-------|------------------------|
| **Lectura** (Read) | ver y descargar |
| **Cambio** (Change) | leer + escribir + borrar |
| **Control total** (Full Control) | cambio + cambiar permisos del share (NTFS aparte) |

Detalle histórico útil: en empresas viejas verás shares con «Everyone: Read» y toda la seguridad delegada a NTFS. O al revés. Ambas escuelas funcionan si son consistentes. La moda moderna (y la recomendación de Microsoft): **Compartido: Everyone/Authenticated Users = Control total (o Cambio), y la seguridad real fina en NTFS** — una sola capa que afinar.

## 7.4 La combinación efectiva (LA pregunta de entrevista)

Cuando el acceso es **por red**, el permiso final es:

> **Permiso efectivo = el MÁS RESTRICTIVO entre (NTFS efectivo) y (Share efectivo)**

Ejemplos numéricos (memoriza la tabla):

| NTFS efectivo | Share | Acceso por red | Acceso local |
|---------------|-------|----------------|--------------|
| Modificar | Lectura | **Lectura** (manda el share) | Modificar |
| Lectura | Control total | **Lectura** (manda NTFS) | Lectura |
| Modificar | Control total | Modificar | Modificar |

Fíjate en la segunda columna de la derecha: **en local solo aplica NTFS** — el share es invisible para el usuario sentado delante del servidor (o conectado por RDP). Esto explica el clásico: «el admin puede abrirlo en el servidor, el usuario no puede por la unidad de red». Ambas capas, y la más restrictiva por red.

Mini-examen mental que debes superar sin dudar:
- Usuario con Full en share y Read en NTFS → **Read**.
- Usuario en dos grupos: uno da NTFS Read, otro NTFS Modify; share Change → **Modify por NTFS acumulado; por red: Modify** (Change ≥ Modify no corta: Change y Modify son equivalentes de facto aquí).
- Usuario con Deny de escritura en NTFS por un grupo, y Allow total por otro → **sin escritura** (Deny gana).

## 7.5 Práctica de montaje de un share con reglas

El flujo completo correcto para compartir `D:\Datos` al departamento:

1. Crear el share (clic derecho → Propiedades → Compartir, o `New-SmbShare`):
   ```powershell
   New-SmbShare -Name "Datos" -Path "D:\Datos" `
     -FullAccess "Authenticated Users"
   ```
2. En NTFS, dar permisos a **grupos**, no a personas (AGDLP, cap. 3):
   `DL-FS01-Datos-Lectura` → Lectura y ejecutar; `DL-FS01-Datos-Escritura` → Modificar.
3. Quitar de NTFS lo que sobre (usuarios sueltos, Everyone con más de lectura).
4. Probar con una cuenta del grupo de lectura (debe poder leer y NO escribir) y una de escritura. Siempre verificar, no presuponer.
5. Documentar: share, grupos, permisos (tu future yo —y tu equipo— lo agradecen).

## 7.6 El ticket «no puedo entrar a \\server\datos» — checklist L1

1. **¿El error es de permisos o de conexión?** «Acceso denegado» ≠ «no se encuentra la ruta». Lo segundo: DNS/red/share existe. Lo primero: permisos.
2. **¿El usuario está en el grupo correcto?** (`Get-ADUser u -Properties MemberOf`) ¿Y hizo logout/login desde que lo metieron? El token de sesión se calcula al iniciar sesión: añadir a un grupo no tiene efecto hasta re-login (o `klist purge` + gpupdate). Detalle que resuelve tickets fantasma.
3. **Calcular efectivo**: Effective Access tab o a mano (7.4): ¿NTFS? ¿Share? ¿Deny olvidado?
4. **¿Herencia rota** en alguna subcarpeta? (icacls /findsid ayuda.)
5. ¿Credenciales viejas cacheadas? Windows puede estar presentando otro usuario: cerrar sesión o `cmdkey /list` + borrar.
6. Si es solo una persona: reproduce con su cuenta tú; si falla para todos: míralo como problema del share/permisos base.

## Esto te preguntarán en la entrevista

**P: ¿Cuál es la diferencia entre permisos NTFS y permisos de compartido?**
R: NTFS aplican al sistema de ficheros siempre (acceso local y red), con granularidad de carpeta/fichero y herencia. Los de compartido solo aplican al acceder por red (SMB) a la carpeta compartida y tienen solo tres niveles. Por red se aplican ambos.

**P: Si un usuario tiene Control total en el share y solo Lectura en NTFS, ¿qué puede hacer por red?**
R: Solo Lectura: al combinar, manda el más restrictivo de las dos capas. En cambio, sentado en el servidor (acceso local) tendría lo que marque NTFS: el share no aplica.

**P: ¿Cómo se calcula el permiso efectivo NTFS?**
R: Se acumulan los permisos de todos los grupos del usuario (gana el más amplio), pero una denegación explícita gana sobre cualquier permiso. La herencia aporta permisos del padre, salvo herencia deshabilitada. La pestaña «Acceso efectivo» lo calcula.

**P: ¿Cómo darías acceso de escritura a un departamento en una carpeta compartida?**
R: Con grupos, no usuarios: un domain local tipo DL-Datos-Escritura con permiso NTFS Modificar (heredado a hijos con OI/CI), share con Authenticated Users en Control total o Cambio, y comprobar con Effective Access y con una cuenta real de prueba.

**P: Añadiste al usuario al grupo con acceso, pero sigue sin poder entrar. ¿Por qué?**
R: El token de pertenencia a grupos se genera al iniciar sesión: debe cerrar y abrir sesión (o como mínimo gpupdate/klist purge). Si persiste, a revisar permisos efectivos y si el cambio de grupo llegó por replicación.

## Ejercicios prácticos

1. **Lab:** comparte `C:\Compartido` en tu DC con `New-SmbShare`. Crea dos grupos (`DL-Datos-Lectura`, `DL-Datos-Escritura`), asigna NTFS según 7.5, y crea dos usuarios de prueba (uno en cada grupo).
2. **Lab — la tabla:** reproduce la tabla de 7.4 con tus usuarios: Full share + Read NTFS → verifica que por red solo puede leer y que en local (consola del DC) sí puede más. Documenta el resultado.
3. **Lab — Deny:** da Deny de escritura a un segundo grupo del usuario de escritura. Comprueba que el Deny pisa el Allow. Luego quítalo (y reflexiona sobre por qué el Deny se usa poco).
4. **Lab — herencia rota:** deshabilita la herencia en una subcarpeta y observa con `icacls` la diferencia. Arregla con `/reset /T`.
5. **De papel:** usuario reporta «acceso denegado» en `\\FS01\Datos\Proyectos`. Escribe tu checklist de 5 pasos con el comando/acción de cada uno.
