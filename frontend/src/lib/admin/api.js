const apiBase = (import.meta.env.PUBLIC_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** @typedef {{ success?: boolean, data?: any, meta?: Record<string, number | undefined>, message?: string, errors?: Record<string, string> }} ApiResponse */

export class ApiError extends Error {
	/** @param {number} status @param {string} message @param {Record<string, string>} [errors] */
	constructor(status, message, errors = {}) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.errors = errors;
	}
}

/** @param {string} path @param {RequestInit} [options] @param {boolean} [admin] */
export async function requestApi(path, options = {}, admin = false) {
	const response = await fetch(`${apiBase}/api/${admin ? 'admin/' : ''}${path.replace(/^\//, '')}`, {
		...options,
		credentials: admin ? 'include' : 'same-origin',
		headers: {
			...(options.body ? { 'Content-Type': 'application/json' } : {}),
			...options.headers
		}
	});
	/** @type {ApiResponse | null} */
	let payload = null;
	try {
		payload = await response.json();
	} catch {
		// The request failed without a JSON response; keep the user-facing message generic.
	}
	if (!response.ok) {
		throw new ApiError(
			response.status,
			typeof payload?.message === 'string' ? payload.message : 'Permintaan tidak dapat diproses.',
			payload?.errors && typeof payload.errors === 'object' ? payload.errors : {}
		);
	}
	return payload;
}
