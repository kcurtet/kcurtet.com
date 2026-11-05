---
title: sysadmin-scripts
resumen: Once scripts Bash comentados para soporte y administración de Linux, desde el diagnóstico de red capa por capa hasta backups incrementales con rsync. Todos pasan ShellCheck.
stack: [Bash, rsync, OpenSSL, cron, ShellCheck]
repo: https://github.com/kcurtet/sysadmin-scripts
orden: 2
---

## El problema

En soporte las mismas preguntas se repiten: ¿qué tiene esta máquina?, ¿qué está llenando el disco?, ¿por qué "no hay Internet"?, ¿cuándo caduca este certificado? Quería respuestas rápidas que funcionaran en cualquier distribución sin instalar nada raro.

## Lo que hice

Una colección de scripts pequeños, comentados y sin dependencias exóticas:

| Script | Para qué |
| --- | --- |
| `sysinfo.sh` | Resumen de un equipo en una pantalla, listo para pegar en un ticket |
| `netdiag.sh` | La checklist de "no hay Internet", capa por capa: dice dónde se rompe |
| `diskusage.sh` | Qué está llenando el disco y cómo liberar espacio |
| `backup.sh` | Snapshots incrementales con `rsync`: cada copia parece completa pero solo guarda lo que cambió |
| `ssl-expiry.sh` | Días que le quedan a un certificado TLS |
| `ssh-failed-logins.sh` | IPs y usuarios detrás de los intentos de login SSH fallidos |
| `user-audit.sh` | Cuentas locales, últimos accesos, sudoers, UID 0 |
| `check-services.sh`, `port-check.sh`, `mysql-backup.sh`, `postgres-backup.sh` | Servicios, puertos y copias de bases de datos |

## Ejemplo: `netdiag.sh`

```text
== 4. Internet (no DNS) ==
  [ OK ] Internet is reachable (1.1.1.1 answers).
== 5. DNS resolution ==
  [FAIL] Internet works but names do not resolve. Check the DNS servers:
        nameserver 192.168.1.1
```

La conexión funciona, pero el DNS del router no contesta. Es el mismo razonamiento que sigo a mano en las [notas de troubleshooting](/notas/): ir de abajo arriba y parar donde falla.

## Qué aprendí

- **Un script de diagnóstico es una checklist que no se salta pasos.** Escribirlo me obligó a ordenar cómo diagnostico.
- **ShellCheck** encuentra errores que no ves hasta que fallan en producción (variables sin comillas, globbing).
- Portabilidad: se probaron en Ubuntu, Debian, CentOS y Rocky Linux.
