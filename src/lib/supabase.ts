import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { authStorage } from './authStorage';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      'Supabase is niet geconfigureerd. Zet EXPO_PUBLIC_SUPABASE_URL en EXPO_PUBLIC_SUPABASE_ANON_KEY in je .env-bestand.',
    );
  }

  client = createClient(url, key, {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });

  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        client?.auth.startAutoRefresh();
      } else {
        client?.auth.stopAutoRefresh();
      }
    });
  }

  return client;
}
