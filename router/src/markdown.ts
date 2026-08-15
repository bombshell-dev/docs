import type { MiddlewareHandler } from "hono";
import { prefersMarkdown, toMarkdownPath } from "./negotiate.ts";
import { docsOrigin } from "./origin.ts";
import { SITE } from "./config.ts";
import type { Upstream } from "./upstream.ts";

export const MARKDOWN_404 = `# 404: Not Found

This page does not exist. An index of all Bombshell documentation is
available at ${SITE}/docs/index.md
`;

// Agent-facing markdown: explicit `.md` paths always serve markdown;
// extensionless page routes negotiate on `Accept: text/markdown`.
// Negotiation rewrites to a distinct origin URL, so HTML and markdown
// variants get distinct cache keys — Cloudflare's cache ignores `Vary`.
export function markdownNegotiation(upstream: Upstream): MiddlewareHandler {
	return async (c, next) => {
		const url = new URL(c.req.url);
		const markdownPath = toMarkdownPath(url.pathname);
		const wantsMarkdown =
			markdownPath !== null &&
			(url.pathname.endsWith(".md") ||
				prefersMarkdown(c.req.header("Accept") ?? null));
		if (!wantsMarkdown || !markdownPath) return next();

		const response = await upstream(
			new URL(markdownPath, docsOrigin(url.host)),
		);
		if (response.status === 404) {
			return new Response(MARKDOWN_404, {
				status: 404,
				headers: {
					"Content-Type": "text/markdown; charset=utf-8",
					Vary: "Accept",
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
	};
}
