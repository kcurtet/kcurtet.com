export const SITE = {
	url: 'https://kcurtet.com',
	nombre: 'Kevin Curtet',
	titular: 'Sistemas, redes y automatización',
	descripcion:
		'Técnico de soporte IT en Girona. Linux a diario, homelab, redes y scripting. Escribo lo que aprendo y lo que arreglo.',
	// Cambia esto cuando cambie lo que buscas: es lo único "temporal" de la web.
	ahora: 'Buscando mi primer puesto en soporte IT / helpdesk · Girona, Barcelona o remoto',
	disponible: true,
};

export const LINKS = {
	email: 'me@kcurtet.com',
	github: 'https://github.com/kcurtet',
	linkedin: 'https://www.linkedin.com/in/kcurtet/',
	nutux: 'https://nutuxlabs.com',
	cv: '/cv/kevin-curtet-soporte-it.pdf',
};

export const NAV = [
	{ href: '/proyectos/', label: 'Proyectos' },
	{ href: '/blog/', label: 'Blog' },
	{ href: '/cursos/', label: 'Cursos' },
	{ href: '/notas/', label: 'Notas' },
	{ href: '/sobre-mi/', label: 'Sobre mí' },
];

// Libros-curso publicados en /cursos/. El slug coincide con data.curso de la colección
// y con el directorio en src/content/cursos/.
export const CURSOS = [
	{
		slug: 'active-directory',
		title: 'Active Directory para Soporte N1',
		description:
			'De Linux a Helpdesk Windows: un curso en libro para cerrar el gap de AD, del primer join al troubleshooting L1.',
		orden: 1,
	},
	{
		slug: 'microsoft-365',
		title: 'Microsoft 365 para Soporte N1',
		description:
			'De Google Workspace y Active Directory al helpdesk corporativo: Exchange, Teams, Intune y el día a día del ticket M365.',
		orden: 2,
	},
	{
		slug: 'itil-ticketing',
		title: 'ITIL y Ticketing para Soporte N1',
		description:
			'Lectura intensiva de una tarde: el vocabulario, el método y las herramientas de una mesa de servicio real.',
		orden: 3,
	},
] as const;

export const fechaCorta = (d: Date) =>
	d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
