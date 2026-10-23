import { Platform } from 'react-native';
import { FunctionsHttpError } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { getSupabase } from './supabase';

export type Profile = {
  id: string;
  name: string;
  points: number;
  first_login: string;
};

export type AppleSignInResult = {
  canceled: boolean;
  userId: string | null;
};

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
      return { canceled: true, userId: null };
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
  const fullName = formatFullName(credential.fullName);

  if (userId && fullName) {
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        given_name: credential.fullName?.givenName ?? null,
        family_name: credential.fullName?.familyName ?? null,
      },
    });

    if (metadataError) {
      console.warn('[auth] Naam opslaan in gebruikersmetadata mislukt', metadataError);
    }
  }

  if (credential.authorizationCode) {
    await storeAppleRefreshToken(credential.authorizationCode);
  }

  return { canceled: false, userId };
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

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<EmailSignUpResult> {
  const { data, error } = await getSupabase().auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: name.trim() },
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
    .select('id, name, points, first_login')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile | null) ?? null;
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
