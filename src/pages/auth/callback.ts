import { describeAuthError } from '@/lib/shared/auth-errors';
import { createServerSupabase } from '@/lib/supabase/server';

import type { APIRoute } from 'astro';

const ATTEMPT_COOKIE = 'soonwiki_invite_attempt';

export const GET: APIRoute = async (context) => {
  const code = context.url.searchParams.get('code');
  const oauthError = context.url.searchParams.get('error');

  if (oauthError) {
    return context.redirect(
      `/login?message=${encodeURIComponent(describeAuthError('OAUTH_CANCELLED'))}`,
    );
  }

  if (!code) {
    return context.redirect(
      `/login?message=${encodeURIComponent(describeAuthError('UNAUTHORIZED'))}`,
    );
  }

  const supabase = createServerSupabase(context);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return context.redirect(
      `/login?message=${encodeURIComponent(describeAuthError('UNAUTHORIZED'))}`,
    );
  }

  const attemptToken = context.cookies.get(ATTEMPT_COOKIE)?.value;

  if (attemptToken) {
    context.cookies.delete(ATTEMPT_COOKIE, { path: '/auth' });

    const functionsUrl = `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/invitations`;
    const response = await fetch(functionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ action: 'complete', attemptToken }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
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

  if (member?.status === 'active') {
    return context.redirect('/me');
  }

  await supabase.auth.signOut();
  return context.redirect('/join-required');
};
