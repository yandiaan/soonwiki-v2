//#region src/lib/shared/auth-errors.ts
var MESSAGES = {
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
function isAuthErrorCode(value) {
  return typeof value === 'string' && value in MESSAGES;
}
function describeAuthError(code) {
  return isAuthErrorCode(code) ? MESSAGES[code] : MESSAGES.UNAUTHORIZED;
}
//#endregion
export { describeAuthError as t };

//# sourceMappingURL=auth-errors_BTQxLM_0.mjs.map
