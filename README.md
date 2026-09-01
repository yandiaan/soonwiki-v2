# SoonWiki

SoonWiki adalah arsip hidup yang menampilkan banyak kemungkinan hidup setelah dan selama berada di
SOON, lewat perjalanan, turning point, dan hal yang dibanggakan oleh member serta alumni SOON.

Tagline: **"From Soon, Everywhere."**

## Stack

- **Frontend:** Astro SSR (adapter Node standalone) dengan Svelte untuk interactive islands.
- **Backend:** Supabase (PostgreSQL, Google OAuth, Storage, Row Level Security, database
  functions, dan satu Edge Function untuk redemption undangan). Tidak ada REST API terpisah, ORM,
  auth service, atau object-storage abstraction tambahan.
- **Gaya & motion:** Plain CSS (self-hosted Plus Jakarta Sans Variable), native View Transitions
  untuk transisi portrait-ke-profil, dan CSS scroll-snap untuk contact sheet.
- Repo ini **tidak memiliki** test runner, folder `tests/`, file `*.test.*`/`*.spec.*`, atau script
  `test:*` — sesuai keputusan produk. Kualitas dijaga lewat lint, type check, database lint, dan
  production build.

## Prasyarat

- Node.js `>=22.12.0` (gunakan `22.22.3` bila memungkinkan — lihat `.nvmrc`)
- pnpm `11.22.0`
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`pnpm add -D supabase` sudah termasuk di
  `devDependencies`, jalankan lewat `pnpm exec supabase ...`)
- Sebuah project Supabase Cloud (proyek ini **tidak** menggunakan Supabase lokal/Docker — semua
  migrasi dan Edge Function dijalankan langsung terhadap project cloud yang sudah di-link)

## Environment variables

Salin `.env.example` menjadi `.env.local` dan isi dengan nilai project Supabase kamu:

```bash
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
PUBLIC_SITE_URL=http://127.0.0.1:4321
```

`PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_PUBLISHABLE_KEY` **bukan rahasia** (didesain untuk
dipakai di browser). Kunci `service_role` dan secret Google OAuth **tidak pernah** masuk ke file
`.env*` Astro — keduanya hanya hidup di:

- Dashboard Supabase → **Authentication → Providers → Google** (client ID & secret Google OAuth).
- Secret Edge Function `SITE_URL` (lihat bagian Edge Function di bawah).

## Setup Google OAuth

1. Buat OAuth Client (tipe Web application) di Google Cloud Console.
2. Tambahkan Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Masukkan Client ID & Client Secret ke Supabase Dashboard → Authentication → Providers → Google.
4. Di Supabase Dashboard → Authentication → URL Configuration, set **Site URL** ke
   `http://127.0.0.1:4321` (dev) atau domain produksi, dan tambahkan
   `<site-url>/auth/callback` ke **Redirect URLs**.
5. Setting Auth yang direkomendasikan untuk proyek ini:
   - **Allow new users to sign up** → ON (wajib, supaya identitas Google baru bisa dibuat).
   - **Allow manual linking** → OFF.
   - **Allow anonymous sign-ins** → OFF.
   - **Skip nonce checks** (di provider Google) → OFF (alur kita full redirect, bukan native SDK).
   - **Allow users without an email** (di provider Google) → OFF.

## Instalasi & menautkan Supabase CLI

```bash
pnpm install --frozen-lockfile
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
```

## Migrasi database

```bash
pnpm db:push    # supabase db push --linked
pnpm db:lint    # supabase db lint --linked --level warning
pnpm db:types   # regenerasi src/types/database.ts
```

Migrasi baru ditambahkan sebagai file SQL berurutan di `supabase/migrations/`. Jangan mengedit
migrasi yang sudah dijalankan di production; tambahkan migrasi baru.

## Edge Function `invitations`

Menangani redemption undangan (aksi `start`/`complete`) dan pembuatan/pencabutan undangan oleh
admin (aksi `create`/`revoke`).

```bash
pnpm exec supabase functions deploy invitations --use-api
pnpm exec supabase secrets set SITE_URL=https://domain-produksi-kamu
```

> Catatan Windows: `supabase functions deploy` mode Docker biasa bisa gagal dengan error
> `invalid volume specification` karena bug translasi path drive letter di beberapa setup Docker
> Desktop. Gunakan selalu flag `--use-api` untuk bundling sisi server tanpa Docker.

## Menjalankan secara lokal

```bash
pnpm dev
```

Astro dev server berjalan di `http://127.0.0.1:4321`.

## Membuat admin pertama

Tidak ada flow "claim admin" otomatis di UI (disengaja, mencegah eskalasi privilege). Untuk
membuat admin pertama:

1. Minta calon admin masuk sekali lewat `/login` (akan mendarat di `/join-required` karena belum
   punya baris `members`, tapi identitas `auth.users` sudah terbuat).
2. Jalankan SQL berikut sekali lewat `pnpm exec supabase db query "..." --linked` atau SQL editor
   dashboard:

   ```sql
   insert into members (user_id, role, status)
   values ('<user-id-dari-auth.users>', 'admin', 'active')
   on conflict (user_id) do update set role = 'admin', status = 'active';
   ```

3. Admin tersebut sekarang bisa membuat tautan undangan lewat `/admin/invitations`.

## Perintah kualitas (provider-neutral)

Repo ini tidak memiliki file CI karena belum ada remote/provider CI yang dipilih. Jalankan urutan
berikut sebelum setiap commit atau saat menyiapkan pipeline CI di masa depan:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm check
pnpm db:lint
pnpm build
```

Semua perintah di atas harus keluar dengan kode `0`. Repo ini **sengaja tidak memiliki** kode
test otomatis (unit/integration/E2E), test runner, folder `tests/`, atau script `test:*`.

## Struktur proyek singkat

```text
src/
  components/astro/   Komponen SSR statis (portrait frame, metadata strip, dll.)
  components/svelte/   Island interaktif (editor profil, admin, story rail, dll.)
  layouts/             BaseLayout.astro (shell halaman + kontrak arah desain)
  lib/browser/         Helper sisi klien (kompresi gambar, draft lokal, dll.)
  lib/server/          Repository & sesi sisi server (bisa dipakai dari klien juga)
  lib/shared/          Skema Zod, model tampilan, path helper
  pages/               Rute Astro (public, /me, /admin, /auth)
supabase/
  migrations/          Migrasi SQL berurutan
  functions/invitations/ Edge Function redemption & manajemen undangan
```
