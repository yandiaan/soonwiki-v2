import { createServerClient, parseCookieHeader } from '@supabase/ssr';

import type { Database } from '@/types/database';
import type { APIContext } from 'astro';

type ServerSupabaseContext = Pick<APIContext, 'request' | 'cookies'>;

export function createServerSupabase(context: ServerSupabaseContext) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || '';
  const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options);
        });
      },
    },
  });
}
