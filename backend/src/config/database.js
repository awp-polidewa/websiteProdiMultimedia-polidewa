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
	const port = Number(DB_PORT || 3306);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error('Database configuration is invalid: DB_PORT must be an integer from 1 to 65535.');
	}

	pool = mysql.createPool({
		host: DB_HOST,
		port,
		user: DB_USER,
		password: DB_PASSWORD || '',
		database: DB_NAME,
		charset: 'utf8mb4',
		timezone: '+08:00',
		dateStrings: true,
		supportBigNumbers: true,
		bigNumberStrings: true,
		waitForConnections: true
	});
	pool.on('connection', (connection) => {
		// Queue the documented session defaults before the connection is handed out.
		connection
			.promise()
			.query("SET SESSION time_zone = '+08:00', collation_connection = 'utf8mb4_unicode_ci'")
			.catch(() => connection.destroy());
	});

	return pool;
}

/** Verify database access and session settings without requiring any tables. */
export async function checkDatabaseConnection() {
	const connection = await getDatabasePool().getConnection();
	try {
		const [rows] = await connection.query(
			`SELECT 1 AS connected,
				@@session.time_zone AS timeZone,
				@@character_set_connection AS characterSet,
				@@collation_connection AS collation`
		);
		return rows[0];
	} finally {
		connection.release();
	}
}

export async function closeDatabasePool() {
	if (!pool) return;
	await pool.end();
	pool = undefined;
}
