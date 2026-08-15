/**
 * Sitemap-style markdown index at `/docs/index.md` — the entry point agents
 * land on via content negotiation. Purely descriptive: titles, descriptions,
 * and markdown URLs, grouped by topic.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const BASE_URL = "https://bomb.sh/docs";

const SECTION_LABELS: Record<string, string> = {
	clack: "Clack — prompts",
	args: "Args — argument parsing",
	tab: "Tab — autocomplete",
	tty: "TTY — layout & rendering",
};

export const GET: APIRoute = async () => {
	const docs = await getCollection("docs");

	const sections = new Map<string, { title: string; description: string; url: string }[]>();
	for (const doc of docs) {
		if (doc.id === "index" || doc.id === "404") continue;
		const section = doc.id.split("/")[0];
		if (!sections.has(section)) sections.set(section, []);
		sections.get(section)!.push({
			title: doc.data.title,
			description: doc.data.description ?? "",
			url: `${BASE_URL}/${doc.id}/index.md`,
		});
	}

	const lines = [
		"---",
		'title: "Bombshell Documentation"',
		`canonical: ${BASE_URL}/`,
		"---",
		"",
		"# Bombshell Documentation",
		"",
		"> Effortlessly build beautiful command-line apps. Documentation for",
		"> Clack, Args, Tab, and TTY — an ecosystem of terminal primitives for",
		"> Node.js CLIs and TUIs.",
		"",
		`Every page is available as markdown at \`{page}/index.md\`, or by`,
		`requesting any page URL with \`Accept: text/markdown\`.`,
		"",
	];

	for (const [section, pages] of [...sections.entries()].sort()) {
		lines.push(`## ${SECTION_LABELS[section] ?? section}`, "");
		for (const page of pages.sort((a, b) => a.url.localeCompare(b.url))) {
			const suffix = page.description ? `: ${page.description}` : "";
			lines.push(`- [${page.title}](${page.url})${suffix}`);
		}
		lines.push("");
	}

	return new Response(`${lines.join("\n").trimEnd()}\n`, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};
