import { Router } from 'express';
import {
	getAccreditationDocuments,
	getLecturers,
	getNews,
	getNewsBySlug,
	getProjects,
	getProjectBySlug
} from '../controllers/publicContentController.js';
import { retrieveChatbotEvidence } from '../controllers/chatbotRetrievalController.js';
import { answerChatbotQuestion } from '../controllers/chatbotAnswerController.js';

const router = Router();

router.get('/lecturers', getLecturers);
router.get('/news', getNews);
router.get('/news/:slug', getNewsBySlug);
router.get('/projects', getProjects);
router.get('/projects/:slug', getProjectBySlug);
router.get('/accreditation-documents', getAccreditationDocuments);
router.post('/chatbot/retrieve', retrieveChatbotEvidence);
router.post('/chatbot/ask', answerChatbotQuestion);

export default router;
