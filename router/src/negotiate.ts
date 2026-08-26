/**
 * Any client that lists text/markdown in Accept wants markdown. Browsers never
 * send it, so a substring check is enough.
 */
export function prefersMarkdown(accept: string | null): boolean {
	return accept?.toLowerCase().includes("text/markdown") ?? false;
}

/**
 * Map a request path to its static markdown twin, or null if the path is not
 * a documentation page (assets, feeds, and other files keep their extension).
 */
export function toMarkdownPath(pathname: string): string | null {
	if (pathname.endsWith("/index.md")) return pathname;
	if (pathname.endsWith(".md")) {
		return `${pathname.slice(0, -".md".length)}/index.md`;
	}
	const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
	if (lastSegment.includes(".")) return null;
	return pathname.endsWith("/") ? `${pathname}index.md` : `${pathname}/index.md`;
}
