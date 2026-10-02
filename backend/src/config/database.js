import mysql from 'mysql2/promise';

let pool;

/** Create the shared MySQL pool when database access is first needed. */
export function getDatabasePool() {
	if (pool) return pool;

	const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
	const missing = Object.entries({ DB_HOST, DB_USER, DB_NAME })
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missing.length) {
		throw new Error(`Database configuration is missing: ${missing.join(', ')}`);
	}

	pool = mysql.createPool({
		host: DB_HOST,
		port: Number(DB_PORT || 3306),
		user: DB_USER,
		password: DB_PASSWORD || '',
		database: DB_NAME,
		charset: 'utf8mb4',
		waitForConnections: true
	});

	return pool;
}

export async function closeDatabasePool() {
	if (!pool) return;
	await pool.end();
	pool = undefined;
}
