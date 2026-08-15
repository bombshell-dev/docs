// Where to proxy docs requests. In production this is the live site. On
// Cloudflare branch previews both Workers share the same branch slug
// (e.g. `fix-404-bombsh-docs-router` ↔ `fix-404-bombshell-docs`), so we point
// the router at the matching docs preview by rewriting our own hostname.
// Per-version previews use an 8-char hex id that differs per Worker and can't
// be mapped, so those fall back to production.
export function docsOrigin(host: string): string {
	const match = host.match(/^(.+)-bombsh-docs-router\.(.+\.workers\.dev)$/);
	if (match) {
		const [, slug, zone] = match;
		if (!/^[0-9a-f]{8}$/.test(slug)) {
			return `https://${slug}-bombshell-docs.${zone}/`;
		}
	}
	return "https://docs.bomb.sh/";
}
