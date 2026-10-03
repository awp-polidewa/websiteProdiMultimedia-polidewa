import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { getDatabasePool } from '../config/database.js';
import {
	clearAdminSessionCookie,
	createAdminSessionCookie
} from '../auth/adminSession.js';

const dummyPasswordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);

function invalidCredentials(response) {
	return response.status(401).json({
		success: false,
		status: 401,
		message: 'Identitas atau password tidak valid.'
	});
}

function invalidRequest(response, errors) {
	return response.status(400).json({
		success: false,
		status: 400,
		message: 'Credential tidak valid.',
		errors
	});
}

export async function loginAdmin(request, response, next) {
	const identifier = typeof request.body?.identifier === 'string' ? request.body.identifier.trim() : '';
	const password = typeof request.body?.password === 'string' ? request.body.password : '';
	const errors = {};
	if (!identifier || identifier.length > 150) errors.identifier = 'Wajib diisi dan maksimal 150 karakter.';
	if (!password || Buffer.byteLength(password, 'utf8') > 72) {
		errors.password = 'Wajib diisi dan maksimal 72 byte.';
	}
	if (Object.keys(errors).length) return invalidRequest(response, errors);

	try {
		const normalizedIdentifier = identifier.toLowerCase();
		const [rows] = await getDatabasePool().execute(
			`SELECT id, name, nidn, username, password_hash
			 FROM admins
			 WHERE nidn = ? OR LOWER(username) = ?
			 LIMIT 1`,
			[identifier, normalizedIdentifier]
		);
		const admin = rows[0];
		const passwordMatches = await bcrypt.compare(password, admin?.password_hash || dummyPasswordHash);
		if (!admin || !passwordMatches) return invalidCredentials(response);

		response.setHeader('Set-Cookie', createAdminSessionCookie(String(admin.id)));
		return response.json({
			success: true,
			data: {
				admin: {
					id: String(admin.id),
					name: admin.name,
					nidn: admin.nidn,
					username: admin.username
				},
				expiresIn: 28800
			}
		});
	} catch (error) {
		return next(error);
	}
}

export function logoutAdmin(_request, response) {
	response.setHeader('Set-Cookie', clearAdminSessionCookie());
	return response.json({ success: true, data: { status: 'logged_out' } });
}

export function getAdminSession(request, response) {
	return response.json({
		success: true,
		data: {
			authenticated: true,
			admin: {
				id: String(request.admin.id),
				name: request.admin.name,
				nidn: request.admin.nidn,
				username: request.admin.username
			}
		}
	});
}


