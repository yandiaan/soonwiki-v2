export type AuthErrorCode =
  | 'INVITATION_INVALID'
  | 'INVITATION_REVOKED'
  | 'ATTEMPT_EXPIRED'
  | 'ATTEMPT_CONSUMED'
  | 'MEMBER_EXISTS'
  | 'ADMIN_REQUIRED'
  | 'UNAUTHORIZED'
  | 'OAUTH_CANCELLED';

const MESSAGES: Record<AuthErrorCode, string> = {
  INVITATION_INVALID: 'Tautan undangan ini tidak valid.',
  INVITATION_REVOKED:
    'Tautan ini sudah tidak dapat digunakan. Minta tautan terbaru dari pengelola SOON.',
  ATTEMPT_EXPIRED: 'Sesi bergabung sudah kedaluwarsa. Silakan buka tautan undangan lagi.',
  ATTEMPT_CONSUMED: 'Sesi bergabung ini sudah dipakai. Silakan buka tautan undangan lagi.',
  MEMBER_EXISTS: 'Akun Google ini sudah pernah bergabung.',
  ADMIN_REQUIRED: 'Aksi ini hanya untuk admin.',
  UNAUTHORIZED: 'Sesi tidak sah. Silakan coba lagi.',
  OAUTH_CANCELLED: 'Masuk dengan Google dibatalkan.',
};

function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return typeof value === 'string' && value in MESSAGES;
}

export function describeAuthError(code: unknown): string {
  return isAuthErrorCode(code) ? MESSAGES[code] : MESSAGES.UNAUTHORIZED;
}
