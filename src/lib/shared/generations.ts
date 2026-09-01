export interface SoonGeneration {
  key: string;
  name: string;
}

export const SOON_GENERATIONS: SoonGeneration[] = [
  { key: 'superteam', name: 'Gen.SuperTeam' },
  { key: 'sobat-skawan', name: 'Gen.SobatSKAWAN' },
  { key: 'osida', name: 'Gen.Osida' },
  { key: 'reborn', name: 'Gen.Reborn' },
  { key: 'metaverse', name: 'Gen.Metaverse' },
  { key: 'hybrid', name: 'Gen.Hybrid' },
  { key: 'cov19', name: 'Gen.Cov19' },
  { key: '2-0', name: 'Gen.2.0' },
  { key: 'beta', name: 'Gen.Beta' },
];

export const GENERATIONS = SOON_GENERATIONS;
export const GENERATION_KEYS = SOON_GENERATIONS.map((generation) => generation.key) as [
  string,
  ...string[],
];

export function getGenerationName(generationKey: string | null | undefined): string {
  if (!generationKey) return 'Alumni SOON';
  return SOON_GENERATIONS.find((generation) => generation.key === generationKey)?.name ?? 'SOON';
}

export const formatGenerationBadge = getGenerationName;
