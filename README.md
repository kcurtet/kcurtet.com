# kcurtet.com

Mi web personal: portfolio, blog de lo que aprendo y notas de troubleshooting. Hecha con [Astro](https://astro.build), estática, sin cookies.

## Uso

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
```

## Dónde va cada cosa

| Quiero… | Fichero |
| --- | --- |
| Escribir un post | `src/content/blog/<slug>.md` (frontmatter: title, description, fecha, serie?, tags, draft?) |
| Añadir un proyecto | `src/content/proyectos/<slug>.md` (title, resumen, stack, repo?, orden) |
| Añadir una nota de troubleshooting | `src/content/notas/<slug>.md` (title, categoria, sintoma, fecha) |
| Cambiar "lo que busco ahora" | `SITE.ahora` en `src/consts.ts` |
| Actualizar el CV | sustituir `public/cv/kevin-curtet-soporte-it.pdf` |
| Editar "Sobre mí" | `src/pages/sobre-mi.astro` y `src/pages/fr/a-propos.astro` |

`draft: true` en el frontmatter oculta una entrada.

## Despliegue

Cloudflare Pages: build `npm run build`, salida `dist`, variable `NODE_VERSION=22`. Dominio personalizado `kcurtet.com` (las DNS ya están en Cloudflare).
