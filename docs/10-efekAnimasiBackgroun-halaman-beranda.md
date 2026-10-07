# efek-animasi.md — Efek Titik Lonjong Bergelombang (Oval Dots Wave)

Dokumen ini hanya membahas **efek titik lonjong**: bentuk, sebaran, gerak, opacity, dan warnanya. Teks, layout, dan latar halaman **tidak** dibahas di sini. Efek digambar pada sebuah `<canvas>` dan bereaksi terhadap posisi kursor.

Referensi gaya: efek partikel di beranda Google Antigravity (hanya sebagai inspirasi, bukan salinan).

---

## 1. Ringkasan Efek

1. Permukaan canvas dipenuhi **titik-titik kecil** berbentuk elips pada grid selang-seling.
2. Di sekitar kursor, titik-titik **bergelombang**: gelombang merambat keluar dari kursor dan menggeser titik secara radial.
3. Titik **berubah dari bulat menjadi lonjong** saat puncak gelombang lewat, seolah lingkaran dimiringkan sehingga sisi panjangnya terlihat, lalu kembali bulat.
4. Sumbu panjang lonjong selalu **menghadap radial** (searah garis dari kursor ke titik).
5. Titik yang jauh dari kursor **kecil dan nyaris transparan** (≈ 5%).
6. Hanya sebagian titik yang tampil **menonjol**; sisanya redup.
7. Pusat gelombang **mengikuti kursor dengan lambat dan halus**, tidak melesat saat kursor digeser cepat.
8. Warna berupa gradasi melingkar di sekeliling kursor: biru → cyan → kuning → hitam kebiruan.

---

## 2. Bentuk Titik

Setiap titik digambar sebagai elips dengan dua semi-axis:

```
env = pengaruh kursor pada titik (0..1, lihat §4)
tilt = tingkat miring (0 = bulat, 1 = paling lonjong, lihat §5)

rs  = 0.8 + env * 0.8                                   // jari-jari dasar
wid = rs * (1 - tilt * 0.2)                              // semi-axis pendek
len = max(wid, rs * (1 + tilt * 1.5) - tilt * 1)         // semi-axis panjang
```

Elips dirotasi sebesar sudut radial `ang = atan2(dy, dx)` (dari kursor ke titik).

| Kondisi                                         | `env` | `tilt` | Ukuran (diameter)                     |
| ----------------------------------------------- | ----- | ------ | ------------------------------------- |
| Titik jauh                                      | ≈ 0   | 0      | ≈ 1,6 × 1,6 px (bulat kecil)          |
| Dekat kursor, fase rendah                       | ≈ 1   | ≈ 0    | ≈ 3,2 × 3,2 px (bulat)                |
| Dekat kursor, puncak gelombang (titik menonjol) | ≈ 1   | ≈ 1    | ≈ **6 × 2,6 px** (lonjong terpanjang) |

Catatan: lonjong sengaja **pendek**. Tidak boleh terlihat seperti garis atau goresan.

---

## 3. Sebaran Titik

- **Grid selang-seling**: baris ganjil digeser setengah `GAP`.
- `GAP = 32` px.
- **Jitter deterministik** ±6 px agar tidak kaku. Jangan memakai `Math.random()` supaya pola stabil saat resize.
- Tiap titik punya nilai tetap `k` (0..1) untuk memilih titik yang menonjol:

```
pick = (k > 0.6) ? 1 : 0.2
```

| Jenis titik           | Porsi | Perilaku                                   |
| --------------------- | ----- | ------------------------------------------ |
| Menonjol (`pick = 1`) | ± 40% | Bisa memanjang penuh dan tampil pekat      |
| Biasa (`pick = 0.2`)  | ± 60% | Tetap kecil dan redup, hanya ikut bergeser |

Hasilnya: titik lonjong yang menonjol sedikit dan berjarak lega, sisanya menjadi tekstur halus.

Pembuatan grid (jalankan ulang saat resize):

```
jx = (sin(x*12.9898 + y*78.233) * 43758.5453) % 1
jy = (sin(x*39.346  + y*11.135) * 24634.6345) % 1
px = x*GAP + (y % 2 ? GAP/2 : 0) + jx*6
py = y*GAP + jy*6
k  = abs((sin(x*7.13 + y*3.71) * 9301.7) % 1)
state awal tiap titik: { px, py, k, ox: 0, oy: 0, tl: 0 }
```

---

## 4. Pengaruh Kursor dan Gelombang

```
d   = jarak titik ke pusat gelombang (mx, my)
R   = max(300, min(W, H) * 0.62)               // jangkauan pengaruh
env = exp( -(d²) / (R² * 1.1) )                // 1 di kursor, mendekati 0 di kejauhan

amp = sin( d * 0.028 - t * 1.25 ) * env        // gelombang merambat keluar, -1..1
```

| Parameter           | Nilai                       | Arti                                |
| ------------------- | --------------------------- | ----------------------------------- |
| Kerapatan gelombang | `0.028`                     | Jarak antar puncak ≈ 224 px         |
| Kecepatan rambat    | `1.25` rad/detik            | Lambat dan halus; jangan dinaikkan  |
| Amplitudo geser     | `18` px                     | Titik bergeser radial hingga ±18 px |
| `R`                 | `max(300, min(W,H) * 0.62)` | Jangkauan pengaruh kursor           |

---

## 5. Perubahan Bulat → Lonjong dan Pergeseran

Target (dihitung per titik tiap frame):

```
tilt_target = ((amp + 1) / 2) * env * pick               // 0..1
offset_target = ( dx/d * amp * 18 , dy/d * amp * 18 )     // geser radial
```

- Puncak gelombang lewat → `tilt` naik → titik memanjang.
- Lembah lewat → `tilt` turun → titik kembali bulat.
- Titik bergeser menjauh/mendekat dari pusat mengikuti gelombang.

---

## 6. Smoothing (kunci rasa lambat dan smooth)

Dua lapis penghalusan, keduanya berbasis waktu sehingga sama di layar 60 Hz maupun 120 Hz:

```
dt = min(0.05, selisih waktu frame dalam detik)

// 1) Pusat gelombang mengejar kursor dengan lambat
ke = 1 - exp(-dt * 1.6)
mx += (tx - mx) * ke ;  my += (ty - my) * ke

// 2) Tiap titik mengejar targetnya dengan lembut (efek "tertinggal")
ks = 1 - exp(-dt * 5)
p.ox += (offset_target.x - p.ox) * ks
p.oy += (offset_target.y - p.oy) * ks
p.tl += (tilt_target     - p.tl) * ks
```

Efeknya: saat kursor digeser cepat, gelombang meluncur pelan ke posisi baru, dan bentuk lonjong berubah mengalir, tidak berkedip.

### Gerak otomatis (belum ada interaksi pointer, mis. di HP)

```
tx = W * (0.5  + 0.30 * sin(t * 0.3))
ty = H * (0.52 + 0.24 * sin(t * 0.4 + 1))
```

Setelah pointer pertama terdeteksi, gerak otomatis berhenti. Posisi awal pusat: `mx = tx = W*0.72`, `my = ty = H*0.55`.

---

## 7. Opacity

```
alpha = 0.05 + env * 0.9 * (0.35 + 0.65 * pick)
```

| Kondisi                      | Opacity                        |
| ---------------------------- | ------------------------------ |
| Titik jauh dari kursor       | **≈ 5%** (nyaris tak terlihat) |
| Dekat kursor, titik biasa    | hingga ≈ 48%                   |
| Dekat kursor, titik menonjol | hingga ≈ 95%                   |

---

## 8. Warna

### Palet

| Nama           | HEX       | RGB            |
| -------------- | --------- | -------------- |
| Biru           | `#3333FF` | `51, 51, 255`  |
| Cyan           | `#3DBEFF` | `61, 190, 255` |
| Kuning         | `#F2C81B` | `242, 200, 27` |
| Hitam kebiruan | `#1E1E30` | `30, 30, 48`   |

### Gradasi (melingkar, stop pertama = stop terakhir)

| Posisi | Warna          |
| ------ | -------------- |
| 0.00   | Biru           |
| 0.25   | Cyan           |
| 0.50   | Kuning         |
| 0.75   | Hitam kebiruan |
| 1.00   | Biru           |

Interpolasi **linear RGB** antar dua stop terdekat.

### Warna per titik

```
index = ( ( ang / (2π) + 0.5 ) + d * 0.0006 + t * 0.03 ) mod 1
```

- `ang / (2π) + 0.5`: warna berubah mengelilingi kursor seperti roda warna.
- `d * 0.0006`: sedikit pergeseran menurut jarak, membentuk spiral halus.
- `t * 0.03`: seluruh pola warna berputar sangat pelan.

Jangan menambah warna di luar palet ini. Untuk permukaan gelap, ganti stop hitam kebiruan dengan putih kebiruan `210, 220, 255` agar titik tidak hilang.

---

## 9. Kode Referensi (JS murni, siap dipindah ke framework apa pun)

```js
export function initOvalDots(canvas) {
  const ctx = canvas.getContext("2d");
  const GAP = 32;
  const STOPS = [
    [51, 51, 255],
    [61, 190, 255],
    [242, 200, 27],
    [30, 30, 48],
    [51, 51, 255],
  ];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W,
    H,
    dpr,
    P = [],
    mx = 0,
    my = 0,
    tx = 0,
    ty = 0;
  let hasPointer = false,
    visible = true,
    raf = 0;
  const t0 = performance.now();
  let last = t0;

  const color = (a) => {
    const f = a * (STOPS.length - 1);
    const i = Math.min(STOPS.length - 2, f | 0),
      k = f - i;
    const A = STOPS[i],
      B = STOPS[i + 1];
    return `rgb(${(A[0] + (B[0] - A[0]) * k) | 0},${(A[1] + (B[1] - A[1]) * k) | 0},${(A[2] + (B[2] - A[2]) * k) | 0})`;
  };

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    P = [];
    const cols = Math.ceil(W / GAP) + 1,
      rows = Math.ceil(H / GAP) + 1;
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const jx = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const jy = (Math.sin(x * 39.346 + y * 11.135) * 24634.6345) % 1;
        P.push({
          x: x * GAP + (y % 2 ? GAP / 2 : 0) + jx * 6,
          y: y * GAP + jy * 6,
          k: Math.abs((Math.sin(x * 7.13 + y * 3.71) * 9301.7) % 1),
          ox: 0,
          oy: 0,
          tl: 0,
        });
      }
    tx = mx = W * 0.72;
    ty = my = H * 0.55;
  }

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    hasPointer = true;
  };
  const onVis = () => {
    visible = !document.hidden;
  };

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (!hasPointer) {
      tx = W * (0.5 + 0.3 * Math.sin(t * 0.3));
      ty = H * (0.52 + 0.24 * Math.sin(t * 0.4 + 1));
    }
    const ke = 1 - Math.exp(-dt * 1.6);
    const ks = 1 - Math.exp(-dt * 5);
    mx += (tx - mx) * ke;
    my += (ty - my) * ke;

    ctx.clearRect(0, 0, W, H);
    const R = Math.max(300, Math.min(W, H) * 0.62);

    for (const p of P) {
      const dx = p.x - mx,
        dy = p.y - my;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const env = Math.exp(-(d * d) / (R * R * 1.1));
      const amp = Math.sin(d * 0.028 - t * (reduce ? 0 : 1.25)) * env;
      const ang = Math.atan2(dy, dx);
      const pick = p.k > 0.6 ? 1 : 0.2;

      p.ox += ((dx / d) * amp * 18 - p.ox) * ks;
      p.oy += ((dy / d) * amp * 18 - p.oy) * ks;
      p.tl += (((amp + 1) / 2) * env * pick - p.tl) * ks;

      const rs = 0.8 + env * 0.8;
      const wid = rs * (1 - p.tl * 0.2);
      const len = Math.max(wid, rs * (1 + p.tl * 1.5) - p.tl * 1);

      ctx.globalAlpha = 0.05 + env * 0.9 * (0.35 + 0.65 * pick);
      ctx.fillStyle = color(
        (ang / (Math.PI * 2) + 0.5 + d * 0.0006 + t * 0.03) % 1,
      );
      ctx.beginPath();
      ctx.ellipse(p.x + p.ox, p.y + p.oy, len, wid, ang, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  addEventListener("resize", resize);
  addEventListener("pointermove", onMove);
  document.addEventListener("visibilitychange", onVis);
  resize();
  raf = requestAnimationFrame(frame);

  return () => {
    // cleanup
    cancelAnimationFrame(raf);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onVis);
  };
}
```

Pemakaian: `const destroy = initOvalDots(document.querySelector("canvas"));` lalu panggil `destroy()` saat komponen dilepas (di React: `useEffect(() => initOvalDots(ref.current), [])`).

---

## 10. Aksesibilitas dan Performa

- `prefers-reduced-motion: reduce` → kecepatan rambat gelombang `0` (titik statis, tetap digambar).
- Canvas bersifat dekoratif: beri `aria-hidden="true"`.
- Satu loop `requestAnimationFrame`; tidak ada elemen DOM per titik. `devicePixelRatio` dibatasi maksimal 2.
- Jumlah titik ≈ `(W/32) * (H/32)` (±980 titik untuk 1440×1024). Untuk layar kecil atau perangkat lemah, naikkan `GAP` (36–40).
- Loop berhenti saat tab tidak aktif; semua listener dibersihkan saat unmount.

---

## 11. Kriteria Penerimaan

- [ ] Titik jauh berukuran ≈ 1,6 px dengan opacity ≈ 5%.
- [ ] Titik dekat kursor membesar, berubah dari bulat menjadi lonjong saat puncak gelombang lewat, lalu kembali bulat.
- [ ] Lonjong terpanjang ≈ 6 px, tanpa garis atau goresan panjang.
- [ ] Hanya sekitar 40% titik yang tampil menonjol.
- [ ] Sumbu panjang lonjong selalu menghadap kursor.
- [ ] Menggeser kursor cepat tidak membuat gelombang melesat; gerakan lambat dan mengalir.
- [ ] Warna mengelilingi kursor dari biru → cyan → kuning → hitam kebiruan, hanya memakai palet §8.
- [ ] Tanpa kursor, pusat gelombang bergerak sendiri.
- [ ] Reduced motion mematikan gerak gelombang; resize tidak menimbulkan glitch.

---

## 12. Panduan Penyesuaian Cepat

| Ingin                                       | Ubah                                |
| ------------------------------------------- | ----------------------------------- |
| Gelombang lebih kuat / halus                | amplitudo `18`                      |
| Jangkauan efek lebih luas / sempit          | `R` (`0.62`, `300`)                 |
| Gelombang lebih cepat / lambat              | `t * 1.25`                          |
| Gelombang lebih rapat / renggang            | `d * 0.028`                         |
| Lonjong lebih pendek / panjang              | `tilt * 1.5` dan pengurang `tl * 1` |
| Lebih sedikit / banyak titik menonjol       | ambang `k > 0.6`                    |
| Titik lebih berjarak / rapat                | `GAP` (32)                          |
| Titik jauh lebih terlihat / tersembunyi     | opacity dasar `0.05`                |
| Pusat lebih cepat / lambat mengikuti kursor | `dt * 1.6`                          |
| Titik lebih "tertinggal" / responsif        | `dt * 5` (turun = lebih tertinggal) |
| Ganti nuansa warna                          | `STOPS`                             |
