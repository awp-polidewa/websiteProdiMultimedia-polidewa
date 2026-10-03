import { getDatabasePool } from '../config/database.js';

const pageSize = 12;
const statuses = new Set(['draft', 'published']);
const writableFields = new Set(['title', 'description', 'file_path', 'source_url', 'status', 'published_at']);

function invalid(response, errors) {
	return response.status(400).json({
		success: false,
		status: 400,
		message: 'Data dokumen akreditasi tidak valid.',
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

function validRelativePath(path, maxLength) {
	return path.length <= maxLength && !path.startsWith('/') && !path.includes('\\') &&
		!path.split('/').includes('..') && !/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(path);
}

function isValidDate(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validHttpUrl(value) {
	try {
		const url = new URL(value);
		return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
	} catch {
		return false;
	}
}

function validateBody(body, existing = null, isCreate = false) {
	const errors = {};
	const values = {};
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return { values, errors: { body: 'Harus berupa object JSON.' } };
	}
	for (const key of Object.keys(body)) {
		if (!writableFields.has(key)) errors[key] = 'Field tidak diizinkan.';
	}

	const title = typeof body.title === 'string' ? body.title.trim() : '';
	if (!title) errors.title = 'Judul wajib diisi.';
	else if (title.length > 200) errors.title = 'Maksimal 200 karakter.';
	values.title = title;

	const filePathInput = Object.hasOwn(body, 'file_path') ? body.file_path : existing?.filePath ?? '';
	if (typeof filePathInput !== 'string') {
		errors.file_path = 'Path file wajib berupa path relatif.';
	} else {
		const filePath = filePathInput.trim();
		if (!filePath || !validRelativePath(filePath, 255)) {
			errors.file_path = 'Path file wajib berupa path relatif yang valid, maksimal 255 karakter.';
		} else {
			values.filePath = filePath;
		}
	}

	const descriptionInput = Object.hasOwn(body, 'description') ? body.description : existing?.description ?? null;
	if (descriptionInput !== null && typeof descriptionInput !== 'string') {
		errors.description = 'Harus berupa teks atau null.';
	} else {
		const description = typeof descriptionInput === 'string' ? descriptionInput.trim() || null : null;
		if (description !== null && Buffer.byteLength(description, 'utf8') > 65_535) {
			errors.description = 'Deskripsi terlalu panjang.';
		} else {
			values.description = description;
		}
	}

	const sourceUrlInput = Object.hasOwn(body, 'source_url') ? body.source_url : existing?.sourceUrl ?? null;
	if (sourceUrlInput !== null && typeof sourceUrlInput !== 'string') {
		errors.source_url = 'Harus berupa URL HTTP/HTTPS atau null.';
	} else {
		const sourceUrl = typeof sourceUrlInput === 'string' ? sourceUrlInput.trim() || null : null;
		if (sourceUrl !== null && (sourceUrl.length > 500 || !validHttpUrl(sourceUrl))) {
			errors.source_url = 'Harus berupa URL HTTP/HTTPS yang valid, maksimal 500 karakter.';
		} else {
			values.sourceUrl = sourceUrl;
		}
	}

	const status = Object.hasOwn(body, 'status') ? body.status : existing?.status ?? 'draft';
	if (typeof status !== 'string' || !statuses.has(status)) {
		errors.status = 'Harus draft atau published.';
	} else {
		values.status = status;
	}

	const publishedAtInput = Object.hasOwn(body, 'published_at')
		? body.published_at
		: existing?.publishedAt ?? null;
	if (publishedAtInput !== null && !isValidDate(publishedAtInput)) {
		errors.published_at = 'Harus berupa tanggal valid berformat YYYY-MM-DD atau null.';
	} else {
		values.publishedAt = publishedAtInput;
	}

	if (isCreate && values.status === undefined) values.status = 'draft';
	return { values, errors };
}

function notFound(response) {
	return response.status(404).json({
		success: false,
		status: 404,
		message: 'Dokumen akreditasi tidak ditemukan.'
	});
}

function handleDatabaseError(error, response, next) {
	if (error.code === 'ER_DUP_ENTRY') {
		return response.status(409).json({
			success: false,
			status: 409,
			message: 'Data dokumen akreditasi berbenturan dengan constraint database.'
		});
	}
	return next(error);
}

const adminDocumentColumns = `id, title, description, file_path AS filePath, source_url AS sourceUrl,
	status, DATE_FORMAT(published_at, '%Y-%m-%d') AS publishedAt,
	DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s+08:00') AS createdAt,
	DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%s+08:00') AS updatedAt`;

export async function getAdminAccreditationDocuments(request, response, next) {
	const page = parsePage(request.query.page);
	if (page === null) return invalid(response, { page: 'Harus berupa bilangan bulat positif.' });

	try {
		const pool = getDatabasePool();
		const [[countRow]] = await pool.execute('SELECT COUNT(*) AS totalItems FROM accreditation_documents');
		const [data] = await pool.execute(
			`SELECT ${adminDocumentColumns} FROM accreditation_documents
			 ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`,
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

export async function getAdminAccreditationDocumentById(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminDocumentColumns} FROM accreditation_documents WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!rows.length) return notFound(response);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return next(error);
	}
}

export async function createAccreditationDocument(request, response, next) {
	const { values, errors } = validateBody(request.body, null, true);
	if (Object.keys(errors).length) return invalid(response, errors);

	try {
		const [result] = await getDatabasePool().execute(
			`INSERT INTO accreditation_documents (title, description, file_path, source_url, status, published_at)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[values.title, values.description, values.filePath, values.sourceUrl, values.status, values.publishedAt]
		);
		const [rows] = await getDatabasePool().execute(
			`SELECT ${adminDocumentColumns} FROM accreditation_documents WHERE id = ? LIMIT 1`,
			[String(result.insertId)]
		);
		return response.status(201).json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function updateAccreditationDocument(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });
	if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
		return invalid(response, { body: 'Harus berupa object JSON.' });
	}

	try {
		const pool = getDatabasePool();
		const [existingRows] = await pool.execute(
			`SELECT title, description, file_path AS filePath, source_url AS sourceUrl, status,
			 DATE_FORMAT(published_at, '%Y-%m-%d') AS publishedAt
			 FROM accreditation_documents WHERE id = ? LIMIT 1`,
			[id]
		);
		if (!existingRows.length) return notFound(response);
		const { values, errors } = validateBody(request.body, existingRows[0]);
		if (Object.keys(errors).length) return invalid(response, errors);

		await pool.execute(
			`UPDATE accreditation_documents
			 SET title = ?, description = ?, file_path = ?, source_url = ?, status = ?, published_at = ?
			 WHERE id = ?`,
			[values.title, values.description, values.filePath, values.sourceUrl, values.status,
				values.publishedAt, id]
		);
		const [rows] = await pool.execute(
			`SELECT ${adminDocumentColumns} FROM accreditation_documents WHERE id = ? LIMIT 1`,
			[id]
		);
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return handleDatabaseError(error, response, next);
	}
}

export async function deleteAccreditationDocument(request, response, next) {
	const { id } = request.params;
	if (!validId(id)) return invalid(response, { id: 'Harus berupa ID bilangan bulat positif.' });

	try {
		const [result] = await getDatabasePool().execute(
			'DELETE FROM accreditation_documents WHERE id = ?',
			[id]
		);
		if (!result.affectedRows) return notFound(response);
		return response.json({ success: true, data: { id, deleted: true } });
	} catch (error) {
		return next(error);
	}
}
