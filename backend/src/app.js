import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_request, response) => {
	response.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use((_request, response) => {
	response.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

app.use((error, _request, response, _next) => {
	console.error(error);
	response.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
});

app.listen(port, () => {
	console.log(`TRM API berjalan pada port ${port}`);
});
