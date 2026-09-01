import { defineMiddleware } from 'astro:middleware';

import { getOrCreateRequestId } from '@/lib/server/request-context';

// Astro's client-hydration bootstrap for `client:*` islands (Svelte components)
// emits small inline <script> tags with serialized props; there is no nonce
// wiring available without extra tooling, so `'unsafe-inline'` on script-src is
// a deliberate, documented trade-off rather than an oversight. Verified against
// the production build: without it, every Svelte island silently fails to
// hydrate (MobileNavigation, StoryRail, ProfileEditor, etc. all become inert).
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://accounts.google.com https://nominatim.openstreetmap.org",
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
  const requestId = getOrCreateRequestId(context);
  context.locals.requestId = requestId;

  const response = await next();

  response.headers.set('X-Request-Id', requestId);
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  );

  return response;
});
