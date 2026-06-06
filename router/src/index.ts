export interface Env { }

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/docs")) {
			let response = await fetch(new URL(url.pathname, "https://docs.bomb.sh/"));

			// Special case for Starlight's 404 page
			let status = response.status;
			if (status === 404)
				response = await fetch(new URL("/docs/404.html", "https://docs.bomb.sh/"))

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
