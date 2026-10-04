# Website Prodi Teknologi Rekayasa Multimedia

Website informasi dan publikasi Program Studi Teknologi Rekayasa Multimedia Politeknik Dewantara. Repository mencakup frontend publik/admin SvelteKit dan REST API Express yang memakai MySQL.

## Stack

- Frontend: SvelteKit, JavaScript + JSDoc, CSS.
- Backend: Node.js, Express, `mysql2/promise`.
- Database: MySQL-compatible schema; development saat ini menggunakan MySQL XAMPP.
- Media: local filesystem di `backend/storage/`; media yang memang public disajikan melalui route media terkontrol.

## Prasyarat

- Node.js versi yang didukung project dan npm.
- MySQL XAMPP berjalan serta database `web_trm_dev` telah disiapkan.
- File environment lokal backend berdasarkan `backend/.env.example`.

## Menjalankan lokal

Jalankan backend di terminal pertama:

```powershell
cd backend
npm install
npm run dev
```

Jalankan frontend di terminal kedua:

```powershell
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`; backend API secara default berjalan di `http://localhost:3000`. Jangan commit file `.env` atau credential lokal.

## Status implementasi

- Database development sudah dibuat. Schema lima tabel MVP tersedia pada `backend/database/schema.sql`: `admins`, `lecturers`, `news`, `projects`, dan `accreditation_documents`.
- Backend Express terhubung dengan MySQL dan menyediakan health check, admin authentication/session, public API, serta admin CRUD untuk berita, karya mahasiswa, dosen, dan dokumen akreditasi.
- Frontend publik telah terhubung ke API untuk profil statis, struktur dosen, berita/detail, karya/detail, akreditasi, dan sorotan homepage. UI admin untuk login, dashboard, dan CRUD konten tersedia.
- Media upload lokal untuk foto, gambar, dan PDF akreditasi tersedia. Tidak ada perubahan schema media yang diperlukan.
- RAG T37.1 private PDF ingestion, T37.2 Gemini embedding generation, and T37.3 evidence retrieval are implemented: approved text-layer PDFs up to 15 MB, duplicate SHA-256 rejected with HTTP 409, extraction/chunking (target 1,600 characters, 200-character overlap), and `gemini-embedding-2` vectors. Retrieval uses cosine similarity over 3,072 dimensions and only ready documents; answer generation and chatbot UI are not implemented.
- Deployment belum dilakukan.

Dokumentasi utama berada di [`docs`](docs/). Status task rinci terdapat di [`docs/08-task.md`](docs/08-task.md); rancangan RAG ada di [`docs/03-arsitektur.md`](docs/03-arsitektur.md), [`docs/04-database.md`](docs/04-database.md), dan [`docs/05-fitur.md`](docs/05-fitur.md).
