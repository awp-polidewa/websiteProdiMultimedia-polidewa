import { Router } from 'express';
import {
	getAdminSession,
	loginAdmin,
	logoutAdmin
} from '../controllers/adminAuthController.js';
import {
	createNews,
	deleteNews,
	getAdminNews,
	getAdminNewsById,
	updateNews
} from '../controllers/adminNewsController.js';
import {
	createLecturer,
	deleteLecturer,
	getAdminLecturerById,
	getAdminLecturers,
	updateLecturer
} from '../controllers/adminLecturerController.js';
import {
	createProject,
	deleteProject,
	getAdminProjectById,
	getAdminProjects,
	updateProject
} from '../controllers/adminProjectController.js';
import {
	createAccreditationDocument,
	deleteAccreditationDocument,
	getAdminAccreditationDocumentById,
	getAdminAccreditationDocuments,
	updateAccreditationDocument
} from '../controllers/adminAccreditationDocumentController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
	handleMediaUploadError,
	receiveMedia,
	validateMediaType
} from '../middleware/mediaUpload.js';
import { uploadMedia } from '../controllers/adminMediaController.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/session', requireAdmin, getAdminSession);
router.post('/media/upload', requireAdmin, validateMediaType, receiveMedia, uploadMedia, handleMediaUploadError);
router.route('/news').all(requireAdmin).get(getAdminNews).post(createNews);
router
	.route('/news/:id')
	.all(requireAdmin)
	.get(getAdminNewsById)
	.put(updateNews)
	.delete(deleteNews);
router.route('/projects').all(requireAdmin).get(getAdminProjects).post(createProject);
router
	.route('/projects/:id')
	.all(requireAdmin)
	.get(getAdminProjectById)
	.put(updateProject)
	.delete(deleteProject);
router.route('/lecturers').all(requireAdmin).get(getAdminLecturers).post(createLecturer);
router
	.route('/lecturers/:id')
	.all(requireAdmin)
	.get(getAdminLecturerById)
	.put(updateLecturer)
	.delete(deleteLecturer);
router.route('/accreditation-documents').all(requireAdmin)
	.get(getAdminAccreditationDocuments)
	.post(createAccreditationDocument);
router.route('/accreditation-documents/:id').all(requireAdmin)
	.get(getAdminAccreditationDocumentById)
	.put(updateAccreditationDocument)
	.delete(deleteAccreditationDocument);

export default router;
