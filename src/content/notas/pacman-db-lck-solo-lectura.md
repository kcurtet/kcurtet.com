---
title: "pacman no puede bloquear la base de datos… y el db.lck no se deja borrar"
categoria: Linux
sintoma: "cualquier pacman falla con \"error: no se pudo bloquear la base de datos: El fichero ya existe\", pero al intentar borrar /var/lib/pacman/db.lck responde \"Sistema de ficheros de sólo lectura\". También fallan cosas que no tocan pacman: usermod no puede bloquear /etc/passwd y el journal se llena de pam_lastlog2 con errores SQLITE."
fecha: 2026-11-05
---
## Diagnóstico

El mensaje de pacman invita a pensar en un lock huérfano (otro pacman colgado o una actualización interrumpida). Pero si `rm` del lock falla con **read-only**, el problema no es el lock: es que el sistema de archivos raíz está en solo lectura. Comprobar primero eso:

```bash
findmnt -n -o SOURCE,OPTIONS /
# subvol=/@/.snapshots/335/snapshot  →  ¡estamos arrancados desde un snapshot!

sudo btrfs property get / ro
# ro=true  →  el subvolumen es de solo lectura
```

Si `subvol=` apunta a `@/.snapshots/N/snapshot`, la máquina arrancó desde una entrada del submenú de snapshots de GRUB (grub-btrfs), no desde el sistema normal.

Que nadie lo notara durante días es lo tramposo: en un layout típico con subvolúmenes separados, `/home`, `/var/log` y `/data` siguen siendo escribibles, así que iniciar sesión, leer correo y hasta ver logs nuevos funciona. Solo falla lo que escribe en el subvolumen raíz: `/etc`, `/var/lib`…

```bash
# pistas del journal que delatan escritura imposible en la raíz
sudo journalctl -b -p err --no-pager | tail
```

## Causa

Una actualización interrumpida dejó un `db.lck` dentro del snapshot pre-actualización. En el siguiente arranque se eligió (a mano o por config de GRUB) una entrada del submenú de snapshots de grub-btrfs, que monta ese snapshot como raíz. Los snapshots de snapper son de solo lectura por diseño, así que todo lo que escriba en la raíz falla.

En `@` (la raíz real) la actualización sí había terminado y no queda lock: es solo la copia congelada del snapshot la que arrastra el `db.lck`.

## Solución

Nada de pelearse con el lock: hay que arrancar de nuevo desde la raíz real.

1. Arrancar la entrada normal del menú de GRUB (la de siempre, no el submenú de snapshots) y verificar:

```bash
findmnt -n -o SOURCE,OPTIONS /
# subvol=@   y sin ro=true  →  correcto
```

2. **Si en el menú ya no existe entrada normal** (solo quedan las de snapshots), la regeneración de `grub.cfg` quedó rota — en mi caso la sección `10_linux` del fichero estaba vacía tras una actualización interrumpida. Se repara desde el propio snapshot arrancado, montando la raíz real y regenerando:

```bash
sudo mount -o subvol=@ /dev/nvme0n1p2 /mnt
for d in dev proc sys; do sudo mount --bind /$d /mnt/$d; done
sudo chroot /mnt grub-mkconfig -o /boot/grub/grub.cfg   # ahora 10_linux debe listar los kernels
```

3. Si el sistema insiste en arrancar el snapshot, revisar qué entrada es la por defecto y limpiar la elección guardada:

```bash
sudo grub-editenv list                    # ¿saved_entry/next_entry apuntando a un snapshot?
sudo grub-editenv set saved_entry=0       # primera entrada: el arranque normal
```

4. Higiene de btrfs: que el subvolumen por defecto sea la raíz real, no el árbol completo ni un snapshot:

```bash
sudo btrfs subvolume get-default /        # debería ser el ID de @
sudo btrfs subvolume set-default <ID-de-@> /
```

Si tras el cambio algo va mal, el snapshot sigue en el submenú de GRUB como plan B: se puede volver a arrancar desde él.

En mi caso el desenlace fue otro: el portátil iba a pasar de CachyOS rodante a Debian estable como servidor, así que en vez de reparar el GRUB reinstalé. Cuando la máquina cambia de papel, la reparación fina pierde valor: mejor backup y sistema nuevo.

## Prevención

- Después de toquetear el submenú de snapshots de GRUB (o tras cualquier reinicio raro), mirar `findmnt -n -o SOURCE,OPTIONS /`: cuesta dos segundos y delata un arranque desde snapshot.
- Un `db.lck` que **no se deja borrar** no es un lock terco: es la bandera de que la raíz está en solo lectura. Diagnosticar el montaje antes que el lock.
- En jefes de familia/helpdesk de casa: una máquina "que funciona" puede llevar días congelada si los datos vivos están en subvolúmenes separados. Los errores `pam_lastlog2`/SQLITE en el journal son la pista temprana.
