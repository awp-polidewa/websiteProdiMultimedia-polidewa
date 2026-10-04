import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { createServer } from 'node:net';
import { after, before, test } from 'node:test';
import { basename, resolve } from 'node:path';
import mysql from 'mysql2/promise';
import { createAdminSessionCookie } from '../src/auth/adminSession.js';
import { closeDatabasePool } from '../src/config/database.js';
import { storageRoot } from '../src/media/storage.js';
import { GeminiEmbeddingError, processDocumentEmbeddings } from '../src/services/embeddingService.js';
import { retrieveRelevantChunks } from '../src/services/retrievalService.js';

const apiPath = '/api/admin/rag/documents';
const database = mysql.createPool({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: 4,
	dateStrings: true
});

let child;
let baseUrl;
let adminCookie;
let adminId;
let documentId;
let failedDocumentId;
const retrievalDocumentIds = [];
let storedPath;
let pdfFixture;
let testNidn;
let testUsername;
let childOutput = '';
const title = `T37.1 Integration ${randomUUID()}`;

function makePdf(text) {
	const escapePdfText = (value) => value.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
	const stream = `BT /F1 18 Tf 72 720 Td (${escapePdfText(text)}) Tj ET`;
	const objects = [
		'<< /Type /Catalog /Pages 2 0 R >>',
		'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
		'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
		'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
		`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`
	];
	let pdf = '%PDF-1.4\n';
	const offsets = [0];
	for (let index = 0; index < objects.length; index += 1) {
		offsets.push(Buffer.byteLength(pdf));
		pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
	}
	const xrefOffset = Buffer.byteLength(pdf);
	pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
	return Buffer.from(pdf, 'ascii');
}

async function getFreePort() {
	const server = createServer();
	await new Promise((resolveListen, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolveListen);
	});
	const { port } = server.address();
	await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
	return port;
}

async function upload({ buffer, filename = 'approved-source.pdf', mimetype = 'application/pdf', authenticated = true } = {}) {
	const form = new FormData();
	form.set('title', title);
	form.set('description', 'Disposable T37.1 integration fixture');
	if (buffer) form.set('file', new Blob([buffer], { type: mimetype }), filename);
	return fetch(`${baseUrl}${apiPath}`, {
		method: 'POST',
		headers: authenticated ? { Cookie: adminCookie } : {},
		body: form
	});
}

async function json(response) {
	return response.json();
}

before(async () => {
	assert.equal(process.env.DB_NAME, 'web_trm_dev', 'integration suite is restricted to web_trm_dev');
	assert.ok(process.env.SESSION_SECRET && Buffer.byteLength(process.env.SESSION_SECRET) >= 32);
	assert.ok(process.env.GEMINI_API_KEY, 'Gemini API key must be configured locally for this real integration test');
	assert.equal(process.env.EMBEDDING_MODEL, 'gemini-embedding-2');
	const port = await getFreePort();
	baseUrl = `http://127.0.0.1:${port}`;
	testNidn = `T${randomUUID().replaceAll('-', '').slice(0, 19)}`;
	testUsername = `t37_${randomUUID().replaceAll('-', '').slice(0, 30)}`;
	const [admin] = await database.execute(
		'INSERT INTO admins (name, nidn, username, password_hash) VALUES (?, ?, ?, ?)',
		[title, testNidn, testUsername, 'integration-test-only']
	);
	adminId = admin.insertId;
	adminCookie = createAdminSessionCookie(adminId);
	pdfFixture = makePdf(`T37.1 integration fixture ${randomUUID()}`);
	child = spawn(process.execPath, ['src/app.js'], {
		cwd: new URL('..', import.meta.url),
		env: { ...process.env, PORT: String(port), NODE_ENV: 'test' },
		stdio: ['ignore', 'pipe', 'pipe']
	});
	child.stdout.setEncoding('utf8').on('data', (value) => { childOutput += value; });
	child.stderr.setEncoding('utf8').on('data', (value) => { childOutput += value; });
	let ready = false;
	for (let attempt = 0; attempt < 100; attempt += 1) {
		if (child.exitCode !== null) throw new Error(`API exited before startup (${child.exitCode}).`);
		try {
			const response = await fetch(`${baseUrl}/api/health`);
			if (response.ok) { ready = true; break; }
		} catch {}
		await new Promise((resolveWait) => setTimeout(resolveWait, 100));
	}
	assert.ok(ready, 'local API should start for integration tests');
});

after(async () => {
	if (child && child.exitCode === null) {
		child.kill();
		await new Promise((resolveExit) => child.once('exit', resolveExit));
	}
	if (documentId) {
		const [rows] = await database.execute('SELECT file_path AS filePath FROM rag_documents WHERE id = ?', [documentId]);
		await database.execute('DELETE FROM rag_documents WHERE id = ?', [documentId]);
		if (rows[0]?.filePath) await unlink(resolve(storageRoot, rows[0].filePath)).catch(() => {});
	}
	if (failedDocumentId) await database.execute('DELETE FROM rag_documents WHERE id = ?', [failedDocumentId]);
	for (const id of retrievalDocumentIds) await database.execute('DELETE FROM rag_documents WHERE id = ?', [id]);
	if (adminId) await database.execute('DELETE FROM admins WHERE id = ?', [adminId]);
	await closeDatabasePool();
	await database.end();
});

test('unauthenticated upload is rejected before file processing', async () => {
	const response = await upload({ buffer: pdfFixture, authenticated: false });
	assert.equal(response.status, 401);
});

test('valid PDF upload creates a ready document after Gemini embeddings', async () => {
	const response = await upload({ buffer: pdfFixture });
	const body = await json(response);
	assert.equal(response.status, 201);
	assert.ok(body.data.id);
	documentId = body.data.id;
	assert.equal(body.data.status, 'ready', body.data.errorMessage || 'Embedding did not complete.');
	assert.equal(Number(body.data.embeddedCount), Number(body.data.chunkCount));
	const [rows] = await database.execute(
		'SELECT id, title, status, file_path AS filePath FROM rag_documents WHERE id = ?', [documentId]
	);
	assert.equal(rows.length, 1);
	assert.equal(rows[0].title, title);
	assert.equal(rows[0].status, 'ready');
	storedPath = rows[0].filePath;
	assert.ok(storedPath.startsWith('rag/'));
});

test('valid PDF creates page chunks with ordered, valid Gemini vectors', async () => {
	const [rows] = await database.execute(
		`SELECT chunk_text AS chunkText, page_number AS pageNumber, chunk_order AS chunkOrder,
			embedding, embedding_model AS embeddingModel
		 FROM rag_chunks WHERE document_id = ? ORDER BY chunk_order`, [documentId]
	);
	assert.ok(rows.length > 0);
	assert.equal(rows[0].pageNumber, 1);
	assert.equal(rows[0].chunkOrder, 0);
	assert.match(rows[0].chunkText, /T37\.1 integration fixture/);
	const vector = typeof rows[0].embedding === 'string' ? JSON.parse(rows[0].embedding) : rows[0].embedding;
	assert.ok(Array.isArray(vector));
	assert.equal(vector.length, 3072);
	assert.ok(vector.every(Number.isFinite));
	assert.equal(rows[0].embeddingModel, 'gemini-embedding-2');
});

test('already embedded chunks are skipped without another provider call', async () => {
	let providerCalls = 0;
	const result = await processDocumentEmbeddings(documentId, {
		embed: async () => { providerCalls += 1; throw new Error('Should not be called'); }
	});
	assert.deepEqual(result, { status: 'ready', embeddedCount: 0 });
	assert.equal(providerCalls, 0);
});

test('Gemini failure leaves document failed and preserves the source chunk', async () => {
	const fileSha256 = randomUUID().replaceAll('-', '').padEnd(64, '0');
	const [document] = await database.execute(
		`INSERT INTO rag_documents (title, original_filename, file_path, file_sha256, status)
		 VALUES (?, 'failure-fixture.pdf', 'rag/failure-fixture.pdf', ?, 'processing')`,
		[`T37.2 failure ${randomUUID()}`, fileSha256]
	);
	failedDocumentId = document.insertId;
	await database.execute(
		`INSERT INTO rag_chunks (document_id, chunk_text, page_number, chunk_order, embedding, embedding_model)
		 VALUES (?, 'Preserve this test chunk.', 4, 2, NULL, NULL)`,
		[failedDocumentId]
	);
	const result = await processDocumentEmbeddings(failedDocumentId, {
		embed: async () => { throw new GeminiEmbeddingError('Permintaan embedding Gemini gagal (HTTP 503).', 'GEMINI_HTTP_ERROR'); }
	});
	assert.equal(result.status, 'failed');
	assert.equal(result.embeddedCount, 0);
	assert.equal(result.errorMessage, 'Permintaan embedding Gemini gagal (HTTP 503).');
	assert.doesNotMatch(result.errorMessage, /AIza[0-9A-Za-z_-]{20,}/);
	const [docs] = await database.execute('SELECT status, error_message AS errorMessage FROM rag_documents WHERE id = ?', [failedDocumentId]);
	const [chunks] = await database.execute(
		`SELECT chunk_text AS chunkText, page_number AS pageNumber, chunk_order AS chunkOrder,
			embedding, embedding_model AS embeddingModel FROM rag_chunks WHERE document_id = ?`,
		[failedDocumentId]
	);
	assert.equal(docs[0].status, 'failed');
	assert.equal(chunks[0].chunkText, 'Preserve this test chunk.');
	assert.equal(chunks[0].pageNumber, 4);
	assert.equal(chunks[0].chunkOrder, 2);
	assert.equal(chunks[0].embedding, null);
	assert.equal(chunks[0].embeddingModel, null);
});

test('PDF larger than 15 MB is rejected', async () => {
	const response = await upload({ buffer: Buffer.alloc(15 * 1024 * 1024 + 1, 0x61) });
	assert.equal(response.status, 413);
});

test('non-PDF upload is rejected', async () => {
	const response = await upload({ buffer: Buffer.from('plain text'), filename: 'source.txt', mimetype: 'text/plain' });
	assert.equal(response.status, 400);
});

test('PDF with a false signature is rejected', async () => {
	const response = await upload({ buffer: Buffer.from('not a real PDF file'), filename: 'fake.pdf' });
	assert.equal(response.status, 400);
});

test('duplicate SHA-256 is rejected with HTTP 409', async () => {
	const response = await upload({ buffer: pdfFixture, filename: 'same-content-different-name.pdf' });
	assert.equal(response.status, 409);
	const body = await json(response);
	assert.match(body.message, /SHA-256/);
	const [rows] = await database.execute('SELECT COUNT(*) AS count FROM rag_documents WHERE file_sha256 = SHA2(?, 256)', [pdfFixture]);
	assert.equal(Number(rows[0].count), 1);
});

test('admin document list returns the uploaded record', async () => {
	const response = await fetch(`${baseUrl}${apiPath}`, { headers: { Cookie: adminCookie } });
	const body = await json(response);
	assert.equal(response.status, 200);
	assert.ok(body.data.some((item) => String(item.id) === String(documentId)));
});

test('Gemini API key does not appear in HTTP responses or backend logs', async () => {
	const response = await fetch(`${baseUrl}${apiPath}`, { headers: { Cookie: adminCookie } });
	const responseText = await response.text();
	assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(responseText), false, 'Gemini credential pattern must not appear in API responses');
	assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(childOutput), false, 'Gemini credential pattern must not appear in backend logs');
});

test('private RAG file cannot be served through public media route', async () => {
	const response = await fetch(`${baseUrl}/media/rag/${basename(storedPath)}`);
	assert.equal(response.status, 404);
});

test('delete document removes its chunks and private file', async () => {
	const absolutePath = resolve(storageRoot, storedPath);
	assert.ok(existsSync(absolutePath));
	const response = await fetch(`${baseUrl}${apiPath}/${documentId}`, {
		method: 'DELETE',
		headers: { Cookie: adminCookie }
	});
	assert.equal(response.status, 200);
	const [documents] = await database.execute('SELECT COUNT(*) AS count FROM rag_documents WHERE id = ?', [documentId]);
	const [chunks] = await database.execute('SELECT COUNT(*) AS count FROM rag_chunks WHERE document_id = ?', [documentId]);
	assert.equal(Number(documents[0].count), 0);
	assert.equal(Number(chunks[0].count), 0);
	assert.equal(existsSync(absolutePath), false);
	documentId = undefined;
});

test('retrieval ranks only ready chunks, applies topK and threshold, and omits stored vectors', async () => {
	const fixtureVector = [1, 0, ...Array(3070).fill(0)];
	const orthogonalVector = [0, 1, ...Array(3070).fill(0)];
	async function makeDocument(status, label, chunks) {
		const [document] = await database.execute(
			`INSERT INTO rag_documents (title, original_filename, file_path, file_sha256, status)
			 VALUES (?, ?, ?, ?, ?)`,
			[`Retrieval ${label} ${randomUUID()}`, `${label}.pdf`, `rag/${label}.pdf`, randomUUID().replaceAll('-', '').padEnd(64, '0'), status]
		);
		const id = document.insertId;
		retrievalDocumentIds.push(id);
		for (const chunk of chunks) {
			await database.execute(
				`INSERT INTO rag_chunks (document_id, chunk_text, page_number, chunk_order, embedding, embedding_model)
				 VALUES (?, ?, ?, ?, ?, 'gemini-embedding-2')`,
				[id, chunk.text, chunk.page, chunk.order, JSON.stringify(chunk.vector)]
			);
		}
		return id;
	}
	const readyId = await makeDocument('ready', 'ready', [
		{ text: 'Exact fixture evidence.', page: 2, order: 0, vector: fixtureVector },
		{ text: 'Orthogonal fixture evidence.', page: 3, order: 1, vector: orthogonalVector },
		{ text: 'Second exact fixture evidence.', page: 4, order: 2, vector: fixtureVector }
	]);
	await makeDocument('pending', 'pending', [
		{ text: 'Must not be visible.', page: 1, order: 0, vector: fixtureVector }
	]);
	await makeDocument('failed', 'failed', [
		{ text: 'Must not be visible either.', page: 1, order: 0, vector: fixtureVector }
	]);
	const ranked = await retrieveRelevantChunks('fixture question', {
		embed: async () => fixtureVector,
		topK: 1,
		similarityThreshold: 0.8
	});
	assert.equal(ranked.hasEvidence, true);
	assert.equal(ranked.results.length, 1);
	assert.equal(ranked.results[0].documentId, String(readyId));
	assert.equal(ranked.results[0].text, 'Exact fixture evidence.');
	assert.equal(ranked.results[0].pageNumber, 2);
	assert.equal(ranked.results[0].chunkOrder, 0);
	assert.ok(Math.abs(ranked.results[0].similarity - 1) < 1e-12);
	assert.equal(Object.hasOwn(ranked.results[0], 'embedding'), false);
	assert.equal(Object.hasOwn(ranked.results[0], 'vector'), false);

	const noEvidence = await retrieveRelevantChunks('fixture question', {
		embed: async () => [0, 0, ...Array(3070).fill(0)],
		similarityThreshold: 0.3
	});
	assert.deepEqual(noEvidence, { hasEvidence: false, results: [] });
	const response = await fetch(`${baseUrl}/api/chatbot/retrieve`, {
		method: 'POST', headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ question: `integration retrieval ${randomUUID()}`, topK: 2 })
	});
	const responseText = await response.text();
	assert.equal(response.status, 200, responseText);
	const body = JSON.parse(responseText);
	assert.equal(body.success, true);
	assert.equal(typeof body.data.hasEvidence, 'boolean');
	assert.ok(Array.isArray(body.data.results));
	assert.doesNotMatch(responseText, /AIza[0-9A-Za-z_-]{20,}/);
	assert.doesNotMatch(childOutput, /AIza[0-9A-Za-z_-]{20,}/);
	for (const result of body.data.results) {
		assert.equal(Object.hasOwn(result, 'embedding'), false);
		assert.equal(Object.hasOwn(result, 'vector'), false);
	}
});

test('retrieval endpoint rejects empty and invalid questions without calling Gemini', async () => {
	for (const body of [{ question: '  ' }, { question: 'ok', topK: 0 }]) {
		const response = await fetch(`${baseUrl}/api/chatbot/retrieve`, {
			method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
		});
		assert.equal(response.status, 400);
	}
});
