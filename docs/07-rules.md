# 07-rules.md — Rulebook AI Agent & Developer

Project: Website Program Studi Teknologi Rekayasa Multimedia (TRM), Politeknik Dewantara

Status dokumen: rulebook utama untuk AI agent (mis. Hermes, Antigravity) dan developer.

Konvensi: **TBD** = belum diputuskan. **[REVIEW]** = celah/konflik antar dokumen yang perlu dicek.

Catatan penyusunan: `01-prd.md` dan `03-arsitektur.md` tidak dapat dibaca saat dokumen ini ditulis. Aturan yang menyangkut detail arsitektur (struktur folder, pola API, format response, mekanisme session, storage, hosting) dirujuk ke `03-arsitektur.md` dan ditandai TBD bila perlu. Instruksi user menyebut "architecture.md"; di dokumen ini yang dimaksud adalah `docs/03-arsitektur.md`.

---

## Prinsip Paling Penting

**PROJECT HARUS SELESAI.**

Jangan mengejar arsitektur paling kompleks atau paling "profesional" jika kompleksitas itu tidak dibutuhkan.

Prioritas (urut):

1. Requirement
2. Correctness
3. Simplicity
4. Maintainability
5. Security
6. Performance
7. Visual quality
8. Extra sophistication

Jangan mengorbankan penyelesaian project demi fitur tambahan.

Alur kerja utama: **READ → UNDERSTAND → PLAN → IMPLEMENT → TEST → REVIEW → REPORT**.

---

## 1. Source of Truth

Urutan:

1. Instruksi terbaru dan eksplisit dari user
2. `docs/01-prd.md`
3. `docs/02-desain.md`
4. `docs/03-arsitektur.md`
5. `docs/04-database.md`
6. `docs/05-fitur.md`
7. `docs/06-animation.md`
8. `docs/07-rules.md`
9. `docs/08-task.md`

Jika ada konflik: jangan diam-diam memilih; identifikasi konflik, jelaskan dampaknya, minta keputusan jika diperlukan. Dokumentasi lama tidak lebih penting daripada requirement user yang sudah diperbarui secara eksplisit.

## 2. Read Before Code

Sebelum mengubah source code, agent WAJIB:

1. membaca dokumentasi yang relevan;
2. memeriksa struktur project;
3. mencari file/component yang sudah ada;
4. memahami implementasi saat ini;
5. menentukan file yang perlu diubah;
6. baru implementasi.

Jangan membuat file baru jika fungsi serupa sudah tersedia.

## 3. Inspect First

Periksa sebelum implementasi: folder structure, routes, components, API, controllers, database access, styles, utilities, dependencies. Gunakan kembali kode yang sesuai. Jangan membuat duplicate component/function tanpa alasan.

## 4. Plan Before Implementation

Untuk pekerjaan lebih dari perubahan kecil, buat rencana singkat: tujuan, file yang diubah, perubahan utama, dependency (jika ada), testing yang dilakukan. Perubahan sangat kecil tidak perlu rencana panjang.

## 5. Small Changes

Kerjakan bertahap: Feature A → test → verify, lalu Feature B → test → verify. Jangan mengubah banyak bagian sekaligus tanpa kebutuhan. Satu fitur pada satu waktu (`05-fitur.md` bagian 57).

## 6. No Unauthorized Architecture Change

Dilarang mengubah tanpa persetujuan user: framework, database, API architecture, authentication architecture, folder architecture utama, deployment architecture, storage architecture.

Jika arsitektur bermasalah: jelaskan masalah, berikan opsi, tunggu approval untuk perubahan signifikan.

## 7. No Unnecessary Dependency

Jangan menginstal package hanya karena populer. Sebelum menambah dependency:

1. cek apakah kemampuan native cukup;
2. cek dependency yang sudah ada;
3. pertimbangkan maintenance;
4. jelaskan alasan;
5. minta approval jika memengaruhi arsitektur/scope.

## 8. UI Library Rule

UI foundation: **Flowbite Svelte** dan **DaisyUI**. Pakai bila membantu. Dilarang menambah library UI lain (Skeleton, shadcn, Bits UI, Melt UI, SvelteUI, dll.) hanya karena agent terbiasa. Tidak mengganti UI library tanpa persetujuan. Library bukan sumber kebenaran visual (`02-desain.md` bagian 56).

## 9. Design Source of Truth

`docs/02-desain.md` adalah acuan visual. Agent tidak boleh otomatis: mengganti font, layout, atau design direction; menambah gradient atau glassmorphism; membuat desain dark purple-blue generik; membuat card di semua section; memperbesar border radius berlebihan; menambah shadow berat.

Jika desain belum menentukan detail: pakai solusi minimal dan konsisten, lalu catat sebagai asumsi.

## 10. Anti AI-Slop

Hindari: gradient di mana-mana, teks raksasa tanpa alasan, glassmorphism berlebihan, floating blobs, rounded card berlebihan, shadow berlebihan, bentuk dekoratif acak, terlalu banyak icon, terlalu banyak animation, semua section dijadikan card, semua section diberi fade-in, estetika purple/blue AI generik, layout template tanpa identitas TRM.

Website harus terasa dirancang untuk TRM, bukan template AI.

## 11. Typography Rule

Poppins untuk display, heading, hero. Inter untuk body, metadata, form, content. Tidak mengganti font tanpa approval. Ikuti prinsip ratio-based/Fibonacci-inspired dari `02-desain.md`.

## 12. Color Rule

Gunakan controlled color palette. Dilarang: random RGB, random gradient, warna baru tanpa alasan, warna beragam hanya agar UI ramai.

Palette final masih **TBD** (`02-desain.md` bagian 9). Selama TBD: jangan mengarang hex; pakai token yang sudah ada atau placeholder yang jelas, dan tandai sebagai proposal. Jika butuh warna baru: cek design token, jika belum ada tandai sebagai proposal.

## 13. Public vs Admin

Public: expressive, visual, editorial, motion, whitespace, showcase. Admin: minimal, functional, compact, data-focused, efficient. Admin tidak boleh terlihat seperti landing page public.

## 14. Static Content Rule

Konten yang ditetapkan static tetap static. Contoh: **Profil Prodi versi awal dikelola lewat source code**, bukan CRUD admin, bukan database. Jangan menjadikannya dynamic hanya karena "bisa". Tidak ada tabel `program_profile`, API profile, atau admin edit profile (`05-fitur.md` bagian 9).

## 15. Dynamic Content Rule

Data yang butuh pengelolaan admin boleh memakai database: dosen, berita, project, pengumuman (jika dipakai), dokumen akreditasi (jika dipakai), RAG documents (fase RAG). Gunakan CRUD sederhana.

## 16. CRUD Rule

CRUD sederhana: Create, Read, Update, Delete. Tidak menambah workflow approval, revision history, audit trail, versioning, moderation, atau multi-stage publishing tanpa requirement.

## 17. Database Rule

Database mengikuti `docs/04-database.md`. Agent DILARANG: membuat tabel baru tanpa alasan, mengubah schema tanpa approval, menambah field "untuk jaga-jaga", membuat relasi yang tidak diperlukan, membuat soft delete pada semua tabel. Database sesederhana requirement.

## 18. Timestamp Rule

Entity CRUD admin punya `created_at` dan `updated_at`, dikelola database. Jangan mengirim timestamp manual dari frontend.

## 19. Query Rule

Query wajib parameterized dan konsisten dengan arsitektur. Jangan membangun query dari input user secara langsung. Nama kolom/ORDER BY dinamis memakai whitelist.

## 20. API Rule

API mengikuti `03-arsitektur.md`. Pola dasar:

```
Request → Route → Middleware → Controller → Service (jika dipakai) → Database → Response
```

Jangan membuat pola API baru hanya untuk satu fitur. Endpoint public GET MVP mengikuti `09-data-api.md`; endpoint admin ditetapkan saat milestone implementasinya.

## 21. API Response Rule

Format response konsisten.

- Success: `data`, dan `message` jika perlu.
- Error: `success: false`, `status` (sama dengan HTTP status), `message`, dan `errors` per-field jika relevan. Bentuk final dan contoh public ada di `03-arsitektur.md` bagian H dan `09-data-api.md`.

Jangan expose stack trace, database credential, internal path, atau data sensitif. Detail validasi harus aman dan hanya memuat field/pesan yang boleh diperlihatkan.

## 22. Authentication Rule

Fitur admin wajib dilindungi autentikasi, memakai session dan HTTP-only cookie sesuai arsitektur. Credential sensitif tidak disimpan di frontend.

## 23. Authorization Rule

Satu jenis admin → permission sederhana. Dilarang membuat RBAC engine, permission matrix, atau role hierarchy tanpa requirement.

## 24. Password Rule

Password: tidak plaintext, di-hash menggunakan bcryptjs cost 12 (`04-database.md` bagian 11), tidak dikirim ke public API, tidak muncul di log. Jangan membuat custom cryptography.

## 25. File Upload Rule

Validasi MIME/type, ukuran, dan extension. Gunakan nama file yang aman dan jangan percaya filename dari user. Simpan file sesuai arsitektur storage (**TBD**). Database menyimpan path/metadata, bukan binary. Tipe dan ukuran maksimum: **TBD** (`05-fitur.md` bagian 28).

## 26. Content Validation

Frontend: validasi UX. Backend: validasi security dan correctness (sumber utama). Jangan hanya mengandalkan validasi frontend.

## 27. Error Handling

Setiap fitur punya state: loading, success, empty, validation error, server error, not found (jika relevan), unauthorized (jika relevan). Error API tidak tampil mentah ke user.

## 28. Logging Rule

Log hanya yang berguna. Jangan log password, session secret, token autentikasi, atau data pribadi sensitif. Tidak membuat sistem logging kompleks tanpa kebutuhan.

## 29. Security Rule

Minimum: autentikasi, otorisasi, validasi, parameterized query, upload aman, cookie aman, response error aman, secret di environment variable. Jangan membuat security theater; keamanan harus relevan dengan aplikasi. Perlindungan tambahan (rate limit login, CSRF): **TBD** (`03-arsitektur.md`).

## 30. Environment Variable Rule

Secret/konfigurasi sensitif di environment variable: credential database, session secret, API key, kunci provider AI. Jangan hardcode ke source code.

## 31. .env Rule

Jangan commit `.env`, API key, password, atau secret. `.env.example` hanya berisi placeholder.

## 32. Code Quality

Kode harus readable, konsisten, sederhana, modular secukupnya, dan mudah dipahami mahasiswa. Jangan membuat abstraksi hanya demi terlihat "clean architecture".

## 33. Abstraction Rule

Pakai abstraksi jika kode benar-benar berulang, memperjelas kompleksitas, atau separation memang perlu. Jangan membuat generic service factory, generic CRUD engine, atau generic repository untuk semua tabel.

## 34. Component Rule

Sebelum membuat component baru: cari yang sudah ada dan reuse jika sesuai. Component baru punya tanggung jawab jelas. Jangan membuat component sekecil satu baris markup tanpa manfaat.

## 35. Duplication Rule

Jangan menduplikasi logic API, validasi, UI component, atau query bila bisa dipakai ulang secara sederhana. Jangan memaksakan abstraksi hanya untuk menghapus sedikit duplikasi.

## 36. Naming Rule

Nama jelas, konsisten, deskriptif. Ikuti convention project (database: `snake_case`, `04-database.md` bagian 33; convention kode: **TBD**, `03-arsitektur.md`). Jangan mengganti nama file/function yang sudah dipakai luas tanpa alasan.

## 37. Frontend Data Flow

```
UI → fetch → API → Express route → controller/service → MySQL → JSON response → UI state
```

Frontend tidak mengakses database langsung (`04-database.md` bagian 64). Jangan mem-bypass arsitektur tanpa alasan.

## 38. Backend Data Flow

```
Route → Middleware → Controller → Service (jika diperlukan) → Database → Response
```

Untuk operasi sederhana yang tidak butuh service layer menurut arsitektur, jangan membuat abstraksi berlebihan.

## 39. No Business Logic in UI

Frontend boleh: validasi UX, state, display logic. Backend tetap melakukan: otorisasi, validasi, business rules, operasi database.

## 40. Animation Rule

Ikuti `docs/06-animation.md`. Jangan: animasi acak, semua section dianimasikan, bounce berlebihan, scroll animation berat, library animation tanpa approval. Motion harus purposeful. Nilai timing yang masih rekomendasi/TBD di dokumen animasi tidak dianggap final.

## 41. Accessibility Rule

Setiap fitur mempertimbangkan: semantic HTML, keyboard navigation, focus state, accessible label, alt text, touch interaction, reduced motion. Hover bukan satu-satunya cara mendapat informasi.

## 42. Responsive Rule

Semua halaman public dan admin diuji di desktop, tablet, dan mobile. Jika hover dipakai di desktop, mobile punya alternatif (tap/click/selected state).

## 43. Performance Rule

Tidak ada optimasi prematur. Hindari sejak awal: query tidak perlu, gambar terlalu besar, animasi berat, request berulang, dependency berlebihan. Pakai solusi sederhana.

## 44. SEO Rule

Halaman public yang relevan punya title, meta description, semantic HTML, URL yang mudah dibaca, alt text. Tanpa infrastruktur SEO kompleks.

## 45. Testing Rule

Setelah implementasi fitur, test minimal:

1. happy path;
2. validation;
3. error state;
4. unauthorized (fitur admin);
5. not found (jika relevan);
6. responsive;
7. regression pada fitur terkait.

## 46. No "Fix" Without Understanding

Jika menemukan bug, jangan langsung rewrite besar. Lakukan: reproduce → cari penyebab → identifikasi file terkait → perubahan minimal → test ulang.

## 47. No Mass Rewrite

Dilarang rewrite seluruh frontend/backend, mengganti struktur folder, atau mengganti arsitektur karena satu bug atau satu fitur. Gunakan perubahan sekecil mungkin.

## 48. Preserve Working Features

Fitur yang sudah berjalan dipertahankan. Sebelum perubahan besar: identifikasi dependency dan periksa kemungkinan regression. Jangan memperbaiki satu fitur dengan merusak fitur lain.

## 49. Git / Change Safety

Jika Git tersedia: periksa status sebelum perubahan besar; jangan menghapus pekerjaan user; jangan reset repository tanpa izin; jangan force push; jangan menghapus branch. Command Git destruktif butuh approval.

## 50. File Deletion Rule

Jangan menghapus source code, assets, konfigurasi, file database, atau dokumentasi tanpa memastikan file tidak dipakai. Untuk penghapusan besar: jelaskan file, alasan, impact, lalu minta approval.

## 51. Database Change Rule

Perubahan database adalah perubahan penting. Sebelum drop table, rename column, delete data, mengubah relationship, atau migration destruktif, agent wajib meminta approval. Tidak ada operasi database destruktif otomatis. Detail: `04-database.md` bagian 53 dan 61–62.

## 52. Production Safety

Tanpa approval, agent tidak boleh: drop production database, menghapus file production, menimpa environment production, merotasi credential, menjalankan migration destruktif. Environment development/local boleh dipakai sesuai kebutuhan implementasi.

## 53. Deployment Rule

Deployment mengikuti `docs/03-arsitektur.md`. Jangan mengganti hosting, deployment provider, atau arsitektur server tanpa approval. Detail hosting: **TBD**.

## 54. No Secret Exposure

Jika agent menemukan secret/API key: jangan tampilkan di respons, jangan masukkan ke source code, gunakan environment variable. Jangan mencetak credential ke terminal/log tanpa kebutuhan.

## 55. User Approval Boundary

Agent boleh langsung melakukan perubahan kecil yang: sesuai dokumentasi, tidak mengubah arsitektur, tidak menambah dependency, tidak destruktif, scope jelas.

Agent harus meminta approval untuk:

- perubahan arsitektur;
- dependency baru;
- perubahan schema database yang besar;
- operasi destruktif;
- deployment production;
- perubahan arsitektur keamanan;
- perubahan design direction;
- fitur baru di luar scope.

## 56. When Requirement Is Unclear

Jangan mengarang. Gunakan: TBD, pertanyaan klarifikasi, atau solusi paling sederhana hanya jika perubahan itu reversible dan tidak signifikan.

## 57. When Documentation Is Incomplete

1. cari keputusan di dokumen lain;
2. periksa source code yang ada;
3. jangan mengarang requirement;
4. gunakan solusi minimal;
5. tandai asumsi.

## 58. Implementation Report

Setelah pekerjaan, agent melaporkan: apa yang diubah, file yang diubah, fitur yang dibuat, dependency yang ditambah (jika ada), perubahan database (jika ada), testing yang dilakukan, masalah yang ditemukan, hal yang masih TBD. Bukan sekadar "Done."

## 59. Test Report

Format:

```
Feature: Admin tambah berita

Test: Create valid berita
Result: PASS

Test: Title kosong
Result: PASS - validation muncul
Issue: -
```

Setiap test dilaporkan dengan Feature, Test, Result, Issue.

## 60. No False Claim

Agent tidak boleh menyatakan "sudah aman", "sudah production ready", atau "sudah tested" jika belum diverifikasi. Bedakan status: **implemented**, **tested**, **verified**, **not tested**.

## 61. Task Execution

Jika `docs/08-task.md` tersedia, ikuti task secara berurutan. Jangan melompat ke task berikutnya sebelum task sebelumnya stabil, kecuali user meminta. Jika ada dependency antar task, selesaikan dependency dulu.

## 62. Definition of Done

Task selesai jika:

- requirement terpenuhi;
- implementasi sesuai arsitektur;
- UI sesuai desain;
- database sesuai schema;
- validation bekerja;
- error state bekerja;
- autentikasi bekerja jika diperlukan;
- responsive;
- tidak ada regression yang diketahui;
- testing dilakukan;
- perubahan dilaporkan.

## 63. Final Pre-Commit Check

- [ ] Requirement sesuai
- [ ] Tidak ada fitur tambahan
- [ ] Tidak ada dependency tidak perlu
- [ ] Tidak ada perubahan arsitektur tanpa approval
- [ ] Tidak ada secret di source code
- [ ] Tidak ada operasi destruktif
- [ ] Query database aman
- [ ] Validasi backend tersedia
- [ ] Responsive
- [ ] Accessibility diperhatikan
- [ ] Animation sesuai docs
- [ ] Fitur yang ada tidak rusak
- [ ] Testing dilakukan
- [ ] Perubahan dilaporkan

## 64. Emergency / Conflict Rule

Jika agent menemukan requirement bertentangan, arsitektur bertentangan, database tidak cocok, dependency conflict, isu keamanan, atau risiko kehilangan data: **jangan menebak.** Berhenti pada bagian bermasalah dan jelaskan: (1) masalah, (2) penyebab, (3) dampak, (4) opsi solusi, (5) rekomendasi teknis jika relevan. Untuk perubahan signifikan, tunggu approval.

Konflik/celah yang sudah diketahui saat ini ([REVIEW]):

1. Palette warna final belum ada (`02-desain.md`).
2. Status project, format PDF akreditasi, timezone, dan identitas login admin telah diputuskan di `04-database.md`; visibilitas public dokumen akreditasi masih perlu keputusan (lihat `09-data-api.md`).
3. Menu navigasi final dan keberadaan FAQ (`02-desain.md`, `05-fitur.md`).
4. Nilai final timing animasi (`06-animation.md`).
5. `01-prd.md` dan `03-arsitektur.md` belum diverifikasi silang oleh dokumen-dokumen ini.

## 65. Final Principle

> Jangan membuat project lebih kompleks daripada kebutuhan sebenarnya.

Agent selalu memilih solusi paling sederhana yang memenuhi requirement, dengan keamanan yang cukup, dan tetap mudah dipahami serta dipelihara.

**READ → UNDERSTAND → PLAN → IMPLEMENT → TEST → REVIEW → REPORT**

Bukan: PROMPT → LANGSUNG CODING → MENAMBAH FITUR → MENGUBAH ARSITEKTUR.
