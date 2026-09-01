import { createClient } from 'npm:@supabase/supabase-js@2';

import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import type {
  CompleteResponse,
  CreateResponse,
  InvitationErrorCode,
  RevokeResponse,
  StartResponse,
} from './types.ts';

const KNOWN_ERROR_CODES: InvitationErrorCode[] = [
  'INVITATION_INVALID',
  'INVITATION_REVOKED',
  'ATTEMPT_EXPIRED',
  'ATTEMPT_CONSUMED',
  'MEMBER_EXISTS',
  'ADMIN_REQUIRED',
  'UNAUTHORIZED',
];

export class InvitationServiceError extends Error {
  readonly code: InvitationErrorCode;

  constructor(code: InvitationErrorCode) {
    super(code);
    this.code = code;
  }
}

function mapPostgresError(error: { message?: string } | null): InvitationErrorCode {
  const message = error?.message ?? '';
  const matched = KNOWN_ERROR_CODES.find((code) => message.includes(code));
  return matched ?? 'UNAUTHORIZED';
}

let serviceClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  if (serviceClient) {
    return serviceClient;
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new InvitationServiceError('UNAUTHORIZED');
  }

  serviceClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  return serviceClient;
}

export async function getAuthenticatedUserId(request: Request): Promise<string> {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    throw new InvitationServiceError('UNAUTHORIZED');
  }

  const { data, error } = await getServiceClient().auth.getUser(token);

  if (error || !data.user) {
    throw new InvitationServiceError('UNAUTHORIZED');
  }

  return data.user.id;
}

export async function startAttempt(token: string): Promise<StartResponse> {
  const { data, error } = await getServiceClient()
    .rpc('start_invitation_attempt', { raw_token: token })
    .single();

  if (error || !data) {
    throw new InvitationServiceError(mapPostgresError(error));
  }

  const row = data as { attempt_token: string; expires_at: string };
  return { attemptToken: row.attempt_token, expiresAt: row.expires_at };
}

export async function completeAttempt(
  attemptToken: string,
  actorUserId: string,
): Promise<CompleteResponse> {
  const client = getServiceClient();
  const { error } = await client.rpc('complete_invitation_attempt', {
    raw_attempt: attemptToken,
    actor_user_id: actorUserId,
  });

  if (error) {
    throw new InvitationServiceError(mapPostgresError(error));
  }

  const { data: member, error: memberError } = await client
    .from('members')
    .select('role')
    .eq('user_id', actorUserId)
    .single();

  if (memberError || !member) {
    throw new InvitationServiceError('UNAUTHORIZED');
  }

  return { member: { userId: actorUserId, role: member.role as 'member' | 'admin' } };
}

export async function createInvitation(
  label: string,
  actorUserId: string,
): Promise<CreateResponse> {
  const { data, error } = await getServiceClient()
    .rpc('create_shared_invitation', { label, actor_user_id: actorUserId })
    .single();

  if (error || !data) {
    throw new InvitationServiceError(mapPostgresError(error));
  }

  const row = data as { raw_token: string; invitation_id: string };
  return { rawToken: row.raw_token, invitationId: row.invitation_id };
}

export async function revokeInvitation(
  invitationId: string,
  actorUserId: string,
): Promise<RevokeResponse> {
  const { error } = await getServiceClient().rpc('revoke_shared_invitation', {
    invitation_id: invitationId,
    actor_user_id: actorUserId,
  });

  if (error) {
    throw new InvitationServiceError(mapPostgresError(error));
  }

  return { revoked: true };
}
