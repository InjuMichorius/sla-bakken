import { createContext, ReactNode, useContext } from 'react';
import type { GameContextValue } from './useGame';
import { useGame } from './useGame';

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const value = useGame();
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGameContext must be used inside <GameProvider>');
  return value;
}
