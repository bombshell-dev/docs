// Content negotiation for agent-facing markdown, per
// https://cra.mr/optimizing-content-for-agents: agents signal themselves with
// `Accept: text/markdown`; humans never do.

/** Parse the quality value for a media type out of an Accept header. */
function quality(accept: string, type: string): number {
	for (const part of accept.split(",")) {
		const [media, ...params] = part.trim().split(";");
		if (media.trim().toLowerCase() !== type) continue;
		for (const param of params) {
			const [key, value] = param.trim().split("=");
			if (key === "q") return Number.parseFloat(value) || 0;
		}
		return 1;
	}
	return 0;
}

export function prefersMarkdown(accept: string | null): boolean {
	if (!accept) return false;
	const markdown = quality(accept, "text/markdown");
	if (markdown === 0) return false;
	return markdown >= quality(accept, "text/html");
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
