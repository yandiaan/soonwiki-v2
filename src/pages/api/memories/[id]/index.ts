import { deleteMemory } from '@/lib/server/memory-repository';
import { createServerSupabase } from '@/lib/supabase/server';

import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);
  const memoryId = context.params.id;

  if (!memoryId) {
    return new Response(JSON.stringify({ ok: false, message: 'ID kenangan tidak ditemukan.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await deleteMemory(supabase, memoryId);

  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
