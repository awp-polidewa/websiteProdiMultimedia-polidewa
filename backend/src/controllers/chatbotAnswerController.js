import { GeminiAnswerError, generateRagAnswer } from '../services/answerService.js';
import { maximumQuestionLength } from '../services/retrievalService.js';

export async function answerChatbotQuestion(request, response, next) {
	const { question } = request.body || {};
	if (typeof question !== 'string' || !question.trim()) {
		return response.status(400).json({ success: false, status: 400, message: 'Pertanyaan wajib diisi.' });
	}
	if (question.trim().length > maximumQuestionLength) {
		return response.status(400).json({ success: false, status: 400, message: `Pertanyaan maksimal ${maximumQuestionLength} karakter.` });
	}
	try {
		return response.status(200).json(await generateRagAnswer(question));
	} catch (error) {
		if (error instanceof TypeError || error instanceof RangeError) {
			return response.status(400).json({ success: false, status: 400, message: error.message });
		}
		if (error instanceof GeminiAnswerError) {
			console.error('Chatbot answer generation failed:', error.code);
			return response.status(502).json({
				success: false,
				status: 502,
				message: 'Layanan generasi jawaban tidak tersedia.'
			});
		}
		return next(error);
	}
}
