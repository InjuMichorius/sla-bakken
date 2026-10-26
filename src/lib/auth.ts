import { Platform } from 'react-native';
import { FunctionsHttpError } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { getSupabase } from './supabase';

export type Profile = {
  id: string;
  name: string;
  points: number;
  games_played: number;
  first_login: string;
};

export type GameStats = {
  points: number;
  games_played: number;
};

export type GameResultEntry = {
  userId: string;
  points: number;
};

export type PlayerGameStats = GameStats & {
  user_id: string;
};

export type PlayerIdentity = {
  id: string;
  name: string;
};

export type Friend = {
  friend_id: string;
  name: string;
  points: number;
  added_at: string;
};

export type AppleSignInResult = {
  canceled: boolean;
  userId: string | null;
  suggestedName: string | null;
  nameConfirmed: boolean;
};

export const MAX_PROFILE_NAME_LENGTH = 10;

function formatFullName(fullName: AppleAuthentication.AppleAuthenticationFullName | null): string | null {
  if (!fullName) return null;

  const parts = [fullName.givenName, fullName.middleName, fullName.familyName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' ') : null;
}

export function isAppleSignInCancellation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ERR_REQUEST_CANCELED'
  );
}

export async function signInWithApple(): Promise<AppleSignInResult> {
  if (Platform.OS !== 'ios') {
    throw new Error('Inloggen met Apple is alleen beschikbaar op iOS.');
  }

  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  let credential: AppleAuthentication.AppleAuthenticationCredential;

  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
  } catch (error) {
    if (isAppleSignInCancellation(error)) {
      return { canceled: true, userId: null, suggestedName: null, nameConfirmed: false };
    }
    throw error;
  }

  if (!credential.identityToken) {
    throw new Error('Apple retourneerde geen identity token.');
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) throw error;

  const userId = data.user?.id ?? null;
  const suggestedName = formatFullName(credential.fullName);
  const nameConfirmed = data.user?.user_metadata?.name_confirmed === true;

  if (credential.authorizationCode) {
    await storeAppleRefreshToken(credential.authorizationCode);
  }

  return { canceled: false, userId, suggestedName, nameConfirmed };
}

async function storeAppleRefreshToken(authorizationCode: string): Promise<void> {
  const { error } = await getSupabase().functions.invoke('sync-apple-token', {
    body: { authorizationCode },
  });

  if (error) {
    console.warn('[auth] Apple-token opslaan mislukt', error.message);
  }
}

export type EmailSignUpResult = {
  userId: string | null;
  needsConfirmation: boolean;
};

export async function signInWithEmail(email: string, password: string): Promise<string | null> {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw error;
  return data.user?.id ?? null;
}

export async function isNameAvailable(name: string): Promise<boolean> {
  const { data, error } = await getSupabase().rpc('is_name_available', { p_name: name.trim() });
  if (error) throw error;
  return data === true;
}

export async function updateProfileName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('name_required');
  if (trimmed.length > MAX_PROFILE_NAME_LENGTH) throw new Error('name_too_long');

  const supabase = getSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('not_authenticated');

  const currentProfile = await getProfile(user.id);
  if (currentProfile?.name.trim().toLowerCase() === trimmed.toLowerCase()) return;

  if (!(await isNameAvailable(trimmed))) throw new Error('name_taken');

  const { error } = await supabase.from('users').update({ name: trimmed }).eq('id', user.id);
  if (error) {
    if (/duplicate|unique/i.test(error.message)) throw new Error('name_taken');
    throw error;
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { full_name: trimmed, name_confirmed: true },
  });
  if (metadataError) {
    console.warn('[auth] Naam opslaan in gebruikersmetadata mislukt', metadataError);
  }
}

export async function getPlayerIdentity(userId: string): Promise<PlayerIdentity | null> {
  const { data, error } = await getSupabase().rpc('get_player_identity', { p_user_id: userId });
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as PlayerIdentity | null | undefined;
  return row ?? null;
}

export async function addFriend(userId: string): Promise<Friend> {
  const { data, error } = await getSupabase().rpc('add_friend', { p_friend_id: userId });
  if (error) throw error;

  const row = (Array.isArray(data) ? data[0] : data) as Friend | null | undefined;
  if (!row) throw new Error('friend_not_found');
  return row;
}

export async function listFriends(): Promise<Friend[]> {
  const { data, error } = await getSupabase().rpc('list_friends');
  if (error) throw error;
  return (data ?? []) as Friend[];
}

export async function removeFriend(userId: string): Promise<boolean> {
  const { data, error } = await getSupabase().rpc('remove_friend', { p_friend_id: userId });
  if (error) throw error;
  return data === true;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<EmailSignUpResult> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('name_required');
  if (trimmedName.length > MAX_PROFILE_NAME_LENGTH) throw new Error('name_too_long');
  if (!(await isNameAvailable(trimmedName))) {
    throw new Error('name_taken');
  }

  const { data, error } = await getSupabase().auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: trimmedName, name_confirmed: true },
    },
  });

  if (error) throw error;
  return {
    userId: data.user?.id ?? null,
    needsConfirmation: !data.session,
  };
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('id, name, points, games_played, first_login')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function recordGameResults(
  gameId: string,
  results: GameResultEntry[],
): Promise<PlayerGameStats[]> {
  const { data, error } = await getSupabase().rpc('record_game_results', {
    p_game_id: gameId,
    p_results: results.map((result) => ({
      user_id: result.userId,
      points: result.points,
    })),
  });

  if (error) throw error;
  return (data ?? []) as PlayerGameStats[];
}

async function functionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    const body = (await error.context.json().catch(() => null)) as {
      error?: string;
      message?: string;
    } | null;

    if (body?.error) return body.error;
    if (body?.message) return body.message;
  }

  return error instanceof Error ? error.message : 'Account verwijderen is mislukt.';
}

export async function deleteAccount(): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke<{ deleted?: boolean; error?: string }>(
    'delete-account',
    { body: {} },
  );

  if (error) {
    throw new Error(await functionErrorMessage(error));
  }

  if (!data?.deleted) {
    throw new Error(data?.error ?? 'Account verwijderen is mislukt.');
  }

  await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}
