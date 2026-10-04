import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cosineSimilarity, maximumQuestionLength, retrieveRelevantChunks } from '../src/services/retrievalService.js';

const vector = (first, second = 0) => [first, second, ...Array(3070).fill(0)];

test('cosine similarity is 1 for identical vectors and 0 for orthogonal vectors', () => {
	assert.ok(Math.abs(cosineSimilarity(vector(1, 2), vector(1, 2)) - 1) < 1e-12);
	assert.equal(cosineSimilarity(vector(1), vector(0, 1)), 0);
});

test('cosine similarity rejects dimension mismatch and safely handles zero vectors', () => {
	assert.throws(() => cosineSimilarity([1], [1]), /3072/);
	assert.equal(cosineSimilarity(vector(0), vector(1)), 0);
	assert.equal(cosineSimilarity(vector(1), vector(0)), 0);
});

test('retrieval validates a nonempty, bounded question before embedding', async () => {
	let embeddingCalls = 0;
	const embed = async () => { embeddingCalls += 1; return vector(1); };
	await assert.rejects(retrieveRelevantChunks('  ', { embed }), /wajib diisi/);
	await assert.rejects(retrieveRelevantChunks('x'.repeat(maximumQuestionLength + 1), { embed }), /maksimal/);
	assert.equal(embeddingCalls, 0);
});
