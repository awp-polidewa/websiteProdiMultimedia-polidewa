import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { checkDatabaseConnection } from './config/database.js';
import adminRoutes from './routes/adminRoutes.js';
import publicContentRoutes from './routes/publicContentRoutes.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', publicContentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_request, response) => {
	response.status(200).json({ success: true, data: { status: 'ok' } });
});

app.get('/api/health/database', async (_request, response) => {
	try {
		const database = await checkDatabaseConnection();
		response.status(200).json({
			success: true,
			data: {
				status: 'connected',
				timeZone: database.timeZone,
				characterSet: database.characterSet,
				collation: database.collation
			}
		});
	} catch {
		response.status(503).json({
			success: false,
			status: 503,
			message: 'Database tidak tersedia atau konfigurasi koneksi belum lengkap.'
		});
	}
});

app.use((_request, response) => {
	response.status(404).json({
		success: false,
		status: 404,
		message: 'Endpoint tidak ditemukan.'
	});
});

app.use((error, _request, response, _next) => {
	console.error('API request failed:', error.code || error.name || 'UnknownError');
	response.status(500).json({
		success: false,
		status: 500,
		message: 'Terjadi kesalahan pada server.'
	});
});

app.listen(port, () => {
	console.log(`TRM API berjalan pada port ${port}`);
});
