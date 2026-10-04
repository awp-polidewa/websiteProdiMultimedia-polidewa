import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { mediaTypes, removeStoredFile, storageRoot } from '../media/storage.js';

function hasValidSignature(buffer, extension) {
	switch (extension) {
		case '.jpg':
		case '.jpeg':
			return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
		case '.png':
			return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
		case '.webp':
			return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
		case '.pdf':
			return buffer.length >= 5 && buffer.toString('ascii', 0, 5) === '%PDF-';
		default:
			return false;
	}
}

export async function uploadMedia(request, response, next) {
	if (!request.file) {
		return response.status(400).json({
			success: false,
			status: 400,
			message: 'File wajib dipilih.',
			errors: { file: 'Pilih satu file untuk diunggah.' }
		});
	}

	try {
		const extension = extname(request.file.filename).toLowerCase();
		const fileBytes = await readFile(request.file.path);
		if (!hasValidSignature(fileBytes, extension)) {
			await removeStoredFile(request.file.path);
			return response.status(400).json({
				success: false,
				status: 400,
				message: 'Isi file tidak cocok dengan tipe media yang dipilih.',
				errors: { file: 'Pilih file gambar atau PDF yang valid.' }
			});
		}

		const path = `${request.mediaType}/${request.file.filename}`;
		return response.status(201).json({
			success: true,
			data: {
				path,
				url: `/media/${path}`,
				type: request.mediaType,
				mimeType: request.file.mimetype,
				size: request.file.size
			}
		});
	} catch (error) {
		await removeStoredFile(request.file.path).catch(() => {});
		return next(error);
	}
}

const publicMimeTypes = Object.freeze({
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.pdf': 'application/pdf'
});

export async function serveMedia(request, response) {
	const { type, filename } = request.params;
	if (!Object.hasOwn(mediaTypes, type) || !/^[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp|pdf)$/i.test(filename)) {
		return response.status(404).json({ success: false, status: 404, message: 'Media tidak ditemukan.' });
	}
	const extension = extname(filename).toLowerCase();
	if (!mediaTypes[type].extensions.has(extension)) {
		return response.status(404).json({ success: false, status: 404, message: 'Media tidak ditemukan.' });
	}
	const path = resolve(storageRoot, type, filename);
	response.setHeader('X-Content-Type-Options', 'nosniff');
	response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
	response.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
	response.setHeader('Content-Disposition', extension === '.pdf' ? 'attachment' : 'inline');
	response.type(publicMimeTypes[extension]);
	return response.sendFile(path, (error) => {
		if (error && !response.headersSent) {
			response.status(error.code === 'ENOENT' ? 404 : 500).json({
				success: false,
				status: error.code === 'ENOENT' ? 404 : 500,
				message: error.code === 'ENOENT' ? 'Media tidak ditemukan.' : 'Media tidak dapat disajikan.'
			});
		}
	});
}
