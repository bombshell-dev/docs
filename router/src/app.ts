import { Hono } from "hono/tiny";
import { projectRedirects } from "./redirects.ts";
import { markdownNegotiation } from "./markdown.ts";
import { docsProxy } from "./proxy.ts";
import { defaultUpstream, type Upstream } from "./upstream.ts";

export interface AppOptions {
	/** Fetches from the docs assets Worker. */
	upstream?: Upstream;
	/** Handles non-docs requests. */
	passthrough?: (request: Request) => Promise<Response>;
}

export function createApp(options: AppOptions = {}) {
	const upstream = options.upstream ?? defaultUpstream;
	const passthrough =
		options.passthrough ?? ((request: Request) => fetch(request));

	const app = new Hono();
	for (const path of ["/docs", "/docs/*"]) {
		app.use(path, projectRedirects());
		app.use(path, markdownNegotiation(upstream));
		app.all(path, docsProxy(upstream));
	}
	app.all("*", (c) => passthrough(c.req.raw));
	return app;
}
