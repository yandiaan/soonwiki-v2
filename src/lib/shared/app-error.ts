export type AppErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'UNAVAILABLE'
  | 'INVITATION_INVALID'
  | 'INVITATION_REVOKED'
  | 'ATTEMPT_EXPIRED'
  | 'ATTEMPT_CONSUMED'
  | 'MEMBER_EXISTS'
  | 'ADMIN_REQUIRED';

const MESSAGES: Record<AppErrorCode, string> = {
  NOT_FOUND: 'Halaman atau data yang kamu cari tidak ditemukan.',
  UNAUTHORIZED: 'Kamu perlu masuk untuk melakukan ini.',
  FORBIDDEN: 'Kamu tidak punya akses untuk aksi ini.',
  VALIDATION: 'Ada data yang belum valid. Periksa lagi isiannya.',
  UNAVAILABLE: 'Terjadi kendala sementara. Silakan coba lagi.',
  INVITATION_INVALID: 'Tautan undangan ini tidak valid.',
  INVITATION_REVOKED: 'Tautan ini sudah tidak dapat digunakan.',
  ATTEMPT_EXPIRED: 'Sesi bergabung sudah kedaluwarsa.',
  ATTEMPT_CONSUMED: 'Sesi bergabung ini sudah dipakai.',
  MEMBER_EXISTS: 'Akun ini sudah pernah bergabung.',
  ADMIN_REQUIRED: 'Aksi ini hanya untuk admin.',
};

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode) {
    super(MESSAGES[code]);
    this.code = code;
  }
}

function isAppErrorCode(value: unknown): value is AppErrorCode {
  return typeof value === 'string' && value in MESSAGES;
}

export function describeAppError(code: unknown): string {
  return isAppErrorCode(code) ? MESSAGES[code] : MESSAGES.UNAVAILABLE;
}
