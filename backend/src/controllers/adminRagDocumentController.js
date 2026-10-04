import { createHash, randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { PDFParse } from 'pdf-parse';
import { getDatabasePool } from '../config/database.js';
import { storageRoot } from '../media/storage.js';
import { processDocumentEmbeddings } from '../services/embeddingService.js';

const ragStorageDirectory = resolve(storageRoot, 'rag');
const chunkTargetCharacters = 1600;
const chunkOverlapCharacters = 200;

function errorResponse(response, status, message, errors) {
	return response.status(status).json({
		success: false,
		status,
		message,
		...(errors ? { errors } : {})
	});
}

function splitLongParagraph(paragraph) {
	const chunks = [];
	for (let start = 0; start < paragraph.length; start += chunkTargetCharacters - chunkOverlapCharacters) {
		chunks.push(paragraph.slice(start, start + chunkTargetCharacters));
	}
	return chunks;
}

function chunkPageText(text, pageNumber) {
	const paragraphs = text
		.replace(/\r\n?/g, '\n')
		.split(/\n\s*\n/)
		.map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
		.filter(Boolean);
	const chunks = [];
	let current = '';

	for (const paragraph of paragraphs) {
		if (paragraph.length > chunkTargetCharacters) {
			if (current) chunks.push({ chunkText: current, pageNumber });
			current = '';
			const pieces = splitLongParagraph(paragraph);
			for (const piece of pieces) chunks.push({ chunkText: piece, pageNumber });
			continue;
		}
		const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
		if (candidate.length > chunkTargetCharacters) {
			chunks.push({ chunkText: current, pageNumber });
			current = current.slice(-chunkOverlapCharacters);
		}
		const next = current ? `${current}\n\n${paragraph}` : paragraph;
		if (next.length > chunkTargetCharacters) {
			current = paragraph;
		} else {
			current = next;
		}
	}
	if (current) chunks.push({ chunkText: current, pageNumber });
	return chunks;
}

function makeChunks(pages) {
	const chunks = [];
	for (const page of pages) {
		chunks.push(...chunkPageText(page.text || '', Number(page.num) || null));
	}
	return chunks.map((chunk, index) => ({ ...chunk, chunkOrder: index }));
}

function isPdf(buffer) {
	return buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-';
}

async function extractPdfPages(buffer) {
	const parser = new PDFParse({ data: buffer });
	try {
		const result = await parser.getText();
		return result.pages;
	} finally {
		await parser.destroy();
	}
}

export async function listRagDocuments(_request, response, next) {
	try {
		const [rows] = await getDatabasePool().execute(
			`SELECT id, title, description, original_filename AS originalFilename,
				file_sha256 AS fileSha256, status, error_message AS errorMessage,
				created_at AS createdAt, updated_at AS updatedAt
			 FROM rag_documents ORDER BY created_at DESC, id DESC`
		);
		return response.status(200).json({ success: true, data: rows });
	} catch (error) {
		return next(error);
	}
}

export async function uploadRagDocument(request, response, next) {
	const title = typeof request.body?.title === 'string' ? request.body.title.trim() : '';
	const description = typeof request.body?.description === 'string' ? request.body.description.trim() || null : null;
	const errors = {};
	if (!title) errors.title = 'Judul wajib diisi.';
	else if (title.length > 200) errors.title = 'Maksimal 200 karakter.';
	if (description && description.length > 65535) errors.description = 'Maksimal 65.535 karakter.';
	if (!request.file) errors.file = 'Pilih satu file PDF.';
	if (Object.keys(errors).length) return errorResponse(response, 400, 'Data dokumen RAG tidak valid.', errors);
	if (!isPdf(request.file.buffer)) {
		return errorResponse(response, 400, 'Isi file bukan PDF yang valid.', { file: 'Pilih file PDF dengan signature %PDF-.' });
	}

	const fileSha256 = createHash('sha256').update(request.file.buffer).digest('hex');
	const pool = getDatabasePool();
	let filePath;
	let connection;
	let insertedDocumentId;
	try {
		const [existing] = await pool.execute('SELECT id FROM rag_documents WHERE file_sha256 = ? LIMIT 1', [fileSha256]);
		if (existing.length) {
			return errorResponse(response, 409, 'PDF dengan SHA-256 yang sama sudah terdaftar.', {
				file: 'Unggah PDF yang berbeda; dokumen lama tidak akan digunakan otomatis.'
			});
		}

		await mkdir(ragStorageDirectory, { recursive: true });
		const storedFilename = `${randomUUID()}.pdf`;
		filePath = resolve(ragStorageDirectory, storedFilename);
		await writeFile(filePath, request.file.buffer, { flag: 'wx', mode: 0o600 });

		connection = await pool.getConnection();
		const relativeFilePath = `rag/${storedFilename}`;
		const [insert] = await connection.execute(
			`INSERT INTO rag_documents
				(title, description, original_filename, file_path, file_sha256, status)
			 VALUES (?, ?, ?, ?, ?, 'processing')`,
			[title, description, basename(request.file.originalname.replaceAll('\\', '/')).slice(0, 255), relativeFilePath, fileSha256]
		);
		insertedDocumentId = insert.insertId;

		let chunks;
		let extractionError;
		try {
			const pages = await extractPdfPages(request.file.buffer);
			chunks = makeChunks(pages);
			if (!chunks.length) extractionError = 'PDF tidak memiliki teks yang dapat diproses.';
		} catch {
			extractionError = 'Teks PDF tidak dapat diekstrak. Pastikan PDF memiliki text layer.';
		}

		if (extractionError) {
			await connection.execute(
				"UPDATE rag_documents SET status = 'failed', error_message = ? WHERE id = ?",
				[extractionError, insertedDocumentId]
			);
			return response.status(201).json({
				success: true,
				data: { id: insertedDocumentId, title, status: 'failed', errorMessage: extractionError }
			});
		}

		await connection.beginTransaction();
		for (const chunk of chunks) {
			await connection.execute(
				`INSERT INTO rag_chunks (document_id, chunk_text, page_number, chunk_order, embedding, embedding_model)
				 VALUES (?, ?, ?, ?, NULL, NULL)`,
				[insertedDocumentId, chunk.chunkText, chunk.pageNumber, chunk.chunkOrder]
			);
		}
		await connection.commit();
		const embeddingResult = await processDocumentEmbeddings(insertedDocumentId);
		return response.status(201).json({
			success: true,
			data: {
				id: insertedDocumentId,
				title,
				status: embeddingResult.status,
				chunkCount: chunks.length,
				embeddedCount: embeddingResult.embeddedCount,
				...(embeddingResult.errorMessage ? { errorMessage: embeddingResult.errorMessage } : {})
			}
		});
	} catch (error) {
		if (connection) await connection.rollback().catch(() => {});
		if (error.code === 'ER_DUP_ENTRY') {
			if (!insertedDocumentId && filePath) await unlink(filePath).catch(() => {});
			return errorResponse(response, 409, 'PDF dengan SHA-256 yang sama sudah terdaftar.', {
				file: 'Unggah PDF yang berbeda; dokumen lama tidak akan digunakan otomatis.'
			});
		}
		if (!insertedDocumentId && filePath) await unlink(filePath).catch(() => {});
		return next(error);
	} finally {
		connection?.release();
	}
}

export async function deleteRagDocument(request, response, next) {
	if (!/^\d+$/.test(request.params.id) || /^0+$/.test(request.params.id)) {
		return errorResponse(response, 400, 'ID dokumen tidak valid.');
	}
	try {
		const pool = getDatabasePool();
		const [rows] = await pool.execute('SELECT id, file_path AS filePath FROM rag_documents WHERE id = ? LIMIT 1', [request.params.id]);
		if (!rows.length) return errorResponse(response, 404, 'Dokumen RAG tidak ditemukan.');
		await pool.execute('DELETE FROM rag_documents WHERE id = ?', [request.params.id]);
		await unlink(resolve(ragStorageDirectory, basename(rows[0].filePath))).catch((error) => {
			if (error.code !== 'ENOENT') console.error('RAG private file cleanup failed:', error.code || error.name);
		});
		return response.status(200).json({ success: true, data: { id: request.params.id } });
	} catch (error) {
		return next(error);
	}
}

