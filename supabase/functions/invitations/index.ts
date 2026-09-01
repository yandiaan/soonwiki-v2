import {
  completeAttempt,
  createInvitation,
  getAuthenticatedUserId,
  InvitationServiceError,
  revokeInvitation,
  startAttempt,
} from './invitation-service.ts';

import type { InvitationRequest } from './types.ts';

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://127.0.0.1:4321';

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (
    origin === 'https://soonwiki.com' ||
    origin === 'https://www.soonwiki.com' ||
    origin.endsWith('.vercel.app') ||
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1')
  ) {
    return true;
  }
  return false;
}

function buildCorsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : SITE_URL;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function jsonResponse(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request) => {
  const cors = buildCorsHeaders(request.headers.get('origin'));

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'UNAUTHORIZED' }, 405, cors);
  }

  let body: InvitationRequest;
  try {
    body = (await request.json()) as InvitationRequest;
  } catch {
    return jsonResponse({ error: 'UNAUTHORIZED' }, 400, cors);
  }

  try {
    switch (body.action) {
      case 'start': {
        const result = await startAttempt(body.token);
        return jsonResponse(result, 200, cors);
      }
      case 'complete': {
        const actorUserId = await getAuthenticatedUserId(request);
        const result = await completeAttempt(body.attemptToken, actorUserId);
        return jsonResponse(result, 200, cors);
      }
      case 'create': {
        const actorUserId = await getAuthenticatedUserId(request);
        const result = await createInvitation(body.label, actorUserId);
        return jsonResponse(result, 200, cors);
      }
      case 'revoke': {
        const actorUserId = await getAuthenticatedUserId(request);
        const result = await revokeInvitation(body.invitationId, actorUserId);
        return jsonResponse(result, 200, cors);
      }
      default:
        return jsonResponse({ error: 'UNAUTHORIZED' }, 400, cors);
    }
  } catch (error) {
    if (error instanceof InvitationServiceError) {
      return jsonResponse({ error: error.code }, 400, cors);
    }
    return jsonResponse({ error: 'UNAUTHORIZED' }, 500, cors);
  }
});
