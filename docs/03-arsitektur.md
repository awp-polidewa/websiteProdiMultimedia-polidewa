docs/03-arsitektur.md

File ini adalah DOKUMEN ARSITEKTUR TEKNIS UTAMA untuk project Website Prodi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara.

Tugas kamu adalah menyusun dokumen arsitektur tersebut berdasarkan seluruh spesifikasi dan keputusan yang saya berikan di bawah.

==================================================
A. TUJUAN UTAMA
==================================================

Website ini adalah platform informasi, publikasi, dan showcase untuk Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara.

Tujuan teknis arsitektur:

1. Sederhana.
2. Mudah dipahami oleh developer pemula.
3. Mudah dikembangkan.
4. Mudah di-maintain.
5. Mudah di-debug.
6. Mudah di-deploy.
7. Mudah dibantu AI coding agent seperti Hermes/Claude.
8. Tidak over-engineering.
9. Aman untuk production.
10. Struktur kode jelas dan konsisten.

PRINSIP PALING PENTING:

Dokumentasi boleh sangat lengkap, tetapi sistem yang dibangun harus tetap sederhana.

Jangan menambahkan teknologi hanya supaya terlihat profesional.

==================================================
B. STACK YANG SUDAH DIPUTUSKAN
==================================================

Frontend:

- SvelteKit
- JavaScript
- JSDoc
- CSS
- Flowbite Svelte
- DaisyUI

Backend:

- Node.js
- Express.js
- JavaScript
- mysql2/promise
- async/await
- REST API

Database:

- MySQL

Authentication:

- Session-based authentication
- HTTP-only cookie

Arsitektur:

Browser
↓
SvelteKit
↓
Express REST API
↓
MySQL

Jangan mengganti stack tersebut tanpa alasan teknis yang sangat kuat dan tanpa approval user.

==================================================
C. UI LIBRARY
==================================================

UI library yang digunakan:

1. Flowbite Svelte
2. DaisyUI

Keduanya digunakan secara terkontrol.

Jangan menambahkan:

- Skeleton
- shadcn
- SvelteUI
- Bootstrap
- Material UI
- library UI lain

kecuali user memberikan approval.

Design system dari docs/02-desain.md adalah sumber kebenaran visual.

UI library tidak boleh mengubah desain menjadi generic template.

==================================================
D. STRUKTUR PROJECT
==================================================

Gunakan struktur yang sederhana dan jelas.

Struktur yang direkomendasikan:

web-trm/
├── docs/
│ ├── 01-prd.md
│ ├── 02-desain.md
│ ├── 03-arsitektur.md
│ ├── 04-database.md
│ ├── 05-fitur.md
│ ├── 06-animation.md
│ ├── 07-rules.md
│ └── 08-task.md
│
├── frontend/
│ ├── src/
│ │ ├── lib/
│ │ ├── routes/
│ │ ├── app.html
│ │ └── ...
│ ├── static/
│ ├── package.json
│ └── ...
│
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── utils/
│ │ └── app.js
│ ├── storage/
│ │ ├── lecturers/
│ │ ├── news/
│ │ ├── projects/
│ │ ├── accreditation/
│ │ └── rag/              # private; tidak disajikan melalui route media
│ ├── package.json
│ └── ...
│
├── .gitignore
├── README.md
└── ...

Namun sebelum menetapkan perubahan struktur secara nyata, dokumentasi harus menyatakan bahwa agent wajib memeriksa struktur repository yang sebenarnya terlebih dahulu.

Jangan melakukan mass migration hanya berdasarkan asumsi.

==================================================
E. FRONTEND ARCHITECTURE
==================================================

Frontend menggunakan SvelteKit.

Tanggung jawab frontend:

- rendering halaman public;
- admin dashboard UI;
- form;
- interaksi user;
- mengambil data dari REST API;
- menampilkan loading state;
- menampilkan error state;
- validasi input dasar di client;
- responsive layout;
- accessibility;
- animation/interactions.

Frontend TIDAK boleh mengakses database secara langsung.

Alur:

User
↓
SvelteKit
↓
Express API
↓
MySQL

Gunakan JavaScript + JSDoc.

Jangan mengubah project menjadi TypeScript kecuali user menyetujuinya.

==================================================
F. BACKEND ARCHITECTURE
==================================================

Backend menggunakan Express.js.

Struktur:

routes
↓
middleware
↓
controller
↓
service (jika memang diperlukan)
↓
database

Gunakan:

- async/await
- try/catch
- mysql2/promise

Hindari callback-based database code.

Controller bertanggung jawab menangani HTTP request/response.

Service digunakan jika logic memang perlu dipisahkan.

Jangan membuat service layer hanya untuk menambah kompleksitas.

Database access harus terstruktur dan tidak tersebar sembarangan di seluruh project.

==================================================
G. API ARCHITECTURE
==================================================

Gunakan REST API.

Contoh:

GET /api/news
GET /api/news/:slug
POST /api/news
PUT /api/news/:id
DELETE /api/news/:id

GET /api/projects
GET /api/projects/:slug
POST /api/projects
PUT /api/projects/:id
DELETE /api/projects/:id

GET /api/lecturers
POST /api/lecturers
PUT /api/lecturers/:id
DELETE /api/lecturers/:id

POST /api/admin/login
POST /api/admin/logout
GET /api/admin/session

Contoh di atas bersifat konseptual; endpoint public detail final memakai slug. Halaman frontend final: `/berita/:slug` dan `/karya/:slug`. Kontrak endpoint public final harus mengikuti `docs/09-data-api.md`, `docs/05-fitur.md`, dan `docs/04-database.md`.

Jangan membuat endpoint yang tidak diperlukan.

Kontrak endpoint GET public, detail slug, query pagination/filter, payload, dan media ada di `docs/09-data-api.md`. Contoh endpoint di atas adalah gambaran bentuk REST dan bukan spesifikasi path final untuk konten public.

==================================================
H. API RESPONSE STANDARD
==================================================

Success:

{
"success": true,
"data": {}
}

List:

{
"success": true,
"data": [],
"meta": {}
}

Error:

{
"success": false,
"status": 404,
"message": "Pesan error"
}

Untuk validation error, `errors` boleh ditambahkan sebagai object aman berisi pesan per-field. `status` pada body harus sama dengan HTTP status code; jangan sertakan detail internal.

Gunakan HTTP status code yang sesuai:

200
201
400
401
403
404
409
422
429
500

Dokumentasikan kapan masing-masing digunakan.

==================================================
I. AUTHENTICATION
==================================================

Admin membutuhkan authentication.

User public tidak membutuhkan login.

Tidak ada sistem student account sebagai bagian dari scope utama.

Authentication: login admin menerima NIDN atau username; gunakan signed HTTP-only cookie berumur 8 jam yang membawa ID admin dan expiry, `SameSite=Lax`, dan `Secure` pada production. Tidak menggunakan tabel session atau refresh token. Admin dapat mengganti NIDN dan username melalui pengaturan; password dikelola melalui prosedur admin terkontrol. Password di-hash dengan bcryptjs cost 12; jangan menyimpan plaintext.

Jangan menyimpan password plaintext.

Endpoint mutation admin harus dilindungi authentication.

==================================================
J. AUTHORIZATION
==================================================

Pisahkan:

Public
Admin

Public dapat membaca konten yang memang dipublikasikan.

Admin dapat:

- mengelola berita;
- mengelola project;
- mengelola data dosen jika diizinkan;
- mengelola pengumuman jika fitur tersebut digunakan;
- mengelola konten admin lain sesuai scope.

Authorization harus diperiksa di backend.

Jangan hanya mengandalkan frontend untuk security.

==================================================
K. DATABASE
==================================================

Target database MySQL 8.4 LTS; development lokal project ini menggunakan MariaDB 10.4.32 dari XAMPP. Gunakan collation portabel `utf8mb4_unicode_ci` agar schema kompatibel dengan keduanya. Backend menggunakan `mysql2/promise` melalui satu connection pool di `backend/src/config/database.js`; gunakan timezone `+08:00` (Asia/Makassar). Keputusan tabel dan tipe kolom berada di `docs/04-database.md`; schema awal ada di `backend/database/schema.sql`.

Dokumen arsitektur tidak perlu mendefinisikan seluruh struktur tabel secara detail karena itu berada di:

docs/04-database.md

Tetapi jelaskan:

Frontend
↓
REST API
↓
Controller/Service
↓
MySQL Pool
↓
Database

Database tidak boleh diakses langsung oleh frontend.

==================================================
L. FILE UPLOAD
==================================================

Website menggunakan upload media lokal yang sudah berjalan untuk:

- gambar project;
- foto dosen;
- dokumen accreditation;
- media lain sesuai fitur.

Dokumen RAG (saat fitur tersebut dibuat) disimpan terpisah secara private pada `backend/storage/rag/`; folder tersebut tidak boleh berada di bawah route `/media/:type/:filename`.

Upload dilakukan melalui backend.

Validasi minimal:

- MIME type;
- extension;
- ukuran file;
- nama file;
- lokasi penyimpanan.

Jangan mempercayai nama file dari user.

Jangan menyimpan secret atau file sensitif di public repository.

==================================================
M. ENVIRONMENT VARIABLES
==================================================

Gunakan environment variables.

Contoh:

NODE_ENV
PORT
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
SESSION_SECRET
PUBLIC_API_URL

Jika dibutuhkan, tambahkan variable lain berdasarkan kebutuhan nyata.

Aturan:

- jangan commit .env;
- sediakan .env.example;
- jangan menaruh password/API key di source code;
- jangan menaruh secret di frontend;
- jangan menebak credential.

==================================================
N. DEVELOPMENT ENVIRONMENT
==================================================

Local development:

Browser
↓
SvelteKit
localhost:5173
↓
Express
localhost:3000
↓
MySQL
localhost:3306

Dokumentasikan:

- cara menjalankan frontend;
- cara menjalankan backend;
- cara menjalankan database;
- cara konfigurasi environment;
- cara melakukan test lokal.

Jangan mengasumsikan OS tertentu kecuali diperlukan.

Namun karena user menggunakan Windows, command Windows harus tetap diperhatikan ketika agent memberikan instruksi atau menjalankan command.

==================================================
O. PRODUCTION ARCHITECTURE
==================================================

Production tetap menggunakan konsep:

Browser
↓
Frontend SvelteKit
↓
Express API
↓
MySQL

Frontend dan backend boleh menggunakan provider berbeda.

Provider deployment BELUM dikunci.

Pemilihan provider harus mempertimbangkan:

- biaya;
- free/low-cost tier;
- kompatibilitas SvelteKit;
- kompatibilitas Express;
- MySQL;
- kemudahan deployment;
- kemudahan maintenance;
- lokasi/region;
- domain;
- HTTPS.

Jangan mengunci provider tanpa alasan.

==================================================
P. DEPLOYMENT
==================================================

Deployment harus:

- repeatable;
- terdokumentasi;
- dapat diuji;
- dapat diverifikasi;
- dapat di-rollback.

Workflow:

INSPECT
↓
READ DOCUMENTATION
↓
CHECK GIT
↓
CHECK DEPENDENCIES
↓
TEST
↓
BUILD
↓
CHECK ENV
↓
CHECK DATABASE
↓
CREATE DEPLOYMENT PLAN
↓
USER APPROVAL
↓
DEPLOY BACKEND
↓
TEST BACKEND
↓
DEPLOY FRONTEND
↓
SMOKE TEST
↓
VERIFY
↓
REPORT

==================================================
Q. DEPLOYMENT BACKEND
==================================================

Sebelum deploy backend:

1. inspect package.json;
2. inspect start script;
3. inspect environment variables;
4. inspect database config;
5. test API;
6. test authentication;
7. test upload;
8. build/run locally;
9. verify production configuration.

Setelah deploy:

- cek deployment status;
- cek logs;
- cek health endpoint;
- test API;
- test authentication;
- test database;
- test error handling.

==================================================
R. DEPLOYMENT FRONTEND
==================================================

Sebelum deploy:

- test build;
- check environment;
- check API URL;
- check routes;
- check asset;
- check responsive behavior.

Setelah deploy:

- homepage;
- profile;
- structure;
- news;
- projects;
- accreditation;
- FAQ;
- admin login;
- API communication.

==================================================
S. DATABASE DEPLOYMENT
==================================================

Database production harus diperlakukan hati-hati.

Workflow:

BACKUP
↓
VERIFY BACKUP
↓
MIGRATION
↓
VERIFY DATABASE
↓
TEST APPLICATION

Jangan menjalankan:

DROP DATABASE
TRUNCATE
DELETE massal
migration destructive

di production tanpa approval user.

Jangan menghapus data production sebagai metode rollback.

==================================================
T. SECURITY
==================================================

Security minimal:

- HTTPS;
- password hashing;
- HTTP-only cookie;
- Secure cookie production;
- SameSite;
- CORS;
- input validation;
- authorization;
- rate limiting jika diperlukan;
- security headers;
- file validation;
- environment secrets;
- error handling.

Jangan:

- hardcode password;
- hardcode API key;
- expose SESSION_SECRET;
- expose database credential;
- mengirim secret ke frontend;
- menampilkan stack trace sensitif kepada public.

==================================================
U. CORS
==================================================

CORS harus hanya mengizinkan origin yang diperlukan.

Jangan menggunakan wildcard secara sembarangan pada production.

Frontend dan backend harus memiliki konfigurasi origin yang jelas.

==================================================
V. ERROR HANDLING
==================================================

Backend harus memiliki error handling terpusat jika memungkinkan.

Error response tidak boleh membocorkan:

- database password;
- secret;
- stack trace internal;
- path sensitif;
- credential.

Frontend harus memiliki:

- loading state;
- empty state;
- error state;
- success feedback.

==================================================
W. LOGGING
==================================================

Gunakan logging secukupnya.

Log hal-hal penting:

- startup;
- request penting;
- authentication failure;
- database error;
- upload error;
- deployment/runtime error.

Jangan log:

- password;
- session secret;
- API key;
- token sensitif.

==================================================
X. HEALTH CHECK
==================================================

Backend menyediakan:

GET /health

Response sederhana untuk memastikan server berjalan.

Health check dapat digunakan saat deployment dan troubleshooting.

==================================================
Y. RAG ARCHITECTURE
==================================================

RAG berjalan bertahap dengan schema, T37.1 PDF ingestion, T37.2 Gemini embedding generation, dan T37.3 retrieval. Retrieval menghitung cosine similarity 3072 dimensi di backend, hanya terhadap chunk dokumen `ready`, dengan top-K default 5 dan ambang default 0.30 yang dapat diatur melalui `SIMILARITY_THRESHOLD`. Tidak ada vector database. Answer generation dan UI chatbot belum diimplementasikan.

Urutan:

Website dasar
↓
Database
↓
Admin
↓
Content management
↓
Upload/document management
↓
Testing
↓
RAG

Hanya PDF yang secara eksplisit dipilih/disetujui boleh menjadi knowledge source; tidak ada auto-ingestion. Public accreditation PDF tidak otomatis menjadi sumber knowledge. Tahap pertama menerima PDF dengan text layer saja, tanpa OCR; ekstraksi yang gagal menetapkan status `failed` dan memberi admin informasi bahwa teks yang dapat diproses tidak ditemukan. Dokumen berada di private `backend/storage/rag/`, tidak pada public media route.

Pipeline: PDF maksimal 15 MB → SHA-256 → text extraction → paragraph chunking dengan target 1600 karakter dan overlap 200 karakter → simpan chunks → buat embedding memakai Gemini `gemini-embedding-2` → simpan vector dan model pada chunk → status dokumen `ready` jika seluruh embedding berhasil, atau `failed` dengan pesan aman. Chunk dengan embedding yang sudah ada dilewati. SHA-256 yang sudah ada ditolak dengan HTTP 409 dan dokumen lama tidak digunakan otomatis.

Retrieval embeds the question, scores stored vectors by cosine similarity, checks a relevance threshold, and calls the LLM only when the evidence is sufficient. Supported answers include source document and page where available. `GET /api/admin/rag/documents`, `POST /api/admin/rag/documents`, and `DELETE /api/admin/rag/documents/:id` are implemented and use `requireAdmin`. `POST /api/chatbot/ask` is planned and not implemented.

Jika pertanyaan berada di luar knowledge base:

- jangan mengarang;
- jangan menggunakan pengetahuan umum secara bebas;
- jawab persis: "Informasi tersebut tidak tersedia dalam sumber pengetahuan Program Studi Teknologi Rekayasa Multimedia.";
- jangan menggunakan pengetahuan umum untuk mengisi bukti yang tidak ditemukan.

RAG bukan chatbot general-purpose.

Embedding provider/model are fixed to Gemini API and `gemini-embedding-2`; backend environment names are `GEMINI_API_KEY` and `EMBEDDING_MODEL`. The API key must never reach frontend code, responses, or logs. LLM provider/model, rate limit, maximum question length, maximum answer length, and spend limit remain TBD and are required before production.

Contoh:

User:
"Ajari saya Python"

Bot:
menolak/redirect karena bukan bagian dari knowledge base TRM.

==================================================
Z. OUT OF SCOPE / JANGAN OVERENGINEERING
==================================================

Jangan menambahkan tanpa kebutuhan nyata:

- microservices;
- Kubernetes;
- Redis;
- message queue;
- event-driven architecture;
- WebSocket;
- multi-region;
- complex CI/CD;
- complex observability;
- service mesh;
- distributed architecture;
- unnecessary serverless architecture.

Project ini bukan enterprise platform.

Prioritasnya adalah project selesai, stabil, aman, dan mudah dipahami.

==================================================
AA. ATURAN AI CODING AGENT
==================================================

AI agent seperti Claude/Hermes wajib mengikuti workflow:

INSPECT
→ UNDERSTAND
→ PLAN
→ IMPLEMENT
→ TEST
→ VERIFY
→ REPORT

Sebelum perubahan besar:

1. baca dokumentasi yang relevan;
2. inspect repository;
3. inspect package.json;
4. inspect existing code;
5. pahami dependency;
6. buat rencana;
7. baru implementasi.

Jangan langsung menulis ulang project.

==================================================
AB. SOURCE OF TRUTH
==================================================

Gunakan:

01-prd.md
→ kebutuhan produk

02-desain.md
→ visual/UI/UX

03-arsitektur.md
→ struktur teknis dan deployment

04-database.md
→ database

05-fitur.md
→ spesifikasi fitur

06-animation.md
→ animation dan interaction

07-rules.md
→ aturan development

08-task.md
→ pekerjaan/tahapan

Jika dua dokumen bertentangan, jangan diam-diam memilih.

Identifikasi konflik dan minta keputusan user.

==================================================
AC. ATURAN PERUBAHAN ARSITEKTUR
==================================================

AI agent tidak boleh mengubah:

- framework;
- database;
- authentication strategy;
- UI library;
- repository architecture;
- deployment architecture

tanpa approval user.

Perubahan kecil yang tidak mengubah arsitektur boleh dilakukan jika sesuai dokumentasi.

==================================================
AD. DEPENDENCY RULE
==================================================

Sebelum install dependency baru:

1. cek apakah functionality sudah tersedia;
2. cek package.json;
3. cek dependency existing;
4. tentukan apakah dependency benar-benar diperlukan;
5. jelaskan alasan;
6. minta approval jika dependency mengubah fondasi project.

Jangan install dependency hanya karena AI agent terbiasa menggunakannya.

==================================================
AE. HERMES DEPLOYMENT CONTRACT
==================================================

Jika user mengatakan:

"Deploy project ini"

atau instruksi yang memiliki arti sama, Hermes harus:

1. membaca 03-arsitektur.md;
2. membaca 04-database.md;
3. membaca 07-rules.md;
4. membaca 08-task.md;
5. inspect repository;
6. inspect package.json;
7. inspect Git status;
8. inspect environment requirements;
9. inspect database configuration;
10. menjalankan test;
11. menjalankan build;
12. memeriksa deployment provider/config;
13. membuat deployment plan;
14. menjelaskan perubahan yang akan dilakukan;
15. meminta approval sebelum production action;
16. melakukan deployment;
17. memeriksa logs;
18. menjalankan health check;
19. menguji API;
20. menguji frontend;
21. melakukan smoke test;
22. melaporkan hasil.

==================================================
AF. CREDENTIAL RULE
==================================================

AI agent tidak boleh menebak:

- password;
- API key;
- database credential;
- session secret;
- deployment token;
- SSH key;
- cloud credential.

Jika credential belum tersedia:

berhenti pada bagian tersebut dan minta user melakukan authentication/configuration.

Prioritaskan:

- CLI login;
- environment variable;
- provider dashboard;
- secret manager.

==================================================
AG. WINDOWS COMMAND RULE
==================================================

User menggunakan Windows.

AI agent harus memperhatikan syntax command Windows.

Sebelum menjalankan command:

- pastikan working directory;
- pastikan command sesuai OS;
- jangan menggunakan command Linux secara sembarangan;
- jangan menjalankan destructive command tanpa alasan;
- jelaskan jika command berpotensi mengubah/menghapus data.

==================================================
AH. PRODUCTION SAFETY
==================================================

Production action harus diperlakukan berbeda dengan local development.

Local:
agent dapat melakukan perubahan yang aman sesuai permission.

Production:
agent wajib lebih berhati-hati.

Untuk operasi destructive:

STOP
↓
jelaskan risiko
↓
minta approval
↓
backup jika diperlukan
↓
baru execute

==================================================
AI. TROUBLESHOOTING
==================================================

Jika error:

1. baca error lengkap;
2. tentukan layer:
   - frontend;
   - backend;
   - API;
   - database;
   - environment;
   - deployment;
   - network;
3. cari root cause;
4. jangan langsung menebak;
5. buat fix;
6. test;
7. verify;
8. report.

Jangan melakukan random changes sampai error hilang.

==================================================
AJ. ROLLBACK
==================================================

Jika deployment gagal:

1. identifikasi masalah;
2. cek logs;
3. tentukan apakah perlu rollback;
4. rollback ke deployment stabil terakhir jika diperlukan;
5. verifikasi frontend;
6. verifikasi API;
7. verifikasi database.

Database tidak boleh dihapus sebagai metode rollback.

==================================================
AK. SMOKE TEST
==================================================

Setelah deployment, minimal test:

PUBLIC:

- homepage;
- profile;
- structure;
- news;
- projects;
- accreditation;
- FAQ;
- responsive/mobile.

ADMIN:

- login;
- dashboard;
- CRUD content;
- upload;
- logout.

SYSTEM:

- API;
- database;
- authentication;
- authorization;
- error handling;
- health endpoint.

==================================================
AL. MONITORING DASAR
==================================================

Monitoring tidak perlu kompleks.

Minimal:

- deployment status;
- application logs;
- server health;
- database availability;
- API response;
- error frequency.

Jangan menambahkan observability stack kompleks tanpa kebutuhan.

==================================================
AM. BACKUP
==================================================

Database production harus memiliki strategi backup sederhana.

Dokumentasikan:

- apa yang dibackup;
- kapan backup dilakukan;
- dimana backup disimpan;
- bagaimana restore dilakukan;
- siapa yang bertanggung jawab.

Jangan mengklaim backup tersedia jika belum dikonfigurasi.

==================================================
AN. DISASTER RECOVERY DASAR
==================================================

Jika production bermasalah:

1. identifikasi masalah;
2. cek application;
3. cek backend;
4. cek database;
5. cek provider;
6. cek deployment;
7. restore/rollback jika diperlukan;
8. test;
9. verify.

Tujuannya bukan membuat disaster recovery enterprise, tetapi memiliki prosedur dasar yang jelas.

==================================================
AO. TESTING
==================================================

Testing dilakukan minimal pada:

- frontend build;
- backend startup;
- API;
- database connection;
- authentication;
- authorization;
- CRUD;
- upload;
- error handling;
- responsive;
- deployment.

Test harus dilakukan sebelum production.

==================================================
AP. DEFINITION OF DONE
==================================================

Feature dianggap selesai jika:

- implementasi selesai;
- sesuai PRD;
- sesuai desain;
- sesuai arsitektur;
- database sesuai;
- API berjalan;
- validation berjalan;
- authentication/authorization benar;
- error handling tersedia;
- responsive;
- build berhasil;
- test berhasil;
- tidak ada error kritis;
- dokumentasi diperbarui jika diperlukan.

==================================================
AQ. IMPLEMENTATION PRIORITY
==================================================

Urutan implementasi:

1. Project setup
2. Frontend foundation
3. Database
4. Express backend
5. REST API
6. Authentication
7. Admin dashboard
8. Admin CRUD
9. Public website
10. File upload
11. Accreditation/document management
12. Animation/polish
13. Testing
14. Deployment
15. RAG

Jangan mengerjakan RAG terlalu awal.

==================================================
AR. FINAL ARCHITECTURE
==================================================

Arsitektur final:

                    INTERNET
                        │
                        ▼
                 ┌──────────────┐
                 │    USER      │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   SVELTEKIT  │
                 │   FRONTEND   │
                 └──────┬───────┘
                        │
                    HTTPS/REST
                        │
                        ▼
                 ┌──────────────┐
                 │   EXPRESS    │
                 │    BACKEND   │
                 └──────┬───────┘
                        │
                   mysql2/promise
                        │
                        ▼
                 ┌──────────────┐
                 │    MYSQL     │
                 │   DATABASE   │
                 └──────────────┘

Admin menggunakan jalur yang sama:

Admin
↓
SvelteKit Admin
↓
Express API
↓
Authentication/Authorization
↓
MySQL

==================================================
AS. FINAL PRINCIPLE
==================================================

Project ini harus dibangun dengan prinsip:

SIMPLE
STRUCTURED
SECURE
MAINTAINABLE
TESTABLE
DEPLOYABLE
AI-FRIENDLY

Jangan mengejar kompleksitas.

Jangan menambahkan teknologi hanya untuk terlihat profesional.

Jangan membiarkan AI coding agent mengambil keputusan arsitektur secara diam-diam.

Dokumentasi adalah sumber kebenaran.

Jika terjadi konflik antara implementasi dan dokumentasi:

1. identifikasi konflik;
2. jangan menebak;
3. jangan mengubah arsitektur diam-diam;
4. laporkan kepada user;
5. tunggu keputusan jika perubahan bersifat fundamental.

Tujuan akhir bukan membuat arsitektur yang paling kompleks.

Tujuan akhir adalah membuat Website Prodi Teknologi Rekayasa Multimedia yang:

- benar-benar selesai;
- dapat digunakan;
- mudah dikelola;
- aman;
- mudah dikembangkan;
- mudah di-deploy;
- mudah dipelihara;
- dan dapat dibantu AI coding agent tanpa kehilangan kontrol terhadap project.

==================================================
INSTRUKSI PENULISAN DOKUMEN
==================================================

Sekarang buat file:

docs/03-arsitektur.md

Gunakan seluruh spesifikasi di atas sebagai dasar.

PENTING:

1. Jangan membuat dokumen terpisah.
2. Semua harus berada dalam satu 03-arsitektur.md.
3. Gunakan satu breakdown linear bernomor.
4. Buat struktur sekitar 1–65 bagian.
5. Gabungkan bagian yang memiliki fungsi sama jika diperlukan, tetapi jangan menghilangkan aturan penting.
6. Jangan menambahkan teknologi baru tanpa alasan.
7. Jangan mengubah stack.
8. Jangan membuat arsitektur enterprise.
9. Jangan mengarang requirement yang tidak diberikan.
10. Jangan menganggap provider deployment tertentu sudah dipilih.
11. Jika ada informasi yang belum ditentukan, tandai sebagai "TBD" atau "Keputusan belum ditentukan".
12. Jangan mengisi TBD dengan asumsi.
13. Gunakan Bahasa Indonesia.
14. Gunakan istilah teknis yang umum.
15. Buat dokumentasi cukup detail sehingga AI coding agent dapat menggunakannya sebagai technical source of truth.
16. Tetap buat manusia/developer pemula dapat memahami isinya.
17. Gunakan Markdown yang rapi.
18. Tambahkan diagram ASCII jika membantu.
19. Jangan membuat isi hanya berupa teori; tuliskan aturan operasional yang konkret.
20. Pastikan bagian deployment dan Hermes cukup jelas untuk digunakan saat project nanti benar-benar dideploy.

SEBELUM MENULIS:

Jika repository/project tersedia, inspect struktur project terlebih dahulu.

Jika belum tersedia atau struktur berbeda dengan struktur yang disarankan, JANGAN memaksakan struktur contoh ke project.

Setelah selesai:

1. tampilkan ringkasan isi;
2. tampilkan struktur heading 1–65;
3. jelaskan keputusan arsitektur utama;
4. sebutkan bagian yang masih TBD;
5. jangan mengubah file lain;
6. jangan install dependency;
7. jangan melakukan refactor code;
8. tugas kali ini hanya membuat/memperbarui docs/03-arsitektur.md.
