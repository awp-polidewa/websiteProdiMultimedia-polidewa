import { getDatabasePool } from '../config/database.js';
import { readAdminSession } from '../auth/adminSession.js';

function unauthorized(response) {
	return response.status(401).json({
		success: false,
		status: 401,
		message: 'Autentikasi admin diperlukan.'
	});
}

export async function requireAdmin(request, response, next) {
	try {
		const session = readAdminSession(request.headers.cookie || '');
		if (!session) return unauthorized(response);

		const [rows] = await getDatabasePool().execute(
			'SELECT id, name, nidn, username FROM admins WHERE id = ? LIMIT 1',
			[session.adminId]
		);
		if (!rows.length) return unauthorized(response);

		request.admin = rows[0];
		return next();
	} catch (error) {
		return next(error);
	}
}
