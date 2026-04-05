export interface Env {}

const HEADERS = {
	"Cross-Origin-Embedder-Policy": "require-corp",
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "cross-origin"
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/docs")) {
			const response = await fetch(new URL(url.pathname, "https://docs.bomb.sh/"));
			const headers = new Headers(response.headers);
			for (const [name, value] of Object.entries(HEADERS)) {
				headers.set(name, value);
			}
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		}

		return Response.redirect(`https://bomb.sh/docs${url.pathname}`, 301);
	},
} satisfies ExportedHandler<Env>;
