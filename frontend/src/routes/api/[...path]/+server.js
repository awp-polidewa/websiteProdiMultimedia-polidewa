import { proxyBackendRequest } from '../../../lib/server/backendProxy.server.js';

/** @param {{ request: Request, params: { path: string } }} event */
function proxy(event) {
	return proxyBackendRequest(event.request, `api/${event.params.path}`);
}

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
