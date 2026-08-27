/** Fetches a URL from the docs assets Worker. Injectable so tests can script responses. */
export type Upstream = (url: URL) => Promise<Response>;

export const defaultUpstream: Upstream = (url) => fetch(url);
