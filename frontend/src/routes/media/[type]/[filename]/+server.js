import { proxyBackendRequest } from '../../../../lib/server/backendProxy.server.js';

const publicMediaTypes = new Set(['lecturers', 'news', 'projects', 'accreditation']);

/** @param {{ request: Request, params: { type: string, filename: string } }} event */
function proxyMedia(event) {
	const { type, filename } = event.params;
	if (!publicMediaTypes.has(type) || !filename || filename === '.' || filename === '..' || filename.includes('/') || filename.includes('\\')) {
		return Response.json({ success: false, status: 404, message: 'Media tidak ditemukan.' }, { status: 404 });
	}
	return proxyBackendRequest(event.request, `media/${type}/${filename}`);
}

export const GET = proxyMedia;
export const HEAD = proxyMedia;
