<script lang="ts">
  import DuplicateWarning from '@/components/svelte/DuplicateWarning.svelte';
  import EditorTour from '@/components/svelte/EditorTour.svelte';
  import FieldPicker from '@/components/svelte/FieldPicker.svelte';
  import JourneyEditor from '@/components/svelte/JourneyEditor.svelte';
  import LocationPicker from '@/components/svelte/LocationPicker.svelte';
  import MediaUploader from '@/components/svelte/MediaUploader.svelte';
  import ProudMomentEditor from '@/components/svelte/ProudMomentEditor.svelte';
  import { clearDraft, loadDraft, saveDraft } from '@/lib/browser/local-draft';
  import { SOON_GENERATIONS, formatGenerationBadge } from '@/lib/shared/generations';
  import { publicStorageUrl } from '@/lib/shared/paths';
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

  type TabKey = 'identity' | 'story' | 'journey' | 'moments' | 'links';

  const TABS: { key: TabKey; label: string; icon: string; badge?: string }[] = [
    { key: 'identity', label: 'Identitas & Foto', icon: 'user' },
    { key: 'story', label: 'Narasi & Kisah', icon: 'pen' },
    { key: 'journey', label: 'Jejak Perjalanan', icon: 'timeline' },
    { key: 'moments', label: 'Karya & Momen', icon: 'sparkle' },
    { key: 'links', label: 'Bidang & Publikasi', icon: 'globe' },
  ];

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
      isPublished: profile?.isPublished ?? true,
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

  let currentTab = $state<TabKey>('identity');
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
  let showMobilePreview = $state(false);
  let showTour = $state(false);

  let mounted = false;
  let draftTimeout: ReturnType<typeof setTimeout> | undefined;

  let completionStats = $derived.by(() => {
    const checks = [
      Boolean(form.name.trim()),
      Boolean(form.batchYear.trim()),
      Boolean(form.photoPath),
      Boolean(form.bio.trim() || form.currentActivity.trim()),
      Boolean(form.sinceSoonStory.trim() || form.turningPointStory.trim()),
      journeys.some((j) => j.activity.trim().length > 0),
      selectedFieldIds.length > 0,
      Boolean(form.linkedinUrl || form.instagramUrl || form.websiteUrl),
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    return { score, checks };
  });

  // Selected Field names for live preview
  let selectedFieldNames = $derived.by(() => {
    return availableFields.filter((f) => selectedFieldIds.includes(f.id)).map((f) => f.name);
  });

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

    const batchYearNum = Number.parseInt(form.batchYear, 10);

    const parsed = profileInputSchema.safeParse({
      name: form.name,
      batchYear: Number.isFinite(batchYearNum) ? batchYearNum : undefined,
      photoPath: form.photoPath || undefined,
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
      // Jump to identity tab if name/batch error
      if (
        parsed.error.issues[0]?.path.includes('name') ||
        parsed.error.issues[0]?.path.includes('batchYear')
      ) {
        currentTab = 'identity';
      }
      return;
    }

    const supabase = createBrowserSupabase();
    const profileResult = await upsertOwnProfile(supabase, parsed.data);

    if (!profileResult.ok) {
      saveState = 'error';
      errorMessage = profileResult.message ?? 'Gagal menyimpan profil ke server. Coba lagi.';
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
      errorMessage = 'Profil tersimpan, namun sebagian data pendukung gagal disimpan.';
      return;
    }

    saveState = 'saved';
    clearDraft(userId);

    setTimeout(() => {
      if (saveState === 'saved') {
        saveState = 'idle';
      }
    }, 4000);
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

  function nextTab() {
    const order: TabKey[] = ['identity', 'story', 'journey', 'moments', 'links'];
    const idx = order.indexOf(currentTab);
    if (idx < order.length - 1) {
      currentTab = order[idx + 1];
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      void handleSave();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Restorable Draft Banner -->
{#if showDraftBanner}
  <div class="editor-banner" role="status">
    <div class="banner-icon">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div class="banner-text">
      <strong>Draf lokal ditemukan</strong>
      <p>Ada perubahan belum tersimpan dari sesi sebelumnya di perangkat ini.</p>
    </div>
    <div class="banner-actions">
      <button type="button" class="btn-restore" onclick={restoreDraft}>Pulihkan Draf</button>
      <button type="button" class="btn-dismiss" onclick={dismissDraft}>Abaikan</button>
    </div>
  </div>
{/if}

<DuplicateWarning
  candidates={duplicateCandidates}
  onConfirm={confirmDuplicate}
  onDismiss={dismissDuplicate}
/>

<EditorTour bind:isOpen={showTour} onTabChange={(tab) => (currentTab = tab)} />

<div class="editor-layout">
  <!-- Main Editing Studio -->
  <div class="editor-main">
    <!-- Progress & Encouragement Strip -->
    <div class="completion-card">
      <div class="completion-header">
        <div class="completion-info">
          <span class="completion-title">Kelengkapan Profil</span>
          <span class="completion-value">{completionStats.score}% Selesai</span>
        </div>
        <div class="completion-actions">
          <button
            type="button"
            class="tour-trigger-btn"
            onclick={() => (showTour = true)}
            aria-label="Buka panduan tur pengisian"
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
              />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <span>Panduan Tur</span>
          </button>
          <button
            type="button"
            class="preview-toggle-btn"
            onclick={() => (showMobilePreview = !showMobilePreview)}
            aria-label="Toggle pratinjau profil"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{showMobilePreview ? 'Tutup Pratinjau' : 'Lihat Pratinjau'}</span>
          </button>
        </div>
      </div>
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill"
          style={`width: ${Math.max(5, completionStats.score)}%;`}
        ></div>
      </div>
    </div>

    <!-- Segmented Tab Navigation -->
    <nav class="studio-tabs" aria-label="Navigasi bagian formulir profil">
      {#each TABS as tab (tab.key)}
        {@const isActive = currentTab === tab.key}
        <button
          type="button"
          class="tab-btn"
          class:is-active={isActive}
          onclick={() => (currentTab = tab.key)}
          aria-selected={isActive}
          role="tab"
        >
          {#if tab.icon === 'user'}
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          {:else if tab.icon === 'pen'}
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          {:else if tab.icon === 'timeline'}
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          {:else if tab.icon === 'sparkle'}
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
          {:else if tab.icon === 'globe'}
            <svg
              viewBox="0 0 24 24"
              width="17"
              height="17"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path
                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
          {/if}
          <span>{tab.label}</span>
        </button>
      {/each}
    </nav>

    <!-- Tab Panels Container -->
    <div class="tab-content">
      <!-- 1. IDENTITAS & FOTO -->
      {#if currentTab === 'identity'}
        <section class="section-pane" aria-labelledby="heading-identity">
          <div class="pane-header">
            <h2 id="heading-identity">Identitas & Foto Diri</h2>
            <p>Informasi dasar ini akan tampil di kartu profil dan penelusuran alumni.</p>
          </div>

          <!-- Portrait Photo Uploader -->
          <div class="uploader-container" data-tour="photo-upload">
            <MediaUploader
              bucket="profile-photos"
              square
              value={form.photoPath || null}
              label="Foto Profil Portrait"
              hint="Foto terbaikmu (portrait 1:1, maks. 5MB)"
              onUploaded={(path) => {
                form.photoPath = path;
              }}
              onRemoved={() => {
                form.photoPath = '';
              }}
            />
          </div>

          <div class="fields-grid" data-tour="identity-fields">
            <div class="field field--required">
              <label for="profile-name">Nama Lengkap / Panggilan <span class="req">*</span></label>
              <input
                id="profile-name"
                type="text"
                bind:value={form.name}
                placeholder="Contoh: Nadia Pramesti"
                required
              />
              <span class="field-hint">Nama yang kamu gunakan untuk dikenali oleh SoonMates.</span>
            </div>

            <div class="field field--required">
              <label for="profile-batch">Angkatan / Generasi SOON <span class="req">*</span></label>
              <div class="select-box-wrap">
                <select id="profile-batch" bind:value={form.batchYear} required>
                  <option value="" disabled selected={!form.batchYear}
                    >Pilih Angkatan / Generasi SOON…</option
                  >
                  {#each SOON_GENERATIONS as gen (gen.year)}
                    <option value={String(gen.year)}>{gen.name}</option>
                  {/each}
                </select>
                <svg
                  class="select-arrow-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <span class="field-hint">Pilih nama angkatan / generasi program SOON kamu.</span>
            </div>

            <div class="field">
              <label for="profile-activity">Kesibukan / Peran Saat Ini</label>
              <input
                id="profile-activity"
                type="text"
                bind:value={form.currentActivity}
                placeholder="Contoh: Software Engineer, Founder, Peneliti"
              />
              <span class="field-hint">Apa yang sedang kamu tekuni atau jalani saat ini?</span>
            </div>

            <div class="field">
              <label for="profile-place">Tempat / Lembaga / Organisasi Saat Ini</label>
              <input
                id="profile-place"
                type="text"
                bind:value={form.currentPlaceName}
                placeholder="Contoh: Gojek, Studio Keramik, Freelance"
              />
            </div>

            <div class="field field--full">
              <label for="profile-location">Domisili / Kota Saat Ini</label>
              <LocationPicker
                bind:value={form.location}
                placeholder="Ketik nama kota atau gunakan deteksi GPS…"
              />
              <span class="field-hint"
                >Ketik nama kotamu untuk rekomendasi otomatis atau klik <strong>Gunakan GPS</strong
                >.</span
              >
            </div>
          </div>

          <div class="pane-footer">
            <button type="button" class="btn-step-next" onclick={nextTab}>
              <span>Lanjut: Narasi & Kisah</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </section>
      {/if}

      <!-- 2. NARASI & KISAH HIDUP -->
      {#if currentTab === 'story'}
        <section class="section-pane" aria-labelledby="heading-story">
          <div class="pane-header">
            <h2 id="heading-story">Narasi & Refleksi Hidup</h2>
            <p>
              Bagikan kilas balik dan refleksi autentikmu. Jawaban santai dan jujur adalah yang
              paling berkesan.
            </p>
          </div>

          <div class="fields-stack" data-tour="story-prompts">
            <div class="field">
              <label for="profile-bio">Bio Singkat (1–2 Kalimat)</label>
              <textarea
                id="profile-bio"
                bind:value={form.bio}
                rows="3"
                placeholder="Pengantar ringkas tentang siapa kamu, apa yang kamu minati, atau prinsip yang kamu pegang…"
              ></textarea>
              <span class="field-hint">Akan tampil di bagian header profilmu.</span>
            </div>

            <div class="prompt-box">
              <div class="prompt-badge">Refleksi SOON</div>
              <div class="field">
                <label for="profile-since">Apa yang berubah dalam hidupmu sejak di SOON?</label>
                <textarea
                  id="profile-since"
                  bind:value={form.sinceSoonStory}
                  rows="4"
                  placeholder="Ceritakan perubahan cara pandang, pertemanan, pola pikir, atau kebiasaan baru yang bermula dari pengalaman di SOON…"
                ></textarea>
              </div>
            </div>

            <div class="prompt-box">
              <div class="prompt-badge">Titik Balik</div>
              <div class="field">
                <label for="profile-tp">Titik balik terbesar dalam perjalananmu?</label>
                <textarea
                  id="profile-tp"
                  bind:value={form.turningPointStory}
                  rows="4"
                  placeholder="Keputusan berani, kegagalan berharga, atau momen tidak terduga yang mengubah kompas hidupmu…"
                ></textarea>
              </div>
            </div>

            <div class="prompt-box">
              <div class="prompt-badge">Arah Masa Depan</div>
              <div class="field">
                <label for="profile-dir">Apa yang sedang kamu bangun atau tuju saat ini?</label>
                <textarea
                  id="profile-dir"
                  bind:value={form.currentDirectionStory}
                  rows="4"
                  placeholder="Eksplorasi, impian, atau proyek yang sedang membakar semangatmu sekarang…"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="pane-footer">
            <button type="button" class="btn-step-next" onclick={nextTab}>
              <span>Lanjut: Jejak Perjalanan</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </section>
      {/if}

      <!-- 3. JEJAK PERJALANAN (TIMELINE) -->
      {#if currentTab === 'journey'}
        <section class="section-pane" aria-labelledby="heading-journey">
          <div class="pane-header">
            <h2 id="heading-journey">Jejak Perjalanan & Babak Hidup</h2>
            <p>Rangkai linimasa petualanganmu dari masa lalu hingga kini.</p>
          </div>

          <div data-tour="journey-section">
            <JourneyEditor bind:entries={journeys} />
          </div>

          <div class="pane-footer">
            <button type="button" class="btn-step-next" onclick={nextTab}>
              <span>Lanjut: Karya & Momen</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </section>
      {/if}

      <!-- 4. KARYA & MOMEN KEBANGGAAN -->
      {#if currentTab === 'moments'}
        <section class="section-pane" aria-labelledby="heading-moments">
          <div class="pane-header">
            <h2 id="heading-moments">Karya & Momen Kebanggaan</h2>
            <p>Showcase karya, portofolio, publikasi, atau inisiatif yang pernah kamu wujudkan.</p>
          </div>

          <div data-tour="moments-section">
            <ProudMomentEditor {profileId} moments={initialProudMoments} />
          </div>

          <div class="pane-footer">
            <button type="button" class="btn-step-next" onclick={nextTab}>
              <span>Lanjut: Bidang & Publikasi</span>
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </section>
      {/if}

      <!-- 5. BIDANG, TAUTAN & PUBLIKASI -->
      {#if currentTab === 'links'}
        <section class="section-pane" aria-labelledby="heading-links" data-tour="links-section">
          <div class="pane-header">
            <h2 id="heading-links">Bidang yang Ditekuni, Tautan & Publikasi</h2>
            <p>
              Hubungkan bidang keahlian dan media sosialmu agar mudah terhubung dengan sesama
              SoonMates.
            </p>
          </div>

          <div class="sub-block">
            <h3>Bidang yang Ditekuni</h3>
            <FieldPicker {availableFields} bind:selectedFieldIds />
          </div>

          <div class="sub-block">
            <h3>Tautan Profil & Portofolio (Opsional)</h3>
            <div class="fields-grid">
              <div class="field">
                <label for="link-linkedin">LinkedIn</label>
                <input
                  id="link-linkedin"
                  type="url"
                  bind:value={form.linkedinUrl}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div class="field">
                <label for="link-instagram">Instagram</label>
                <input
                  id="link-instagram"
                  type="url"
                  bind:value={form.instagramUrl}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div class="field field--full">
                <label for="link-web">Situs Web Pribadi / Portofolio</label>
                <input
                  id="link-web"
                  type="url"
                  bind:value={form.websiteUrl}
                  placeholder="https://namasaya.com"
                />
              </div>
            </div>
          </div>

          <!-- Publication Status Toggle -->
          <div class="publication-card">
            <div class="pub-info">
              <h4>Status Publikasi</h4>
              <p>
                Jika aktif, profilmu dapat ditemukan di halaman Jelajahi dan diakses publik oleh
                seluruh SoonMates.
              </p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" bind:checked={form.isPublished} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </section>
      {/if}
    </div>
  </div>

  <!-- Live Sticky Preview Sidebar (Desktop & Mobile Modal) -->
  <aside class="editor-preview" class:is-open-mobile={showMobilePreview}>
    <div class="preview-sticky-card" data-tour="live-preview">
      <div class="preview-header">
        <div class="preview-badge-live">
          <span>Live Preview</span>
        </div>
        {#if showMobilePreview}
          <button
            type="button"
            class="preview-close-btn"
            onclick={() => (showMobilePreview = false)}
            aria-label="Tutup pratinjau"
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        {/if}
      </div>

      <!-- Mini Public Hero Card -->
      <div class="card-preview">
        <div class="card-portrait-box">
          {#if form.photoPath}
            <img
              src={publicStorageUrl('profile-photos', form.photoPath)}
              alt={form.name || 'Foto Profil'}
              class="preview-avatar-img"
              onerror={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          {:else}
            <div class="avatar-fallback">
              <span>{form.name ? form.name.charAt(0).toUpperCase() : 'S'}</span>
            </div>
          {/if}
        </div>

        <div class="card-meta">
          <div class="card-name-row">
            <h3 class="card-name">{form.name || 'Nama SoonMates'}</h3>
            {#if form.batchYear}
              <span class="batch-badge"
                >{formatGenerationBadge(Number.parseInt(form.batchYear, 10))}</span
              >
            {/if}
          </div>

          {#if form.currentActivity || form.currentPlaceName}
            <p class="card-activity">
              {form.currentActivity || ''}
              {#if form.currentActivity && form.currentPlaceName}
                ·
              {/if}
              <strong>{form.currentPlaceName || ''}</strong>
            </p>
          {/if}

          {#if form.location}
            <p class="card-location">
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{form.location}</span>
            </p>
          {/if}

          {#if form.bio}
            <blockquote class="card-bio">
              “{form.bio}”
            </blockquote>
          {/if}

          {#if selectedFieldNames.length > 0}
            <div class="card-fields">
              {#each selectedFieldNames.slice(0, 3) as fieldName (fieldName)}
                <span class="card-field-chip">{fieldName}</span>
              {/each}
              {#if selectedFieldNames.length > 3}
                <span class="card-field-more">+{selectedFieldNames.length - 3}</span>
              {/if}
            </div>
          {/if}
        </div>

        <div class="card-status-bar">
          <span class="status-indicator" class:is-published={form.isPublished}>
            <span class="status-pip" class:is-live={form.isPublished}></span>
            <span>{form.isPublished ? 'Terbit ke Publik' : 'Draf Privat'}</span>
          </span>
          {#if slug}
            <a href={`/people/${slug}`} target="_blank" rel="noreferrer" class="public-link">
              <span>Buka Profil</span>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          {/if}
        </div>
      </div>
    </div>
  </aside>
</div>

<!-- Floating Action Bar -->
<div class="floating-save-bar" data-tour="save-bar">
  <div class="save-bar-content">
    <div class="save-status" role="status">
      {#if saveState === 'saving'}
        <div class="mini-spinner"></div>
        <span>Menyimpan ke server…</span>
      {:else if saveState === 'saved'}
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="#22c55e"
          stroke-width="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span class="text-saved">Semua perubahan tersimpan</span>
      {:else if saveState === 'error'}
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="var(--signal)"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span class="text-error">{errorMessage}</span>
      {:else if saveState === 'dirty'}
        <span class="text-dirty">
          <span class="status-pip is-dirty"></span>
          Ada perubahan (tersimpan di draf)
        </span>
      {:else}
        <span class="text-idle">Otomatis tersimpan sebagai draf</span>
      {/if}
    </div>

    <div class="save-bar-actions">
      {#if slug}
        <a href={`/people/${slug}`} target="_blank" rel="noreferrer" class="btn-ghost-preview">
          <span>Lihat Halaman Publik</span>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      {/if}

      <button
        type="button"
        class="btn-save-primary"
        disabled={saveState === 'saving'}
        onclick={handleSave}
      >
        {#if saveState === 'saving'}
          <span>Menyimpan…</span>
        {:else}
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Simpan Profil</span>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  /* Layout Architecture */
  .editor-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: start;
    padding-bottom: calc(8.5rem + env(safe-area-inset-bottom, 0px));
  }

  @media (min-width: 1024px) {
    .editor-layout {
      grid-template-columns: 1fr 340px;
      gap: 2.5rem;
    }
  }

  @media (min-width: 1200px) {
    .editor-layout {
      grid-template-columns: 1fr 380px;
    }
  }

  .editor-main {
    display: grid;
    gap: 1.5rem;
    min-width: 0;
  }

  /* Completion Card */
  .completion-card {
    padding: 1.25rem 1.5rem;
    border-radius: 1rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    display: grid;
    gap: 0.75rem;
    box-shadow: 0 2px 6px -1px rgba(0, 0, 0, 0.03);
  }

  .completion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .completion-info {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  .completion-title {
    font-size: 0.92rem;
    font-weight: 750;
    color: var(--ink);
  }

  .completion-value {
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--accent);
  }

  .completion-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tour-trigger-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.8rem;
    border-radius: 0.55rem;
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.82rem;
    font-weight: 750;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .tour-trigger-btn:hover {
    background: var(--accent);
    color: var(--surface);
    transform: translateY(-1px);
  }

  .preview-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.55rem;
    border: 1px solid var(--line-soft);
    background: var(--canvas);
    color: var(--ink);
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .preview-toggle-btn:hover {
    background: var(--surface-muted);
  }

  @media (min-width: 1024px) {
    .preview-toggle-btn {
      display: none;
    }
  }

  .progress-bar-track {
    height: 6px;
    width: 100%;
    background: var(--canvas);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent) 0%, var(--accent-vibrant) 100%);
    border-radius: 9999px;
    transition: width 400ms var(--ease-out);
  }

  /* Segmented Studio Tabs */
  .studio-tabs {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem;
    border-radius: 0.85rem;
    background: color-mix(in srgb, var(--surface) 70%, var(--canvas));
    border: 1px solid var(--line-soft);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .studio-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1rem;
    border-radius: 0.65rem;
    border: none;
    background: transparent;
    color: var(--ink-soft);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background-color 150ms ease,
      color 150ms ease,
      transform 150ms var(--ease-out),
      box-shadow 150ms ease;
  }

  .tab-btn:hover {
    color: var(--ink);
    background: rgba(255, 255, 255, 0.6);
  }

  .tab-btn.is-active {
    background: var(--surface);
    color: var(--accent);
    box-shadow:
      0 2px 8px -2px rgba(18, 21, 20, 0.08),
      0 1px 2px 0 rgba(18, 21, 20, 0.04);
  }

  /* Section Pane */
  .section-pane {
    display: grid;
    gap: 1.75rem;
    padding: 2rem clamp(1.25rem, 3vw, 2.25rem);
    border-radius: 1.25rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    box-shadow: 0 4px 16px -4px rgba(18, 21, 20, 0.03);
  }

  .pane-header {
    display: grid;
    gap: 0.35rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--line-soft);
  }

  .pane-header h2 {
    margin: 0;
    font-size: clamp(1.35rem, 3vw, 1.75rem);
    font-weight: 750;
    letter-spacing: -0.025em;
    color: var(--ink);
  }

  .pane-header p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--ink-soft);
    line-height: 1.45;
  }

  .uploader-container {
    max-width: 24rem;
  }

  /* Forms & Fields */
  .fields-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  @media (min-width: 640px) {
    .fields-grid {
      grid-template-columns: 1fr 1fr;
    }

    .field--full {
      grid-column: span 2;
    }
  }

  .fields-stack {
    display: grid;
    gap: 1.5rem;
  }

  .field {
    display: grid;
    gap: 0.4rem;
  }

  .field label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.01em;
  }

  .req {
    color: var(--signal);
  }

  .field input,
  .field textarea,
  .select-box-wrap select {
    min-height: 46px;
    padding: 0.7rem 0.95rem;
    border: 1px solid var(--line-soft);
    border-radius: 0.65rem;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 0.92rem;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .select-box-wrap {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .select-box-wrap select {
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 2.5rem;
    cursor: pointer;
  }

  .select-arrow-icon {
    position: absolute;
    right: 1rem;
    pointer-events: none;
    color: var(--ink-soft);
  }

  .field input:focus,
  .field textarea:focus,
  .select-box-wrap select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .field textarea {
    min-height: 6rem;
    line-height: 1.55;
    resize: vertical;
  }

  .field-hint {
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .prompt-box {
    display: grid;
    gap: 0.6rem;
    padding: 1.25rem;
    border-radius: 0.9rem;
    background: var(--canvas);
    border: 1px solid var(--line-soft);
  }

  .prompt-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.65rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    width: fit-content;
  }

  .sub-block {
    display: grid;
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--line-soft);
  }

  .sub-block h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 750;
    color: var(--ink);
  }

  /* Publication Card */
  .publication-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.25rem;
    padding: 1.5rem;
    border-radius: 1rem;
    background: color-mix(in srgb, var(--accent-soft) 40%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .pub-info h4 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 750;
    color: var(--ink);
  }

  .pub-info p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--ink-soft);
    line-height: 1.45;
  }

  /* Toggle switch */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 30px;
    flex-shrink: 0;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: var(--line-soft);
    transition: 200ms ease;
    border-radius: 30px;
  }

  .toggle-slider:before {
    position: absolute;
    content: '';
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 200ms cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: var(--accent);
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }

  .pane-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid var(--line-soft);
  }

  .btn-step-next {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1.4rem;
    border-radius: 0.75rem;
    border: none;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.9rem;
    font-weight: 750;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out);
  }

  .btn-step-next:hover {
    background: var(--accent);
    color: var(--surface);
    transform: translateX(2px);
  }

  /* Live Preview Sidebar */
  .editor-preview {
    display: none;
  }

  @media (min-width: 1024px) {
    .editor-preview {
      display: block;
    }
  }

  .editor-preview.is-open-mobile {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .preview-sticky-card {
    position: sticky;
    top: 5.5rem;
    display: grid;
    gap: 0.75rem;
  }

  .is-open-mobile .preview-sticky-card {
    position: static;
    max-width: 24rem;
    width: 100%;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 0.25rem;
  }

  .preview-badge-live {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
  }

  .preview-close-btn {
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
  }

  .card-preview {
    border-radius: 1.25rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    overflow: hidden;
    box-shadow:
      0 12px 32px -6px rgba(18, 21, 20, 0.08),
      0 2px 8px -2px rgba(18, 21, 20, 0.04);
  }

  .card-portrait-box {
    aspect-ratio: 1 / 1;
    width: 100%;
    background: var(--canvas);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-fallback {
    font-size: 4rem;
    font-weight: 800;
    color: var(--accent);
    opacity: 0.35;
  }

  .card-meta {
    padding: 1.25rem;
    display: grid;
    gap: 0.6rem;
  }

  .card-name-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .card-name {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 750;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  .batch-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 0.72rem;
    font-weight: 800;
  }

  .card-activity {
    margin: 0;
    font-size: 0.85rem;
    color: var(--ink-soft);
    line-height: 1.35;
  }

  .card-location {
    margin: 0;
    font-size: 0.8rem;
    color: var(--ink-soft);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  .card-bio {
    margin: 0.25rem 0 0;
    padding: 0.6rem 0.85rem;
    border-radius: 0.6rem;
    background: var(--canvas);
    font-size: 0.82rem;
    font-style: italic;
    color: var(--ink);
    line-height: 1.45;
  }

  .card-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding-top: 0.4rem;
  }

  .card-field-chip {
    padding: 0.2rem 0.55rem;
    border-radius: 9999px;
    background: var(--canvas);
    border: 1px solid var(--line-soft);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--ink);
  }

  .card-field-more {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--ink-soft);
    align-self: center;
  }

  .card-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    background: var(--canvas);
    border-top: 1px solid var(--line-soft);
    font-size: 0.78rem;
  }

  .status-indicator {
    font-weight: 750;
    color: var(--ink-soft);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .status-indicator.is-published {
    color: #1e6e38;
  }

  .status-pip {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--line-strong, #9ca3af);
    display: inline-block;
  }

  .status-pip.is-live {
    background: #16a34a;
  }

  .status-pip.is-dirty {
    background: var(--accent);
  }

  .public-link {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--accent);
    font-weight: 700;
    text-decoration: none;
  }

  .public-link:hover {
    text-decoration: underline;
  }

  /* Floating Bottom Save Bar */
  .floating-save-bar {
    position: fixed;
    bottom: 0;
    inset-inline: 0;
    z-index: 60;
    background: color-mix(in srgb, var(--surface) 94%, var(--canvas));
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border-top: 1px solid var(--line-soft);
    box-shadow: 0 -6px 24px rgba(18, 21, 20, 0.08);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .save-bar-content {
    max-width: var(--content-max);
    margin-inline: auto;
    padding: 0.75rem var(--page-gutter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  @media (max-width: 640px) {
    .save-bar-content {
      flex-direction: column-reverse;
      align-items: stretch;
      gap: 0.4rem;
      padding-block: 0.65rem 0.5rem;
    }
  }

  .save-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    font-weight: 650;
  }

  @media (max-width: 640px) {
    .save-status {
      justify-content: center;
      font-size: 0.78rem;
    }
  }

  .text-saved {
    color: #15803d;
    font-weight: 700;
  }

  .text-error {
    color: var(--signal);
    font-weight: 700;
  }

  .text-dirty {
    color: var(--accent);
    font-weight: 700;
  }

  .text-idle {
    color: var(--ink-soft);
  }

  .mini-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--accent-soft);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 700ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .save-bar-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  @media (max-width: 640px) {
    .save-bar-actions {
      width: 100%;
    }
  }

  .btn-ghost-preview {
    display: none;
    align-items: center;
    gap: 0.4rem;
    padding: 0.65rem 1rem;
    border-radius: 0.65rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.86rem;
    font-weight: 700;
    text-decoration: none;
    transition:
      background-color 150ms ease,
      border-color 150ms ease;
  }

  @media (min-width: 640px) {
    .btn-ghost-preview {
      display: inline-flex;
    }
  }

  .btn-ghost-preview:hover {
    background: var(--canvas);
    border-color: var(--ink);
  }

  .btn-save-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    padding: 0.75rem 1.65rem;
    min-height: 46px;
    border-radius: 0.75rem;
    border: none;
    background: var(--accent);
    color: var(--surface);
    font-size: 0.92rem;
    font-weight: 750;
    cursor: pointer;
    box-shadow: 0 4px 14px -2px color-mix(in srgb, var(--accent) 45%, transparent);
    transition:
      background-color 150ms ease,
      transform 150ms var(--ease-out),
      box-shadow 150ms ease;
  }

  @media (max-width: 640px) {
    .btn-save-primary {
      width: 100%;
      min-height: 48px;
      font-size: 0.95rem;
    }
  }

  .btn-save-primary:hover:not(:disabled) {
    background: var(--accent-strong);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px -2px color-mix(in srgb, var(--accent) 55%, transparent);
  }

  .btn-save-primary:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  /* Draft Banner */
  .editor-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 0.9rem;
    background: #fef8ee;
    border: 1px solid #fed7aa;
    color: #9a3412;
    margin-bottom: 1.5rem;
  }

  .banner-icon {
    flex-shrink: 0;
  }

  .banner-text {
    flex: 1;
    display: grid;
    gap: 0.15rem;
  }

  .banner-text strong {
    font-size: 0.9rem;
  }

  .banner-text p {
    margin: 0;
    font-size: 0.82rem;
    color: #b45309;
  }

  .banner-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-restore {
    padding: 0.45rem 0.9rem;
    border-radius: 0.5rem;
    border: none;
    background: #ea580c;
    color: #ffffff;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }

  .btn-dismiss {
    padding: 0.45rem 0.9rem;
    border-radius: 0.5rem;
    border: 1px solid #fed7aa;
    background: #ffffff;
    color: #9a3412;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }
</style>
