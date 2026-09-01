<script lang="ts">
  import DuplicateWarning from '@/components/svelte/DuplicateWarning.svelte';
  import FieldPicker from '@/components/svelte/FieldPicker.svelte';
  import JourneyEditor from '@/components/svelte/JourneyEditor.svelte';
  import MediaUploader from '@/components/svelte/MediaUploader.svelte';
  import ProudMomentEditor from '@/components/svelte/ProudMomentEditor.svelte';
  import { clearDraft, loadDraft, saveDraft } from '@/lib/browser/local-draft';
  import { profileInputSchema } from '@/lib/shared/profile-schema';
  import {
    findDuplicateCandidates,
    replaceJourneyEntries,
    replaceProfileFields,
    upsertOwnProfile,
  } from '@/lib/server/member-repository';
  import { createBrowserSupabase } from '@/lib/supabase/browser';

  import type { JourneyEntryDraft } from '@/components/svelte/JourneyEditor.svelte';
  import type {
    DuplicateCandidate,
    OwnJourneyEntry,
    OwnProfile,
    OwnProudMoment,
  } from '@/lib/server/member-repository';

  interface ProfileFormState {
    name: string;
    batchYear: string;
    bio: string;
    location: string;
    currentActivity: string;
    currentPlaceName: string;
    sinceSoonStory: string;
    turningPointStory: string;
    currentDirectionStory: string;
    linkedinUrl: string;
    instagramUrl: string;
    websiteUrl: string;
    isPublished: boolean;
    photoPath: string;
  }

  interface DraftShape {
    form: ProfileFormState;
    journeys: JourneyEntryDraft[];
    selectedFieldIds: string[];
  }

  let {
    userId,
    initialProfile,
    initialJourneys,
    initialFieldIds,
    initialProudMoments,
    availableFields,
  }: {
    userId: string;
    initialProfile: OwnProfile | null;
    initialJourneys: OwnJourneyEntry[];
    initialFieldIds: string[];
    initialProudMoments: OwnProudMoment[];
    availableFields: { id: string; name: string; slug: string }[];
  } = $props();

  function toFormState(profile: OwnProfile | null): ProfileFormState {
    return {
      name: profile?.name ?? '',
      batchYear: profile ? String(profile.batchYear) : '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
      currentActivity: profile?.currentActivity ?? '',
      currentPlaceName: profile?.currentPlaceName ?? '',
      sinceSoonStory: profile?.sinceSoonStory ?? '',
      turningPointStory: profile?.turningPointStory ?? '',
      currentDirectionStory: profile?.currentDirectionStory ?? '',
      linkedinUrl: profile?.linkedinUrl ?? '',
      instagramUrl: profile?.instagramUrl ?? '',
      websiteUrl: profile?.websiteUrl ?? '',
      isPublished: profile?.isPublished ?? false,
      photoPath: profile?.photoPath ?? '',
    };
  }

  function toJourneyDrafts(journeys: OwnJourneyEntry[]): JourneyEntryDraft[] {
    return journeys.map((entry) => ({
      activity: entry.activity,
      placeName: entry.placeName ?? '',
      startYear: entry.startYear ? String(entry.startYear) : '',
      endYear: entry.endYear ? String(entry.endYear) : '',
      story: entry.story ?? '',
    }));
  }

  let profileId = $state(initialProfile?.id ?? null);
  let slug = $state(initialProfile?.slug ?? null);
  let form = $state<ProfileFormState>(toFormState(initialProfile));
  let journeys = $state<JourneyEntryDraft[]>(toJourneyDrafts(initialJourneys));
  let selectedFieldIds = $state<string[]>([...initialFieldIds]);

  let saveState: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' = $state('idle');
  let errorMessage = $state('');
  let duplicateCandidates = $state<DuplicateCandidate[]>([]);
  let duplicateConfirmed = $state(false);
  let showDraftBanner = $state(false);

  let mounted = false;
  let draftTimeout: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const draft = loadDraft<DraftShape>(userId);

    if (
      draft &&
      (!initialProfile || new Date(draft.savedAt) > new Date(initialProfile.updatedAt))
    ) {
      showDraftBanner = true;
    }
  });

  $effect(() => {
    void JSON.stringify({ form, journeys, selectedFieldIds });

    if (!mounted) {
      mounted = true;
      return;
    }

    if (saveState !== 'saving') {
      saveState = 'dirty';
    }

    if (draftTimeout) {
      clearTimeout(draftTimeout);
    }

    draftTimeout = setTimeout(() => {
      saveDraft<DraftShape>(userId, { form, journeys, selectedFieldIds });
    }, 800);
  });

  function restoreDraft() {
    const draft = loadDraft<DraftShape>(userId);

    if (draft) {
      form = draft.data.form;
      journeys = draft.data.journeys;
      selectedFieldIds = draft.data.selectedFieldIds;
    }

    showDraftBanner = false;
  }

  function dismissDraft() {
    clearDraft(userId);
    showDraftBanner = false;
  }

  async function performSave() {
    saveState = 'saving';
    errorMessage = '';

    const parsed = profileInputSchema.safeParse({
      name: form.name,
      batchYear: Number.parseInt(form.batchYear, 10),
      bio: form.bio,
      location: form.location,
      currentActivity: form.currentActivity,
      currentPlaceName: form.currentPlaceName,
      sinceSoonStory: form.sinceSoonStory,
      turningPointStory: form.turningPointStory,
      currentDirectionStory: form.currentDirectionStory,
      linkedinUrl: form.linkedinUrl,
      instagramUrl: form.instagramUrl,
      websiteUrl: form.websiteUrl,
      isPublished: form.isPublished,
    });

    if (!parsed.success) {
      saveState = 'error';
      errorMessage = parsed.error.issues[0]?.message ?? 'Ada data yang belum valid.';
      return;
    }

    const supabase = createBrowserSupabase();
    const profileResult = await upsertOwnProfile(supabase, parsed.data);

    if (!profileResult.ok) {
      saveState = 'error';
      errorMessage = 'Gagal menyimpan profil. Coba lagi.';
      return;
    }

    profileId = profileResult.data.id;
    slug = profileResult.data.slug;

    const [journeyResult, fieldResult] = await Promise.all([
      replaceJourneyEntries(
        supabase,
        profileId,
        journeys
          .filter((entry) => entry.activity.trim().length > 0)
          .map((entry) => ({
            activity: entry.activity,
            placeName: entry.placeName || undefined,
            startYear: entry.startYear ? Number.parseInt(entry.startYear, 10) : undefined,
            endYear: entry.endYear ? Number.parseInt(entry.endYear, 10) : undefined,
            story: entry.story || undefined,
          })),
      ),
      replaceProfileFields(supabase, profileId, selectedFieldIds),
    ]);

    if (!journeyResult.ok || !fieldResult.ok) {
      saveState = 'error';
      errorMessage =
        'Profil tersimpan, tapi sebagian perjalanan atau hal yang ditekuni gagal disimpan.';
      return;
    }

    saveState = 'saved';
    clearDraft(userId);
  }

  async function handleSave() {
    if (!profileId && !duplicateConfirmed) {
      const supabase = createBrowserSupabase();
      const batchYear = Number.parseInt(form.batchYear, 10);

      if (form.name.trim() && Number.isFinite(batchYear)) {
        const candidates = await findDuplicateCandidates(supabase, form.name, batchYear);

        if (candidates.length > 0) {
          duplicateCandidates = candidates;
          return;
        }
      }
    }

    await performSave();
  }

  function confirmDuplicate() {
    duplicateConfirmed = true;
    duplicateCandidates = [];
    void performSave();
  }

  function dismissDuplicate() {
    duplicateCandidates = [];
  }
</script>

{#if showDraftBanner}
  <div class="editor-banner" role="status">
    <p>Kami menemukan draf yang belum tersimpan di perangkat ini. Mau dipulihkan?</p>
    <div class="editor-banner__actions">
      <button type="button" onclick={restoreDraft}>Pulihkan draf</button>
      <button type="button" onclick={dismissDraft}>Abaikan</button>
    </div>
  </div>
{/if}

<DuplicateWarning
  candidates={duplicateCandidates}
  onConfirm={confirmDuplicate}
  onDismiss={dismissDuplicate}
/>

<form class="profile-editor" onsubmit={(event) => event.preventDefault()}>
  <section class="profile-editor__section" aria-labelledby="section-profil">
    <h2 id="section-profil">Profil</h2>
    <MediaUploader
      bucket="profile-photos"
      square
      value={form.photoPath || null}
      onUploaded={(path) => {
        form.photoPath = path;
      }}
    />
    <label>
      <span>Nama</span>
      <input type="text" bind:value={form.name} required />
    </label>
    <label>
      <span>Batch</span>
      <input type="number" bind:value={form.batchYear} min="2000" max="2100" required />
    </label>
    <label>
      <span>Lagi menjalani apa sekarang? (opsional)</span>
      <input type="text" bind:value={form.currentActivity} />
    </label>
    <label>
      <span>Tempat, organisasi, atau usaha (opsional)</span>
      <input type="text" bind:value={form.currentPlaceName} />
    </label>
    <label>
      <span>Domisili (opsional)</span>
      <input type="text" bind:value={form.location} />
    </label>
    <label>
      <span>Bio singkat (opsional)</span>
      <textarea bind:value={form.bio} rows="3"></textarea>
    </label>
    <label>
      <span>Apa yang berubah sejak kamu di SOON? (opsional)</span>
      <textarea bind:value={form.sinceSoonStory} rows="4"></textarea>
    </label>
    <label>
      <span>Turning point terbesar dalam perjalananmu? (opsional)</span>
      <textarea bind:value={form.turningPointStory} rows="4"></textarea>
    </label>
    <label>
      <span>Apa yang sedang kamu bangun atau tuju sekarang? (opsional)</span>
      <textarea bind:value={form.currentDirectionStory} rows="4"></textarea>
    </label>
    <label class="profile-editor__checkbox">
      <input type="checkbox" bind:checked={form.isPublished} />
      <span>Terbitkan profil ke publik</span>
    </label>
  </section>

  <section class="profile-editor__section" aria-labelledby="section-perjalanan">
    <h2 id="section-perjalanan">Perjalanan</h2>
    <JourneyEditor bind:entries={journeys} />
  </section>

  <section class="profile-editor__section" aria-labelledby="section-fields">
    <h2 id="section-fields">Hal yang ditekuni</h2>
    <FieldPicker {availableFields} bind:selectedFieldIds />
  </section>

  <section class="profile-editor__section" aria-labelledby="section-proud">
    <h2 id="section-proud">Hal yang dibanggakan</h2>
    <ProudMomentEditor {profileId} moments={initialProudMoments} />
  </section>

  <section class="profile-editor__section" aria-labelledby="section-links">
    <h2 id="section-links">Tautan</h2>
    <label>
      <span>LinkedIn (opsional)</span>
      <input type="url" bind:value={form.linkedinUrl} placeholder="https://" />
    </label>
    <label>
      <span>Instagram (opsional)</span>
      <input type="url" bind:value={form.instagramUrl} placeholder="https://" />
    </label>
    <label>
      <span>Situs (opsional)</span>
      <input type="url" bind:value={form.websiteUrl} placeholder="https://" />
    </label>
  </section>

  <div class="profile-editor__sticky">
    {#if slug}
      <a href={`/people/${slug}`} target="_blank" rel="noreferrer">Lihat pratinjau publik</a>
    {/if}
    <span class="profile-editor__status" role="status">
      {#if saveState === 'saving'}
        Menyimpan…
      {:else if saveState === 'saved'}
        Tersimpan
      {:else if saveState === 'error'}
        {errorMessage}
      {:else if saveState === 'dirty'}
        Ada perubahan belum tersimpan
      {/if}
    </span>
    <button type="button" disabled={saveState === 'saving'} onclick={handleSave}>Simpan</button>
  </div>
</form>
