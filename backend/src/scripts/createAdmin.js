import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { getDatabasePool } from '../config/database.js';

function promptHidden(question) {
	if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
		throw new Error('Jalankan perintah ini dari terminal interaktif agar password dapat dimasukkan tanpa echo.');
	}

	stdout.write(question);
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding('utf8');

	return new Promise((resolve, reject) => {
		let value = '';
		const finish = (error) => {
			stdin.setRawMode(false);
			stdin.pause();
			stdin.removeListener('data', onData);
			stdout.write('\n');
			if (error) reject(error);
			else resolve(value);
		};
		const onData = (chunk) => {
			for (const character of chunk) {
				if (character === '\u0003') return finish(new Error('Dibatalkan.'));
				if (character === '\r' || character === '\n') return finish();
				if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
				else if (character >= ' ') value += character;
			}
		};
		stdin.on('data', onData);
	});
}

async function main() {
	const prompt = createInterface({ input: stdin, output: stdout });
	let pool;
	try {
		const name = (process.env.ADMIN_NAME || (await prompt.question('Nama admin: '))).trim();
		const nidn = (process.env.ADMIN_NIDN || (await prompt.question('NIDN admin: '))).trim();
		const username = (process.env.ADMIN_USERNAME || (await prompt.question('Username admin: ')))
			.trim()
			.toLowerCase();
		prompt.close();
		const password = process.env.ADMIN_PASSWORD || (await promptHidden('Password admin (input tersembunyi): '));
		delete process.env.ADMIN_PASSWORD;

		if (!name || name.length > 100) throw new Error('Nama wajib diisi dan maksimal 100 karakter.');
		if (!nidn || nidn.length > 20) throw new Error('NIDN wajib diisi dan maksimal 20 karakter.');
		if (!username || username.length > 50) throw new Error('Username wajib diisi dan maksimal 50 karakter.');
		if (Buffer.byteLength(password, 'utf8') < 12 || Buffer.byteLength(password, 'utf8') > 72) {
			throw new Error('Password harus 12 sampai 72 byte.');
		}

		pool = getDatabasePool();
		const [existing] = await pool.execute('SELECT id FROM admins LIMIT 1');
		if (existing.length) throw new Error('Akun admin sudah ada; script development tidak menambah akun kedua.');

		const passwordHash = await bcrypt.hash(password, 12);
		await pool.execute(
			'INSERT INTO admins (name, nidn, username, password_hash) VALUES (?, ?, ?, ?)',
			[name, nidn, username, passwordHash]
		);
		console.log('Akun admin development berhasil dibuat. Password hanya tersimpan sebagai hash.');
	} finally {
		prompt.close();
		if (pool) await pool.end();
	}
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
