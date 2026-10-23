import { withSupabase } from 'npm:@supabase/server@1';
import { exchangeAuthorizationCode, isAppleConfigured } from '../_shared/apple.ts';

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    const userId = ctx.userClaims?.id;
    if (!userId) {
      return Response.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (!isAppleConfigured()) {
      return Response.json({ stored: false, reason: 'Apple-revocatie is niet geconfigureerd' });
    }

    const body = (await req.json().catch(() => null)) as { authorizationCode?: string } | null;
    if (!body?.authorizationCode) {
      return Response.json({ error: 'authorizationCode ontbreekt' }, { status: 400 });
    }

    try {
      const tokens = await exchangeAuthorizationCode(body.authorizationCode);
      if (!tokens.refresh_token) {
        return Response.json({ stored: false, reason: 'Apple gaf geen refresh token terug' });
      }

      const { error } = await ctx.supabaseAdmin.from('apple_tokens').upsert(
        {
          user_id: userId,
          refresh_token: tokens.refresh_token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

      if (error) throw error;
      return Response.json({ stored: true });
    } catch (error) {
      console.error('[sync-apple-token] opslaan mislukt', error);
      return Response.json({ error: 'Apple-token opslaan mislukt' }, { status: 500 });
    }
  }),
};
