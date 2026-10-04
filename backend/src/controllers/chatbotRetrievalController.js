import { retrieveRelevantChunks, maximumQuestionLength, maximumTopK } from '../services/retrievalService.js';

export async function retrieveChatbotEvidence(request, response, next) {
	const { question, topK, similarityThreshold } = request.body || {};
	if (typeof question !== 'string' || !question.trim()) {
		return response.status(400).json({ success: false, status: 400, message: 'Pertanyaan wajib diisi.' });
	}
	if (question.trim().length > maximumQuestionLength) {
		return response.status(400).json({ success: false, status: 400, message: `Pertanyaan maksimal ${maximumQuestionLength} karakter.` });
	}
	if (topK !== undefined && (!Number.isInteger(topK) || topK < 1 || topK > maximumTopK)) {
		return response.status(400).json({ success: false, status: 400, message: `topK harus berupa bilangan bulat dari 1 sampai ${maximumTopK}.` });
	}
	if (similarityThreshold !== undefined && (!Number.isFinite(similarityThreshold) || similarityThreshold < 0 || similarityThreshold > 1)) {
		return response.status(400).json({ success: false, status: 400, message: 'similarityThreshold harus berupa angka dari 0 sampai 1.' });
	}
	try {
		const data = await retrieveRelevantChunks(question, { topK, similarityThreshold });
		return response.status(200).json({ success: true, data });
	} catch (error) {
		if (error instanceof TypeError || error instanceof RangeError) {
			return response.status(400).json({ success: false, status: 400, message: error.message });
		}
		return next(error);
	}
}
