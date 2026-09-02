import type { APIRoute } from 'astro';
import { extractProfileFromText } from '@/lib/server/ai-service';
import { listAllFields } from '@/lib/server/member-repository';
import { getMemberSession } from '@/lib/server/session';
import { createServerSupabase } from '@/lib/supabase/server';

export const POST: APIRoute = async (context) => {
  const session = await getMemberSession(context);

  if (!session || !session.member || session.member.status !== 'active') {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Sesi masuk telah berakhir. Silakan masuk terlebih dahulu.',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  let body: { text?: string };
  try {
    body = (await context.request.json()) as { text?: string };
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Format request tidak valid.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const rawText = body.text?.trim() || '';
  if (rawText.length < 15) {
    return new Response(
      JSON.stringify({
        ok: false,
        message:
          'Teks deskripsi terlalu pendek. Masukkan minimal 1-2 kalimat deskripsi atau tempelkan resume kamu.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (rawText.length > 15000) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Teks terlalu panjang. Maksimal 15.000 karakter.',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const supabase = createServerSupabase(context);
  const availableFields = await listAllFields(supabase);

  const result = await extractProfileFromText(rawText, availableFields);

  if (!result.ok) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: result.error,
        message: result.message,
      }),
      {
        status: result.error === 'API_KEY_MISSING' ? 428 : 502,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      data: result.data,
      modelUsed: result.modelUsed,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
