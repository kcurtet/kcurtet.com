import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../consts';

export async function GET(context: APIContext) {
	const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
		(a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf(),
	);
	return rss({
		title: `${SITE.nombre} — Blog`,
		description: SITE.descripcion,
		site: context.site!,
		items: posts.map((p) => ({
			title: p.data.title,
			description: p.data.description,
			pubDate: p.data.fecha,
			link: `/blog/${p.id}/`,
		})),
		customData: '<language>es-es</language>',
	});
}
