# SoonWiki Supabase Story-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the SoonWiki MVP as a story-first, mobile-first alumni archive using Astro + Svelte and Supabase as the only backend platform.

**Architecture:** Astro SSR renders public stories and page shells, while bounded Svelte islands own gestures, editing, uploads, filters, and Motion choreography. Supabase owns Google OAuth, PostgreSQL, RLS, Storage, database functions, and the single invitation Edge Function; no parallel REST backend or ORM is introduced.

**Tech Stack:** Node.js `>=22.12.0`, pnpm `11`, Astro SSR with standalone Node adapter, Svelte, TypeScript strict, Motion JavaScript, Supabase Auth/Postgres/Storage/Edge Functions, plain CSS, Plus Jakarta Sans Variable, ESLint, Prettier.

**Spec:** `docs/superpowers/specs/2026-09-01-soonwiki-supabase-story-first-design.md`

## Global Constraints

- Supabase is the only backend platform; do not add Express, another API server, an ORM, Better Auth, S3 abstraction, background workers, Realtime, graph/vector databases, or a dedicated search service.
- Google is the only OAuth provider in the MVP.
- Shared invitation links are reusable by many people, revocable, rotatable, have no automatic expiry or use limit, and can be redeemed only once per Google account.
- An authenticated Supabase identity without an active `members` row has public-read access only.
- Public content is server-rendered and visible before Svelte hydration.
- Bahasa Indonesia is the primary UI language.
- Use inclusive copy: `Perjalanan`, `Peran atau kegiatan`, `Tempat, organisasi, atau usaha`, `Hal yang ditekuni`, and `Hal yang dibanggakan`.
- Never make a company, formal employer, or white-collar career field mandatory.
- Preserve the Lembar Kontak Redaksi world: warm newsprint, near-black ink, cobalt, signal orange, documentary portrait, numbered frames, caption strips, and Plus Jakarta Sans.
- Use Motion JavaScript for significant choreography and native CSS/View Transitions for lightweight transitions.
- Vertical scrolling remains native; horizontal gestures exist only on clearly bounded rails; all primary touch targets are at least `44px`.
- Honor `prefers-reduced-motion`; all content remains visible with sequencing and transforms removed.
- Do not add unit, integration, or E2E tests; do not install test runners; do not create `tests/`, `*.test.*`, `*.spec.*`, or `test:*` scripts.
- Verification uses lint, formatting check, Astro/Svelte/TypeScript check, Supabase database lint, production build, manual functional review, and bounded visual review.
- There is no Git remote or CI provider configured. Do not invent a provider-specific CI file; document the exact provider-neutral quality commands in `README.md`.
- Use Conventional Commits with sentence case after the colon and no co-author trailers.

## Official Documentation Anchors

- Astro installation and Node floor: `https://docs.astro.build/en/install-and-setup/`
- Astro standalone Node adapter: `https://docs.astro.build/en/guides/integrations-guide/node/`
- Astro Svelte integration: `https://docs.astro.build/en/guides/integrations-guide/svelte/`
- Supabase SSR with Astro: `https://supabase.com/docs/guides/auth/server-side/astro`
- Supabase Google OAuth: `https://supabase.com/docs/guides/auth/social-login/auth-google`
- Supabase RLS: `https://supabase.com/docs/guides/database/postgres/row-level-security`
- Supabase Edge Functions: `https://supabase.com/docs/guides/functions`
- Motion JavaScript: `https://motion.dev/docs/quick-start`

## Planned File Structure

```text
.
├── .env.example
├── .nvmrc
├── astro.config.mjs
├── eslint.config.js
├── package.json
├── pnpm-lock.yaml
├── prettier.config.mjs
├── README.md
├── tsconfig.json
├── supabase/
│   ├── config.toml
│   ├── functions/invitations/
│   │   ├── index.ts
│   │   ├── invitation-service.ts
│   │   └── types.ts
│   ├── migrations/
│   │   ├── 202609010001_core_schema.sql
│   │   ├── 202609010002_security_and_storage.sql
│   │   └── 202609010003_public_queries.sql
│   └── seed.sql
└── src/
    ├── components/
    │   ├── astro/
    │   └── svelte/
    ├── layouts/BaseLayout.astro
    ├── lib/
    │   ├── browser/
    │   ├── server/
    │   ├── shared/
    │   └── supabase/
    ├── pages/
    │   ├── admin/
    │   ├── auth/
    │   ├── batch/
    │   ├── explore/
    │   ├── field/
    │   ├── join/
    │   ├── me/
    │   ├── people/
    │   ├── place/
    │   └── index.astro
    ├── styles/
    └── types/database.ts
```

---

### Task 1: Scaffold the Astro + Svelte foundation

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `.nvmrc`
- Create: `.env.example`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `eslint.config.js`
- Create: `prettier.config.mjs`
- Create: `src/env.d.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/pages/index.astro`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `pnpm dev`, `pnpm lint`, `pnpm format:check`, `pnpm check`, `pnpm db:lint`, `pnpm db:types`, and `pnpm build` commands used by every later task.
- Produces: `BaseLayout` props `{ title: string; description: string; image?: string; canonical?: URL }`.
- Produces: global CSS tokens and focus/reduced-motion contracts inherited by every surface.

- [ ] **Step 1: Pin the runtime and create the package manifest**

Create `.nvmrc` containing `22.22.3`. Create `package.json` with this complete non-test manifest; the install commands below add dependency sections and update the lockfile:

```json
{
  "name": "soonwiki",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.22.0",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "node ./dist/server/entry.mjs",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "astro check",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:lint": "supabase db lint --local --level warning",
    "db:types": "supabase gen types typescript --local > src/types/database.ts"
  }
}
```

Install runtime packages:

```bash
pnpm add astro @astrojs/node @astrojs/svelte svelte motion @supabase/supabase-js @supabase/ssr zod @fontsource-variable/plus-jakarta-sans
```

Install development packages only:

```bash
pnpm add -D typescript @astrojs/check supabase eslint @eslint/js typescript-eslint eslint-plugin-astro eslint-plugin-svelte globals prettier prettier-plugin-astro prettier-plugin-svelte
```

Do not accept any scaffold option that installs a test runner.

- [ ] **Step 2: Configure Astro SSR and strict TypeScript**

Create `astro.config.mjs`:

```js
import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';
import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte()],
  security: { checkOrigin: true },
  vite: {
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    build: { sourcemap: true }
  }
});
```

Create `tsconfig.json` extending `astro/tsconfigs/strictest`, include `src`, `supabase/functions`, and `.astro/types.d.ts`, and define the `@/* -> src/*` alias in both TypeScript and Astro/Vite configuration.

- [ ] **Step 3: Configure lint and formatting without test tooling**

Create a flat ESLint configuration composed from `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`, and `eslint-plugin-svelte`. Ignore only `dist/`, `.astro/`, `.impeccable/`, `.superpowers/`, and generated `src/types/database.ts`. Configure Prettier with the Astro and Svelte plugins, `singleQuote: true`, `semi: true`, and `printWidth: 100`.

- [ ] **Step 4: Establish the durable CSS and document shell**

Define at minimum these tokens in `src/styles/tokens.css`:

```css
:root {
  --paper: #f1ebdd;
  --ink: #161616;
  --cobalt: #2045b8;
  --signal: #eb5428;
  --sage: #9eae98;
  --line: color-mix(in srgb, var(--ink) 72%, transparent);
  --font-sans: 'Plus Jakarta Sans Variable', system-ui, sans-serif;
  --page-gutter: clamp(1rem, 4vw, 4rem);
  --focus-ring: 0 0 0 3px var(--paper), 0 0 0 6px var(--cobalt);
}
```

`BaseLayout.astro` must import the font and global CSS, render canonical/OpenGraph metadata from props, include a skip link, and place the approved design contract comment as the first child of `<body>`.

- [ ] **Step 5: Add environment documentation and ignore rules**

`.env.example` must name, without real values: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `PUBLIC_SITE_URL`. Supabase secret/service-role keys belong only to the managed Edge Function environment and must not appear in the Astro env template. Extend `.gitignore` with `.env`, `.env.*`, `!.env.example`, `.astro/`, `dist/`, and `.supabase/` while preserving the existing `.superpowers/` entry.

- [ ] **Step 6: Verify the foundation**

Run:

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm build
```

Expected: every command exits `0`; `dist/server/entry.mjs` exists; no test dependency or test script appears in `package.json`.

- [ ] **Step 7: Commit the foundation**

```bash
git add .gitignore .env.example .nvmrc package.json pnpm-lock.yaml astro.config.mjs tsconfig.json eslint.config.js prettier.config.mjs src
git commit -m "chore: Scaffold Astro Svelte foundation"
```

---

### Task 2: Create the Supabase relational schema

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202609010001_core_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/types/database.ts` via generation

**Interfaces:**
- Produces: enums `member_role`, `member_status`, `invitation_status`, and `report_status`.
- Produces: tables `members`, `shared_invitations`, `invitation_attempts`, `invitation_redemptions`, `profiles`, `places`, `journey_entries`, `fields`, `profile_fields`, `proud_moments`, and `reports`.
- Produces: trigger functions `set_updated_at()` and `normalize_slug_source(text)`.
- Produces: generated `Database` type consumed by every Supabase client and repository.

- [ ] **Step 1: Initialize Supabase local configuration**

Run `pnpm exec supabase init`. Keep the generated project ID local. Configure Auth Site URL as `http://127.0.0.1:4321`, add `http://127.0.0.1:4321/auth/callback` to redirect URLs, enable Google provider placeholders through environment variables, and point `db.seed.sql_paths` to `./seed.sql`.

- [ ] **Step 2: Create enums, timestamps, and membership tables**

The first migration must enable `pgcrypto`, `unaccent`, and `pg_trgm`; create the four enums; create `set_updated_at()`; and implement `normalize_slug_source(value text)` as `lower(unaccent(value))` with non-alphanumeric runs collapsed to one hyphen and edge hyphens removed. Then create membership/invitation tables with these invariants:

```sql
create table public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.member_role not null default 'member',
  status public.member_status not null default 'active',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shared_invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  label text not null check (char_length(label) between 1 and 120),
  status public.invitation_status not null default 'active',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table public.invitation_attempts (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.shared_invitations(id),
  opaque_token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.invitation_redemptions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.shared_invitations(id),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);
```

- [ ] **Step 3: Create inclusive profile and story tables**

Create `places` before `profiles` so `profiles.current_place_id` can reference it. Create `profiles` with unique `owner_id`, unique `slug`, required `name` and `batch_year`, optional `photo_path`, `bio`, `location`, `current_activity`, `current_place_id`, the three narrative fields, social URLs, `is_published`, and timestamps. Use a `2000..2100` check plus a `before insert or update` trigger that rejects `batch_year > extract(year from current_date)`; enforce `bio <= 500` and each narrative answer `<= 1200`.

Then create `journey_entries`, `fields`, `profile_fields`, `proud_moments`, and `reports` from the approved spec. Use `on delete cascade` for profile-owned rows; use `on delete set null` for optional place references. Add unique lower-name indexes for `places` and `fields`, and a unique `(profile_id, field_id)` key.

- [ ] **Step 4: Add update triggers and lookup indexes**

Attach `set_updated_at()` to `members`, `profiles`, `places`, `journey_entries`, `fields`, and `proud_moments`. Add indexes for published profile update order, batch, journey profile/order, proud-moment profile/year, report status/created time, and trigram search on normalized profile name, current activity, place name, and field name.

- [ ] **Step 5: Seed only clearly synthetic local development content**

`supabase/seed.sql` may seed fields and places with labels such as `Software`, `Jurnalisme`, `Usaha Mandiri`, `Pelayanan Publik`, and `Kerja Lapangan`. Do not seed invented alumni names, counts, testimonials, achievements, or factual claims. Add a SQL comment that all seeded labels are synthetic development data.

- [ ] **Step 6: Reset, lint, and generate database types**

Run:

```bash
pnpm db:start
pnpm db:reset
pnpm db:lint
pnpm db:types
pnpm check
```

Expected: migrations and seed complete, database lint emits no warning, and `src/types/database.ts` contains all eleven tables.

- [ ] **Step 7: Commit the schema**

```bash
git add supabase src/types/database.ts
git commit -m "feat: Add inclusive Supabase content schema"
```

---

### Task 3: Enforce RLS, transactional membership, search, and Storage

**Files:**
- Create: `supabase/migrations/202609010002_security_and_storage.sql`
- Create: `supabase/migrations/202609010003_public_queries.sql`

**Interfaces:**
- Produces: `is_active_member() returns boolean` and `is_admin() returns boolean`.
- Produces: `start_invitation_attempt(raw_token text) returns table(attempt_token text, expires_at timestamptz)` callable only by the invitation Edge Function service role.
- Produces: `complete_invitation_attempt(raw_attempt text, actor_user_id uuid) returns void` with row locking and transactional membership creation.
- Produces: `create_shared_invitation(label text, actor_user_id uuid) returns table(raw_token text, invitation_id uuid)` and `revoke_shared_invitation(invitation_id uuid, actor_user_id uuid) returns void`, service-role only with an explicit admin check.
- Produces: `search_profiles(query text, field_slug text, batch_year int, place_slug text, result_limit int, result_offset int)`.
- Produces: public views `published_profile_cards` and `published_profile_details`.

- [ ] **Step 1: Enable RLS and add membership helpers**

Enable RLS on every public table. Implement security-definer helpers with an empty `search_path` and fully qualified table references:

```sql
create or replace function public.is_active_member()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.members
    where user_id = auth.uid() and status = 'active'
  );
$$;
```

Implement `is_admin()` with the same shape and `role = 'admin'`. Revoke direct execution from `anon` where it is not needed; grant to `authenticated` only.

- [ ] **Step 2: Add public-read and owner-write policies**

Policies must allow public select only when the owning profile is published. Member mutations require `is_active_member()` and profile ownership through `owner_id = auth.uid()`. Profiles allow insert only when `owner_id = auth.uid()` and no profile already exists. Admin policies use `is_admin()` and are separate policy statements. No policy may authorize writes from `user_metadata`.

- [ ] **Step 3: Implement invitation transactions**

`start_invitation_attempt` hashes the raw shared token with SHA-256, selects an active non-revoked invitation, generates a 32-byte opaque token, stores only its hash with a 15-minute expiry, and returns the raw opaque token once.

`complete_invitation_attempt` hashes and locks the attempt row `for update`, rejects expired/consumed attempts, rejects an already-redeemed actor, inserts the member and redemption, then marks the attempt consumed in one transaction. Grant both functions only to `service_role`; revoke from `anon`, `authenticated`, and `public`.

- [ ] **Step 4: Create public projections and search RPC**

Create both views with `(security_invoker = true)`. `published_profile_cards` exposes only profile ID, slug, name, photo path, batch year, current activity, current place name/slug, first three field labels, and updated time. `published_profile_details` exposes public profile fields and never includes owner ID, auth email, invitation metadata, or report data.

`search_profiles` uses `security invoker`, applies optional filters, ranks exact normalized name, prefix name, partial name, place, activity, then field matches, and caps `result_limit` at `50`.

`create_shared_invitation` verifies the actor is an active admin, generates a 32-byte raw token, inserts only its SHA-256 hash, and returns the raw token once with the row ID. `revoke_shared_invitation` verifies the actor is an active admin and changes only active invitations. Both functions are executable only by `service_role`.

- [ ] **Step 5: Create and secure Storage buckets**

Create public buckets `profile-photos` and `proud-moments` with a `5MB` object limit and MIME allowlist `image/jpeg,image/png,image/webp`. Storage insert/update/delete policies require the first path segment to equal `auth.uid()::text` and active membership. Public read is allowed because the rendered content is public.

- [ ] **Step 6: Verify security definitions manually**

Run `pnpm db:reset`, `pnpm db:lint`, and `pnpm db:types`. In Supabase Studio, use one anonymous session, one Auth identity without membership, one member, and one admin to manually verify the policy matrix. Record the observed results in a temporary operator note; do not commit a test script or fixture harness.

- [ ] **Step 7: Commit database security and public queries**

```bash
git add supabase/migrations src/types/database.ts
git commit -m "feat: Enforce Supabase ownership and discovery policies"
```

---

### Task 4: Implement reusable invitation and Google OAuth membership

**Files:**
- Create: `supabase/functions/invitations/types.ts`
- Create: `supabase/functions/invitations/invitation-service.ts`
- Create: `supabase/functions/invitations/index.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/server/session.ts`
- Create: `src/lib/shared/auth-errors.ts`
- Create: `src/pages/join/[token].astro`
- Create: `src/pages/login.astro`
- Create: `src/pages/auth/google.ts`
- Create: `src/pages/auth/callback.ts`
- Create: `src/pages/join-required.astro`
- Create: `src/components/svelte/JoinWithGoogle.svelte`

**Interfaces:**
- Produces: `createBrowserSupabase(): SupabaseClient<Database>`.
- Produces: `createServerSupabase(context): SupabaseClient<Database>` with Astro cookie bridging.
- Produces: `getMemberSession(context): Promise<{ user; member } | null>`.
- Produces Edge Function requests `{ action: 'start'; token: string }`, `{ action: 'complete'; attemptToken: string }`, `{ action: 'create'; label: string }`, and `{ action: 'revoke'; invitationId: string }`.
- Produces Edge responses `{ attemptToken: string; expiresAt: string }`, `{ member: { userId: string; role: 'member' | 'admin' } }`, `{ invitationId: string; rawToken: string }`, and `{ revoked: true }`.

- [ ] **Step 1: Implement typed Supabase browser and server clients**

Use `@supabase/ssr`. The browser client reads only `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The server client adapts Astro `cookies.getAll()` and `cookies.set()`/`delete()`; never import `SUPABASE_SECRET_KEY` into any file reachable from client bundles.

- [ ] **Step 2: Implement the invitation Edge Function**

Route by `action`. `start` validates the raw token via the service-role RPC and returns the opaque attempt. `complete` requires a bearer token, calls `auth.getUser(token)`, then invokes `complete_invitation_attempt` with the verified user ID. `create` and `revoke` also require a bearer token, verify the actor with `auth.getUser(token)`, and invoke their service-role-only RPCs, whose own admin check remains authoritative. Return stable error codes: `INVITATION_INVALID`, `INVITATION_REVOKED`, `ATTEMPT_EXPIRED`, `ATTEMPT_CONSUMED`, `MEMBER_EXISTS`, `ADMIN_REQUIRED`, and `UNAUTHORIZED`.

Set CORS only for Edge environment variable `SITE_URL` and local Astro development origins. Do not log raw invitation tokens, attempt tokens, authorization headers, OAuth codes, or emails.

- [ ] **Step 3: Implement the Google OAuth start route**

`POST /auth/google` accepts form fields `mode=join|login` and optional `invitationToken`. For join mode, invoke the Edge Function start action and store the returned attempt in cookie `soonwiki_invite_attempt` with `HttpOnly`, `Secure` outside local development, `SameSite=Lax`, `Path=/auth`, and `Max-Age=900`.

Call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: new URL('/auth/callback', siteUrl).toString(), skipBrowserRedirect: true } })` and redirect to the returned URL.

- [ ] **Step 4: Implement callback and returning-login branches**

`GET /auth/callback` exchanges `code` with `exchangeCodeForSession`. If the attempt cookie exists, invoke `complete`, clear the cookie, and redirect to `/me/edit?welcome=1`. Without an attempt, query active membership: existing members go to `/me`; inert identities are signed out and redirected to `/join-required`.

Map OAuth cancellation and every stable Edge error to short Indonesian messages. Never expose provider or SQL error text.

- [ ] **Step 5: Build the join and login surfaces**

`/join/[token]` validates invitation status before rendering the Google button. Invalid/revoked states show `Tautan ini sudah tidak dapat digunakan. Minta tautan terbaru dari pengelola SOON.` Login copy must say `Masuk dengan Google`; it must not suggest open registration.

- [ ] **Step 6: Manually verify auth states**

With local Supabase and a configured Google test app, manually verify: valid reusable invite for two Google accounts, repeated redemption by one account, revoked invite, expired attempt, OAuth cancellation, returning member login, and direct OAuth without membership. Confirm the last case cannot write through Supabase Studio or the app.

Then run:

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm db:lint
pnpm build
```

- [ ] **Step 7: Commit invitation-gated Google OAuth**

```bash
git add supabase/functions src/lib src/pages/auth src/pages/join src/pages/login.astro src/pages/join-required.astro src/components/svelte/JoinWithGoogle.svelte
git commit -m "feat: Add invitation-gated Google membership"
```

---

### Task 5: Build the typed public data and application shell

**Files:**
- Create: `src/lib/server/public-repository.ts`
- Create: `src/lib/shared/public-models.ts`
- Create: `src/lib/shared/paths.ts`
- Create: `src/components/astro/SiteHeader.astro`
- Create: `src/components/astro/SiteFooter.astro`
- Create: `src/components/svelte/MobileNavigation.svelte`
- Create: `src/components/astro/PortraitFrame.astro`
- Create: `src/components/astro/MetadataStrip.astro`
- Create: `src/components/astro/EmptyState.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `HomeStory`, `ProfileCard`, `ProfileDetail`, `JourneyChapter`, `ProudMoment`, and `ExploreResult` view models.
- Produces: `getHomeStoryData()`, `getProfileBySlug(slug)`, `searchPublishedProfiles(filters)`, `getFieldCollection(slug)`, `getBatchCollection(year)`, and `getPlaceCollection(slug)`.
- Produces: navigation contract `Beranda`, `Jelajahi`, and `Profilku`, with Search as an Explore quick action.

- [ ] **Step 1: Define public view models**

Create explicit TypeScript types that include only public fields. `ProfileDetail` contains ordered journeys, fields, proud moments, and related profile cards. Do not export database rows directly into components.

- [ ] **Step 2: Implement the server repository**

Use the request-scoped server Supabase client. Return discriminated results:

```ts
export type RepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'NOT_FOUND' | 'UNAVAILABLE'; requestId?: string };
```

Home selects one featured profile with the richest available published story, but must fall back deterministically to the most recently updated published profile. It must not label any person `featured` based on an invented endorsement.

- [ ] **Step 3: Build the semantic application shell**

Implement header, footer, skip link, desktop navigation, and a Svelte mobile bottom navigation. Use safe-area insets, at least 44px targets, current-route semantics, and persistent access to Explore. Server-render the navigation labels before hydration.

- [ ] **Step 4: Build shared editorial primitives**

Portrait frames must support real image, initials fallback, frame number, caption, and eager/lazy loading choice. Metadata strips render compact labels without using icon-only meaning. Empty states explain the next useful action.

- [ ] **Step 5: Verify the shell and repositories**

Run lint, format check, check, and build. Open the SSR homepage with JavaScript disabled and confirm the shell, navigation, headings, and placeholder-safe empty state remain readable.

- [ ] **Step 6: Commit public data boundaries**

```bash
git add src/lib/server src/lib/shared src/components src/layouts src/styles
git commit -m "feat: Add public story data boundaries"
```

---

### Task 6: Lock the story-first composition and design contract

**Files:**
- Create: `.impeccable/mocks/story-first-home-a.png`
- Create: `.impeccable/mocks/story-first-home-a.prompt.txt`
- Create: `.impeccable/mocks/story-first-home-b.png`
- Create: `.impeccable/mocks/story-first-home-b.prompt.txt`
- Create: `.impeccable/mocks/story-first-home-c.png`
- Create: `.impeccable/mocks/story-first-home-c.prompt.txt`
- Create: `.impeccable/mocks/story-first-home-round.json`
- Create or update through the Impeccable helper: `.impeccable/surfaces/src-pages-index-astro.md`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Consumes: approved reference `.impeccable/mocks/homepage-contact-sheet-b.png`.
- Produces: one user-approved high-fidelity story-first homepage comp and a direction contract embedded as the first body comment.

- [ ] **Step 1: Load the Impeccable new-work and visualization references**

Use the already-approved Lembar Kontak Redaksi world. Do not reopen brand direction. The task is composition inside the established world: one featured journey, chapter progression, proud moment, diverse contact sheet, Explore handoff, and secondary search.

- [ ] **Step 2: Generate three materially different mobile-first compositions**

Every comp must use the same real product truth and synthetic-labeled demonstration content. Vary structure, density, and story pacing rather than palette. Preserve the approved reference's color, typography, frame, caption, and rule character. Embed the exact prompt provenance in every raster and keep matching `.prompt.txt` files.

- [ ] **Step 3: Present the composition round and pause for approval**

Present all three at readable mobile scale plus one desktop adaptation preview. The user locks one composition. Do not implement homepage regions until that approval is explicit.

- [ ] **Step 4: Persist the selected surface brief and direction contract**

The contract must name THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, and the exact FINISH line from the Impeccable workflow. Place it as the first child comment in `BaseLayout.astro` and write the homepage surface brief through the Impeccable helper.

- [ ] **Step 5: Verify and commit the approved composition**

Run the provenance scan over `.impeccable/mocks`. Confirm the selected comp and prompt exist and the surface brief names story-first rather than search-first.

```bash
git add .impeccable src/layouts/BaseLayout.astro
git commit -m "docs: Lock story-first homepage composition"
```

---

### Task 7: Implement the story-first homepage and Explore

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/explore/index.astro`
- Create: `src/components/astro/FeaturedJourney.astro`
- Create: `src/components/astro/StoryChapter.astro`
- Create: `src/components/astro/ProudMomentFrame.astro`
- Create: `src/components/astro/PossibilityContactSheet.astro`
- Create: `src/components/astro/ExplorePathways.astro`
- Create: `src/components/svelte/StoryRail.svelte`
- Create: `src/components/svelte/ExploreFilters.svelte`
- Create: `src/lib/browser/motion-preferences.ts`
- Create: `src/styles/home.css`
- Create: `src/styles/explore.css`

**Interfaces:**
- Consumes: `getHomeStoryData()` and `searchPublishedProfiles(filters)`.
- Produces: a server-visible story-first homepage and query-string Explore state using `q`, `field`, `batch`, `place`, `page`.
- Produces: `StoryRail` events `select`, `next`, and `previous` with keyboard and pointer parity.

- [ ] **Step 1: Reproduce the approved first viewport**

Build the first viewport at the comp's exact mobile pixel dimensions. Capture `.impeccable/review/hero-repro.png` and compare side-by-side before implementing later sections. Typography scale, portrait coverage, caption geometry, and palette must match the comp; difficulty is not permission to simplify it.

- [ ] **Step 2: Implement the complete homepage narrative**

Render featured journey, SOON/turning-point/current-direction chapters, one proud moment, diverse contact sheet, Explore pathways, and supporting real database counts. When data is sparse, omit unavailable chapters and use honest empty framing; never invent numbers or claims.

- [ ] **Step 3: Add bounded Motion choreography**

Use Motion `animate`, `inView`, and `stagger` only inside the interactive story island. Content starts visible. The contact sheet uses native horizontal scrolling plus CSS snap; Motion adds lift and caption feedback, not drag physics that replaces scrolling. Reduced motion removes transforms and sequence delay.

- [ ] **Step 4: Implement Explore SSR and filters**

The initial result list is SSR. Filter interactions update URL query parameters and progressively enhance without making search a homepage hero. Cards include a short journey excerpt so results remain narrative.

- [ ] **Step 5: Manually verify responsive behavior**

Inspect at `375x812`, `430x932`, `768x1024`, and `1440x1000`. Verify one-handed bottom navigation, no horizontal page overflow, native vertical scroll, keyboard filter operation, reduced motion, and meaningful no-JavaScript rendering.

- [ ] **Step 6: Run quality commands and commit**

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm build
git add src/pages/index.astro src/pages/explore src/components src/lib/browser src/styles .impeccable/review/hero-repro.png
git commit -m "feat: Build story-first discovery experience"
```

---

### Task 8: Build the public journey profile and collections

**Files:**
- Create: `src/pages/people/[slug].astro`
- Create: `src/pages/field/[slug].astro`
- Create: `src/pages/batch/[year].astro`
- Create: `src/pages/place/[slug].astro`
- Create: `src/components/astro/ProfileHero.astro`
- Create: `src/components/astro/JourneyChapterList.astro`
- Create: `src/components/astro/ProudMomentGallery.astro`
- Create: `src/components/astro/RelatedJourneys.astro`
- Create: `src/components/astro/ProfileCard.astro`
- Create: `src/components/svelte/JourneyTimeline.svelte`
- Create: `src/lib/browser/view-transitions.ts`
- Create: `src/styles/profile.css`
- Create: `src/styles/collections.css`

**Interfaces:**
- Consumes: `getProfileBySlug`, `getFieldCollection`, `getBatchCollection`, and `getPlaceCollection`.
- Produces: `data-profile-transition-key` shared by a contact-sheet portrait and its profile hero.
- Produces: canonical public routes and `404` behavior for unpublished or missing content.

- [ ] **Step 1: Render the inclusive profile sequence**

Implement portrait/current chapter, change since SOON, journey timeline, turning point, proud moments, current direction, fields, social links, and related journeys in the approved order. Omit empty optional sections. Never render `Belum lengkap` or pressure copy on public profiles.

- [ ] **Step 2: Add the signature shared transition**

Use Motion's view-transition support or the native View Transition API with a Motion fallback. The selected portrait and caption travel into the profile hero; neighbouring cards settle rather than disappear. Reduced motion uses an immediate navigation with preserved focus placement.

- [ ] **Step 3: Implement field, batch, and place collections**

Each collection page opens with an editorial explanation and journey excerpts, then profile cards. Place copy must use `Tempat, organisasi, atau usaha`, never assume employer/company semantics.

- [ ] **Step 4: Add metadata and share behavior**

Generate profile-specific title, description, canonical URL, and OpenGraph image from real public data. Do not expose private email, owner ID, invitation data, or storage metadata.

- [ ] **Step 5: Verify and commit profiles and collections**

Manually inspect profiles with every optional section, required fields only, no image, non-company journey, and multiple current activities. Verify view transition, keyboard focus, direct-link SSR, 404, and reduced motion. Run lint, format check, check, and build.

```bash
git add src/pages/people src/pages/field src/pages/batch src/pages/place src/components src/lib/browser src/styles
git commit -m "feat: Add inclusive public journey profiles"
```

---

### Task 9: Implement onboarding, editing, and image uploads

**Files:**
- Create: `supabase/migrations/202609010004_member_mutations.sql`
- Create: `src/pages/me/index.astro`
- Create: `src/pages/me/edit.astro`
- Create: `src/lib/server/member-repository.ts`
- Create: `src/lib/shared/profile-schema.ts`
- Create: `src/lib/browser/local-draft.ts`
- Create: `src/lib/browser/image-compression.ts`
- Create: `src/components/svelte/ProfileEditor.svelte`
- Create: `src/components/svelte/JourneyEditor.svelte`
- Create: `src/components/svelte/ProudMomentEditor.svelte`
- Create: `src/components/svelte/FieldPicker.svelte`
- Create: `src/components/svelte/MediaUploader.svelte`
- Create: `src/components/svelte/DuplicateWarning.svelte`
- Create: `src/styles/editor.css`

**Interfaces:**
- Produces: `profileInputSchema`, `journeyInputSchema`, and `proudMomentInputSchema` using Zod.
- Produces: `loadOwnProfile()`, `upsertOwnProfile(input)`, `replaceJourneyEntries(profileId, entries)`, and `replaceProfileFields(profileId, fieldIds)`.
- Produces SQL functions `replace_own_journey_entries(profile_id uuid, entries jsonb)` and `replace_own_profile_fields(profile_id uuid, field_ids uuid[])`, executable by authenticated members and guarded by active membership plus ownership.
- Produces: local draft key `soonwiki:profile-draft:<userId>` and draft version `1`.
- Produces: compressed uploads as WebP, maximum `1600px` longest edge and target maximum `1.5MB` before Storage upload.

- [ ] **Step 1: Implement shared validation and duplicate lookup**

Required profile fields are `name` and `batchYear`. Current activity, place, narratives, bio, fields, journeys, proud moments, and social URLs remain optional. Normalize Unicode, collapse whitespace, validate HTTPS URLs, and enforce the database character limits in Zod. Duplicate candidates expose only ID, name, slug, batch, and portrait.

- [ ] **Step 2: Add atomic replacement functions**

Create `202609010004_member_mutations.sql`. Each function checks `is_active_member()`, verifies the target profile has `owner_id = auth.uid()`, validates that referenced place/field IDs exist, replaces only the caller-owned rows, and returns the resulting rows in deterministic order. Revoke execution from `anon` and grant only to `authenticated`.

- [ ] **Step 3: Implement member repository mutations**

Use the authenticated browser Supabase client for owner mutations under RLS. Group multi-row replacement operations behind database functions where partial state would be harmful. Return stable results `{ ok: true, data } | { ok: false, code, fields? }`; never pass raw PostgREST errors to components.

- [ ] **Step 4: Build one scrolling mobile editor**

Sections are `Profil`, `Perjalanan`, `Hal yang ditekuni`, `Hal yang dibanggakan`, and `Tautan`. Place the three story prompts in Profil with supportive examples and no intimidation. Add sticky save, explicit dirty/saving/saved/error states, public preview, and section status without turning the flow into a modal wizard.

- [ ] **Step 5: Preserve drafts and recover from failure**

Write debounced form state to localStorage under the versioned key. On load, compare local draft time with server update time and ask before restoring. Clear the draft only after a confirmed successful save. A failed upload or save must preserve typed content.

- [ ] **Step 6: Implement client-side image preparation**

Use Canvas and `createImageBitmap` rather than a new dependency. Correct orientation through browser decoding, crop profile photos square, cap the longest edge, encode WebP, then upload to `<auth.uid()>/<uuid>.webp`. Show progress, cancellation, retry, and an initials fallback.

- [ ] **Step 7: Implement duplicate confirmation**

On similar normalized name + batch, show candidates and actions `Kembali periksa data` and `Bukan saya, lanjutkan`. The second action confirms the warning and continues; it does not create a claim flow.

- [ ] **Step 8: Manually verify editing scenarios**

Verify required-fields-only publish, full story, non-company journey, multiple journeys, duplicate warning, save failure, refresh with local draft, upload retry, ownership denial, and mobile keyboard behavior. Run lint, format check, check, and build.

- [ ] **Step 9: Commit member contribution**

```bash
git add supabase/migrations/202609010004_member_mutations.sql src/pages/me src/lib/server/member-repository.ts src/lib/shared/profile-schema.ts src/lib/browser src/components/svelte src/styles/editor.css
git commit -m "feat: Add low-friction story contribution"
```

---

### Task 10: Add reporting and focused admin operations

**Files:**
- Create: `supabase/migrations/202609010005_admin_operations.sql`
- Create: `src/components/svelte/ReportDialog.svelte`
- Modify: `src/pages/people/[slug].astro`
- Create: `src/pages/admin/index.astro`
- Create: `src/pages/admin/people.astro`
- Create: `src/pages/admin/content.astro`
- Create: `src/pages/admin/taxonomy.astro`
- Create: `src/pages/admin/reports.astro`
- Create: `src/pages/admin/invitations.astro`
- Create: `src/lib/server/admin-repository.ts`
- Create: `src/components/svelte/AdminInvitationManager.svelte`
- Create: `src/components/svelte/AdminReportQueue.svelte`
- Create: `src/styles/admin.css`

**Interfaces:**
- Produces: `submitReport(input)`, `listAdminOverview()`, `createSharedInvitation(label)`, `revokeSharedInvitation(id)`, `resolveReport(id, status)`, and bounded content/taxonomy mutation methods.
- Produces SQL functions `merge_fields(source_id uuid, target_id uuid)`, `merge_places(source_id uuid, target_id uuid)`, and `transfer_profile_owner(profile_id uuid, new_owner_id uuid)`, each admin-only and transactional.
- Produces: shared invitation raw token exactly once on creation; stored data and later admin views show only label, status, dates, and redemption count.

- [ ] **Step 1: Add transactional admin operations**

Create `202609010005_admin_operations.sql`. Every function calls `is_admin()` before mutation. Field/place merge moves references with conflict-safe `on conflict do nothing`, deletes the source row, and returns affected profile/journey/proud-moment counts. Ownership transfer rejects a target member who already owns a profile. Grant execution only to `authenticated`; the internal admin check remains authoritative.

- [ ] **Step 2: Add the public report dialog**

Support `Informasi tidak tepat`, `Konten tidak pantas`, `Meniru orang lain`, and `Lainnya`, with optional detail. Preserve the profile context and show success/failure feedback without navigating away.

- [ ] **Step 3: Implement admin guards and repository**

Every admin page performs a server-side `is_admin()` check and returns `404` to non-admins. Repository methods use the request-scoped authenticated client for RLS-covered operations and invoke the invitation Edge Function/service operation only where raw token creation is required.

- [ ] **Step 4: Build utilitarian admin surfaces**

Dashboard shows real counts only. People/content tables support search and explicit edit/delete actions. Taxonomy supports field/place rename and merge with affected-count confirmation. Reports support open/resolved/dismissed. Avoid expressive motion; retain the visual tokens but prioritize scanability.

- [ ] **Step 5: Build invitation creation and revocation**

Creating an invitation requires a label and returns a copyable `/join/<raw-token>` URL once. The UI warns that it cannot be recovered later. Revocation requires confirmation and must not disable existing members.

- [ ] **Step 6: Verify admin and report boundaries**

Manually verify anonymous report behavior, member report behavior, non-admin route denial, invitation creation/copy/revocation, content ownership correction, taxonomy merge, and report resolution. Run lint, format check, check, database lint, and build.

- [ ] **Step 7: Commit trust and admin operations**

```bash
git add supabase/migrations/202609010005_admin_operations.sql src/pages/admin src/pages/people src/lib/server/admin-repository.ts src/components/svelte src/styles/admin.css
git commit -m "feat: Add reporting and community administration"
```

---

### Task 11: Harden errors, accessibility, SSR, and operational documentation

**Files:**
- Create: `src/middleware.ts`
- Create: `src/pages/404.astro`
- Create: `src/pages/500.astro`
- Create: `src/lib/server/request-context.ts`
- Create: `src/lib/shared/app-error.ts`
- Create: `src/components/astro/ErrorState.astro`
- Create: `README.md`
- Modify: every delivered route/component only where the bounded audits find a defect

**Interfaces:**
- Produces: request ID header `X-Request-Id` and safe `AppErrorCode` mapping.
- Produces: provider-neutral quality command sequence documented in README.
- Produces: local setup instructions for Google OAuth and Supabase without committing secrets.

- [ ] **Step 1: Add request context and safe errors**

Generate or preserve `X-Request-Id`. Map known application errors to Indonesian UI messages and log unexpected server errors with request ID, method, and route only. Redact authorization, cookies, OAuth codes, invitation/attempt tokens, email, and full URLs containing secrets.

- [ ] **Step 2: Add security headers and route protection**

Use Astro middleware to add CSP appropriate for Supabase and Google OAuth, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and `Permissions-Policy` disabling unused sensors. Protect `/me/*` and `/admin/*` server-side before rendering.

- [ ] **Step 3: Complete accessible error and empty states**

Implement semantic 404/500 pages, live regions for save/upload/report status, dialog focus return, visible focus, labelled controls, logical headings, portrait alt text, and reduced-motion behavior. No state may rely on color or motion alone.

- [ ] **Step 4: Write the operational README**

Document Node `22.22.3`, pnpm `11.22.0`, Supabase CLI prerequisites, public Astro environment keys, Edge Function `SITE_URL` secret configuration, local start/reset/types flow, Google OAuth callback setup, migrations, Edge Function serve/deploy commands, and these provider-neutral quality commands:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm check
pnpm db:lint
pnpm build
```

State explicitly that the project intentionally contains no automated test code or test scripts. Do not add a CI file until a remote provider is selected.

- [ ] **Step 5: Run the complete manual functional matrix**

Use the acceptance conditions in the spec as the checklist. Record date, environment, reviewer, and pass/fail notes in the delivery report, not as executable test code. Any failure is fixed at its owning layer before visual finish.

- [ ] **Step 6: Run code and schema quality gates**

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm db:lint
pnpm build
```

Expected: every command exits `0`; `rg -n "(describe|it|test)\(" src supabase` finds no automated test blocks; package scripts contain no `test` key.

- [ ] **Step 7: Commit hardening and documentation**

```bash
git add src README.md
git commit -m "chore: Harden SoonWiki delivery foundation"
```

---

### Task 12: Complete the bounded Impeccable finish workflow

**Files:**
- Create: `.impeccable/review/desktop.png`
- Create: `.impeccable/review/mobile.png`
- Create: `.impeccable/review/finish-report.md`
- Create through the Impeccable documenter: `DESIGN.md`
- Create through the Impeccable documenter: the matching design sidecar
- Modify: only UI files named by detector or finish-review findings

**Interfaces:**
- Consumes: approved story-first comp, direction contract, product/spec records, and all implemented UI.
- Produces: valid mobile/desktop evidence, detector results, independent reviewer disposition, and durable design documentation.

- [ ] **Step 1: Load the craft floor and settle entrance motion**

Read the Impeccable craft-floor reference immediately before the finish edit. Disable or settle entrance animation for captures so hidden timing does not create false missing-content defects.

- [ ] **Step 2: Capture one batched review round**

Capture valid full-page mobile and desktop screenshots from the document top into the required paths. Also capture section crops for hero, featured story, contact sheet, Explore, profile, and editor at legible scale. Open every capture once and reject blank, half-loaded, wrong-route, or mid-animation evidence.

- [ ] **Step 3: Run the design detector once**

Run:

```bash
node C:/Users/DianSetiawan/.agents/skills/impeccable/scripts/detect.mjs --json src/layouts src/pages src/components src/styles
```

Fix mechanical findings in one batch. Do not run the detector a second time.

- [ ] **Step 4: Spawn the independent finish reviewer**

Pass the original request, approved answers, artifact routes, screenshot paths, direction contract, detector findings, approved comp, and craft-floor path. Act exactly on `recapture`, `rebuild`, `fix`, or `ship`. Respect the bounded two-round visual inspection ceiling unless the user funds another attended round.

- [ ] **Step 5: Verify raster provenance after any visual correction**

Run the Impeccable provenance scanner over every shipping raster directory. Embed the generation prompt for produced assets and origin for sourced assets; remove only abandoned rasters.

- [ ] **Step 6: Run the Impeccable documenter**

Generate `DESIGN.md` and its sidecar from the shipped implementation, not the earlier intention. If a correction changes the documented surface afterward, rerun the documenter.

- [ ] **Step 7: Run final non-test gates and inspect Git state**

```bash
pnpm lint
pnpm format:check
pnpm check
pnpm db:lint
pnpm build
git status --short
```

Expected: quality commands exit `0`; only finish artifacts and documentation intended for the final commit remain.

- [ ] **Step 8: Commit finish evidence and design documentation**

```bash
git add .impeccable DESIGN.md src
git commit -m "chore: Complete SoonWiki visual finish"
git status --short
```

Expected: working tree is clean and commit history remains split by task.

---

## Final Acceptance Checklist

- [ ] A reusable shared invitation onboards at least two distinct Google accounts.
- [ ] One Google account cannot redeem twice or own two profiles.
- [ ] Revocation blocks new redemption without disabling existing members.
- [ ] Direct OAuth without active membership cannot mutate community data.
- [ ] Public stories render without authentication and before hydration.
- [ ] Homepage leads with an alumni journey and keeps search secondary.
- [ ] Profiles support informal, entrepreneurial, public-service, blue-collar, educational, community, and transitional paths without company pressure.
- [ ] Narrative prompts, journey entries, and proud moments form a coherent story.
- [ ] Mobile navigation, rails, editing, and uploads work comfortably with one hand.
- [ ] Signature portrait-to-profile transition matches the approved Motion contract.
- [ ] Reduced motion preserves all content and feedback.
- [ ] RLS protects every mutation and Storage path.
- [ ] Admin can create/revoke shared links, manage content/taxonomy, and resolve reports.
- [ ] No unit, integration, or E2E test code, test runner, test directory, or test script exists.
- [ ] Lint, formatting check, Astro/Svelte/TypeScript check, database lint, and production build exit `0`.
- [ ] Manual functional matrix and Impeccable finish review are complete.
- [ ] `DESIGN.md` documents the shipped visual system.
- [ ] Final working tree is clean.
