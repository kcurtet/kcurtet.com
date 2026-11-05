import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog: lo que estoy aprendiendo, en series y posts largos.
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		fecha: z.coerce.date(),
		actualizado: z.coerce.date().optional(),
		serie: z.string().optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

// Proyectos: casos con problema → qué monté → qué aprendí.
const proyectos = defineCollection({
	loader: glob({ base: './src/content/proyectos', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		resumen: z.string(),
		stack: z.array(z.string()).default([]),
		repo: z.url().optional(),
		orden: z.number().default(99),
		draft: z.boolean().default(false),
	}),
});

// Cursos: libros-curso por capítulos (README del libro = capítulo 0, "Introducción").
// Solo en español: no hay versión fr/ del contenido.
const cursos = defineCollection({
	loader: glob({ base: './src/content/cursos', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		curso: z.enum(['active-directory', 'microsoft-365', 'itil-ticketing']),
		capitulo: z.number(),
		orden: z.number(),
		draft: z.boolean().default(false),
	}),
});

// Notas: troubleshooting corto, síntoma → diagnóstico → causa → solución.
const notas = defineCollection({
	loader: glob({ base: './src/content/notas', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		categoria: z.enum(['Redes', 'Linux', 'Windows', 'Active Directory', 'Correo', 'Seguridad']),
		sintoma: z.string(),
		fecha: z.coerce.date(),
		draft: z.boolean().default(false),
	}),
});

export const collections = { blog, proyectos, notas, cursos };
