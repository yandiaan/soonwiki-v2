# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Astro SSR dengan integrasi Svelte untuk interactive islands.
- Express 5 + TypeScript ESM sebagai custom Node server dan REST API.
- Astro Node adapter dijalankan dalam middleware mode pada process dan origin Express yang sama.
- PostgreSQL + Drizzle untuk persistence, schema, dan migration.
- Better Auth dipasang pada Express untuk authentication dan session.
- S3-compatible object storage untuk profile photo dan achievement image.
- Svelte transitions/springs, CSS scroll-snap, dan CSS transitions untuk motion; tidak menggunakan animation framework besar pada MVP.
- Plus Jakarta Sans variable di-self-host.
- Target deployment belum ditentukan; aplikasi disiapkan sebagai satu Node service yang Docker-ready.

## Users

- Pengunjung publik yang ingin menemukan member dan alumni Soon berdasarkan nama, perusahaan, expertise, atau batch.
- Member dan alumni Soon yang ingin membuat serta memperbarui profil, perjalanan karier, dan achievement mereka.
- Admin komunitas yang menjaga kualitas data, menangani laporan, dan merapikan duplikasi expertise atau profil.

## Product Purpose

SoonWiki adalah public directory dan collective archive untuk member dan alumni Soon. Produk ini membantu orang menemukan Soonies serta memahami perjalanan karier dan hal-hal yang mereka banggakan. MVP berhasil ketika pengunjung dapat menemukan seorang Soonie melalui jalur eksplorasi yang natural, dan alumni dapat memperbarui profilnya sendiri dalam beberapa menit.

## Positioning

SoonWiki menggabungkan discovery directory dengan arsip perjalanan komunitas yang diisi langsung oleh para anggotanya. Fokusnya bukan sekadar data pekerjaan, tetapi hubungan antara orang, tempat mereka berkarya, expertise, batch, dan achievement yang bermakna bagi mereka.

## Operating Context

- Public discovery banyak terjadi dari tautan yang dibuka melalui WhatsApp, Instagram, dan group chat.
- Pengunjung berpindah secara natural antara person, company, expertise, batch, dan person lain.
- Kontributor menggunakan alur singkat: login, edit, simpan, lalu perubahan langsung terbit.
- Informasi utama berupa profil orang, foto, karier, expertise, achievement, company, dan batch.

## Capabilities and Constraints

- Bahasa utama UI adalah Bahasa Indonesia. Istilah asing hanya digunakan ketika lebih natural atau merupakan nama resmi.
- Public browsing tidak membutuhkan login.
- Registrasi member menggunakan satu shared invitation link yang dapat dibagikan ke grup dan digunakan banyak orang.
- Invitation link hanya membuka hak registrasi; setiap pengguna tetap wajib memverifikasi email.
- Satu email hanya dapat redeem satu kali, redemption dicatat untuk audit, dan admin dapat revoke atau rotate link.
- Shared invitation link MVP tidak memiliki batas penggunaan atau expiry otomatis.
- Satu akun member memiliki maksimal satu profil; admin dapat mengelola seluruh profil.
- MVP dimulai tanpa pre-populated member profiles dan tanpa claim-profile flow; setiap member membuat profil sendiri setelah registrasi.
- Similar name + batch hanya menghasilkan duplicate warning. Admin menangani duplicate atau ownership correction secara manual.
- Publishing bersifat instan tanpa moderation queue, dilindungi authentication, ownership, dan reporting.
- MVP menggunakan relational database dan pencarian database biasa; tidak membutuhkan graph database, vector database, microservices, event architecture, atau dedicated search engine.
- Prioritas perangkat adalah mobile lalu desktop.
- Email login, nomor telepon, dan metadata akun tidak dipublikasikan secara default.
- Scope MVP dibatasi pada kemampuan menemukan Soonies dan mendokumentasikan perjalanan mereka.

## Brand Commitments

- Nama produk: SoonWiki.
- Tagline: “From Soon, Everywhere.”
- Typeface utama UI: Plus Jakarta Sans.
- Kepribadian: modern, hangat, community-driven, editorial, dan sedikit nostalgic.
- People-first dan proud without feeling corporate.
- Motion menjadi bagian dari pengalaman, terutama untuk transisi, reveal, dan feedback interaksi; motion harus purposeful dan tidak mengganggu keterbacaan atau performa.

## Evidence on Hand

- Product requirements lengkap tersedia di `docs/PRD.md`.
- PRD mendefinisikan contoh konten, hierarchy homepage, data model awal, acceptance criteria, dan sepuluh layar utama MVP.
- Belum tersedia logo final, aset foto nyata, dataset Soonies, testimonial, atau bukti kuantitatif yang boleh digunakan. Materi tersebut tidak boleh direkayasa sebagai fakta.

## Product Principles

1. People first: manusia dan perjalanan mereka lebih penting daripada representasi database.
2. Proud, not corporate: achievement terasa personal dan layak dirayakan.
3. Easy to explore: setiap entitas membuka jalan natural menuju orang dan cerita lain.
4. Low-friction contribution: member dapat memperbarui profil dalam beberapa menit.
5. Collective memory: produk terasa seperti arsip hidup komunitas, bukan directory kontak statis.

## Accessibility & Inclusion

Target standar aksesibilitas formal masih terbuka. Implementasi harus memiliki baseline keyboard navigation, focus state yang jelas, contrast yang memadai, semantic markup, dan alternatif reduced-motion bagi pengguna yang memintanya.
