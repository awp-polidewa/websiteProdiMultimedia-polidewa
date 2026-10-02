# Website Prodi Teknologi Rekayasa Multimedia

Website informasi dan publikasi Program Studi Teknologi Rekayasa Multimedia Politeknik Dewantara.

## Stack

- Frontend: SvelteKit, JavaScript + JSDoc, CSS, Flowbite Svelte, DaisyUI.
- Backend: Node.js, Express, REST API, `mysql2/promise`.
- Database: MySQL 8.4 LTS (skema awal belum dibuat).

## Prasyarat

- Node.js 20.19+ atau 22.12+.
- npm.
- MySQL 8.4+ untuk backend/database ketika fase tersebut dimulai.

## Menjalankan lokal

Untuk menjalankan frontend publik, dari PowerShell:

```powershell
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Backend/API akan dijalankan ketika integrasi data publik dikerjakan.

## Status implementasi

- Fondasi SvelteKit tersedia; seluruh enam route publik memiliki metadata dasar dan empty state yang jelas bila konten belum tersedia.
- Konten profil, dosen, berita, karya, dan akreditasi menunggu sumber resmi.
- Keputusan database MVP sudah dicatat di `docs/04-database.md`; skema MySQL belum dibuat.
- Login admin, upload, deployment, dan RAG belum diimplementasikan; lihat arsitektur dan gate dalam dokumen proyek.

Rujukan requirement lengkap ada di folder [`docs`](docs/).
