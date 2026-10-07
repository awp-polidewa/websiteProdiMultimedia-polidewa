const allowedMethods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
const requestHeaderAllowlist = [
	'accept',
	'accept-language',
	'content-type',
	'cookie',
	'if-modified-since',
	'if-none-match',
	'if-range',
	'range'
];
const hopByHopHeaders = new Set([
	'connection',
	'content-encoding',
	'content-length',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade'
]);

/** Resolve the one configured backend target. Never use a value from the request. */
function getBackendTarget() {
	const runtime = /** @type {{ process?: { env?: Record<string, string | undefined> } }} */ (globalThis);
	const configuredTarget = runtime.process?.env?.API_PROXY_TARGET;
	if (!configuredTarget) {
		throw new Error('API_PROXY_TARGET is not configured.');
	}

	const target = new URL(configuredTarget);
	if (!['http:', 'https:'].includes(target.protocol) || target.username || target.password || target.search || target.hash) {
		throw new Error('API_PROXY_TARGET must be a valid HTTP(S) origin.');
	}
	if (target.pathname !== '/' && target.pathname !== '') {
		throw new Error('API_PROXY_TARGET must not include a path.');
	}

	return target;
}

/** @param {string} path */
function encodeBackendPath(path) {
	if (!path || path.startsWith('/') || path.includes('\\') || /[\u0000-\u001f\u007f]/.test(path)) {
		throw new Error('Invalid proxy path.');
	}

	const segments = path.split('/');
	if (segments.some((segment) => !segment || segment === '.' || segment === '..' || segment.includes('\\'))) {
		throw new Error('Invalid proxy path.');
	}
	return segments.map((segment) => encodeURIComponent(segment)).join('/');
}

/** @param {Request} request @param {string} backendPath */
export async function proxyBackendRequest(request, backendPath) {
	const method = request.method.toUpperCase();
	if (!allowedMethods.has(method)) {
		return Response.json({ success: false, status: 405, message: 'Method tidak diizinkan.' }, { status: 405 });
	}

	let upstreamUrl;
	try {
		const target = getBackendTarget();
		const safePath = encodeBackendPath(backendPath);
		const incomingUrl = new URL(request.url);
		upstreamUrl = new URL(`/${safePath}${incomingUrl.search}`, target.origin);
	} catch (error) {
		console.error('Backend proxy configuration/path error:', error instanceof Error ? error.message : 'UnknownError');
		return Response.json({ success: false, status: 502, message: 'Backend API belum dapat dijangkau.' }, { status: 502 });
	}

	const headers = new Headers();
	for (const name of requestHeaderAllowlist) {
		const value = request.headers.get(name);
		if (value) headers.set(name, value);
	}

	try {
		const upstream = await fetch(upstreamUrl, {
			method,
			headers,
			...(method === 'GET' || method === 'HEAD' ? {} : { body: request.body, duplex: 'half' }),
			redirect: 'manual',
			signal: request.signal
		});

		const responseHeaders = new Headers();
		for (const [name, value] of upstream.headers) {
			if (name.toLowerCase() !== 'set-cookie' && !hopByHopHeaders.has(name.toLowerCase())) {
				responseHeaders.append(name, value);
			}
		}
		for (const cookie of upstream.headers.getSetCookie()) {
			responseHeaders.append('set-cookie', cookie);
		}

		const emptyResponse = method === 'HEAD' || upstream.status === 204 || upstream.status === 304;
		return new Response(emptyResponse ? null : upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers: responseHeaders
		});
	} catch (error) {
		if (request.signal.aborted) throw error;
		console.error('Backend proxy request failed:', error instanceof Error ? error.name : 'UnknownError');
		return Response.json({ success: false, status: 502, message: 'Backend API belum dapat dijangkau.' }, { status: 502 });
	}
}
