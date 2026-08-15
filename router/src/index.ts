import { prefersMarkdown, toMarkdownPath } from "./negotiate";

export interface Env { }

// Public origin used in Link headers (canonical/alternate) so agents always
// discover the proxied bomb.sh URLs, never the internal workers.dev ones.
const SITE = "https://bomb.sh";

const MARKDOWN_404 = `# 404: Not Found

This page does not exist. An index of all Bombshell documentation is
available at ${SITE}/docs/index.md
`;

// Where to proxy docs requests. In production this is the live site. On
// Cloudflare branch previews both Workers share the same branch slug
// (e.g. `fix-404-bombsh-docs-router` ↔ `fix-404-bombshell-docs`), so we point
// the router at the matching docs preview by rewriting our own hostname.
// Per-version previews use an 8-char hex id that differs per Worker and can't
// be mapped, so those fall back to production.
function docsOrigin(host: string): string {
	const match = host.match(/^(.+)-bombsh-docs-router\.(.+\.workers\.dev)$/);
	if (match) {
		const [, slug, zone] = match;
		if (!/^[0-9a-f]{8}$/.test(slug)) {
			return `https://${slug}-bombshell-docs.${zone}/`;
		}
	}
	return "https://docs.bomb.sh/";
}

// Bare project roots don't have their own index page and should redirect to
// their actual landing page instead of 404ing.
const PROJECT_LANDING_PAGES: Record<string, string> = {
	clack: "/docs/clack/basics/getting-started/",
	tab: "/docs/tab/",
	args: "/docs/args/getting-started/",
	tty: "/docs/tty/basics/getting-started/",
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const projectMatch = url.pathname.match(/^\/docs\/([^/]+)\/?$/);
		if (projectMatch) {
			const landingPage = PROJECT_LANDING_PAGES[projectMatch[1]];
			if (landingPage && url.pathname !== landingPage) {
				return Response.redirect(new URL(landingPage, url).toString(), 308);
			}
		}

		if (url.pathname.startsWith("/docs")) {
			const origin = docsOrigin(url.host);

			// Agent-facing markdown: explicit `.md` paths always serve markdown;
			// extensionless page routes negotiate on `Accept: text/markdown`.
			// Negotiation rewrites to a distinct origin URL, so HTML and markdown
			// variants get distinct cache keys — Cloudflare's cache ignores `Vary`.
			const markdownPath = toMarkdownPath(url.pathname);
			const wantsMarkdown =
				markdownPath !== null &&
				(url.pathname.endsWith(".md") ||
					prefersMarkdown(request.headers.get("Accept")));

			if (wantsMarkdown && markdownPath) {
				const response = await fetch(new URL(markdownPath, origin));
				if (response.status === 404) {
					return new Response(MARKDOWN_404, {
						status: 404,
						headers: {
							"Content-Type": "text/markdown; charset=utf-8",
							"Vary": "Accept",
						},
					});
				}
				const headers = new Headers(response.headers);
				headers.set("Content-Type", "text/markdown; charset=utf-8");
				headers.set("Vary", "Accept");
				const htmlPath = markdownPath.slice(0, -"index.md".length);
				headers.set("Link", `<${SITE}${htmlPath}>; rel="canonical"`);
				return new Response(response.body, {
					status: response.status,
					headers,
				});
			}

			let response = await fetch(new URL(url.pathname, docsOrigin(url.host)));
			console.log({ from: url, to: new URL(url.pathname, docsOrigin(url.host)) });


			// Special case for Starlight's 404 page
			let status = response.status;
			if (status === 404) {
				response = await fetch(new URL("/docs/404.html", origin))
			}

			const headers = new Headers(response.headers);
			headers.set("Cross-Origin-Embedder-Policy", "require-corp");
			headers.set("Cross-Origin-Opener-Policy", "same-origin");
			headers.set("Cross-Origin-Resource-Policy", "cross-origin");
			headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

			// Advertise the markdown twin to agents crawling the HTML variant.
			if (markdownPath && status === 200) {
				headers.set(
					"Link",
					`<${SITE}${markdownPath}>; rel="alternate"; type="text/markdown"`,
				);
			}

			// If we got 404, return the HTML, but set status to 404 manually,
			// because the response status would be 200
			return new Response(response.body, {
				status: status,
				statusText: status === 404 ? "Not Found" : response.statusText,
				headers,
			});
		}

		return fetch(request);
	},
} satisfies ExportedHandler<Env>;
