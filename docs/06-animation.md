# 06-animation.md — Motion & Animation Source of Truth

Project: Website Program Studi Teknologi Rekayasa Multimedia (TRM), Politeknik Dewantara

Status dokumen: source of truth untuk animation, transition, interaction, motion behavior, timing, easing, dan scroll-based animation.

Konvensi:

- **TBD** = belum diputuskan.
- **Rekomendasi default** = nilai awal yang disarankan dokumen ini. Bukan requirement final sampai disetujui user.
- **[REVIEW]** = celah/konflik antar dokumen yang perlu dicek.

Catatan penyusunan: `01-prd.md` dan `03-arsitektur.md` tidak dapat dibaca saat dokumen ini ditulis. Perilaku animasi di sini bersumber dari instruksi user, `02-desain.md` (WHAT), dan `05-fitur.md`. Batasan teknis dari arsitektur ditandai TBD/[REVIEW].

---

## 1. Tujuan Dokumen

- Fungsi: menjelaskan **HOW** semua motion di website TRM: trigger, target, timing, easing, arah, perilaku responsive, dan reduced motion.
- Mengapa didokumentasikan: agar motion konsisten, tidak berlebihan, dan tidak ditambahkan sembarangan oleh developer atau AI agent.
- Cara dipakai AI agent: dibaca bersama `02-desain.md` sebelum menyentuh animasi apa pun. Agent hanya mengimplementasikan animasi yang tercantum di bagian 55.
- Hubungan: `02-desain.md` = WHAT (elemen dan tujuan visual), `05-fitur.md` = fungsi fitur, `06-animation.md` = HOW.

## 2. Prinsip Motion TRM

- Purposeful motion: setiap animasi punya tujuan.
- Subtle motion dan smooth transition.
- Hierarchy first dan content first.
- Tidak ada animasi berlebihan.
- Timing dan easing konsisten.
- Accessibility first dan performance first.

Motion membantu pengguna memahami perubahan state, hubungan antar elemen, feedback, hierarchy, dan navigasi. Jika elemen tidak butuh animasi, biarkan static.

## 3. Motion Personality

Karakter: modern, clean, editorial, smooth, restrained, confident, kreatif tetapi tidak playful berlebihan.

Hindari motion yang terasa gimmicky, childish, chaotic, seperti gaming UI, atau seperti landing page AI generik.

## 4. Motion Hierarchy

Intensitas tidak sama untuk semua elemen. Urutan prioritas:

1. Hero / identity
2. Elemen interaktif penting
3. Project showcase
4. Scroll storytelling
5. Navigation feedback
6. Micro interaction

Semakin kecil elemen, semakin kecil motion-nya.

## 5. Timing System

Hanya tiga kategori durasi. Baseline ini mengikuti rekomendasi default yang disetujui user pada 2026-10-03:

| Kategori | Dipakai untuk                                        | Durasi              |
| -------- | ---------------------------------------------------- | ------------------- |
| Fast     | micro interaction (link, button, ikon)               | 160 ms              |
| Normal   | hover dan transition umum                            | 280 ms              |
| Slow     | section reveal, scroll storytelling, structure split | 550 ms              |

Nilai dipakai lewat design token, lihat `02-desain.md` bagian 57. Tidak menambah kategori durasi lain tanpa alasan.

## 6. Easing System

- Entrance: ease-out.
- Perubahan state: ease-in-out.
- Linear: hanya untuk progres yang memang linear (mis. scroll-linked opacity yang mengikuti progress scroll).
- Tidak memakai easing elastic/bouncy kecuali diminta eksplisit.

Gunakan keyword CSS standar `ease-out` dan `ease-in-out`; user menyetujui rekomendasi default ini pada 2026-10-03. Kurva cubic-bezier khusus tidak diperlukan.

## 7. Transform Principle

Boleh: opacity, translate, scale kecil, rotate kecil.

Hindari: rotate besar, scale besar, 3D transform berlebihan, dan transform yang menyebabkan layout shift.

## 8. Opacity

Opacity dipakai untuk reveal, hover, scroll-linked text, dan transition state. Teks penting tidak boleh terlalu transparan sampai sulit dibaca (kecuali state awal scroll-driven text yang bersifat sementara, bagian 20). Body text tetap mengikuti `02-desain.md` bagian 8 (sekitar 85% opacity).

## 9. Hover Principle

Hover dipakai hanya bila ada pointer desktop (media query pointer/hover, mis. `hover: hover`). Hover tidak boleh menjadi satu-satunya cara memperoleh informasi; semua informasi penting tersedia tanpa hover.

## 10. Hero Character Interaction

### Hero Character Hover

- Purpose: memperkuat identitas visual TRM lewat judul hero.
- Trigger: pointer hover pada satu karakter judul hero (desktop).
- Target: karakter yang di-hover saja (bukan kata, bukan baris).
- Initial State: karakter dengan warna teks normal, tanpa transform.
- Active State: warna berubah ke satu warna dari controlled palette, dan karakter melakukan wobble/tilt kecil.
- Exit State: warna dan transform kembali ke normal secara smooth.
- Properties: color, transform (rotate kecil).
- Duration: Normal (280 ms).
- Easing: ease-out saat masuk, ease-in-out saat kembali (rekomendasi).
- Direction: masuk saat pointer masuk, keluar saat pointer keluar.
- Desktop: aktif.
- Mobile: tanpa hover. Tidak ada interaksi karakter (judul tampil statis dengan warna normal). Alternatif tap pada karakter: **TBD**, tidak wajib.
- Reduced Motion: wobble dimatikan; perubahan warna boleh tetap ada tanpa gerak, atau dimatikan (rekomendasi: dimatikan seluruhnya agar sederhana).
- Performance Notes: setiap karakter dibungkus elemen inline-block agar transform tidak menggeser layout (tanpa layout shift). Judul tetap dapat dibaca screen reader sebagai satu teks utuh (pembungkus karakter disembunyikan dari aksesibilitas dan teks lengkap tersedia lewat label).

Karakter lain tetap normal. Seluruh kata tidak boleh bergerak. Tidak ada rotation ekstrem, tidak ada bounce.

Istilah: per-character hover interaction, per-character color transition, character-level hover wobble.

## 11. Hero Character Color

- Warna hanya dari palette terkontrol di `02-desain.md`. **TBD**: palette final belum ditentukan (`02-desain.md` bagian 9 dan 15), sehingga daftar warna hero belum ada.
- "Random" berarti memilih dari predefined palette, bukan membuat RGB acak.
- Tidak boleh membuat warna baru atau mengambil dari seluruh spektrum.
- Aturan pemilihan (acak biasa vs tidak mengulang warna sebelumnya): **TBD**; rekomendasi: tidak memilih warna yang sama dengan warna saat ini agar perubahan terlihat.
- Warna pilihan harus tetap lolos kontras terhadap latar (cek saat palette final ditentukan).

## 12. Hero Character Wobble

Wobble harus subtle, pendek, smooth, dan kecil. Tidak boleh berputar 360°, bounce besar, melompat, atau mengubah posisi layout.

Gunakan sudut tilt 4°, satu gerakan pendek yang kembali ke posisi awal, durasi Normal (280 ms), dan ease-out. User menyetujui rekomendasi default 3–5° pada 2026-10-03. Nilainya harus konsisten di semua karakter.

## 13. Navigation Animation

Boleh: opacity, color transition, underline, gerakan kecil bila perlu. Tidak boleh: melompat, berputar, berubah ukuran besar.

- Trigger: hover (desktop), focus (keyboard), state aktif.
- Durasi: Fast. Easing: ease-out.
- Reduced Motion: perubahan warna/underline tetap boleh (tanpa gerak).

## 14. Button Micro Interaction

Boleh: color, background, border transition, serta translate/scale sangat kecil jika sesuai. Tidak ada bounce.

- Trigger: hover, focus, active (tekan).
- Durasi: Fast. Easing: ease-out.
- Button tetap mudah dipakai dengan keyboard dan touch (state focus terlihat, tidak bergantung hover).
- Reduced Motion: transition warna tetap; translate/scale dimatikan.

## 15. Link Interaction

Boleh: color transition, underline transition, opacity. Singkat dan subtle (Fast). Tersedia state focus yang jelas.

## 16. Project Image Card Hover

### Project Image Card Hover

- Purpose: memberi detail karya tanpa memenuhi kartu secara permanen (image-first).
- Trigger: hover (desktop) atau focus (keyboard) pada kartu.
- Target: image, overlay, dan blok teks pada kartu.
- Initial State: gambar scale 1, overlay minimal, teks tersembunyi/lebih rendah (jika desain mengharuskan).
- Active State: image zoom sangat kecil, overlay menguat, teks naik ke posisi normal dengan opacity naik.
- Exit State: kebalikan dari active, smooth.
- Properties: transform (scale pada image, translate pada teks), opacity.
- Duration: Normal (280 ms) untuk overlay dan teks; Slow (550 ms) untuk image zoom.
- Easing: ease-out masuk, ease-in-out keluar.
- Direction: teks bergerak dari bawah ke atas.
- Desktop: aktif.
- Mobile: tidak ada hover. Informasi kartu (minimal judul) tetap terlihat tanpa interaksi; detail lewat halaman detail project. Perilaku pasti state default di mobile: **TBD**.
- Reduced Motion: zoom dan translate dimatikan; overlay/teks muncul dengan fade pendek atau langsung tanpa transisi.
- Performance Notes: hanya transform dan opacity. Image di dalam wrapper `overflow: hidden` agar zoom tidak mengubah layout. Tidak ada perubahan tinggi kartu.

Zoom: sekitar 1.03–1.05, sesuai `02-desain.md`. Tidak lebih besar. Konsep: Image Card Hover Reveal, Image Zoom Hover Effect, Bottom-to-top Image Overlay, Image Card Content Reveal.

## 17. Project Card Content Reveal

- Teks tersembunyi atau lebih rendah di state awal bila desain mengharuskan.
- Saat hover muncul dari bawah ke posisi normal dengan opacity naik.
- Jarak translate kecil (rekomendasi: sekitar 12–24 px; final TBD).
- Tidak boleh: terbang dari luar layar, bounce, rotate, banyak transform.
- Konten penting yang hanya muncul saat hover wajib punya padanan non-hover (lihat bagian 9 dan 61).

## 18. Image Overlay

Overlay dipakai untuk keterbacaan teks. Transisi smooth, tidak terlalu gelap, dan tidak memakai gradient berlebihan (`02-desain.md` bagian 35: gradient bukan default; jika overlay gradient dipakai harus punya alasan jelas dan mengikuti design system). Jenis overlay (warna solid atau gradient) dan warnanya: **TBD** (palette belum ada).

## 19. Card Exit Animation

Saat pointer keluar: image kembali ke scale awal, overlay kembali ke state awal, teks kembali turun dengan smooth. Reverse transition harus natural dan tidak lebih lambat dari transisi masuk (rekomendasi: durasi sama atau sedikit lebih singkat).

## 20. Scroll-Driven Text

### Scroll-Driven Text Opacity

- Purpose: scroll storytelling pada section teks terpilih, memberi penekanan bertahap.
- Trigger: posisi scroll relatif terhadap section.
- Target: teks pada section tertentu (daftar section: **TBD**, tidak semua section).
- Initial State: opacity sekitar 20% saat section mulai terlihat.
- Active State: opacity naik berdasarkan progress scroll hingga 100%.
- Exit State: saat scroll kembali ke atas, opacity bergerak kembali menuju 20%.
- Properties: opacity saja.
- Duration: tidak berbasis waktu; mengikuti progress scroll.
- Easing: linear terhadap progress (rekomendasi).
- Direction: dua arah (reversible).
- Desktop: aktif.
- Mobile: aktif dalam bentuk sederhana, atau dimatikan jika berat (keputusan: **TBD**).
- Reduced Motion: tampilkan teks pada opacity 100% tanpa efek.
- Performance Notes: lihat bagian 23.

Teks tetap pada posisi visualnya. Yang berubah hanya opacity. Tidak ada gerak mengikuti scroll, zoom, atau rotate.

Konsep: scroll-driven opacity animation, scroll-linked text opacity reveal, sticky scroll section + scroll-driven animation.

## 21. Scroll Progress

- Animasi mengikuti progress scroll, bukan trigger satu kali.
- Pemetaan: awal rentang progress = 20% opacity, akhir rentang = 100%. Reverse saat scroll naik.
- Titik awal dan akhir rentang (mis. posisi section di viewport): **TBD**.
- Tidak memakai reveal satu arah untuk efek ini.

## 22. Sticky Section

Jika dipakai: section tetap pada posisi rancangan, progress scroll mengontrol opacity, setelah selesai halaman berlanjut normal. Panjang sticky dibatasi seperlunya. Apakah sticky dipakai di section tertentu: **TBD**. Pada mobile, sticky dapat dinonaktifkan jika mengganggu.

## 23. Scroll Performance

- Ringan, tidak memblokir scrolling, tidak ada perhitungan berat berulang.
- Hanya opacity (dan transform bila perlu).
- Rekomendasi pendekatan: pembaruan terjadwal per frame (bukan setiap event mentah) dan listener pasif.
- Alternatif berbasis CSS scroll-driven animation: **TBD**, bergantung dukungan browser target (**TBD**, mengikuti PRD/arsitektur).
- Jumlah elemen yang dianimasikan dijaga kecil.

## 24. Section Reveal

Dipakai terbatas. Bentuk yang diizinkan: fade in, translate ke atas yang halus. Tidak semua section memakai animasi yang sama otomatis. Section mana yang diberi reveal: **TBD**; default: tidak ada reveal kecuali ada alasan visual. Reveal tidak boleh membuat konten penting tertunda.

## 25. Stagger

Hanya jika membantu hierarchy (mis. beberapa item daftar/project). Jeda antar item sangat pendek dan total durasi dibatasi agar pengguna tidak menunggu (rekomendasi: total tidak lebih dari sekitar 400–500 ms; final TBD). Tidak ada stagger pada banyak elemen.

## 26. Page Transition

Default: **tidak dibuat**. Jika kelak dipakai: sangat singkat, subtle, tidak menghambat navigasi. Tidak ada transition kompleks antar route. Keputusan: **TBD**.

## 27. Structure Default State

Tampilan normal dan stabil, mudah dibaca, tanpa animasi terus-menerus (Level 0, bagian 56).

## 28. Structure Node Hover

### Structure Node Hover

- Purpose: menampilkan ringkasan profil dosen tanpa meninggalkan chart.
- Trigger: hover (desktop) atau focus (keyboard) pada node.
- Target: node aktif, area struktur, area preview.
- Initial State: struktur normal, preview tidak ada.
- Active State: node aktif ditandai, struktur menyesuaikan, preview muncul di kanan.
- Exit State: preview hilang, struktur kembali normal.
- Properties: opacity, translate kecil (preview), perubahan lebar/ruang area struktur.
- Duration: Slow untuk perubahan ruang; Normal untuk isi preview.
- Easing: ease-in-out untuk perubahan ruang; ease-out untuk preview masuk.
- Direction: horizontal (preview dari kanan).
- Desktop: aktif.
- Mobile: lihat bagian 33.
- Reduced Motion: perubahan ruang dan preview muncul tanpa transisi (atau fade sangat pendek); informasi tetap sama.
- Performance Notes: perubahan ruang adalah perubahan layout dan satu-satunya animasi yang diizinkan memengaruhi layout. Dibatasi pada satu container, tanpa animasi berulang. Alternatif tanpa animasi lebar (ruang preview disediakan tetap dan hanya isi yang fade): **TBD**, dipilih jika terjadi lag.

Preview bukan modal dan bukan overlay yang menutupi struktur.

## 29. Structure Adaptive Split

Konsep:

```
Normal:  [ Structure ]
Hover:   [ Structure ][ Profile Preview ]
```

Perubahan layout harus smooth. Tidak ada profile preview yang menutupi structure, tidak ada modal, tidak ada popup besar di tengah layar. Keputusan implementasi 2026-10-03: gunakan split 2:1 (structure:preview) pada desktop dengan lebar minimum preview 240px; pada viewport sempit gunakan satu kolom sesuai section 33.

## 30. Structure Preview Enter

Preview masuk dan keluar dengan fade opacity sederhana tanpa translate. Tidak ada scale besar, bounce, atau rotate. Durasi: Normal (280 ms).

## 31. Structure Preview Change

Saat pointer pindah dari satu node ke node lain: preview tetap terbuka dan isinya berganti dengan fade halus. Tidak ditutup lalu dibuka ulang secara kasar. Durasi: Normal (280 ms). Jeda tambahan tidak diperlukan karena pointer leave dipantau pada container bersama, sehingga perpindahan antar node tidak menutup preview.

## 32. Structure Preview Exit

Saat pointer keluar dari area: preview menghilang smooth, struktur kembali normal. Durasi: Normal. Penutupan tidak boleh terjadi saat pointer masih berada di area struktur/preview.

## 33. Structure Mobile

Hover tidak dapat diandalkan. Keputusan implementasi 2026-10-03: gunakan node vertikal berbentuk tombol/card; tap memilih node dan menampilkan preview setelah diagram. Informasi yang tersedia sama dengan desktop. Animasi mobile: fade sederhana dengan durasi Normal (280 ms). Tidak memaksakan hover desktop ke mobile.

## 34. FAQ Animation

### FAQ Expand/Collapse

- Purpose: menampilkan jawaban saat dibutuhkan.
- Trigger: klik/tap/keyboard pada pertanyaan.
- Target: panel jawaban dan ikon.
- Initial State: tertutup.
- Active State: panel terbuka, ikon berubah state.
- Exit State: panel menutup.
- Properties: tinggi panel (expand/collapse) dan opacity; rotate ikon kecil.
- Duration: Normal (cepat).
- Easing: ease-in-out.
- Direction: vertikal.
- Desktop dan Mobile: sama.
- Reduced Motion: buka/tutup langsung tanpa transisi.
- Performance Notes: perubahan tinggi memengaruhi layout; dibatasi pada satu panel, tanpa bounce.

Ada tidaknya FAQ sebagai fitur: **TBD** (`05-fitur.md` bagian 3).

## 35. FAQ Icon

Ikon dapat berotasi kecil atau berganti state (mis. plus menjadi minus). Tidak ada rotasi besar. Durasi: Fast.

## 36. Image Loading

Jika dipakai: sederhana dan tidak mencolok (mis. placeholder netral lalu fade-in singkat). Tidak ada skeleton berlebihan. Ruang gambar dicadangkan agar tidak ada layout shift saat gambar muncul. Perlu atau tidaknya fade-in: **TBD** (default: tanpa animasi).

## 37. Button Loading

Saat submit: button masuk loading state, mencegah double submit, memberi feedback (spinner atau indikator sederhana). Lebar button tetap (tidak berubah drastis). Spinner berputar adalah satu-satunya animasi berulang yang diizinkan, hanya selama loading. Reduced Motion: indikator statis (mis. teks "Memproses...").

## 38. Form Error

- Feedback jelas dan mudah dibaca.
- Boleh transisi opacity/warna pada pesan dan border field.
- Tidak ada shake pada form.
- Error juga disampaikan sebagai teks (tidak hanya warna atau gerak).

## 39. Form Success

Fade atau transisi state yang halus. Tidak ada confetti. Pesan sukses tetap terbaca dan tidak menghalangi alur kerja admin.

## 40. Admin Sidebar

Desktop: sidebar stabil, tanpa animasi. Mobile: drawer slide in dan slide out (Normal, ease-in-out). Tidak ada animasi kompleks. Reduced Motion: drawer muncul/hilang tanpa slide. Fokus keyboard diatur saat drawer dibuka/ditutup.

## 41. Admin Modal

Modal dipakai hanya untuk konfirmasi (mis. hapus data). Backdrop fade, modal masuk halus (opacity dan translate kecil). Tidak ada zoom besar, bounce, atau rotasi. Durasi: Fast sampai Normal. Reduced Motion: tanpa transisi. Modal tetap dapat ditutup dengan keyboard.

## 42. Admin Table

Tidak ada animasi per baris. Animasi hanya untuk loading, feedback, dan perubahan state.

## 43. Admin CRUD Feedback

Setelah create, update, delete: feedback sederhana (toast, inline, atau pesan status; bentuk final: **TBD**). Masuk dan keluar dengan fade singkat. Durasi tampil dan perilaku tutup otomatis: **TBD**. Pesan tidak boleh hilang terlalu cepat untuk dibaca. Tidak ada notification center.

## 44. RAG Chatbot Animation

Hanya jika chatbot (fase RAG) diimplementasikan. Animasi minimal:

- panel chat buka/tutup (fade/slide pendek, Normal);
- kemunculan pesan (fade pendek);
- indikator loading saat AI memproses.

Tidak ada animasi avatar AI berlebihan, typing effect lambat, atau particle.

## 45. Chatbot Message

Pesan user dan assistant muncul dengan transisi singkat (Fast). Indikator typing/loading sederhana dan tidak memperlambat respons sebenarnya. Jawaban ditampilkan segera setelah tersedia (tanpa efek mengetik huruf demi huruf yang menambah waktu tunggu). Reduced Motion: pesan muncul tanpa transisi.

## 46. Reduced Motion

Website wajib menghormati `prefers-reduced-motion`. Jika aktif:

- animasi dikurangi atau dimatikan;
- transform besar dihilangkan;
- scroll animation disederhanakan (konten tampil penuh);
- konten tetap tersedia dan fungsional.

Ringkasan perilaku per animasi:

| Animasi              | Saat reduced motion                  |
| -------------------- | ------------------------------------ |
| Hero character hover | Dimatikan (rekomendasi)              |
| Project card hover   | Tanpa zoom/translate; reveal minimal |
| Scroll-driven text   | Opacity 100%                         |
| Structure preview    | Muncul tanpa gerak                   |
| FAQ                  | Buka/tutup langsung                  |
| Drawer/modal         | Tanpa slide/zoom                     |
| Chatbot              | Tanpa transisi                       |
| Spinner loading      | Indikator statis                     |

## 47. Accessibility

- Interaksi keyboard tetap bekerja untuk semua animasi interaktif.
- Focus state terlihat (tidak dihilangkan oleh animasi).
- Hover bukan satu-satunya cara memperoleh informasi.
- Motion tidak menimbulkan masalah usability.
- Animasi tidak menyembunyikan konten penting.
- Tidak ada flashing/berkedip cepat.

## 48. No Layout Shift

Animasi tidak boleh menyebabkan teks berpindah, kartu berubah tinggi mendadak, navigasi bergeser, atau konten melompat. Pakai transform dan opacity. Pengecualian terkontrol (perubahan ruang pada structure adaptive split dan tinggi panel FAQ) sudah dicatat di bagian 28 dan 34.

## 49. Performance

Utamakan transform dan opacity. Hindari recalculation layout terus-menerus, perhitungan scroll berat, animasi pada banyak elemen DOM, dan animasi gambar besar tanpa optimasi. Gambar yang dianimasikan (project card) harus sudah dioptimalkan ukurannya (aturan upload gambar: `05-fitur.md` bagian 28).

## 50. Mobile Performance

Mobile boleh memakai motion lebih ringan dari desktop. Jika sebuah animasi berat: sederhanakan, kurangi intensitas, atau nonaktifkan. Tidak semua animasi desktop harus ada di mobile.

## 51. Animation Library

Tidak menambah animation library baru. Gunakan kemampuan platform dan framework yang sudah tersedia (CSS transition/animation dan fitur bawaan framework). Jika suatu library benar-benar dibutuhkan: tulis sebagai proposal, jangan langsung diinstal, dan minta approval user. Kemampuan bawaan stack yang dapat dipakai dikonfirmasi lewat `03-arsitektur.md` (**TBD**).

## 52. CSS vs JavaScript

- CSS: hover, focus, transition, opacity, transform.
- JavaScript: hanya jika perlu progress scroll, interaksi dinamis, perilaku berbasis state, atau perilaku per karakter.
- Dilarang memakai JavaScript untuk animasi yang cukup dengan CSS.

Pemetaan:

| Animasi                  | Pendekatan                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Hero per karakter        | CSS untuk transisi; JS ringan untuk memilih warna dan membagi karakter (pembagian karakter dapat dilakukan saat render) |
| Navigation, button, link | CSS                                                                                                                     |
| Project card hover       | CSS                                                                                                                     |
| Scroll-driven text       | JS (progress scroll) atau CSS scroll-driven jika didukung (TBD)                                                         |
| Structure preview        | State (JS/framework) + CSS                                                                                              |
| FAQ                      | State + CSS                                                                                                             |
| Drawer, modal, chatbot   | State + CSS                                                                                                             |

## 53. Animation Ownership

Setiap animasi wajib punya: trigger, target, property, duration, easing, direction, perilaku responsive, perilaku accessibility. Jika ada yang belum jelas, tulis TBD (sudah dilakukan di tiap spesifikasi).

## 54. Animation Specification Format

Format baku untuk animasi utama:

```
### Nama Animation
Purpose:
Trigger:
Target:
Initial State:
Active State:
Exit State:
Properties:
Duration:
Easing:
Direction:
Desktop:
Mobile:
Reduced Motion:
Performance Notes:
```

Spesifikasi lengkap dengan format ini ada di bagian 10 (hero), 16 (project card), 20 (scroll text), 28 (structure), dan 34 (FAQ). Animasi lain cukup ringkas karena sederhana.

## 55. Animation Inventory

| #   | Animation                     | Bagian     | Level | Fase                   |
| --- | ----------------------------- | ---------- | ----- | ---------------------- |
| 1   | Hero character hover          | 10         | 3     | MVP                    |
| 2   | Hero character color          | 11         | 3     | MVP                    |
| 3   | Hero character wobble         | 12         | 3     | MVP                    |
| 4   | Navigation hover              | 13         | 1     | MVP                    |
| 5   | Button hover                  | 14         | 1     | MVP                    |
| 6   | Link hover                    | 15         | 1     | MVP                    |
| 7   | Project image zoom            | 16         | 3     | MVP                    |
| 8   | Project overlay reveal        | 18         | 3     | MVP                    |
| 9   | Project content reveal        | 17         | 3     | MVP                    |
| 10  | Scroll-driven text opacity    | 20         | 3     | MVP                    |
| 11  | Structure node hover          | 28         | 3     | MVP                    |
| 12  | Structure adaptive preview    | 29         | 3     | MVP                    |
| 13  | Structure preview enter       | 30         | 2     | MVP                    |
| 14  | Structure preview change      | 31         | 2     | MVP                    |
| 15  | Structure preview exit        | 32         | 2     | MVP                    |
| 16  | FAQ expand/collapse           | 34         | 2     | TBD (jika FAQ ada)     |
| 17  | Admin drawer (mobile)         | 40         | 2     | MVP                    |
| 18  | Admin modal (konfirmasi)      | 41         | 2     | MVP jika modal dipakai |
| 19  | Form feedback (error/success) | 38, 39, 43 | 1     | MVP                    |
| 20  | Button loading                | 37         | 1     | MVP                    |
| 21  | RAG chatbot open/close        | 44         | 2     | Fase RAG               |
| 22  | RAG loading/message           | 45         | 1     | Fase RAG               |
| 23  | Reduced motion behavior       | 46         | -     | MVP                    |

Section reveal (24), stagger (25), page transition (26), image loading (36) bersifat opsional/TBD dan tidak termasuk daftar wajib.

## 56. Animation Intensity

| Level | Arti                         |
| ----- | ---------------------------- |
| 0     | Static                       |
| 1     | Micro interaction            |
| 2     | Normal interaction           |
| 3     | Important visual interaction |

Level 3 hanya dipakai pada hero, project card, scroll storytelling, dan structure. Website secara keseluruhan tetap restrained.

## 57. WHAT vs HOW

- `02-desain.md` (WHAT): elemen mana yang punya interaksi, tujuan visual, behavior yang diinginkan.
- `06-animation.md` (HOW): trigger, timing, easing, arah, perilaku responsive, reduced motion.

Jika terjadi konflik, jangan mengubah desain secara diam-diam; tandai dan minta keputusan.

Catatan **[REVIEW]** konsistensi dengan `02-desain.md`: tidak ditemukan konflik. Beberapa nilai di `02-desain.md` masih TBD (palette), sehingga warna animasi mengikuti saat palette ditentukan.

## 58. AI Agent Rules

Agent wajib:

1. membaca `02-desain.md`;
2. membaca `06-animation.md`;
3. tidak menambahkan animasi baru tanpa alasan;
4. tidak mengubah timing tanpa alasan;
5. tidak mengganti motion personality;
6. tidak memakai animasi acak;
7. tidak menambahkan library animation tanpa approval;
8. menjaga accessibility;
9. menjaga performance;
10. menguji desktop dan mobile.

## 59. Anti-AI-Slop Motion Check

Sebelum animasi dianggap selesai, periksa:

- Apakah semua section dianimasikan? Jika ya, kemungkinan terlalu banyak.
- Apakah animasi membantu pengguna?
- Apakah terasa seperti template AI?
- Apakah ada bounce berlebihan?
- Apakah ada terlalu banyak scale?
- Apakah ada terlalu banyak fade?
- Apakah ada animasi tanpa tujuan?
- Apakah pengguna harus menunggu animasi?

Jika ya pada salah satunya, sederhanakan.

## 60. Performance Check

- Tidak ada animasi yang menyebabkan lag.
- Scroll tetap smooth.
- Tidak ada layout shift.
- Tidak ada animasi DOM berlebihan.
- Animasi gambar tetap ringan.
- Mobile tetap usable.

## 61. Responsive Check

- Hover desktop bekerja.
- Mobile punya interaksi alternatif.
- Touch tidak bergantung pada hover.
- Animasi tidak mengganggu layout mobile.
- Motion dapat disederhanakan di mobile.

## 62. Accessibility Check

- Reduced motion tersedia.
- Keyboard interaction tersedia.
- Focus state jelas.
- Hover bukan satu-satunya cara memperoleh informasi.
- Konten tetap tersedia tanpa animasi.

## 63. Definition of Done

Animasi selesai jika:

- sesuai `02-desain.md`;
- sesuai `06-animation.md`;
- smooth dan tidak berlebihan;
- responsive dan accessible;
- tidak menyebabkan layout shift;
- performa baik;
- tidak mengganggu konten;
- tidak menambah dependency yang tidak perlu.

## 64. Final Review

Hasil pemeriksaan:

- Animasi tanpa tujuan jelas: tidak ada di inventory wajib. Section reveal, stagger, page transition, dan image loading ditandai opsional/TBD.
- Animasi yang belum disepakati: jarak translate, rentang scroll, dan warna hero ditandai TBD atau rekomendasi.
- Animasi kompleks atau butuh dependency baru: tidak ada yang wajib.
- Potensi masalah performa: perubahan ruang pada structure adaptive split dan tinggi panel FAQ (dicatat, ada alternatif).

Motion keseluruhan: clean + smooth + premium + restrained.

## 65. Final Principle

> Animasi bukan tujuan utama website. Animasi digunakan untuk memperjelas interaksi, memperkuat hierarchy, memberikan feedback, dan membangun karakter visual TRM tanpa mengorbankan usability, accessibility, performance, dan kesederhanaan.

Jika sebuah animasi tidak memberikan manfaat yang jelas: **JANGAN BUAT.**

---

## Lampiran: Daftar TBD

- Palette warna hero dan aturan pemilihan warna.
- Perilaku tap hero di mobile.
- Jenis dan warna overlay project card; state default project card di mobile.
- Jarak translate content reveal; zoom final (rentang 1.03–1.05).
- Daftar section yang memakai scroll-driven text; rentang progress; pendekatan JS atau CSS scroll-driven; apakah dipakai di mobile; apakah ada sticky section.
- Section reveal, stagger, page transition, image loading (default: tidak dibuat).
- Rasio split structure; jeda penutupan preview; alternatif jika perubahan ruang menyebabkan lag.
- Pola structure mobile.
- Keberadaan FAQ.
- Bentuk dan durasi tampil feedback CRUD.
- Browser target dan kemampuan bawaan stack untuk animasi (menunggu `03-arsitektur.md`).
