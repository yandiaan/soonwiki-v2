import { z } from 'zod';

function normalizeText(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/g, ' ');
}

function trimmedOptional(maxLength: number) {
  return z
    .string()
    .optional()
    .transform((value) => {
      const normalized = value ? normalizeText(value) : undefined;
      return normalized === '' ? undefined : normalized;
    })
    .refine((value) => !value || value.length <= maxLength, {
      message: `Maksimal ${maxLength} karakter`,
    });
}

function httpsUrlOptional() {
  return z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed === '' ? undefined : trimmed;
    })
    .refine((value) => !value || value.startsWith('https://'), {
      message: 'URL harus menggunakan https://',
    });
}

export const profileInputSchema = z.object({
  name: z
    .string()
    .transform(normalizeText)
    .refine((value) => value.length >= 2 && value.length <= 160, {
      message: 'Nama harus 2–160 karakter',
    }),
  batchYear: z
    .number()
    .int()
    .min(2000, { message: 'Batch minimal 2000' })
    .max(2100, { message: 'Batch maksimal 2100' }),
  photoPath: trimmedOptional(500),
  bio: trimmedOptional(500),
  location: trimmedOptional(120),
  currentActivity: trimmedOptional(200),
  currentPlaceName: trimmedOptional(160),
  sinceSoonStory: trimmedOptional(1200),
  turningPointStory: trimmedOptional(1200),
  currentDirectionStory: trimmedOptional(1200),
  linkedinUrl: httpsUrlOptional(),
  instagramUrl: httpsUrlOptional(),
  websiteUrl: httpsUrlOptional(),
  isPublished: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;

export const journeyInputSchema = z.object({
  activity: z
    .string()
    .transform(normalizeText)
    .refine((value) => value.length >= 1 && value.length <= 200, {
      message: 'Peran atau kegiatan wajib diisi, maksimal 200 karakter',
    }),
  placeName: trimmedOptional(160),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
  story: trimmedOptional(1200),
});

export type JourneyInput = z.infer<typeof journeyInputSchema>;

export const proudMomentInputSchema = z.object({
  title: z
    .string()
    .transform(normalizeText)
    .refine((value) => value.length >= 1 && value.length <= 200, {
      message: 'Judul wajib diisi, maksimal 200 karakter',
    }),
  description: trimmedOptional(2000),
  placeName: trimmedOptional(160),
  year: z.number().int().min(1900).max(2100).optional(),
  imagePath: z.string().optional(),
  externalUrl: httpsUrlOptional(),
});

export type ProudMomentInput = z.infer<typeof proudMomentInputSchema>;
