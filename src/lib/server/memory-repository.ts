import type {
  CreateMemoryInput,
  MemoryCard,
  MemoryComment,
  MemoryDetail,
  ReactionType,
} from '@/lib/shared/memory-models';
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>;

export interface MemoryResult<T> {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
}

export interface MemoryFilters {
  generationKey?: string | undefined;
  mediaType?: 'image' | 'video' | undefined;
  search?: string | undefined;
}

interface ProfileSnippet {
  owner_id: string;
  name: string | null;
  slug: string | null;
  photo_path: string | null;
  generation_key: string | null;
}

interface RawMemoryRow {
  id: string;
  author_id: string;
  title: string;
  story: string;
  generation_key: string;
  media_type: 'image' | 'video';
  media_path: string;
  media_aspect_ratio: '16/10' | '4/3' | '1/1' | '9/16';
  memory_year: number | null;
  location_tag: string | null;
  created_at: string;
  author_name: string | null;
  author_slug: string | null;
  author_photo_path: string | null;
  author_generation_key: string | null;
  reaction_count: number | string | null;
  comment_count: number | string | null;
}

function mapToMemoryCard(row: RawMemoryRow): MemoryCard {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    story: row.story,
    generationKey: row.generation_key,
    mediaType: row.media_type,
    mediaPath: row.media_path,
    mediaAspectRatio: row.media_aspect_ratio,
    memoryYear: row.memory_year,
    locationTag: row.location_tag,
    createdAt: row.created_at,
    author: {
      id: row.author_id,
      name: row.author_name ?? 'Alumni SOON',
      slug: row.author_slug ?? '',
      photoPath: row.author_photo_path ?? null,
      generationKey: row.author_generation_key ?? row.generation_key,
    },
    reactionCount: Number(row.reaction_count ?? 0),
    commentCount: Number(row.comment_count ?? 0),
  };
}

export async function listMemories(
  client: Client,
  filters?: MemoryFilters,
): Promise<MemoryResult<MemoryCard[]>> {
  try {
    let query = client
      .from('published_memory_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.generationKey && filters.generationKey !== 'all') {
      query = query.eq('generation_key', filters.generationKey);
    }

    if (filters?.mediaType) {
      query = query.eq('media_type', filters.mediaType);
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      query = query.or(`title.ilike.%${s}%,story.ilike.%${s}%,location_tag.ilike.%${s}%`);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback: query table directly if view is missing or updating
      const { data: rawData, error: rawError } = await client
        .from('memories')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (rawError || !rawData) {
        return { ok: false, code: 'FETCH_ERROR', message: rawError?.message || error.message };
      }

      const authorIds = rawData.map((m: { author_id: string }) => m.author_id);
      const { data: profiles } = await client
        .from('profiles')
        .select('owner_id, name, slug, photo_path, generation_key')
        .in('owner_id', authorIds);

      const profileMap = new Map(
        ((profiles ?? []) as unknown as ProfileSnippet[]).map((p) => [p.owner_id, p]),
      );

      const cards: MemoryCard[] = rawData.map(
        (row: {
          id: string;
          author_id: string;
          title: string;
          story: string;
          generation_key: string;
          media_type: 'image' | 'video';
          media_path: string;
          media_aspect_ratio: '16/10' | '4/3' | '1/1' | '9/16';
          memory_year: number | null;
          location_tag: string | null;
          created_at: string;
        }) => {
          const profile = profileMap.get(row.author_id);
          return {
            id: row.id,
            authorId: row.author_id,
            title: row.title,
            story: row.story,
            generationKey: row.generation_key,
            mediaType: row.media_type,
            mediaPath: row.media_path,
            mediaAspectRatio: row.media_aspect_ratio,
            memoryYear: row.memory_year,
            locationTag: row.location_tag,
            createdAt: row.created_at,
            author: {
              id: row.author_id,
              name: profile?.name ?? 'Alumni SOON',
              slug: profile?.slug ?? '',
              photoPath: profile?.photo_path ?? null,
              generationKey: profile?.generation_key ?? row.generation_key,
            },
            reactionCount: 0,
            commentCount: 0,
          };
        },
      );

      return { ok: true, data: cards };
    }

    const cards = ((data ?? []) as unknown as RawMemoryRow[]).map(mapToMemoryCard);
    return { ok: true, data: cards };
  } catch (err) {
    return {
      ok: false,
      code: 'UNEXPECTED_ERROR',
      message: err instanceof Error ? err.message : 'Terjadi kesalahan.',
    };
  }
}

export async function getMemoryDetail(
  client: Client,
  memoryId: string,
): Promise<MemoryResult<MemoryDetail>> {
  try {
    const {
      data: { user },
    } = await client.auth.getUser();

    // 1. Fetch memory card
    const { data: memoryData, error: memError } = await client
      .from('published_memory_cards')
      .select('*')
      .eq('id', memoryId)
      .maybeSingle();

    if (memError || !memoryData) {
      // Fallback direct table query
      const { data: rawMem, error: rawError } = await client
        .from('memories')
        .select('*')
        .eq('id', memoryId)
        .maybeSingle();

      if (rawError || !rawMem) {
        return { ok: false, code: 'NOT_FOUND', message: 'Kenangan tidak ditemukan.' };
      }

      const { data: profile } = await client
        .from('profiles')
        .select('name, slug, photo_path, generation_key')
        .eq('owner_id', rawMem.author_id)
        .maybeSingle();

      const card = mapToMemoryCard({
        ...rawMem,
        author_name: profile?.name ?? 'Alumni SOON',
        author_slug: profile?.slug ?? '',
        author_photo_path: profile?.photo_path ?? null,
        author_generation_key: profile?.generation_key ?? rawMem.generation_key,
        reaction_count: 0,
        comment_count: 0,
      });

      return fetchReactionsAndComments(client, card, user?.id);
    }

    const card = mapToMemoryCard(memoryData as unknown as RawMemoryRow);
    return fetchReactionsAndComments(client, card, user?.id);
  } catch (err) {
    return {
      ok: false,
      code: 'UNEXPECTED_ERROR',
      message: err instanceof Error ? err.message : 'Terjadi kesalahan.',
    };
  }
}

async function fetchReactionsAndComments(
  client: Client,
  card: MemoryCard,
  currentUserId?: string,
): Promise<MemoryResult<MemoryDetail>> {
  // Fetch comments
  const { data: commentsData } = await client
    .from('memory_comments')
    .select('id, memory_id, author_id, content, created_at')
    .eq('memory_id', card.id)
    .order('created_at', { ascending: true });

  const commentAuthorIds = (commentsData ?? []).map((c: { author_id: string }) => c.author_id);
  const { data: commentProfiles } = await client
    .from('profiles')
    .select('owner_id, name, slug, photo_path, generation_key')
    .in(
      'owner_id',
      commentAuthorIds.length ? commentAuthorIds : ['00000000-0000-0000-0000-000000000000'],
    );

  const commentProfileMap = new Map(
    ((commentProfiles ?? []) as unknown as ProfileSnippet[]).map((p) => [p.owner_id, p]),
  );

  const comments: MemoryComment[] = (commentsData ?? []).map(
    (c: {
      id: string;
      memory_id: string;
      author_id: string;
      content: string;
      created_at: string;
    }) => {
      const p = commentProfileMap.get(c.author_id);
      return {
        id: c.id,
        memoryId: c.memory_id,
        authorId: c.author_id,
        content: c.content,
        createdAt: c.created_at,
        author: {
          id: c.author_id,
          name: p?.name ?? 'Alumni SOON',
          slug: p?.slug ?? '',
          photoPath: p?.photo_path ?? null,
          generationKey: p?.generation_key ?? card.generationKey,
        },
      };
    },
  );

  // Fetch reactions
  const { data: reactionsData } = await client
    .from('memory_reactions')
    .select('reaction_type, user_id')
    .eq('memory_id', card.id);

  const counts: Record<ReactionType, number> = {
    heart: 0,
    nostalgic: 0,
    sparkle: 0,
    proud: 0,
  };
  const userReactions: ReactionType[] = [];

  for (const r of (reactionsData ?? []) as Array<{
    reaction_type: ReactionType;
    user_id: string;
  }>) {
    if (counts[r.reaction_type] !== undefined) {
      counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + 1;
    }
    if (currentUserId && r.user_id === currentUserId) {
      userReactions.push(r.reaction_type);
    }
  }

  const total = Object.values(counts).reduce((sum, num) => sum + num, 0);

  // Check admin status
  let isUserAdmin = false;
  if (currentUserId) {
    const { data: member } = await client
      .from('members')
      .select('role, status')
      .eq('user_id', currentUserId)
      .maybeSingle();
    isUserAdmin = member?.role === 'admin' && member?.status === 'active';
  }

  const detail: MemoryDetail = {
    ...card,
    reactionCount: total,
    commentCount: comments.length,
    reactions: {
      counts,
      total,
      userReactions,
    },
    comments,
    isOwner: Boolean(currentUserId && card.authorId === currentUserId),
    canModerate: Boolean(isUserAdmin || (currentUserId && card.authorId === currentUserId)),
  };

  return { ok: true, data: detail };
}

export async function createMemory(
  client: Client,
  input: CreateMemoryInput,
): Promise<MemoryResult<{ id: string }>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Kamu harus masuk terlebih dahulu.' };
  }

  const { data: member } = await client
    .from('members')
    .select('status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (member?.status !== 'active') {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Hanya anggota aktif yang dapat mengunggah kenangan.',
    };
  }

  const { data, error } = await client
    .from('memories')
    .insert({
      author_id: user.id,
      title: input.title.trim(),
      story: input.story.trim(),
      generation_key: input.generationKey,
      media_type: input.mediaType || 'image',
      media_path: input.mediaPath,
      media_aspect_ratio: input.mediaAspectRatio || '16/10',
      memory_year: input.memoryYear || null,
      location_tag: input.locationTag?.trim() || null,
      is_published: true,
    })
    .select('id')
    .single();

  if (error || !data) {
    return {
      ok: false,
      code: 'INSERT_ERROR',
      message: error?.message || 'Gagal menyimpan kenangan.',
    };
  }

  return { ok: true, data: { id: data.id } };
}

export async function deleteMemory(client: Client, memoryId: string): Promise<MemoryResult<void>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Kamu harus masuk terlebih dahulu.' };
  }

  const { data: memory } = await client
    .from('memories')
    .select('author_id')
    .eq('id', memoryId)
    .maybeSingle();

  if (!memory) {
    return { ok: false, code: 'NOT_FOUND', message: 'Kenangan tidak ditemukan.' };
  }

  const { data: member } = await client
    .from('members')
    .select('role, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isOwner = memory.author_id === user.id;
  const isAdmin = member?.role === 'admin' && member?.status === 'active';

  if (!isOwner && !isAdmin) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Kamu tidak memiliki izin untuk menghapus kenangan ini.',
    };
  }

  const { error } = await client.from('memories').delete().eq('id', memoryId);

  if (error) {
    return { ok: false, code: 'DELETE_ERROR', message: error.message };
  }

  return { ok: true };
}

export async function addMemoryComment(
  client: Client,
  memoryId: string,
  content: string,
): Promise<MemoryResult<MemoryComment>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Kamu harus masuk untuk berkomentar.' };
  }

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 1000) {
    return {
      ok: false,
      code: 'INVALID_CONTENT',
      message: 'Komentar harus terdiri dari 1 hingga 1000 karakter.',
    };
  }

  const { data: inserted, error } = await client
    .from('memory_comments')
    .insert({
      memory_id: memoryId,
      author_id: user.id,
      content: trimmed,
    })
    .select('id, memory_id, author_id, content, created_at')
    .single();

  if (error || !inserted) {
    return {
      ok: false,
      code: 'INSERT_ERROR',
      message: error?.message || 'Gagal mengirim komentar.',
    };
  }

  const { data: profile } = await client
    .from('profiles')
    .select('name, slug, photo_path, generation_key')
    .eq('owner_id', user.id)
    .maybeSingle();

  const comment: MemoryComment = {
    id: inserted.id,
    memoryId: inserted.memory_id,
    authorId: inserted.author_id,
    content: inserted.content,
    createdAt: inserted.created_at,
    author: {
      id: user.id,
      name: profile?.name ?? 'Alumni SOON',
      slug: profile?.slug ?? '',
      photoPath: profile?.photo_path ?? null,
      generationKey: profile?.generation_key ?? 'soon',
    },
  };

  return { ok: true, data: comment };
}

export async function deleteMemoryComment(
  client: Client,
  commentId: string,
): Promise<MemoryResult<void>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Kamu harus masuk terlebih dahulu.' };
  }

  const { data: comment } = await client
    .from('memory_comments')
    .select('author_id, memory_id')
    .eq('id', commentId)
    .maybeSingle();

  if (!comment) {
    return { ok: false, code: 'NOT_FOUND', message: 'Komentar tidak ditemukan.' };
  }

  const { data: member } = await client
    .from('members')
    .select('role, status')
    .eq('user_id', user.id)
    .maybeSingle();

  const isOwner = comment.author_id === user.id;
  const isAdmin = member?.role === 'admin' && member?.status === 'active';

  if (!isOwner && !isAdmin) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'Kamu tidak memiliki izin untuk menghapus komentar ini.',
    };
  }

  const { error } = await client.from('memory_comments').delete().eq('id', commentId);

  if (error) {
    return { ok: false, code: 'DELETE_ERROR', message: error.message };
  }

  return { ok: true };
}

export async function toggleMemoryReaction(
  client: Client,
  memoryId: string,
  reactionType: ReactionType,
): Promise<
  MemoryResult<{
    counts: Record<ReactionType, number>;
    total: number;
    userReactions: ReactionType[];
  }>
> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Kamu harus masuk untuk memberikan reaksi.',
    };
  }

  // Check if reaction already exists
  const { data: existing } = await client
    .from('memory_reactions')
    .select('id')
    .eq('memory_id', memoryId)
    .eq('user_id', user.id)
    .eq('reaction_type', reactionType)
    .maybeSingle();

  if (existing) {
    await client.from('memory_reactions').delete().eq('id', existing.id);
  } else {
    await client.from('memory_reactions').insert({
      memory_id: memoryId,
      user_id: user.id,
      reaction_type: reactionType,
    });
  }

  // Fetch updated reactions summary
  const { data: allReactions } = await client
    .from('memory_reactions')
    .select('reaction_type, user_id')
    .eq('memory_id', memoryId);

  const counts: Record<ReactionType, number> = {
    heart: 0,
    nostalgic: 0,
    sparkle: 0,
    proud: 0,
  };
  const userReactions: ReactionType[] = [];

  for (const r of (allReactions ?? []) as Array<{ reaction_type: ReactionType; user_id: string }>) {
    if (counts[r.reaction_type] !== undefined) {
      counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + 1;
    }
    if (r.user_id === user.id) {
      userReactions.push(r.reaction_type);
    }
  }

  const total = Object.values(counts).reduce((sum, num) => sum + num, 0);

  return {
    ok: true,
    data: {
      counts,
      total,
      userReactions,
    },
  };
}
