import { test } from "node:test";
import assert from "node:assert/strict";
import { prefersMarkdown, toMarkdownPath } from "./negotiate.ts";

test("prefersMarkdown: no Accept header", () => {
	assert.equal(prefersMarkdown(null), false);
});

test("prefersMarkdown: typical browser Accept header", () => {
	assert.equal(
		prefersMarkdown(
			"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
		),
		false,
	);
});

test("prefersMarkdown: bare text/markdown", () => {
	assert.equal(prefersMarkdown("text/markdown"), true);
});

test("prefersMarkdown: markdown preferred over html", () => {
	assert.equal(prefersMarkdown("text/markdown,text/html;q=0.8"), true);
});

test("prefersMarkdown: markdown listed but html preferred", () => {
	assert.equal(prefersMarkdown("text/html,text/markdown;q=0.5"), false);
});

test("prefersMarkdown: markdown explicitly refused", () => {
	assert.equal(prefersMarkdown("text/markdown;q=0"), false);
});

test("prefersMarkdown: wildcard only is not markdown", () => {
	assert.equal(prefersMarkdown("*/*"), false);
});

test("toMarkdownPath: docs root", () => {
	assert.equal(toMarkdownPath("/docs"), "/docs/index.md");
	assert.equal(toMarkdownPath("/docs/"), "/docs/index.md");
});

test("toMarkdownPath: page route with trailing slash", () => {
	assert.equal(
		toMarkdownPath("/docs/clack/basics/getting-started/"),
		"/docs/clack/basics/getting-started/index.md",
	);
});

test("toMarkdownPath: page route without trailing slash", () => {
	assert.equal(
		toMarkdownPath("/docs/clack/basics/getting-started"),
		"/docs/clack/basics/getting-started/index.md",
	);
});

test("toMarkdownPath: explicit .md request maps to index.md twin", () => {
	assert.equal(toMarkdownPath("/docs/args/api.md"), "/docs/args/api/index.md");
});

test("toMarkdownPath: already an index.md path is unchanged", () => {
	assert.equal(
		toMarkdownPath("/docs/tty/api/index.md"),
		"/docs/tty/api/index.md",
	);
});

test("toMarkdownPath: assets and files with extensions are ignored", () => {
	assert.equal(toMarkdownPath("/docs/_astro/hoisted.BQ1yu2o0.js"), null);
	assert.equal(toMarkdownPath("/docs/favicon.svg"), null);
	assert.equal(toMarkdownPath("/docs/docs-index.json"), null);
	assert.equal(toMarkdownPath("/docs/og-docs.png"), null);
	assert.equal(toMarkdownPath("/docs/404.html"), null);
});
