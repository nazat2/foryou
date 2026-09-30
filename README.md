# Untukmu — Spider-Man Edition 🕸️

Website satu halaman, full redesign tema Spider-Man: merah/biru/hitam,
panel foto ala komik, jaring & siluet laba-laba yang beneran ada
bentuknya (bukan bintik bulat kaya salju lagi), teks yang niat tapi
nggak lebay, dan lagu yang autoplay begitu halaman dibuka.

## v4 — rapiin UI/UX (mobile + desktop)

- Ritme spacing & lebar konten diseragamin; hero, kartu surat, galeri, penutup
  ngikutin satu sistem padding (`--pad-x`) biar rapi di HP sampai layar lebar.
- Mosaic hero pakai `aspect-ratio` (bukan tinggi vh) jadi foto nggak kepotong
  aneh di layar pendek/landscape.
- Layar "Buka" ditata ulang biar Spider-Man gantung nggak nabrak judul di HP.
- Galeri: tap/klik foto = perbesar (lightbox), geser kiri/kanan atau panah
  keyboard buat ganti foto, Esc/tap luar buat tutup.
- Player mengambang lebih ringkas di HP + nggak nutupin konten terakhir.
- Progress bar scroll tipis di atas, fokus keyboard jelas.
- Intro logo laba-laba diperhalus: logo digambar, terisi, lalu layar memudar (tanpa geser ke kanan), dan layar "Buka" muncul bertahap.
- Background jatuh sekarang emoji hati putih/merah & bunga (ganti daftarnya di `FALL_EMOJIS`, `js/main.js`).
- Semua teks ditulis ulang (campur Inggris & Indonesia, lebih personal + gombalan Spidey). Edit langsung di `index.html`.
- Section bunga sekarang transparan & nyatu sama background (tanpa kotak), teksnya diganti lebih personal.
- Semua polesan ada di blok "V4" paling bawah `css/style.css` & `js/main.js`.

**Catatan:** folder `images/beranda`, `images/gallery`, `images/music` di zip
ini kosong — copy foto kamu sendiri ke folder itu (nama file sama seperti sebelumnya).

## Update terbaru — bunga 3D diganti taman bunga mekar & galeri 8 foto

**Section "Mekar Buat Kamu"** sekarang pakai taman bunga dari project
`flowers-for-someone` (bunga putih bercahaya, rumput tumbuh, kunang-kunang,
petal beneran 3D pakai rotateX/rotateY). Ditaruh di folder `flower-embed/`
dan ditampilkan lewat `<iframe loading="lazy">` di `index.html`, jadi:
- animasi tumbuh mulai pas section-nya mau kelihatan (lazy-load)
- CSS-nya terisolasi, nggak bentrok sama style situs utama
- tetap offline, nggak ada library/CDN
- judul "I LOVE U" bawaan dibuang (situs sudah punya heading sendiri)
- ukuran responsif: kotak 4:5, max 520px, penuh lebar di HP

Kalau mau ganti isi bunganya, edit `flower-embed/index.html` & `flower-embed/css/style.css`.

**Galeri "Beberapa Momen"** isi 8 foto (`images/gallery/1.jpg`–`8.jpg`),
2 kolom di HP, 4 kolom di desktop.

## Update terbaru — loading intro laba-laba

Diambil dari template `spiderman-landing-page-main` yang kamu kirim:
begitu halaman dibuka, ada layar merah gradient dengan logo laba-laba
(vector) yang "gambar sendiri" (stroke jadi outline lalu keisi penuh),
lalu layar itu wipe ke kiri dan ilang, baru muncul layar "Untukmu / Buka"
seperti biasa. Total sekitar 2.5 detik, otomatis jalan sendiri, nggak
perlu tap apa-apa. Kalau device orangnya set "reduce motion", animasinya
otomatis dipercepat/disederhanain.

File yang kena ubah buat ini: `index.html` (section `#spider-loader`
paling atas), `css/style.css` (bagian "SPIDER LOADING INTRO"), dan
`js/main.js` (fungsi `initSpiderLoader`).

## Update terbaru — nambah foto ke-5 di galeri

Galeri sekarang isi 5 foto (`images/gallery/1.jpg`–`5.jpg`), sebelumnya
cuma 4. Foto ke-5 (meme before/after) ditaruh apa adanya di grid biar
dua sisi perbandingannya (asli & versi pecah) tetep kebaca jelas, jadi
baris terakhir cuma ada 1 foto sendirian &mdash; itu normal, bukan bug.

## Update terbaru — polesan tambahan (biar nggak polos)

- **Efek klik/tap** — tiap kali diketuk atau diklik di mana pun (kecuali
  tombol/link/slider), muncul percikan jaring kecil yang fade cepat.
  Otomatis dimatiin kalau device orangnya set "reduce motion".
- **Scrollbar tema web** — scrollbar browser diganti tipis, merah,
  bukan default abu-abu bawaan.
- **Tilt 3D di galeri** — foto di section "Beberapa Momen" sekarang
  miring ngikutin posisi kursor (desktop/mouse doang), berasa lebih
  hidup dibanding cuma naik pas hover.

(Section "Beberapa Alasan" dan "Masih Ada Cerita Lain" yang sempat
ditambahin sudah dihapus lagi sesuai request &mdash; sekarang halaman
cuma: loading intro → Buka → hero → surat → galeri → meme.)

## Yang baru dari versi sebelumnya

- **Tema total Spider-Man** — merah `#d21f2c`, biru jubah `#1c2b6b`,
  hitam pekat, aksen kuning spark tipis. Font judul `Anton` (tebal,
  poster-ish, berasa komik) dipasangkan `Plus Jakarta Sans` buat teks.
- **Semua asset yang kamu kirim udah dipasang**:
  - `spiderman-hanging.png` → nempel gantung di layar pembuka
  - `web-corner.png` → dekorasi jaring di pojok kiri-atas & kanan-bawah, fixed
  - `jaring.png` → tekstur jaring transparan di belakang judul hero
  - `meme-its-you.gif` → jadi section "Pengakuan resmi" yang lucu-lucu dikit
- **Partikel jatuh diganti total** — dulu cuma bintik bulat (kaya salju),
  sekarang siluet laba-laba mini + serpihan jaring kecil yang jatuh
  sambil muter, warnanya campur putih/merah/kuning tipis.
- **4 section + teks asli**: layar pembuka → hero foto (dengan judul &
  sub-judul) → "surat"/log pribadi (paragraf yang bisa kamu edit) →
  galeri foto → momen meme. Semua ada teksnya, nggak polos foto doang
  kayak sebelumnya.
- **Lagu autoplay** begitu tombol "Buka" ditekan (browser modern emang
  wajib ada 1 klik dulu sebelum audio boleh play — itu wajar, bukan bug),
  terus loop otomatis. Player mengambang tetap ada buat pause/seek.
- **Lebih responsif & smooth**: breakpoint khusus mobile kecil (≤560px),
  landscape HP, sampai desktop lebar. Grid galeri otomatis 2 kolom di HP,
  4 kolom di desktop. `prefers-reduced-motion` dihormati.

## Yang WAJIB kamu cek/ganti

1. **Teks di halaman "surat"** (section `#surat` di `index.html`, ada
   komentar `<!-- GANTI TEKS DI BAWAH INI SESUKA HATI, Zat -->`) — itu
   teks contoh yang aku tulis, ganti sesuai isi hati kamu sendiri.
2. **Judul & nama artis lagu** — di `js/main.js` baris paling atas:
   ```js
   const SONG_TITLE  = "come on come on";
   const SONG_ARTIST = "spidermine";
   ```
   Ganti sesuai lagu yang kamu pakai (file lagunya sendiri sudah aku
   taruh di `audio/song.mp3` dari file yang kamu upload).
3. **Foto** — masih pakai 8 foto lama yang sudah ada di project
   (`images/beranda/1-4.jpg`, `images/gallery/1-4.jpg`). Tinggal timpa
   file dengan nama yang sama kalau mau ganti foto.

## Struktur folder

```
spiderweb-site/
├── index.html
├── css/style.css
├── js/main.js
├── images/
│   ├── beranda/        1.jpg–4.jpg (foto hero)
│   ├── gallery/         1.jpg–4.jpg (foto galeri)
│   ├── music/            cover.jpg (sampul player)
│   └── spidey/             asset Spider-Man yang kamu kirim
└── audio/
    └── song.mp3            (lagu, dari file 1.mp3 yang kamu upload)
```

## Cara pakai

Buka `index.html` langsung di browser buat cek, atau upload seluruh
folder ini ke Vercel/GitHub Pages seperti biasa.
