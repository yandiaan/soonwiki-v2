import { ct as defineMiddleware, t as sequence } from './chunks/sequence_AxU5uU3I.mjs';
//#region src/lib/server/request-context.ts
function getOrCreateRequestId(context) {
  const existing = context.request.headers.get('x-request-id');
  return existing && existing.length > 0 ? existing : crypto.randomUUID();
}
//#endregion
//#region src/middleware.ts
var CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');
var onRequest$1 = defineMiddleware(async (context, next) => {
  const requestId = getOrCreateRequestId(context);
  context.locals.requestId = requestId;
  const response = await next();
  response.headers.set('X-Request-Id', requestId);
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  return response;
});
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
//#endregion
export { onRequest };

//# sourceMappingURL=virtual_astro_middleware.mjs.map
