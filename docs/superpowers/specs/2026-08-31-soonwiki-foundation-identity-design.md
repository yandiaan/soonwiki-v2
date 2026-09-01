# SoonWiki Foundation + Identity Design

> **SUPERSEDED — 1 September 2026.** Jangan implementasikan dokumen ini. Arsitektur Express, Drizzle, Better Auth, S3, email magic link, dan automated testing telah digantikan oleh `docs/superpowers/specs/2026-09-01-soonwiki-supabase-story-first-design.md`.

Tanggal: 31 Agustus 2026  
Status: Menunggu review pengguna  
Scope: Milestone 1 — Foundation + Identity

## 1. Tujuan

Milestone ini membangun fondasi teknis SoonWiki dan satu alur identity yang utuh:

> shared invitation link → verifikasi email → session member → membuat profil dasar → profil langsung public.

Hasil milestone harus cukup stabil untuk menjadi dasar Public Discovery dan Journey + Trust tanpa mengganti runtime, auth model, ownership model, atau database utama.

## 2. Ruang Lingkup

### Termasuk

- Scaffold satu aplikasi Node.js dengan Astro SSR, Svelte islands, dan Express 5.
- TypeScript strict, environment validation, migration, lint, typecheck, test, dan build scripts.
- PostgreSQL + Drizzle.
- Better Auth dengan email magic link.
- Shared invitation link yang reusable, revocable, dan tidak memiliki expiry atau maximum usage pada MVP.
- Verifikasi email wajib untuk setiap redemption.
- Satu account member maksimal memiliki satu person profile.
- Create dan edit basic profile milik sendiri.
- Minimal public person profile untuk membuktikan instant publishing.
- Duplicate warning berdasarkan normalized name + batch year.
- CLI admin untuk membuat, melihat, dan mencabut shared invitation link.
- Development mail sink agar magic-link flow dapat diuji lokal tanpa provider email produksi.
- Production mail adapter berbasis Resend.
- Baseline observability, security headers, rate limiting, error contract, dan audit event penting.

### Tidak termasuk

- Pre-populated profiles dan claim-profile flow.
- People directory, homepage discovery sections, company page, expertise page, dan batch page.
- Career, expertise assignment, achievements, reports, dan admin dashboard web.
- Profile photo dan achievement image upload; basic profile menggunakan initials fallback.
- Dedicated search engine, Redis, queue, microservice, atau event bus.
- Native application dan public third-party API.

## 3. Keputusan Utama

- Runtime adalah satu Node process dan satu origin.
- Express memiliki `/api/*` dan `/api/auth/*`; Astro Node middleware menangani route lain.
- Astro pages dan Express routes menggunakan domain services yang sama. Astro tidak melakukan loopback HTTP ke Express saat SSR.
- Svelte hanya di-hydrate untuk interaksi yang membutuhkan state browser atau motion.
- Semua business rule berada di service layer, bukan di Astro page, Svelte component, atau Express router.
- REST response tidak dibungkus ketika sukses kecuali endpoint membutuhkan metadata; semua error memakai envelope yang konsisten.
- Invitation token dan magic-link attempt token hanya disimpan dalam bentuk hash.

## 4. Runtime dan Struktur Proyek

```text
SoonWiki/
├── src/
│   ├── pages/                    Astro routes
│   ├── layouts/                  document shell dan metadata
│   ├── components/
│   │   ├── astro/                static/SSR components
│   │   └── svelte/               hydrated interactive islands
│   ├── styles/                   tokens, global styles, motion primitives
│   └── server/
│       ├── app.ts                Express composition root
│       ├── env.ts                validated environment
│       ├── auth/                 Better Auth configuration
│       ├── db/                   Drizzle client, schema, migrations
│       ├── http/                 routers, middleware, error mapping
│       ├── modules/
│       │   ├── invitations/
│       │   └── profiles/
│       └── shared/               clock, hashing, mail, audit interfaces
├── scripts/                      invite administration CLI
├── tests/
│   ├── integration/
│   └── e2e/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Satu root package menggunakan pnpm. Tidak ada workspace package atau shared package sebelum kebutuhan nyata muncul.

## 5. Request Composition

Urutan middleware Express:

1. request ID dan structured logging;
2. security headers;
3. Better Auth handler pada `/api/auth/*`;
4. parsers dan request size limit;
5. rate limiter untuk endpoint sensitif;
6. API routers pada `/api/*`;
7. Astro middleware sebagai fallback;
8. centralized error mapper.

Better Auth dipasang sebelum `express.json()` agar request stream auth tidak dikonsumsi lebih dahulu.

## 6. Shared Invitation Flow

### Membuat invitation

Admin menjalankan:

```text
pnpm invite:create --label "Soonies Launch"
```

Command menghasilkan random token minimal 32 bytes, menyimpan SHA-256 hash-nya, dan mencetak URL lengkap satu kali. Raw token tidak disimpan di database dan tidak ditulis ke application log.

Admin dapat melihat metadata atau mencabut link:

```text
pnpm invite:list
pnpm invite:revoke --id <invitation-id>
```

Membuat link baru setelah revoke merupakan mekanisme rotate.

### Redemption

1. Member membuka `/join/:token`.
2. Server meng-hash token dan memastikan invitation aktif.
3. Member memasukkan email.
4. `POST /api/invitations/redeem/start` melakukan normalisasi email, rate-limit check, dan membuat invitation attempt berumur 30 menit.
5. Sistem mengirim magic link dengan opaque attempt token, bukan shared invitation token.
6. Better Auth memverifikasi magic link dan membuat atau membuka session.
7. Completion handler mencocokkan email session dengan attempt, lalu dalam satu transaksi:
   - mengonsumsi attempt;
   - membuat redemption record;
   - memastikan user memiliki role `member`;
   - menolak redemption kedua untuk user yang sama.
8. Member diarahkan ke `/me/edit`.

Shared link dapat digunakan kembali oleh orang lain selama belum dicabut. Attempt bersifat one-time dan memiliki expiry walaupun shared link tidak memiliki expiry.

### Link bocor atau dicabut

- Invitation yang dicabut tidak dapat memulai attempt baru.
- Attempt yang belum dikonsumsi ikut menjadi invalid jika invitation induknya dicabut.
- Session member yang sudah berhasil redeem tidak dicabut otomatis; revocation menghentikan registrasi baru, bukan menonaktifkan anggota lama.

## 7. Profile Flow

Setelah login, member yang belum memiliki profile melihat editor dasar:

- full name — required;
- batch/joined year — required;
- current role — optional;
- current company text — optional pada milestone ini;
- bio — optional, maksimum 500 karakter;
- location — optional;
- LinkedIn, Instagram, dan personal website — optional.

Saat save pertama:

1. payload divalidasi;
2. sistem mencari kandidat duplicate berdasarkan normalized name + batch year;
3. jika ditemukan, UI menampilkan warning dan daftar kandidat;
4. member dapat kembali mengoreksi data atau menyatakan bahwa kandidat tersebut bukan dirinya;
5. konfirmasi kedua membuat profile dengan `owner_id = session.user.id`;
6. slug dibuat dari nama dan diberi suffix stabil bila collision;
7. profile langsung tersedia pada `/people/:slug`.

Duplicate warning tidak membuat ownership claim dan tidak menahan publikasi setelah member mengonfirmasi.

Update profile wajib melalui ownership guard di service layer. Admin override disiapkan pada authorization policy, tetapi UI admin bukan bagian milestone ini.

## 8. Data Model Milestone 1

### Auth-owned tables

Better Auth memiliki tabel user, session, account, dan verification. Extension user menambahkan role `pending | member | admin`. User yang baru memverifikasi magic link memiliki role `pending`; invitation completion mengubahnya menjadi `member`. Seluruh write authorization hanya menerima `member` atau `admin`.

### invitation_links

```text
id uuid primary key
label varchar(120)
token_hash char(64) unique
created_by uuid
created_at timestamptz
revoked_at timestamptz nullable
```

Tidak ada `expires_at` atau `max_uses` pada MVP.

### invitation_attempts

```text
id uuid primary key
invitation_link_id uuid foreign key
email_normalized varchar(320)
attempt_token_hash char(64) unique
expires_at timestamptz
consumed_at timestamptz nullable
created_at timestamptz
```

### invitation_redemptions

```text
id uuid primary key
invitation_link_id uuid foreign key
user_id uuid unique foreign key
email_snapshot varchar(320)
redeemed_at timestamptz
```

### people

```text
id uuid primary key
owner_id uuid unique foreign key
name varchar(160)
name_normalized varchar(160)
slug varchar(180) unique
batch_year smallint
bio varchar(500) nullable
location varchar(120) nullable
current_role varchar(160) nullable
current_company_text varchar(160) nullable
linkedin_url text nullable
instagram_url text nullable
website_url text nullable
created_at timestamptz
updated_at timestamptz
```

`current_company_text` sengaja bersifat sementara untuk basic profile. Public Discovery menggantinya melalui relasi Career → Company dan menyediakan migration yang mempertahankan nilai ini sebagai initial current career record.

### audit_events

```text
id uuid primary key
actor_user_id uuid nullable
event_type varchar(80)
subject_type varchar(80)
subject_id uuid nullable
metadata jsonb
created_at timestamptz
```

Audit minimum: invitation created/revoked/redeemed, profile created, dan profile updated. Metadata tidak menyimpan raw invitation token atau magic link.

## 9. HTTP Contract

```text
POST  /api/invitations/redeem/start
GET   /api/invitations/redeem/complete
POST  /api/auth/login/magic-link
GET   /api/me
POST  /api/me/profile
PATCH /api/me/profile
GET   /api/people/:slug
```

Public Astro route `/people/:slug` memanggil profile query service langsung saat SSR. Endpoint public tetap tersedia agar Svelte islands dan fase berikutnya memakai contract yang sama.

### Error envelope

```json
{
  "error": {
    "code": "INVITATION_REVOKED",
    "message": "Tautan undangan ini sudah tidak aktif.",
    "fields": {},
    "details": {}
  },
  "requestId": "..."
}
```

`fields` hanya hadir untuk validation error. `details` hanya hadir untuk conflict yang membutuhkan structured follow-up, seperti safe duplicate profile candidates. Pesan UI utama berbahasa Indonesia; code tetap stabil dan berbahasa Inggris untuk log serta test.

Kode penting:

- `AUTH_REQUIRED`
- `FORBIDDEN`
- `INVITATION_INVALID`
- `INVITATION_REVOKED`
- `INVITATION_ATTEMPT_EXPIRED`
- `INVITATION_EMAIL_MISMATCH`
- `INVITATION_ALREADY_REDEEMED`
- `PROFILE_ALREADY_EXISTS`
- `PROFILE_OWNERSHIP_REQUIRED`
- `DUPLICATE_CONFIRMATION_REQUIRED`
- `VALIDATION_ERROR`
- `RATE_LIMITED`

Error mapper tidak membocorkan keberadaan account untuk request magic link. Unexpected error menghasilkan pesan generik dan dicatat bersama request ID.

## 10. UI dan Visual Contract

Visual world berasal dari **Lembar Kontak Redaksi**, dengan comp **Filmstrip Cobalt** sebagai spatial contract:

```text
.impeccable/mocks/homepage-contact-sheet-b.png
```

Milestone ini belum membangun homepage penuh, tetapi join, check-email, dan profile editor mewarisi grammar berikut:

- Plus Jakarta Sans variable untuk seluruh UI;
- cobalt sebagai field identitas, bukan sekadar accent kecil;
- warm newsprint ground, near-black ink, dan signal orange untuk metadata/action;
- caption strips, registration marks, frame numbering, dan garis editorial sebagai component language;
- radius kecil atau tanpa radius; tidak memakai generic rounded-card system;
- Bahasa Indonesia sebagai bahasa utama;
- initials avatar saat foto belum tersedia.

Motion milestone ini dibatasi pada:

- page/section reveal yang tetap terlihat tanpa JavaScript;
- underline atau registration-line draw untuk feedback;
- shared feedback pada success state;
- Svelte spring untuk perubahan state yang memang membutuhkan interpolasi;
- reduced-motion mematikan transform besar dan menggantinya dengan state change langsung.

Filmstrip drag/snap penuh dibangun pada Public Discovery, bukan milestone ini.

## 11. Security dan Privacy

- Session memakai Secure, HttpOnly, SameSite cookies pada production.
- Mutating routes memverifikasi session dan origin.
- HTTP endpoint Better Auth untuk memulai magic-link signup diblokir dari akses langsung. Invitation dan returning-member login memanggil auth API secara internal setelah eligibility check.
- Invitation serta attempt token memiliki entropy tinggi dan disimpan sebagai hash.
- Rate limit diterapkan pada start-redemption per IP dan normalized email.
- URL sosial hanya menerima `https:`; bio dan text dirender sebagai escaped content.
- Login email tidak masuk ke public person response.
- Structured log melakukan redaction pada cookie, authorization header, raw token, dan magic-link URL.
- Ownership diperiksa dari database pada setiap write; UI state bukan authorization boundary.

## 12. Testing Strategy

### Unit

- token generation dan hashing;
- invitation active/revoked evaluation;
- attempt expiry dan one-time consumption;
- email normalization;
- duplicate candidate detection;
- slug generation dan collision suffix;
- ownership policy;
- URL dan profile validation.

### Integration dengan PostgreSQL nyata

- satu shared link digunakan dua email berbeda;
- email yang sama tidak dapat redeem dua kali;
- revoked link menolak attempt baru dan completion yang tertunda;
- email session yang berbeda tidak dapat mengonsumsi attempt;
- concurrent redemption tidak membuat dua records;
- satu user tidak dapat membuat dua profiles;
- member tidak dapat memperbarui profile user lain;
- create/update langsung terlihat pada public query.

### End-to-end

- admin CLI membuat invitation;
- member membuka link, menerima magic link melalui test mail sink, dan login;
- member membuat profile dasar;
- duplicate warning membutuhkan explicit confirmation;
- profile public dapat dibuka tanpa session;
- logout menghilangkan akses edit tetapi tidak memengaruhi halaman public;
- reduced-motion flow tetap usable.

## 13. Verification Gates

Milestone dianggap selesai ketika seluruh gate berikut lulus:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Build production harus dapat dijalankan sebagai satu Node process dengan environment minimum:

```text
DATABASE_URL
APP_BASE_URL
BETTER_AUTH_SECRET
RESEND_API_KEY
MAIL_FROM
```

## 14. Acceptance Criteria

- Admin dapat menghasilkan satu shared invitation link melalui CLI.
- Link yang sama dapat mendaftarkan banyak email terverifikasi.
- Link dapat dicabut dan diganti tanpa menghapus member yang sudah terdaftar.
- User tanpa invitation tidak dapat memperoleh member write access.
- Member hanya dapat memiliki dan mengubah satu profile miliknya sendiri.
- Duplicate name + batch memunculkan warning tetapi tidak membuat claim flow.
- Profile yang disimpan langsung dapat dilihat public melalui slug.
- Public response tidak mengekspos login email atau auth metadata.
- UI utama berbahasa Indonesia dan mewarisi Filmstrip Cobalt dengan Plus Jakarta Sans.
- Seluruh verification gate lulus pada environment bersih.

## 15. Follow-up Milestones

### Public Discovery

Homepage Filmstrip Cobalt, people directory, search/filter, company, expertise, batch, SEO, dan OpenGraph.

### Journey + Trust

Career, structured company relationship, expertise, achievements, image storage, report flow, dan admin dashboard minimum.

Migration dari `people.current_company_text` ke initial current Career harus mempertahankan teks yang sudah dimasukkan member.
