import multer from 'multer';
import { createSafeStorage, hasAllowedExtension, mediaTypes } from '../media/storage.js';

export function validateMediaType(request, response, next) {
	const type = request.query.type;
	if (typeof type !== 'string' || !Object.hasOwn(mediaTypes, type)) {
		return response.status(400).json({
			success: false,
			status: 400,
			message: 'Jenis media tidak valid.',
			errors: { type: 'Pilih lecturers, news, projects, atau accreditation.' }
		});
	}
	request.mediaType = type;
	return next();
}

const mimeTypesByExtension = Object.freeze({
	'.jpg': new Set(['image/jpeg']),
	'.jpeg': new Set(['image/jpeg']),
	'.png': new Set(['image/png']),
	'.webp': new Set(['image/webp']),
	'.pdf': new Set(['application/pdf'])
});

export function receiveMedia(request, response, next) {
	const middleware = multer({
		storage: createSafeStorage(),
		limits: {
			fileSize: mediaTypes[request.mediaType].maxBytes,
			files: 1,
			fields: 0,
			parts: 1
		},
		fileFilter(_request, file, callback) {
			const extension = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
			const allowedMimes = mimeTypesByExtension[extension];
			if (!hasAllowedExtension(request.mediaType, file.originalname) || !allowedMimes?.has(file.mimetype)) {
				return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
			}
			return callback(null, true);
		}
	}).single('file');
	return middleware(request, response, next);
}

export function handleMediaUploadError(error, _request, response, next) {
	if (!error) return next();
	if (error instanceof multer.MulterError) {
		const tooLarge = error.code === 'LIMIT_FILE_SIZE';
		return response.status(tooLarge ? 413 : 400).json({
			success: false,
			status: tooLarge ? 413 : 400,
			message: tooLarge ? 'Ukuran file melewati batas.' : 'File tidak valid untuk jenis media ini.',
			errors: { file: tooLarge ? 'Maksimal 5 MB untuk gambar dan 15 MB untuk PDF.' : 'Pilih satu file dengan tipe dan ekstensi yang didukung.' }
		});
	}
	return next(error);
}
