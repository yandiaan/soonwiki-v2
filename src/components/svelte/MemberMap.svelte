<script lang="ts">
  import { onMount } from 'svelte';
  import L from 'leaflet';
  import { SOON_GENERATIONS, getGenerationName } from '@/lib/shared/generations';
  import { paths, publicStorageUrl } from '@/lib/shared/paths';
  import 'leaflet/dist/leaflet.css';

  import type { GeoMemberPin } from '@/lib/shared/geo-resolver';

  let { pins = [] }: { pins: GeoMemberPin[] } = $props();

  let mapContainer: HTMLDivElement | undefined = $state();
  let mapInstance: L.Map | null = $state(null);
  let markersLayer: L.LayerGroup | null = null;

  let selectedGeneration = $state<number | 'all'>('all');
  let searchQuery = $state('');
  let activePin = $state<GeoMemberPin | null>(null);

  // Filtered pins based on search and generation filter
  const filteredPins = $derived(
    pins.filter((pin) => {
      const matchGen = selectedGeneration === 'all' || pin.batchYear === selectedGeneration;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        pin.name.toLowerCase().includes(query) ||
        pin.location.toLowerCase().includes(query) ||
        (pin.currentActivity && pin.currentActivity.toLowerCase().includes(query)) ||
        (pin.currentPlaceName && pin.currentPlaceName.toLowerCase().includes(query));

      return matchGen && matchQuery;
    }),
  );

  // Grouping by unique cities/regions for the summary strip
  const citySummary = $derived.by(() => {
    const counts: Record<string, number> = {};
    for (const pin of pins) {
      const city = pin.location.split(',')[0]?.trim() || pin.location;
      counts[city] = (counts[city] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  });

  onMount(() => {
    if (!mapContainer) return;

    try {
      // Initialize map centered over Indonesia
      const map = L.map(mapContainer, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      // Free CartoDB Voyager / OpenStreetMap standard tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution(
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
        )
        .addTo(map);

      markersLayer = L.layerGroup().addTo(map);
      mapInstance = map;

      renderMarkers();
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  });

  function renderMarkers() {
    if (!mapInstance || !markersLayer) return;

    markersLayer.clearLayers();

    if (filteredPins.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredPins.forEach((pin) => {
      if (!mapInstance || !markersLayer) return;

      const photoUrl = pin.photoPath ? publicStorageUrl('profile-photos', pin.photoPath) : null;
      const initials = pin.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');

      const genName = getGenerationName(pin.batchYear);

      // Custom HTML Marker Pin
      const iconHtml = `
        <div class="custom-map-pin" data-pin-id="${pin.id}">
          <div class="pin-avatar">
            ${
              photoUrl
                ? `<img src="${photoUrl}" alt="${pin.name}" />`
                : `<span class="pin-initials">${initials}</span>`
            }
          </div>
          <div class="pin-badge">${genName}</div>
          <div class="pin-pointer"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'soon-marker-wrapper',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44],
      });

      const marker = L.marker([pin.lat, pin.lon], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div class="map-popup-card">
          <div class="popup-header">
            <div class="popup-avatar">
              ${
                photoUrl
                  ? `<img src="${photoUrl}" alt="${pin.name}" />`
                  : `<span class="popup-initials">${initials}</span>`
              }
            </div>
            <div class="popup-info">
              <span class="popup-gen">${genName}</span>
              <h4 class="popup-name">${pin.name}</h4>
            </div>
          </div>
          ${pin.currentActivity ? `<p class="popup-role">${pin.currentActivity}</p>` : ''}
          <div class="popup-location">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>${pin.location}</span>
          </div>
          <a href="${paths.profile(pin.slug)}" class="popup-btn">
            <span>Buka Profil</span>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'soon-leaflet-popup',
        closeButton: true,
        maxWidth: 280,
      });

      marker.on('click', () => {
        activePin = pin;
      });

      markersLayer.addLayer(marker);
      bounds.extend([pin.lat, pin.lon]);
    });

    // Fit map view to pins if available
    if (filteredPins.length > 0 && mapInstance) {
      mapInstance.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      });
    }
  }

  $effect(() => {
    // Re-render markers when filter changes
    if (selectedGeneration !== undefined || searchQuery !== undefined) {
      renderMarkers();
    }
  });

  function focusCity(cityName: string) {
    const targetPin = pins.find((p) => p.location.toLowerCase().includes(cityName.toLowerCase()));
    if (targetPin && mapInstance) {
      mapInstance.flyTo([targetPin.lat, targetPin.lon], 12, { duration: 1.2 });
    }
  }

  function resetView() {
    if (mapInstance) {
      mapInstance.flyTo([-2.5489, 118.0149], 5, { duration: 1 });
      selectedGeneration = 'all';
      searchQuery = '';
    }
  }
</script>

<div class="member-map-card">
  <!-- Controls Bar -->
  <div class="map-controls">
    <div class="map-controls__search">
      <svg
        class="search-icon"
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
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        bind:value={searchQuery}
        placeholder="Cari nama, kota, atau profesi..."
        aria-label="Cari SoonMates di peta"
      />
      {#if searchQuery}
        <button
          type="button"
          class="clear-search-btn"
          onclick={() => (searchQuery = '')}
          aria-label="Hapus pencarian"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      {/if}
    </div>

    <div class="map-controls__actions">
      <!-- Generation Filter -->
      <select
        bind:value={selectedGeneration}
        class="gen-select"
        aria-label="Filter berdasarkan angkatan"
      >
        <option value="all">Semua Angkatan</option>
        {#each SOON_GENERATIONS as gen (gen.year)}
          <option value={gen.year}>{gen.name}</option>
        {/each}
      </select>

      <!-- Reset / Center button -->
      <button
        type="button"
        class="btn-reset-map"
        onclick={resetView}
        title="Pusatkan Peta ke Indonesia"
        aria-label="Pusatkan Peta"
      >
        <svg
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
        <span>Reset</span>
      </button>
    </div>
  </div>

  <!-- City Quick Filter Pills -->
  {#if citySummary.length > 0}
    <div class="city-strip" aria-label="Daftar kota persebaran">
      <span class="city-strip__label">Kota Populer:</span>
      <div class="city-strip__pills">
        {#each citySummary.slice(0, 8) as item (item.city)}
          <button type="button" class="city-pill" onclick={() => focusCity(item.city)}>
            <span>{item.city}</span>
            <strong class="city-pill__count">{item.count}</strong>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Interactive Map Viewport -->
  <div class="map-viewport-wrapper">
    <div bind:this={mapContainer} class="map-viewport" id="soonmates-interactive-map"></div>

    <!-- Active Pin Bottom Sheet (Mobile friendly quick view) -->
    {#if activePin}
      <div class="active-pin-drawer" role="region" aria-label="Detail SoonMate terpilih">
        <div class="drawer-header">
          <div class="drawer-avatar">
            {#if activePin.photoPath}
              <img
                src={publicStorageUrl('profile-photos', activePin.photoPath)}
                alt={activePin.name}
              />
            {:else}
              <span class="drawer-initials">
                {activePin.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('')}
              </span>
            {/if}
          </div>
          <div class="drawer-info">
            <span class="drawer-gen">{getGenerationName(activePin.batchYear)}</span>
            <h4 class="drawer-name">{activePin.name}</h4>
            <p class="drawer-location">
              <svg
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{activePin.location}</span>
            </p>
          </div>
          <button
            type="button"
            class="drawer-close-btn"
            onclick={() => (activePin = null)}
            aria-label="Tutup detail"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="drawer-footer">
          <a href={paths.profile(activePin.slug)} class="drawer-link-btn">
            <span>Buka Halaman Profil</span>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    {/if}
  </div>

  <!-- Map Footer Meta -->
  <div class="map-meta-footer">
    <div class="map-meta-item">
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <span><strong>{filteredPins.length}</strong> SoonMates terdata di peta</span>
    </div>
    <div class="map-meta-item">
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path
          d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        />
      </svg>
      <span><strong>{citySummary.length}</strong> Kota & Wilayah</span>
    </div>
  </div>
</div>

<style>
  .member-map-card {
    display: grid;
    gap: 1.25rem;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1.25rem;
    padding: 1.25rem;
    box-shadow:
      0 12px 32px -8px rgba(18, 21, 20, 0.06),
      0 2px 8px -2px rgba(18, 21, 20, 0.03);
  }

  /* Map Controls */
  .map-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
  }

  .map-controls__search {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1 1 240px;
    min-width: 200px;
  }

  .search-icon {
    position: absolute;
    left: 0.85rem;
    color: var(--ink-soft);
    pointer-events: none;
  }

  .map-controls__search input {
    width: 100%;
    height: 42px;
    padding: 0 2.2rem 0 2.4rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface-muted);
    color: var(--ink);
    font-size: 0.88rem;
    outline: none;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;
  }

  .map-controls__search input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
    background: var(--surface);
  }

  .clear-search-btn {
    position: absolute;
    right: 0.65rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: color-mix(in srgb, var(--ink) 10%, transparent);
    color: var(--ink-soft);
    cursor: pointer;
  }

  .map-controls__actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .gen-select {
    height: 42px;
    padding: 0 1rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface-muted);
    color: var(--ink);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    transition: border-color 150ms ease;
  }

  .gen-select:focus {
    border-color: var(--accent);
  }

  .btn-reset-map {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 42px;
    padding: 0 1rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface);
    color: var(--ink);
    font-size: 0.85rem;
    font-weight: 650;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      transform 150ms ease;
  }

  .btn-reset-map:hover {
    background: var(--surface-muted);
    border-color: var(--ink);
    transform: translateY(-1px);
  }

  /* City Pills Strip */
  .city-strip {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 0.25rem;
  }

  .city-strip::-webkit-scrollbar {
    display: none;
  }

  .city-strip__label {
    font-size: 0.78rem;
    font-weight: 750;
    color: var(--ink-soft);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .city-strip__pills {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .city-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.65rem;
    border-radius: 9999px;
    border: 1px solid var(--line-soft);
    background: var(--surface-muted);
    color: var(--ink);
    font-size: 0.78rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 150ms ease,
      border-color 150ms ease,
      color 150ms ease,
      transform 150ms ease;
  }

  .city-pill:hover {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .city-pill__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding-inline: 4px;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--ink) 12%, transparent);
    font-size: 0.68rem;
    font-weight: 800;
  }

  .city-pill:hover .city-pill__count {
    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;
  }

  /* Map Viewport */
  .map-viewport-wrapper {
    position: relative;
    width: 100%;
    height: clamp(380px, 55vh, 560px);
    border-radius: 1rem;
    overflow: hidden;
    border: 1px solid var(--line-soft);
  }

  .map-viewport {
    width: 100%;
    height: 100%;
    background: #eef1f4;
  }

  /* Active Pin Drawer */
  .active-pin-drawer {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: 380px;
    background: var(--surface);
    border: 1px solid var(--line-soft);
    border-radius: 1rem;
    padding: 1rem;
    box-shadow:
      0 16px 36px -8px rgba(18, 21, 20, 0.2),
      0 4px 12px -2px rgba(18, 21, 20, 0.08);
    z-index: 1000;
    animation: drawerSlideUp 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes drawerSlideUp {
    from {
      transform: translateY(16px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .drawer-header {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .drawer-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--surface-muted);
    flex-shrink: 0;
    border: 2px solid var(--accent);
  }

  .drawer-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .drawer-initials {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--accent);
    background: var(--accent-soft);
  }

  .drawer-info {
    flex: 1;
    min-width: 0;
  }

  .drawer-gen {
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .drawer-name {
    margin: 0.1rem 0;
    font-size: 0.98rem;
    font-weight: 750;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .drawer-location {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin: 0;
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  .drawer-close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: var(--surface-muted);
    color: var(--ink-soft);
    cursor: pointer;
    align-self: flex-start;
  }

  .drawer-footer {
    margin-top: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--line-soft);
  }

  .drawer-link-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    height: 38px;
    border-radius: 0.6rem;
    background: var(--accent);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 150ms ease;
  }

  .drawer-link-btn:hover {
    opacity: 0.92;
  }

  /* Map Meta Footer */
  .map-meta-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-inline: 0.5rem;
    font-size: 0.82rem;
    color: var(--ink-soft);
  }

  .map-meta-item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .map-meta-item strong {
    color: var(--ink);
  }

  /* Leaflet Pin Styles (Global) */
  :global(.soon-marker-wrapper) {
    background: none !important;
    border: none !important;
  }

  :global(.custom-map-pin) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.custom-map-pin:hover) {
    transform: scale(1.18) translateY(-4px);
    z-index: 10000 !important;
  }

  :global(.pin-avatar) {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    background: #ffffff;
    border: 2.5px solid var(--accent);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.22),
      0 0 0 3px rgba(255, 255, 255, 0.8);
  }

  :global(.pin-avatar img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :global(.pin-initials) {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--accent);
    background: var(--accent-soft);
  }

  :global(.pin-badge) {
    position: absolute;
    bottom: -4px;
    background: var(--ink);
    color: #ffffff;
    font-size: 0.58rem;
    font-weight: 800;
    padding: 1px 4px;
    border-radius: 4px;
    letter-spacing: 0.02em;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  :global(.pin-pointer) {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid var(--accent);
    margin-top: 2px;
  }

  /* Leaflet Popup Styles */
  :global(.soon-leaflet-popup .leaflet-popup-content-wrapper) {
    border-radius: 1rem;
    padding: 0;
    overflow: hidden;
    box-shadow:
      0 16px 36px -8px rgba(18, 21, 20, 0.25),
      0 4px 12px -2px rgba(18, 21, 20, 0.08);
    background: var(--surface);
    color: var(--ink);
  }

  :global(.soon-leaflet-popup .leaflet-popup-content) {
    margin: 0;
    line-height: 1.4;
  }

  :global(.map-popup-card) {
    padding: 1rem;
    display: grid;
    gap: 0.65rem;
    font-family: inherit;
  }

  :global(.popup-header) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.popup-avatar) {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--surface-muted);
    border: 2px solid var(--accent);
    flex-shrink: 0;
  }

  :global(.popup-avatar img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :global(.popup-initials) {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 800;
    color: var(--accent);
    background: var(--accent-soft);
  }

  :global(.popup-info) {
    flex: 1;
    min-width: 0;
  }

  :global(.popup-gen) {
    font-size: 0.68rem;
    font-weight: 800;
    color: var(--accent);
    text-transform: uppercase;
  }

  :global(.popup-name) {
    margin: 0.1rem 0 0;
    font-size: 0.95rem;
    font-weight: 750;
    color: var(--ink);
    line-height: 1.25;
  }

  :global(.popup-role) {
    margin: 0;
    font-size: 0.82rem;
    color: var(--ink-soft);
  }

  :global(.popup-location) {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: var(--ink-soft);
  }

  :global(.popup-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    width: 100%;
    height: 34px;
    border-radius: 0.5rem;
    background: var(--accent);
    color: #ffffff !important;
    font-size: 0.8rem;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 150ms ease;
    margin-top: 0.25rem;
  }

  :global(.popup-btn:hover) {
    opacity: 0.92;
  }
</style>
