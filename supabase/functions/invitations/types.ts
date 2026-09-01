export type InvitationRequest =
  | { action: 'start'; token: string }
  | { action: 'complete'; attemptToken: string }
  | { action: 'create'; label: string }
  | { action: 'revoke'; invitationId: string };

export type InvitationErrorCode =
  | 'INVITATION_INVALID'
  | 'INVITATION_REVOKED'
  | 'ATTEMPT_EXPIRED'
  | 'ATTEMPT_CONSUMED'
  | 'MEMBER_EXISTS'
  | 'ADMIN_REQUIRED'
  | 'UNAUTHORIZED';

export interface InvitationErrorResponse {
  error: InvitationErrorCode;
}

export interface StartResponse {
  attemptToken: string;
  expiresAt: string;
}

export interface CompleteResponse {
  member: { userId: string; role: 'member' | 'admin' };
}

export interface CreateResponse {
  invitationId: string;
  rawToken: string;
}

export interface RevokeResponse {
  revoked: true;
}
