---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

SCOPE AND VISITOR MODE
Homepage (`src/pages/index.astro`), Persuade-adjacent Experience: the visitor's job is to be inspired by a real journey, not to operate a directory.

AUDIENCE, JOB, ACTION, PROOF, CONSTRAINTS
- Audience: public visitors arriving from WhatsApp/Instagram/group-chat links, and SoonMates checking their own community.
- Job: encounter one honest alumni journey, sense its turning point, then discover many other valid paths.
- Action: continue into a profile, a field/batch/place collection, or Explore; search is a secondary utility, never the hero.
- Proof/content: real published profile data only (featured profile picked by richest available story, deterministic fallback to most recently updated); no invented counts, testimonials, or achievements.
- Constraints: mobile-first; no employer/company framed as success; honor prefers-reduced-motion; SSR content visible before hydration.

CHOSEN DIRECTION AND MEMORABLE MOMENT
Lembar Kontak Redaksi, code-led (no image comp — see BaseLayout.astro direction contract for the full THESIS/OWN-WORLD/STORY/FIRST VIEWPORT/FORM/FINISH blocks). Memorable moment: the shared-element transition where a contact-sheet portrait becomes the profile hero on navigation.

UNRESOLVED DECISIONS
- Exact copy for the turning-point headline and chapter captions depends on which profile is actually published first (no seed data yet).
- Number of contact-sheet cards shown before "lihat semua" truncation not yet tuned against real content volume.
