import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
//#region src/pages/auth/google.ts
var google_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var ATTEMPT_COOKIE = 'soonwiki_invite_attempt';
var POST = async (context) => {
  const form = await context.request.formData();
  const mode = form.get('mode') === 'join' ? 'join' : 'login';
  const invitationToken = form.get('invitationToken');
  const siteUrl = 'http://127.0.0.1:4321';
  if (mode === 'join') {
    if (typeof invitationToken !== 'string' || invitationToken.length === 0)
      return context.redirect('/join-required');
    const response = await fetch(
      `https://gixwqgnsarwtwjlotaul.supabase.co/functions/v1/invitations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_publishable_gPLV-YAyiPlxT8Bzn1oFOw_E5xAAn3e',
        },
        body: JSON.stringify({
          action: 'start',
          token: invitationToken,
        }),
      },
    );
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return context.redirect(
        `/join/${invitationToken}?error=${encodeURIComponent(payload?.error ?? 'UNAUTHORIZED')}`,
      );
    }
    const { attemptToken, expiresAt } = await response.json();
    context.cookies.set(ATTEMPT_COOKIE, attemptToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/auth',
      maxAge: Math.max(1, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1e3)),
    });
  }
  const { data, error } = await createServerSupabase(context).auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: new URL('/auth/callback', siteUrl).toString(),
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url)
    return context.redirect('/login?message=Sesi+tidak+sah.+Silakan+coba+lagi.');
  return context.redirect(data.url);
};
//#endregion
//#region \0virtual:astro:page:src/pages/auth/google@_@ts
var page = () => google_exports;
//#endregion
export { page };

//# sourceMappingURL=google_CaYsC5zy.mjs.map
