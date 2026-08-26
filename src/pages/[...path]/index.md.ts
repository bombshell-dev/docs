/**
 * Markdown twin for every doc page at `/{slug}/index.md`, for agents.
 * The root index and 404 are handled separately (`/index.md` is a
 * sitemap-style index; 404 has no markdown twin).
 */
import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { mdxToMarkdown } from "../../lib/mdx-to-markdown";

const BASE_URL = "https://bomb.sh/docs";

export async function getStaticPaths() {
	const docs = await getCollection("docs");
	return docs
		.filter((doc) => doc.id !== "index" && doc.id !== "404")
		.map((doc) => ({ params: { path: doc.id }, props: { doc } }));
}

export const GET: APIRoute<{ doc: CollectionEntry<"docs"> }> = ({ props }) => {
	const { doc } = props;
	const frontmatter = [
		"---",
		`title: ${JSON.stringify(doc.data.title)}`,
		doc.data.description &&
			`description: ${JSON.stringify(doc.data.description)}`,
		`canonical: ${BASE_URL}/${doc.id}/`,
		"---",
	]
		.filter(Boolean)
		.join("\n");

	const body = mdxToMarkdown(doc.body ?? "");
	return new Response(`${frontmatter}\n\n# ${doc.data.title}\n\n${body}`, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};
