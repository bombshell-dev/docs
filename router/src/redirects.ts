import type { MiddlewareHandler } from "hono";
import { PROJECT_LANDING_PAGES } from "./config.ts";

export function projectRedirects(): MiddlewareHandler {
	return async (c, next) => {
		const url = new URL(c.req.url);
		const match = url.pathname.match(/^\/docs\/([^/]+)\/?$/);
		const landingPage = match && PROJECT_LANDING_PAGES[match[1]];
		if (landingPage && url.pathname !== landingPage) {
			return c.redirect(new URL(landingPage, url).toString(), 308);
		}
		return next();
	};
}
