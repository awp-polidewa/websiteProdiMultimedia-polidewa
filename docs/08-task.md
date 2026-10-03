# 08-task.md — Task Roadmap Implementasi

Project: Website Program Studi Teknologi Rekayasa Multimedia (TRM), Politeknik Dewantara

Status dokumen: roadmap task implementasi. Hal yang belum pasti ditulis **TBD**. Celah/konflik antar dokumen ditulis **[REVIEW]**.

Catatan penyusunan:

- `01-prd.md` dan `03-arsitektur.md` tidak dapat dibaca saat dokumen ini ditulis, dan repository tidak diinspeksi. Task disusun dari instruksi user dan dokumen `02`–`07`. Task yang bergantung pada PRD/arsitektur merujuk ke dokumen tersebut atau ditandai TBD.
- Instruksi user menyebut "architecture.md"; di dokumen ini yang dimaksud adalah `docs/03-arsitektur.md`.
- Status awal semua task adalah **TODO**, kecuali yang ditandai lain di kolom Catatan. Status sebenarnya (mis. fondasi project yang sudah ada) ditentukan agent lewat task T0.1.
- Prioritas (P0–P3) pada tiap task adalah usulan penyusunan dokumen; user dapat mengubahnya.

---

## Prinsip

**MENGHASILKAN PROJECT YANG SELESAI.** Bukan sistem paling kompleks, bukan semua fitur sekaligus, bukan teknologi sebanyak mungkin.

Urutan besar: Plan → Setup → Foundation → Public Website → Backend → Database → Admin → Integration → Animation → Testing → Polish → Deployment → RAG.

RAG tidak dikerjakan di awal. Polish visual besar tidak dilakukan sebelum struktur dan fungsi utama stabil. Task berikutnya tidak dikerjakan jika dependency pentingnya belum selesai.

## 1. Tujuan Task Document

- Fungsi: mengubah keputusan di dokumen 01–07 menjadi pekerjaan bertahap yang dapat dikerjakan satu per satu.
- Pengguna: developer (mahasiswa) dan AI agent (Hermes/Antigravity).
- Cara dipakai agent: ambil satu task, baca dokumen relevan, kerjakan, test, laporkan, tandai status (bagian 54–55).
- Hubungan: `01` kebutuhan, `02` visual, `03` arsitektur, `04` data, `05` fitur, `06` motion, `07` aturan kerja, `08` urutan pekerjaan.

Konvensi tabel task: setiap task punya **ID, tujuan/output, dependency, prioritas, dan catatan**. **Acceptance criteria** ditulis di bawah tabel tiap fase dan berlaku untuk semua task di fase itu, kecuali ada acceptance khusus di kolom Catatan. Sebuah task baru DONE jika acceptance fasenya terpenuhi (bagian 49).

## 2. Task Execution Principle

```
READ → UNDERSTAND → PLAN → IMPLEMENT → TEST → REVIEW → REPORT
```

Bukan: PROMPT → CODING SEMBARANGAN → MENAMBAH FITUR → MENGUBAH ARCHITECTURE.

## 3. Task Status

| Status      | Arti                                  |
| ----------- | ------------------------------------- |
| TODO        | Belum dikerjakan                      |
| IN PROGRESS | Sedang dikerjakan                     |
| BLOCKED     | Tertahan blocker (dicatat, bagian 50) |
| DONE        | Selesai dan lolos acceptance          |
| SKIPPED     | Dilewati dengan alasan (bagian 51)    |

Tidak ada sistem tracking yang kompleks.

## 4. Task Priority

| Level | Arti                        |
| ----- | --------------------------- |
| P0    | Wajib agar project berjalan |
| P1    | Penting untuk MVP           |
| P2    | Polish / enhancement        |
| P3    | Optional / future           |

Task P2/P3 tidak dikerjakan sebelum P0/P1 selesai.

## 5. Phase Overview

Instruksi user memuat dua tingkat fase: ringkasan 14 fase (0–13) dan rincian 41 fase (0–40, bagian 6–46). **[REVIEW]** Penomoran keduanya tidak identik. Penyelesaian: **urutan eksekusi mengikuti fase rinci (nomor 0–40)**; ringkasan di bawah hanya pengelompokan.

| Ringkasan | Nama                          | Fase rinci   |
| --------- | ----------------------------- | ------------ |
| 0         | Project preparation           | 0            |
| 1         | Project foundation            | 1            |
| 2         | Database & backend foundation | 2            |
| 3         | Public website foundation     | 3            |
| 4         | Public content integration    | 4–8          |
| 5         | Admin authentication          | 9            |
| 6         | Admin content management      | 10–15        |
| 7         | Public-admin integration      | 16–18        |
| 8         | Animation & interaction       | 19           |
| 9         | Responsive & accessibility    | 20–22        |
| 10        | Testing & bug fixing          | 23–25, 30–32 |
| 11        | Final polish                  | 26–29, 40    |
| 12        | Deployment                    | 33–35        |
| 13        | RAG chatbot                   | 36–39        |

Penyesuaian dependensi yang harus diperhatikan agent (**[REVIEW]**, diputuskan di dokumen ini agar urutan tidak melanggar bagian 47):

1. **Public read API.** Fase 5–7 (struktur, berita, project) membutuhkan endpoint baca (GET) publik, padahal "Implement API" muncul di fase admin 11–13. Keputusan: endpoint baca publik dibuat pada task connect di fase 5–7 (T5.2, T6.3, T7.4); fase 11–13 menambah endpoint admin (tulis dan baca admin) dan tidak menduplikasi endpoint baca. Jangan membuat seed konten resmi/fiktif; halaman mendukung empty state sebelum data resmi tersedia.
2. **Interaksi structure.** T5.4–T5.6 mengimplementasikan perilaku fungsional (state aktif, preview di kanan, alternatif mobile) tanpa polish motion; transisi dan timing dikerjakan di T19.8 mengikuti `06-animation.md`.
3. **Home.** T4.1 membuat kerangka Home; bagian highlight berita/project dihubungkan setelah fase 6–7.
4. **FAQ.** T19.9 (FAQ accordion) menyebut FAQ, tetapi tidak ada task yang membuat halaman/fitur FAQ, dan keberadaan FAQ masih TBD (`05-fitur.md` bagian 3). Lihat catatan di T19.9.
5. **Checkpoint.** Nomor checkpoint di bagian 56 tidak berurutan waktu (backend/DB dikerjakan sebelum public); pemetaan fasenya ditulis di bagian 56.
6. **Final QA (fase 40)** muncul setelah RAG tetapi RAG bukan syarat MVP; lihat bagian 46.

## 6. Phase 0 — Project Preparation

| ID   | Task                        | Output                                                                  | Dep  | P   | Catatan                                     |
| ---- | --------------------------- | ----------------------------------------------------------------------- | ---- | --- | ------------------------------------------- |
| T0.1 | Inspect existing repository | Struktur folder, framework, dependency, kondisi project dipahami        | -    | P0  | Menentukan status awal task lain            |
| T0.2 | Read project documentation  | Dokumen 01–07 dipahami; konflik dicatat                                 | T0.1 | P0  | Tidak ada implementasi sebelum ini          |
| T0.3 | Check environment           | Node.js, npm, SvelteKit, Express, MySQL, environment variable diperiksa | T0.1 | P0  | Jangan mengubah environment tanpa kebutuhan |

Acceptance: agent dapat menjelaskan struktur project dan dokumentasi; tidak ada implementasi sebelum dokumentasi dipahami.

## 7. Phase 1 — Project Foundation

| ID   | Task                                                      | Output                                           | Dep        | P   |
| ---- | --------------------------------------------------------- | ------------------------------------------------ | ---------- | --- |
| T1.1 | Pastikan frontend SvelteKit berjalan                      | Dev server jalan, halaman utama terbuka          | T0.3       | P0  |
| T1.2 | Pastikan backend Express berjalan                         | Server start, response dasar                     | T0.3       | P0  |
| T1.3 | Pastikan frontend dapat berkomunikasi dengan backend      | Minimal satu request frontend → backend berhasil | T1.1, T1.2 | P0  |
| T1.4 | Setup environment configuration sesuai `03-arsitektur.md` | Konfigurasi lewat environment variable           | T1.2       | P0  |

Acceptance: dev server berjalan; satu request frontend → backend berhasil; secret tidak hardcoded.

## 8. Phase 2 — Database & Backend Foundation

| ID   | Task                                                | Output                                                                     | Dep  | P   | Catatan                                                                                                                   |
| ---- | --------------------------------------------------- | -------------------------------------------------------------------------- | ---- | --- | ------------------------------------------------------------------------------------------------------------------------- |
| T2.0 | Review desain data/API                              | `docs/09-data-api.md` disetujui; keputusan schema/public JSON ditetapkan   | T0.2 | P0  | **DONE 2026-10-03:** user menyetujui lima tabel/no FK, akreditasi draft/published, nilai konsentrasi kanonis, route detail slug; storage tetap TBD dan di luar tahap ini |
| T2.1 | Setup koneksi MySQL                                 | Backend dapat connect (pool `mysql2/promise`)                              | T1.4 | P0  | **DONE 2026-10-03:** XAMPP MariaDB 10.4.32, database lokal `web_trm_dev`, health check HTTP 200 |
| T2.2 | Implement schema sesuai `04-database.md`            | Tabel `admins`, `lecturers`, `news`, `projects`, `accreditation_documents` | T2.0 approved, T2.1 | P0  | **DONE 2026-10-03:** `backend/database/schema.sql`; lima tabel dibuat, tanpa seed |
| T2.3 | Implement database access pattern sesuai arsitektur | `async/await`, try/catch, parameterized query                              | T2.2 | P0  | **DONE 2026-10-03:** public read controllers memakai pool dan parameterized query |
| T2.4 | Implement basic error handling backend              | Error database tidak membocorkan informasi sensitif                        | T2.3 | P0  | **DONE 2026-10-03:** envelope error HTTP 400/404/500/503; error internal tidak dikirim ke client |

Acceptance: backend terhubung ke database; schema sesuai dokumentasi; semua query parameterized; response error aman. Schema awal dibuat sebagai file reproducible `backend/database/schema.sql`; migrasi berikutnya dicatat sebagai SQL berurutan.

## 9. Phase 3 — Public Website Foundation

| ID   | Task                                 | Output                                                      | Dep  | P   | Catatan                                                       |
| ---- | ------------------------------------ | ----------------------------------------------------------- | ---- | --- | ------------------------------------------------------------- |
| T3.1 | Global layout                        | Typography, spacing, navigation, footer, fondasi responsive | T1.1 | P0  | DONE 2026-10-03: layout publik dan skip link; check/build serta smoke route lulus |
| T3.2 | Design tokens/styles yang diperlukan | Token sesuai `02-desain.md`                                 | T3.1 | P0  | Palette final TBD: jangan mengarang hex; token warna menyusul |
| T3.3 | Public navigation                    | Navigasi utama                                              | T3.1 | P0  | Item menu final TBD                                           |
| T3.4 | Footer                               | Footer contained/wide panel                                 | T3.1 | P1  | DONE 2026-10-03: area brand, navigasi, publikasi, dan identitas bawah |

Acceptance: layout konsisten, responsive, tidak menyimpang dari `02-desain.md`.

## 10. Phase 4 — Public Profile

| ID   | Task                   | Output                                 | Dep       | P   | Catatan                                               |
| ---- | ---------------------- | -------------------------------------- | --------- | --- | ----------------------------------------------------- |
| T4.1 | Home page              | Hero, pengenalan TRM, struktur halaman | T3.1–T3.4 | P0  | DONE 2026-10-03: halaman dasar; highlight data terhubung setelah fase 6–7 |
| T4.2 | Profile page           | Halaman profil prodi                   | T3.1      | P0  | DONE 2026-10-03: halaman statis; tanpa database/API/admin CRUD |
| T4.3 | Static profile content | Isi profil di source code              | T4.2      | P0  | Isi mengikuti data resmi; jika belum ada: TBD         |

Acceptance: halaman terbuka dan konsisten dengan desain; tidak ada konten resmi yang dikarang.

## 11. Phase 5 — Public Structure

| ID   | Task                               | Output                                                            | Dep        | P   | Catatan                                                              |
| ---- | ---------------------------------- | ----------------------------------------------------------------- | ---------- | --- | -------------------------------------------------------------------- |
| T5.1 | Structure page                     | Halaman struktur                                                  | T3.1       | P0  | DONE 2026-10-03: chart publik; nama/profil dosen tetap placeholder resmi |
| T5.2 | Connect lecturer data dari backend | Endpoint baca publik `lecturers` + pemakaian di halaman           | T2.3, T5.1 | P0  | Endpoint selesai; pemakaian halaman belum dilakukan. Tidak ada seed konten. |
| T5.3 | Default organization structure     | Kaprodi di atas; Web Design, Desain Grafis, Videografi di bawah | T5.2       | P0  | Label mengikuti nilai konsentrasi kanonis yang disetujui user |
| T5.4 | Desktop hover interaction          | Node aktif saat hover/fokus                                       | T5.3       | P1  | DONE 2026-10-03: node button merespons hover dan fokus keyboard     |
| T5.5 | Profile preview di sisi kanan      | Preview foto, nama, role; bukan modal                             | T5.4       | P1  | DONE 2026-10-03: panel samping memakai placeholder yang jelas      |
| T5.6 | Mobile interaction                 | Tap/selected state atau pola sederhana                            | T5.3       | P1  | DONE 2026-10-03: daftar vertikal; tap memilih node dan preview      |

Acceptance: struktur terbaca; preview tidak menjadi modal; hover desktop bekerja; mobile tidak bergantung hover.

## 12. Phase 6 — Public News

| ID   | Task                                       | Output                            | Dep  | P   |
| ---- | ------------------------------------------ | --------------------------------- | ---- | --- |
| T6.1 | News listing                               | Daftar berita (published saja)    | T3.1 | P0  |
| T6.2 | News detail                                | Detail via slug                   | T6.1 | P0  |
| T6.3 | Connect news API                           | Endpoint baca publik `news`       | T2.3 | P0  | **DONE 2026-10-03:** list/detail API tersedia; diuji dengan DB lokal kosong |
| T6.4 | Loading state                              | Indikator sederhana               | T6.3 | P1  |
| T6.5 | Empty state                                | Pesan jelas bila belum ada berita | T6.3 | P1  |
| T6.6 | Error state                                | Pesan gagal yang ramah            | T6.3 | P1  |
| T6.7 | Pagination jika diperlukan (`05-fitur.md`) | Pagination sederhana              | T6.3 | P1  |

Acceptance: publik dapat membaca berita dari database/API; draft tidak tampil.

## 13. Phase 7 — Public Projects

| ID   | Task                                  | Output                          | Dep  | P   | Catatan                  |
| ---- | ------------------------------------- | ------------------------------- | ---- | --- | ------------------------ |
| T7.1 | Project listing                       | Daftar image-first              | T3.1 | P0  |                          |
| T7.2 | Project detail                        | Detail via slug                 | T7.1 | P0  |                          |
| T7.3 | Category/filter jika sudah ditentukan | Filter kategori sederhana       | T7.4 | P1  | Gunakan kategori baku `desain`, `coding`, `3d`, `multimedia`, `lainnya` |
| T7.4 | Connect project API                   | Endpoint baca publik `projects` | T2.3 | P0  | **DONE 2026-10-03:** list/detail/filter API tersedia; diuji dengan DB lokal kosong |
| T7.5 | Loading state                         |                                 | T7.4 | P1  |                          |
| T7.6 | Empty state                           |                                 | T7.4 | P1  |                          |
| T7.7 | Error state                           |                                 | T7.4 | P1  |                          |

Acceptance: project mahasiswa tampil dari database.

## 14. Phase 8 — Public Accreditation

| ID   | Task                                       | Output                | Dep  | P   | Catatan                                    |
| ---- | ------------------------------------------ | --------------------- | ---- | --- | ------------------------------------------ |
| T8.1 | Accreditation page                         | Halaman akreditasi    | T3.1 | P1  | DONE 2026-10-03: halaman dan empty state PDF; data/link resmi menunggu sumber |
| T8.2 | Display official accreditation information | Informasi resmi       | T8.1 | P1  | Isi resmi TBD; tidak dikarang              |
| T8.3 | Document viewing/download jika tersedia    | Tombol lihat/download | T8.1 | P1  | Fitur cetak: TBD (`05-fitur.md` bagian 18) |
| T8.4 | Pastikan link/source resmi dipakai         | Sumber resmi          | T8.2 | P1  |                                            |

Acceptance: informasi mudah ditemukan; dokumen dapat diakses jika tersedia.

## 15. Phase 9 — Admin Authentication

| ID   | Task                   | Output                          | Dep  | P   | Catatan                              |
| ---- | ---------------------- | ------------------------------- | ---- | --- | ------------------------------------ |
| T9.1 | Admin login            | Form dan endpoint login         | T2.3 | P0  | Form UI dan request login selesai diimplementasikan; HTTP integration test backend lulus. Verifikasi interaksi browser masih pending karena runtime browser tidak tersedia pada sesi ini |
| T9.2 | Password hashing       | Password tersimpan sebagai hash | T9.1 | P0  | **DONE 2026-10-03:** bcryptjs cost 12; tidak menyimpan/mengirim plaintext |
| T9.3 | Session                | Session admin                   | T9.1 | P0  | **DONE 2026-10-03:** signed cookie stateless berumur 8 jam, tanpa session table |
| T9.4 | HTTP-only cookie       | Cookie session aman             | T9.3 | P0  | **DONE 2026-10-03:** HttpOnly, SameSite=Lax, Secure saat production |
| T9.5 | Protected admin routes | Halaman admin terlindungi       | T9.3 | P0  | API session dan client-side route gate diimplementasikan; browser redirect QA masih pending |
| T9.6 | Logout                 | Session diakhiri                | T9.3 | P0  | Backend logout dan tombol UI diimplementasikan; API menghapus cookie dan session test menjadi 401. Browser redirect QA masih pending |
| T9.7 | Unauthorized behavior  | 401/redirect login              | T9.5 | P0  | **DONE 2026-10-03:** endpoint session memberi 401 tanpa cookie/akun valid |
| T9.8 | Admin account settings | Ubah NIDN dan username sendiri | T9.5 | P0 | Username tetap unik; password di luar scope pengaturan MVP |

Acceptance: pengguna tanpa autentikasi tidak dapat membuka area admin maupun endpoint admin. Login menerima NIDN atau username. Admin dapat mengubah NIDN dan username; validasi keunikan dilakukan backend. Seed admin development tidak memakai password production.

## 16. Phase 10 — Admin Foundation

| ID    | Task                             | Output                                                           | Dep   | P   | Catatan |
| ----- | -------------------------------- | ---------------------------------------------------------------- | ----- | --- | ------- |
| T10.1 | Admin layout                     | Layout admin                                                     | T9.5  | P0  | Layout admin diimplementasikan; route HTTP dan build lulus, browser QA pending |
| T10.2 | Sidebar                          | Menu sesuai fitur nyata                                          | T10.1 | P0  | Menu dashboard/konten/logout dan placeholder diimplementasikan |
| T10.3 | Dashboard                        | Hanya informasi berguna (jumlah berita, project, dosen, dokumen) | T10.2 | P1  | Overview mengambil total dari endpoint list admin terproteksi agar berita/dokumen draft ikut dihitung; endpoint count terverifikasi |
| T10.4 | Responsive admin layout          | Drawer di mobile                                                 | T10.1 | P1  | Navigasi mobile collapsible diimplementasikan; visual browser QA pending |
| T10.5 | Basic loading/error/empty states | State dasar                                                      | T10.1 | P1  | State pemeriksaan session, login, logout, dan statistik diimplementasikan |

Acceptance: dashboard usable; admin tidak memakai visual landing page public (`02-desain.md` bagian 26).

## 17. Phase 11 — Admin Dosen

| ID    | Task                                          | Output                                          | Dep          | P   | Catatan                                  |
| ----- | --------------------------------------------- | ----------------------------------------------- | ------------ | --- | ---------------------------------------- |
| T11.1 | Lecturer API (admin)                          | Endpoint tulis dan baca admin untuk `lecturers` | T9.5, T5.2   | P0  | **DONE 2026-10-03:** endpoint CRUD dosen terlindungi `requireAdmin` dan lolos uji integrasi MySQL; UI admin tetap task berikutnya |
| T11.2 | Lecturer list                                 | Tabel admin                                     | T11.1, T10.1 | P0  |                                          |
| T11.3 | Add lecturer                                  | Form tambah                                     | T11.1        | P0  |                                          |
| T11.4 | Edit lecturer                                 | Form edit                                       | T11.1        | P0  |                                          |
| T11.5 | Delete lecturer jika diperlukan               | Hapus + konfirmasi                              | T11.1        | P1  |                                          |
| T11.6 | Photo upload                                  | Upload foto (path di database)                  | T11.3        | P0  | Storage dan aturan file TBD              |
| T11.7 | Validation                                    | Frontend + backend                              | T11.3        | P0  | Validasi backend dosen selesai dan teruji; validasi form frontend masih menunggu UI admin |
| T11.8 | created_at/updated_at display jika diperlukan | Tampil di admin                                 | T11.2        | P1  | Timezone kampus Asia/Makassar sesuai `04-database.md`                  |

Acceptance: admin dapat mengelola data dosen; urutan lewat `display_order` (mekanisme TBD).

## 18. Phase 12 — Admin Berita

| ID    | Task             | Output                           | Dep        | P   |
| ----- | ---------------- | -------------------------------- | ---------- | --- |
| T12.1 | News API (admin) | Endpoint tulis dan baca admin    | T9.5, T6.3 | P0  | **DONE 2026-10-03:** endpoint admin CRUD berita (create/list/detail/update/delete) terlindungi `requireAdmin`, diuji dengan MySQL lokal; UI admin tetap task berikutnya |
| T12.2 | News list        | Tabel admin                      | T12.1      | P0  |
| T12.3 | Create news      | Form tambah                      | T12.1      | P0  |
| T12.4 | Edit news        | Form edit                        | T12.1      | P0  |
| T12.5 | Delete news      | Hapus + konfirmasi               | T12.1      | P0  |
| T12.6 | Thumbnail upload | Upload gambar                    | T12.3      | P1  |
| T12.7 | Validation       | Termasuk slug unik               | T12.3      | P0  | **DONE 2026-10-03:** validasi backend title, slug URL, content, excerpt, thumbnail path, status, pagination; duplicate slug mengembalikan 409 |
| T12.8 | Timestamps       | `created_at`/`updated_at` tampil | T12.2      | P1  |

Acceptance: admin dapat CRUD berita; status draft/published bekerja.

## 19. Phase 13 — Admin Project

| ID    | Task                | Output                             | Dep        | P   | Catatan |
| ----- | ------------------- | ---------------------------------- | ---------- | --- | ------- |
| T13.1 | Project API (admin) | Endpoint tulis dan baca admin      | T9.5, T7.4 | P0  | **DONE 2026-10-03:** endpoint admin CRUD project terlindungi `requireAdmin`, diuji dengan MySQL lokal; UI admin tetap task berikutnya |
| T13.2 | Project list        | Tabel admin                        | T13.1      | P0  |         |
| T13.3 | Create project      | Form tambah                        | T13.1      | P0  |         |
| T13.4 | Edit project        | Form edit                          | T13.1      | P0  |         |
| T13.5 | Delete project      | Hapus + konfirmasi                 | T13.1      | P0  |         |
| T13.6 | Image upload        | Upload gambar                      | T13.3      | P1  |         |
| T13.7 | Validation          | Termasuk slug unik, `external_url` | T13.3      | P0  | **DONE 2026-10-03:** validasi backend field wajib/opsional, slug, kategori, path relatif, tahun, URL HTTP/HTTPS; duplicate slug mengembalikan 409 |
| T13.8 | Timestamps          | Tampil di admin                    | T13.2      | P1  |         |

Acceptance: admin dapat mengelola project; semua project langsung tayang tanpa status.

## 20. Phase 14 — Admin Pengumuman

**Status fase: SKIPPED/OPTIONAL (sementara).** Tabel `announcements` tidak dibuat di versi awal (`04-database.md` bagian 19; `05-fitur.md` bagian 17). Aktifkan hanya jika user memutuskan pengumuman masuk scope, dengan perubahan schema yang disetujui.

| ID    | Task                                | Dep             | P   |
| ----- | ----------------------------------- | --------------- | --- |
| T14.1 | Announcement API                    | Keputusan scope | P3  |
| T14.2 | Announcement list                   | T14.1           | P3  |
| T14.3 | Create                              | T14.1           | P3  |
| T14.4 | Edit                                | T14.1           | P3  |
| T14.5 | Delete                              | T14.1           | P3  |
| T14.6 | Connect public announcement display | T14.1           | P3  |

## 21. Phase 15 — Admin Akreditasi

Dikerjakan untuk mengelola PDF akreditasi resmi sesuai keputusan di `04-database.md` bagian 20.

| ID    | Task                | Dep         | P   |
| ----- | ------------------- | ----------- | --- |
| T15.1 | Document API        | T9.5        | P1  | **DONE 2026-10-03:** endpoint CRUD metadata/status dokumen akreditasi terlindungi `requireAdmin`, diuji dengan MySQL lokal; upload dan UI tetap task terpisah |
| T15.2 | Document list       | T15.1       | P1  |
| T15.3 | Upload              | T15.1       | P1  |
| T15.4 | Metadata editing    | T15.1       | P1  |
| T15.5 | Delete              | T15.1       | P1  |
| T15.6 | Connect public page | T15.1, T8.1 | P1  |

Tidak membuat document management system kompleks.

## 22. Phase 16 — Public/Admin Integration

| ID    | Task                                        | Alur                                   | Dep     | P   |
| ----- | ------------------------------------------- | -------------------------------------- | ------- | --- |
| T16.1 | Verify lecturer data flow                   | Admin → API → MySQL → Public Structure | Fase 11 | P0  |
| T16.2 | Verify news                                 | Admin → API → MySQL → Public News      | Fase 12 | P0  |
| T16.3 | Verify projects                             | Admin → API → MySQL → Public Projects  | Fase 13 | P0  |
| T16.4 | Verify accreditation documents jika dinamis | Admin → API → MySQL → Public           | Fase 15 | P1  |

Acceptance: perubahan dari admin terlihat di public sesuai behavior (draft tidak tampil). Bagian highlight Home dihubungkan di fase ini.

## 23. Phase 17 — Validation

| ID    | Task                      | Dep                 | P   |
| ----- | ------------------------- | ------------------- | --- |
| T17.1 | Frontend validation       | Fase 11–13          | P0  |
| T17.2 | Backend validation        | Fase 11–13          | P0  |
| T17.3 | File upload validation    | T11.6, T12.6, T13.6 | P0  |
| T17.4 | Authentication validation | Fase 9              | P0  |
| T17.5 | Authorization validation  | Fase 9              | P0  |

Acceptance: input tidak valid tidak masuk database. Backend adalah validasi utama.

## 24. Phase 18 — Error / Empty / Loading

| ID    | Task                  | Dep        | P   |
| ----- | --------------------- | ---------- | --- |
| T18.1 | Public loading states | Fase 6–8   | P1  |
| T18.2 | Public empty states   | Fase 6–8   | P1  |
| T18.3 | Public error states   | Fase 6–8   | P1  |
| T18.4 | Admin loading states  | Fase 10–13 | P1  |
| T18.5 | Admin empty states    | Fase 10–13 | P1  |
| T18.6 | Admin error states    | Fase 10–13 | P1  |
| T18.7 | Form success feedback | Fase 11–13 | P1  |
| T18.8 | Delete confirmation   | Fase 11–13 | P1  |

Acceptance: tidak ada halaman blank tanpa feedback. Task yang sudah selesai di fase sebelumnya (mis. T6.4–T6.6) dicek, bukan dikerjakan ulang.

## 25. Phase 19 — Animation Implementation

Dikerjakan setelah fungsionalitas stabil (Checkpoint 5). Semua mengikuti `06-animation.md`.

| ID     | Task                                            | Dep           | P   | Catatan                                                             |
| ------ | ----------------------------------------------- | ------------- | --- | ------------------------------------------------------------------- |
| T19.1  | Hero character hover                            | T4.1          | P2  | Hover per karakter dibuat; perubahan warna tetap menunggu palette final |
| T19.2  | Hero character color                            | T19.1         | P2  | Blocked sampai palette final ada                                    |
| T19.3  | Hero character wobble                           | T19.1         | P2  | DONE 2026-10-03: wobble 4°, Normal 280 ms, ease-out; default disetujui user |
| T19.4  | Project image zoom                              | T7.1          | P2  |                                                                     |
| T19.5  | Project overlay reveal                          | T19.4         | P2  | Jenis overlay TBD                                                   |
| T19.6  | Project content reveal                          | T19.4         | P2  |                                                                     |
| T19.7  | Scroll-driven text opacity                      | T4.1          | P2  | Section dan rentang progress TBD                                    |
| T19.8  | Structure adaptive preview                      | T5.5          | P2  | DONE 2026-10-03: reflow Slow, preview fade Normal, reduced-motion didukung |
| T19.9  | FAQ accordion                                   | Keputusan FAQ | P3  | **BLOCKED**: keberadaan FAQ TBD dan belum ada task yang membuat FAQ |
| T19.10 | Navigation/button micro interactions            | T3.3          | P2  |                                                                     |
| T19.11 | Admin drawer/modal interactions jika diperlukan | T10.4         | P2  |                                                                     |
| T19.12 | RAG animation                                   | Fase 37       | P3  | Hanya saat RAG dibuat                                               |

Timing/easing default Fast/Normal/Slow telah disetujui dan dicatat di `06-animation.md`. Parameter lain yang ditandai TBD tetap tidak diterapkan.

## 26. Phase 20 — Responsive

| ID    | Task                   | Dep   | P   | Catatan |
| ----- | ---------------------- | ----- | --- | ------- |
| T20.1 | Desktop review         | CP5   | P1  | Visual review belum dilakukan; browser preview tidak tersedia |
| T20.2 | Tablet review          | CP5   | P1  | Visual review belum dilakukan; browser preview tidak tersedia |
| T20.3 | Mobile review          | CP5   | P1  | Visual review belum dilakukan; browser preview tidak tersedia |
| T20.4 | Fix navigation mobile  | T20.3 | P1  | DONE 2026-10-03: nav wrap dan touch target minimum 44px |
| T20.5 | Fix structure mobile   | T20.3 | P1  | DONE 2026-10-03: node vertical/card dan preview setelah diagram |
| T20.6 | Fix project cards      | T20.3 | P1  | Menunggu listing project dan konten resmi (Fase 7) |
| T20.7 | Fix admin tables/forms | T20.3 | P1  | Di luar milestone frontend publik |
| T20.8 | Fix typography         | T20.3 | P1  | Source memakai skala fluid; visual viewport review masih pending |
| T20.9 | Fix spacing            | T20.3 | P1  | Source memakai spacing fluid; visual viewport review masih pending |

Acceptance: semua fitur utama usable di mobile.

## 27. Phase 21 — Accessibility

| ID    | Task                   | Dep           | P   | Catatan |
| ----- | ---------------------- | ------------- | --- | ------- |
| T21.1 | Semantic HTML review   | CP5           | P1  | Audit public dilakukan; admin dan full checkpoint review tersisa |
| T21.2 | Keyboard navigation    | CP5           | P1  | Link dan node memakai kontrol native; keyboard QA browser tersisa |
| T21.3 | Focus state            | CP5           | P1  | Focus-visible tersedia; visual QA browser tersisa |
| T21.4 | Alt text               | CP5           | P1  | Tidak ada gambar konten publik saat ini; cek saat data gambar ditambahkan |
| T21.5 | Accessible form labels | CP5           | P1  | Tidak ada form publik saat ini; admin di luar milestone |
| T21.6 | Hover alternative      | Fase 5, 7, 19 | P1  | Struktur mendukung keyboard/tap; review proyek setelah Fase 7 |
| T21.7 | Reduced motion         | Fase 19       | P1  | Rule global public menghormati prefers-reduced-motion; checkpoint penuh tersisa |

Acceptance: interaksi penting tidak hanya bergantung pada mouse.

## 28. Phase 22 — SEO

| ID    | Task                                                           | Dep      | P   |
| ----- | -------------------------------------------------------------- | -------- | --- |
| T22.1 | Page title                                                     | Fase 4–8 | P1  | DONE 2026-10-03: seluruh enam route publik |
| T22.2 | Meta description                                               | Fase 4–8 | P1  | DONE 2026-10-03: seluruh enam route publik |
| T22.3 | Semantic headings                                              | Fase 4–8 | P1  | DONE 2026-10-03: hierarki diperiksa pada enam route |
| T22.4 | Readable URLs                                                  | Fase 6–7 | P1  |
| T22.5 | Image alt                                                      | Fase 4–8 | P1  |
| T22.6 | Basic sitemap/robots jika diperlukan (architecture/deployment) | Fase 33  | P3  |

Tanpa sistem SEO kompleks.

## 29. Phase 23 — Security Review

T23.1 Authentication · T23.2 Authorization · T23.3 Session cookie · T23.4 Password hashing · T23.5 SQL injection protection · T23.6 Input validation · T23.7 File upload security · T23.8 Secret/environment variables · T23.9 Error response · T23.10 Sensitive data exposure.

Prioritas P0. Dependency: Fase 9–13 dan 17. Output: catatan review dan perbaikan minimal. Acceptance: tidak ada obvious security issue yang diketahui. Perlindungan tambahan (rate limit login, CSRF): TBD (`03-arsitektur.md`).

## 30. Phase 24 — Database Review

T24.1 Schema · T24.2 Relationships · T24.3 Indexes · T24.4 Unique constraints · T24.5 Timestamps · T24.6 Unnecessary fields · T24.7 Foreign keys jika dipakai.

Prioritas P1. Dependency: Fase 11–13. Tidak menambah schema baru untuk optimasi prematur; perubahan schema mengikuti `04-database.md` bagian 61–62.

## 31. Phase 25 — API Review

T25.1 Routes · T25.2 Controllers · T25.3 Services jika dipakai · T25.4 Validation · T25.5 Authentication middleware · T25.6 Error handling · T25.7 Response consistency · T25.8 Unused endpoint.

Prioritas P1. Hapus endpoint hanya jika benar-benar tidak dipakai dan aman (`07-rules.md` bagian 50).

## 32. Phase 26 — UI Polish

T26.1 Typography · T26.2 Spacing · T26.3 Alignment · T26.4 Image ratio · T26.5 Border/radius consistency · T26.6 Button consistency · T26.7 Navigation consistency · T26.8 Admin consistency · T26.9 Public visual hierarchy.

Prioritas P2. Dependency: Checkpoint 5. Tidak ada redesign total.

## 33. Phase 27 — Anti AI-Slop Review

Review seluruh website: terlalu banyak card, gradient, shadow, rounded container, animation, glassmorphism, elemen dekoratif? Typography terlalu besar? Section terlihat seperti template AI? Public dan admin terlihat sama? Jika ya, sederhanakan (`02-desain.md` bagian 5 dan 63).

Prioritas P2 (ID T27.x diberikan agent saat dikerjakan).

## 34. Phase 28 — Performance Review

Periksa: ukuran gambar, request API tidak perlu, rerender tidak perlu, animasi berlebihan, asset besar, dependency tidak terpakai, JavaScript client-side tidak perlu. Fokus pada masalah nyata, bukan optimasi prematur. Prioritas P2.

## 35. Phase 29 — Content Review

Pastikan: nama prodi benar, struktur dosen benar, data resmi tidak dikarang, berita dan project sesuai data, akreditasi memakai sumber resmi, dokumen RAG (jika ada) disetujui. Data yang belum tersedia ditandai TBD. Prioritas P0 (sebelum deployment).

## 36. Phase 30 — End-to-End Test

PUBLIC: Home → Profile → Structure → News → Project → Accreditation.

ADMIN: Login → Dashboard → Manage Lecturer → Manage News → Manage Project → Manage Accreditation (jika aktif) → Logout.

Prioritas P0. Dependency: Checkpoint 5.

## 37. Phase 31 — CRUD Test

Untuk setiap CRUD: Create → Read → Update → Delete. Uji: data valid, data tidak valid, field wajib kosong, unauthorized, not found, upload file tidak valid. Prioritas P0.

## 38. Phase 32 — Regression Test

Setelah bug fixing, pastikan masih bekerja: Home, navigation, public API, admin login, CRUD, responsive, animation. Prioritas P0.

## 39. Phase 33 — Deployment Preparation

Mengikuti `03-arsitektur.md` (detail deployment: **TBD**).

| ID    | Task                                         | P   |
| ----- | -------------------------------------------- | --- |
| T33.1 | Check environment                            | P1  |
| T33.2 | Check production environment variables       | P1  |
| T33.3 | Build frontend                               | P1  |
| T33.4 | Build/start backend sesuai arsitektur        | P1  |
| T33.5 | Check database connection                    | P1  |
| T33.6 | Check storage                                | P1  |
| T33.7 | Check CORS/cookie configuration jika relevan | P1  |
| T33.8 | Check production error handling              | P1  |

Dependency: MVP stabil (Checkpoint 7). Backup strategy production wajib terdokumentasi (`04-database.md` bagian 51). Jangan deploy sebelum alur lokal/staging stabil.

## 40. Phase 34 — Deployment

Sesuai `03-arsitektur.md`. Agent tidak boleh mengganti hosting tanpa approval, melakukan deployment destruktif, atau menghapus data production. Prioritas P1.

Acceptance: website public dapat diakses; admin dapat login; API bekerja; database bekerja; upload file bekerja jika dipakai.

## 41. Phase 35 — Post Deployment Test

Test di production: Home, Profile, Structure, News, Projects, Accreditation, Admin Login, Admin CRUD, Logout, Image, Documents. Prioritas P1.

## 42. Phase 36 — RAG Preparation

RAG **tidak boleh** dikerjakan sebelum MVP stabil. Prioritas P3 (fase akhir, bukan syarat MVP).

| ID    | Task                           |
| ----- | ------------------------------ |
| T36.1 | Collect approved documents     |
| T36.2 | Identify knowledge sources     |
| T36.3 | Clean documents                |
| T36.4 | Define allowed knowledge scope |
| T36.5 | Define out-of-scope behavior   |

## 43. Phase 37 — RAG Implementation

| ID    | Task                                            |
| ----- | ----------------------------------------------- |
| T37.1 | Implement document management sesuai arsitektur |
| T37.2 | Implement document processing                   |
| T37.3 | Implement retrieval                             |
| T37.4 | Implement answer generation                     |
| T37.5 | Implement context restriction                   |
| T37.6 | Implement refusal/out-of-scope behavior         |
| T37.7 | Implement chatbot UI                            |

Dependency: Fase 36 dan MVP deployed. Teknologi RAG (provider model, penyimpanan embedding): **TBD** (`03-arsitektur.md`); tabel `rag_documents` ditambahkan lewat perubahan schema yang disetujui (`04-database.md` bagian 47). Tidak membuat chatbot general purpose; tidak ada vector database sebelum benar-benar perlu.

## 44. Phase 38 — RAG Test

Uji: (1) pertanyaan yang jawabannya ada; (2) jawabannya tidak ada; (3) di luar konteks; (4) ambigu; (5) dokumen kosong/rusak; (6) ketahanan terhadap halusinasi.

Contoh: "Siapa Kaprodi TRM?" → dijawab dari dokumen jika tersedia. "Ajari saya Python." → di luar scope, tolak/arahkan.

## 45. Phase 39 — Final RAG Review

Pastikan chatbot tidak menjadi general AI, hanya memakai konteks yang disetujui, tidak mengarang informasi, perilaku out-of-scope bekerja, dan sumber/konteks dapat ditelusuri jika ditentukan arsitektur.

## 46. Phase 40 — Final QA

Review seluruh project:

- [ ] Public website bekerja
- [ ] Admin bekerja
- [ ] CRUD bekerja
- [ ] Database bekerja
- [ ] Authentication bekerja
- [ ] File upload bekerja
- [ ] Responsive
- [ ] Accessibility
- [ ] SEO dasar
- [ ] Animation
- [ ] Security
- [ ] Performance
- [ ] RAG jika sudah masuk scope
- [ ] Deployment

Karena RAG bukan syarat MVP, Final QA dijalankan pada Checkpoint 7/8 untuk MVP. Jika RAG dikerjakan kemudian, Final QA diulang hanya untuk bagian RAG dan regresi (**[REVIEW]**, lihat bagian 5 poin 6).

## 47. Task Dependency Rule

```
Database → API → Admin CRUD → Public integration
```

Jangan membuat public integration sebelum API yang dibutuhkan siap. Jika fitur butuh API, endpoint baca dibuat bersama task connect (bagian 5 poin 1).

## 48. Task Size Rule

Jika task terlalu besar, pecah. Contoh: bukan "Bangun seluruh admin", melainkan Admin login → Admin layout → Dosen CRUD → Berita CRUD → Project CRUD. Task di Phase 23–29 dan 33–39 yang ditulis ringkas wajib dipecah menjadi sub-task oleh agent sebelum dikerjakan jika dirasa besar.

## 49. Task Completion Rule

Task diberi DONE hanya jika implementasi selesai, acceptance criteria terpenuhi, test dilakukan, dan tidak ada blocker yang diketahui.

## 50. Blocked Rule

Jika task blocked, jangan memaksakan implementasi. Catat: task, blocker, penyebab, dependency, dan tindakan yang diperlukan. Blocker yang sudah diketahui ada di Lampiran B.

## 51. Skipped Rule

Task boleh SKIPPED jika optional, tidak dibutuhkan MVP, atau requirement berubah. Alasan wajib dicatat. Saat ini: Phase 14 SKIPPED (sementara), Phase 15 kondisional.

## 52. No Feature Creep

Jika agent menemukan ide (search, comment, like, rating, notification, analytics, forum, user account, social login, fitur AI tambahan), jangan langsung dibuat. Catat sebagai future idea (Lampiran C) bila benar-benar relevan. Fitur di luar scope ada di `05-fitur.md` bagian 51.

## 53. No Premature Optimization

Tidak menambahkan Redis, cache layer, CDN architecture, queue, Elasticsearch, vector database, atau microservices sebelum kebutuhan nyata muncul.

## 54. AI Agent Workflow

Untuk setiap task: (1) baca task, (2) baca dokumen relevan, (3) inspect kode saat ini, (4) buat rencana, (5) implement, (6) test, (7) review, (8) laporkan, (9) tandai status.

## 55. Task Report Format

```
Task:
Status:
Files changed:
What changed:
Testing:
Result:
Issues:
Next task:
```

Bukan sekadar "done." Format test report: `07-rules.md` bagian 59.

## 56. Checkpoint

| Checkpoint | Isi                                        | Fase                          |
| ---------- | ------------------------------------------ | ----------------------------- |
| 1          | Foundation selesai                         | 0–1                           |
| 3          | Backend + database selesai                 | 2                             |
| 2          | Public website selesai                     | 3–8                           |
| 4          | Admin selesai                              | 9–15                          |
| 5          | Public + admin integration selesai         | 16–18                         |
| 6          | Animation/responsive/accessibility selesai | 19–22                         |
| 7          | MVP selesai                                | 23–32 (termasuk Final QA MVP) |
| 8          | Deployment selesai                         | 33–35                         |
| 9          | RAG selesai                                | 36–39                         |

**[REVIEW]** Nomor checkpoint 2 dan 3 mengikuti instruksi user, tetapi secara waktu Checkpoint 3 (backend/DB) tercapai sebelum Checkpoint 2 karena public membutuhkan API. Urutan tabel di atas adalah urutan waktu. Setelah tiap checkpoint dilakukan review sebelum lanjut.

## 57. MVP Definition

MVP selesai jika:

- Public: Home, Profile, Structure, News, Projects, Accreditation.
- Admin: Login, Dashboard, Lecturer management, News management, Project management, Accreditation management (jika diperlukan).
- Technical: MySQL, Express, SvelteKit, Authentication, API, Responsive, Basic security, Basic SEO.

RAG bukan syarat MVP jika belum siap.

## 58. MVP Freeze

Setelah MVP selesai, tidak ada fitur baru sebelum testing, bug fixing, dan persiapan deployment selesai. Tujuannya mencegah scope creep.

## 59. Final Project Review

Sebelum project dinyatakan selesai, periksa 01 PRD, 02 Design, 03 Architecture, 04 Database, 05 Features, 06 Animation, 07 Rules, 08 Tasks. Implementasi tidak boleh menyimpang tanpa keputusan terdokumentasi.

## 60. Documentation Sync

Jika implementasi mengubah keputusan penting, dokumen terkait diperbarui: arsitektur berubah → `03-arsitektur.md`; database → `04-database.md`; fitur → `05-fitur.md`; animasi → `06-animation.md`. Dokumentasi tidak dibiarkan jauh berbeda dari implementasi.

## 61. Final Security Check

- [ ] Tidak ada password plaintext
- [ ] Tidak ada API key di source
- [ ] Tidak ada secret di Git
- [ ] Tidak ada SQL injection
- [ ] Tidak ada endpoint admin tanpa proteksi
- [ ] Tidak ada upload file tidak aman
- [ ] Tidak ada data sensitif terekspos
- [ ] Tidak ada operasi destruktif tanpa proteksi

## 62. Final Performance Check

- [ ] Gambar wajar
- [ ] Request API wajar
- [ ] Animasi ringan
- [ ] Tidak ada request berulang tanpa perlu
- [ ] Tidak ada dependency tidak terpakai
- [ ] Mobile tetap usable

## 63. Final Design Check

- [ ] Poppins + Inter
- [ ] Hierarchy typography
- [ ] Palette terkontrol
- [ ] Tidak ada gradient berlebihan
- [ ] Tidak ada glassmorphism berlebihan
- [ ] Tidak card-everything
- [ ] Public dan admin berbeda
- [ ] Whitespace cukup
- [ ] Responsive
- [ ] Motion restrained
- [ ] Anti-AI-slop

## 64. Final Definition of Done

Project selesai jika: requirement MVP terpenuhi; public website, admin, database, API, authentication, dan CRUD utama berjalan; responsive; accessible; security dasar terpenuhi; testing selesai; deployment selesai; dokumentasi sinkron. RAG boleh berada di fase setelah MVP jika belum siap.

## 65. Final Principle

> Kerjakan satu hal dengan benar sebelum pindah ke hal berikutnya.

Project TRM dibangun: sederhana → bertahap → teruji → stabil → baru dipoles → baru dikembangkan.

Prioritas utama bukan jumlah fitur, tetapi **PROJECT SELESAI DAN DAPAT DIGUNAKAN.**

---

## Lampiran A: Ringkasan Urutan Eksekusi

Fase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → (14 skipped) → (15 kondisional) → 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27 → 28 → 29 → 30 → 31 → 32 → 33 → 34 → 35 → 36 → 37 → 38 → 39 → 40.

## Lampiran B: Keputusan yang Harus Diambil Sebelum Task Tertentu (Gate)

| Keputusan                                                                            | Memengaruhi task          | Sumber                                                 |
| ------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------ |
| Palette warna final                                                                  | T3.2, T19.1, T19.2, T19.5 | `02-desain.md` bagian 9                                |
| Item menu navigasi final                                                             | T3.3                      | `02-desain.md` bagian 13                               |
| Keberadaan FAQ                                                                       | T19.9                     | `05-fitur.md` bagian 3                                 |
| Storage file, tipe dan ukuran upload                                                 | T11.6, T12.6, T13.6       | `03-arsitektur.md` (TBD)                               |
| Hosting dan detail deployment                                                        | Fase 33–34                | `03-arsitektur.md` (TBD)                               |
| Verifikasi silang dengan `01-prd.md` dan `03-arsitektur.md`                          | Seluruh task              | Belum dibaca                                           |

## Lampiran C: Future Ideas

Belum ada. Ide yang muncul selama implementasi dicatat di sini setelah disetujui user, tidak dikerjakan sebelum MVP freeze berakhir.
