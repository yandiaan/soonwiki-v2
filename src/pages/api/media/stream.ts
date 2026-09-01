import type { APIRoute } from 'astro';

const ALLOWED_BUCKETS = new Set(['memories', 'profile-photos', 'proud-moments']);

export const GET: APIRoute = async ({ url }) => {
  const bucket = url.searchParams.get('bucket');
  const path = url.searchParams.get('path');

  if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
    return new Response('Invalid media request', { status: 400 });
  }

  const base = (import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const cleanPath = path.replace(/\.\./g, '');
  const upstreamUrl = `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;

  return Response.redirect(upstreamUrl, 302);
};
