# Railway Deployment

Panduan ini menyiapkan konfigurasi manual untuk satu project Railway yang berisi service backend, frontend, dan MySQL. Tidak ada deployment yang dijalankan dari repository ini.

## Arsitektur

```text
Browser → Frontend SvelteKit (public domain)
       → Backend Express (public domain, API + media)
Backend → MySQL (private network)
Backend → Gemini API (HTTPS)
```

Frontend API dipanggil browser, sehingga backend membutuhkan domain publik. Database tetap private dan hanya menerima koneksi dari service backend dalam project/environment Railway yang sama.

## Backend service

Hubungkan service ke repository `web-trm`, lalu pada **Settings → Source** atur **Root Directory** ke `/backend`. Railway menjelaskan bahwa root directory mengisolasi source yang dibangun oleh service monorepo: [Deploying a Monorepo](https://docs.railway.com/deployments/monorepo).

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | `/backend` |
| Build Command | Kosongkan; Railpack mendeteksi Node/npm dan memasang dependency dari `package-lock.json`. Backend tidak memiliki langkah kompilasi. |
| Start Command | `npm start` |
| Healthcheck Path | `/api/health` (opsional) |

Script start yang ada menjalankan `node src/app.js`. Backend memakai `process.env.PORT` (fallback lokal `3000`) dan `app.listen(port)` tanpa mengunci interface lokal. Railway menyediakan `PORT`; server harus menerima koneksi pada interface publik container. Lihat [Railway application networking](https://docs.railway.com/networking/troubleshooting/application-failed-to-respond).

Jangan set `PORT` ke angka tetap di Railway. Backend membaca `PORT`, host tidak ditentukan secara eksplisit, sehingga Node mendengarkan pada alamat wildcard. API/media backend perlu public domain karena request dari browser tidak dapat menuju private Railway domain.

## Frontend service

Buat service kedua dari repository yang sama dan atur **Root Directory** ke `/frontend`.

| Pengaturan | Nilai |
| --- | --- |
| Root Directory | `/frontend` |
| Build Command | `npm run build` |
| Start Command | `npm start` (`node build`) |
| Healthcheck Path | `/` (opsional) |

Frontend memakai SvelteKit 3 untuk rendering SSR. `adapter-auto` tidak menyiapkan target Railway/Node pada build ini, jadi konfigurasi minimal memakai `@sveltejs/adapter-node`; output stand-alone dijalankan dengan `node build`, sesuai [panduan Railway untuk SvelteKit](https://docs.railway.com/guides/sveltekit) dan [dokumentasi SvelteKit adapter-node](https://svelte.dev/docs/kit/adapter-node). Adapter node membaca `PORT` dan default listen host `0.0.0.0`.

Project tidak memiliki file `svelte.config.*`; plugin SvelteKit dan adapter dikonfigurasi di `frontend/vite.config.js`.

SvelteKit 3 yang terkunci oleh dependency project mensyaratkan Node `>=22.17.0`. Kedua `package.json` menyatakan batas ini agar build/runtime Railway memilih versi yang kompatibel.

### Frontend → API

`frontend/src/lib/admin/api.js` menggunakan `PUBLIC_API_URL` dan fallback lokal `http://localhost:3000`. `vite.config.js` mengizinkan prefix `PUBLIC_`. Set variable **pada service frontend sebelum build**:

```text
PUBLIC_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

Ganti `Backend` dengan nama service Railway yang sebenarnya atau pilih variable referensi melalui UI. Nilai harus URL publik HTTPS backend tanpa slash penutup. Karena `PUBLIC_API_URL` dibundel oleh Vite ke client, perubahan variable perlu frontend redeploy/build baru. Jangan gunakan `RAILWAY_PRIVATE_DOMAIN` di sini: request dibuat oleh browser pengguna, yang tidak bisa mengakses private network Railway. [Railway private networking](https://docs.railway.com/networking/domains/working-with-domains).

## MySQL dan environment backend

Tambahkan service MySQL Railway. Biarkan database private. Railway menyediakan `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` untuk koneksi antarlayanan: [Railway MySQL](https://docs.railway.com/databases/mysql).

Tambahkan variabel berikut pada **backend service** dengan reference ke nama service database Railway yang sebenarnya:

```text
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

`backend/src/config/database.js` membaca kelima nama `DB_*` tersebut dari `process.env`. Jangan memasukkan nilai credential ke source, docs, atau frontend.

**Periksa nama database sebelum import:** `backend/database/schema.sql` membuat dan memilih `web_trm_dev`. Pastikan `MYSQLDATABASE`/`DB_NAME` menunjuk database yang benar-benar menerima schema tersebut. Jika Railway membuat database dengan nama lain, selesaikan nama/database yang akan dipakai sebelum import; jangan sampai schema dibuat di `web_trm_dev` tetapi backend terhubung ke database lain. Import schema utama dan dua migration RAG yang sudah ada secara manual/terkendali. Jangan menjalankan migration otomatis saat build/start.

Variabel runtime backend:

| Variable | Isi/catatan |
| --- | --- |
| `PORT` | Disediakan Railway; jangan hardcode. |
| `NODE_ENV` | `production` agar cookie session memakai flag `Secure`. |
| `CORS_ORIGIN` | Origin HTTPS frontend yang tepat, misalnya `https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}`; beberapa origin boleh dipisah koma. Bukan `*`. |
| `SESSION_SECRET` | Secret acak baru, minimal 32 byte. Simpan hanya di Variables Railway. |
| `DB_HOST` | Reference ke `MYSQLHOST`. |
| `DB_PORT` | Reference ke `MYSQLPORT`. |
| `DB_USER` | Reference ke `MYSQLUSER`. |
| `DB_PASSWORD` | Reference secret ke `MYSQLPASSWORD`. |
| `DB_NAME` | Reference ke `MYSQLDATABASE`, setelah memeriksa catatan nama schema di atas. |
| `GEMINI_API_KEY` | API key rahasia untuk backend RAG; hanya di backend service. |
| `EMBEDDING_MODEL` | ID model embedding yang sama dengan model yang dipakai RAG saat ini. |
| `LLM_MODEL` | ID model Gemini untuk generasi jawaban yang sudah diverifikasi tersedia pada akun/provider. |
| `SIMILARITY_THRESHOLD` | Opsional; saat tidak diisi backend memakai default `0.30`. |

`GEMINI_API_KEY` tidak boleh dipasang pada frontend. Simpan semua secret melalui Railway Variables, bukan `.env` atau repository. Reference variables menjaga koneksi service tanpa menyalin password manual: [Railway Variables](https://docs.railway.com/variables).

### CORS dan session cookie

Backend memakai `CORS_ORIGIN` sebagai allowlist koma-terpisah dan `credentials: true`. Set hanya domain frontend yang benar, termasuk `https://` dan tanpa wildcard. Jika memakai custom domains, masukkan origin custom frontend yang benar. Browser menggunakan cookie session HTTP-only; frontend request admin sudah menyertakan credentials. Cookie production memakai `Secure` ketika `NODE_ENV=production`.

## File upload dan RAG storage

Media berita/dosen/karya/akreditasi dan PDF RAG ditulis di bawah `backend/storage/` (RAG di `backend/storage/rag/`). Filesystem container biasa Railway bersifat ephemeral: upload dapat hilang saat deployment/container diganti. [Railway ephemeral storage](https://docs.railway.com/deployments/reference).

Ini tidak menghalangi build, jadi panduan ini tidak mengubah storage code atau membuat volume. **Sebelum menerima upload production**, pasang Railway Volume ke backend pada mount path `/app/storage` (Railway meletakkan aplikasi pada `/app`; lihat [Railway Volumes](https://docs.railway.com/volumes)). Volume persisten mengikat storage pada instance service dan perlu dipertimbangkan ketika merencanakan replica/availability. Database berisi path dan metadata saja; PDF RAG dan media binary tetap memerlukan storage persisten.

## Langkah deploy manual

1. Di Railway buat satu project/environment dan tambahkan service MySQL.
2. Buat Backend service dari repository. Set root directory `/backend`, start command `npm start`, dan generate public domain untuk endpoint API/media.
3. Buat Frontend service dari repository yang sama. Set root directory `/frontend`, build `npm run build`, start `npm start`, dan generate public domain.
4. Tambahkan reference variables MySQL dan variables backend yang tercantum di atas. Buat `SESSION_SECRET` acak baru dan isi `GEMINI_API_KEY` langsung melalui Railway Variables.
5. Set `PUBLIC_API_URL` di frontend memakai HTTPS public domain backend; set `CORS_ORIGIN` di backend ke HTTPS origin frontend. Deploy backend lalu frontend.
6. Pada MySQL, pastikan database bernama/terpilih sesuai `backend/database/schema.sql`, lalu import schema dan migration RAG yang ada. Siapkan akun admin production secara aman melalui script `npm run admin:create`; jangan gunakan akun/password lokal.
7. Sebelum mengaktifkan form upload, buat volume backend di `/app/storage` dan pastikan service memiliki izin menulis. Verifikasi `/api/health`, `/api/health/database`, public routes, login, upload media, dan alur RAG setelah deployment.

Deployment dan konfigurasi dashboard Railway tetap dilakukan manual. Dokumen ini tidak membuat/menjalankan deployment dan tidak menyimpan nilai secret.
