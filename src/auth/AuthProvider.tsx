import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  deleteAccount as deleteAccountFromSupabase,
  getProfile,
  signInWithApple,
  signInWithEmail as signInWithEmailFromSupabase,
  signOut as signOutFromSupabase,
  signUpWithEmail as signUpWithEmailFromSupabase,
  type Profile,
} from '@/lib/auth';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  signIn: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ ok: boolean; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Inloggen is mislukt. Probeer het opnieuw.';
}

function emailErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';

  if (/invalid login credentials/i.test(message)) return 'E-mailadres of wachtwoord is onjuist.';
  if (/email not confirmed/i.test(message)) return 'Bevestig eerst je e-mailadres.';
  if (/already registered/i.test(message)) return 'Dit e-mailadres is al geregistreerd.';
  if (/password should be at least|password.*characters/i.test(message)) {
    return 'Wachtwoord moet minimaal 6 tekens hebben.';
  }
  if (/rate limit|too many/i.test(message)) return 'Te veel pogingen. Probeer het later opnieuw.';

  return errorMessage(error);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (userId: string) => {
      if (!isConfigured) return;

      try {
        setProfile(await getProfile(userId));
      } catch (profileError) {
        setError(errorMessage(profileError));
      }
    },
    [isConfigured],
  );

  useEffect(() => {
    if (!isConfigured) return;

    const supabase = getSupabase();
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setIsLoading(false);
        if (data.session?.user.id) {
          void loadProfile(data.session.user.id);
        }
      })
      .catch((sessionError: unknown) => {
        if (!active) return;
        setError(errorMessage(sessionError));
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setIsLoading(false);

      if (nextSession?.user.id) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, loadProfile]);

  const signIn = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      const result = await signInWithApple();
      if (result.canceled) return false;
      if (result.userId) await loadProfile(result.userId);
      return true;
    } catch (signInError) {
      setError(errorMessage(signInError));
      return false;
    }
  }, [loadProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setError(null);

      try {
        const userId = await signInWithEmailFromSupabase(email, password);
        if (userId) await loadProfile(userId);
        return true;
      } catch (signInError) {
        setError(emailErrorMessage(signInError));
        return false;
      }
    },
    [loadProfile],
  );

  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<{ ok: boolean; needsConfirmation: boolean }> => {
      setError(null);

      try {
        const result = await signUpWithEmailFromSupabase(email, password, name);
        if (result.userId && !result.needsConfirmation) await loadProfile(result.userId);
        return { ok: true, needsConfirmation: result.needsConfirmation };
      } catch (signUpError) {
        setError(emailErrorMessage(signUpError));
        return { ok: false, needsConfirmation: false };
      }
    },
    [loadProfile],
  );

  const signOut = useCallback(async () => {
    setError(null);

    try {
      await signOutFromSupabase();
    } catch (signOutError) {
      setError(errorMessage(signOutError));
    } finally {
      setSession(null);
      setProfile(null);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      await deleteAccountFromSupabase();
      setSession(null);
      setProfile(null);
      return true;
    } catch (deleteError) {
      setError(errorMessage(deleteError));
      return false;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user.id) {
      await loadProfile(session.user.id);
    }
  }, [loadProfile, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isConfigured,
      error,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      deleteAccount,
      refreshProfile,
      clearError: () => setError(null),
    }),
    [
      deleteAccount,
      error,
      isConfigured,
      isLoading,
      profile,
      refreshProfile,
      session,
      signIn,
      signInWithEmail,
      signOut,
      signUpWithEmail,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth moet binnen een AuthProvider gebruikt worden.');
  }
  return context;
}
