import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  addFriend as addFriendFromSupabase,
  deleteAccount as deleteAccountFromSupabase,
  getProfile,
  listFriends as listFriendsFromSupabase,
  recordGameResults as recordGameResultsFromSupabase,
  removeFriend as removeFriendFromSupabase,
  signInWithApple,
  signInWithEmail as signInWithEmailFromSupabase,
  signOut as signOutFromSupabase,
  signUpWithEmail as signUpWithEmailFromSupabase,
  updateProfileName as updateProfileNameFromSupabase,
  MAX_PROFILE_NAME_LENGTH,
  type Friend,
  type GameResultEntry,
  type PlayerGameStats,
  type Profile,
} from '@/lib/auth';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type AppleSignInOutcome = {
  ok: boolean;
  canceled: boolean;
  suggestedName: string | null;
  currentName: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  friends: Friend[];
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
  signIn: () => Promise<AppleSignInOutcome>;
  updateName: (name: string) => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ ok: boolean; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  recordGameResults: (gameId: string, results: GameResultEntry[]) => Promise<PlayerGameStats[]>;
  addFriend: (userId: string) => Promise<Friend | null>;
  removeFriend: (userId: string) => Promise<boolean>;
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
  if (/name_taken|naam is al in gebruik/i.test(message)) return 'Deze naam is al in gebruik.';
  if (/password should be at least|password.*characters/i.test(message)) {
    return 'Wachtwoord moet minimaal 6 tekens hebben.';
  }
  if (/rate limit|too many/i.test(message)) return 'Te veel pogingen. Probeer het later opnieuw.';

  return errorMessage(error);
}

function nameErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';

  if (/name_taken/i.test(message)) return 'Deze naam is al in gebruik.';
  if (/name_too_long/i.test(message)) return `Kies een naam van maximaal ${MAX_PROFILE_NAME_LENGTH} tekens.`;
  if (/name_required/i.test(message)) return 'Vul een naam in.';
  if (/not_authenticated/i.test(message)) return 'Log eerst in om je naam te wijzigen.';

  return emailErrorMessage(error);
}

function friendErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/invalid_friend/i.test(message)) return 'Je kunt jezelf niet als vriend toevoegen.';
  if (/friend_not_found/i.test(message)) return 'Dit account bestaat niet meer.';
  if (/not_authenticated/i.test(message)) return 'Log eerst in om vrienden toe te voegen.';
  return errorMessage(error);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (userId: string): Promise<Profile | null> => {
      if (!isConfigured) return null;

      let loadedProfile: Profile | null = null;

      try {
        loadedProfile = await getProfile(userId);
        setProfile(loadedProfile);
      } catch (profileError) {
        setError(errorMessage(profileError));
      }

      try {
        setFriends(await listFriendsFromSupabase());
      } catch (friendsError) {
        setError(friendErrorMessage(friendsError));
      }

      return loadedProfile;
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
        setFriends([]);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, loadProfile]);

  const signIn = useCallback(async (): Promise<AppleSignInOutcome> => {
    setError(null);

    try {
      const result = await signInWithApple();
      if (result.canceled) {
        return { ok: false, canceled: true, suggestedName: null, currentName: null };
      }

      const loadedProfile = result.userId ? await loadProfile(result.userId) : null;
      const needsName = !result.nameConfirmed;

      return {
        ok: true,
        canceled: false,
        suggestedName: needsName ? (result.suggestedName ?? loadedProfile?.name ?? '') : null,
        currentName: needsName ? (loadedProfile?.name ?? null) : null,
      };
    } catch (signInError) {
      setError(errorMessage(signInError));
      return { ok: false, canceled: false, suggestedName: null, currentName: null };
    }
  }, [loadProfile]);

  const updateName = useCallback(
    async (name: string): Promise<boolean> => {
      setError(null);

      try {
        await updateProfileNameFromSupabase(name);
        if (session?.user.id) await loadProfile(session.user.id);
        return true;
      } catch (nameError) {
        setError(nameErrorMessage(nameError));
        return false;
      }
    },
    [loadProfile, session],
  );

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
      setFriends([]);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      await deleteAccountFromSupabase();
      setSession(null);
      setProfile(null);
      setFriends([]);
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

  const recordGameResults = useCallback(
    async (gameId: string, results: GameResultEntry[]): Promise<PlayerGameStats[]> => {
      setError(null);

      try {
        const stats = await recordGameResultsFromSupabase(gameId, results);
        const own = stats.find((row) => row.user_id === session?.user.id);
        if (own) {
          setProfile((current) =>
            current ? { ...current, points: own.points, games_played: own.games_played } : current,
          );
        }

        try {
          setFriends(await listFriendsFromSupabase());
        } catch (friendsError) {
          setError(friendErrorMessage(friendsError));
        }

        return stats;
      } catch (recordError) {
        setError(errorMessage(recordError));
        return [];
      }
    },
    [session?.user.id],
  );

  const addFriend = useCallback(async (userId: string): Promise<Friend | null> => {
    setError(null);

    try {
      const friend = await addFriendFromSupabase(userId);
      setFriends((current) => {
        const existing = current.find((entry) => entry.friend_id === friend.friend_id);
        if (existing) return current.map((entry) => (entry.friend_id === friend.friend_id ? friend : entry));
        return [friend, ...current];
      });
      return friend;
    } catch (friendError) {
      setError(friendErrorMessage(friendError));
      return null;
    }
  }, []);

  const removeFriend = useCallback(async (userId: string): Promise<boolean> => {
    setError(null);

    try {
      const removed = await removeFriendFromSupabase(userId);
      if (removed) {
        setFriends((current) => current.filter((entry) => entry.friend_id !== userId));
      }
      return removed;
    } catch (friendError) {
      setError(friendErrorMessage(friendError));
      return false;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      friends,
      isLoading,
      isConfigured,
      error,
      signIn,
      updateName,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      deleteAccount,
      refreshProfile,
      recordGameResults,
      addFriend,
      removeFriend,
      clearError: () => setError(null),
    }),
    [
      addFriend,
      deleteAccount,
      error,
      friends,
      isConfigured,
      isLoading,
      profile,
      recordGameResults,
      refreshProfile,
      removeFriend,
      session,
      signIn,
      updateName,
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
