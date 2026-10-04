import 'dotenv/config';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GeminiEmbeddingError, generateEmbedding } from '../src/services/embeddingService.js';

const validValues = Array.from({ length: 3072 }, (_, index) => index / 3072);

test('Gemini adapter returns a validated 3072-dimension vector', async () => {
	let requestUrl;
	let requestOptions;
	const vector = await generateEmbedding('Fixture text for a unit test.', async (url, options) => {
		requestUrl = url;
		requestOptions = options;
		return new Response(JSON.stringify({ embedding: { values: validValues } }), { status: 200 });
	});
	assert.match(requestUrl, /models\/gemini-embedding-2:embedContent$/);
	assert.equal(requestOptions.method, 'POST');
	assert.ok(requestOptions.headers['x-goog-api-key']);
	assert.equal(vector.length, 3072);
	assert.ok(vector.every(Number.isFinite));
});

test('Gemini HTTP errors are sanitized and do not echo provider response text', async () => {
	await assert.rejects(
		generateEmbedding('Fixture text.', async () => new Response(
			JSON.stringify({ error: { message: 'sensitive provider response text' } }),
			{ status: 503 }
		)),
		(error) => {
			assert.ok(error instanceof GeminiEmbeddingError);
			assert.equal(error.code, 'GEMINI_HTTP_ERROR');
			assert.match(error.message, /HTTP 503/);
			assert.doesNotMatch(error.message, /sensitive provider response text|AIza[0-9A-Za-z_-]{20,}/);
			return true;
		}
	);
});

test('Gemini malformed, empty, or wrong-dimension vectors are rejected', async () => {
	const responses = [
		new Response('{invalid json', { status: 200 }),
		new Response(JSON.stringify({ embedding: { values: [] } }), { status: 200 }),
		new Response(JSON.stringify({ embedding: { values: [1, 2, 3] } }), { status: 200 })
	];
	for (const response of responses) {
		await assert.rejects(generateEmbedding('Fixture text.', async () => response.clone()), GeminiEmbeddingError);
	}
});

test('Gemini timeout and network failures expose safe errors', async () => {
	for (const error of [
		Object.assign(new Error('timeout detail'), { name: 'TimeoutError' }),
		new Error('network detail')
	]) {
		await assert.rejects(
			generateEmbedding('Fixture text.', async () => { throw error; }),
			(result) => {
				assert.ok(result instanceof GeminiEmbeddingError);
				assert.doesNotMatch(result.message, /timeout detail|network detail|AIza[0-9A-Za-z_-]{20,}/);
				return true;
			}
		);
	}
});
