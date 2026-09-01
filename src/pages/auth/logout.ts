import { createServerSupabase } from '@/lib/supabase/server';

import type { APIRoute } from 'astro';

export const POST: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);
  await supabase.auth.signOut();
  return context.redirect('/');
};

export const GET: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);
  await supabase.auth.signOut();
  return context.redirect('/');
};
