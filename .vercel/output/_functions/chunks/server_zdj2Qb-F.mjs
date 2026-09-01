import { createServerClient, parseCookieHeader } from '@supabase/ssr';
//#region src/lib/supabase/server.ts
function createServerSupabase(context) {
  return createServerClient(
    'https://gixwqgnsarwtwjlotaul.supabase.co',
    'sb_publishable_gPLV-YAyiPlxT8Bzn1oFOw_E5xAAn3e',
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
//#endregion
export { createServerSupabase as t };

//# sourceMappingURL=server_zdj2Qb-F.mjs.map
