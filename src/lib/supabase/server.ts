import { createServerClient, parseCookieHeader } from '@supabase/ssr';

import type { Database } from '@/types/database';
import type { APIContext } from 'astro';

type ServerSupabaseContext = Pick<APIContext, 'request' | 'cookies'>;

export function createServerSupabase(context: ServerSupabaseContext) {
  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
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
    },
  );
}
