---
title: "GRUB arranca siempre en un snapshot y el sistema 'va pero no deja escribir'"
categoria: Linux
sintoma: "en el menú de GRUB la primera opción son filas de títulos con fechas en vez del arranque normal, y si eliges cualquier imagen acabas en un snapshot de solo lectura. El sistema funciona (login, internet, logs nuevos) pero todo lo que escriba en la raíz falla en silencio: pacman muere a mitad, nginx no arranca, systemctl enable no persiste."
fecha: 2026-11-07
---
## Diagnóstico

Primero confirma desde dónde has arrancado realmente:

```bash
findmnt -n -o SOURCE /
# /dev/nvme0n1p2[/@/.snapshots/335/snapshot]  →  estás DENTRO de un snapshot

cat /proc/cmdline   # rootflags=subvol=@/.snapshots/N/snapshot lo confirma
```

Lo contraintuitivo: la entrada normal de GRUB puede estar perfecta
(`rootflags=subvol=@`) y aún así no arrancar. En este caso un
`pacman -Syu` interrumpido dejó `/boot` del subvolumen raíz real **sin
kernels** (ni `vmlinuz-*` ni `initramfs-*` ni presets de mkinitcpio), pero
con la base de datos de pacman consistente: el sistema "cree" que el kernel
está instalado y nadie avisa. La entrada normal falla con un *file not found*
de GRUB y lo único arrancable es el submenú de snapshots de grub-btrfs, que
monta solo lectura.

Para ver el estado real (no la copia congelada del snapshot), monta el
subvolumen raíz:

```bash
sudo mount -o subvol=@,ro /dev/nvme0n1p2 /mnt
ls /mnt/boot/   # sin vmlinuz-* → ahí está el problema
```

## Solución

Reinstalar los kernels **dentro del subvolumen raíz real**, no del snapshot.
Con el subvolumen montado con escritura y un chroot:

```bash
sudo mount -o remount,rw /mnt
for d in proc sys dev; do sudo mount --rbind /$d /mnt/$d; done

# gotcha: /var/cache es un subvolumen aparte — el cache de pacman del chroot
# está vacío. Bindea el del host:
sudo mount --bind /var/cache/pacman/pkg /mnt/var/cache/pacman/pkg
sudo cp -L /etc/resolv.conf /mnt/etc/resolv.conf   # resolv.conf es symlink a /run

sudo chroot /mnt pacman -S --noconfirm linux-cachyos   # tu kernel
```

Los paquetes salen del cache local, no hace falta red. Tras reinstalar,
`mkinitcpio` regenera los initramfs y los hooks recrean el GRUB. Reinicia y
elige la **primera** entrada (la normal), no el submenú de snapshots.

## Moraleja

Un `pacman -Syu` muerto a medias puede eliminar los kernels dejando la base
de datos consistente: el síntoma no es un error de pacman, es "GRUB nunca
arranca la raíz". Y un snapshot de solo lectura como raíz es difícil de
notar: `/home` y `/var/log` suelen ser subvolúmenes separados que siguen
siendo escribibles.
