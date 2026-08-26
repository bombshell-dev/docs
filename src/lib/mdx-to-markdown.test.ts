import { test } from "node:test";
import assert from "node:assert/strict";
import { mdxToMarkdown } from "./mdx-to-markdown.ts";

test("strips import statements", () => {
	const out = mdxToMarkdown(
		"import { Tabs, TabItem } from '@astrojs/starlight/components';\n\n# Hello\n\nSome text.\n",
	);
	assert.ok(!out.includes("import"), `import leaked into output:\n${out}`);
	assert.ok(out.includes("# Hello"));
	assert.ok(out.includes("Some text."));
});

test("unwraps Tabs/TabItem with bold labels, preserving code fences", () => {
	const out = mdxToMarkdown(
		[
			"<Tabs>",
			'<TabItem label="npm">',
			"```sh",
			"npm install @clack/prompts",
			"```",
			"</TabItem>",
			'<TabItem label="pnpm">',
			"```sh",
			"pnpm add @clack/prompts",
			"```",
			"</TabItem>",
			"</Tabs>",
		].join("\n"),
	);
	assert.ok(!out.includes("<Tabs"), `JSX leaked:\n${out}`);
	assert.ok(!out.includes("<TabItem"), `JSX leaked:\n${out}`);
	assert.ok(out.includes("**npm**"));
	assert.ok(out.includes("**pnpm**"));
	assert.ok(out.includes("npm install @clack/prompts"));
	assert.ok(out.includes("pnpm add @clack/prompts"));
	assert.ok(out.includes("```sh"), `fences lost:\n${out}`);
});

test("converts Aside to a labelled blockquote", () => {
	const out = mdxToMarkdown(
		'<Aside type="caution">\nDo not do the thing.\n</Aside>\n',
	);
	assert.ok(!out.includes("<Aside"), `JSX leaked:\n${out}`);
	assert.ok(out.includes("> **Caution:**"), `missing label:\n${out}`);
	assert.ok(out.includes("Do not do the thing."));
});

test("Aside with custom title uses the title", () => {
	const out = mdxToMarkdown(
		'<Aside type="tip" title="Pro tip">\nUse the thing.\n</Aside>\n',
	);
	assert.ok(out.includes("> **Pro tip:**"), `missing title:\n${out}`);
});

test("plain markdown passes through, including tables", () => {
	const src = [
		"# Title",
		"",
		"| a | b |",
		"| - | - |",
		"| 1 | 2 |",
		"",
		"Text with `code`.",
		"",
	].join("\n");
	const out = mdxToMarkdown(src);
	assert.ok(out.includes("| a | b |"), `table mangled:\n${out}`);
	assert.ok(out.includes("Text with `code`."));
});

test("drops JSX expressions and unwraps unknown components", () => {
	const out = mdxToMarkdown(
		'export const x = 1;\n\n<Card title="Neat">\n\nInner *content* here.\n\n</Card>\n\nValue: {x}\n',
	);
	assert.ok(!out.includes("export const"), `export leaked:\n${out}`);
	assert.ok(!out.includes("<Card"), `JSX leaked:\n${out}`);
	assert.ok(out.includes("**Neat**"), `card title lost:\n${out}`);
	assert.ok(out.includes("Inner *content* here."));
	assert.ok(!out.includes("{x}"), `expression leaked:\n${out}`);
});

test("strips twoslash directives from code fences", () => {
	const out = mdxToMarkdown(
		[
			"```ts twoslash",
			"// @errors: 2339 18048",
			"import { text } from '@clack/prompts';",
			"",
			"const name = await text({ message: 'Name?' });",
			"```",
		].join("\n"),
	);
	assert.ok(!out.includes("@errors"), `directive leaked:\n${out}`);
	assert.ok(!out.includes("twoslash"), `twoslash meta leaked:\n${out}`);
	assert.ok(out.includes("```ts\n"), `language lost:\n${out}`);
	assert.ok(out.includes("import { text } from '@clack/prompts';"));
});

test("LinkButton with flow children still extracts the link text", () => {
	const out = mdxToMarkdown(
		'<LinkButton href="/docs/clack/">\n\nGet started\n\n</LinkButton>\n',
	);
	assert.ok(out.includes("[Get started](/docs/clack/)"), `title lost:\n${out}`);
});

test("LinkCard uses the title attribute", () => {
	const out = mdxToMarkdown(
		'<LinkCard title="Prompts" href="/docs/clack/packages/prompts/" />\n',
	);
	assert.ok(out.includes("[Prompts](/docs/clack/packages/prompts/)"), out);
});
