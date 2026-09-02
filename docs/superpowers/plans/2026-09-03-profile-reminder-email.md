# Profile Reminder Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement branded HTML profile reminder emails via Resend with single and bulk dispatch controls on the SoonWiki admin dashboard.

**Architecture:** A server-side email service (`src/lib/server/email-service.ts`) renders responsive editorial HTML and delivers via Resend API (`resend` / REST). The admin repository (`src/lib/server/admin-repository.ts`) queries members with unpublished/draft profiles and their emails, and the admin page (`src/pages/admin/people.astro`) provides trigger controls and delivery feedback.

**Tech Stack:** Astro SSR, Svelte 5, Supabase (Postgres & SSR client), Resend REST/SDK, TypeScript.

## Global Constraints

- Design system adherence: Palette uses `#f7f6f2` (warm linen), `#ffffff` (surface), `#23376e` (architectural indigo), `#121514` (ink), `#575e59` (ink soft), and `#c84428` (terracotta/vermilion).
- Sender address: `SoonWiki <no-reply@soonwiki.com>`.
- Security: Only active admin sessions (`role === 'admin' && status === 'active'`) can trigger reminder emails.
- Resend API key: loaded from `process.env.RESEND_API_KEY` or `import.meta.env.RESEND_API_KEY`.

---

### Task 1: Email Template Generator & Resend Email Service

**Files:**
- Create: `src/lib/server/email-service.ts`
- Create: `src/lib/server/email-service.test.ts` or standalone verification script

**Interfaces:**
- Produces:
  ```typescript
  export interface ReminderRecipient {
    userId: string;
    email: string;
    name: string;
  }

  export interface EmailSendResult {
    ok: boolean;
    id?: string;
    error?: string;
  }

  export interface BatchReminderSummary {
    total: number;
    successCount: number;
    failedCount: number;
    failures: Array<{ email: string; reason: string }>;
  }

  export function buildProfileReminderHtml(params: { name: string; editUrl: string }): string;
  export function sendProfileReminderEmail(recipient: ReminderRecipient, siteUrl?: string): Promise<EmailSendResult>;
  export function sendBatchProfileReminders(recipients: ReminderRecipient[], siteUrl?: string): Promise<BatchReminderSummary>;
  ```

- [ ] **Step 1: Write `src/lib/server/email-service.ts`** with rich responsive HTML template and Resend API integration.
- [ ] **Step 2: Write test / verification function** to assert HTML output includes proper colors, CTAs, unsubscribe/footer, and escapes user inputs safely.
- [ ] **Step 3: Verify TypeScript compilation** of email service.

---

### Task 2: Admin Repository Queries for Unpublished Members

**Files:**
- Modify: `src/lib/server/admin-repository.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface AdminMemberProfileRow {
    userId: string;
    email: string;
    name: string;
    slug: string | null;
    generationKey: string | null;
    profileId: string | null;
    isPublished: boolean;
    hasProfile: boolean;
    updatedAt: string;
  }

  export async function listAllMemberProfilesForAdmin(
    client: Client,
    search?: string
  ): Promise<AdminResult<AdminMemberProfileRow[]>>;

  export async function getUnpublishedMembers(
    client: Client
  ): Promise<AdminResult<ReminderRecipient[]>>;
  ```

- [ ] **Step 1: Update `src/lib/server/admin-repository.ts`** to fetch members, their profile status (published, draft, or uninitialized), and user emails.
- [ ] **Step 2: Add `getUnpublishedMembers`** helper for bulk reminder dispatch.
- [ ] **Step 3: Verify `admin-repository.ts`** types and exports.

---

### Task 3: Admin UI Enhancements in `/admin/people.astro`

**Files:**
- Modify: `src/pages/admin/people.astro`

- [ ] **Step 1: Handle POST actions** for `send-reminder` (single) and `send-all-reminders` (bulk).
- [ ] **Step 2: Update table view** to show member email, clear status badges (`Terbit`, `Draf`, `Belum Isi`), and single "Kirim Pengingat" button.
- [ ] **Step 3: Add bulk action header** with "Kirim Pengingat ke Semua Draf ([N] Orang)".
- [ ] **Step 4: Display clear feedback alerts** on success or failure with recipient counts.

---

### Task 4: Integration Verification & Environment Configuration

**Files:**
- Modify: `.env` (ensure `RESEND_API_KEY` is present for local development)
- Run: `pnpm run check` and `pnpm run lint`

- [ ] **Step 1: Add `RESEND_API_KEY=<your_resend_api_key>`** to local `.env`.
- [ ] **Step 2: Run type check & linter** (`pnpm run check` & `pnpm run lint`).
- [ ] **Step 3: Perform verification test** of email rendering and admin workflow.
