import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		// `date`, `author`, and `cover` are used by news posts
		// (src/content/docs/news/). Every other page just leaves them out.
		// `image()` resolves the path to an optimised asset, so a cover has to
		// live in src/assets/ rather than public/.
		schema: docsSchema({
			extend: ({ image }) =>
				z.object({
					date: z.coerce.date().optional(),
					author: z.string().optional(),
					cover: image().optional(),
					coverAlt: z.string().optional(),
				}),
		}),
	}),
};
