import { z } from 'zod';

export type ReactionType = 'heart' | 'nostalgic' | 'sparkle' | 'proud';

export interface ReactionMeta {
  type: ReactionType;
  label: string;
  description: string;
}

export const REACTION_CONFIG: Record<ReactionType, ReactionMeta> = {
  heart: {
    type: 'heart',
    label: 'Respek',
    description: 'Memberikan apresiasi penuh rasa hormat',
  },
  nostalgic: {
    type: 'nostalgic',
    label: 'Nostalgia',
    description: 'Mengingatkan kembali masa-masa indah',
  },
  sparkle: {
    type: 'sparkle',
    label: 'Berkesan',
    description: 'Momen berharga yang menginspirasi',
  },
  proud: {
    type: 'proud',
    label: 'Bangga',
    description: 'Kebanggaan bagi keluarga besar SOON',
  },
};

export interface MemoryAuthor {
  id: string;
  name: string;
  slug: string;
  photoPath: string | null;
  generationKey: string;
}

export interface MemoryCard {
  id: string;
  authorId: string;
  title: string;
  story: string;
  generationKey: string;
  mediaType: 'image' | 'video';
  mediaPath: string;
  mediaAspectRatio: '16/10' | '4/3' | '1/1' | '9/16';
  memoryYear: number | null;
  locationTag: string | null;
  createdAt: string;
  author: MemoryAuthor;
  reactionCount: number;
  commentCount: number;
}

export interface MemoryComment {
  id: string;
  memoryId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: MemoryAuthor;
}

export interface MemoryReactionSummary {
  counts: Record<ReactionType, number>;
  total: number;
  userReactions: ReactionType[];
}

export interface MemoryDetail extends MemoryCard {
  reactions: MemoryReactionSummary;
  comments: MemoryComment[];
  isOwner: boolean;
  canModerate: boolean;
}

export const createMemorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Judul kenangan minimal 3 karakter')
    .max(160, 'Judul kenangan maksimal 160 karakter'),
  story: z
    .string()
    .trim()
    .min(10, 'Cerita kenangan minimal 10 karakter')
    .max(5000, 'Cerita kenangan maksimal 5000 karakter'),
  generationKey: z.string().min(1, 'Pilih angkatan terkait'),
  mediaType: z.enum(['image', 'video']).default('image'),
  mediaPath: z.string().min(1, 'Unggah foto atau video kenangan'),
  mediaAspectRatio: z.enum(['16/10', '4/3', '1/1', '9/16']).default('16/10'),
  memoryYear: z.number().int().min(2000).max(2100).nullable().optional(),
  locationTag: z.string().trim().max(100).nullable().optional(),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Komentar tidak boleh kosong')
    .max(1000, 'Komentar maksimal 1000 karakter'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const toggleReactionSchema = z.object({
  reactionType: z.enum(['heart', 'nostalgic', 'sparkle', 'proud']),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
