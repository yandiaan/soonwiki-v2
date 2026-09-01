# SoonWiki Supabase Story-First Design

Tanggal: 1 September 2026

Status: Approved in chat; awaiting written-spec review

Scope: MVP architecture, product hierarchy, inclusive content model, visual system, motion, and quality strategy

## 1. Purpose

SoonWiki is a living alumni archive that helps people see the many possible lives that can grow from SOON. The primary visitor job is not finding a specific person. It is encountering honest alumni journeys, recognizing turning points, and leaving with a broader sense of what is possible.

The MVP preserves the functional scope of `docs/PRD.md` while changing its hierarchy:

```text
personal story
  -> turning point
  -> proud moment
  -> many possible paths
  -> contextual exploration
  -> search when needed
```

Search remains important, but it is a secondary utility inside Explore rather than the homepage thesis.

## 2. Approved Product Principles

1. Inspiration first. A human journey appears before directory controls.
2. Many valid lives. Employment at a company is never treated as the default or the definition of success.
3. Proud without ranking. A proud moment may be a work, contribution, business, public service, skill, survival, transition, or personal milestone.
4. Story backed by specifics. Narrative prompts are interwoven with journey entries and proud moments.
5. Low-friction contribution. A member can create and update a useful profile in minutes.
6. Mobile before desktop. The primary scene is a link opened from WhatsApp, Instagram, or a group chat with one hand.
7. Backend restraint. Supabase handles everything it reasonably can on the free tier; no parallel backend stack is introduced.

## 3. Language and Inclusion Contract

The UI must use language that welcomes informal, non-linear, blue-collar, entrepreneurial, governmental, educational, community, freelance, caregiving, and transitional life paths.

| Avoid as the default | Use instead |
| --- | --- |
| Pekerjaan sekarang | Lagi menjalani apa sekarang? |
| Role | Peran atau kegiatan |
| Company | Tempat, organisasi, atau usaha (opsional) |
| Career history | Perjalanan |
| Expertise | Hal yang ditekuni |
| Achievement | Hal yang dibanggakan |

Journey entries do not require a category. A member writes a role or activity, an optional place, an optional period, and a short story. If categories are added later, they must never be required for publishing.

## 4. Technical Architecture

### 4.1 Frontend

- Astro SSR owns routing, layouts, metadata, public rendering, and non-interactive content.
- Astro uses the standalone Node adapter as the portable SSR baseline; selecting a production host is a separate delivery decision and does not change the Supabase backend boundary.
- Svelte islands own interaction-heavy regions only.
- TypeScript is strict across Astro, Svelte, and Supabase integration code.
- Plus Jakarta Sans Variable is self-hosted.
- The `motion` JavaScript package provides springs, sequences, shared view transitions, scroll-linked motion, and SVG animation.
- Native CSS and View Transitions handle lightweight cases where JavaScript is unnecessary.

The application is not a full SPA. Public content must be visible before hydration and remain shareable and indexable.

### 4.2 Backend

Supabase is the single backend platform:

- Supabase Postgres for relational data.
- Supabase Auth for Google OAuth only.
- Supabase Storage for profile and proud-moment images.
- Row Level Security for authorization.
- SQL migrations and database functions for schema and transactional behavior.
- Supabase Edge Functions only for shared-invitation redemption and other operations that require a secret key.

The MVP does not introduce Express, a custom REST API, Drizzle or another ORM, Better Auth, S3 abstraction, microservices, background jobs, Realtime, a graph database, a vector database, or a dedicated search engine.

### 4.3 Data Access Boundary

- Astro SSR uses a request-scoped Supabase client and forwards the authenticated session safely.
- Public SSR queries read published records through public-safe views or RLS-protected tables.
- Svelte islands use the browser Supabase client for authorized mutations and interactive reads.
- Privileged keys exist only inside Supabase Edge Functions and deployment secrets. They never reach Astro client bundles or browser storage.
- Database ownership and membership checks remain authoritative even if the UI is bypassed.

## 5. Authentication and Reusable Invitation

### 5.1 Membership Flow

```text
/join/:sharedToken
  -> validate active invitation
  -> create short-lived one-time attempt
  -> continue with Google
  -> Supabase OAuth callback
  -> atomically consume attempt
  -> create member + redemption audit row
  -> profile onboarding
```

The raw shared token is stored only as a secure hash. It may be reused by tens of people in a group chat and has no automatic expiry or use limit in the MVP. An admin can revoke or rotate it.

Each OAuth account may redeem only once. A short-lived opaque attempt binds the invitation visit to the OAuth completion. The join action asks the Edge Function to create the attempt, stores the opaque value in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie on the SoonWiki origin, and then starts Supabase's Google PKCE flow. The callback exchanges the authorization code, completes redemption through the Edge Function, and clears the attempt cookie. OAuth cancellation returns the visitor to the join screen without discarding a still-valid attempt.

The Astro action and callback only orchestrate browser-safe Supabase calls and session cookies. They do not form a parallel business API; validation, membership creation, and privileged writes remain inside Supabase.

### 5.2 Existing Member Login

Returning members use the same Google OAuth provider without an invitation. After callback, membership lookup sends them directly to their profile or the last safe destination.

### 5.3 Inert Auth Identities

Supabase OAuth may create an Auth identity before application membership is granted. This identity has no write access by itself. All member mutations require an active row in `members`, enforced through RLS. A person who bypasses the join entry point remains a public reader and cannot create or edit profile content.

## 6. Data Model

### 6.1 Membership and Invitations

`members`

- `user_id` references `auth.users` and is unique.
- `role`: `member` or `admin`.
- `status`: `active` or `disabled`.
- `joined_at`, `updated_at`.

`shared_invitations`

- `id`, `token_hash`, `label`.
- `status`: `active` or `revoked`.
- `created_by`, `created_at`, `revoked_at`.

`invitation_attempts`

- `id`, `invitation_id`, `opaque_token_hash`.
- `expires_at`, `consumed_at`, `created_at`.

`invitation_redemptions`

- `id`, `invitation_id`, `user_id`, `redeemed_at`.
- Unique constraint on `user_id` prevents repeated redemption.

### 6.2 Profiles and Stories

`profiles`

- Ownership: `owner_id` references the active member.
- Public identity: `name`, `slug`, `photo_path`, `batch_year`, `bio`, `location`.
- Current chapter: `current_activity`, optional `current_place_id`.
- Narrative prompts: `since_soon_story`, `turning_point_story`, `current_direction_story`.
- Optional social links.
- Publishing and timestamps: `is_published`, `created_at`, `updated_at`.

The three narrative prompts answer:

1. Apa yang berubah sejak kamu di SOON?
2. Turning point terbesar dalam perjalananmu?
3. Apa yang sedang kamu bangun atau tuju sekarang?

`journey_entries`

- `id`, `profile_id`.
- `activity`, optional `place_id`.
- Optional `start_year`, `end_year`, and `story`.
- `sort_order`, `created_at`, `updated_at`.

`places`

- Covers a business, institution, government body, community, workshop, company, collective, or other named place.
- `id`, `name`, `slug`, optional `website_url`.

`fields` and `profile_fields`

- Represent things a person practices or explores.
- Preserve many-to-many discovery without imposing a professional taxonomy.

`proud_moments`

- `id`, `profile_id`, `title`.
- Optional `description`, `place_id`, `year`, `image_path`, `external_url`.
- Ordered newest first, falling back to `created_at`.

`reports`

- Targets a profile or proud moment.
- `reason`, optional `description`, `status`, reporter and resolution metadata.

### 6.3 Duplicate Handling

Similar normalized name plus batch returns a duplicate warning. It does not block creation. The member may confirm that the candidates are different people. Admin resolves ownership corrections or duplicates manually.

## 7. Authorization and Storage

RLS policies enforce these rules:

- Anonymous and authenticated visitors may read published public content.
- An Auth identity without active membership cannot create or mutate community content.
- A member may create at most one profile.
- A member may mutate only rows owned through their profile.
- Admin permissions are explicit and separate from member ownership policies.
- Reports may be submitted through the narrow policy defined for their actor type.

Storage buckets follow the same ownership rule. Upload paths begin with the authenticated user ID. Profile and proud-moment images are client-compressed before upload; accepted formats and size limits are validated again at the storage boundary. Public rendering never exposes original private metadata.

## 8. Experience Architecture

### 8.1 Homepage

The homepage answers a different question from a directory:

> What kinds of lives have grown from SOON?

Its narrative order is:

1. One featured alumni portrait and a compelling turning-point line.
2. A short chapter sequence: SOON, turning point, current direction.
3. A proud moment that grounds the story in something specific.
4. A diverse contact sheet showing that there is no single valid path.
5. Contextual exploration through fields, batches, places, and related journeys.
6. Search as a clear utility inside Explore and a navigation quick action.

Homepage statistics are supporting evidence, not the hero. They must never use invented counts.

### 8.2 Explore

Explore supports browsing by people, journeys, fields, batches, and places. Search and combinable filters live here. Search ranking continues to prioritize exact name, partial name, place, activity, and field matches, but the presentation should reveal a story preview rather than only a directory row.

### 8.3 Profile

The profile is a readable personal journey:

1. Portrait and current chapter.
2. What changed since SOON.
3. Journey timeline.
4. Turning point.
5. Proud moments.
6. What the person is building or moving toward.
7. Related journeys.

Empty optional sections are omitted rather than displayed as incomplete profile warnings.

### 8.4 Contribution

Onboarding collects basic identity, current chapter, and the three narrative prompts. The member may publish with only required identity fields and return later.

The editor is one mobile-friendly scrolling workspace, not a complex wizard. It provides section status, local draft preservation, a reachable sticky save action, explicit saving/saved/error states, and public preview.

### 8.5 Admin

Admin surfaces prioritize scanability and safe actions over expressive motion. They cover people, journeys, proud moments, fields, places, reports, and shared invitation creation/revocation.

## 9. Visual World

The approved visual direction is **Lembar Kontak Redaksi**.

- Warm newsprint ground.
- Near-black ink.
- Committed cobalt fields.
- Signal orange metadata and accents.
- Documentary portraits.
- Hard editorial rules, numbered frames, contact sheets, and caption strips.
- Plus Jakarta Sans with strong scale and weight contrast.
- Proud, warm, contemporary, and lightly nostalgic without looking corporate.

The world must not collapse into a generic rounded-card directory, glass dashboard, gradient-heavy landing page, or photography portfolio template.

The existing approved visual reference remains `.impeccable/mocks/homepage-contact-sheet-b.png`. A new high-fidelity composition round will adapt it to the approved story-first homepage before implementation.

## 10. Motion Language

The signature interaction is:

```text
discover portrait
  -> selected frame lifts
  -> portrait and caption travel across the page transition
  -> profile chapters unfold progressively
```

Motion hierarchy:

- One orchestrated entrance for the first viewport.
- Shared-element transitions between contact sheet and profile.
- Progressive reveals and restrained timeline drawing for story chapters.
- Tactile spring feedback for save, filter, upload, and selection states.
- Ambient continuous motion is exceptional, not default.

Mobile guardrails:

- Vertical scrolling remains native; no scroll hijacking.
- Horizontal gestures exist only on clearly bounded rails.
- Primary actions remain within practical thumb reach and meet a 44px minimum target.
- Transform and opacity are the default animated properties.
- Content is visible without waiting for animation.
- `prefers-reduced-motion` removes transforms and sequencing while preserving hierarchy and feedback.

## 11. Component Boundaries

Astro owns page shells, SEO metadata, SSR content, and static composition. Svelte islands are bounded by interaction:

- `StoryRail`
- `JourneyTimeline`
- `ExploreFilters`
- `ProfileEditor`
- `MediaUploader`
- `JoinWithGoogle`
- Mobile navigation and focused dialogs

Shared primitives remain small: button, field, portrait frame, caption, metadata strip, dialog, toast, empty state, and loading indicator. Motion choreography stays close to the surface that owns it; there is no speculative global animation framework.

## 12. Error and Empty States

- Invalid or revoked invitation explains that a newer invitation is required.
- OAuth cancellation returns to join and keeps a still-valid attempt.
- Expired attempt restarts from the same reusable shared link.
- An unauthorized Auth identity sees public content and a clear invitation requirement, never a broken editor.
- Save failure preserves every field and presents a reachable retry action.
- Upload failure preserves text content and local draft state.
- No-results states suggest another field, batch, place, or journey rather than framing the archive as empty.
- Empty optional profile sections disappear cleanly.
- All user-facing errors are in natural Bahasa Indonesia and never expose provider, SQL, token, or policy details.

## 13. Quality Strategy Without Test Code

The repository must not contain:

- Unit, integration, or E2E tests.
- Jest, Vitest, Playwright, Cypress, or another test runner.
- `tests/` directories, `*.test.*`, `*.spec.*`, or test scripts.
- CI jobs that execute automated tests.

Allowed and required quality gates:

- Lint and formatting checks.
- TypeScript, Svelte, and Astro type checking.
- Supabase schema and SQL linting.
- Production build.
- Manual invitation, OAuth, RLS ownership, CRUD, upload, reporting, and admin validation.
- Batched mobile and desktop screenshot review.
- Manual keyboard, focus, semantics, labels, contrast, and reduced-motion review.
- Browser inspection for hydration cost, responsive images, animation smoothness, and layout shift.
- One Impeccable detector pass and the required independent visual finish review during UI delivery.

Acceptance evidence consists of command output, a concise manual checklist, and validated screenshots. It does not include test code.

## 14. Delivery Boundaries

The first implementation plan must cover the technical foundation and one coherent story-first vertical slice without expanding into future social features. It should include:

- Astro + Svelte foundation and code standards.
- Supabase local/development configuration, migrations, types, and RLS.
- Reusable invitation + Google OAuth membership.
- Story-first homepage and Explore shell.
- Profile creation/editing with narrative prompts and journey entries.
- Public profile journey.
- Supabase Storage image path.
- Minimal admin invitation and content-management surfaces required by the PRD.
- Lint, typecheck, schema lint, build, and manual finish workflow.

Follow, like, comment, messaging, recommendation algorithms, job marketplace, AI search, notification systems, and other PRD non-goals remain out of scope.

## 15. Acceptance Conditions

- A shared invitation can onboard multiple distinct Google accounts.
- One Google account cannot create multiple memberships or profiles.
- Revoking an invitation blocks new redemptions without disabling existing members.
- A direct OAuth identity without membership cannot write community data.
- Public visitors can read published stories without authentication.
- A profile supports non-company and non-linear journeys without missing-field pressure.
- Homepage leads with an alumni journey and keeps search secondary.
- Profile storytelling combines narrative prompts, journey entries, and proud moments.
- Mobile navigation and editing work comfortably with one hand.
- Motion follows the approved signature interaction and reduced-motion contract.
- Supabase is the only backend platform.
- No automated test code or test scripts exist.
- Lint, typecheck, schema lint, production build, manual functional review, and visual finish review are complete.
