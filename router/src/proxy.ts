import type { Handler } from "hono";
import { toMarkdownPath } from "./negotiate.ts";
import { docsOrigin } from "./origin.ts";
import { SITE } from "./config.ts";
import type { Upstream } from "./upstream.ts";

const SECURITY_HEADERS = {
	"Cross-Origin-Embedder-Policy": "require-corp",
	"Cross-Origin-Opener-Policy": "same-origin",
	"Cross-Origin-Resource-Policy": "cross-origin",
	"Referrer-Policy": "strict-origin-when-cross-origin",
} as const;

export function docsProxy(upstream: Upstream): Handler {
	return async (c) => {
		const url = new URL(c.req.url);
		const origin = docsOrigin(url.host);
		let response = await upstream(new URL(url.pathname, origin));

		// Starlight serves its 404 page at a fixed path with status 200;
		// re-serve it under the requested URL with the right status.
		const status = response.status;
		if (status === 404) {
			response = await upstream(new URL("/docs/404.html", origin));
		}

		const headers = new Headers(response.headers);
		for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
			headers.set(name, value);
		}

		// Advertise the markdown twin to agents crawling the HTML variant.
		const markdownPath = toMarkdownPath(url.pathname);
		if (markdownPath && status === 200) {
			headers.set(
				"Link",
				`<${SITE}${markdownPath}>; rel="alternate"; type="text/markdown"`,
			);
		}

		return new Response(response.body, {
			status,
			statusText: status === 404 ? "Not Found" : response.statusText,
			headers,
		});
	};
}
