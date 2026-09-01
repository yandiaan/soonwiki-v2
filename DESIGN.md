# DESIGN.md

<!-- impeccable:design-schema 1 -->

## World

**Public Community Gallery**: SoonWiki tampil sebagai ruang publik untuk menemukan manusia,
perubahan hidup, karya, dan hal yang bermakna bagi komunitas SOON. Portrait dokumenter dan cerita
nyata menjadi material utama. Interface menjaga jarak agar manusia dan data yang dipublikasikan
tetap memimpin.

Homepage bukan dashboard, direktori pekerjaan, atau halaman akun. Browsing publik menjadi aksi
utama; login member selalu sekunder.

## Palette

| Token             | Nilai     | Peran                                      |
| ----------------- | --------- | ------------------------------------------ |
| `--canvas`        | `#f7f6f2` | Latar warm linen newsprint                 |
| `--surface`       | `#ffffff` | Permukaan dan input                        |
| `--surface-muted` | `#ecece4` | Bidang kontras penutup editorial           |
| `--ink`           | `#121514` | Teks dan bidang gelap                      |
| `--ink-soft`      | `#575e59` | Teks pendukung                             |
| `--accent`        | `#23376e` | Aksen architectural indigo (non-bootstrap) |
| `--accent-soft`   | `#edf1fa` | Aksen lembut pelapis porcelain             |
| `--signal`        | `#c84428` | Aksen hangat terracotta / vermilion        |
| `--line-soft`     | `#d8dbd3` | Hairline dan batas tenang                  |

Architectural indigo dan warm linen membentuk identitas visual editorial SoonWiki, menggantikan warna primer generik. Warna semantic tetap boleh digunakan pada error, warning, dan success di permukaan operasional.

## Type

- Plus Jakarta Sans Variable tetap menjadi keluarga utama dan di-self-host.
- Display memakai weight sedang, tracking rapat maksimal `-0.04em`, dan line-height `0.92-0.98`.
- Narrative lead memakai skala lebih kecil daripada positioning headline agar panjang data backend
  tidak merusak first viewport.
- Metadata memakai sentence case. Homepage tidak memakai uppercase eyebrow, nomor section, atau
  caption-strip dekoratif.

## Public Homepage

Urutan homepage:

1. Public hero yang selalu tampil, termasuk ketika backend belum memiliki profil terbit.
2. Penjelasan SoonWiki sebagai arsip hidup, bukan direktori pekerjaan.
3. Featured journey dari profil publik yang dipilih repository.
4. Public discovery gallery untuk profil lain.
5. Proud moment dari data profil.
6. Search dan jalur Explore yang dapat digunakan tanpa akun.

Data profil, portrait, narrative, proud moment, batch, tempat, dan jumlah publikasi tetap berasal
dari Supabase melalui `getHomeStoryData()`. Homepage tidak memiliki fixture atau fallback claim
yang menyamar sebagai fakta alumni.

## Components

- **PublicHero**: image-as-canvas dari portrait publik; fallback berupa bidang warna ketika belum ada
  data.
- **PublicIntroduction**: penjelasan produk dan tiga portrait crop dari backend.
- **FeaturedJourney**: portrait besar dan narrative panel gelap dengan CTA menuju profil publik.
- **PossibilityContactSheet**: rail touch/keyboard yang menampilkan manusia, bidang, dan batch.
- **ProudMomentFrame**: full-bleed image ketika tersedia, dark narrative surface ketika tidak ada
  gambar.
- **ExplorePathways**: public search, jalur bidang/angkatan/tempat, dan member login sebagai aksi
  sekunder.

## Motion

- Shared-element transition portrait ke halaman profil tetap menggunakan native View Transitions.
- Hover hanya mengangkat CTA utama secara halus.
- Rail menggunakan native scroll-snap dan smooth scrolling; reduced-motion beralih ke instant.
- Tidak ada entrance animation massal atau perpetual animation.

## Accessibility

- Skip link, semantic landmarks, heading hierarchy, keyboard rail, visible focus ring, dan minimum
  target 44px dipertahankan.
- Public search memiliki label programmatic dan submit button eksplisit.
- Portrait tanpa foto memiliki initials fallback.
- Reduced motion tidak menghilangkan konten atau feedback.

## Surface Boundary

Homepage, header, footer, dan mobile navigation sudah memakai public visual language baru. Explore,
profile, editor, dan admin masih dapat memakai beberapa primitive visual lama sampai masing-masing
permukaan memperoleh pass desain tersendiri.
