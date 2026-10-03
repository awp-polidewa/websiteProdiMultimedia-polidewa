import { Router } from 'express';
import {
	getAccreditationDocuments,
	getLecturers,
	getNews,
	getNewsBySlug,
	getProjects,
	getProjectBySlug
} from '../controllers/publicContentController.js';

const router = Router();

router.get('/lecturers', getLecturers);
router.get('/news', getNews);
router.get('/news/:slug', getNewsBySlug);
router.get('/projects', getProjects);
router.get('/projects/:slug', getProjectBySlug);
router.get('/accreditation-documents', getAccreditationDocuments);

export default router;
