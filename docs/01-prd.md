# PRD — Website Prodi Teknologi Rekayasa Multimedia

## Politeknik Dewantara

> Dokumen ini menjelaskan **apa yang dibangun, mengapa dibangun, siapa yang menggunakannya, dan batasan produk**.
>
> Detail implementasi teknis tidak dibahas di dokumen ini dan akan dijelaskan pada dokumen:
>
> - `02-desain.md` — sistem desain dan UI
> - `03-arsitektur.md` — arsitektur dan teknologi
> - `04-database.md` — struktur dan relasi data
> - `05-fitur.md` — spesifikasi detail setiap fitur
> - `06-animation.md` — spesifikasi interaksi dan animasi
> - `07-rules.md` — aturan pengembangan dan konten
> - `08-task.md` — breakdown pekerjaan dan tahapan implementasi

---

# 1. Latar Belakang

Program Studi Teknologi Rekayasa Multimedia (TRM) Politeknik Dewantara belum memiliki website khusus yang menjadi pusat informasi digital bagi program studi.

Berdasarkan hasil observasi dan pembahasan dengan pihak terkait, terdapat kebutuhan untuk menyediakan media digital yang dapat membantu calon mahasiswa dan mahasiswa memperoleh informasi mengenai program studi secara lebih mudah dan terpusat.

Saat ini, beberapa informasi penting mengenai TRM masih bergantung pada komunikasi langsung atau sumber informasi yang belum terpusat dalam satu platform.

---

# 2. Permasalahan

Permasalahan utama yang ingin diselesaikan:

### 2.1 Informasi Prodi Belum Terpusat

Calon mahasiswa, khususnya mahasiswa baru, dapat mengalami kesulitan dalam memperoleh informasi dasar seperti:

- Apa yang dipelajari di TRM.
- Gambaran bidang atau konsentrasi yang tersedia.
- Informasi mengenai Kaprodi dan dosen.
- Kegiatan dan karya mahasiswa.
- Informasi lain yang berkaitan dengan program studi.

### 2.2 Informasi Berita dan Kegiatan Belum Memiliki Pusat Digital

Berita dan informasi kegiatan prodi membutuhkan media yang dapat menampilkan dan memperbarui informasi secara terstruktur.

### 2.3 Karya Mahasiswa Belum Memiliki Media Showcase Terpusat

Project mahasiswa dalam bidang multimedia, seperti desain, coding, dan 3D, dapat digunakan untuk menunjukkan aktivitas dan hasil pembelajaran mahasiswa.

Website dapat menyediakan tempat khusus untuk menampilkan karya tersebut secara terstruktur.

### 2.4 Informasi Administratif Tertentu Sulit Diakses Secara Mandiri

Mahasiswa dapat membutuhkan dokumen atau informasi akreditasi untuk keperluan administratif, termasuk kebutuhan beasiswa atau dokumen pendukung lainnya.

Website dapat menyediakan akses terhadap dokumen akreditasi atau mengarahkan pengguna ke sumber resmi yang relevan.

---

# 3. Tujuan Produk

Tujuan utama produk adalah membangun website khusus Prodi Teknologi Rekayasa Multimedia yang berfungsi sebagai pusat informasi digital program studi.

Website ditujukan untuk membantu:

1. Calon mahasiswa memahami program studi TRM sebelum memilih atau mendaftar.
2. Mahasiswa memperoleh informasi prodi secara lebih terpusat.
3. Pengunjung mengenal aktivitas dan karya mahasiswa TRM.
4. Admin prodi dapat memperbarui konten tertentu tanpa harus mengubah kode program.
5. Mahasiswa memperoleh akses yang lebih mudah terhadap informasi atau dokumen akreditasi.
6. Pengguna dapat memperoleh jawaban mengenai TRM melalui chatbot berbasis dokumen yang telah disediakan.

---

# 4. Target Pengguna

## 4.1 Calon Mahasiswa / Mahasiswa Baru

Kebutuhan utama:

- Memahami apa yang dipelajari di TRM.
- Mengetahui bidang atau konsentrasi yang tersedia.
- Mengenal Kaprodi dan dosen.
- Melihat karya dan aktivitas mahasiswa.
- Mendapatkan informasi dasar mengenai program studi.

## 4.2 Mahasiswa Aktif

Kebutuhan utama:

- Mendapatkan berita dan informasi terbaru.
- Melihat project mahasiswa.
- Mengenal informasi struktur dan dosen prodi.
- Mengakses dokumen atau informasi akreditasi.
- Mendapatkan informasi umum mengenai program studi.

## 4.3 Admin Prodi

Admin merupakan pihak yang ditunjuk oleh program studi untuk mengelola konten website.

Kebutuhan utama:

- Mengelola berita.
- Mengelola project mahasiswa.
- Mengelola informasi dosen/struktur prodi.
- Memperbarui konten tanpa harus mengakses atau mengubah source code secara langsung.

---

# 5. Ruang Lingkup Produk

Produk mencakup area publik dan area administrasi.

## 5.1 Informasi dan Profil Prodi

Website menyediakan informasi mengenai:

- Profil TRM.
- Gambaran bidang yang dipelajari.
- Konsentrasi/bidang terkait.
- Visi dan misi jika data tersedia.
- Informasi lain yang relevan dengan profil program studi.

## 5.2 Struktur Prodi

Website menampilkan informasi struktur dan dosen yang ditentukan oleh pihak prodi.

Struktur utama yang direncanakan mencakup:

- Kaprodi.
- Dosen konsentrasi Web Design.
- Dosen konsentrasi Desain Grafis.
- Dosen konsentrasi Videografi.

Data tersebut dapat dikelola oleh admin sesuai kebutuhan dan informasi yang diberikan pihak prodi.

## 5.3 Berita

Website menyediakan halaman berita untuk menampilkan informasi dan aktivitas terbaru dari program studi.

Admin dapat:

- Menambahkan berita.
- Mengubah berita.
- Menghapus berita.
- Mengatur informasi yang ditampilkan kepada publik.

## 5.4 Project Mahasiswa

Website menyediakan halaman showcase untuk menampilkan karya atau project mahasiswa.

Project dapat mencakup bidang seperti:

- Desain.
- Coding.
- 3D.
- Bidang multimedia lain yang relevan.

Admin dapat mengelola project yang ditampilkan.

## 5.5 Informasi dan Dokumen Akreditasi

Website menyediakan akses terhadap informasi atau dokumen akreditasi yang diberikan atau disetujui oleh pihak prodi.

Jika dokumen atau informasi berasal dari sumber eksternal resmi, website dapat menyediakan tautan menuju sumber tersebut.

Dokumen tidak dibuat atau dimodifikasi oleh sistem.

## 5.6 Admin

Website memiliki area admin yang dilindungi untuk mengelola konten tertentu.

Admin dapat mengelola konten yang memang ditetapkan untuk dapat diperbarui melalui sistem.

Admin tidak ditujukan untuk menggantikan sistem akademik kampus.

## 5.7 Chatbot Berbasis Dokumen

Website menyediakan chatbot berbasis RAG pada fase akhir pengembangan.

Chatbot digunakan untuk menjawab pertanyaan yang berkaitan dengan Prodi TRM berdasarkan dokumen atau sumber pengetahuan yang telah disediakan.

Chatbot harus memiliki batasan konteks.

Contoh:

> Pengguna bertanya tentang konsentrasi TRM → chatbot dapat menjawab jika informasi tersebut tersedia dalam knowledge base.

Sedangkan:

> Pengguna meminta tutorial Python → chatbot tidak memberikan tutorial karena pertanyaan berada di luar cakupan pengetahuan prodi.

Jika informasi tidak tersedia dalam sumber pengetahuan, chatbot harus menyatakan bahwa informasi tersebut tidak tersedia daripada membuat jawaban sendiri.

---

# 6. Prioritas Produk

Prioritas produk ditentukan berdasarkan kebutuhan dan ketergantungan fitur.

### Prioritas 1 — Informasi Dasar Prodi

- Profil Prodi.
- Informasi bidang/konsentrasi.
- Struktur dan dosen.
- Informasi dasar lainnya.

### Prioritas 2 — Showcase dan Informasi Dinamis

- Project mahasiswa.
- Berita.

### Prioritas 3 — Administrasi Konten

- Area admin.
- Pengelolaan berita.
- Pengelolaan project.
- Pengelolaan data struktur/dosen.

### Prioritas 4 — Informasi Akreditasi

- Informasi akreditasi.
- Dokumen atau tautan sumber resmi.

### Prioritas 5 — Chatbot RAG

Chatbot menjadi fitur fase akhir karena membutuhkan:

- Dokumen pengetahuan yang relevan.
- Informasi yang telah diverifikasi.
- Knowledge base yang cukup representatif.
- Pengujian terhadap pertanyaan di luar konteks.

> Urutan di atas merupakan prioritas produk. Urutan implementasi teknis dapat disusun kembali pada `08-task.md` berdasarkan ketergantungan antarbagian sistem.

---

# 7. Prinsip Produk

## 7.1 Information First

Website harus memprioritaskan kemudahan pengguna dalam menemukan dan memahami informasi prodi.

## 7.2 Content Must Be Maintainable

Konten yang memang bersifat dinamis harus dapat diperbarui oleh admin tanpa membutuhkan perubahan source code.

## 7.3 Credible Information

Informasi yang ditampilkan harus berasal dari data yang diberikan atau disetujui oleh pihak prodi.

## 7.4 Showcase Student Work

Website tidak hanya menjadi halaman informasi, tetapi juga menjadi media untuk memperlihatkan karya dan aktivitas mahasiswa TRM.

## 7.5 Focused Scope

Website bukan pengganti sistem akademik kampus.

Fokus produk adalah:

> **Informasi Prodi + Publikasi Konten + Showcase Project + Informasi Administratif Tertentu + Knowledge Assistant TRM**

---

# 8. Prinsip Pengalaman Pengguna

Website harus:

- Mudah dipahami oleh mahasiswa baru.
- Memiliki navigasi yang jelas.
- Memprioritaskan informasi penting.
- Responsive pada desktop, tablet, dan mobile.
- Memiliki interaksi visual yang membantu pemahaman konten.
- Tidak menggunakan animasi hanya sebagai dekorasi.
- Tidak terlihat seperti template generik atau hasil AI yang tidak memiliki identitas visual.

Detail sistem visual dan interaksi dijelaskan dalam:

- `02-desain.md`
- `06-animation.md`

---

# 9. Di Luar Cakupan (Out of Scope)

Fitur berikut tidak termasuk dalam versi awal:

### Sistem Akademik

- Nilai.
- KRS.
- KHS.
- Presensi.
- Jadwal kuliah.
- Sistem pembayaran.
- Data akademik mahasiswa.

### Akun Mahasiswa

Website tidak menyediakan akun/login khusus untuk mahasiswa umum pada versi awal.

Login hanya digunakan untuk pihak yang memiliki hak administrasi website.

### Manajemen Akademik

Website tidak digunakan untuk menggantikan sistem informasi akademik kampus.

### Multi-bahasa

Versi awal hanya menggunakan Bahasa Indonesia.

### Chatbot Umum

Chatbot bukan AI assistant umum.

Chatbot tidak ditujukan untuk:

- Tutorial pemrograman umum.
- Pertanyaan di luar TRM.
- Percakapan umum.
- Menggantikan mesin pencari.
- Menjawab berdasarkan informasi yang tidak terdapat dalam knowledge base.

---

# 10. Asumsi dan Ketergantungan

Project bergantung pada beberapa informasi dari pihak program studi.

### 10.1 Data Profil

Informasi mengenai profil, visi, misi, konsentrasi, dan informasi lainnya harus diberikan atau diverifikasi oleh pihak prodi.

### 10.2 Data Dosen

Informasi dosen dan struktur prodi harus diberikan atau diverifikasi oleh pihak prodi.

### 10.3 Konten Berita dan Project

Konten yang dipublikasikan melalui website harus berasal dari sumber yang dapat dipertanggungjawabkan oleh pihak prodi.

### 10.4 Dokumen Akreditasi

Dokumen atau sumber akreditasi disediakan atau ditentukan oleh pihak prodi.

Website tidak membuat atau memodifikasi dokumen resmi tersebut.

### 10.5 Knowledge Base Chatbot

Chatbot bergantung pada ketersediaan dokumen yang:

- relevan dengan TRM,
- cukup representatif,
- dapat diproses oleh sistem,
- dan telah diverifikasi oleh pihak prodi.

---

# 11. Metrik Keberhasilan

Metrik keberhasilan awal bersifat praktis.

Produk dianggap memenuhi tujuan apabila:

1. Pengunjung dapat menemukan informasi dasar mengenai TRM melalui website.
2. Mahasiswa baru dapat memahami gambaran umum TRM tanpa harus terlebih dahulu bertanya kepada staf/dosen.
3. Pengunjung dapat melihat struktur/dosen prodi.
4. Project mahasiswa dapat ditampilkan secara terstruktur.
5. Berita dapat dipublikasikan dan diperbarui oleh admin.
6. Project dapat dikelola oleh admin tanpa bantuan developer.
7. Informasi atau dokumen akreditasi dapat diakses dengan mudah.
8. Chatbot dapat menjawab pertanyaan yang tersedia dalam knowledge base dan menolak pertanyaan di luar cakupannya.

---

# 12. Batasan dan Prinsip Pengembangan

Project dikembangkan dengan mempertimbangkan keterbatasan waktu, sumber daya, dan kompleksitas implementasi.

Karena itu:

- Fitur harus memiliki tujuan yang jelas.
- Fitur yang tidak memberikan manfaat nyata bagi pengguna tidak perlu ditambahkan.
- Kompleksitas teknis harus dijaga agar sesuai dengan kebutuhan produk.
- Sistem tidak boleh dibuat lebih kompleks hanya untuk menambahkan teknologi.
- Pengembangan dilakukan secara bertahap.
- Fitur yang bersifat eksperimental, seperti chatbot RAG, dikerjakan setelah fondasi website stabil.

---

# 13. Pertanyaan Terbuka

Beberapa keputusan membutuhkan konfirmasi dari pihak prodi:

1. Siapa admin yang akan bertanggung jawab mengelola website setelah project selesai?
2. Data dosen dan struktur prodi apa saja yang secara resmi boleh ditampilkan?
3. Informasi profil, visi, misi, dan konsentrasi apa yang akan digunakan sebagai sumber resmi?
4. Dokumen atau sumber resmi akreditasi mana yang harus ditampilkan?
5. Apakah dokumen akreditasi perlu diperbarui secara berkala?
6. Dokumen apa saja yang akan menjadi sumber pengetahuan chatbot RAG?
7. Siapa yang akan memverifikasi isi dokumen yang digunakan chatbot?
8. Apakah project mahasiswa boleh dipublikasikan secara terbuka dan siapa yang memberikan persetujuan publikasinya?

---

# 14. Ringkasan Produk

Website Prodi Teknologi Rekayasa Multimedia merupakan platform informasi dan publikasi yang berfokus pada:

- Informasi dan profil Prodi TRM.
- Struktur dan informasi dosen.
- Berita dan aktivitas prodi.
- Showcase project mahasiswa.
- Informasi/dokumen akreditasi.
- Pengelolaan konten oleh admin.
- Chatbot RAG terbatas yang membantu pengguna memperoleh informasi mengenai TRM berdasarkan knowledge base yang telah diverifikasi.

Produk **bukan sistem akademik kampus** dan tidak ditujukan untuk menggantikan sistem akademik yang sudah ada.

Prioritas utama adalah membuat informasi TRM menjadi **lebih terpusat, mudah ditemukan, mudah dipahami, dan dapat dikelola secara berkelanjutan oleh pihak prodi**.
