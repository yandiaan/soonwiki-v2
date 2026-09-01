# DESIGN.md

<!-- impeccable:design-schema 1 -->
<!-- Ditulis manual berdasarkan implementasi yang benar-benar terkirim (bukan niat awal), sebagai
     pengganti agent `impeccable-documenter` yang tidak tersedia di environment ini. Lihat
     `.impeccable/review/finish-report.md` untuk catatan substitusi lengkap. -->

## World

**Lembar Kontak Redaksi** — kontak sheet editorial dokumenter. Newsprint hangat, tinta near-black,
bidang cobalt yang berkomitmen, metadata signal orange, portrait dokumenter, frame kontak-sheet
bernomor, caption strip, garis tegas (hard rules), Plus Jakarta Sans.

## Palette

| Token      | Nilai                                             | Peran                                                |
| ---------- | ------------------------------------------------- | ---------------------------------------------------- |
| `--paper`  | `#f1ebdd`                                         | Dasar newsprint hangat, warna latar utama            |
| `--ink`    | `#161616`                                         | Teks utama, garis tegas, border                      |
| `--cobalt` | `#2045b8`                                         | Aksen commit (frame number, link penting, status)    |
| `--signal` | `#eb5428`                                         | Aksen sekunder (label kategori, peringatan, caption) |
| `--sage`   | `#9eae98`                                         | Placeholder portrait, aksen halus                    |
| `--line`   | `color-mix(in srgb, var(--ink) 72%, transparent)` | Garis redup                                          |

Strategi warna: **Committed** — cobalt dan signal masing-masing memegang peran semantik tetap
(cobalt = navigasi/tautan utama, signal = label kategori/aksen), bukan aksen acak.

## Type

- Wajah tunggal: **Plus Jakarta Sans Variable** (self-hosted lewat `@fontsource-variable`), dipakai
  untuk semua teks tanpa font sekunder.
- Skala display: `clamp(2rem, 8vw, 4rem)` (headline profil/artikel) hingga
  `clamp(3rem, 11vw, 8.5rem)` (headline beranda versi awal/fallback).
- Label kategori: huruf kecil 0.7–0.85rem, `font-weight: 800`, `letter-spacing: 0.06–0.1em`,
  huruf besar.

## Komponen inti

- **PortraitFrame** — bingkai portrait rasio 4:5, border 2px `--ink`, fallback inisial, nomor
  frame opsional, caption strip di bawah, dan `view-transition-name` inline untuk transisi
  bersama.
- **Contact sheet / StoryRail** — rel scroll horizontal native (`scroll-snap-type: x proximity`)
  dengan tombol prev/next Svelte sebagai peningkatan progresif; tanpa JS tetap bisa di-scroll
  manual.
- **StoryChapter** — blok narasi dengan `border-top: 2px solid var(--ink)` sebagai pemisah
  editorial, bukan kartu.
- Label kategori kecil ("caption strip") dipertahankan sebagai sistem wayfinding di halaman
  koleksi (field/batch/place) dan admin — lihat catatan di finish-report.md soal kapan ini
  dihapus (kalau isinya duplikat kata-demi-kata dengan heading) dan kapan dipertahankan (kalau
  berfungsi sebagai penanda kategori yang berbeda dari heading).

## Motion

- **Shared-element transition**: native browser Cross-Document View Transitions API
  (`<meta name="view-transition" content="same-origin">` + `view-transition-name` yang sama pada
  portrait contact-sheet dan portrait hero profil). Tidak memakai library `motion` JS maupun
  Astro ClientRouter. Browser yang belum mendukung (Firefox/Safari saat ini) otomatis fallback ke
  navigasi instan — sekaligus menjadi perilaku `prefers-reduced-motion` yang benar tanpa kode
  tambahan.
- `prefers-reduced-motion: reduce` menghapus semua durasi animasi/transisi (termasuk
  `::view-transition-group/old/new`) lewat satu blok global di `src/styles/global.css`.
- Interaksi rel contact-sheet pakai `scrollBy({ behavior: 'smooth' })`, otomatis berubah jadi
  `'auto'` saat reduced-motion aktif.

## Aksesibilitas

- Skip link, fokus-visible global (`box-shadow` cincin fokus dari token `--focus-ring`), target
  sentuh minimal 44px pada semua tombol/link interaktif utama.
- Halaman error (404/500) semantik dengan struktur heading yang jelas.
- Semua state simpan/unggah pada editor profil punya teks status eksplisit (`role="status"` /
  `role="alert"`), tidak mengandalkan warna saja.

## Batasan yang diketahui (jujur, bukan disembunyikan)

- Tata letak desktop lebar (>1024px) belum pernah diverifikasi lewat render sungguhan di sesi ini
  — lihat `.impeccable/review/finish-report.md`. CSS-nya (`max-width` + `margin-inline: auto`)
  dirancang untuk center dengan baik, tapi klaim ini belum dibuktikan visual.
- Dunia visual ini diwarisi dari sesi sebelum implementasi kode dimulai (`PRODUCT.md`); dokumen
  ini menjelaskan bagaimana dunia itu diwujudkan dalam kode yang benar-benar terkirim, bukan
  proses pemilihan arah itu sendiri.
