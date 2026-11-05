---
title: Mi sistema como código (NixOS)
resumen: Todo mi portátil descrito en un repositorio. Reinstalarlo desde cero es clonar y aplicar un comando, con secretos cifrados y CI que revisa cada cambio.
stack: [NixOS, Nix flakes, home-manager, sops-nix, GitHub Actions]
repo: https://github.com/kcurtet/nixos
orden: 3
---

## El problema

Configurar un equipo a mano es lento y no se puede repetir: a los meses nadie recuerda qué se cambió ni por qué. En una empresa eso se resuelve con imágenes, GPOs o Intune. En mi portátil lo resolví con **NixOS**: todo el sistema está descrito en código.

## Lo que hice

- **Flake reproducible**: las versiones quedan fijadas en `flake.lock`, así que el mismo commit da el mismo sistema.
- **Módulos propios con opciones `enable`**: Tailscale, Syncthing, DNS local con caché (dnsmasq), Docker, KVM/QEMU, NVIDIA… se activan desde el fichero del equipo sin tocar el módulo.
- **Secretos cifrados con sops-nix**: las claves viven cifradas en el repo y solo se descifran en el equipo, en `/run/secrets`, con permisos `0600`.
- **Calidad automática**: `nixfmt`, `statix` y `deadnix` en pre-commit y en CI.
- **Un script `nix-apply`** que enseña el diff, hace commit y aplica: ningún cambio sin revisar.

```nix
my.services = {
  tailscale.enable = true;
  dnsmasq = {
    enable = true;
    upstreamServers = [ "1.1.1.1" "8.8.8.8" ];
  };
};
```

## Qué aprendí

- **Configuración declarativa = configuración auditable.** Es la misma idea que hay detrás de las GPO de Active Directory: describir el estado deseado y que el sistema lo aplique.
- **Los secretos nunca van en claro en un repo**, ni siquiera en uno privado.
- Revisar el diff antes de aplicar evita la mayoría de los sustos.
