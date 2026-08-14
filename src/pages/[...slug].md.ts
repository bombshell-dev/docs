// STATUS: WIP / deferred. Emits a clean-ish markdown twin per docs page, but
// the line-based transform below does NOT dedent content nested inside MDX
// components (<Tabs>/<TabItem>/<Aside>), so those code fences come out indented
// and render as literal text. Fix: rewrite mdxToMarkdown() on a remark-mdx AST
// (unwrap component nodes, re-emit markdown — indentation-correct). Also still
// TODO: wire negotiation in router/src/index.ts (Accept: text/markdown -> .md).
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

const SITE = "https://bomb.sh";

// Pages with no meaningful prose body (splash/hero, error page).
const SKIP = new Set(["", "index", "404"]);

/**
 * Convert an `.mdx` source body to clean markdown for agents, without
 * corrupting code. Fenced code blocks are passed through verbatim (so
 * TypeScript generics like `Prompt<Option>` and keypress hints like `<TAB>`
 * survive); only prose outside code is cleaned.
 */
function mdxToMarkdown(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let fence: string | null = null;
  let skipImportUntilBrace = false;

  for (const line of lines) {
    const trimmed = line.trimStart();

    // Track fenced code blocks (``` or ~~~) and pass their contents through.
    const fenceMatch = trimmed.match(/^(```|~~~)/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (fence === null) fence = marker;
      else if (trimmed.startsWith(fence)) fence = null;
      out.push(line);
      continue;
    }
    if (fence !== null) {
      out.push(line);
      continue;
    }

    // Drop ESM import/export statements, including multi-line `import { ... }`.
    if (skipImportUntilBrace) {
      if (trimmed.includes("}")) skipImportUntilBrace = false;
      continue;
    }
    if (/^(import|export)\b/.test(trimmed)) {
      if (trimmed.startsWith("import {") && !trimmed.includes("}")) {
        skipImportUntilBrace = true;
      }
      continue;
    }

    let l = line;
    // Preserve the tab label so install snippets stay labelled (npm/pnpm/yarn).
    l = l.replace(
      /<TabItem\s+[^>]*label=["']([^"']+)["'][^>]*>/g,
      "\n**$1**\n",
    );
    // Drop the known Starlight/custom component wrappers, keeping inner content.
    l = l.replace(
      /<\/?(Tabs|TabItem|Card|CardGrid|LinkButton|Aside|WebContainer|Steps)\b[^>]*>/g,
      "",
    );
    // Decode the handful of HTML entities that appear in prose.
    l = l
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");
    out.push(l);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection("docs");
  return docs
    .filter((entry) => !SKIP.has(entry.id))
    .map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

export const GET: APIRoute = ({ props, params }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection>>[number] };
  const title = entry.data.title;
  const description = entry.data.description;
  const body = mdxToMarkdown(entry.body ?? "");

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    `url: ${SITE}/docs/${params.slug}/`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const markdown = `${frontmatter}\n\n# ${title}\n\n${body}\n`;

  return new Response(markdown, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
};
