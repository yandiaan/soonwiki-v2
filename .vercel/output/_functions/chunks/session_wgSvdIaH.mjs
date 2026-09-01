import { t as createServerSupabase } from './server_zdj2Qb-F.mjs';
//#region src/lib/server/session.ts
async function getMemberSession(context) {
  const supabase = createServerSupabase(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
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
//#endregion
export { getMemberSession as t };

//# sourceMappingURL=session_wgSvdIaH.mjs.map
