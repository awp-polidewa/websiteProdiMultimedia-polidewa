import { getDatabasePool } from '../config/database.js';
import { generateEmbedding, getConfiguredEmbeddingModel, validateEmbeddingVector } from './embeddingService.js';

export const embeddingDimensions = 3072;
export const defaultTopK = 5;
export const maximumTopK = 20;
export const maximumQuestionLength = 2000;

function configuredThreshold() {
	const value = Number(process.env.SIMILARITY_THRESHOLD ?? 0.30);
	if (!Number.isFinite(value) || value < 0 || value > 1) {
		throw new Error('SIMILARITY_THRESHOLD harus berupa angka dari 0 sampai 1.');
	}
	return value;
}

export function cosineSimilarity(left, right) {
	if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || left.length !== embeddingDimensions) {
		throw new TypeError(`Embedding harus berupa dua vector dengan ${embeddingDimensions} dimensi yang sama.`);
	}
	let dot = 0;
	let leftNorm = 0;
	let rightNorm = 0;
	for (let index = 0; index < embeddingDimensions; index += 1) {
		const a = left[index];
		const b = right[index];
		if (!Number.isFinite(a) || !Number.isFinite(b)) throw new TypeError('Embedding hanya boleh berisi angka finite.');
		dot += a * b;
		leftNorm += a * a;
		rightNorm += b * b;
	}
	if (leftNorm === 0 || rightNorm === 0) return 0;
	return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function parseStoredEmbedding(value) {
	try {
		return validateEmbeddingVector(typeof value === 'string' ? JSON.parse(value) : value);
	} catch {
		return null;
	}
}

/** Search only ready-document chunks; embedding vectors never leave this service. */
export async function retrieveRelevantChunks(question, options = {}) {
	if (typeof question !== 'string' || !question.trim()) throw new TypeError('Pertanyaan wajib diisi.');
	const normalizedQuestion = question.trim();
	if (normalizedQuestion.length > maximumQuestionLength) {
		throw new RangeError(`Pertanyaan maksimal ${maximumQuestionLength} karakter.`);
	}
	const topK = options.topK ?? defaultTopK;
	if (!Number.isInteger(topK) || topK < 1 || topK > maximumTopK) {
		throw new RangeError(`topK harus berupa bilangan bulat dari 1 sampai ${maximumTopK}.`);
	}
	const threshold = options.similarityThreshold ?? configuredThreshold();
	if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
		throw new RangeError('similarityThreshold harus berupa angka dari 0 sampai 1.');
	}

	const model = getConfiguredEmbeddingModel();
	const queryVector = validateEmbeddingVector(await (options.embed ?? generateEmbedding)(normalizedQuestion));
	const [rows] = await getDatabasePool().execute(
		`SELECT c.id AS chunkId, c.document_id AS documentId, c.chunk_text AS text,
			c.page_number AS pageNumber, c.chunk_order AS chunkOrder, c.embedding,
			d.title AS documentTitle, d.original_filename AS originalFilename
		 FROM rag_chunks c
		 INNER JOIN rag_documents d ON d.id = c.document_id
		 WHERE d.status = 'ready' AND c.embedding IS NOT NULL AND c.embedding_model = ?
		 ORDER BY c.document_id, c.chunk_order, c.id`,
		[model]
	);
	const ranked = [];
	for (const row of rows) {
		const vector = parseStoredEmbedding(row.embedding);
		if (!vector) continue;
		const similarity = cosineSimilarity(queryVector, vector);
		if (similarity >= threshold) {
			ranked.push({
				chunkId: String(row.chunkId),
				documentId: String(row.documentId),
				text: row.text,
				pageNumber: row.pageNumber,
				chunkOrder: row.chunkOrder,
				similarity,
				documentTitle: row.documentTitle,
				originalFilename: row.originalFilename
			});
		}
	}
	ranked.sort((left, right) => right.similarity - left.similarity
		|| left.documentId.localeCompare(right.documentId)
		|| left.chunkOrder - right.chunkOrder
		|| left.chunkId.localeCompare(right.chunkId));
	const results = ranked.slice(0, topK);
	return { hasEvidence: results.length > 0, results };
}
