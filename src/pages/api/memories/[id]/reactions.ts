import { toggleMemoryReaction } from '@/lib/server/memory-repository';
import { toggleReactionSchema } from '@/lib/shared/memory-models';
import { createServerSupabase } from '@/lib/supabase/server';

import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);
  const memoryId = context.params.id;

  if (!memoryId) {
    return new Response(JSON.stringify({ ok: false, message: 'ID kenangan tidak ditemukan.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Format request tidak valid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = toggleReactionSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'Reaksi tidak valid.';
    return new Response(JSON.stringify({ ok: false, message: errorMsg }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await toggleMemoryReaction(supabase, memoryId, parsed.data.reactionType);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
