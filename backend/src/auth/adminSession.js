import { parseCookie, stringifySetCookie } from 'cookie';
import signature from 'cookie-signature';

export const adminSessionCookieName = 'trm_admin_session';
export const adminSessionLifetimeSeconds = 8 * 60 * 60;

function getSessionSecret() {
	const secret = process.env.SESSION_SECRET;
	if (!secret || Buffer.byteLength(secret) < 32) {
		throw new Error('SESSION_SECRET must contain at least 32 bytes.');
	}
	return secret;
}

function cookieOptions(maxAge = adminSessionLifetimeSeconds) {
	return {
		path: '/api/admin',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge
	};
}

export function createAdminSessionCookie(adminId) {
	const expiresAt = Math.floor(Date.now() / 1000) + adminSessionLifetimeSeconds;
	const signedValue = signature.sign(`${adminId}.${expiresAt}`, getSessionSecret());
	return stringifySetCookie({ name: adminSessionCookieName, value: `s:${signedValue}`, ...cookieOptions() });
}

export function clearAdminSessionCookie() {
	return stringifySetCookie({ name: adminSessionCookieName, value: '',
		...cookieOptions(0),
		expires: new Date(0)
	});
}

export function readAdminSession(cookieHeader = '') {
	const value = parseCookie(cookieHeader)[adminSessionCookieName];
	if (!value || !value.startsWith('s:')) return null;

	const payload = signature.unsign(value.slice(2), getSessionSecret());
	if (!payload) return null;

	const separator = payload.lastIndexOf('.');
	if (separator < 1) return null;
	const adminId = payload.slice(0, separator);
	const expiresAt = Number(payload.slice(separator + 1));
	if (!/^\d+$/.test(adminId) || !Number.isSafeInteger(expiresAt)) return null;
	if (expiresAt <= Math.floor(Date.now() / 1000)) return null;

	return { adminId };
}
