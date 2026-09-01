import type { APIContext } from 'astro';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function getOrCreateRequestId(context: Pick<APIContext, 'request'>): string {
  const existing = context.request.headers.get('x-request-id');
  return existing && existing.length > 0 ? existing : crypto.randomUUID();
}

export interface SafeRequestLog {
  requestId: string;
  method: string;
  route: string;
}

/**
 * Builds a log-safe summary of a request. Never include headers, cookies, query
 * strings, request bodies, or full URLs: those may carry OAuth codes, invitation
 * or attempt tokens, session cookies, or email addresses.
 */
export function toSafeRequestLog(
  context: Pick<APIContext, 'request' | 'url'>,
  requestId: string,
): SafeRequestLog {
  return {
    requestId,
    method: context.request.method,
    route: context.url.pathname,
  };
}

export function isMutationMethod(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}
