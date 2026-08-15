import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "./app.ts";

/** App with a scripted upstream; unmatched paths 404 like the assets Worker. */
function appWith(handler: (url: URL) => Response | undefined) {
	const calls: URL[] = [];
	const app = createApp({
		upstream: async (url) => {
			calls.push(url);
			return handler(url) ?? new Response("not found", { status: 404 });
		},
		passthrough: async (request) =>
			new Response(`passthrough:${request.url}`),
	});
	return { app, calls };
}

const html = () =>
	new Response("<html>page</html>", {
		status: 200,
		headers: { "Content-Type": "text/html" },
	});

const markdown = () =>
	new Response("# Page\n", {
		status: 200,
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});

test("redirects bare project roots to their landing page", async () => {
	const { app } = appWith(() => undefined);
	const res = await app.request("https://bomb.sh/docs/clack", {
		headers: { Accept: "text/markdown" },
	});
	assert.equal(res.status, 308);
	assert.equal(
		res.headers.get("Location"),
		"https://bomb.sh/docs/clack/basics/getting-started/",
	);
});

test("serves the markdown twin on Accept: text/markdown", async () => {
	const { app, calls } = appWith((url) =>
		url.pathname === "/docs/args/api/index.md" ? markdown() : undefined,
	);
	const res = await app.request("https://bomb.sh/docs/args/api/", {
		headers: { Accept: "text/markdown" },
	});
	assert.equal(res.status, 200);
	assert.equal(calls[0].href, "https://docs.bomb.sh/docs/args/api/index.md");
	assert.match(res.headers.get("Content-Type") ?? "", /text\/markdown/);
	assert.equal(res.headers.get("Vary"), "Accept");
	assert.equal(
		res.headers.get("Link"),
		'<https://bomb.sh/docs/args/api/>; rel="canonical"',
	);
	assert.equal(await res.text(), "# Page\n");
});

test("serves markdown for explicit .md paths without an Accept header", async () => {
	const { app, calls } = appWith((url) =>
		url.pathname === "/docs/args/api/index.md" ? markdown() : undefined,
	);
	const res = await app.request("https://bomb.sh/docs/args/api.md");
	assert.equal(res.status, 200);
	assert.equal(calls[0].href, "https://docs.bomb.sh/docs/args/api/index.md");
});

test("negotiates the docs root to the markdown index", async () => {
	const { app, calls } = appWith((url) =>
		url.pathname === "/docs/index.md" ? markdown() : undefined,
	);
	const res = await app.request("https://bomb.sh/docs", {
		headers: { Accept: "text/markdown" },
	});
	assert.equal(res.status, 200);
	assert.equal(calls[0].href, "https://docs.bomb.sh/docs/index.md");
});

test("returns markdown 404 guidance when the twin is missing", async () => {
	const { app } = appWith(() => undefined);
	const res = await app.request("https://bomb.sh/docs/nope/", {
		headers: { Accept: "text/markdown" },
	});
	assert.equal(res.status, 404);
	assert.match(res.headers.get("Content-Type") ?? "", /text\/markdown/);
	assert.match(await res.text(), /https:\/\/bomb\.sh\/docs\/index\.md/);
});

test("proxies HTML with security headers and a markdown alternate link", async () => {
	const { app } = appWith((url) =>
		url.pathname === "/docs/args/api/" ? html() : undefined,
	);
	const res = await app.request("https://bomb.sh/docs/args/api/");
	assert.equal(res.status, 200);
	assert.equal(
		res.headers.get("Cross-Origin-Embedder-Policy"),
		"require-corp",
	);
	assert.equal(
		res.headers.get("Link"),
		'<https://bomb.sh/docs/args/api/index.md>; rel="alternate"; type="text/markdown"',
	);
	assert.equal(await res.text(), "<html>page</html>");
});

test("maps missing pages to the Starlight 404 page with status 404", async () => {
	const { app } = appWith((url) =>
		url.pathname === "/docs/404.html"
			? new Response("<html>404</html>", {
					status: 200,
					headers: { "Content-Type": "text/html" },
				})
			: undefined,
	);
	const res = await app.request("https://bomb.sh/docs/missing/");
	assert.equal(res.status, 404);
	assert.equal(await res.text(), "<html>404</html>");
});

test("does not negotiate asset paths", async () => {
	const { app, calls } = appWith(() => html());
	await app.request("https://bomb.sh/docs/og-docs.png", {
		headers: { Accept: "text/markdown" },
	});
	assert.equal(calls[0].href, "https://docs.bomb.sh/docs/og-docs.png");
});

test("passes non-docs requests through untouched", async () => {
	const { app, calls } = appWith(() => undefined);
	const res = await app.request("https://bomb.sh/other");
	assert.equal(await res.text(), "passthrough:https://bomb.sh/other");
	assert.equal(calls.length, 0);
});
