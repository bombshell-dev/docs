// Public origin used in Link headers (canonical/alternate) so agents always
// discover the proxied bomb.sh URLs, never the internal workers.dev ones.
export const SITE = "https://bomb.sh";

// Bare project roots don't have their own index page and should redirect to
// their actual landing page instead of 404ing.
export const PROJECT_LANDING_PAGES: Record<string, string> = {
	clack: "/docs/clack/basics/getting-started/",
	tab: "/docs/tab/",
	args: "/docs/args/getting-started/",
	tty: "/docs/tty/basics/getting-started/",
};
