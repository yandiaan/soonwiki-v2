# SoonWiki finish review

Tanggal: 1 September 2026
Reviewer: GitHub Copilot (self-review — lihat catatan substitusi di bawah)
Environment: dev build lokal terhadap project Supabase Cloud `gixwqgnsarwtwjlotaul`

## Catatan substitusi (wajib diungkap)

Alur resmi Impeccable Task 12 meminta dua sub-agent bernama eksplisit:
`impeccable-finish-reviewer` dan `impeccable-documenter`. Keduanya **tidak tersedia** di daftar
agent environment ini. Sesuai jalur fallback skill sendiri (`degraded/finish-reviewer.md`,
`degraded/documenter.md`), langkah ini digantikan dengan:

- **Review**: satu pass self-review langsung di thread ini terhadap direction contract
  (`src/layouts/BaseLayout.astro`), `craft-floor.md`, dan hasil detector mekanis.
- **Dokumentasi**: `DESIGN.md` ditulis manual berdasarkan implementasi yang benar-benar terkirim
  (bukan niat awal), bukan hasil generate otomatis dari agent documenter.

Tidak ada tool image-generation di environment ini juga (dikonfirmasi ulang di sesi sebelumnya),
jadi Task 6 sudah berjalan code-led (tanpa comp gambar) — finish review ini karenanya mengaudit
perilaku nyata terhadap kontrak arah tertulis, bukan perbandingan piksel terhadap comp.

## Bukti visual

- `.impeccable/review/mobile.png` — homepage, viewport diminta 430×932. **Catatan lingkungan**:
  browser terintegrasi harness ini merender pada `window.innerWidth` tetap ~550px terlepas dari
  `page.setViewportSize()` yang diminta (diverifikasi lewat `page.evaluate`), jadi capture ini
  representatif untuk mobile tapi tidak benar-benar 430px persis.
- `.impeccable/review/desktop.png` — homepage, viewport diminta 1440×1000. **Sama seperti di
  atas** — render sebenarnya tetap ~550px lebar, sehingga file ini pada praktiknya adalah capture
  lebar-sempit kedua, bukan bukti tata letak desktop yang valid. Ini keterbatasan tooling harness,
  bukan indikasi bug tata letak (CSS `.home { max-width: 40rem }` di-`margin-inline: auto`
  memang akan center-kan diri begitu viewport sungguhan >640px; itu tidak bisa diverifikasi
  langsung di sesi ini).
- `.impeccable/review/profile.png` — halaman profil publik dengan data uji terisi penuh.
- `.impeccable/review/explore.png` — halaman Jelajahi dengan hasil pencarian nyata.
- Halaman `/me/edit` (editor) tidak bisa di-capture: memerlukan sesi Google OAuth sungguhan yang
  tidak bisa diotomasi di harness ini tanpa kredensial pengguna.

Untuk menghasilkan bukti visual yang bermakna (bukan hanya empty state), satu profil data uji
sintetis diterbitkan sementara di bawah akun admin (`Nama Contoh (Data Uji)`, jelas dilabeli
sebagai data uji) — **dihapus setelah review ini selesai**; lihat bagian "Data uji" di bawah.

## Detector mekanis

```
node .../impeccable/scripts/detect.mjs --json src/layouts src/pages src/components src/styles
```

Hasil: `[]` — tidak ada temuan.

## Defect ditemukan & diperbaiki selama review ini

1. **CSP memblokir hidrasi Svelte island** — kebijakan awal `script-src 'self'` (tanpa
   `'unsafe-inline'`) memblokir inline bootstrap script yang dipakai Astro untuk hydration
   `client:*` directive. Diverifikasi lewat konsol browser terhadap build produksi: tanpa fix ini,
   **semua island Svelte gagal total ter-hydrate** (MobileNavigation, StoryRail, ProfileEditor,
   dll semuanya jadi statis/tidak interaktif). Diperbaiki di `src/middleware.ts` dengan menambah
   `'unsafe-inline'` pada `script-src`, didokumentasikan sebagai trade-off sengaja (tidak ada
   infrastruktur nonce CSP yang wired ke Astro dalam scope proyek ini).
2. **`ReportDialog` selalu terlihat inline, bukan tersembunyi sebagai modal** — CSS
   `.report-dialog { display: grid; }` menimpa default `dialog:not([open]) { display: none; }`
   milik browser, sehingga form laporan render sebagai blok biasa di setiap halaman profil,
   bukan modal tersembunyi. Diperbaiki dengan memindahkan `display: grid` ke selector
   `.report-dialog[open]`. Diverifikasi lewat `page.evaluate` (computed `display` sebelum/sesudah
   `showModal()`).
3. **Kicker duplikat tanpa nilai informasi** (pelanggaran craft-floor "no brief earns it back" untuk
   eyebrow di atas heading) — `JourneyChapterList` dan `ProudMomentGallery` menampilkan label
   frame-number yang isinya sama persis dengan heading di bawahnya ("PERJALANAN" / "Perjalanan",
   "HAL YANG DIBANGGAKAN" / "Hal yang dibanggakan"). Dihapus; heading saja yang tersisa. Nomor
   frame bermakna (`001`, `002`/`003`/`004` pada homepage) dipertahankan karena itu bagian dari
   material dunia visual "Lembar Kontak Redaksi" yang sudah disetujui (nomor kontak-sheet asli),
   bukan eyebrow generik.
4. **Border-left beraksen 2px pada item daftar** — `journey-list__items li` memakai
   `border-left: 2px solid var(--sage)`, melanggar batas craft-floor ("colored border-left...
   above 1px"). Diturunkan ke 1px.

## Craft-floor: item lain yang disengaja dipertahankan (bukan pelanggaran, dengan alasan)

- Label kecil huruf besar di atas heading tetap dipertahankan pada beberapa tempat lain
  (`ExplorePathways`, `RelatedJourneys`, halaman koleksi field/batch/place, halaman admin) karena
  teksnya **berbeda** dari heading (bukan duplikasi kata-demi-kata) dan berfungsi sebagai penanda
  kategori/wayfinding yang konsisten dengan sistem "caption strip" yang sudah menjadi bagian resmi
  dunia visual yang disetujui sebelum sesi ini (`PRODUCT.md` Brand Commitments: "numbered frames,
  caption strips"). Menghapus seluruhnya berarti membongkar sistem yang sudah disetujui, bukan
  memperbaiki cacat baru.
- Border 2px solid pada frame portrait/kartu (`PortraitFrame`, dll.) dipertahankan — ini garis
  tegas ("hard rules") yang menjadi material inti dunia visual, bukan "hard offset shadow" atau
  dekorasi acak yang dilarang craft-floor.

## Gate kualitas final

```
pnpm lint         -> 0
pnpm format:check -> 0
pnpm check        -> 0
pnpm db:lint      -> 0 (no schema errors)
pnpm build        -> 0
```

## Provenance raster

Tidak ada aset raster statis yang dikirim sebagai bagian dari desain (semua gambar adalah unggahan
pengguna dinamis lewat Storage, bukan aset desain yang di-generate/di-source). Langkah pemindai
provenance Impeccable tidak berlaku (N/A) untuk build ini.

## Verdict

**ship** (dengan 4 perbaikan di atas sudah diterapkan dan diverifikasi ulang lewat render nyata,
bukan asumsi). Batasan lingkungan (viewport desktop tidak bisa diuji sungguhan, editor tidak bisa
diuji tanpa sesi Google OAuth nyata) dicatat secara eksplisit, bukan disembunyikan.
