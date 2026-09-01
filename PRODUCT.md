# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Astro SSR dengan integrasi Svelte untuk interactive islands.
- Supabase menjadi backend tunggal untuk PostgreSQL, Google OAuth, Storage, Row Level Security, database functions, dan Edge Functions.
- Tidak ada custom Express server, ORM, auth service, object-storage abstraction, atau REST API layer terpisah.
- Package `motion` JavaScript, native View Transitions, dan CSS transitions digunakan untuk motion pada Astro + Svelte.
- Plus Jakarta Sans variable di-self-host.
- Target deployment frontend belum ditentukan; backend tetap dikelola penuh melalui Supabase free tier selama kapasitasnya mencukupi.

## Users

- Pengunjung publik yang ingin terinspirasi oleh beragam perjalanan member dan alumni Soon.
- Member dan alumni Soon yang ingin membagikan perjalanan, hal yang ditekuni, dan hal yang mereka banggakan.
- Admin komunitas yang menjaga kualitas data, menangani laporan, serta merapikan duplikasi field, place, atau profil.

## Product Purpose

SoonWiki adalah living alumni archive yang menunjukkan banyak kemungkinan hidup setelah dan selama berada di Soon. Produk ini berhasil ketika pengunjung merasa terdorong oleh perjalanan nyata alumni, dapat mengikuti hubungan natural antarcerita, dan alumni dapat memperbarui kisahnya sendiri dalam beberapa menit.

## Positioning

SoonWiki menggabungkan arsip perjalanan komunitas dengan discovery yang diisi langsung oleh para anggotanya. Fokusnya bukan status pekerjaan atau perusahaan, tetapi hubungan antara manusia, perubahan hidup, hal yang ditekuni, tempat mereka berproses, dan hal yang bermakna bagi mereka.

## Operating Context

- Public discovery banyak terjadi dari tautan yang dibuka melalui WhatsApp, Instagram, dan group chat.
- Pengunjung berpindah secara natural antara kisah personal, turning point, journey, field, batch, place, dan orang lain.
- Kontributor menggunakan alur singkat: login, edit, simpan, lalu perubahan langsung terbit.
- Informasi utama berupa profil, portrait, narrative prompts, journey entries, fields, proud moments, places, dan batch.

## Capabilities and Constraints

- Bahasa utama UI adalah Bahasa Indonesia. Istilah asing hanya digunakan ketika lebih natural atau merupakan nama resmi.
- Public browsing tidak membutuhkan login.
- Registrasi member menggunakan satu shared invitation link yang dapat dibagikan ke grup dan digunakan banyak orang.
- Invitation link hanya membuka hak membership; setiap pengguna tetap wajib menyelesaikan Google OAuth.
- Satu akun Google hanya dapat redeem satu kali, redemption dicatat untuk audit, dan admin dapat revoke atau rotate link.
- Shared invitation link MVP tidak memiliki batas penggunaan atau expiry otomatis.
- Satu akun member memiliki maksimal satu profil; admin dapat mengelola seluruh profil.
- MVP dimulai tanpa pre-populated member profiles dan tanpa claim-profile flow; setiap member membuat profil sendiri setelah registrasi.
- Similar name + batch hanya menghasilkan duplicate warning. Admin menangani duplicate atau ownership correction secara manual.
- Publishing bersifat instan tanpa moderation queue, dilindungi authentication, ownership, dan reporting.
- MVP menggunakan relational database dan pencarian database biasa; tidak membutuhkan graph database, vector database, microservices, event architecture, atau dedicated search engine.
- Prioritas perangkat adalah mobile lalu desktop.
- Email login, nomor telepon, dan metadata akun tidak dipublikasikan secara default.
- Homepage memimpin dengan inspirasi dan storytelling; search adalah utility sekunder di dalam Explore.
- Bahasa UI tidak menganggap perusahaan, jabatan white-collar, atau employment formal sebagai ukuran keberhasilan.
- Repository tidak memiliki unit, integration, atau E2E test code, test runner, maupun test scripts; quality gate menggunakan lint, typecheck, schema lint, build, dan manual review.
- Scope MVP dibatasi pada kemampuan memahami, menjelajahi, dan mendokumentasikan perjalanan Soonies.

## Brand Commitments

- Nama produk: SoonWiki.
- Tagline: “From Soon, Everywhere.”
- Typeface utama UI: Plus Jakarta Sans.
- Kepribadian: modern, hangat, community-driven, editorial, dan sedikit nostalgic.
- People-first dan proud without feeling corporate.
- Visual world: Lembar Kontak Redaksi dengan warm newsprint, near-black ink, cobalt, signal orange, documentary portrait, numbered frames, dan caption strips.
- Motion menjadi material pengalaman melalui shared-element transition, progressive reveal, dan tactile feedback; motion harus purposeful dan tidak mengganggu keterbacaan atau performa.

## Evidence on Hand

- Product requirements lengkap tersedia di `docs/PRD.md`.
- PRD mendefinisikan contoh konten, hierarchy homepage, data model awal, acceptance criteria, dan sepuluh layar utama MVP.
- Belum tersedia logo final, aset foto nyata, dataset Soonies, testimonial, atau bukti kuantitatif yang boleh digunakan. Materi tersebut tidak boleh direkayasa sebagai fakta.

## Product Principles

1. People first: manusia dan perjalanan mereka lebih penting daripada representasi database.
2. Proud, not corporate: achievement terasa personal dan layak dirayakan.
3. Inspiration first: produk membuka kemungkinan hidup melalui cerita sebelum menawarkan pencarian.
4. Low-friction contribution: member dapat memperbarui profil dalam beberapa menit.
5. Collective memory: produk terasa seperti arsip hidup komunitas, bukan directory kontak statis.

## Accessibility & Inclusion

Target standar aksesibilitas formal masih terbuka. Implementasi harus memiliki baseline keyboard navigation, focus state yang jelas, contrast yang memadai, semantic markup, dan alternatif reduced-motion bagi pengguna yang memintanya.
