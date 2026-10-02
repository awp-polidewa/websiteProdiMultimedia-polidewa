# 05-fitur.md — Spesifikasi Fitur Fungsional

Project: Website Program Studi Teknologi Rekayasa Multimedia (TRM), Politeknik Dewantara

Status dokumen: acuan fitur fungsional. Hal yang belum pasti ditulis **TBD**. Konflik atau celah antar dokumen ditandai **[REVIEW]**.

Catatan penyusunan: `01-prd.md` dan `03-arsitektur.md` tidak dapat dibaca saat dokumen ini ditulis. Isi dokumen ini bersumber dari instruksi user, `02-desain.md`, dan `04-database.md`. Semua bagian yang bergantung pada PRD dan arsitektur ditandai TBD/[REVIEW] dan wajib dicek sebelum implementasi.

---

## 1. Tujuan Dokumen

- Fungsi: menjelaskan apa yang dilakukan setiap fitur (perilaku fungsional), bukan bagaimana tampilannya atau bagaimana kodenya.
- Pengguna: developer (mahasiswa) dan AI agent (Claude/Hermes) yang mengimplementasikan fitur.
- Cara dipakai: agent membaca dokumen ini sebelum implementasi, mengerjakan satu fitur per waktu, dan memeriksa acceptance criteria di bagian 55.

Hubungan dengan dokumen lain:

| Dokumen          | Peran terhadap 05-fitur.md           |
| ---------------- | ------------------------------------ |
| 01-prd.md        | Dasar kebutuhan (WHAT & WHY)         |
| 02-desain.md     | Perilaku UI/UX yang sudah ditentukan |
| 03-arsitektur.md | Batasan teknis                       |
| 04-database.md   | Struktur data                        |
| 06-animation.md  | Detail motion                        |
| 07-rules.md      | Aturan pengembangan                  |

## 2. Prinsip Fitur

- Information first.
- Simple before complex.
- Admin hanya mengelola data yang memang perlu dikelola.
- Konten statis tetap statis jika tidak perlu dikelola admin.
- Setiap fitur punya alasan yang jelas dan bisa diuji.
- Tidak menambah fitur tanpa kebutuhan.
- Tidak membuat fitur yang butuh maintenance tinggi bila manfaatnya kecil.

## 3. Pembagian Fitur

| Kelompok              | Fitur                                                                     | Tahap                               |
| --------------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| A. Public Website     | Home, profil prodi, struktur dosen, berita, project, akreditasi           | Wajib (MVP)                         |
| B. Admin              | Dashboard, sidebar, tabel, form                                           | Wajib (MVP)                         |
| C. Authentication     | Login, logout, session, proteksi                                          | Wajib (MVP)                         |
| D. Content Management | CRUD dosen, berita                                                        | Wajib (MVP)                         |
| E. Showcase Projects  | Daftar, detail, filter, CRUD project                                      | Wajib (MVP)                         |
| F. Accreditation      | Halaman informasi dan pengelolaan PDF resmi                              | Wajib (MVP)                         |
| G. RAG Chatbot        | Chatbot dan kelola dokumen RAG                                            | Fase berikutnya                     |
| H. Utility            | Validasi, upload gambar, error/loading/empty state, pagination, SEO dasar | Wajib (mendukung)                   |
| Pengumuman            | Lihat bagian 17                                                           | Optional/TBD                        |
| FAQ                   | Disebut di `02-desain.md`; ada tidaknya sebagai fitur: **TBD** (cek PRD)  | TBD                                 |

Tidak ada fitur di luar PRD yang ditambahkan dokumen ini.

## 4. User Public

Pengunjung dapat:

- melihat informasi prodi;
- melihat struktur dosen;
- membaca berita;
- melihat project mahasiswa;
- melihat informasi akreditasi;
- menggunakan chatbot setelah tersedia.

Tidak ada akun public user. Tidak ada login untuk pengunjung.

Kontrak GET public, payload, pagination, validasi parameter, dan error envelope didokumentasikan di `09-data-api.md`. Profil prodi tetap konten statis dan tidak memakai API.

## 5. Admin

Admin adalah pengelola konten website (pengguna utama: kaprodi). Konsep sederhana: **admin = pengguna yang memiliki akses ke dashboard admin**. Hanya satu jenis admin, tanpa role kompleks (sesuai `04-database.md` bagian 12).

## 6. Authentication Admin

Fitur:

- login admin memakai NIDN dosen atau username + password; NIDN dan username dapat diubah sendiri melalui pengaturan;
- logout;
- session berbasis signed HTTP-only cookie, berlaku 8 jam; `SameSite=Lax`, `Secure` pada production;
- proteksi halaman admin (belum login → diarahkan ke halaman login);
- proteksi API admin (belum login → 401).

Tidak dibuat: social login, OTP, MFA, reset password kompleks, role hierarchy. NIDN dan username dapat diubah sendiri admin; penggantian password dilakukan melalui prosedur admin terkontrol.

## 7. Public Navigation

Navigasi mengikuti `02-desain.md` (sederhana, tidak terlalu banyak item). Menu yang dibutuhkan fitur: profil, struktur, berita, project, akreditasi. Daftar final item menu dan label: **TBD** (`02-desain.md` bagian 13 juga menandai TBD). Tidak menambah menu yang belum ditentukan. Menu Pengumuman, FAQ, dan Chatbot hanya muncul jika fiturnya aktif.

## 8. Halaman Home

- Tujuan: membantu pengunjung (terutama calon mahasiswa) memahami TRM dengan cepat.
- Isi: hero (typography besar, interaksi per karakter sesuai `02-desain.md`), pengenalan singkat TRM, highlight project, highlight berita (hanya jika ada berita published), CTA seperlunya, footer.
- Highlight project/berita mengambil data dari database; jika kosong, bagian itu menampilkan empty state yang jelas (keputusan implementasi frontend).
- Teks pengenalan: dari konten statis. Isi teks resmi: **TBD**, tidak dikarang.
- Keputusan visual mengikuti `02-desain.md` tanpa perubahan.

## 9. Halaman Profil Prodi

**STATIC CONTENT** pada versi awal. Dikelola lewat source code, bukan database/admin.

Isi yang dapat mencakup: nama prodi, deskripsi, visi, misi, tujuan, informasi resmi lain yang sudah disetujui. Isi teks resmi: **TBD**.

Tidak dibuat: tabel `program_profile`, CRUD profile, API profile, admin edit profile. Keputusan profil statis dicatat di `04-database.md` bagian 21.

## 10. Struktur Dosen

- Data berasal dari database (tabel `lecturers`).
- Tampil: nama, jabatan/peran (`title`), konsentrasi, foto, serta informasi lain yang sudah disetujui. Email tidak ditampilkan publik.
- Struktur utama: Kaprodi di atas; di bawahnya Web Design, Graphic Design, Videography.
- Urutan mengikuti `display_order`.
- Jika foto belum ada: placeholder jelas. Tidak memakai foto generated.
- Tidak ada data dosen fiktif. Seed development memakai data contoh yang ditandai jelas sebagai contoh.

## 11. Interaksi Struktur Dosen

Desktop:

- Default: struktur organisasi tampil normal.
- Hover node: layout sedikit menyesuaikan, preview profil (foto, nama, role) muncul di sisi kanan; bukan modal, struktur tetap terlihat.
- Hover node lain: isi preview berganti.
- Keluar dari area: preview menghilang smooth.
- Keyboard: node dapat difokuskan dan menampilkan preview yang sama saat fokus.

Mobile: tidak bergantung hover; gunakan daftar node vertikal berbentuk tombol/card. Tap memilih node dan menampilkan preview setelah diagram, sesuai keputusan `02-desain.md` bagian 20.

Detail animation → `06-animation.md`.

## 12. Admin Kelola Dosen

CRUD sederhana: list, tambah, lihat/edit, hapus.

- Field mengikuti `04-database.md`: `name`, `title`, `concentration` (opsional), `photo_path` (opsional), `bio` (opsional), `email` (opsional dan privat), `display_order`.
- Admin dapat menambah, mengubah data, mengganti foto, mengatur urutan, dan menghapus.
- Urutan diatur dengan nilai angka `display_order`; jika sama, urutkan berdasarkan `id`.
- Validasi: `name` dan `title` wajib; panjang sesuai kolom; file foto divalidasi (bagian 28).
- Tidak ada approval workflow.

## 13. Berita

Pengunjung dapat:

- melihat daftar berita (hanya `status = published`), diurutkan terbaru dulu;
- membuka detail berita lewat slug.

Tampil: thumbnail (jika ada), judul, excerpt, tanggal, isi. Berita tidak menggunakan kategori; isi disimpan plain text dengan line break. Layout mengikuti `02-desain.md` (editorial, bukan otomatis grid 3 kolom).

## 14. Admin Kelola Berita

CRUD sederhana:

- CREATE: judul, slug, excerpt, content, thumbnail, status (draft/published).
- READ: daftar dan detail berita (admin melihat semua status).
- UPDATE: edit berita.
- DELETE: hapus berita (dengan konfirmasi).

`created_at` dan `updated_at` diisi database dan ditampilkan di admin. `published_at` diisi saat berita diterbitkan. Format `content` plain text dan editor textarea sederhana (`04-database.md` bagian 15).

Tidak dibuat: approval, revision history, scheduling kompleks, editorial workflow, kolaborasi draft, audit trail.

## 15. Project Mahasiswa

Halaman showcase (image-first sesuai `02-desain.md`).

Kategori baku: `desain`, `coding`, `3d`, `multimedia`, `lainnya` (lowercase). Satu karya memiliki satu thumbnail.

Pengunjung dapat: melihat daftar, membuka detail, melihat gambar, melihat deskripsi, melihat nama mahasiswa (jika terisi), membuka external URL (jika ada).

## 16. Admin Kelola Project

CRUD sederhana: tambah, lihat, edit, hapus.

Field mengikuti `04-database.md`: `title`, `slug`, `description`, `thumbnail_path`, `category`, `student_name`, `project_year`, `external_url`.

Keputusan: project langsung tampil setelah tersimpan; tidak ada status draft/published.

Tidak dibuat: submission mahasiswa, voting, like, komentar, rating, moderation kompleks.

## 17. Pengumuman

**Optional/TBD, fase berikutnya.** Tabel `announcements` tidak dibuat di versi awal (`04-database.md` bagian 19); informasi publik disampaikan lewat berita.

Jika nanti masuk scope: admin membuat/mengedit/menghapus; public melihat. Pengaktifannya memerlukan konfirmasi user dan perubahan schema yang disetujui.

## 18. Akreditasi

Halaman informasi akreditasi.

Tujuan: memberi informasi status akreditasi, menyediakan dokumen resmi, dan membantu mahasiswa memperoleh dokumen yang diperlukan (termasuk untuk keperluan surat keterangan akreditasi/beasiswa).

Fitur:

- menampilkan informasi dan daftar dokumen;
- tombol lihat dan tombol download jika file tersedia;
- melihat/mengunduh PDF resmi surat keterangan akreditasi; website tidak merakit atau menghasilkan isi surat.

Isi resmi (peringkat, nomor SK, masa berlaku): **TBD**, tidak dikarang. Tidak ada sistem verifikasi dokumen.

## 19. Admin Kelola Dokumen Akreditasi

Admin dapat: upload dokumen, edit metadata, hapus dokumen, lihat dokumen.

Database menyimpan path/URL dan metadata (`title`, `description`, `file_path`, `source_url`, `published_at`), bukan file binary.

Keputusan: dokumen PDF akreditasi dikelola admin; file PDF menjadi sumber resmi dan database menyimpan metadata serta path.

Tidak dibuat: versioning dokumen, approval, tanda tangan digital, document verification engine.

## 20. RAG Chatbot

**Fase akhir**, dikerjakan setelah semua fitur MVP selesai.

Tujuan: membantu pengguna mendapat informasi tentang Prodi TRM.

Chatbot tidak boleh menjadi tutor programming umum, chatbot general purpose, mesin pencari umum, atau AI yang menjawab bebas semua pertanyaan.

## 21. Batasan RAG

- Chatbot hanya menjawab dari knowledge base (dokumen yang disediakan).
- Jika pertanyaan di luar knowledge base: menyatakan informasi tidak tersedia, tidak mengarang, dan mengarahkan pengguna ke informasi resmi prodi bila perlu.
- Contoh: "Ajari saya Python." → tidak dijawab sebagai tutor Python.
- Batas panjang pertanyaan/respons dan pembatasan penggunaan (untuk hemat biaya API): **TBD**.

## 22. Knowledge Base RAG

Sumber yang dapat dipakai: dokumen resmi prodi, dokumen akademik yang disetujui, dokumen akreditasi, dokumen informasi prodi. Dokumen tidak dimasukkan otomatis tanpa proses yang ditentukan (admin mengunggah dokumen secara sengaja). Detail implementasi (penyedia model, penyimpanan embedding): **TBD**, mengikuti `03-arsitektur.md`.

## 23. Admin RAG Document

Pada fase RAG, admin dapat: upload dokumen (PDF), melihat daftar, dan menghapus. Tabel `rag_documents` (ditunda, `04-database.md` bagian 47). Tidak ada document management system kompleks.

## 24. Search

Global search **tidak dibuat** pada MVP (tidak ada kebutuhan di dokumen yang tersedia). Pencarian sederhana di admin (judul) bersifat opsional/TBD, memakai query `LIKE`. Tidak ada search engine khusus.

## 25. Filter Project

Filter sederhana berdasarkan kategori yang ada, mis. Semua, Desain, Coding, 3D. Gunakan allowlist baku `desain`, `coding`, `3d`, `multimedia`, `lainnya`. Tidak ada filter kompleks.

## 26. Pagination

Hanya untuk data yang bisa banyak: berita dan project (juga tabel admin yang relevan). Pagination sederhana, bukan infinite scroll. Public menampilkan 12 item per halaman dan admin 20 item per halaman, sesuai `04-database.md` bagian 46. Client mengirim nomor halaman; backend menetapkan ukuran halaman dan tidak menerima limit mentah.

## 27. Detail Page

- Berita: `/news/{slug}` (pola URL final: **TBD**, mengikuti arsitektur).
- Project: berdasarkan `slug`.
- Dokumen akreditasi: tidak butuh halaman detail; cukup tombol lihat/download.
- Slug tidak ditemukan → halaman not found (bagian 30). Berita berstatus draft tidak bisa diakses public; project langsung tampil setelah tersimpan.

## 28. Image Management

- Upload gambar untuk foto dosen, thumbnail berita, thumbnail project.
- Validasi tipe file (daftar tipe: **TBD**) dan ukuran maksimum (**TBD**).
- Database menyimpan path/URL; file di storage (lokasi: **TBD**, `03-arsitektur.md`).
- Preview gambar di form admin jika diperlukan.
- Tidak ada image processing pipeline kompleks.

## 29. Form Validation

Semua form admin memiliki: field wajib, validasi format, validasi panjang, validasi file jika ada upload. Validasi di frontend (UX) dan backend. **Backend adalah validasi utama.**

## 30. Error Handling

| Situasi            | Perilaku                                             |
| ------------------ | ---------------------------------------------------- |
| API error          | Pesan umum yang jelas, tanpa detail teknis           |
| Validation error   | Pesan per field, nilai yang sudah diisi tidak hilang |
| Not found (404)    | Halaman/pesan "tidak ditemukan" dengan link kembali  |
| Unauthorized (401) | Diarahkan ke login                                   |
| Forbidden (403)    | Pesan akses ditolak                                  |
| Server error (500) | Pesan umum, detail hanya di log server               |
| Upload error       | Pesan jelas (tipe/ukuran salah, gagal upload)        |

Pesan tidak membocorkan informasi sensitif.

## 31. Loading State

Sederhana dan konsisten untuk: halaman yang mengambil API, submit form (tombol nonaktif + indikator), upload, dan chatbot (indikator "sedang menjawab"). Tidak ada animasi loading berlebihan (`02-desain.md` bagian 47).

## 32. Empty State

Pesan jelas saat belum ada berita, project, dosen, atau dokumen. Tidak ada halaman kosong tanpa penjelasan. Teks empty state: **TBD**.

## 33. Success State

Setelah create, update, atau delete berhasil, admin mendapat feedback sederhana (mis. pesan singkat). Tidak ada notification system kompleks.

## 34. Delete Confirmation

Data penting memakai konfirmasi sederhana sebelum delete. Tidak ada recycle bin. Backend tetap melakukan pengecekan autentikasi. Setelah record dihapus, file aplikasi hanya dihapus bila tidak lagi direferensikan; kegagalan dicatat untuk penanganan manual.

## 35. created_at dan updated_at

Semua entity CRUD admin mengikuti `04-database.md`. Admin UI menampilkan "Dibuat" dan "Diperbarui" jika berguna. Database adalah sumber timestamp; frontend hanya memformat. Tidak ada timestamp manual dari frontend. Timezone tampilan: `Asia/Makassar` (`04-database.md` bagian 30).

## 36. Slug

Untuk berita dan project: slug URL-friendly dibuat otomatis dan unik; bentrok diberi suffix `-2`, `-3`, dan seterusnya. Mengubah judul tidak mengubah slug. Tidak ada slug history/redirect.

## 37. Permission Admin

Satu tipe admin: dapat mengelola seluruh konten admin. Tidak ada super admin, editor, moderator, reviewer, approver.

## 38. Public API Access

Public hanya mendapat data yang dibutuhkan website, dan hanya yang aman untuk tampil.

| Data                                          | Akses public                               |
| --------------------------------------------- | ------------------------------------------ |
| Dosen                                         | Baca (field yang disetujui tampil)         |
| Berita                                        | Baca, hanya published                      |
| Project                                       | Baca seluruh project (langsung tayang)     |
| Akreditasi                                    | Baca dokumen yang eligibility-nya disetujui; visibility masih TBD |
| Chatbot                                       | Kirim pertanyaan (fase RAG)                |
| Admin, session, credential, metadata internal | Tidak pernah                               |

Endpoint public GET final ada di `09-data-api.md`. Endpoint admin write/auth belum dirinci karena berada pada milestone berikutnya.

## 39. Admin API Access

Semua endpoint create, update, delete (dan read data admin seperti draft) wajib autentikasi admin lewat session cookie. Tanpa session valid → 401. Pengecekan dilakukan di backend, bukan hanya di frontend.

## 40. Data Ownership

| Data                                                        | Pemilik / lokasi                  |
| ----------------------------------------------------------- | --------------------------------- |
| Konten website dinamis (dosen, berita, project, akreditasi) | Admin/prodi, disimpan di database |
| Konten statis (profil prodi, teks halaman tetap)            | Source code                       |
| File dan gambar                                             | Storage (path di database)        |

## 41. Responsive Behavior

Semua fitur berjalan di desktop, tablet, mobile mengikuti `02-desain.md`. Tidak ada fitur desktop-only; interaksi hover wajib punya alternatif tap/keyboard.

## 42. Accessibility

Minimal: semantic HTML, keyboard access, visible focus, alt text, accessible labels, alternatif interaksi untuk hover. Mengikuti `02-desain.md` bagian 44.

## 43. SEO

Untuk halaman public yang relevan: title, meta description, struktur semantik, slug yang mudah dibaca, alt text gambar. Tidak ada sistem SEO kompleks. Cara menangani render sisi server/meta tag mengikuti `03-arsitektur.md` (**TBD**).

## 44. Security

Fitur admin wajib: autentikasi, otorisasi, validasi input, parameterized query, validasi upload, HTTP-only session cookie. Tidak menambah security framework baru kecuali diwajibkan arsitektur. Perlindungan tambahan seperti rate limit login atau CSRF: **TBD**, mengikuti `03-arsitektur.md`.

## 45. Admin Dashboard

Hanya informasi berguna: jumlah berita, jumlah project, jumlah dosen, jumlah dokumen (akreditasi, dan dokumen RAG di fase RAG). Tanpa widget dekoratif. Gaya mengikuti admin di `02-desain.md`.

## 46. Admin Sidebar

Menu mengikuti fitur nyata:

- Dashboard
- Dosen
- Berita
- Project
- Akreditasi (jika kelola dokumen dipakai, bagian 19)
- Pengumuman (hanya jika diaktifkan)
- RAG Documents (hanya fase RAG)
- Logout

Menu pengaturan admin menyediakan perubahan NIDN dan username.

## 47. Admin Table

Mudah dibaca, ada action edit/delete, pagination jika perlu, empty state, loading state. Tidak ada fitur table kompleks.

## 48. Admin Form

Jelas, dengan label, helper text jika perlu, validasi, submit state, error state, success feedback. Mengikuti `02-desain.md` bagian 29 dan 41.

## 49. File Upload

| Upload             | Fase                          | Catatan            |
| ------------------ | ----------------------------- | ------------------ |
| Foto dosen         | MVP                           | Gambar             |
| Thumbnail project  | MVP                           | Gambar             |
| Thumbnail berita   | MVP                           | Gambar             |
| Dokumen akreditasi | MVP dikelola admin            | PDF resmi          |
| Dokumen RAG        | Fase RAG                      | PDF                |

File disimpan pada filesystem persisten sesuai `04-database.md` bagian 48. Aturan validasi MIME/ukuran mengikuti spesifikasi upload saat implementasi.

## 50. Content Lifecycle

Create → Read → Update → Delete. Untuk berita (dan project jika status dipakai): Draft → Published. Tidak ada workflow editorial.

## 51. Fitur yang Tidak Dibuat

Tidak termasuk versi awal:

- sistem akademik, portal mahasiswa, nilai, KRS, presensi;
- komentar, like, forum, rating, voting;
- akun public, social login, OTP, MFA;
- notification center;
- multi-language;
- multi-role kompleks, RBAC;
- CMS enterprise, workflow approval, versioning konten;
- audit log, soft delete massal;
- analytics kompleks;
- chatbot AI umum;
- payment;
- real-time system, websocket, queue, microservices;
- global search engine;
- fitur di luar PRD.

Daftar ini perlu dicocokkan dengan PRD (**[REVIEW]**).

## 52. Prioritas Fitur

**MVP**

- profil prodi (static)
- struktur dosen
- berita
- project
- login admin
- CRUD admin untuk dosen, berita, project
- informasi akreditasi

**Fase berikutnya**

- pengumuman (jika diperlukan)
- RAG chatbot
- kelola dokumen akreditasi lewat admin (jika diputuskan perlu, bagian 19)

**Optional/TBD**

- FAQ sebagai halaman/fitur
- pencarian admin
- kategori berita
- fitur cetak surat akreditasi dalam bentuk khusus

## 53. Dependency Antar Fitur

```
Admin Login
   ↓
Admin Dashboard
   ↓
CRUD Dosen / Berita / Project (/ Akreditasi)
   ↓
Public Website mengambil data
```

```
RAG:
Dokumen → Knowledge Base → Retrieval → Chatbot
```

Fitur public tidak bergantung pada login admin, tetapi isinya bergantung pada data yang dikelola admin.

## 54. Feature Flow

### Login admin

- Tujuan: masuk ke dashboard.
- Actor: admin.
- Input: identitas login, password.
- Process: backend memeriksa kredensial dan membuat session lewat HTTP-only cookie.
- Output: redirect ke dashboard.
- Validation: kedua field wajib terisi.
- Error State: pesan umum "login gagal" tanpa membedakan penyebab; tidak membocorkan apakah akun ada.
- Success State: masuk dashboard.

### Kelola dosen

- Tujuan: menjaga data struktur dosen.
- Actor: admin.
- Input: name, title, concentration, foto, bio, display_order.
- Process: validasi → simpan → database mengisi timestamp.
- Output: dosen muncul di daftar admin dan halaman struktur.
- Validation: name dan title wajib; foto sesuai bagian 28.
- Error State: pesan validasi/upload.
- Success State: pesan sukses sederhana.

### Kelola berita

- Tujuan: menerbitkan berita.
- Actor: admin.
- Input: title, slug, excerpt, content, thumbnail, status.
- Process: validasi → simpan sebagai draft atau published; saat publish, isi `published_at`.
- Output: berita muncul di admin; tampil di public jika published.
- Validation: title, slug unik, content wajib.
- Error State: validasi, slug bentrok, upload gagal.
- Success State: pesan sukses.

### Kelola project

- Tujuan: menampilkan karya mahasiswa.
- Actor: admin.
- Input: title, slug, description, thumbnail, category, student_name, project_year, external_url.
- Process: validasi → simpan.
- Output: project tampil di showcase.
- Validation: title, slug unik, category wajib; `external_url` berformat URL jika diisi.
- Error State: validasi/upload.
- Success State: pesan sukses.

### Akreditasi (public)

- Tujuan: memberi informasi dan dokumen akreditasi.
- Actor: pengunjung.
- Input: membuka halaman.
- Process: mengambil data dokumen.
- Output: informasi, tombol lihat/download/cetak.
- Validation: -.
- Error State: "Gagal memuat informasi akreditasi."
- Success State: informasi tampil.

### Chatbot (fase RAG)

- Tujuan: menjawab pertanyaan tentang prodi dari knowledge base.
- Actor: pengunjung.
- Input: pertanyaan teks.
- Process: mencari konteks di knowledge base → menjawab hanya dari konteks.
- Output: jawaban, atau pernyataan bahwa informasi tidak tersedia.
- Validation: tidak kosong, batas panjang (**TBD**).
- Error State: pesan gagal sederhana.
- Success State: jawaban tampil.

## 55. Acceptance Criteria

**Admin login**

- form login dapat dibuka;
- kredensial benar → session dibuat dan masuk dashboard;
- kredensial salah → pesan gagal umum;
- halaman admin tanpa login → diarahkan ke login;
- endpoint admin tanpa session → 401.

**Admin tambah dosen**

- admin sudah login;
- field wajib divalidasi;
- data tersimpan;
- `created_at` otomatis dari database;
- dosen muncul di daftar admin dan halaman struktur;
- urutan mengikuti `display_order`.

**Admin tambah berita**

- admin sudah login;
- form dapat dibuka;
- field wajib divalidasi, slug unik;
- berita tersimpan;
- `created_at` otomatis dibuat database;
- berita muncul di daftar admin;
- berita tampil di public jika statusnya published.

**Admin tambah project**

- admin sudah login;
- field wajib divalidasi;
- project tersimpan dengan `created_at`;
- project tampil di showcase dan terfilter sesuai kategori.

**Edit dan hapus (semua entity CRUD)**

- edit mengubah data dan memperbarui `updated_at`;
- hapus meminta konfirmasi;
- setelah hapus, data tidak tampil di admin maupun public.

**Struktur dosen (public)**

- struktur menampilkan Kaprodi dan tiga konsentrasi sesuai data;
- hover/fokus menampilkan preview tanpa modal;
- di mobile, informasi dapat diakses lewat tap tanpa hover.

**Berita dan project (public)**

- daftar menampilkan data published saja;
- detail dapat dibuka lewat slug;
- slug tidak ada → halaman not found;
- data kosong → empty state.

**Akreditasi**

- informasi dan dokumen yang tersedia tampil;
- tombol lihat/download berfungsi bila file ada;
- tidak ada isi resmi yang dikarang.

**Chatbot (fase RAG)**

- pertanyaan yang ada di knowledge base dijawab dari sumbernya;
- pertanyaan di luar konteks mendapat pernyataan bahwa informasi tidak tersedia.

## 56. Testing Feature

Test minimal untuk setiap fitur utama: happy path, validation, unauthorized, not found, error state, dan responsive jika relevan. Pengujian manual yang tercatat sudah cukup untuk MVP; framework/infrastruktur testing kompleks tidak dibuat. Pilihan alat test otomatis (jika ada): **TBD**, mengikuti `03-arsitektur.md` dan `07-rules.md`.

## 57. AI Agent Implementation Guidance

AI agent harus:

1. membaca seluruh docs sebelum implementasi;
2. memahami scope fitur;
3. implement satu fitur pada satu waktu;
4. tidak mengubah fitur lain tanpa alasan;
5. tidak menambahkan dependency tanpa persetujuan;
6. tidak mengubah database schema tanpa persetujuan;
7. tidak membuat fitur tambahan sendiri;
8. memakai komponen yang sudah ada;
9. melakukan testing setelah implementasi;
10. melaporkan perubahan yang dibuat.

## 58. Feature Change Rule

Jika user meminta fitur baru, agent wajib: cek PRD, cek arsitektur, cek database, cek dependency fitur, jelaskan impact, dan minta approval jika perubahan signifikan. Agent tidak mengubah arsitektur hanya demi satu fitur baru.

## 59. Definition of Done

Fitur selesai jika:

- sesuai requirement;
- UI sesuai desain;
- API sesuai arsitektur;
- database sesuai `04-database.md`;
- validation bekerja;
- error state bekerja;
- authentication bekerja jika diperlukan;
- responsive;
- tidak ada console error yang tidak perlu;
- tidak merusak fitur lain.

## 60. MVP Boundary

Tujuan MVP: website dapat

- memberikan informasi resmi TRM;
- menampilkan struktur dosen;
- menampilkan berita;
- menampilkan project;
- memberikan informasi akreditasi;
- memungkinkan admin mengelola konten utama (dosen, berita, project; akreditasi jika diputuskan);
- memiliki fondasi untuk RAG pada fase berikutnya jika siap.

Di luar daftar ini bukan MVP.

## 61. Simplicity Check

Sebelum fitur dianggap final, tanyakan:

- Apakah fitur ini benar-benar dibutuhkan?
- Apakah bisa dibuat lebih sederhana?
- Apakah menambah maintenance?
- Apakah butuh dependency baru?
- Apakah manfaatnya sebanding dengan kompleksitasnya?

Jika tidak, gunakan solusi yang lebih sederhana.

## 62. Anti Over-Engineering Check

Pastikan tidak ada: abstraksi berlebihan, service layer yang tidak dibutuhkan, generic CRUD framework, permission engine, workflow engine, event bus, queue, microservices, caching layer yang belum dibutuhkan, database tambahan, vector database sebelum RAG benar-benar diperlukan.

## 63. Source of Truth

Urutan prioritas:

1. Requirement resmi/user
2. 01-prd.md
3. 02-desain.md
4. 03-arsitektur.md
5. 04-database.md
6. 05-fitur.md
7. 06-animation.md
8. 07-rules.md
9. 08-task.md

Jika terjadi konflik, jangan mengarang solusi; tandai untuk review.

## 64. Review Akhir

Hasil pemeriksaan pada saat dokumen ini ditulis:

- Fitur PRD tercakup? **Belum bisa dipastikan**, PRD tidak terbaca. Pemeriksaan harus dilakukan.
- Fitur di luar PRD? Tidak dapat dipastikan sebelum verifikasi PRD; FAQ masih belum diputuskan. Dokumen akreditasi berupa PDF resmi yang dikelola admin.
- Over-engineering? Tidak ada workflow, role, atau audit.
- Fitur admin benar-benar dibutuhkan? Dosen, berita, project, dan pengelolaan PDF akreditasi: ya.
- Fitur static tetap static? Ya, profil prodi.
- CRUD punya `created_at`/`updated_at`? Ya, sesuai `04-database.md`.
- RAG terbatas pada knowledge base? Ya (bagian 21).
- Dikerjakan dengan stack yang dipilih? Ya, tidak ada teknologi baru; detail mengikuti arsitektur.
- Acceptance criteria cukup jelas? Ya untuk MVP (bagian 55).

Catatan konflik/celah **[REVIEW]**:

1. Keputusan database MVP sudah dikunci di `04-database.md` dan diselaraskan di dokumen fitur ini.
2. Menu navigasi final belum ditentukan (`02-desain.md` bagian 13).
3. Keberadaan FAQ sebagai fitur belum jelas (disebut di `02-desain.md` bagian 23).

## 65. Final Principle

> Bangun fitur yang benar-benar dibutuhkan, dengan cara paling sederhana yang tetap aman, jelas, dapat diuji, dan mudah dipelihara.

Website ini bukan dibuat untuk memiliki fitur sebanyak mungkin. Tujuan utamanya adalah menghasilkan website Prodi TRM yang:

- selesai;
- stabil;
- informatif;
- mudah digunakan;
- mudah dikelola;
- mudah dikembangkan kemudian.

Jangan menambahkan fitur hanya karena secara teknis memungkinkan.

---

## Lampiran: TBD Fitur

- Isi teks resmi profil prodi (visi, misi, dll.) dan informasi akreditasi; tidak dikarang.
- Item final navigasi dan keberadaan FAQ.
- Tipe/ukuran maksimum upload serta teks empty state.
- Batas chatbot, penyedia model, knowledge base RAG, dan alat testing otomatis.
