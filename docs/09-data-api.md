# 09-data-api.md — Public Data Layer & API Contract

Status: **DESAIN UNTUK REVIEW USER**. Dokumen ini melengkapi `04-database.md` (struktur tabel sumber kebenaran), `03-arsitektur.md` (stack/API), dan `05-fitur.md` (perilaku fitur). Belum ada schema SQL, migration, query, atau endpoint konten yang dibuat.

## 1. Scope dan keputusan yang dipakai

- Backend: Express.js + `mysql2/promise`; REST API pada prefix `/api`.
- Seluruh endpoint pada dokumen ini adalah `GET` publik tanpa login dan tanpa request body.
- Schema memakai lima tabel yang sudah diputuskan di `04-database.md`: `admins`, `lecturers`, `news`, `projects`, `accreditation_documents`. Tidak menambah entity/tabel.
- `program_profile` tetap statis di frontend; tidak ada tabel maupun API profil.
- Foreign key: tidak ada pada versi awal. Tabel konten berdiri sendiri, sesuai keputusan `04-database.md` bagian 22.
- File binary berada di storage, bukan di MySQL. DB menyimpan path relatif sesuai `04-database.md` bagian 48; API hanya mengembalikan URL route media terkontrol, tidak mengirim physical path.
- Nama kolom database tetap `snake_case`. JSON API memakai `camelCase`.
- `BIGINT UNSIGNED` dikirim sebagai string desimal agar aman dari kehilangan presisi JavaScript.
- Semua tanggal/waktu dikirim ISO 8601 sesuai timezone kampus WITA (`+08:00`). `DATE` tetap `YYYY-MM-DD`.

## 2. Entity dan cakupan halaman

Tipe dan definisi kolom lengkap tetap di tabel sumber kebenaran `04-database.md`. Ringkasan field di bawah menunjukkan data yang dipakai halaman public dan pengelolaan admin.

| Entity/tabel | Field dan tipe kanonis (`04-database.md`) | Kunci/relasi | Status public |
|---|---|---|---|
| `admins` | `id BIGINT UNSIGNED`; `name VARCHAR(100)`; `email VARCHAR(150) NULL`; `nidn VARCHAR(20)`; `username VARCHAR(50)`; `password_hash VARCHAR(255)`; `created_at`, `updated_at TIMESTAMP` | PK `id`; UNIQUE `email`, `nidn`, `username`; tanpa FK | Tidak pernah public; tabel disiapkan untuk dashboard/login yang belum masuk tahap ini |
| `lecturers` | `id BIGINT UNSIGNED`; `name VARCHAR(150)`; `title VARCHAR(150)`; `concentration VARCHAR(50) NULL`; `photo_path VARCHAR(255) NULL`; `bio TEXT NULL`; `email VARCHAR(150) NULL`; `display_order INT UNSIGNED`; timestamps | PK `id`; INDEX `display_order`; tanpa FK | Semua row dosen yang dikelola dianggap dapat dibaca public. `email` selalu dikecualikan dari response |
| `news` | `id BIGINT UNSIGNED`; `title VARCHAR(200)`; `slug VARCHAR(220)`; `excerpt VARCHAR(500) NULL`; `content MEDIUMTEXT`; `thumbnail_path VARCHAR(255) NULL`; `status ENUM('draft','published')`; `published_at DATETIME NULL`; timestamps | PK `id`; UNIQUE `slug`; INDEX `(status, published_at)`; tanpa FK | Hanya `status='published'` dengan `published_at` terisi yang dikembalikan public |
| `projects` | `id BIGINT UNSIGNED`; `title VARCHAR(200)`; `slug VARCHAR(220)`; `description TEXT NULL`; `thumbnail_path VARCHAR(255)`; `category VARCHAR(50)`; `student_name VARCHAR(150) NULL`; `project_year SMALLINT UNSIGNED NULL`; `external_url VARCHAR(500) NULL`; timestamps | PK `id`; UNIQUE `slug`; INDEX `category`; INDEX `(created_at, id)`; tanpa FK | Semua project langsung public setelah dibuat; tidak ada kolom status |
| `accreditation_documents` | `id BIGINT UNSIGNED`; `title VARCHAR(200)`; `description TEXT NULL`; `file_path VARCHAR(255)`; `source_url VARCHAR(500) NULL`; `published_at DATE NULL`; timestamps | PK `id`; hanya PK index; tanpa FK | **TBD:** aturan izin tayang belum dapat direpresentasikan oleh field saat ini; lihat bagian 7 |

### 2.1 Profil program studi

Halaman profil tetap memakai konten statis sesuai keputusan user di `04-database.md` bagian 21. Deskripsi umum yang saat ini ditulis di frontend bukan record database. Visi, misi, dan teks resmi hanya dimasukkan setelah disediakan/diverifikasi. Tidak dibuat `program_profile`, endpoint profil, atau CRUD profil.

### 2.2 Relasi dan duplikasi

Tidak ada FK maupun join table. Dosen tidak dimiliki oleh kategori konsentrasi di database; `concentration` berupa string nullable dan UI menyusun hierarchy yang sudah ditetapkan. Berita/project berdiri sendiri karena kebutuhan tidak meminta pencatatan author/mahasiswa sebagai entity terpisah. Satu project menyimpan satu thumbnail. Dokumen akreditasi berdiri sendiri; isi surat tetap berada dalam PDF resmi.

Tidak menyimpan salinan judul, ringkasan, bio, atau path file di tabel lain. `photo_path`, `thumbnail_path`, dan `file_path` adalah referensi relatif ke storage, bukan isi file.

## 3. Index

Index final mengikuti `04-database.md` bagian 24; tidak menambah full-text, tag, kategori ternormalisasi, atau index spekulatif.

| Table | Index | Query yang dilayani |
|---|---|---|
| `admins` | UNIQUE `nidn`, `username`, `email` | Identitas dan keunikan admin |
| `lecturers` | `display_order` (PK `id` sebagai tie-breaker) | Urutan diagram |
| `news` | UNIQUE `slug`; composite `(status, published_at)` | Detail slug dan urutan/penyaringan berita public |
| `projects` | UNIQUE `slug`; `category`; composite `(created_at, id)` | Detail slug, kategori, urutan showcase |
| `accreditation_documents` | PK `id` saja | Jumlah dokumen diperkirakan kecil; tidak menambah index sebelum kebutuhan terukur |

Index tunggal `status` dan `published_at` pada definisi kolom `news` tidak diperlukan karena composite `(status, published_at)` sudah menjadi index query public. Hapus penanda index tunggal tersebut dari definisi tabel agar tidak membentuk index duplikat.

## 4. Konvensi API

### 4.1 Success response

Detail/satu item:

```json
{
  "success": true,
  "data": {}
}
```

List tanpa pagination:

```json
{
  "success": true,
  "data": [],
  "meta": { "count": 0 }
}
```

List berita/project memakai metadata pagination:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "perPage": 12,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

`perPage` tetap 12 sesuai `04-database.md` bagian 46. Parameter client hanya `page`; backend menetapkan ukuran halaman, bukan menerima `LIMIT` mentah. Home dapat memakai item pertama dari halaman yang sama. `totalPages` bernilai 0 jika daftar kosong.

### 4.2 Error response

HTTP status adalah sumber status utama dan dicerminkan pada body agar sesuai aturan `07-rules.md`:

```json
{
  "success": false,
  "status": 404,
  "message": "Konten tidak ditemukan."
}
```

Validasi dapat menyertakan detail field yang aman:

```json
{
  "success": false,
  "status": 400,
  "message": "Parameter tidak valid.",
  "errors": {
    "page": "Harus berupa bilangan bulat positif."
  }
}
```

Jangan mengirim SQL/error driver, stack trace, physical path, atau status draft ke client. Detail internal hanya masuk log aman.

| HTTP | Pemakaian pada API ini |
|---|---|
| 200 | Berhasil membaca data atau media |
| 400 | Path/query tidak valid |
| 404 | Slug/id tidak ditemukan, draft, file kosong, atau file tidak dapat diakses sebagai public |
| 500 | Kegagalan server/database/storage; pesan umum |

401/403/409/422 untuk operasi admin atau validasi body bukan bagian dari endpoint public read tahap ini. Jika API write dibuat kelak, gunakan envelope error yang sama; 422 dapat membawa `errors` per-field dan 409 untuk slug unik yang bentrok.

## 5. Endpoint public JSON

Semua endpoint di tabel berikut menggunakan method `GET`, tidak membutuhkan autentikasi, dan tidak menerima request body.

### 5.1 `GET /api/lecturers`

- Halaman: struktur dosen.
- Parameter: tidak ada.
- Query: urut `display_order ASC, id ASC`.
- Validasi: tidak ada parameter. Email tidak dipilih/dikirim.
- 200 response:

```json
{
  "success": true,
  "data": [
    {
      "id": "12",
      "name": "Nama resmi",
      "title": "Jabatan resmi",
      "concentration": null,
      "photoUrl": null,
      "bio": null,
      "displayOrder": 0
    }
  ],
  "meta": { "count": 1 }
}
```

Nilai contoh pada blok response menjelaskan bentuk data saja, bukan data seed/resmi. `photoUrl` menjadi null jika belum ada foto.

### 5.2 `GET /api/news?page={page}`

- Halaman: daftar berita dan highlight beranda.
- Parameter: `page`, bilangan bulat positif; default `1`. `perPage` tetap 12.
- Filter: hanya `status='published'` dan `published_at IS NOT NULL`.
- Urutan: `published_at DESC, id DESC` agar urutan stabil.
- 400: `page` bukan integer positif.
- 200 list response memakai envelope dan `meta` pagination di bagian 4.1. Setiap item:

```json
{
  "id": "34",
  "title": "Judul berita",
  "slug": "judul-berita",
  "excerpt": null,
  "thumbnailUrl": null,
  "publishedAt": "2026-10-03T09:15:00+08:00"
}
```

`content` tidak dikirim pada daftar.

### 5.3 `GET /api/news/:slug`

- Halaman: detail berita.
- Parameter `slug`: lowercase URL slug, maksimal 220 karakter, format `[a-z0-9]+(?:-[a-z0-9]+)*`.
- Lookup hanya pada berita published dengan tanggal tayang.
- 400: format slug tidak valid. 404: tidak ditemukan atau masih draft; gunakan pesan yang sama.
- 200 `data` berisi field daftar ditambah `content` (plain text dengan newline). `publishedAt` mengikuti WITA dan ISO 8601.

### 5.4 `GET /api/projects?page={page}&category={category}`

- Halaman: daftar karya dan highlight beranda.
- `page`: integer positif, default `1`; ukuran halaman fixed 12.
- `category` opsional: salah satu dari `desain`, `coding`, `3d`, `multimedia`, `lainnya`.
- 400: page atau kategori tidak valid.
- Urutan: `created_at DESC, id DESC`.
- 200 list memakai `meta` pagination. Tiap item berisi `id`, `title`, `slug`, `description`, `thumbnailUrl`, `category`, `studentName`, `projectYear`, `externalUrl`. `thumbnailUrl` tidak null sesuai constraint schema.

### 5.5 `GET /api/projects/:slug`

- Halaman: detail karya.
- `slug`: aturan sama dengan slug berita; lookup memakai UNIQUE `projects.slug`.
- 400: format tidak valid. 404: project tidak ditemukan.
- 200 `data` berisi field yang sama dengan item daftar. Project langsung tampil setelah tersimpan; jangan memfilter dengan status.

### 5.6 `GET /api/accreditation-documents`

- Halaman: daftar dokumen akreditasi.
- Parameter: tidak ada.
- Urutan usulan: `published_at DESC, id DESC` (tanggal null diletakkan terakhir).
- 200 item berisi `id`, `title`, `description`, `fileUrl`, `sourceUrl`, `publishedAt` (`YYYY-MM-DD` atau null).
- **Belum siap diimplementasikan sebelum keputusan visibility pada bagian 7.** Saat ini schema tidak memiliki field status untuk menentukan dokumen yang boleh tayang.

## 6. Endpoint media (response binary)

URL media pada response JSON menunjuk endpoint terkontrol (`photoUrl` → route photo dosen; `thumbnailUrl` → route thumbnail sesuai parent slug; `fileUrl` → route PDF sesuai document id). Tidak menyajikan direktori `uploads` secara statis. Path storage fisik tidak pernah dikembalikan.

| Method dan path | Resource/validasi | Response sukses |
|---|---|---|
| `GET /api/lecturers/:id/photo` | `id` integer desimal positif; 404 bila dosen/foto tidak ada | Binary foto dengan `Content-Type` hasil verifikasi storage |
| `GET /api/news/:slug/thumbnail` | slug valid; hanya berita published dan thumbnail yang tersedia | Binary thumbnail |
| `GET /api/projects/:slug/thumbnail` | slug valid; hanya project ada dan thumbnail tersedia | Binary thumbnail |
| `GET /api/accreditation-documents/:id/file?download=0\|1` | id positif; `download` opsional boolean, default `0`; visibility mengikuti keputusan bagian 7 | PDF binary; `inline` untuk 0, `attachment` untuk 1 |

Semua endpoint media mengembalikan 400 untuk identifier/query tidak valid, 404 bila resource tidak eligible/tidak punya file, atau 500 dengan pesan umum untuk kegagalan storage. Response error memakai bagian 4.2. MIME allowlist, ukuran maksimum, dan aturan nama file masih mengikuti keputusan upload/storage TBD pada `05-fitur.md` bagian 28 dan `03-arsitektur.md`; endpoint media tidak boleh dianggap implementable sebelum keputusan itu disetujui. Tidak ada upload method yang ditentukan/diimplementasikan di milestone ini.

## 7. TBD dan blocker

### 7.1 Memerlukan input user sebelum kontrak/implementasi terkait

1. **Visibilitas dokumen akreditasi — blocker API dan mungkin schema.** `05-fitur.md` menyebut hanya dokumen yang disetujui untuk tayang, tetapi `accreditation_documents` tidak memiliki `status`/approval field dan `04-database.md` juga melarang penambahan timestamp approval otomatis. Tentukan salah satu: (a) semua row pada tabel ini selalu merupakan dokumen public, atau (b) admin memerlukan draft/published yang memerlukan kolom status pada schema. Tidak ditetapkan diam-diam pada desain ini.
2. **Storage dan file allowlist — blocker upload/media runtime, bukan tabel konten inti.** Provider storage production, MIME yang diterima, batas ukuran, serta aturan filename masih TBD. Field path tidak berubah; sebelum membuat endpoint binary/upload, keputusan ini harus dikunci.
3. **Nilai konsentrasi dosen — blocker mapping struktur dan validasi admin, bukan tipe schema.** Label berbahasa Inggris pada `02-desain.md`/`05-fitur.md` berbeda dari label frontend final dan `04-database.md`. Kolom tetap `VARCHAR(50)`; tetapkan nilai yang disimpan dan label tampilannya sebelum seed, form admin, atau integrasi API. API tidak mengubah/menebak alias.
4. **Route frontend detail berita — blocker route SvelteKit saja.** API tetap menggunakan slug; path halaman browser final masih TBD pada `05-fitur.md` bagian 27. Route project juga harus diselaraskan ketika frontend detail dibuat.

### 7.2 TBD yang tidak menghalangi desain API/schema awal

- Palette/navigasi frontend, isi resmi profil, serta data resmi dosen, berita, karya, dan akreditasi: memengaruhi konten/presentasi, bukan bentuk field yang sudah ditetapkan.
- FAQ, pencarian, RAG, deployment/provider, dan upload lanjutan berada di luar kontrak read API tahap ini.
- Role admin tidak ada pada MVP; tabel admin yang sudah diputuskan cukup untuk satu jenis admin, tetapi auth tetap belum dikerjakan.

## 8. Kecukupan dashboard admin berikutnya

Tabel yang sudah diputuskan cukup untuk operasi konten dashboard sederhana: dosen (termasuk urutan), berita (draft/published), karya (langsung tayang), dan metadata PDF akreditasi. `admins` cukup merepresentasikan satu jenis admin. Profil memang statis dan tidak dapat diedit lewat dashboard sesuai keputusan user. Tidak perlu author relation, category table, media table, audit table, soft-delete column, atau role table untuk scope ini.

Implementasi endpoint admin, login/session, upload, dan schema/migration bukan bagian dari desain public-read ini. Kontrak write harus mengikuti field/validasi yang sama di `04-database.md` dan `05-fitur.md` ketika milestone tersebut dimulai dan desain ini disetujui.

## 9. Gate implementasi

Desain data/API ini siap direview. Sebelum T2.2 membuat `backend/database/schema.sql`, user harus menyetujui desain dan memutuskan visibilitas dokumen akreditasi. Tidak membuat migration atau menjalankan query pada tahap ini.
