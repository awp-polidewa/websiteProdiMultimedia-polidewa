import { getDatabasePool } from '../config/database.js';

const pageSize = 12;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const categories = new Set(['desain', 'coding', '3d', 'multimedia', 'lainnya']);

function invalid(response, errors) {
	return response.status(400).json({
		success: false,
		status: 400,
		message: 'Data karya tidak valid.',
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

function validateRequiredFields(body) {
	const errors = {};
	const title = typeof body?.title === 'string' ? body.title.trim() : '';
	const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
	const thumbnailPath = typeof body?.thumbnail_path === 'string' ? body.thumbnail_path.trim() : '';
	const category = typeof body?.category === 'string' ? body.category : '';

	if (!title) errors.title = 'Judul wajib diisi.';
	else if (title.length > 200) errors.title = 'Maksimal 200 karakter.';
	if (!slug) errors.slug = 'Slug wajib diisi.';
	else if (slug.length > 220 || !slugPattern.test(slug)) {
		errors.slug = 'Gunakan huruf kecil, angka, dan tanda hubung dengan format URL yang valid.';
	}
	if (!thumbnailPath) errors.thumbnail_path = 'Path thumbnail wajib diisi.';
	else if (!isValidRelativePath(thumbnailPath)) {
		errors.thumbnail_path = 'Harus berupa path relatif yang valid, maksimal 255 karakter.';
	}
	if (!category) errors.category = 'Kategori wajib diisi.';
	else if (!categories.has(category)) errors.category = 'Kategori tidak valid.';

	return { title, slug, thumbnailPath, category, errors };
}

function isValidRelativePath(path) {
	return path.length <= 255 && !path.startsWith('/') && !path.includes('\\') &&
		!path.split('/').includes('..') && !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path);
}

function validateOptionalFields(body, existing = {}) {
	const errors = {};
	let description = existing.description ?? null;
	let studentName = existing.studentName ?? null;
	let projectYear = existing.projectYear ?? null;
	let externalUrl = existing.externalUrl ?? null;

	if (Object.hasOwn(body, 'description')) {
		if (body.description !== null && typeof body.description !== 'string') {
			errors.description = 'Harus berupa teks atau null.';
		} else {
			description = body.description?.trim() || null;
			if (description !== null && Buffer.byteLength(description, 'utf8') > 65535) {
				errors.description = 'Deskripsi terlalu panjang.';
			}
		}
	}

	if (Object.hasOwn(body, 'student_name')) {
		if (body.student_name !== null && typeof body.student_name !== 'string') {
			errors.student_name = 'Harus berupa teks atau null.';
		} else {
			studentName = body.student_name?.trim() || null;
			if (studentName !== null && studentName.length > 150) errors.student_name = 'Maksimal 150 karakter.';
		}
	}

	if (Object.hasOwn(body, 'project_year')) {
		if (body.project_year === null || body.project_year === '') {
			projectYear = null;
		} else if (!Number.isInteger(body.project_year) || body.project_year < 0 || body.project_year > 65535) {
			errors.project_year = 'Harus berupa bilangan bulat 0 sampai 65535 atau null.';
		} else {
			projectYear = body.project_year;
		}
	}

	if (Object.hasOwn(body, 'external_url')) {
		if (body.external_url === null || body.external_url === '') {
			externalUrl = null;
		} else if (typeof body.external_url !== 'string') {
			errors.external_url = 'Harus berupa URL HTTP/HTTPS atau null.';
		} else {
			externalUrl = body.external_url.trim();
			try {
				const url = new URL(externalUrl);
				if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password || externalUrl.length > 500) {
					errors.external_url = 'Harus berupa URL HTTP/HTTPS valid, maksimal 500 karakter.';
				}
			} catch {
				errors.external_url = 'Harus berupa URL HTTP/HTTPS valid, maksimal 500 karakter.';
			}
		}
	}

	return { description, studentName, projectYear, externalUrl, errors };
}

function duplicateSlug(response) {
	return response.status(409).json({
		success: false,
		status: 409,
		message: 'Slug karya sudah digunakan.'
	});
}

function notFound(response) {
	return response.status(404).json({
		success: false,
		status: 404,
		message: 'Karya tidak ditemukan.'
	});
}

function handleDatabaseError(error, response, next) {
	if (error.code === 'ER_DUP_ENTRY') return duplicateSlug(response);
	return next(error);
}

const adminProjectColumns = `id, title, slug, description, thumbnail_path AS thumbnailPath, category,
	student_name AS studentName, project_year AS projectYear, external_url AS externalUrl,
	DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s+08:00') AS createdAt,
	DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s+08:00') AS updatedAt`;

export async function getAdminProjects(request, response, next) {
	const page = parsePage(request.query.page);
	if (page === null) return invalid(response, { page: 'Harus berupa bilangan bulat positif.' });

	try {
		const pool = getDatabasePool();
		const [[countRow]] = await pool.execute('SELECT COUNT(*) AS totalItems FROM projects');
		const offset = (page - 1) * pageSize;
		const [data] = await pool.execute(
			`SELECT ${adminProjectColumns} FROM projects ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
			[pageSize, offset]
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

export async function getAdminProjectById(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminProjectColumns} FROM projects WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!rows.length) return notFound(response);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return next(error);
	}
}

export async function createProject(request, response, next) {
	const required = validateRequiredFields(request.body);
	const optional = validateOptionalFields(request.body || {});
	const errors = { ...required.errors, ...optional.errors };
	if (Object.keys(errors).length) return invalid(response, errors);

	try {
		const [result] = await getDatabasePool().execute(
			`INSERT INTO projects (title, slug, description, thumbnail_path, category, student_name, project_year, external_url)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[required.title, required.slug, optional.description, required.thumbnailPath, required.category,
				optional.studentName, optional.projectYear, optional.externalUrl]
		);
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminProjectColumns} FROM projects WHERE id = ? LIMIT 1`,
			[String(result.insertId)]
		);
		return response.status(201).json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function updateProject(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });
	const required = validateRequiredFields(request.body);
	const errors = { ...required.errors };
	if (Object.keys(errors).length) return invalid(response, errors);

	try {
		const pool = getDatabasePool();
		const [existingRows] = await pool.execute(
			`SELECT description, student_name AS studentName, project_year AS projectYear,
			 external_url AS externalUrl FROM projects WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!existingRows.length) return notFound(response);
		const optional = validateOptionalFields(request.body || {}, existingRows[0]);
		Object.assign(errors, optional.errors);
		if (Object.keys(errors).length) return invalid(response, errors);

		await pool.execute(
			`UPDATE projects
			 SET title = ?, slug = ?, description = ?, thumbnail_path = ?, category = ?,
			 student_name = ?, project_year = ?, external_url = ?
			 WHERE id = ?`,
			[required.title, required.slug, optional.description, required.thumbnailPath, required.category,
				optional.studentName, optional.projectYear, optional.externalUrl, id]
		);
		const [rows] = await pool.execute(
			`SELECT ${adminProjectColumns} FROM projects WHERE id = ? LIMIT 1`,
			[id]
		);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function deleteProject(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [result] = await getDatabasePool().execute('DELETE FROM projects WHERE id = ?', [id]);
		if (!result.affectedRows) return notFound(response);
		return response.json({ success: true, data: { id, deleted: true } });
	} catch (error) {
		return next(error);
	}
}
