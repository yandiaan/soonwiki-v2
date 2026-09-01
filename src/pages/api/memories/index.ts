import { createMemory, listMemories } from '@/lib/server/memory-repository';
import { createMemorySchema } from '@/lib/shared/memory-models';
import { createServerSupabase } from '@/lib/supabase/server';

import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);
  const url = new URL(context.request.url);

  const generationKey = url.searchParams.get('generation') || undefined;
  const mediaType = url.searchParams.get('mediaType') as 'image' | 'video' | undefined;
  const search = url.searchParams.get('search') || undefined;

  const result = await listMemories(supabase, {
    generationKey,
    mediaType,
    search,
  });

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);
  let body: unknown;

  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Format request tidak valid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = createMemorySchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Data tidak valid.';
    return new Response(JSON.stringify({ ok: false, message: errorMsg }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await createMemory(supabase, parsed.data);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 201 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
