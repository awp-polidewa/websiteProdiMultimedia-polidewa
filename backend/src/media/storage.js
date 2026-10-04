import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const storageRoot = resolve(moduleDirectory, '../../storage');

export const mediaTypes = Object.freeze({
	lecturers: Object.freeze({ extensions: new Set(['.jpg', '.jpeg', '.png', '.webp']), maxBytes: 5 * 1024 * 1024 }),
	news: Object.freeze({ extensions: new Set(['.jpg', '.jpeg', '.png', '.webp']), maxBytes: 5 * 1024 * 1024 }),
	projects: Object.freeze({ extensions: new Set(['.jpg', '.jpeg', '.png', '.webp']), maxBytes: 5 * 1024 * 1024 }),
	accreditation: Object.freeze({ extensions: new Set(['.pdf']), maxBytes: 15 * 1024 * 1024 })
});

for (const type of Object.keys(mediaTypes)) {
	await mkdir(resolve(storageRoot, type), { recursive: true });
}

export function hasAllowedExtension(type, filename) {
	return mediaTypes[type]?.extensions.has(extname(filename).toLowerCase()) ?? false;
}

export function createSafeStorage() {
	return {
		_handleFile(request, file, callback) {
			const extension = extname(file.originalname).toLowerCase();
			const filename = `${randomUUID()}${extension}`;
			const path = resolve(storageRoot, request.mediaType, filename);
			const output = createWriteStream(path, { flags: 'wx', mode: 0o600 });
			let fileCreated = false;
			output.on('open', () => { fileCreated = true; });
			file.stream.pipe(output);
			output.on('error', async (error) => {
				if (fileCreated) await unlink(path).catch(() => {});
				callback(error);
			});
			output.on('finish', () => callback(null, {
				destination: dirname(path),
				filename,
				path,
				size: output.bytesWritten
			}));
		},
		_removeFile(_request, file, callback) {
			unlink(file.path).then(() => callback(null), (error) => {
				if (error.code === 'ENOENT') callback(null);
				else callback(error);
			});
		}
	};
}

export async function removeStoredFile(path) {
	await unlink(path).catch((error) => {
		if (error.code !== 'ENOENT') throw error;
	});
}
