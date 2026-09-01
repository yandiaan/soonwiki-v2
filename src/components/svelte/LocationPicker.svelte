<script lang="ts">
  import { onMount } from 'svelte';

  let {
    value = $bindable(''),
    placeholder = 'Ketik nama kota atau gunakan deteksi GPS…',
  }: {
    value: string;
    placeholder?: string;
  } = $props();

  interface LocationSuggestion {
    display_name: string;
    name: string;
    lat: number;
    lon: number;
    city?: string;
    state?: string;
    country?: string;
  }

  let isLocating = $state(false);
  let isSearching = $state(false);
  let suggestions = $state<LocationSuggestion[]>([]);
  let showSuggestions = $state(false);
  let geoError = $state('');
  let coords = $state<{ lat: number; lon: number } | null>(null);
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;
  let containerEl: HTMLElement | undefined;

  function formatLocationName(item: {
    name?: string;
    display_name: string;
    address?: {
      city?: string;
      town?: string;
      municipality?: string;
      county?: string;
      state?: string;
      country?: string;
    };
  }): string {
    const addr = item.address;
    if (addr) {
      const city = addr.city || addr.town || addr.municipality || addr.county || item.name || '';
      const state = addr.state || '';
      const country = addr.country || '';

      const parts = [city, state, country].filter(
        (p, i, arr) => Boolean(p) && arr.indexOf(p) === i,
      );
      if (parts.length > 0) {
        return parts.slice(0, 3).join(', ');
      }
    }

    const rawParts = item.display_name.split(',').map((s) => s.trim());
    return rawParts.slice(0, 3).join(', ');
  }

  async function fetchCitySuggestions(query: string) {
    if (!query || query.trim().length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    isSearching = true;
    try {
      const url = `/api/geo/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error('Gagal memuat saran kota');
      const data = (await res.json()) as Array<{
        name: string;
        lat: string;
        lon: string;
        display_name: string;
        address?: {
          city?: string;
          town?: string;
          municipality?: string;
          county?: string;
          state?: string;
          country?: string;
        };
      }>;

      suggestions = data.map((d) => ({
        display_name: formatLocationName(d),
        name: d.name,
        lat: Number.parseFloat(d.lat),
        lon: Number.parseFloat(d.lon),
        city: d.address?.city || d.address?.town,
        state: d.address?.state,
        country: d.address?.country,
      }));

      showSuggestions = suggestions.length > 0;
    } catch {
      suggestions = [];
    } finally {
      isSearching = false;
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    geoError = '';
    coords = null;

    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      void fetchCitySuggestions(value);
    }, 320);
  }

  function selectSuggestion(suggestion: LocationSuggestion) {
    value = suggestion.display_name;
    coords = { lat: suggestion.lat, lon: suggestion.lon };
    showSuggestions = false;
    suggestions = [];
  }

  async function handleGetCurrentLocation() {
    if (!navigator.geolocation) {
      geoError = 'Browser kamu tidak mendukung deteksi lokasi otomatis.';
      return;
    }

    isLocating = true;
    geoError = '';

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `/api/geo/reverse?lat=${lat}&lon=${lon}`;

          const res = await fetch(url);

          if (!res.ok) throw new Error('Gagal mengambil nama lokasi');
          const data = (await res.json()) as {
            name: string;
            display_name: string;
            address?: {
              city?: string;
              town?: string;
              municipality?: string;
              county?: string;
              state?: string;
              country?: string;
            };
          };

          const formatted = formatLocationName(data);
          if (formatted) {
            value = formatted;
          } else {
            value = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          }
          coords = { lat, lon };
        } catch {
          geoError = 'Gagal menerjemahkan koordinat lokasi.';
        } finally {
          isLocating = false;
        }
      },
      (error) => {
        isLocating = false;
        if (error.code === error.PERMISSION_DENIED) {
          geoError = 'Izin lokasi tidak diberikan. Silakan pilih nama kota dari saran pencarian.';
        } else if (error.code === error.TIMEOUT) {
          geoError = 'Waktu permintaan lokasi habis. Silakan coba lagi.';
        } else {
          geoError = 'Tidak dapat mendeteksi lokasi saat ini.';
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  function handleBlur(event: FocusEvent) {
    if (containerEl && !containerEl.contains(event.relatedTarget as Node)) {
      setTimeout(() => {
        showSuggestions = false;
      }, 180);
    }
  }

  onMount(() => {
    // If there is an existing location string on load, resolve its coordinates in background
    if (value && !coords) {
      void (async () => {
        try {
          const res = await fetch(`/api/geo/search?q=${encodeURIComponent(value)}`);
          if (res.ok) {
            const data = (await res.json()) as Array<{ lat: string; lon: string }>;
            if (data.length > 0 && data[0]) {
              coords = {
                lat: Number.parseFloat(data[0].lat),
                lon: Number.parseFloat(data[0].lon),
              };
            }
          }
        } catch {
          // Ignore background verification failure
        }
      })();
    }

    const handleDocumentClick = (e: MouseEvent) => {
      if (containerEl && !containerEl.contains(e.target as Node)) {
        showSuggestions = false;
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  });
</script>

<div class="location-picker" bind:this={containerEl} onfocusout={handleBlur}>
  <div class="input-row">
    <div class="input-with-pin">
      <svg
        class="input-pin-icon"
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
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <input
        id="profile-location"
        type="text"
        {value}
        oninput={handleInput}
        {placeholder}
        autocomplete="off"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
      />
      {#if isSearching}
        <div class="search-mini-spinner" aria-hidden="true"></div>
      {:else if value}
        <button
          type="button"
          class="btn-clear-loc"
          onclick={() => {
            value = '';
            coords = null;
            suggestions = [];
            showSuggestions = false;
          }}
          aria-label="Hapus lokasi"
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

    <!-- GPS Detect Button -->
    <button
      type="button"
      class="btn-gps"
      onclick={handleGetCurrentLocation}
      disabled={isLocating}
      title="Gunakan Lokasi GPS Saat Ini"
    >
      {#if isLocating}
        <div class="gps-spinner" aria-hidden="true"></div>
        <span>Mendeteksi…</span>
      {:else}
        <svg
          class="gps-icon"
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
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
        <span>Gunakan GPS</span>
      {/if}
    </button>
  </div>

  <!-- Autocomplete City Dropdown -->
  {#if showSuggestions && suggestions.length > 0}
    <ul class="suggestions-list" role="listbox">
      {#each suggestions as item (item.lat + ',' + item.lon + ':' + item.display_name)}
        <li>
          <button type="button" class="suggestion-item" onclick={() => selectSuggestion(item)}>
            <div class="item-left">
              <svg
                class="item-pin"
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
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div class="item-meta">
                <span class="item-text">{item.display_name}</span>
                {#if item.state || item.country}
                  <span class="item-sub"
                    >{[item.state, item.country].filter(Boolean).join(', ')}</span
                  >
                {/if}
              </div>
            </div>
            <span class="item-coords">{item.lat.toFixed(2)}, {item.lon.toFixed(2)}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Coordinate Validation Status -->
  {#if value && coords}
    <div class="loc-status is-valid">
      <svg
        viewBox="0 0 24 24"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span
        >Koordinat Peta Valid: <strong>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</strong
        ></span
      >
    </div>
  {:else if value && !coords && !isSearching}
    <div class="loc-status is-pending">
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>Pilih dari daftar rekomendasi di atas agar koordinat peta tercatat akurat.</span>
    </div>
  {/if}

  {#if geoError}
    <p class="geo-error-msg" role="alert">
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>{geoError}</span>
    </p>
  {/if}
</div>

<style>
  .location-picker {
    position: relative;
    display: grid;
    gap: 0.45rem;
    width: 100%;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .input-with-pin {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .input-pin-icon {
    position: absolute;
    left: 0.95rem;
    color: var(--ink-soft);
    pointer-events: none;
  }

  .input-with-pin input {
    width: 100%;
    min-height: 46px;
    padding: 0.7rem 2.25rem 0.7rem 2.5rem;
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

  .input-with-pin input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  }

  .search-mini-spinner {
    position: absolute;
    right: 0.85rem;
    width: 14px;
    height: 14px;
    border: 2px solid var(--line-soft);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 600ms linear infinite;
  }

  .btn-clear-loc {
    position: absolute;
    right: 0.75rem;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: none;
    background: var(--canvas);
    color: var(--ink-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .btn-clear-loc:hover {
    background: var(--surface-muted);
    color: var(--ink);
  }

  .btn-gps {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 46px;
    padding: 0.7rem 1rem;
    border-radius: 0.65rem;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      color 150ms ease;
  }

  .btn-gps:hover:not(:disabled) {
    background: var(--accent-soft);
    border-color: color-mix(in srgb, var(--accent) 35%, transparent);
    color: var(--accent);
  }

  .btn-gps:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .gps-icon {
    color: var(--accent);
    flex-shrink: 0;
  }

  .gps-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--accent-soft);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 600ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .suggestions-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    z-index: 40;
    background: var(--surface);
    border-radius: 0.75rem;
    border: 1px solid var(--line-soft);
    box-shadow:
      0 12px 32px -4px rgba(18, 21, 20, 0.16),
      0 2px 8px -2px rgba(18, 21, 20, 0.06);
    list-style: none;
    margin: 0;
    padding: 0.35rem;
    max-height: 240px;
    overflow-y: auto;
  }

  .suggestion-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 0.8rem;
    border-radius: 0.55rem;
    border: none;
    background: transparent;
    color: var(--ink);
    text-align: left;
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  .suggestion-item:hover,
  .suggestion-item:focus {
    background: var(--accent-soft);
    outline: none;
  }

  .item-left {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    min-width: 0;
  }

  .item-pin {
    flex-shrink: 0;
    color: var(--accent);
    margin-top: 0.15rem;
  }

  .item-meta {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .item-text {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-sub {
    font-size: 0.76rem;
    color: var(--ink-soft);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-coords {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--ink-soft);
    background: var(--canvas);
    padding: 0.2rem 0.45rem;
    border-radius: 0.35rem;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  /* Location Status Indicator */
  .loc-status {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    padding: 0.3rem 0.6rem;
    border-radius: 0.45rem;
    width: fit-content;
  }

  .loc-status.is-valid {
    background: color-mix(in srgb, #10b981 12%, var(--surface));
    color: #059669;
    border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
    font-weight: 600;
  }

  .loc-status.is-pending {
    background: color-mix(in srgb, #f59e0b 12%, var(--surface));
    color: #d97706;
    border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
    font-weight: 600;
  }

  .geo-error-msg {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: var(--signal);
    font-weight: 600;
  }
</style>
