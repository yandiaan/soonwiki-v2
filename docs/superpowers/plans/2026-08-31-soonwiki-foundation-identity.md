# SoonWiki Foundation + Identity Implementation Plan

> **SUPERSEDED — 1 September 2026.** Jangan eksekusi plan ini. Plan baru harus ditulis dari `docs/superpowers/specs/2026-09-01-soonwiki-supabase-story-first-design.md` setelah spec tersebut direview dan disetujui pengguna.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production-ready Foundation + Identity vertical slice: reusable shared invitation, email verification, authenticated member session, owned basic profile, and instant public publishing.

**Architecture:** A single production Node process mounts Express 5 routes under `/api/*`, serves Astro build assets, and falls through to the Astro SSR middleware. During development, Astro keeps HMR on port 4321 and proxies `/api` to the Express watcher on port 3001; both paths use the same domain services and PostgreSQL database.

**Tech Stack:** Node.js `>=22.12.0`, pnpm, Astro SSR, Svelte islands, Express 5 ESM, TypeScript strict, PostgreSQL, Drizzle ORM, Better Auth magic link, Resend HTTP API, Vitest, Supertest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-31-soonwiki-foundation-identity-design.md`

## Global Constraints

- Production runs as one Node process and one browser origin.
- Astro pages and Express routes call the same domain services; SSR must not make loopback HTTP calls.
- Bahasa Indonesia is the primary UI language.
- Plus Jakarta Sans Variable is self-hosted through `@fontsource-variable/plus-jakarta-sans`.
- The approved visual world is Lembar Kontak Redaksi; `.impeccable/mocks/homepage-contact-sheet-b.png` is the approved Filmstrip Cobalt spatial contract.
- Shared invitation links are reusable, revocable, and have neither expiry nor maximum usage in MVP.
- Every redemption requires email verification; direct public magic-link signup is blocked.
- Auth roles are `pending | member | admin`; only `member` and `admin` receive write access.
- One account owns at most one profile; no pre-population or claim-profile flow is implemented.
- Duplicate name + batch produces a warning and explicit confirmation, not an ownership claim.
- No Redis, queue, microservice, dedicated search engine, profile upload, career, expertise, achievement, report, or admin web UI in this plan.
- Every user-facing error message is Indonesian; stable machine codes remain English.
- User override: execute implementation-first; do not write failing tests, TDD scaffolding, or unit tests. Use integration tests, E2E, typecheck, build, and smoke verification only.
- Every task ends with a focused verification run and a Conventional Commit with sentence case after the colon.

---

## File Map

### Runtime and configuration

- `package.json` — scripts, dependency boundaries, Node and pnpm engines.
- `astro.config.mjs` — SSR middleware build, Svelte integration, development `/api` proxy.
- `svelte.config.js` — Svelte preprocessing.
- `tsconfig.json` — Astro/Svelte strict type checking.
- `tsconfig.server.json` — compiles Express and domain code for production.
- `server/run-server.mjs` — production composition root for static assets, Express API, and Astro SSR.
- `src/server/dev.ts` — API-only development entrypoint used behind Astro proxy.
- `src/server/http/create-api-app.ts` — Express app composition without `listen()`.
- `src/server/env.ts` — validated environment contract.
- `src/server/composition.ts` — creates production/development dependencies from validated environment.

### Database and auth

- `drizzle.config.ts` — code-first migration configuration.
- `src/server/db/client.ts` — PostgreSQL pool and Drizzle client.
- `src/server/db/auth-schema.ts` — Better Auth generated Drizzle schema.
- `src/server/db/app-schema.ts` — invitation, profile, and audit tables.
- `src/server/db/schema.ts` — aggregate schema export.
- `src/server/auth/auth.ts` — Better Auth factory and magic-link plugin.
- `src/server/auth/session.ts` — Express/Astro session adapters and role guards.
- `src/server/mail/mailer.ts` — mailer interface, development sink, Resend implementation.

### Invitation module

- `src/server/modules/invitations/invitation-service.ts` — create, list, revoke, start, and complete redemption.
- `src/server/modules/invitations/invitation-errors.ts` — stable invitation error classes/codes.
- `src/server/modules/invitations/invitation-routes.ts` — HTTP start/completion handlers.
- `scripts/invite.ts` — create/list/revoke CLI.

### Profile module

- `src/server/modules/profiles/profile-schema.ts` — Zod request schemas.
- `src/server/modules/profiles/profile-service.ts` — duplicate detection, ownership, create/update/public lookup.
- `src/server/modules/profiles/profile-routes.ts` — `/api/me`, `/api/me/profile`, and public profile JSON.

### UI

- `src/layouts/BaseLayout.astro` — document shell, visual contract comment, font, metadata.
- `src/styles/tokens.css` — Filmstrip Cobalt design tokens.
- `src/styles/global.css` — reset, typography, focus, reduced motion.
- `src/pages/join/[token].astro` — reusable invitation entry.
- `src/pages/join/check-email.astro` — generic delivery confirmation.
- `src/pages/join/complete.astro` — completion error fallback.
- `src/pages/login.astro` — returning member login.
- `src/pages/me/edit.astro` — authenticated basic profile editor.
- `src/pages/people/[slug].astro` — minimal public profile.
- `src/components/svelte/JoinForm.svelte` — invite redemption form.
- `src/components/svelte/LoginForm.svelte` — returning-member magic-link form.
- `src/components/svelte/ProfileForm.svelte` — duplicate-aware create/update form.

### Verification

- `tests/integration/` — PostgreSQL-backed service and HTTP tests.
- `tests/e2e/identity-flow.spec.ts` — browser vertical slice.
- `tests/helpers/test-db.ts` — migration, cleanup, and fixture helpers.
- `tests/helpers/test-app.ts` — dependency-composed Express test app.
- `playwright.config.ts` — E2E web server configuration.
- `docker-compose.yml` — local/test PostgreSQL only.
- `Dockerfile` — one-process production image.
- `.env.example` — required environment names with safe sample values.

---

### Task 1: Scaffold the Astro, Svelte, and Express runtime

**Files:**
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `svelte.config.js`
- Create: `tsconfig.json`
- Create: `tsconfig.server.json`
- Create: `server/run-server.mjs`
- Create: `src/server/http/create-api-app.ts`
- Create: `src/server/dev.ts`
- Create: `src/pages/index.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `createApiApp(deps?: ApiAppDependencies): Express`.
- Produces: `GET /api/health -> { "status": "ok" }`.
- Produces: production entry that imports `handler` from `dist/server/entry.mjs` after `astro build`.

- [ ] **Step 1: Initialize Git and install the minimal runtime**

Run:

```bash
git init -b main
git switch -c feat/soonwiki-foundation-identity
pnpm init
pnpm add astro @astrojs/node @astrojs/svelte svelte express zod @fontsource-variable/plus-jakarta-sans
pnpm add -D typescript tsx concurrently vitest supertest @astrojs/check @types/express @types/node @types/supertest svelte-check
```

Before writing application code, use the feature branch `feat/soonwiki-foundation-identity`; do not implement on `main`.

Set `engines.node` to `>=22.12.0`, `type` to `module`, and add scripts:

```json
{
  "scripts": {
    "dev": "concurrently -k -n api,web \"pnpm dev:api\" \"pnpm dev:web\"",
    "dev:api": "tsx watch src/server/dev.ts",
    "dev:web": "astro dev",
    "build": "astro check && astro build && tsc -p tsconfig.server.json",
    "start": "node server/run-server.mjs",
    "lint": "astro check",
    "typecheck": "astro check && tsc -p tsconfig.server.json --noEmit",
    "test": "vitest run tests/integration",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test"
  }
}
```

Write `22.12.0` to `.nvmrc`. Write this exact baseline to `.gitignore`:

```gitignore
node_modules/
dist/
.astro/
.env
.env.*
!.env.example
.superpowers/
coverage/
playwright-report/
test-results/
```

- [ ] **Step 2: Implement the minimal Express composition**

```ts
// src/server/http/create-api-app.ts
import express, { type Express } from "express";

export interface ApiAppDependencies {}

export function createApiApp(_deps: ApiAppDependencies = {}): Express {
  const app = express();
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  return app;
}
```

```ts
// src/server/dev.ts
import { createApiApp } from "./http/create-api-app.js";

const port = 3001;
createApiApp().listen(port, "127.0.0.1", () => {
  console.info(JSON.stringify({ event: "api_started", port }));
});
```

Configure Astro with `output: "server"`, `node({ mode: "middleware" })`, `svelte()`, and a development Vite proxy from `/api` to `http://127.0.0.1:3001`. Configure `server/run-server.mjs` to mount `express.static("dist/client")`, the compiled API app, then Astro's `ssrHandler`. Keep the health route as the runtime smoke contract.

- [ ] **Step 3: Verify runtime and production composition**

Run:

```bash
pnpm typecheck
pnpm build
pnpm dev:api
curl http://127.0.0.1:3001/api/health
```

Expected: typecheck and build pass, the API watcher starts, health returns `{ "status": "ok" }`, and `dist/server/entry.mjs` exists. Stop the watcher after the smoke check.

- [ ] **Step 4: Commit the runtime scaffold**

```bash
git add .
git commit -m "chore: Scaffold Astro Svelte Express runtime"
```

---

### Task 2: Add validated environment, PostgreSQL, and Better Auth schema

**Files:**
- Create: `.env.example`
- Create: `docker-compose.yml`
- Create: `drizzle.config.ts`
- Create: `src/server/env.ts`
- Create: `src/server/composition.ts`
- Create: `src/server/db/client.ts`
- Create: `src/server/db/auth-schema.ts`
- Create: `src/server/db/app-schema.ts`
- Create: `src/server/db/schema.ts`
- Create: `src/server/auth/auth.ts`
- Create: `src/server/mail/mailer.ts`
- Create: `tests/integration/schema.test.ts`
- Create: `tests/helpers/test-db.ts`
- Modify: `package.json`
- Modify: `src/server/http/create-api-app.ts`

**Interfaces:**
- Produces: `loadEnv(source: NodeJS.ProcessEnv): AppEnv`.
- Produces: `createDb(databaseUrl: string): { db: AppDb; pool: Pool }`.
- Produces: `createAuth(deps: { db: AppDb; mailer: Mailer; env: AppEnv })`.
- Produces: `createProductionDependencies(source: NodeJS.ProcessEnv): Promise<ApiAppDependencies>`.
- Produces: `Mailer.sendMagicLink({ to, url }): Promise<void>`.

- [ ] **Step 1: Install persistence and auth dependencies**

```bash
pnpm add drizzle-orm pg better-auth
pnpm add -D drizzle-kit @types/pg
```

- [ ] **Step 2: Implement environment and database composition**

```ts
// src/server/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  APP_BASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.string().min(3),
  PORT: z.coerce.number().int().positive().default(4321)
});

export type AppEnv = z.infer<typeof envSchema>;
export const loadEnv = (source: NodeJS.ProcessEnv): AppEnv => envSchema.parse(source);
```

Define Better Auth core tables through its generator and application tables from the approved spec. Use UUID primary keys, timestamp-with-time-zone columns, unique `invitation_redemptions.user_id`, and unique `people.owner_id`. Keep the integration schema test as the database verification entrypoint and add it after the schema migration exists; it must insert an invitation and assert `revoked_at` is null, the token hash is 64 hexadecimal characters, and the table has no expiry or max-use columns.

Run:

```bash
pnpm dlx auth@latest generate --config src/server/auth/auth.ts --output src/server/db/auth-schema.ts --yes
pnpm exec drizzle-kit generate --name foundation_identity
pnpm exec drizzle-kit migrate
```

- [ ] **Step 3: Implement the auth factory with a pending default role**

```ts
// src/server/auth/auth.ts
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import type { AppEnv } from "../env.js";
import type { AppDb } from "../db/client.js";
import type { Mailer } from "../mail/mailer.js";
import * as schema from "../db/schema.js";

export function createAuth(deps: { db: AppDb; env: AppEnv; mailer: Mailer }) {
  return betterAuth({
    baseURL: deps.env.APP_BASE_URL,
    secret: deps.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(deps.db, { provider: "pg", schema }),
    user: {
      additionalFields: {
        role: { type: "string", required: true, defaultValue: "pending", input: false }
      }
    },
    plugins: [
      magicLink({
        sendMagicLink: ({ email, url }) => deps.mailer.sendMagicLink({ to: email, url })
      })
    ]
  });
}
```

- [ ] **Step 4: Verify migrations and constraints**

Run:

```bash
docker compose up -d postgres
pnpm exec drizzle-kit migrate
pnpm test:integration -- tests/integration/schema.test.ts
pnpm typecheck
```

Expected: all pass against the PostgreSQL container.

- [ ] **Step 5: Commit database and auth schema**

```bash
git add .env.example docker-compose.yml drizzle.config.ts drizzle src package.json pnpm-lock.yaml tests
git commit -m "feat: Add PostgreSQL and authentication schema"
```

---

### Task 3: Implement reusable invitation administration

**Files:**
- Create: `src/server/modules/invitations/invitation-errors.ts`
- Create: `src/server/modules/invitations/invitation-service.ts`
- Create: `scripts/invite.ts`
- Create: `tests/integration/invitation-admin.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `AppDb` and invitation tables from Task 2.
- Produces: `createInvitationService({ db, now, randomBytes })`.
- Produces: `create({ label, createdBy }): Promise<{ id; urlToken }>`.
- Produces: `list(): Promise<InvitationSummary[]>`.
- Produces: `revoke(id): Promise<void>`.

- [ ] **Step 1: Implement token creation and revocation**

```ts
// src/server/modules/invitations/invitation-service.ts
import { createHash } from "node:crypto";

export const hashToken = (token: string): string =>
  createHash("sha256").update(token, "utf8").digest("hex");

export const encodeToken = (bytes: Buffer): string => bytes.toString("base64url");
```

The service must insert `hashToken(urlToken)`, return the raw token exactly once, list only metadata, and update `revoked_at` instead of deleting rows.

Add integration assertions for: create returns a URL-safe raw token while the stored row contains only its hash; list omits token material; revoke preserves the invitation row and changes only `revoked_at`.

- [ ] **Step 2: Add deterministic CLI commands**

Add scripts:

```json
{
  "invite:create": "tsx scripts/invite.ts create",
  "invite:list": "tsx scripts/invite.ts list",
  "invite:revoke": "tsx scripts/invite.ts revoke"
}
```

CLI output for create must be JSON containing `id`, `label`, and `${APP_BASE_URL}/join/${urlToken}`. List output must never contain token hashes.

- [ ] **Step 3: Verify service and CLI**

Run:

```bash
pnpm test:integration -- tests/integration/invitation-admin.test.ts
pnpm invite:create -- --label "SoonMates Launch"
pnpm invite:list
pnpm typecheck
```

Expected: tests pass and the CLI prints one usable invitation URL.

- [ ] **Step 4: Commit invitation administration**

```bash
git add src/server/modules/invitations scripts/invite.ts package.json tests/integration/invitation-admin.test.ts
git commit -m "feat: Add reusable invitation administration"
```

---

### Task 4: Implement invitation-gated magic-link authentication

**Files:**
- Create: `src/server/auth/session.ts`
- Create: `src/server/mail/resend-mailer.ts`
- Create: `src/server/mail/development-mailer.ts`
- Create: `src/server/modules/invitations/invitation-routes.ts`
- Create: `tests/integration/invitation-redemption.test.ts`
- Create: `tests/integration/member-login.test.ts`
- Create: `tests/helpers/identity-fixtures.ts`
- Modify: `src/server/http/create-api-app.ts`
- Modify: `src/server/modules/invitations/invitation-service.ts`

**Interfaces:**
- Consumes: `auth.api.signInMagicLink`, `auth.api.getSession`, invitation service, and `Mailer`.
- Produces: `startRedemption({ sharedToken, email }): Promise<{ attemptToken; email }>`.
- Produces: `completeRedemption({ attemptToken, userId, email }): Promise<void>`.
- Produces: `requireMember(headers): Promise<MemberSession>`.
- Produces: `createIdentityFixtures({ db, app, mailer })` with `createInvitation`, `startRedemption`, `completeRedemption`, `performFullRedemption`, `revokeInvitation`, `countRedemptions`, and `userRole` methods used by integration tests.
- Produces: `POST /api/invitations/redeem/start`, `GET /api/invitations/redeem/complete`, and `POST /api/auth/login/magic-link`.

- [ ] **Step 1: Implement one-time invitation attempts**

`startRedemption` must normalize email, validate active shared token, insert a 30-minute attempt with hashed attempt token, and return the raw attempt token once. `completeRedemption` must lock the attempt row, verify expiry, invitation state, email equality, and prior redemption, then consume the attempt and promote `pending` to `member` in one transaction.

```ts
export type CompleteRedemptionInput = {
  attemptToken: string;
  userId: string;
  email: string;
};
```

- [ ] **Step 2: Mount Better Auth safely and add eligible entrypoints**

Mount in this order:

```ts
app.post("/api/auth/sign-in/magic-link", (_req, res) => res.sendStatus(404));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "64kb" }));
app.use("/api/invitations", createInvitationRouter(deps));
```

The invitation start handler calls `auth.api.signInMagicLink` internally with callback URL `/api/invitations/redeem/complete?attempt=<opaque-token>`. Returning-member login sends a link only when the normalized email belongs to `member` or `admin`, but always returns the same `202` body:

```json
{ "message": "Jika email terdaftar, tautan masuk akan dikirim." }
```

- [ ] **Step 3: Implement development and Resend mailers**

```ts
export interface Mailer {
  sendMagicLink(input: { to: string; url: string }): Promise<void>;
}
```

Development mailer stores messages in process memory and exposes them only through a test/dev dependency. Resend mailer uses `fetch("https://api.resend.com/emails")`, bearer authentication from `RESEND_API_KEY`, and throws a redacted `MAIL_DELIVERY_FAILED` error on non-2xx responses.

Add integration coverage for two emails reusing one shared link, a second redemption by the same user, revoked and expired attempts, session-email mismatch, blocked direct signup, preserved redemption history after revocation, and a returning member login.

- [ ] **Step 4: Verify redemption, revocation, mismatch, and returning login**

Run:

```bash
pnpm test:integration -- tests/integration/invitation-redemption.test.ts tests/integration/member-login.test.ts
pnpm typecheck
```

Expected: all cases pass, including concurrent duplicate redemption and email mismatch.

- [ ] **Step 5: Commit invitation-gated authentication**

```bash
git add src/server/auth src/server/mail src/server/modules/invitations src/server/http tests/integration
git commit -m "feat: Add invitation-gated magic link authentication"
```

---

### Task 5: Implement owned basic profile publishing

**Files:**
- Create: `src/server/modules/profiles/profile-schema.ts`
- Create: `src/server/modules/profiles/profile-service.ts`
- Create: `src/server/modules/profiles/profile-routes.ts`
- Create: `tests/integration/profile-service.test.ts`
- Create: `tests/helpers/profile-fixtures.ts`
- Modify: `src/server/http/create-api-app.ts`

**Interfaces:**
- Consumes: `AppDb` and `requireMember`.
- Produces: `createProfile(input, actor): Promise<CreateProfileResult>`.
- Produces: `updateOwnProfile(input, actor): Promise<Person>`.
- Produces: `getPublicProfileBySlug(slug): Promise<PublicPerson | null>`.
- Produces: `GET /api/me`, `POST/PATCH /api/me/profile`, `GET /api/people/:slug`.
- Produces: `createProfileFixtures({ db })` with `createMemberActor`, `createPerson`, and `publicProfile` methods.

- [ ] **Step 1: Implement validation and normalization**

```ts
export const profileInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  batchYear: z.number().int().min(2000).max(new Date().getFullYear()),
  bio: z.string().trim().max(500).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  currentRole: z.string().trim().max(160).nullable().optional(),
  currentCompanyText: z.string().trim().max(160).nullable().optional(),
  linkedinUrl: httpsUrlSchema.nullable().optional(),
  instagramUrl: httpsUrlSchema.nullable().optional(),
  websiteUrl: httpsUrlSchema.nullable().optional(),
  confirmDuplicate: z.boolean().default(false)
});
```

Normalize names with Unicode NFKC, trim, collapse whitespace, and lowercase using `id-ID`. Generate slugs from normalized names; append `-<batchYear>` then a short stable UUID segment on collision.

- [ ] **Step 2: Implement profile service transactions and routes**

`createProfile` checks the unique owner constraint and duplicate candidates before insert. `updateOwnProfile` selects by both person ID and `owner_id`. API routes map duplicate warning to HTTP `409` with code `DUPLICATE_CONFIRMATION_REQUIRED`; `error.details.candidates` contains only candidate `id`, `name`, `slug`, and `batchYear`.

Add integration coverage for required fields, normalized duplicate matching, explicit duplicate confirmation, owner-only update, unique owner constraint, slug collision, and public lookup excluding email/auth fields.

- [ ] **Step 3: Verify profile publishing contract**

Run:

```bash
pnpm test:integration -- tests/integration/profile-service.test.ts
pnpm typecheck
```

Expected: all pass; a committed create is immediately returned by public lookup.

- [ ] **Step 4: Commit profile ownership and publishing**

```bash
git add src/server/modules/profiles src/server/http tests
git commit -m "feat: Add owned profile publishing"
```

---

### Task 6: Build the Indonesian identity UI in the Filmstrip Cobalt world

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/pages/join/[token].astro`
- Create: `src/pages/join/check-email.astro`
- Create: `src/pages/join/complete.astro`
- Create: `src/pages/login.astro`
- Create: `src/pages/me/edit.astro`
- Create: `src/pages/people/[slug].astro`
- Create: `src/components/svelte/JoinForm.svelte`
- Create: `src/components/svelte/LoginForm.svelte`
- Create: `src/components/svelte/ProfileForm.svelte`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: invitation/profile HTTP contracts and Astro-side service calls.
- Produces: accessible onboarding, login, profile edit, and public profile routes.
- Produces: initials avatar component behavior when no photo exists.

- [ ] **Step 1: Add the visual contract to the document shell**

Place this emitted HTML comment as the first child of `<body>` in `BaseLayout.astro`:

```html
<!--
THESIS: SoonWiki treats identity as a living editorial contact sheet, refusing the generic rounded-card directory.
OWN-WORLD: Cobalt fields, warm newsprint, near-black ink, signal orange metadata, numbered frames, caption strips, and Plus Jakarta Sans.
STORY: A Soonie enters through a trusted group invitation, verifies their identity, publishes a profile, and sees it become part of the community record.
FIRST VIEWPORT: A compact masthead leads into one decisive cobalt field; the primary form sits on a paper caption strip with status and guidance directly below.
FORM: Lembar Kontak Redaksi, grounded candidate 1; seed ea2c49f4.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->
```

- [ ] **Step 2: Implement tokens and responsive UI**

```css
:root {
  --paper: #f1ebdd;
  --ink: #101010;
  --cobalt: #123db5;
  --signal: #f05a28;
  --line: color-mix(in srgb, var(--ink) 72%, transparent);
  --font-sans: "Plus Jakarta Sans Variable", system-ui, sans-serif;
  --focus: 0 0 0 3px var(--paper), 0 0 0 6px var(--cobalt);
}
```

Use semantic forms, visible labels, 44px minimum touch targets, explicit loading text, and server-rendered content visible before hydration. Svelte motion is limited to registration-line drawing, status transitions, and duplicate candidate reveal. Under `prefers-reduced-motion: reduce`, remove transforms and set durations to `0.01ms`.

- [ ] **Step 3: Implement duplicate confirmation and public profile states**

`ProfileForm.svelte` submits once with `confirmDuplicate: false`. On `DUPLICATE_CONFIRMATION_REQUIRED`, render candidates and two actions: `Kembali periksa data` and `Bukan saya, lanjutkan`. The second action resubmits with `confirmDuplicate: true`. Public profile renders initials from the first character of the first two name segments.

- [ ] **Step 4: Verify UI, SSR, and reduced motion**

Run:

```bash
pnpm typecheck
pnpm build
```

Expected: all pass and built HTML contains the `ea2c49f4` direction-contract seed.

- [ ] **Step 5: Commit identity UI**

```bash
git add src/layouts src/styles src/pages src/components
git commit -m "feat: Add Filmstrip Cobalt identity experience"
```

---

### Task 7: Add security, error mapping, audit events, and rate limits

**Files:**
- Create: `src/server/http/app-error.ts`
- Create: `src/server/http/error-middleware.ts`
- Create: `src/server/http/request-context.ts`
- Create: `src/server/http/security.ts`
- Create: `src/server/audit/audit-service.ts`
- Create: `tests/integration/security.test.ts`
- Create: `tests/integration/audit.test.ts`
- Modify: `src/server/http/create-api-app.ts`
- Modify: `src/server/modules/invitations/invitation-service.ts`
- Modify: `src/server/modules/profiles/profile-service.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `AppError(code, status, message, fields?, details?)`.
- Produces: `errorMiddleware` response `{ error: { code, message, fields?, details? }, requestId }`.
- Produces: `audit.record({ actorUserId, eventType, subjectType, subjectId, metadata })`.

- [ ] **Step 1: Install focused HTTP security dependencies**

```bash
pnpm add helmet express-rate-limit
```

- [ ] **Step 2: Implement the HTTP safety envelope**

Generate or preserve `X-Request-Id`, add Helmet, enforce JSON `64kb`, verify same-origin on mutations, and apply independent rate limits to invitation start and login start. Unexpected errors log JSON containing request ID, method, path, and stack while redacting cookies, authorization, email, tokens, and URLs.

```ts
export class AppError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    message: string,
    readonly fields?: Record<string, string>,
    readonly details?: Record<string, unknown>
  ) {
    super(message);
  }
}
```

Add integration coverage for revoked invitation error status and Indonesian message, request ID propagation, standardized unexpected errors, rate limits on invitation/login starts, redacted logs, and audit rows without raw tokens or magic-link URLs.

- [ ] **Step 3: Record transactional audit events**

Invitation create/revoke/redeem and profile create/update write audit rows in the same database transaction as the state change. Metadata includes invitation label or changed profile field names, never raw values that contain secrets.

- [ ] **Step 4: Verify the security matrix**

Run:

```bash
pnpm test:integration -- tests/integration/security.test.ts tests/integration/audit.test.ts
pnpm typecheck
```

Expected: all pass, including unauthorized, forbidden, rate-limited, revoked, expired, email-mismatch, and unexpected-error cases.

- [ ] **Step 5: Commit security hardening**

```bash
git add src/server/http src/server/audit src/server/modules package.json pnpm-lock.yaml tests
git commit -m "feat: Harden identity security and auditing"
```

---

### Task 8: Prove the vertical slice and production runtime

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/identity-flow.spec.ts`
- Create: `tests/e2e/reduced-motion.spec.ts`
- Create: `tests/e2e/helpers.ts`
- Create: `Dockerfile`
- Create: `README.md`
- Create: `.impeccable/review/` screenshots during verification
- Modify: `server/run-server.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: every prior HTTP, domain, mail-sink, SSR, and UI contract.
- Produces: one Docker-ready Node service and complete acceptance evidence.
- Produces: `createInvitationFixture(request): Promise<{ url: string }>` and `latestDevelopmentMagicLink(request, email): Promise<string>` in `tests/e2e/helpers.ts`.

- [ ] **Step 1: Install Playwright and browser dependencies**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

- [ ] **Step 2: Implement the browser vertical-slice test**

```ts
test("shared invitation publishes an owned public profile", async ({ page, request }) => {
  const invite = await createInvitationFixture(request);
  await page.goto(invite.url);
  await page.getByLabel("Email").fill("member@example.test");
  await page.getByRole("button", { name: "Kirim tautan masuk" }).click();
  const magicLink = await latestDevelopmentMagicLink(request, "member@example.test");
  await page.goto(magicLink);
  await page.getByLabel("Nama lengkap").fill("Muhammad Faisal");
  await page.getByLabel("Angkatan").fill("2018");
  await page.getByRole("button", { name: "Simpan profil" }).click();
  await expect(page).toHaveURL(/\/people\/muhammad-faisal/);
  await expect(page.getByRole("heading", { name: "Muhammad Faisal" })).toBeVisible();
});
```

- [ ] **Step 3: Run E2E and resolve integration defects**

Run: `pnpm test:e2e -- tests/e2e/identity-flow.spec.ts`  
Expected: the complete invitation-to-public-profile flow passes. Fix only defects revealed by this run before proceeding.

- [ ] **Step 4: Complete production server and Docker image**

`server/run-server.mjs` must:

```js
import express from "express";
import { handler as astroHandler } from "../dist/server/entry.mjs";
import { createApiApp } from "../dist/server-app/http/create-api-app.js";
import { createProductionDependencies } from "../dist/server-app/composition.js";

const deps = await createProductionDependencies(process.env);
const app = createApiApp(deps);
app.use("/_astro", express.static("dist/client/_astro", {
  immutable: true,
  maxAge: "1y",
  index: false
}));
app.use(express.static("dist/client", { maxAge: "1h", index: false }));
app.use(astroHandler);
app.listen(Number(process.env.PORT ?? 4321), "0.0.0.0");
```

Docker uses a pnpm build stage and a Node `22` slim runtime stage, runs migrations as an explicit release command rather than on every process boot, and starts `node server/run-server.mjs`.

- [ ] **Step 5: Finish E2E and reduced-motion coverage**

Add cases for returning login, same link used by a second email, revoked link, duplicate warning confirmation, logout protection, public profile without session, and `prefers-reduced-motion: reduce` with all content visible.

- [ ] **Step 6: Run the complete verification matrix**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
docker build -t soonwiki:foundation .
```

Expected: every command exits `0`.

- [ ] **Step 7: Run the Impeccable UI finish workflow**

Read `C:/Users/DianSetiawan/.agents/skills/impeccable/reference/craft-floor.md`, then:

1. capture mobile and desktop screenshots into `.impeccable/review/`;
2. compare identity surfaces against `.impeccable/mocks/homepage-contact-sheet-b.png` for palette, type character, line treatment, and component grammar;
3. run `node C:/Users/DianSetiawan/.agents/skills/impeccable/scripts/detect.mjs --json src/layouts/BaseLayout.astro src/styles src/pages/join src/pages/login.astro src/pages/me/edit.astro src/pages/people src/components/svelte` once;
4. run the required finish reviewer;
5. apply at most the bounded correction rounds allowed by the approved design workflow;
6. run the documenter so the shipped world creates `DESIGN.md` and its sidecar;
7. verify every shipping raster has embedded provenance.

- [ ] **Step 8: Verify repository state and commit delivery evidence**

```bash
git status --short
git add README.md Dockerfile playwright.config.ts tests/e2e .impeccable/review DESIGN.md package.json pnpm-lock.yaml server
git commit -m "chore: Complete Foundation and Identity verification"
git status --short
```

Expected: final working tree is clean and commit history remains split by task.

---

## Final Acceptance Checklist

- [ ] One reusable shared invitation registers at least two distinct verified emails.
- [ ] Revocation blocks new attempts and pending completions without disabling existing members.
- [ ] Direct magic-link signup cannot bypass invitation eligibility.
- [ ] Pending users cannot write; member and admin roles can pass the appropriate guards.
- [ ] One member cannot own two profiles or update another member's profile.
- [ ] Duplicate name + batch requires explicit confirmation but creates no claim flow.
- [ ] Saved profile is immediately available at a public SSR slug with no auth metadata.
- [ ] Returning-member login works without reusing an invitation.
- [ ] UI copy is Indonesian, Plus Jakarta Sans is self-hosted, and reduced motion is honored.
- [ ] Production starts as one Node process serving Express API, static assets, and Astro SSR.
- [ ] Integration, E2E, typecheck, build, Docker build, design detector, finish review, and design documentation gates are complete. Unit-test/TDD coverage is intentionally omitted per user instruction.
