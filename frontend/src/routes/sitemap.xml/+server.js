const publicPaths = ['/', '/profil', '/struktur', '/karya', '/berita', '/akreditasi', '/konsentrasi'];

/** @param {string} value */
function escapeXml(value) {
	return value.replace(/[<>&"']/g, (character) => ({
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;',
		'"': '&quot;',
		"'": '&apos;'
	})[character] ?? character);
}

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const entries = publicPaths
		.map((path) => `\t<url><loc>${escapeXml(new URL(path, url.origin).href)}</loc></url>`)
		.join('\n');
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
