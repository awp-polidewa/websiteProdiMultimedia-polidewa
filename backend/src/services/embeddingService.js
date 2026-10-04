import { getDatabasePool } from '../config/database.js';

const expectedEmbeddingModel = 'gemini-embedding-2';
const expectedEmbeddingDimensions = 3072;
const embedContentUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
const requestTimeoutMs = 30_000;

export class GeminiEmbeddingError extends Error {
	constructor(message, code) {
		super(message);
		this.name = 'GeminiEmbeddingError';
		this.code = code;
	}
}

function getEmbeddingConfiguration() {
	const apiKey = process.env.GEMINI_API_KEY;
	const model = process.env.EMBEDDING_MODEL;
	if (!apiKey || model !== expectedEmbeddingModel) {
		throw new GeminiEmbeddingError('Konfigurasi embedding Gemini belum lengkap.', 'GEMINI_CONFIG_ERROR');
	}
	return { apiKey, model };
}

export function validateEmbeddingVector(vector) {
	if (!Array.isArray(vector) || vector.length !== expectedEmbeddingDimensions || !vector.every(Number.isFinite)) {
		throw new GeminiEmbeddingError('Gemini mengembalikan vector embedding dengan format atau dimensi tidak valid.', 'GEMINI_INVALID_VECTOR');
	}
	return vector;
}

export async function generateEmbedding(text, fetchImpl = globalThis.fetch) {
	if (typeof text !== 'string' || !text.trim()) {
		throw new GeminiEmbeddingError('Teks chunk untuk embedding tidak boleh kosong.', 'GEMINI_INVALID_INPUT');
	}
	if (typeof fetchImpl !== 'function') {
		throw new GeminiEmbeddingError('Koneksi ke Gemini tidak tersedia.', 'GEMINI_NETWORK_ERROR');
	}

	const { apiKey, model } = getEmbeddingConfiguration();
	let response;
	try {
		response = await fetchImpl(`${embedContentUrl}/${encodeURIComponent(model)}:embedContent`, {
			method: 'POST',
			headers: {
				'x-goog-api-key': apiKey,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ content: { parts: [{ text }] } }),
			signal: AbortSignal.timeout(requestTimeoutMs)
		});
	} catch (error) {
		if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
			throw new GeminiEmbeddingError('Permintaan embedding Gemini melewati batas waktu.', 'GEMINI_TIMEOUT');
		}
		throw new GeminiEmbeddingError('Koneksi ke Gemini gagal.', 'GEMINI_NETWORK_ERROR');
	}

	if (!response.ok) {
		throw new GeminiEmbeddingError(`Permintaan embedding Gemini gagal (HTTP ${response.status}).`, 'GEMINI_HTTP_ERROR');
	}

	let result;
	try {
		result = await response.json();
	} catch {
		throw new GeminiEmbeddingError('Response embedding Gemini bukan JSON yang valid.', 'GEMINI_INVALID_RESPONSE');
	}
	return validateEmbeddingVector(result?.embedding?.values);
}

/** Embed only missing vectors, preserving chunks that already succeeded. */
export async function processDocumentEmbeddings(documentId, { embed = generateEmbedding } = {}) {
	const pool = getDatabasePool();
	let embeddedCount = 0;

	try {
		const { model } = getEmbeddingConfiguration();
		const [chunks] = await pool.execute(
			`SELECT id, chunk_text AS chunkText
			 FROM rag_chunks
			 WHERE document_id = ? AND embedding IS NULL
			 ORDER BY chunk_order, id`,
			[documentId]
		);
		await pool.execute(
			"UPDATE rag_documents SET status = 'processing', error_message = NULL WHERE id = ?",
			[documentId]
		);
		for (const chunk of chunks) {
			const vector = validateEmbeddingVector(await embed(chunk.chunkText));
			await pool.execute(
				`UPDATE rag_chunks
				 SET embedding = ?, embedding_model = ?
				 WHERE id = ? AND document_id = ? AND embedding IS NULL`,
				[JSON.stringify(vector), model, chunk.id, documentId]
			);
			embeddedCount += 1;
		}
		const [remaining] = await pool.execute(
			'SELECT COUNT(*) AS count FROM rag_chunks WHERE document_id = ? AND embedding IS NULL',
			[documentId]
		);
		if (Number(remaining[0].count) > 0) {
			throw new GeminiEmbeddingError('Masih ada chunk yang belum memiliki embedding.', 'GEMINI_INCOMPLETE_DOCUMENT');
		}
		await pool.execute(
			"UPDATE rag_documents SET status = 'ready', error_message = NULL WHERE id = ?",
			[documentId]
		);
		return { status: 'ready', embeddedCount };
	} catch (error) {
		const safeMessage = error instanceof GeminiEmbeddingError
			? error.message
			: 'Proses embedding gagal karena kesalahan internal.';
		await pool.execute(
			"UPDATE rag_documents SET status = 'failed', error_message = ? WHERE id = ?",
			[safeMessage, documentId]
		);
		return { status: 'failed', embeddedCount, errorMessage: safeMessage };
	}
}
