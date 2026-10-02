# Frontend Website Prodi TRM

Frontend publik dibangun dengan SvelteKit, JavaScript + JSDoc, dan CSS. Ikuti aturan visual di `../docs/02-desain.md` serta fitur di `../docs/05-fitur.md`.

## Menjalankan lokal

Jalankan dari folder `frontend`:

```powershell
npm install
npm run dev
```

Buka `http://localhost:5173`. Route publik: `/`, `/profil`, `/struktur`, `/berita`, `/karya`, dan `/akreditasi`.

## Pemeriksaan

```powershell
npm run check
npm run build
```

Berita, karya, data dosen, dan PDF akreditasi saat ini menampilkan empty state sampai API dan sumber kontennya tersedia. Tidak ada konten contoh resmi yang dibuat.
