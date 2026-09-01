import { createServerSupabase } from '@/lib/supabase/server';

import type { APIContext } from 'astro';

export interface MemberSession {
  user: { id: string };
  member: { role: 'member' | 'admin'; status: 'active' | 'disabled' } | null;
}

export async function getMemberSession(
  context: Pick<APIContext, 'request' | 'cookies'>,
): Promise<MemberSession | null> {
  const supabase = createServerSupabase(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: member } = await supabase
    .from('members')
    .select('role, status')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    user: { id: user.id },
    member: member ?? null,
  };
}
