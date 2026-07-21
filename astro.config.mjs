// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import yaml from '@rollup/plugin-yaml';

// https://astro.build/config
export default defineConfig({
	site: 'https://aumesh.club',
	vite: {
		plugins: [yaml()],
	},
	integrations: [
		starlight({
			title: 'AU Mesh',
			description:
				"Auburn University's student club for embedded systems, wireless, and mesh networking.",
			favicon: '/favicon.svg',
			logo: { src: './src/assets/au.svg', alt: 'Auburn University' },
			social: [
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/PmmSCSw7Dn' },
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/andrewsuggs465/AU-Mesh-Club',
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
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			editLink: {
				baseUrl: 'https://github.com/andrewsuggs465/AU-Mesh-Club/edit/main/',
			},
			sidebar: [
				{
					label: 'Club',
					items: [
						{ label: 'Home', link: '/' },
						{ label: 'Events', link: '/events/' },
						{ label: 'Workshops', link: '/workshops/' },
						{ label: 'Join', link: '/join/' },
						{ label: 'Project Hub', link: '/projects/' },
						{ label: 'Resources', link: '/resources/' },
					],
				},
				{
					label: 'Documentation',
					items: [
						{ label: 'Overview', link: '/documentation/' },
						{
							label: 'Meshtastic',
							items: [{ autogenerate: { directory: 'documentation/meshtastic' } }],
						},
						{ label: 'Encryption', link: '/documentation/encryption/encryption/' },
					],
				},
			],
		}),
	],
});
