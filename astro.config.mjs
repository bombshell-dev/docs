// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ecTwoSlash from "expressive-code-twoslash";
import topics from "starlight-sidebar-topics";
import starlightMarkdown from "starlight-markdown";
import mermaid from "astro-mermaid";
import { fileURLToPath } from "node:url";
import { ecThemes } from "./src/ec-themes.mjs";

/** Pick a value per code theme; keeps styleOverrides below readable. */
const byTheme = (dark, light) => ({ theme }) =>
	theme.type === "dark" ? dark : light;

const docsRoot = fileURLToPath(new URL(".", import.meta.url));

const site = "https://bomb.sh/docs/";

// https://astro.build/config
export default defineConfig({
	site: "https://bomb.sh/",
	base: "/docs",
	outDir: "./dist/docs/",
	server: {
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Resource-Policy': 'cross-origin',
			'Referrer-Policy': 'strict-origin-when-cross-origin'
		}
	},
	integrations: [
		mermaid({ autoTheme: true }),
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
				Header: "./src/starlightOverrides/Header.astro",
				SiteTitle: "./src/starlightOverrides/SiteTitle.astro",
				Footer: "./src/starlightOverrides/Footer.astro",
				MarkdownContent: "./src/starlightOverrides/MarkdownContent.astro",
				MobileMenuFooter: "./src/starlightOverrides/MobileMenuFooter.astro",
			},
			expressiveCode: {
				themes: ecThemes,
				styleOverrides: {
					codeFontFamily: '"dm-mono", ui-monospace, monospace',
					uiFontFamily: '"dm-mono", ui-monospace, monospace',
					borderRadius: "4px",
					borderWidth: "1px",
					borderColor: byTheme("#2b2e38", "#c4c7cf"),
					codeBackground: byTheme("#000000", "#ffffff"),
					frames: {
						shadowColor: "transparent",
						frameBoxShadowCssValue: "none",
						terminalBackground: byTheme("#000000", "#ffffff"),
						terminalTitlebarBackground: "transparent",
						terminalTitlebarBorderBottomColor: "transparent",
						terminalTitlebarForeground: byTheme("#8a8e9b", "#6c6e79"),
						terminalTitlebarDotsForeground: byTheme("#484a54", "#c4c7cf"),
						editorTabBarBackground: "transparent",
						editorTabBarBorderColor: "transparent",
						editorTabBarBorderBottomColor: "transparent",
						editorActiveTabBackground: "transparent",
						editorActiveTabForeground: byTheme("#f4f5f9", "#0a0a0d"),
						editorActiveTabBorderColor: "transparent",
						editorActiveTabIndicatorTopColor: byTheme("#ff00d2", "#b8009c"),
						editorActiveTabIndicatorBottomColor: "transparent",
					},
					twoSlash: {
						cursorColor: "#ff00d2",
						borderColor: byTheme("#2b2e38", "#c4c7cf"),
						background: byTheme("#191b23", "#ffffff"),
						textColor: byTheme("#f4f5f9", "#0a0a0d"),
						hoverUnderlineColor: byTheme("#8a8e9b", "#a9abb6"),
						tagColor: byTheme("#00e5ff", "#00798a"),
						linkColor: byTheme("#00e5ff", "#00798a"),
						linkColorHover: byTheme("#ffffff", "#0a0a0d"),
						errorColor: byTheme("#ff3e47", "#d21f28"),
						warnColor: byTheme("#e8cf27", "#a37e00"),
						suggestionColor: byTheme("#07f53f", "#00842e"),
						messageColor: byTheme("#c4c7cf", "#484a54"),
						completionBoxBackground: byTheme("#191b23", "#ffffff"),
						completionBoxBorder: byTheme("#2b2e38", "#c4c7cf"),
						completionBoxColor: byTheme("#f4f5f9", "#0a0a0d"),
						completionBoxMatchedColor: byTheme("#00e5ff", "#00798a"),
						completionBoxHoverBackground: byTheme("#2b2e38", "#f4f5f9"),
						highlightHue: "311",
					},
				},
				plugins: [ecTwoSlash({
					twoslashOptions: {
						compilerOptions: {
							module: 99,
							moduleResolution: 100,
							baseUrl: docsRoot,
							paths: {
								"@bomb.sh/tty": ["node_modules/@bomb.sh/tty/esm/mod.d.ts"],
							},
						},
					},
				})],
			},
			editLink: {
				baseUrl: "https://github.com/bombshell-dev/docs/edit/main/",
			},
			head: [
				{
					tag: "link",
					attrs: {
						rel: "stylesheet",
						href: "https://use.typekit.net/bst3mzh.css?v=7",
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
				starlightMarkdown(),
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
					{
						label: "TTY",
						id: "tty",
						icon: "seti:config",
						link: "/tty/basics/getting-started",
						items: [
							{ label: "Basics", autogenerate: { directory: "tty/basics" } },
							{ label: "Guides", autogenerate: { directory: "tty/guides" } },
							{
								label: "API",
								items: [
									{ label: "Overview", link: "/tty/api/" },
									{ label: "Ops", link: "/tty/api/ops" },
									{ label: "Term", link: "/tty/api/term" },
									{ label: "Input", link: "/tty/api/input" },
									{ label: "Settings", link: "/tty/api/settings" },
									{ label: "Termcodes", link: "/tty/api/termcodes" },
								],
							},
						],
					},
				]),
			],
		}),
	],
});
