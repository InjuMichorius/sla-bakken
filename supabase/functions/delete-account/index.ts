import { withSupabase } from 'npm:@supabase/server@1';
import { revokeRefreshToken } from '../_shared/apple.ts';

export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const userId = ctx.userClaims?.id;
    if (!userId) {
      return Response.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    let appleRevoked = false;
    const { data: tokenRow, error: tokenError } = await ctx.supabaseAdmin
      .from('apple_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (tokenError) {
      console.error('[delete-account] Apple-token ophalen mislukt', tokenError);
    } else if (tokenRow?.refresh_token) {
      appleRevoked = await revokeRefreshToken(tokenRow.refresh_token);
    }

    const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ deleted: true, appleRevoked });
  }),
};
