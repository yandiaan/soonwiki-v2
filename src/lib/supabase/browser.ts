import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
