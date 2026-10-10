# 02-desain.md — Design System & UI/UX Source of Truth

Project: Website Program Studi Teknologi Rekayasa Multimedia (TRM), Politeknik Dewantara

Status dokumen: DESIGN SOURCE OF TRUTH. Nilai yang belum diputuskan ditulis **TBD**. Jangan mengarang nilai TBD tanpa approval.

---

## 1. Peran Dokumen

Dokumen ini adalah sumber kebenaran untuk:

- visual identity, typography, color system, spacing;
- layout, responsive behavior, navigation;
- component, public website, admin dashboard;
- interaction dan konsep animation;
- accessibility, anti-AI-slop rules;
- penggunaan Flowbite Svelte dan DaisyUI.

Batas dengan dokumen lain:

- Detail teknis animation (duration, easing, transform, timing, threshold) → `docs/06-animation.md`.
- Struktur teknis aplikasi → `docs/03-arsitektur.md`.

## 2. Identitas Produk

Website Prodi TRM Politeknik Dewantara bukan sekadar website profil. Karakternya:

- informasi dan publikasi;
- showcase karya;
- akademik secara informatif;
- modern, profesional, kreatif;
- bersih, minimal, premium;
- editorial dan typography-driven.

Website harus terasa seperti website program studi multimedia modern, bukan template universitas generik.

## 3. Tujuan Desain

1. Memudahkan mahasiswa baru memahami TRM.
2. Memudahkan pengunjung menemukan informasi penting.
3. Menampilkan identitas TRM.
4. Menampilkan karya mahasiswa secara menarik.
5. Menampilkan dosen/struktur program studi secara jelas.
6. Menyediakan akses informasi akreditasi.
7. Menampilkan berita/publikasi.
8. Memberikan pengalaman visual yang modern.
9. Tetap mudah digunakan.
10. Tetap maintainable oleh developer.

Visual mendukung informasi, bukan mengalahkan informasi.

## 4. Karakter Visual

Gunakan: clean, modern, editorial, professional, creative, minimal, refined, whitespace-heavy, typography-driven.

Hindari: AI slop, generic SaaS template, terlalu banyak rounded card, terlalu banyak gradient, estetika purple-blue AI, glassmorphism berlebihan, shadow berat, dekorasi berlebihan, animasi berlebihan, layout terlalu ramai.

## 5. Anti AI Slop

AI coding agent WAJIB menghindari:

1. Semua section dibuat card.
2. Semua element diberi border.
3. Semua element diberi shadow.
4. Semua element dibuat rounded besar.
5. Gradient di hampir semua section.
6. Purple-blue gradient generic.
7. Glassmorphism tanpa alasan.
8. Hero template generik.
9. Tombol terlalu banyak.
10. Badge/tag berlebihan.
11. Icon dekoratif tanpa fungsi.
12. Animasi hanya untuk terlihat keren.
13. Floating blobs tanpa fungsi.
14. Typography tidak konsisten.
15. Spacing random.
16. Layout terlalu padat.
17. Copywriting generik buatan AI.
18. Stock image random yang tidak relevan.
19. Generated photo menggantikan foto resmi dosen.
20. Setiap section memakai pola layout yang sama.

Prinsip: **"Jangan membuat desain terlihat AI-generated."** Gunakan hierarchy, whitespace, typography, image, grid, alignment, dan motion secara terkontrol.

## 6. Font

Hanya dua font:

| Font    | Penggunaan                                                                        |
| ------- | --------------------------------------------------------------------------------- |
| Poppins | hero, heading, section title, display text, elemen yang butuh karakter visual     |
| Inter   | body, paragraph, metadata, navigation (jika diperlukan), form, admin, table, data |

Dilarang menambahkan font lain tanpa approval.

## 7. Typography System

Pendekatan: **Fibonacci-inspired / ratio-based typography**. Ini prinsip visual, bukan aturan matematika yang diterapkan literal.

- Contoh inspirasi rasio: heading 36px, body 18px.
- Jangan menyebut 36px → 18px sebagai deret Fibonacci secara matematis.
- Typography harus responsive.

Panduan desktop (bukan angka kaku):

- Hero heading: sekitar 48–72px sesuai konteks.
- Section heading: sekitar 32–40px.
- Body: sekitar 16–18px.

Tablet: turunkan secara proporsional. Mobile: turunkan lagi agar tetap readable. Jangan mengejar angka secara kaku.

Skala typography admin dijelaskan terpisah di bagian 28 dan 51.

## 8. Body Text

- Body text default sekitar **85% visual opacity** agar hierarchy heading vs body jelas.
- Jangan terlalu redup sampai sulit dibaca.
- Accessibility (contrast) tetap prioritas.

## 9. Color System

Gunakan palette yang sudah ditentukan di project/reference desain. Dilarang random RGB dan palette baru spontan.

Setiap warna harus punya semantic role:

| Role       | Nilai |
| ---------- | ----- |
| primary    | TBD   |
| secondary  | TBD   |
| background | TBD   |
| surface    | TBD   |
| text       | TBD   |
| muted text | TBD   |
| border     | TBD   |
| accent     | TBD   |
| success    | TBD   |
| warning    | TBD   |
| error      | TBD   |

Catatan:

- Jangan mengarang hex baru tanpa approval.
- Palette untuk interaksi hero (bagian 15) juga harus predefined: **TBD**.
- Hindari palette purple-blue generik, gradient berlebihan, terlalu banyak warna, dan accent yang tidak konsisten.

## 10. Spacing

- Gunakan sistem spacing konsisten; hindari margin/padding random.
- Prioritaskan whitespace, breathing room, visual hierarchy, dan vertical rhythm yang konsisten.
- Section tidak boleh terlalu padat.
- Whitespace adalah bagian penting identitas desain.
- Nilai skala spacing: **TBD** (didefinisikan sebagai token, lihat bagian 57).

## 11. Layout Principle

- Gunakan grid, flex, container, whitespace, alignment, hierarchy.
- Tidak semua section harus berupa card.
- Gunakan layout berbeda sesuai kebutuhan konten.
- Content first. Jangan membuat layout hanya demi dekorasi.

## 12. Public Website

Public website harus terasa expressive, visual, modern, editorial, premium, informative. Berbeda dari admin dashboard.

Boleh menggunakan: typography besar, whitespace, visual project, image interaction, scroll interaction, subtle motion.

## 13. Navigation

Harus sederhana, mudah dipahami, tidak terlalu banyak item, responsive, dengan hierarchy jelas.

Membantu pengguna menemukan: profile, structure, news, projects, accreditation, dan informasi penting lainnya. Jangan terlalu ramai. Daftar final item menu: **TBD** (mengikuti `05-fitur.md`).

## 14. Hero

- Typography adalah salah satu elemen utama.
- Hero title: besar, bold, Poppins, visual kuat, tetap readable.
- Karakter pada hero title memiliki interaksi individual (bagian 15).
- Hindari pola hero template generik.

## 15. Hero Character Interaction

Setiap karakter/huruf pada hero title memiliki interaksi sendiri. Saat cursor hover pada satu karakter:

1. warna berubah ke warna random dari controlled/predefined palette;
2. karakter melakukan subtle wobble/tilt;
3. transition smooth;
4. tidak menyebabkan layout shift;
5. tidak ada rotation ekstrem;
6. tidak bouncing;
7. tidak mengganggu karakter lain.

Berlaku **PER CHARACTER**, bukan per word.

Istilah desain: per-character hover interaction, character-level color transition, character-level hover wobble.

Palette harus dikontrol (TBD, lihat bagian 9). Dilarang random dari RGB bebas. Detail teknis → `06-animation.md`.

Alternatif keyboard/touch dan reduced motion: lihat bagian 44.

## 16. Project Image Card

Pendekatan image-first. Tidak boleh terasa seperti card dashboard biasa.

Struktur: IMAGE → overlay → content reveal.

Saat hover:

1. image melakukan subtle zoom;
2. text muncul dari bawah;
3. overlay membantu readability;
4. transition smooth;
5. tidak bounce;
6. tidak terlalu cepat;
7. tidak mengganggu gambar.

Istilah: Image Card Hover Reveal, Image Zoom Hover Effect, Bottom-to-top Image Overlay, Image Card Content Reveal.

Zoom harus subtle, tidak boleh zoom besar. Pada touch device, konten harus tetap dapat diakses tanpa hover (bagian 43). Detail → `06-animation.md`.

## 17. Scroll Text Effect

Beberapa section dapat memakai scroll-driven opacity:

- Saat section mulai terlihat: opacity sekitar 20%.
- Saat user scroll melewati section: opacity naik progresif hingga 100%.
- Saat scroll kembali ke atas: opacity kembali menuju 20%.
- Text tetap pada posisi visualnya; hanya opacity yang berubah.

Konsep: scroll-driven opacity animation, scroll-linked text opacity reveal, sticky scroll section + scroll-driven animation.

Jangan membuat text berpindah berlebihan. Detail duration/easing/progress → `06-animation.md`.

## 18. Structure Page

Halaman structure menampilkan organization chart.

Default:

```
Kaprodi
   ↓
Web Design | Desain Grafis | Videografi
```

Setiap node menampilkan nama dan role/title.

## 19. Structure Hover Interaction

Saat user hover node (contoh: Kaprodi):

1. structure sedikit shrink/reflow;
2. layout membuat ruang untuk preview;
3. profile preview muncul di sebelah kanan;
4. preview berisi foto, nama, role;
5. preview tidak menutup structure;
6. preview bukan modal;
7. preview bukan popup overlay;
8. hover ke node lain mengganti preview;
9. hover keluar membuat preview menghilang smooth;
10. structure kembali ke keadaan normal.

Konsep: **ADAPTIVE SPLIT LAYOUT**. Bukan modal, bukan fullscreen popup.

Foto dosen: foto resmi atau placeholder jelas / TBD (bagian 37).

## 20. Structure Mobile

Hover tidak dapat diandalkan di mobile. Gunakan salah satu atau kombinasi: tap, click, selected state, accordion, atau vertical structure. Informasi tidak boleh hanya dapat diakses lewat hover. **Keputusan implementasi 2026-10-03:** gunakan daftar node vertikal berbentuk tombol/card; tap memilih node dan menampilkan placeholder preview setelah diagram. Jangan memaksakan layout diagram desktop yang horizontal ke viewport mobile. Isi preview sama-sama dapat diakses melalui keyboard.

## 21. Project Showcase

Menampilkan karya mahasiswa. Kategori dapat mencakup desain, coding, 3D, multimedia, dan kategori lain sesuai data resmi.

Visual: image-first, visual, clean, editorial, tidak terasa seperti dashboard. Gunakan image relevan dan resmi jika tersedia.

## 22. News

Fokus pada: title, date, category (jika diperlukan), image (jika tersedia), excerpt, content.

Layout boleh berupa editorial list, featured article, atau grid terbatas jika sesuai. Jangan otomatis menjadikan semua berita card 3-column.

## 23. FAQ

Gunakan editorial list / accordion / vertical question list. Bukan card grid.

- Question di kiri.
- Indikator expand/collapse di kanan.
- Interaksi sederhana dan jelas.

## 24. Accreditation

Halaman harus informatif, credible, mudah ditemukan dan dibaca, menyediakan link/source resmi, dan mendukung download/print jika diperlukan. Jangan terlalu dekoratif. Prioritaskan credibility dan usability.

## 25. Footer

Footer memakai contained/wide panel.

```
UPPER AREA
├── brand/logo + description
├── navigation
├── information
└── additional links

separator

LOWER AREA
├── copyright
└── social icons
```

Tidak perlu banyak card.

## 26. Admin Dashboard

Admin punya visual language berbeda dari public.

- Public: creative, editorial, expressive.
- Admin: functional, minimal, compact, data-focused.

Admin bukan tempat hero besar atau animasi dekoratif.

## 27. Admin Sidebar

- Lebar fixed/konsisten di desktop.
- Icon + label.
- Navigation jelas, active state jelas.
- Main content memakai ruang tersisa.
- Mobile: drawer, collapsible, atau navigation mobile.

## 28. Admin Page Header

Setiap halaman admin: Page title → Description/helper text → Content.

| Elemen     | Ukuran          |
| ---------- | --------------- |
| Page title | sekitar 24–28px |
| Section    | 18–22px         |
| Body       | 14–16px         |
| Label      | 13–14px         |
| Helper     | 12–13px         |

Angka dapat menyesuaikan konteks, hierarchy harus konsisten.

## 29. Admin Form

- Desktop: dapat memakai label kiri + field kanan.
- Form kompleks: pakai layout yang mudah dibaca.
- Avatar/profile image area dapat berada di bagian atas.
- Action button di posisi jelas (biasanya bawah/kanan sesuai layout).
- Mobile: vertical/stacked.

## 30. Admin Table

Compact, readable, header jelas, border subtle, spacing proper. Jika terlalu lebar di mobile: horizontal scrolling atau layout alternatif. Jangan memaksa table terlalu kecil.

## 31. Admin Card/Panel

Panel hanya jika diperlukan. Dilarang card dalam card dalam card. Gunakan border tipis, radius moderat, shadow sangat subtle atau tanpa shadow.

## 32. Border

Tipis, subtle, konsisten. Jangan beri border ke semua elemen. Gunakan untuk separation, form, table, panel, navigation state, dan kebutuhan hierarchy.

## 33. Border Radius

Moderat dan konsisten. Hindari radius ekstrem, pill di semua element, dan rounded card berlebihan. Pill hanya jika punya fungsi visual/semantic. Nilai radius: **TBD** (token).

## 34. Shadow

Sangat subtle. Dilarang heavy shadow, glowing/neon shadow, dan shadow di semua card. Gunakan hanya jika membantu hierarchy.

## 35. Gradient

Bukan elemen default. Hindari pada background utama, setiap card, button, hero, section. Jika dipakai, harus punya alasan desain jelas dan mengikuti design system.

## 36. Glassmorphism

Bukan design language default. Gunakan hanya jika ada kebutuhan jelas. Jangan membuat seluruh website menjadi blur + transparency + glass cards.

## 37. Image

Image penting untuk project showcase, lecturer profile, dan visual multimedia.

- Gunakan image relevan.
- Foto dosen resmi tidak boleh diganti generated AI image.
- Jika foto resmi belum ada: placeholder jelas atau tandai **TBD**.
- Jangan mengarang identitas visual dosen.
- Alt text wajib (bagian 44).

## 38. Icon

Harus punya fungsi, konsisten, tidak dekoratif berlebihan, dengan accessible label jika diperlukan. Jangan memakai icon hanya untuk mengisi ruang kosong. Icon set: mengikuti yang sudah tersedia di UI foundation (tanpa menambah library baru).

## 39. Button

Hierarchy jelas: primary, secondary, text/link action. Jangan jadikan semua button primary. Teks button jelas.

## 40. Link

Mudah dikenali, hierarchy visual konsisten. External link dapat dibedakan jika diperlukan.

## 41. Form UX

Wajib ada: label, input, helper text (jika perlu), validation, error message, success feedback. Placeholder tidak boleh menjadi satu-satunya label.

## 42. Responsive Design

Prioritas: Desktop, Tablet, Mobile. Responsive bukan sekadar mengecilkan ukuran; layout berubah sesuai viewport (desktop: grid/split; mobile: stacked/vertical). Breakpoint: mengikuti default Tailwind/UI foundation, atau **TBD** jika ada keputusan khusus.

## 43. Mobile Principle

Mobile tetap mempertahankan hierarchy, readability, accessibility, interaction, dan information priority. Hover-only interaction tidak boleh menjadi satu-satunya cara memperoleh informasi.

## 44. Accessibility

Visual interaction tidak boleh menjadi satu-satunya channel informasi. Wajib:

- semantic HTML;
- keyboard navigation;
- visible focus;
- accessible labels;
- alt text;
- sufficient contrast;
- reduced motion consideration;
- touch alternative.

Untuk hover interaction (hero karakter, image card, structure preview) harus ada alternatif masuk akal untuk keyboard dan touch.

## 45. Motion Principle

Motion harus purposeful, smooth, subtle, consistent. Dipakai untuk feedback, hierarchy, transition, reveal, interaction. Jangan memakai animation hanya agar terlihat "canggih".

## 46. Animation Boundary

- `02-desain.md` menjelaskan **WHAT**.
- `06-animation.md` menjelaskan **HOW**.

Contoh: di sini cukup "Hero menggunakan per-character hover interaction"; duration, easing, transform, timing, threshold, behavior detail ada di `06-animation.md`.

## 47. Loading State

Jelas, sederhana, tidak mengganggu, konsisten. Hindari skeleton/loading animation berlebihan.

## 48. Empty State

Jika belum ada berita, project, atau data: tampilkan empty state yang jelas. Jangan biarkan blank screen tanpa penjelasan.

## 49. Error State

Jelas, tidak teknis untuk user umum, dengan action jika memungkinkan. Contoh benar: "Gagal memuat berita." Contoh salah: "TypeError: Cannot read properties of undefined...".

## 50. Success Feedback

Admin mendapat feedback saat create, update, delete, dan upload berhasil. Feedback subtle dan tidak mengganggu workflow.

## 51. Data Density

- Public: low-to-medium.
- Admin: medium-to-high.

Jangan memakai ukuran typography public di admin. Admin butuh efisiensi.

## 52. Visual Hierarchy

Urutan prioritas: (1) primary heading, (2) important content, (3) supporting content, (4) metadata, (5) secondary action.

Alat hierarchy: size, weight, spacing, opacity, position, contrast.

## 53. Content Priority

Prioritaskan: apa itu TRM, apa yang dipelajari, struktur/dosen, project, berita, accreditation, informasi relevan lainnya. Dekorasi tidak boleh lebih dominan daripada informasi.

## 54. Design Consistency

Semua halaman terasa bagian dari satu website. Konsisten dalam font, spacing, color, button, border, radius, icon, animation, responsive behavior. Jangan membuat tiap halaman punya design language berbeda.

## 55. Public vs Admin

|          | Public                                  | Admin                                      |
| -------- | --------------------------------------- | ------------------------------------------ |
| Karakter | Creative, Visual, Editorial, Expressive | Minimal, Functional, Compact, Data-focused |
| Ciri     | Whitespace, Motion                      | Efficient, Low decoration                  |

Jangan menyamakan keduanya secara visual.

## 56. Flowbite Svelte + DaisyUI

- Keduanya adalah UI foundation, **bukan** sumber kebenaran visual.
- Design system project (dokumen ini) tetap sumber utama.
- Jangan biarkan default theme library menentukan seluruh tampilan.
- Customize komponen bila perlu agar sesuai dokumen ini.
- Dilarang menambahkan library UI baru.

Aturan pembagian pemakaian kedua library di level kode: lihat `03-arsitektur.md` (di dokumen ini: **TBD** jika belum ditetapkan).

## 57. Design Token Principle

Gunakan token/variables untuk colors, typography, spacing, radius, shadow, transition, agar satu perubahan berlaku konsisten. Jangan hardcode nilai visual yang sama berulang. Lokasi dan format token: mengikuti `03-arsitektur.md`.

## 58. Component Principle

Buat component berdasarkan kebutuhan nyata dan reuse untuk pola berulang. Contoh: Button, Navigation, Section heading, Project card, News item, FAQ item, Lecturer node, Admin form, Table. Jangan membuat abstraksi terlalu kompleks.

## 59. Design Implementation Rule

AI coding agent wajib:

1. membaca `02-desain.md`;
2. memahami design system;
3. mencari component existing;
4. reuse jika tersedia;
5. membuat component baru hanya jika diperlukan.

Jangan membuat component duplicate.

## 60. Design Change Rule

AI agent tidak boleh mengubah secara diam-diam: font, color system, layout principle, UI library, component language, interaction principle.

Jika ingin mengubah: jelaskan alasan → tunjukkan impact → minta approval.

## 61. Reference Principle

Reference visual yang pernah dipilih: Google Antigravity, BootstrapMade, Framer templates, Webflow Showcase, Behance.

Dipakai sebagai **INSPIRATION**, bukan **COPY EXACTLY**. Jangan menyalin desain, layout, asset, atau identitas brand secara langsung.

## 62. Design Quality Check

Sebelum menyatakan UI selesai, periksa: typography, spacing, hierarchy, responsive, consistency, color, contrast, interaction, animation, accessibility, image, empty state, error state, loading state.

## 63. Anti Slop Final Check

Tanyakan: **"Apakah desain ini terlihat seperti template AI generik?"**

Jika ya: kurangi card, kurangi gradient, kurangi decoration, perbaiki typography, tambah whitespace, perbaiki hierarchy, gunakan layout lebih editorial, kurangi animation yang tidak perlu.

## 64. Source of Truth Hierarchy

| Dokumen          | Fungsi                 |
| ---------------- | ---------------------- |
| 01-prd.md        | WHAT & WHY             |
| 02-desain.md     | VISUAL & UX            |
| 03-arsitektur.md | TECHNICAL ARCHITECTURE |
| 04-database.md   | DATA STRUCTURE         |
| 05-fitur.md      | FEATURE BEHAVIOR       |
| 06-animation.md  | MOTION DETAIL          |
| 07-rules.md      | DEVELOPMENT RULES      |
| 08-task.md       | IMPLEMENTATION TASKS   |

Jika ada konflik: jangan menebak. Identifikasi konflik dan minta keputusan user.

## 65. Final Design Principle

Website TRM harus terasa: MODERN, CLEAN, PROFESSIONAL, CREATIVE, EDITORIAL, MINIMAL, PREMIUM, INFORMATIVE.

Jangan: GENERIC, OVERDESIGNED, AI-SLOPPY, CARD-HEAVY, GRADIENT-HEAVY, ANIMATION-HEAVY.

**DESIGN FOR INFORMATION FIRST.**

- Visual memperkuat informasi.
- Motion memperkuat interaction.
- Typography memperkuat hierarchy.
- Whitespace memberi breathing room.
- Image memperkuat showcase.
- Semua elemen harus punya alasan; jangan menambah elemen hanya karena "website modern biasanya punya itu".

---

## Lampiran: Daftar TBD

- Color palette final (semua role, bagian 9) dan palette interaksi hero (bagian 15).
- Skala spacing, radius, dan token lain (bagian 10, 33, 57).
- Item final navigation (bagian 13).
- Pola structure mobile (bagian 20).
- Foto resmi dosen (bagian 19, 37).
- Breakpoint khusus jika ada (bagian 42).
- Pembagian pemakaian Flowbite Svelte vs DaisyUI di level kode (bagian 56).
