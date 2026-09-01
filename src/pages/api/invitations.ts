import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const functionsUrl = `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/invitations`;
  const body = await request.text();
  const authHeader = request.headers.get('Authorization') ?? '';

  try {
    const res = await fetch(functionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        ...(authHeader && { Authorization: authHeader }),
      },
      body,
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
