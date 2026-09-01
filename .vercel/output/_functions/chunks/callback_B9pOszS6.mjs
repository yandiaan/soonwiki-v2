import { r as __exportAll } from './rolldown-runtime_BMI-E3GI.mjs';
import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
import { t as describeAuthError } from './auth-errors_BTQxLM_0.mjs';
//#region src/pages/auth/callback.ts
var callback_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var ATTEMPT_COOKIE = 'soonwiki_invite_attempt';
var GET = async (context) => {
  const code = context.url.searchParams.get('code');
  if (context.url.searchParams.get('error'))
    return context.redirect(
      `/login?message=${encodeURIComponent(describeAuthError('OAUTH_CANCELLED'))}`,
    );
  if (!code)
    return context.redirect(
      `/login?message=${encodeURIComponent(describeAuthError('UNAUTHORIZED'))}`,
    );
  const supabase = createServerSupabase(context);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session)
    return context.redirect(
      `/login?message=${encodeURIComponent(describeAuthError('UNAUTHORIZED'))}`,
    );
  const attemptToken = context.cookies.get(ATTEMPT_COOKIE)?.value;
  if (attemptToken) {
    context.cookies.delete(ATTEMPT_COOKIE, { path: '/auth' });
    const response = await fetch(
      `https://gixwqgnsarwtwjlotaul.supabase.co/functions/v1/invitations`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: 'sb_publishable_gPLV-YAyiPlxT8Bzn1oFOw_E5xAAn3e',
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          action: 'complete',
          attemptToken,
        }),
      },
    );
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      await supabase.auth.signOut();
      return context.redirect(
        `/login?message=${encodeURIComponent(describeAuthError(payload?.error))}`,
      );
    }
    return context.redirect('/me/edit?welcome=1');
  }
  const { data: member } = await supabase
    .from('members')
    .select('status')
    .eq('user_id', data.session.user.id)
    .maybeSingle();
  if (member?.status === 'active') return context.redirect('/me');
  await supabase.auth.signOut();
  return context.redirect('/join-required');
};
//#endregion
//#region \0virtual:astro:page:src/pages/auth/callback@_@ts
var page = () => callback_exports;
//#endregion
export { page };

//# sourceMappingURL=callback_B9pOszS6.mjs.map
