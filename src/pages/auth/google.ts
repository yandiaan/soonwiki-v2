import { createServerSupabase } from '@/lib/supabase/server';

import type { APIRoute } from 'astro';

const ATTEMPT_COOKIE = 'soonwiki_invite_attempt';

export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const mode = form.get('mode') === 'join' ? 'join' : 'login';
  const invitationToken = form.get('invitationToken');
  const siteUrl = import.meta.env.PUBLIC_SITE_URL;

  if (mode === 'join') {
    if (typeof invitationToken !== 'string' || invitationToken.length === 0) {
      return context.redirect('/join-required');
    }

    const functionsUrl = `${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/invitations`;
    const response = await fetch(functionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ action: 'start', token: invitationToken }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      return context.redirect(
        `/join/${invitationToken}?error=${encodeURIComponent(payload?.error ?? 'UNAUTHORIZED')}`,
      );
    }

    const { attemptToken, expiresAt } = (await response.json()) as {
      attemptToken: string;
      expiresAt: string;
    };

    context.cookies.set(ATTEMPT_COOKIE, attemptToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/auth',
      maxAge: Math.max(1, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
    });
  }

  const supabase = createServerSupabase(context);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: new URL('/auth/callback', siteUrl).toString(),
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return context.redirect('/login?message=Sesi+tidak+sah.+Silakan+coba+lagi.');
  }

  return context.redirect(data.url);
};
