/**
 * Walks `src/content/docs` and emits `public/docs-index.json`, a
 * machine-readable page index for offline search and local agent tooling.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('../', import.meta.url));
const docsDir = path.join(rootDir, 'src/content/docs');
const BASE_URL = 'https://bomb.sh/docs';

interface DocPage {
	slug: string;
	title: string;
	description: string;
	url: string;
	markdownUrl: string;
	template?: string;
}

function stripQuotes(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}
	return value;
}

function parseFrontmatter(content: string): Record<string, string> {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};

	const result: Record<string, string> = {};
	for (const line of match[1].split('\n')) {
		const kv = line.match(/^([\w-]+):\s*(.+)$/);
		if (!kv) continue;
		result[kv[1]] = stripQuotes(kv[2].trim());
	}
	return result;
}

function filePathToSlug(relativePath: string): string {
	const withoutExt = relativePath.replace(/\.mdx?$/, '');
	if (withoutExt === 'index') return '';
	if (withoutExt.endsWith('/index')) {
		return withoutExt.slice(0, -'/index'.length);
	}
	return withoutExt;
}

function pageUrl(slug: string): string {
	return slug ? `${BASE_URL}/${slug}/` : `${BASE_URL}/`;
}

function markdownUrl(slug: string): string {
	return slug ? `${BASE_URL}/${slug}/index.md` : `${BASE_URL}/index.md`;
}

async function walkDocs(dir: string, base = ''): Promise<DocPage[]> {
	const pages: DocPage[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
		const rel = base ? `${base}/${entry.name}` : entry.name;

		if (entry.isDirectory()) {
			pages.push(...(await walkDocs(path.join(dir, entry.name), rel)));
			continue;
		}

		if (!entry.name.endsWith('.mdx') && !entry.name.endsWith('.md')) {
			continue;
		}

		const content = await fs.readFile(path.join(dir, entry.name), 'utf8');
		const frontmatter = parseFrontmatter(content);
		const slug = filePathToSlug(rel);

		pages.push({
			slug,
			title: frontmatter.title ?? (slug || 'Untitled'),
			description: frontmatter.description ?? '',
			url: pageUrl(slug),
			markdownUrl: markdownUrl(slug),
			template: frontmatter.template,
		});
	}

	return pages;
}

function isIndexed(page: DocPage): boolean {
	if (page.slug === '404') return false;
	if (page.template === 'splash' && page.slug !== '') return false;
	return true;
}

async function main() {
	const pages = await walkDocs(docsDir);
	const indexed = pages.filter(isIndexed);

	await fs.writeFile(
		path.join(rootDir, 'public/docs-index.json'),
		`${JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				baseUrl: BASE_URL,
				pages: indexed,
			},
			null,
			2,
		)}\n`,
	);
	console.log(`Generated docs index with ${indexed.length} pages`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
