export interface Env { }

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
			return `https://${slug}-bombshell-docs.${zone}`;
		}
	}
	return "https://docs.bomb.sh";
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/docs")) {
			const origin = docsOrigin(url.host);
			let response = await fetch(new URL(url.pathname, origin));

			// Special case for Starlight's 404 page
			let status = response.status;
			if (status === 404)
				response = await fetch(new URL("/docs/404.html", origin))

			const headers = new Headers(response.headers);
			headers.set("Cross-Origin-Embedder-Policy", "require-corp");
			headers.set("Cross-Origin-Opener-Policy", "same-origin");
			headers.set("Cross-Origin-Resource-Policy", "cross-origin");
			headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

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
