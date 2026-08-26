import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		// `date` and `author` are used by news posts (src/content/docs/news/).
		// Every other page just leaves them out.
		schema: docsSchema({
			extend: z.object({
				date: z.coerce.date().optional(),
				author: z.string().optional(),
			}),
		}),
	}),
};
