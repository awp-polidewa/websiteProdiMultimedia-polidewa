import { getDatabasePool } from '../config/database.js';

const pageSize = 12;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const projectCategories = new Set(['desain', 'coding', '3d', 'multimedia', 'lainnya']);

function sendInvalid(response, field, message) {
	return response.status(400).json({
		success: false,
		status: 400,
		message: 'Parameter tidak valid.',
		errors: { [field]: message }
	});
}

function getPage(value) {
	if (value === undefined) return 1;
	if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
	const page = Number(value);
	return Number.isSafeInteger(page) && page <= Math.floor(Number.MAX_SAFE_INTEGER / pageSize)
		? page
		: null;
}

function isValidSlug(slug) {
	return slug.length <= 220 && slugPattern.test(slug);
}

async function getPageMeta(pool, table, whereSql, params, page) {
	const [rows] = await pool.execute(
		`SELECT COUNT(*) AS totalItems FROM ${table} ${whereSql}`,
		params
	);
	const totalItems = Number(rows[0].totalItems);
	return {
		page,
		perPage: pageSize,
		totalItems,
		totalPages: Math.ceil(totalItems / pageSize)
	};
}

export async function getLecturers(_request, response, next) {
	try {
		const [data] = await getDatabasePool().execute(
			`SELECT id, name, title, concentration, bio, display_order AS displayOrder
			 FROM lecturers ORDER BY display_order ASC, id ASC`
		);
		return response.json({
			success: true,
			data: data.map((lecturer) => ({ ...lecturer, photoUrl: null })),
			meta: { count: data.length }
		});
	} catch (error) {
		return next(error);
	}
}

export async function getNews(request, response, next) {
	const page = getPage(request.query.page);
	if (page === null) return sendInvalid(response, 'page', 'Harus berupa bilangan bulat positif.');

	try {
		const pool = getDatabasePool();
		const whereSql = "WHERE status = 'published' AND published_at IS NOT NULL";
		const meta = await getPageMeta(pool, 'news', whereSql, [], page);
		const offset = (page - 1) * pageSize;
		const [data] = await pool.execute(
			`SELECT id, title, slug, excerpt, NULL AS thumbnailUrl,
				DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s+08:00') AS publishedAt
			 FROM news ${whereSql}
			 ORDER BY published_at DESC, id DESC LIMIT ? OFFSET ?`,
			[pageSize, offset]
		);
		return response.json({ success: true, data, meta });
	} catch (error) {
		return next(error);
	}
}

export async function getNewsBySlug(request, response, next) {
	const { slug } = request.params;
	if (!isValidSlug(slug)) return sendInvalid(response, 'slug', 'Format slug tidak valid.');

	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT id, title, slug, excerpt, content, NULL AS thumbnailUrl,
				DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s+08:00') AS publishedAt
			 FROM news
			 WHERE slug = ? AND status = 'published' AND published_at IS NOT NULL
			 LIMIT 1`,
			[slug]
		);
		if (!rows.length) {
			return response.status(404).json({
				success: false,
				status: 404,
				message: 'Konten tidak ditemukan.'
			});
		}
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return next(error);
	}
}

export async function getProjects(request, response, next) {
	const page = getPage(request.query.page);
	if (page === null) return sendInvalid(response, 'page', 'Harus berupa bilangan bulat positif.');
	const { category } = request.query;
	if (category !== undefined && (typeof category !== 'string' || !projectCategories.has(category))) {
		return sendInvalid(response, 'category', 'Kategori tidak valid.');
	}

	const whereSql = category === undefined ? '' : 'WHERE category = ?';
	const params = category === undefined ? [] : [category];
	try {
		const pool = getDatabasePool();
		const meta = await getPageMeta(pool, 'projects', whereSql, params, page);
		const offset = (page - 1) * pageSize;
		const [data] = await pool.execute(
			`SELECT id, title, slug, description, NULL AS thumbnailUrl, category,
				student_name AS studentName, project_year AS projectYear, external_url AS externalUrl
			 FROM projects ${whereSql}
			 ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
			[...params, pageSize, offset]
		);
		return response.json({ success: true, data, meta });
	} catch (error) {
		return next(error);
	}
}

export async function getProjectBySlug(request, response, next) {
	const { slug } = request.params;
	if (!isValidSlug(slug)) return sendInvalid(response, 'slug', 'Format slug tidak valid.');

	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT id, title, slug, description, NULL AS thumbnailUrl, category,
				student_name AS studentName, project_year AS projectYear, external_url AS externalUrl
			 FROM projects WHERE slug = ? LIMIT 1`,
			[slug]
		);
		if (!rows.length) {
			return response.status(404).json({
				success: false,
				status: 404,
				message: 'Konten tidak ditemukan.'
			});
		}
		return response.json({ success: true, data: rows[0] });
	} catch (error) {
		return next(error);
	}
}

export async function getAccreditationDocuments(_request, response, next) {
	try {
		const [data] = await getDatabasePool().execute(
			`SELECT id, title, description, NULL AS fileUrl, source_url AS sourceUrl, published_at AS publishedAt
			 FROM accreditation_documents
			 WHERE status = 'published'
			 ORDER BY published_at DESC, id DESC`
		);
		return response.json({ success: true, data, meta: { count: data.length } });
	} catch (error) {
		return next(error);
	}
}
