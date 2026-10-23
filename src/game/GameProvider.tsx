import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import type { GameContextValue } from './useGame';
import { useGame } from './useGame';

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const value = useGame();
  const { session, profile } = useAuth();
  const { assignAccountPlayer } = value;
  const userId = session?.user.id;
  const profileName = profile?.name;
  const emailName = session?.user.email?.split('@')[0];

  useEffect(() => {
    if (!userId) return;
    const name = profileName?.trim() || emailName?.trim() || 'Speler 1';
    assignAccountPlayer(userId, name);
  }, [assignAccountPlayer, emailName, profileName, userId]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGameContext must be used inside <GameProvider>');
  return value;
}
