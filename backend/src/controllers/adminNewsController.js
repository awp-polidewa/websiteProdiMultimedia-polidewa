import { getDatabasePool } from '../config/database.js';

const pageSize = 12;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedStatuses = new Set(['draft', 'published']);

function invalid(response, errors) {
	return response.status(400).json({
		success: false,
		status: 400,
		message: 'Data berita tidak valid.',
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
	const content = typeof body?.content === 'string' ? body.content : '';

	if (!title) errors.title = 'Judul wajib diisi.';
	else if (title.length > 200) errors.title = 'Maksimal 200 karakter.';
	if (!slug) errors.slug = 'Slug wajib diisi.';
	else if (slug.length > 220 || !slugPattern.test(slug)) {
		errors.slug = 'Gunakan huruf kecil, angka, dan tanda hubung dengan format URL yang valid.';
	}
	if (!content.trim()) errors.content = 'Isi berita wajib diisi.';
	else if (Buffer.byteLength(content, 'utf8') > 16_777_215) errors.content = 'Isi berita terlalu panjang.';

	return { title, slug, content, errors };
}

function validateOptionalFields(body, existing = {}) {
	const errors = {};
	let excerpt = existing.excerpt ?? null;
	let thumbnailPath = existing.thumbnailPath ?? null;

	if (Object.hasOwn(body, 'excerpt')) {
		if (body.excerpt !== null && typeof body.excerpt !== 'string') {
			errors.excerpt = 'Harus berupa teks atau null.';
		} else if (typeof body.excerpt === 'string' && body.excerpt.length > 500) {
			errors.excerpt = 'Maksimal 500 karakter.';
		} else {
			excerpt = body.excerpt?.trim() || null;
		}
	}

	if (Object.hasOwn(body, 'thumbnail_path')) {
		if (body.thumbnail_path !== null && typeof body.thumbnail_path !== 'string') {
			errors.thumbnail_path = 'Harus berupa path relatif atau null.';
		} else if (typeof body.thumbnail_path === 'string') {
			const path = body.thumbnail_path.trim();
			const hasTraversal = path.split(/[\\/]+/).includes('..');
			if (!path || path.length > 255 || path.startsWith('/') || path.includes('\\') || hasTraversal) {
				errors.thumbnail_path = 'Harus berupa path relatif yang valid, maksimal 255 karakter.';
			} else {
				thumbnailPath = path;
			}
		} else {
			thumbnailPath = null;
		}
	}

	return { excerpt, thumbnailPath, errors };
}

function getStatus(body, fallback = 'draft') {
	const status = body?.status === undefined ? fallback : body.status;
	if (typeof status !== 'string' || !allowedStatuses.has(status)) return null;
	return status;
}

function duplicateSlug(response) {
	return response.status(409).json({
		success: false,
		status: 409,
		message: 'Slug berita sudah digunakan.'
	});
}

function notFound(response) {
	return response.status(404).json({
		success: false,
		status: 404,
		message: 'Berita tidak ditemukan.'
	});
}

function handleDatabaseError(error, response, next) {
	if (error.code === 'ER_DUP_ENTRY') return duplicateSlug(response);
	return next(error);
}

const adminListColumns = `id, title, slug, excerpt, thumbnail_path AS thumbnailPath, status,
	DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s+08:00') AS publishedAt,
	DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s+08:00') AS createdAt,
	DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s+08:00') AS updatedAt`;

export async function getAdminNews(request, response, next) {
	const page = parsePage(request.query.page);
	if (page === null) return invalid(response, { page: 'Harus berupa bilangan bulat positif.' });

	try {
		const pool = getDatabasePool();
		const [[countRow]] = await pool.execute('SELECT COUNT(*) AS totalItems FROM news');
		const offset = (page - 1) * pageSize;
		const [data] = await pool.execute(
			`SELECT ${adminListColumns} FROM news ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`,
			[pageSize, offset]
		);
		const totalItems = Number(countRow.totalItems);
		return response.json({
			success: true,
			data,
			meta: {
				page,
				perPage: pageSize,
				totalItems,
				totalPages: Math.ceil(totalItems / pageSize)
			}
		});
	} catch (error) {
		return next(error);
	}
}

export async function getAdminNewsById(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminListColumns}, content FROM news WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!rows.length) return notFound(response);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return next(error);
	}
}

export async function createNews(request, response, next) {
	const required = validateRequiredFields(request.body);
	const optional = validateOptionalFields(request.body || {});
	const status = getStatus(request.body);
	const errors = { ...required.errors, ...optional.errors };
	if (status === null) errors.status = 'Harus draft atau published.';
	if (Object.keys(errors).length) return invalid(response, errors);

	try {
		const [result] = await getDatabasePool().execute(
			`INSERT INTO news (title, slug, excerpt, content, thumbnail_path, status, published_at)
			 VALUES (?, ?, ?, ?, ?, ?, ${status === 'published' ? 'CURRENT_TIMESTAMP' : 'NULL'})`,
			[required.title, required.slug, optional.excerpt, required.content, optional.thumbnailPath, status]
		);
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminListColumns}, content FROM news WHERE id = ? LIMIT 1`,
			[String(result.insertId)]
		);
		return response.status(201).json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function updateNews(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });
	const required = validateRequiredFields(request.body);
	const errors = { ...required.errors };
	if (Object.keys(errors).length) return invalid(response, errors);

	try {
		const pool = getDatabasePool();
		const [existingRows] = await pool.execute(
			'SELECT status, published_at, excerpt, thumbnail_path AS thumbnailPath FROM news WHERE id = ? LIMIT 1',
			[id]
		);
		if (!existingRows.length) return notFound(response);
		const existing = existingRows[0];
		const optional = validateOptionalFields(request.body || {}, existing);
		const status = getStatus(request.body, existing.status);
		Object.assign(errors, optional.errors);
		if (status === null) errors.status = 'Harus draft atau published.';
		if (Object.keys(errors).length) return invalid(response, errors);

		const publishedAt = status === 'published' && existing.status === 'published'
			? existing.published_at
			: null;
		const publishedAtExpression = status === 'draft' ? 'NULL' : 'COALESCE(?, CURRENT_TIMESTAMP)';
		const updateValues = [required.title, required.slug, optional.excerpt, required.content,
			optional.thumbnailPath, status];
		if (status === 'published') updateValues.push(publishedAt);
		updateValues.push(id);
		await pool.execute(
			`UPDATE news
			 SET title = ?, slug = ?, excerpt = ?, content = ?, thumbnail_path = ?, status = ?,
			 published_at = ${publishedAtExpression}
			 WHERE id = ?`,
			updateValues
		);
		const [rows] = await pool.execute(
			`SELECT ${adminListColumns}, content FROM news WHERE id = ? LIMIT 1`,
			[id]
		);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function deleteNews(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [result] = await getDatabasePool().execute('DELETE FROM news WHERE id = ?', [id]);
		if (!result.affectedRows) return notFound(response);
		return response.json({ success: true, data: { id, deleted: true } });
	} catch (error) {
		return next(error);
	}
}
