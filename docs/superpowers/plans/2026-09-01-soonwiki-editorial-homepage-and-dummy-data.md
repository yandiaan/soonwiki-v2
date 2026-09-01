# SoonWiki Editorial Homepage & Comprehensive Dummy Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rich, multi-dimensional *Editorial Living Archive* homepage and provide a comprehensive, authentic synthetic seed dataset (6–8 complete Soonies profiles) in Supabase.

**Architecture:** Extend Supabase `seed.sql` with complete dummy profiles, relationships, journeys, and proud moments. Enrich `getHomeStoryData()` in `public-repository.ts` to return community metrics and turning-point highlights. Introduce `TurningPointMosaic.astro` and upgrade homepage components (`PublicHero`, `FeaturedJourney`, `index.astro`).

**Tech Stack:** Astro SSR with Node adapter, Svelte 5, TypeScript strict, Supabase PostgreSQL / RLS, CSS Tokens (`Plus Jakarta Sans Variable`), ESLint, Prettier.

## Global Constraints

- Supabase is the only backend platform; all seed data belongs in `supabase/seed.sql`.
- Public content is server-rendered (SSR) and visible before hydration.
- Bahasa Indonesia is the primary UI language.
- Inclusive copy conventions: `Perjalanan`, `Peran atau kegiatan`, `Tempat, organisasi, atau usaha`, `Hal yang ditekuni`, and `Hal yang dibanggakan`.
- No employer/company framed as the sole measure of success.
- Visual world: *Public Community Gallery* with tokens `--canvas`, `--surface`, `--surface-muted`, `--ink`, `--ink-soft`, `--accent`, `--line-soft`.
- Honor `prefers-reduced-motion`.
- Do not install test runners; verification uses `pnpm db:reset`, `pnpm db:lint`, `pnpm format:check`, `pnpm lint`, `pnpm check`, and `pnpm build`.

---

### Task 1: Author the comprehensive synthetic dummy dataset in `supabase/seed.sql`

**Files:**
- Modify: `supabase/seed.sql`

**Interfaces:**
- Produces: 6 distinct members in `auth.users` & `public.members` with IDs `00000000-0000-0000-0000-000000000001` through `00000000-0000-0000-0000-000000000006`.
- Produces: 6 complete published profiles in `public.profiles` (`nadia-pramesti`, `rian-mahendra`, `siti-nurhaliza`, `bima-arya`, `farhan-akbar`, `clarissa-utami`) with complete narrative fields (`since_soon_story`, `turning_point_story`, `current_direction_story`).
- Produces: associated records in `public.fields`, `public.places`, `public.profile_fields`, `public.journey_entries`, and `public.proud_moments`.

- [ ] **Step 1: Write the complete seed script in `supabase/seed.sql`**

Populate fields, places, auth users, members, published profiles, profile_fields mappings, journey entries, and proud moments with realistic Indonesian stories across batches 2018–2023.

- [ ] **Step 2: Reset database and verify seed execution**

Run:
```bash
pnpm db:reset
```
Expected: Database resets cleanly and applies `seed.sql` without foreign key or constraint errors.

- [ ] **Step 3: Commit seed dataset**

```bash
git add supabase/seed.sql
git commit -m "feat: Add comprehensive authentic seed dataset for local development"
```

---

### Task 2: Enrich public repository queries in `src/lib/server/public-repository.ts`

**Files:**
- Modify: `src/lib/shared/public-models.ts`
- Modify: `src/lib/server/public-repository.ts`

**Interfaces:**
- Modifies: `HomeStory` type to include `turningPoints` and `stats`:
  ```ts
  export interface TurningPointHighlight {
    profileId: string;
    profileName: string;
    profileSlug: string;
    batchYear: number;
    activity: string | null;
    placeName: string | null;
    quote: string;
  }

  export interface CommunityStats {
    totalStories: number;
    totalFields: number;
    totalBatches: number;
  }

  export interface HomeStory {
    featured: ProfileDetail;
    contactSheet: ProfileCard[];
    turningPoints: TurningPointHighlight[];
    proudMoment?: ProudMoment;
    totalPublishedProfiles: number;
    stats: CommunityStats;
  }
  ```
- Modifies: `getHomeStoryData(context)` to query published profiles with turning points and calculate distinct fields/batches.

- [ ] **Step 1: Update `public-models.ts` with new interfaces**
- [ ] **Step 2: Update `getHomeStoryData()` in `public-repository.ts`**
- [ ] **Step 3: Run type check**

Run:
```bash
pnpm check
```
Expected: 0 errors.

- [ ] **Step 4: Commit repository changes**

```bash
git add src/lib/shared/public-models.ts src/lib/server/public-repository.ts
git commit -m "feat: Enrich public repository with turning point highlights and community stats"
```

---

### Task 3: Build the `TurningPointMosaic.astro` component

**Files:**
- Create: `src/components/astro/TurningPointMosaic.astro`

**Interfaces:**
- Consumes: `highlights: TurningPointHighlight[]`
- Produces: an asymmetric 3-card editorial grid showcasing pullquotes of inflection points from different Soonies with link to profile.

- [ ] **Step 1: Create `src/components/astro/TurningPointMosaic.astro`**

Implement the component with responsive CSS grid, editorial typography, large stylized quotation marks, author meta strip, and clean hover states.

- [ ] **Step 2: Run check**

Run:
```bash
pnpm check
```

- [ ] **Step 3: Commit `TurningPointMosaic.astro`**

```bash
git add src/components/astro/TurningPointMosaic.astro
git commit -m "feat: Add TurningPointMosaic component for homepage story highlights"
```

---

### Task 4: Upgrade `PublicHero.astro` with community metric badges

**Files:**
- Modify: `src/components/astro/PublicHero.astro`

**Interfaces:**
- Consumes: `stats?: CommunityStats`
- Produces: Metric badges rendered under the hero actions (`X Kisah terbit · Y Bidang ditekuni · Z Angkatan Soonies`).

- [ ] **Step 1: Update `PublicHero.astro` props and template**
- [ ] **Step 2: Add CSS styling for `.public-hero__metrics`**
- [ ] **Step 3: Run check**

Run:
```bash
pnpm check
```

- [ ] **Step 4: Commit hero upgrades**

```bash
git add src/components/astro/PublicHero.astro
git commit -m "feat: Add community metric badges to PublicHero"
```

---

### Task 5: Upgrade `FeaturedJourney.astro` and assemble the homepage in `src/pages/index.astro`

**Files:**
- Modify: `src/components/astro/FeaturedJourney.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Assembles: `PublicHero` (with stats), `PublicIntroduction`, `FeaturedJourney` (with turning-point pullquote), `TurningPointMosaic`, `PossibilityContactSheet`, `ProudMomentFrame`, and `ExplorePathways`.

- [ ] **Step 1: Enhance `FeaturedJourney.astro` with turning-point pullquote treatment**
- [ ] **Step 2: Update `src/pages/index.astro` to include `TurningPointMosaic` and pass stats to `PublicHero`**
- [ ] **Step 3: Run quality checks and verify layout**

Run:
```bash
pnpm format
pnpm lint
pnpm check
pnpm build
```
Expected: All commands exit 0.

- [ ] **Step 4: Commit homepage composition**

```bash
git add src/components/astro/FeaturedJourney.astro src/pages/index.astro
git commit -m "feat: Compose rich editorial homepage with turning point highlights"
```

---

### Task 6: Final Verification & Operational Review

- [ ] **Step 1: Execute full database reset and build pipeline**
- [ ] **Step 2: Verify production build output**
- [ ] **Step 3: Commit any final polish**
