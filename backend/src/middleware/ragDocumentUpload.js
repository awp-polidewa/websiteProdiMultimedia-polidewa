import multer from 'multer';

export const maxRagPdfBytes = 15 * 1024 * 1024;

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: maxRagPdfBytes, files: 1, fields: 2, parts: 3 },
	fileFilter(_request, file, callback) {
		const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
		if (extension !== '.pdf' || file.mimetype !== 'application/pdf') {
			return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
		}
		return callback(null, true);
	}
}).single('file');

export function receiveRagDocument(request, response, next) {
	return upload(request, response, (error) => {
		if (!error) return next();
		if (error instanceof multer.MulterError) {
			const tooLarge = error.code === 'LIMIT_FILE_SIZE';
			return response.status(tooLarge ? 413 : 400).json({
				success: false,
				status: tooLarge ? 413 : 400,
				message: tooLarge ? 'Ukuran PDF melewati batas.' : 'File tidak valid untuk dokumen RAG.',
				errors: { file: tooLarge ? 'Maksimal 15 MB.' : 'Pilih satu file PDF dengan MIME application/pdf.' }
			});
		}
		return next(error);
	});
}
