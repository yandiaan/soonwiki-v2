# Design Specification: Profile Reminder Email via Resend

**Date**: 2026-09-03  
**Status**: Approved  
**Topic**: Profile Completion & Publishing Reminder Email for SoonWiki  

---

## 1. Overview & Objectives

SoonWiki relies on its members sharing their journeys, memories, and proud moments to build a living community archive. Some members sign up or accept invitations but have not yet filled in their details or published their profile.

This feature enables administrators to:
1. Identify all active members whose profiles are in **Draft** (`is_published: false`) or **Uninitialized** (no `profiles` record created yet).
2. Send rich, beautifully styled reminder emails via **Resend** that match SoonWiki's editorial brand identity (`DESIGN.md`).
3. Trigger reminders either individually or in bulk directly from the `/admin/people` dashboard.

---

## 2. Visual & Template Design (HTML Email)

The email template adheres strictly to SoonWiki's editorial design system:

### 2.1 Color Palette & Typography
- **Background (Canvas)**: `#f7f6f2` (Warm linen newsprint)
- **Container / Card (Surface)**: `#ffffff` with `#e5e7eb` hairline border and subtle rounded corners.
- **Header Accent**: `#23376e` (Architectural indigo)
- **Primary Text (Ink)**: `#121514` (Deep slate)
- **Supporting Text (Ink Soft)**: `#575e59` (Muted gray)
- **CTA Button (Signal)**: `#c84428` (Warm terracotta/vermilion) with bold white text.
- **Typography**: Clean sans-serif fallback stack (`Plus Jakarta Sans`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif).

### 2.2 Template Structure
1. **Preheader**: *"Cerita dan jejak langkahmu dinantikan di SoonWiki."*
2. **Branded Header**:
   - Small uppercase kicker: `ARSIP HIDUP KOMUNITAS SOON`
   - Brand title: `SoonWiki`
3. **Salutation & Headline**:
   - Personalized greeting: `Halo, {{name}}`
   - Headline: *"Mari lengkapi dan terbitkan profilmu di SoonWiki"*
4. **Body Narrative**:
   - Short editorial message emphasizing that SoonWiki is a living space to preserve life transitions, journeys, and meaningful moments of SOON community members.
5. **Checklist Guide**:
   - 📸 Pasang Foto Profil
   - 🧭 Tulis Jejak Perjalanan & Titik Balik
   - 🏆 Bagikan Momen Membanggakan
6. **Primary Call-to-Action**:
   - Styled button: **"Lengkapi & Terbitkan Profil"**
   - URL: `{{siteUrl}}/me/edit`
7. **Footer**:
   - Sender note: `SoonWiki · Komunitas Alumni & Rekan SOON`
   - Sent from: `SoonWiki <no-reply@soonwiki.com>`

---

## 3. Architecture & Data Flow

```
+------------------------+
|  Admin Dashboard       |
|  (/admin/people)       |
+-----------+------------+
            |
            | POST action: 'send-reminder' / 'send-all-reminders'
            v
+------------------------+       1. Query members & draft profiles
|  Admin Server Action   | -----------------------------------------> +-------------------+
|  (Astro Server Route)  | <----------------------------------------- |  Supabase DB      |
+-----------+------------+       2. Returns user_id, email, name,     |  (members +       |
            |                       publish status                    |   auth.users +    |
            | 3. Render HTML & call                                   |   profiles)       |
            v    Resend API                                           +-------------------+
+------------------------+
|  Email Service         |
|  (src/lib/server/      |
|   email-service.ts)    | -------------------> Resend API (https://api.resend.com/emails)
+------------------------+                      |
                                                v
                                        Delivered to Member
```

### 3.1 Components & Files

1. **`src/lib/server/email-service.ts`**:
   - Resend client integration using `RESEND_API_KEY`.
   - `buildProfileReminderHtml({ name, editUrl })`: generates responsive HTML email markup.
   - `sendProfileReminderEmail({ to, name, editUrl })`: sends a single reminder.
   - `sendBatchProfileReminders(targets)`: iterates through target list with concurrency handling and error tracking.

2. **`src/lib/server/admin-repository.ts`**:
   - Extended `AdminProfileRow` or helper `listUnpublishedMembers(client)` to retrieve members who are:
     - `profiles.is_published = false`, or
     - `members` without a corresponding `profiles` row.
   - Fetches emails securely using the Supabase server client.

3. **`src/pages/admin/people.astro`**:
   - Enriched member table displaying:
     - Member Name & Email
     - Status: `Terbit`, `Draf`, or `Belum Isi Profil`
   - Single "Kirim Pengingat" button per unpublished row.
   - Top action bar button: "Kirim Pengingat ke Semua Draf ([N] Orang)".
   - Toast/status banners indicating success/failure count after submission.

4. **Environment Variables**:
   - `RESEND_API_KEY`: API key for Resend (`<your_resend_api_key>`).
   - `PUBLIC_SITE_URL` / `SITE_URL`: Domain URL (e.g. `https://soonwiki.com` or local fallback).

---

## 4. Error Handling & Edge Cases

- **Missing/Invalid Email**: If a member account lacks an email or has a malformed email, skip and log the error without breaking batch execution.
- **Resend Rate Limits**: Send requests sequentially or with controlled batch concurrency (e.g. 2 requests per second) to respect Resend limits.
- **Authorization**: Only active admins (`role === 'admin' && status === 'active'`) can invoke reminder actions.
- **Unpublished Filter**: Members who already have `is_published === true` are excluded from reminder lists.

---

## 5. Verification Plan

1. **Unit/Integration Test**:
   - Test `buildProfileReminderHtml` outputs valid, well-formed HTML.
   - Test `sendProfileReminderEmail` with a test recipient email address.
2. **Admin UI Verification**:
   - Verify `/admin/people` displays correct badges (`Terbit`, `Draf`, `Belum Isi Profil`).
   - Verify sending individual reminder updates action status message.
   - Verify bulk sending processes all target recipients and summarizes results.
