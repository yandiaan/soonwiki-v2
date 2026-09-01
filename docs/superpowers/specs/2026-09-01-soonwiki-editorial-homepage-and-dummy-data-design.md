# SoonWiki Editorial Homepage & Comprehensive Dummy Data Design Spec

**Date:** 2026-09-01  
**Status:** Approved  
**Scope:** Homepage UI richness & complexity enhancement, server repository query enhancements, and a rich local development seed dataset.

---

## 1. Goal & Context

SoonWiki is a story-first, mobile-first alumni archive designed as a *Public Community Gallery*. While the core data layer and basic page shells exist, the current homepage is too sparse when unpopulated, and even with minimal data, it lacks the editorial pacing, storytelling depth, and visual variety worthy of an inspiring community archive.

This specification outlines:
1. A **comprehensive, authentic synthetic dummy dataset** (6–8 distinct Soonies across different batches and diverse life paths) seeded directly in `supabase/seed.sql` and supported by demo image assets.
2. A **rich *Editorial Living Archive* homepage layout** featuring metric indicators, a featured story with turning-point pullquote, an asymmetric *Turning Point Mosaic* highlighting inflection points from multiple alumni, an interactive discovery rail, a proud moment showcase, and thematic pathways.

---

## 2. Comprehensive Dummy Dataset (Seed Data)

### 2.1 Alumni Personas (6–8 Profiles)

1. **Nadia Pramesti** (`nadia-pramesti`) — *Soon 2019*
   * **Role / Activity:** Tech Lead & Pengembang Komunitas Open Source
   * **Place:** Yayasan Teknologi Terbuka Indonesia (`yayasan-teknologi-terbuka`)
   * **Fields:** *Software*, *Pelayanan Publik*
   * **Narrative:** Beralih dari kenyamanan korporasi multinasional demi membangun infrastruktur digital untuk organisasi nirlaba dan komunitas pedesaan.
   * **Proud Moment:** Peluncuran platform data terbuka pedesaan yang diadopsi 40+ desa (2023).

2. **Rian Mahendra** (`rian-mahendra`) — *Soon 2018*
   * **Role / Activity:** Dokumenter & Jurnalis Visual Independen
   * **Place:** Studio Cerita Nusantara (`studio-cerita-nusantara`)
   * **Fields:** *Jurnalisme*, *Karya Kreatif*
   * **Narrative:** Memilih jalur independen untuk meliput isu krisis iklim dan kearifan lokal pesisir setelah 4 tahun bekerja di media berita arus utama.
   * **Proud Moment:** Penayangan film dokumenter "Napas Terakhir Pesisir" di festival film dokumenter internasional (2022).

3. **Siti Nurhaliza** (`siti-nurhaliza`) — *Soon 2021*
   * **Role / Activity:** Founder Inisiatif Pangan Berkelanjutan
   * **Place:** Kebun Kolektif Mandiri (`kebun-kolektif-mandiri`)
   * **Fields:** *Usaha Mandiri*, *Kerja Lapangan*
   * **Narrative:** Meninggalkan jalur kantor untuk mengelola rantai pasok pangan organik langsung dari petani lokal ke rumah tangga urban.
   * **Proud Moment:** Membangun jaringan distribusi langsung untuk 120 petani lokal tanpa perantara (2024).

4. **Bima Arya** (`bima-arya`) — *Soon 2020*
   * **Role / Activity:** Analis Kebijakan Transportasi Publik
   * **Place:** Dinas Perhubungan & Tata Kota (`dinas-perhubungan-tata-kota`)
   * **Fields:** *Pelayanan Publik*, *Riset & Analisis*
   * **Narrative:** Memperjuangkan integrasi tarif dan jalur ramah pejalan kaki di kota-kota sekunder.
   * **Proud Moment:** Penyusunan naskah kebijakan reformasi rute angkutan umum kota (2023).

5. **Farhan Akbar** (`farhan-akbar`) — *Soon 2022*
   * **Role / Activity:** Desainer Produk & Fasilitator Desain Aksesibel
   * **Place:** Kolektif Desain Inklusif (`kolektif-desain-inklusif`)
   * **Fields:** *Desain*, *Pendidikan*
   * **Narrative:** Berfokus pada aksesibilitas digital untuk penyandang disabilitas setelah menyadari minimnya aplikasi publik yang ramah pembaca layar.
   * **Proud Moment:** Modul panduan desain aksesibel yang diunduh oleh lebih dari 5.000 desainer di Indonesia (2023).

6. **Clarissa Utami** (`clarissa-utami`) — *Soon 2023*
   * **Role / Activity:** Penggerak Literasi & Penulis
   * **Place:** Rumah Baca Pesisir (`rumah-baca-pesisir`)
   * **Fields:** *Pendidikan*, *Karya Kreatif*
   * **Narrative:** Membuka ruang baca dan kelas kepenulisan kreatif gratis bagi anak-anak di pulau terluar.
   * **Proud Moment:** Pendirian 3 perpustakaan komunitas di pesisir barat dengan koleksi 10.000+ buku (2024).

---

## 3. Homepage Architecture & Editorial Composition

### 3.1 Flow of Sections

1. **`PublicHero.astro`**
   * Asymmetric portrait mosaic using published alumni photos.
   * Prominent headline: *"Banyak jalan dimulai dari SOON."*
   * Subtitle and primary CTAs (*"Jelajahi kisah"*, *"Tentang SoonWiki"*).
   * **Community Metric Ticker / Summary Badges:**
     * `X Kisah terbit` · `Y Bidang ditekuni` · `Z Angkatan Soonies`

2. **`PublicIntroduction.astro`** (`#tentang`)
   * Editorial statement: *"Arsip hidup, bukan direktori pekerjaan."*
   * Asymmetric 3-portrait composition highlighting recent journeys.

3. **`FeaturedJourney.astro`**
   * Spotlight on one richly documented Soonie profile.
   * Portrait, name, metadata badges (Angkatan, Bidang, Tempat).
   * Lead sentence and turning point summary.
   * Direct link to full profile.

4. **`TurningPointMosaic.astro` (New Component)**
   * Curated 3-column asymmetric grid spotlighting real turning-point quotes (*"Turning Point: Titik Balik Perjalanan"*).
   * Each card displays the quote in editorial serif/bold styling, the alumni name, batch, role, and a direct link to read the journey.

5. **`PossibilityContactSheet.astro`**
   * Fluid, swipeable horizontal rail powered by `StoryRail.svelte`.
   * Cards with photo, bold name, role, and batch badge.
   * Keyboard and touch accessible.

6. **`ProudMomentFrame.astro`**
   * Heroic visual frame celebrating a tangible achievement or project from the community.
   * Image with ambient gradient overlay, title, place/year caption, and external link / story link.

7. **`ExplorePathways.astro`**
   * Search input with instant keywords (*nama, bidang, tempat*).
   * Thematic discovery routes (*Bidang*, *Angkatan*, *Tempat*).
   * Profile card previews.
   * Secondary member login prompt.

---

## 4. Server Data Flow (`src/lib/server/public-repository.ts`)

`getHomeStoryData(context)` will be enriched to query and return:
```ts
export interface HomeStory {
  featured: ProfileDetail;
  contactSheet: ProfileCard[];
  turningPoints: Array<{
    profileId: string;
    profileName: string;
    profileSlug: string;
    batchYear: number;
    activity: string | null;
    placeName: string | null;
    quote: string;
  }>;
  proudMoment?: ProudMoment;
  stats: {
    totalStories: number;
    totalFields: number;
    totalBatches: number;
  };
}
```

---

## 5. Quality & Verification Contract

- Run `pnpm db:reset` to seed the database with all 6 authentic profiles, relationships, journeys, and proud moments.
- Zero errors on `pnpm lint`, `pnpm format:check`, `pnpm check`, and `pnpm build`.
- Responsive layout verification across mobile (`375px`), tablet (`768px`), and wide desktop (`1440px`).
