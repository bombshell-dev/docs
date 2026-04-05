export interface Env {}

const EXTRA_HEADERS: [string, string][] = [
	["Cross-Origin-Embedder-Policy", "require-corp"],
	["Cross-Origin-Opener-Policy", "same-origin"],
];

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith("/docs")) {
			const response = await fetch(new URL(url.pathname, "https://docs.bomb.sh/"));
			const headers = new Headers([...response.headers, ...EXTRA_HEADERS]);
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		}
		

		return fetch(url);
	},
} satisfies ExportedHandler<Env>;
