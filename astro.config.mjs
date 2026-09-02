// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
	site: 'https://aumesh.club',
	// /join/ came over from the old mkdocs site. The page itself was redundant
	// (every link on it lives on the homepage), but keep the URL working for
	// anyone following an old link or bookmark.
	redirects: {
		'/join': '/',
		// The encryption talk moved under /documentation/lectures/ when the other
		// lecture notes joined it. Keep the old URL working.
		'/documentation/encryption/encryption': '/documentation/lectures/encryption-algorithms/',
		// Events and workshops merged into one calendar. Both URLs were linked
		// from AUInvolve and Discord, so they keep working.
		'/events': '/calendar/',
		'/workshops': '/calendar/',
	},
	// Photos live in src/assets/ so Astro resizes them and emits a srcset;
	// the raw phone JPEGs are 3–4 MB each. Anything in public/ is served as-is.
	image: {
		layout: 'constrained',
		responsiveStyles: true,
	},
	vite: {
		plugins: [yaml()],
	},
	integrations: [
		starlight({
			title: 'AU Mesh',
			description:
				"Auburn University's student club for embedded systems, wireless, and mesh networking.",
			favicon: '/favicon.svg',
			logo: { src: './src/assets/au-white.svg', alt: 'Auburn University' },
			social: [
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/PmmSCSw7Dn' },
				{
					icon: 'instagram',
					label: 'Instagram',
					href: 'https://www.instagram.com/aumeshclub/',
				},
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/andrewsuggs465/au-mesh-website',
				},
			],
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
					},
				},
			],
			customCss: [
				'@fontsource-variable/outfit',
				'@fontsource-variable/jetbrains-mono',
				'./src/styles/custom.css',
			],
			components: {
				Header: './src/components/Header.astro',
				// Renders the `cover:` image on news posts. Every other page gets
				// Starlight's default title and nothing else.
				PageTitle: './src/components/PageTitle.astro',
				Footer: './src/components/Footer.astro',
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			editLink: {
				baseUrl: 'https://github.com/andrewsuggs465/au-mesh-website/edit/main/',
			},
			// Docs-only sidebar. Every page outside /documentation/ uses
			// `template: splash` (no sidebar) and is reached from the header nav,
			// so the sidebar never advertises the whole site.
			sidebar: [
				{ label: 'Overview', link: '/documentation/' },
				{
					label: 'Meshtastic',
					items: [{ autogenerate: { directory: 'documentation/meshtastic' } }],
				},
				{
					label: 'Lectures',
					items: [{ autogenerate: { directory: 'documentation/lectures' } }],
				},
			],
		}),
	],
});
