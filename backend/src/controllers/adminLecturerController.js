import { getDatabasePool } from '../config/database.js';

const pageSize = 12;
const concentrations = new Set(['Web Design', 'Desain Grafis', 'Videografi']);
const writableFields = new Set([
	'name', 'title', 'concentration', 'photo_path', 'bio', 'email', 'display_order'
]);

function invalid(response, errors) {
	return response.status(400).json({
		success: false,
		status: 400,
		message: 'Data dosen tidak valid.',
		errors
	});
}

function parsePage(value) {
	if (value === undefined) return 1;
	if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
	const page = Number(value);
	return Number.isSafeInteger(page) && page <= Math.floor(Number.MAX_SAFE_INTEGER / pageSize)
		? page
		: null;
}

function validId(id) {
	return /^\d+$/.test(id) && !/^0+$/.test(id);
}

function validateBody(body, existing = null) {
	const errors = {};
	const values = {};
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { values, errors: { body: 'Harus berupa object JSON.' } };
	}

	for (const key of Object.keys(body)) {
		if (!writableFields.has(key)) errors[key] = 'Field tidak diizinkan.';
	}

	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const title = typeof body.title === 'string' ? body.title.trim() : '';
	if (!name) errors.name = 'Nama wajib diisi.';
	else if (name.length > 150) errors.name = 'Maksimal 150 karakter.';
	if (!title) errors.title = 'Jabatan wajib diisi.';
	else if (title.length > 150) errors.title = 'Maksimal 150 karakter.';
	values.name = name;
	values.title = title;

	const concentration = Object.hasOwn(body, 'concentration')
		? body.concentration
		: existing?.concentration ?? null;
	if (concentration !== null && (typeof concentration !== 'string' || !concentrations.has(concentration))) {
		errors.concentration = 'Gunakan Web Design, Desain Grafis, Videografi, atau null.';
	} else {
		values.concentration = concentration;
	}

	const photoPathInput = Object.hasOwn(body, 'photo_path') ? body.photo_path : existing?.photoPath ?? null;
	if (photoPathInput !== null && typeof photoPathInput !== 'string') {
		errors.photo_path = 'Harus berupa path relatif atau null.';
	} else {
		const photoPath = typeof photoPathInput === 'string' ? photoPathInput.trim() : null;
		const hasTraversal = photoPath?.split(/[\\/]+/).includes('..');
		if (photoPath !== null && (!photoPath || photoPath.length > 255 || photoPath.startsWith('/') ||
			photoPath.includes('\\') || hasTraversal || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(photoPath))) {
			errors.photo_path = 'Harus berupa path relatif yang valid, maksimal 255 karakter.';
		} else {
			values.photoPath = photoPath;
		}
	}

	const bioInput = Object.hasOwn(body, 'bio') ? body.bio : existing?.bio ?? null;
	if (bioInput !== null && typeof bioInput !== 'string') {
		errors.bio = 'Harus berupa teks atau null.';
	} else {
		const bio = typeof bioInput === 'string' ? bioInput.trim() || null : null;
		if (bio !== null && Buffer.byteLength(bio, 'utf8') > 65_535) errors.bio = 'Bio terlalu panjang.';
		else values.bio = bio;
	}

	const emailInput = Object.hasOwn(body, 'email') ? body.email : existing?.email ?? null;
	if (emailInput !== null && typeof emailInput !== 'string') {
		errors.email = 'Harus berupa email valid atau null.';
	} else {
		const email = typeof emailInput === 'string' ? emailInput.trim() || null : null;
		if (email !== null && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
			errors.email = 'Harus berupa email valid, maksimal 150 karakter.';
		} else {
			values.email = email;
		}
	}

	const displayOrderInput = Object.hasOwn(body, 'display_order')
		? body.display_order
		: existing?.displayOrder ?? 0;
	if (!Number.isInteger(displayOrderInput) || displayOrderInput < 0 || displayOrderInput > 4_294_967_295) {
		errors.display_order = 'Harus berupa bilangan bulat 0 sampai 4294967295.';
	} else {
		values.displayOrder = displayOrderInput;
	}

	return { values, errors };
}

function notFound(response) {
	return response.status(404).json({
		success: false,
		status: 404,
		message: 'Dosen tidak ditemukan.'
	});
}

function handleDatabaseError(error, response, next) {
	if (error.code === 'ER_DUP_ENTRY') {
		return response.status(409).json({
			success: false,
			status: 409,
			message: 'Data dosen berbenturan dengan constraint database.'
		});
	}
	return next(error);
}

const adminLecturerColumns = `id, name, title, concentration, photo_path AS photoPath, bio, email,
	display_order AS displayOrder,
	DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s+08:00') AS createdAt,
	DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s+08:00') AS updatedAt`;

export async function getAdminLecturers(request, response, next) {
	const page = parsePage(request.query.page);
	if (page === null) return invalid(response, { page: 'Harus berupa bilangan bulat positif.' });

	try {
		const pool = getDatabasePool();
		const [[countRow]] = await pool.execute('SELECT COUNT(*) AS totalItems FROM lecturers');
		const [data] = await pool.execute(
			`SELECT ${adminLecturerColumns} FROM lecturers ORDER BY display_order ASC, id ASC LIMIT ? OFFSET ?`,
			[pageSize, (page - 1) * pageSize]
		);
		const totalItems = Number(countRow.totalItems);
		return response.json({
			success: true,
			data,
			meta: { page, perPage: pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) }
		});
	} catch (error) {
		return next(error);
	}
}

export async function getAdminLecturerById(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminLecturerColumns} FROM lecturers WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!rows.length) return notFound(response);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return next(error);
	}
}

export async function createLecturer(request, response, next) {
	const { values, errors } = validateBody(request.body);
	if (Object.keys(errors).length) return invalid(response, errors);

	try {
		const [result] = await getDatabasePool().execute(
			`INSERT INTO lecturers (name, title, concentration, photo_path, bio, email, display_order)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[values.name, values.title, values.concentration, values.photoPath, values.bio,
				values.email, values.displayOrder]
		);
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminLecturerColumns} FROM lecturers WHERE id = ? LIMIT 1`,
			[String(result.insertId)]
		);
		return response.status(201).json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function updateLecturer(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });
	const body = request.body;
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return invalid(response, { body: 'Harus berupa object JSON.' });
	}

	try {
		const pool = getDatabasePool();
		const [existingRows] = await pool.execute(
			`SELECT name, title, concentration, photo_path AS photoPath, bio, email,
			 display_order AS displayOrder FROM lecturers WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!existingRows.length) return notFound(response);
		const { values, errors } = validateBody(body, existingRows[0]);
		if (Object.keys(errors).length) return invalid(response, errors);

		await pool.execute(
			`UPDATE lecturers
			 SET name = ?, title = ?, concentration = ?, photo_path = ?, bio = ?, email = ?, display_order = ?
			 WHERE id = ?`,
			[values.name, values.title, values.concentration, values.photoPath, values.bio,
				values.email, values.displayOrder, id]
		);
		const [rows] = await pool.execute(
			`SELECT ${adminLecturerColumns} FROM lecturers WHERE id = ? LIMIT 1`,
			[id]
		);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function deleteLecturer(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [result] = await getDatabasePool().execute('DELETE FROM lecturers WHERE id = ?', [id]);
		if (!result.affectedRows) return notFound(response);
		return response.json({ success: true, data: { id, deleted: true } });
	} catch (error) {
		return next(error);
	}
}
