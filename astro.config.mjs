import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";

import ecTwoSlash from "expressive-code-twoslash";
import topics from "starlight-sidebar-topics";

const site = "https://bomb.sh/docs/";

// https://astro.build/config
export default defineConfig({
	site: "https://bomb.sh/",
	base: "/docs",
	outDir: "./dist/docs/",
	integrations: [
		starlight({
			title: "Bombshell",
			logo: {
				dark: "./src/assets/dark.svg",
				light: "./src/assets/light.svg",
			},
			customCss: [
				'./src/styles/tint.css'
			],
			components: {
				Head: "./src/starlightOverrides/Head.astro",
			},
			expressiveCode: {
				plugins: [ecTwoSlash()],
			},
			editLink: {
				baseUrl: "https://github.com/bombshell-dev/docs/edit/main/",
			},
			head: [
				{
					tag: "link",
					attrs: {
						rel: "stylesheet",
						href: "https://use.typekit.net/bst3mzh.css?v=5",
					},
				},
				{
					tag: "meta",
					attrs: {
						name: "og:image",
						content: `${site}og-docs.png`,
					},
				},
				{
					tag: "meta",
					attrs: {
						name: "twitter:image",
						content: `${site}og-docs.png`,
					},
				},
				{
					tag: "meta",
					attrs: {
						name: "twitter:site",
						content: "bombshell",
					},
				},
				{
					tag: "meta",
					attrs: {
						name: "twitter:creator",
						content: "bombshell",
					},
				},
			],
			social: [
				{ icon: 'discord', label: 'Discord', href: 'https://bomb.sh/chat' },
				{ icon: 'blueSky', label: 'Bluesky', href: 'https://bomb.sh/on/bluesky' },
				{ icon: 'github', label: 'GitHub', href: 'https://bomb.sh/on/github' },
			],
			plugins: [
				topics([
					{
						label: "Clack",
						id: "clack",
						icon: "seti:hex",
						link: "/clack/basics/getting-started",
						items: [
							{ label: "Basics", autogenerate: { directory: "clack/basics" } },
							{
								label: "Packages",
								autogenerate: { directory: "clack/packages" },
							},
							{ label: "Guides", autogenerate: { directory: "clack/guides" } },
						],
					},
					{
						label: "Args",
						id: "args",
						icon: "seti:shell",
						link: "/args/getting-started",
						items: [
							{ label: "Basics", link: "/args/getting-started" },
							{
								label: "API",
								link: "args/api",
							},
						],
					},
					{
						label: "Tab",
						id: "tab",
						icon: "right-caret",
						link: "/tab/",
						items: [],
					},
				]),
			],
		}),
	],
});
