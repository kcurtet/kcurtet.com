# Guía Umami — kcurtet.com

Guía práctica para que Umami mida lo que sirve para decidir, no vanity metrics.
Todo está verificado contra la doc oficial (<https://docs.umami.is>).

## 1. Qué hay ya montado

- **Script del tracker** en `src/layouts/Base.astro` (head), Umami Cloud,
  website-id `d3e99273-94c1-408e-93a5-0e7a472e9072`. Como todo el sitio usa
  `Base.astro`, hay pageviews automáticos en todas las páginas.
- **2 eventos** con data attributes (script `marcar()` al final del body):
  - `email_click` — clics en `mailto:` (propiedad `pagina`)
  - `download_cv` — descarga del PDF del CV (propiedad `pagina`)
- Con eso Umami ya reporta solo: visitantes, sesiones, páginas top, referrers,
  países, dispositivos, navegadores y parámetros UTM de la URL.

## 2. Puesta a punto (5 minutos, una vez)

### 2.1 Excluir tus propias visitas

Sin esto, tus visitas y previews contaminan los datos. En el navegador que uses
para navegar la web, consola de dev (F12) en `kcurtet.com`:

```js
localStorage.setItem('umami.disabled', 1);
```

Válido a partir de ese momento y solo para ese navegador. Repítelo en cada
navegador/dispositivo con el que entres. En modo incógnito no persiste (acepta
ese ruido).

### 2.2 Endurecer el script

En `src/layouts/Base.astro`:

```html
<script
	is:inline
	defer
	src="https://cloud.umami.is/script.js"
	data-website-id="d3e99273-94c1-408e-93a5-0e7a472e9072"
	data-domains="kcurtet.com"
></script>
```

- `data-domains` (doc: tracker configuration): el tracker solo se activa en los
  dominios listados. Evita ruido de `localhost`, previews de Cloudflare y
  cualquier otro host. **Efecto lateral conocido** ([umami#290]): en dominios no
  listados `window.umami` no existe; cualquier llamada directa a
  `umami.track()` debe guardarse con `if (window.umami)` (los snippets de esta
  guía ya lo llevan).

Opcional: `data-do-not-track="true"` respeta la señal DNT del navegador. DNT
está deprecado y casi nadie lo activa; añádelo solo por coherencia con el
"sin cookies" del footer.

### 2.3 Verificar que trackea

1. `astro build` y comprobar que `dist/index.html` contiene el script.
2. Abrir la web en producción y mirar en F12 → Network peticiones a
   `cloud.umami.is` (el script `script.js` y un `POST` a `/api/send`).
3. En el dashboard de Umami: pestaña **Realtime** → tu visita debería aparecer.
4. Si no aparece: adblocker (bloquea `umami.is` con frecuencia) o el
   `umami.disabled` del paso 2.1.

## 3. Eventos útiles para este sitio

Regla: un evento solo entra si hay una decisión detrás. Estado actual y
propuestas:

| Evento           | Estado    | Decide qué                                                       |
| ---------------- | --------- | ---------------------------------------------------------------- |
| `email_click`    | ✅ ya está | Si la web genera contacto directo (objetivo #1 de candidaturas)  |
| `download_cv`    | ✅ ya está | Si el CV que ves el recruiter llega desde la web                  |
| `enlace_externo` | propuesto | Si la web empuja tráfico a GitHub/LinkedIn (perfil → entrevista)  |
| `rss_click`      | propuesto | Tamaño de la base de lectores fieles                               |
| `lectura_75`     | propuesto | Qué posts se leen de verdad vs. se abren y se rebota (contenido)  |

### 3.1 Enlaces externos + RSS (extender `marcar()` en `Base.astro`)

Dentro del mismo `<script is:inline>` existente, tras las dos llamadas a
`marcar()`:

```js
// RSS
marcar('a[href="/rss.xml"]', 'rss_click');
// Enlaces externos: GitHub, LinkedIn... (no machaca los ya marcados)
document.querySelectorAll('a[href^="http"]:not([data-umami-event])').forEach(function (a) {
	if (a.host !== location.host) {
		a.setAttribute('data-umami-event', 'enlace_externo');
		a.setAttribute('data-umami-event-destino', a.host);
	}
});
```

Esto es el patrón de la guía oficial "track outbound links", adaptado al
helper que ya existe. La propiedad `destino` (`github.com`, `linkedin.com`)
evita un evento distinto por dominio.

### 3.2 Lectura real de posts (`lectura_75`)

El "average visit time" del dashboard incluye pestañas abiertas en segundo
plano. Un umbral de scroll del 75% del artículo es la señal honesta de "se leyó".
Añadir en `src/layouts/Article.astro` (solo afecta a posts/notas/cursos):

```html
<script is:inline>
	(function () {
		var art = document.querySelector('article');
		if (!art) return;
		var enviado = false;
		function alScroll() {
			if (enviado) return;
			var objetivo = art.offsetTop + art.offsetHeight * 0.75 - innerHeight;
			if (scrollY >= objetivo) {
				enviado = true;
				if (window.umami) umami.track('lectura_75', { url: location.pathname });
				removeEventListener('scroll', alScroll);
			}
		}
		addEventListener('scroll', alScroll, { passive: true });
		alScroll();
	})();
</script>
```

- `window.umami` con guard: en dev (localhost, fuera de `data-domains`) el
  objeto no existe y lanzaría TypeError.
- `umami.track(nombre, datos)` es la API oficial para eventos con datos tipados.
- Un evento por post y sesión es suficiente; no trackear 25/50/75/90 — ruido.

## 4. Cómo leer el dashboard (rutina semanal, 10 min)

Rango **últimos 7 días**, en este orden:

1. **Events** → `download_cv` + `email_click`. Es la conversión real del sitio
   (candidaturas). Sin eventos varias semanas → cambiar el CTA del CV o dónde
   compartes la web.
2. **Pages** con filtro URL `^/blog/` → top posts. Decide qué temas escribir
   (hay ritmo de 1 post/semana en PENDIENTES.md: que lo alimenten los datos).
3. **Pages** con filtro `^/cursos/` → por qué capítulo entra la gente y dónde
   cae la audiencia de la serie. Decide qué serie continuar o rematar.
4. **Referrers** → de dónde llega el tráfico. Cuando enlaces la web desde
   LinkedIn y GitHub, usa UTMs para distinguir la fuente exacta:
   `https://kcurtet.com/?utm_source=linkedin&utm_medium=perfil`
   Umami los captura solo y los muestra en filtros/Views. Sin UTM, LinkedIn
   aparece como referral genérico (o `lm.facebook.com` y similares).
5. **404s**: cualquier URL con estado 404 se registra como pageview igualmente
   (el `not_found_handling` de Cloudflare sirve la 404 en la URL original).
   Filtrar Pages por rutas inexistentes → arreglar enlaces rotos.
6. **Realtime** al publicar algo y compartirlo: feedback inmediato de si el
   canal de distribución pica.

## 5. API de Umami Cloud (opcional, para scripting)

Umami Cloud expone API (Settings → API keys; base `https://api.umami.is/v1`,
auth por header `x-umami-api-key`). Endpoints útiles:

- `GET /websites/{id}/stats?startAt=…&endAt=…` — visitantes/sesiones/pageviews
- `GET /websites/{id}/metrics?type=url` (o `type=event`) — desglose

Casos de uso real para este sitio: un script semanal (cron del homelab) que
imprima el top post y los eventos de conversión, o alimentar un "lo más leído"
en la home cuando haya datos suficientes. **El API key jamás al repo** —
variable de entorno. Doc: <https://umami.is/docs/api>.

## 6. Qué NO hacer

- **No** un evento por cada scroll, hover o click de navegación interna (Umami
  ya te da el funnel de páginas).
- **No** medir el consumo de RSS por la URL `/rss.xml`: los feed readers no
  ejecutan JS, así que ahí solo cuenta el `rss_click` desde la web. Es una
  limitación honesta, no un bug.
- **No** añadir Google Analytics/Plausible "para comparar": duplica y ensucia.
  Umami + eventos bien puestos cubre este sitio.
- **No** vigilar pageviews acumulados totales: es la vanity metric por
  excelencia. Miras semanal, decides, cierras pestaña.

## 7. Checklist de adopción

- [ ] `localStorage.setItem('umami.disabled', 1)` en tus navegadores
- [ ] `data-domains="kcurtet.com"` en el script de `Base.astro`
- [ ] Extender `marcar()` con `rss_click` y `enlace_externo`
- [ ] `lectura_75` en `Article.astro`
- [ ] UTMs en los enlaces de LinkedIn/GitHub/CV cuando los añadas
- [ ] Verificar en Realtime tras desplegar
- [ ] Revisar el dashboard una vez por semana (10 min)
