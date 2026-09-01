export interface GeoCoordinates {
  lat: number;
  lon: number;
}

export interface GeoMemberPin {
  id: string;
  slug: string;
  name: string;
  photoPath: string | null;
  batchYear: number;
  location: string;
  lat: number;
  lon: number;
  currentActivity: string | null;
  currentPlaceName: string | null;
  fieldLabels: string[];
}

/**
 * Curated reference coordinates for Indonesian regencies/cities and international tech hubs.
 * Provides instant 0ms geocoding with no external API calls required.
 */
const KNOWN_COORDINATES: Record<string, GeoCoordinates> = {
  // Jabodetabek & Banten
  jakarta: { lat: -6.2088, lon: 106.8456 },
  'jakarta selatan': { lat: -6.2615, lon: 106.8106 },
  'jakarta pusat': { lat: -6.1805, lon: 106.8284 },
  'jakarta barat': { lat: -6.1683, lon: 106.7588 },
  'jakarta timur': { lat: -6.225, lon: 106.9004 },
  'jakarta utara': { lat: -6.1384, lon: 106.864 },
  depok: { lat: -6.4025, lon: 106.7942 },
  bogor: { lat: -6.5971, lon: 106.806 },
  tangerang: { lat: -6.1783, lon: 106.6319 },
  'tangerang selatan': { lat: -6.2887, lon: 106.7179 },
  tangsel: { lat: -6.2887, lon: 106.7179 },
  bekasi: { lat: -6.2383, lon: 106.9756 },
  cikarang: { lat: -6.3053, lon: 107.1537 },
  serang: { lat: -6.1104, lon: 106.1639 },
  cilegon: { lat: -6.0024, lon: 106.0152 },
  lebak: { lat: -6.5519, lon: 106.252 },
  pandeglang: { lat: -6.3084, lon: 106.1064 },

  // Jawa Barat
  bandung: { lat: -6.9175, lon: 107.6191 },
  'bandung barat': { lat: -6.8427, lon: 107.5029 },
  cimahi: { lat: -6.8723, lon: 107.5422 },
  sukabumi: { lat: -6.9277, lon: 106.93 },
  cianjur: { lat: -6.8173, lon: 107.1394 },
  karawang: { lat: -6.3042, lon: 107.3056 },
  purwakarta: { lat: -6.5569, lon: 107.4433 },
  subang: { lat: -6.5716, lon: 107.7587 },
  cirebon: { lat: -6.732, lon: 108.5523 },
  indramayu: { lat: -6.3264, lon: 108.32 },
  majalengka: { lat: -6.8361, lon: 108.2278 },
  kuningan: { lat: -6.9765, lon: 108.4834 },
  sumedang: { lat: -6.8584, lon: 107.9266 },
  garut: { lat: -7.2279, lon: 107.9087 },
  tasikmalaya: { lat: -7.3274, lon: 108.2207 },
  ciamis: { lat: -7.3256, lon: 108.3533 },
  banjar: { lat: -7.3686, lon: 108.5342 },
  pangandaran: { lat: -7.7029, lon: 108.4947 },

  // DI Yogyakarta & Jawa Tengah
  yogyakarta: { lat: -7.7956, lon: 110.3695 },
  jogja: { lat: -7.7956, lon: 110.3695 },
  sleman: { lat: -7.7156, lon: 110.3556 },
  bantul: { lat: -7.8938, lon: 110.3306 },
  'kulon progo': { lat: -7.8256, lon: 110.1583 },
  gunungkidul: { lat: -7.9606, lon: 110.6014 },
  semarang: { lat: -7.0051, lon: 110.4381 },
  surakarta: { lat: -7.5666, lon: 110.8267 },
  solo: { lat: -7.5666, lon: 110.8267 },
  salatiga: { lat: -7.3305, lon: 110.5084 },
  magelang: { lat: -7.4706, lon: 110.2178 },
  pekalongan: { lat: -6.8886, lon: 109.6753 },
  tegal: { lat: -6.8694, lon: 109.1402 },
  purwokerto: { lat: -7.4243, lon: 109.2302 },
  banyumas: { lat: -7.5165, lon: 109.2946 },
  cilacap: { lat: -7.7031, lon: 109.0159 },
  kebumen: { lat: -7.6686, lon: 109.652 },
  purworejo: { lat: -7.7144, lon: 110.0078 },
  wonosobo: { lat: -7.3639, lon: 109.9008 },
  temanggung: { lat: -7.3167, lon: 110.1772 },
  kendal: { lat: -6.9228, lon: 110.2039 },
  demak: { lat: -6.8944, lon: 110.6386 },
  kudus: { lat: -6.8048, lon: 110.8405 },
  jepara: { lat: -6.5944, lon: 110.6719 },
  pati: { lat: -6.7556, lon: 111.0378 },
  rembang: { lat: -6.7083, lon: 111.3417 },
  blora: { lat: -6.9697, lon: 111.4183 },
  grobogan: { lat: -7.1139, lon: 110.9167 },
  boyolali: { lat: -7.5333, lon: 110.5956 },
  klaten: { lat: -7.7056, lon: 110.6044 },
  sukoharjo: { lat: -7.6833, lon: 110.8333 },
  wonogiri: { lat: -7.8139, lon: 110.9256 },
  karanganyar: { lat: -7.5972, lon: 110.9506 },
  sragen: { lat: -7.4267, lon: 111.0222 },

  // Jawa Timur
  surabaya: { lat: -7.2575, lon: 112.7521 },
  malang: { lat: -7.9797, lon: 112.6304 },
  batu: { lat: -7.8712, lon: 112.5273 },
  sidoarjo: { lat: -7.4478, lon: 112.7183 },
  gresik: { lat: -7.1566, lon: 112.6555 },
  mojokerto: { lat: -7.4726, lon: 112.4381 },
  pasuruan: { lat: -7.6453, lon: 112.9075 },
  probolinggo: { lat: -7.7543, lon: 113.2159 },
  lumajang: { lat: -8.1333, lon: 113.2228 },
  jember: { lat: -8.1724, lon: 113.7007 },
  banyuwangi: { lat: -8.2192, lon: 114.3692 },
  bondowoso: { lat: -7.9133, lon: 113.8214 },
  situbondo: { lat: -7.7064, lon: 114.0044 },
  kediri: { lat: -7.848, lon: 112.0178 },
  blitar: { lat: -8.0954, lon: 112.1609 },
  tulungagung: { lat: -8.0667, lon: 111.9 },
  trenggalek: { lat: -8.05, lon: 111.7167 },
  madiun: { lat: -7.6298, lon: 111.5239 },
  magetan: { lat: -7.65, lon: 111.3167 },
  ngawi: { lat: -7.4039, lon: 111.4447 },
  ponorogo: { lat: -7.8667, lon: 111.4667 },
  pacitan: { lat: -8.2044, lon: 111.0928 },
  nganjuk: { lat: -7.6047, lon: 111.9044 },
  jombang: { lat: -7.5458, lon: 112.2331 },
  lamongan: { lat: -7.1281, lon: 112.4131 },
  tuban: { lat: -6.8976, lon: 112.0649 },
  bojonegoro: { lat: -7.1502, lon: 111.8817 },
  bangkalan: { lat: -7.0317, lon: 112.7483 },
  sampang: { lat: -7.1867, lon: 113.2433 },
  pamekasan: { lat: -7.1608, lon: 113.4831 },
  sumenep: { lat: -7.0167, lon: 113.8667 },

  // Bali & Nusa Tenggara
  denpasar: { lat: -8.6705, lon: 115.2126 },
  bali: { lat: -8.4095, lon: 115.1889 },
  badung: { lat: -8.5833, lon: 115.1833 },
  kuta: { lat: -8.7233, lon: 115.1725 },
  seminyak: { lat: -8.6913, lon: 115.1682 },
  canggu: { lat: -8.6478, lon: 115.1385 },
  ubud: { lat: -8.5069, lon: 115.2625 },
  gianyar: { lat: -8.5433, lon: 115.3267 },
  tabanan: { lat: -8.5383, lon: 115.1233 },
  buleleng: { lat: -8.1128, lon: 115.0881 },
  singaraja: { lat: -8.1128, lon: 115.0881 },
  mataram: { lat: -8.5833, lon: 116.1167 },
  lombok: { lat: -8.5833, lon: 116.1167 },
  kupang: { lat: -10.1772, lon: 123.607 },
  labuanbajo: { lat: -8.4964, lon: 119.8877 },
  'labuan bajo': { lat: -8.4964, lon: 119.8877 },

  // Sumatera
  medan: { lat: 3.5952, lon: 98.6722 },
  'banda aceh': { lat: 5.5483, lon: 95.3238 },
  padang: { lat: -0.9471, lon: 100.4172 },
  pekanbaru: { lat: 0.5071, lon: 101.4478 },
  batam: { lat: 1.1301, lon: 104.0529 },
  tanjungpinang: { lat: 0.9167, lon: 104.45 },
  jambi: { lat: -1.6101, lon: 103.6131 },
  palembang: { lat: -2.9761, lon: 104.7754 },
  bengkulu: { lat: -3.8004, lon: 102.2655 },
  'bandar lampung': { lat: -5.45, lon: 105.2667 },
  lampung: { lat: -5.45, lon: 105.2667 },

  // Kalimantan
  pontianak: { lat: -0.0263, lon: 109.3425 },
  singkawang: { lat: 0.9067, lon: 108.9867 },
  palangkaraya: { lat: -2.2161, lon: 113.9139 },
  banjarmasin: { lat: -3.3194, lon: 114.5908 },
  banjarbaru: { lat: -3.4406, lon: 114.8306 },
  balikpapan: { lat: -1.2379, lon: 116.8529 },
  samarinda: { lat: -0.5022, lon: 117.1536 },
  nusantara: { lat: -0.9739, lon: 116.7089 },
  ikn: { lat: -0.9739, lon: 116.7089 },
  tarakan: { lat: 3.3, lon: 117.6333 },

  // Sulawesi & Maluku & Papua
  makassar: { lat: -5.1477, lon: 119.4327 },
  manado: { lat: 1.4748, lon: 124.8428 },
  palu: { lat: -0.9003, lon: 119.8779 },
  kendari: { lat: -3.9985, lon: 122.5126 },
  gorontalo: { lat: 0.5435, lon: 123.0568 },
  mamuju: { lat: -2.6738, lon: 118.887 },
  ambon: { lat: -3.6954, lon: 128.1814 },
  ternate: { lat: 0.7833, lon: 127.3667 },
  jayapura: { lat: -2.5916, lon: 140.669 },
  manokwari: { lat: -0.8615, lon: 134.062 },
  sorong: { lat: -0.8762, lon: 131.2558 },
  merauke: { lat: -8.4932, lon: 140.4019 },

  // Global Hubs
  singapore: { lat: 1.3521, lon: 103.8198 },
  singapura: { lat: 1.3521, lon: 103.8198 },
  'kuala lumpur': { lat: 3.139, lon: 101.6869 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  osaka: { lat: 34.6937, lon: 135.5023 },
  kyoto: { lat: 35.0116, lon: 135.7681 },
  seoul: { lat: 37.5665, lon: 126.978 },
  taipei: { lat: 25.033, lon: 121.5654 },
  bangkok: { lat: 13.7563, lon: 100.5018 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  melbourne: { lat: -37.8136, lon: 144.9631 },
  london: { lat: 51.5074, lon: -0.1278 },
  berlin: { lat: 52.52, lon: 13.405 },
  amsterdam: { lat: 52.3676, lon: 4.9041 },
  dublin: { lat: 53.3498, lon: -6.2603 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'new york': { lat: 40.7128, lon: -74.006 },
  seattle: { lat: 47.6062, lon: -122.3321 },
  toronto: { lat: 43.6532, lon: -79.3832 },
  vancouver: { lat: 49.2827, lon: -123.1207 },
};

/**
 * Resolves a human-entered location string to geographic coordinates (lat, lon).
 */
export function resolveCoordinates(rawLocation: string | null | undefined): GeoCoordinates | null {
  if (!rawLocation) return null;

  const normalized = rawLocation
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return null;

  // 1. Direct exact key lookup
  if (KNOWN_COORDINATES[normalized]) {
    return KNOWN_COORDINATES[normalized] ?? null;
  }

  // 2. Token / City word lookup (search through known city aliases)
  const tokens = normalized.split(' ').filter(Boolean);

  // Check multi-word keys first (e.g. 'jakarta selatan', 'kuala lumpur', 'bandung barat')
  for (const key of Object.keys(KNOWN_COORDINATES)) {
    if (key.includes(' ') && normalized.includes(key)) {
      return KNOWN_COORDINATES[key] ?? null;
    }
  }

  // Check single token matches
  for (const token of tokens) {
    if (KNOWN_COORDINATES[token]) {
      return KNOWN_COORDINATES[token] ?? null;
    }
  }

  // 3. Fallback: Check if string contains any known key
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }

  return null;
}

/**
 * Applies a slight deterministic radial offset for markers at identical coordinates
 * so multiple members in the same city are all discoverable on the map.
 */
export function applyCoordinateJitter(
  baseLat: number,
  baseLon: number,
  index: number,
  totalInCluster: number,
): GeoCoordinates {
  if (totalInCluster <= 1 || index === 0) {
    return { lat: baseLat, lon: baseLon };
  }

  const angle = ((index - 1) / (totalInCluster - 1)) * (2 * Math.PI);
  const radius = 0.015 + (index % 3) * 0.006; // roughly 1-2km spread for clean readability

  return {
    lat: baseLat + radius * Math.cos(angle),
    lon: baseLon + radius * Math.sin(angle) * 1.15,
  };
}
