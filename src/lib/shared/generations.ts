export interface SoonGeneration {
  year: number;
  name: string;
  label: string;
}

export const SOON_GENERATIONS: SoonGeneration[] = [
  { year: 2026, name: 'Gen.SuperTeam', label: 'Gen.SuperTeam' },
  { year: 2025, name: 'Gen.SobatSKAWAN', label: 'Gen.SobatSKAWAN' },
  { year: 2024, name: 'Gen.Osida', label: 'Gen.Osida' },
  { year: 2023, name: 'Gen.Reborn', label: 'Gen.Reborn' },
  { year: 2022, name: 'Gen.Metaverse', label: 'Gen.Metaverse' },
  { year: 2021, name: 'Gen.Hybrid', label: 'Gen.Hybrid' },
  { year: 2020, name: 'Gen.Cov19', label: 'Gen.Cov19' },
  { year: 2019, name: 'Gen.2.0', label: 'Gen.2.0' },
  { year: 2018, name: 'Gen.Beta', label: 'Gen.Beta' },
];

export function getGenerationName(batchYear: number | null | undefined): string {
  if (!batchYear) return 'Alumni SOON';
  const found = SOON_GENERATIONS.find((g) => g.year === batchYear);
  return found ? found.name : `Gen ${batchYear}`;
}

export function formatGenerationBadge(batchYear: number | null | undefined): string {
  if (!batchYear) return 'SOON';
  const found = SOON_GENERATIONS.find((g) => g.year === batchYear);
  return found ? found.name : `Gen ${batchYear}`;
}
