import type { APIRoute } from 'astro';

const ALLOWED_BUCKETS = new Set(['memories', 'profile-photos', 'proud-moments']);

export const GET: APIRoute = async ({ request, url }) => {
  const bucket = url.searchParams.get('bucket');
  const path = url.searchParams.get('path');

  if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
    return new Response('Invalid media request', { status: 400 });
  }

  const base = (import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  if (!base) {
    return new Response('Supabase URL not configured', { status: 500 });
  }

  // Sanitize path (prevent directory traversal)
  const cleanPath = path.replace(/\.\./g, '');
  const upstreamUrl = `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;

  const clientRange = request.headers.get('range');
  const upstreamHeaders: HeadersInit = {};

  if (clientRange) {
    upstreamHeaders['Range'] = clientRange;
  }

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206 && upstreamRes.status !== 304) {
      return new Response('Media not found or inaccessible', {
        status: upstreamRes.status,
      });
    }

    const responseHeaders = new Headers();

    // Critical headers for iOS / Mobile Safari video playback & byte-range seeking
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Vary', 'Range');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Accept, Content-Type');
    responseHeaders.set(
      'Access-Control-Expose-Headers',
      'Content-Range, Content-Length, Accept-Ranges',
    );

    const contentType = upstreamRes.headers.get('content-type') || 'video/mp4';
    responseHeaders.set('Content-Type', contentType);

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    const etag = upstreamRes.headers.get('etag');
    if (etag) {
      responseHeaders.set('ETag', etag);
    }

    const lastModified = upstreamRes.headers.get('last-modified');
    if (lastModified) {
      responseHeaders.set('Last-Modified', lastModified);
    }

    responseHeaders.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    return new Response(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Failed to proxy media stream:', err);
    return new Response('Failed to stream media', { status: 502 });
  }
};
