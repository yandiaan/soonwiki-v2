import { createServerClient, parseCookieHeader } from '@supabase/ssr';

import type { Database } from '@/types/database';
import type { APIContext } from 'astro';

type ServerSupabaseContext = Pick<APIContext, 'request' | 'cookies'>;

export function createServerSupabase(context: ServerSupabaseContext) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL || '';
  const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  const initialCookies = parseCookieHeader(context.request.headers.get('Cookie') ?? '');
  const cookieStore = new Map<string, string>();
  for (const c of initialCookies) {
    if (c.name) cookieStore.set(c.name, c.value);
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (
            options?.maxAge === 0 ||
            (options?.expires && options.expires.getTime() <= Date.now())
          ) {
            cookieStore.delete(name);
          } else {
            cookieStore.set(name, value);
          }
          context.cookies.set(name, value, {
            path: '/',
            sameSite: 'lax',
            ...options,
          });
        });
      },
    },
  });
}
