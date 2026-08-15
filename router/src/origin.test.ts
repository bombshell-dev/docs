import { test } from "node:test";
import assert from "node:assert/strict";
import { docsOrigin } from "./origin.ts";

test("falls back to production for plain hosts", () => {
	assert.equal(docsOrigin("bomb.sh"), "https://docs.bomb.sh/");
	assert.equal(docsOrigin("localhost:8787"), "https://docs.bomb.sh/");
});

test("maps branch preview router hosts to matching docs previews", () => {
	assert.equal(
		docsOrigin("fix-404-bombsh-docs-router.foo.workers.dev"),
		"https://fix-404-bombshell-docs.foo.workers.dev/",
	);
});

test("per-version preview ids fall back to production", () => {
	assert.equal(
		docsOrigin("abcd1234-bombsh-docs-router.foo.workers.dev"),
		"https://docs.bomb.sh/",
	);
});
