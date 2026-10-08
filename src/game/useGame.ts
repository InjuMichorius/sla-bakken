import { useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameAction, TeamScore } from './reducer';
import { allWords, gameReducer, isSetupValid, rankStandings, teamScoresOf, uid } from './reducer';
import type { GameState, Team } from './types';
import { initialGameState } from './types';
import { DEFAULT_TURN_SECONDS, DEFAULT_WORDS_PER_PLAYER, MAX_WORDS_PER_PLAYER, MIN_WORDS_PER_PLAYER } from './constants';

const STORAGE_KEY = '@sla-bakken/game-settings';

type PersistedGameSettings = { wordsPerPlayer: number; turnSeconds: number };

/** Ingrediëntwaarden die je in de wizard instelt, zodat een volgend spel ze onthoudt. */
let cachedSettings: PersistedGameSettings | null | undefined;
let settingsLoad: Promise<PersistedGameSettings | null> | null = null;

function mergeGameSettings(raw: string | null): PersistedGameSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedGameSettings>;
    const words = Math.round(parsed.wordsPerPlayer ?? 0);
    const seconds = Math.round(parsed.turnSeconds ?? 0);
    return {
      wordsPerPlayer: Math.max(MIN_WORDS_PER_PLAYER, Math.min(MAX_WORDS_PER_PLAYER, words)) || DEFAULT_WORDS_PER_PLAYER,
      turnSeconds: Math.max(15, Math.min(300, seconds)) || DEFAULT_TURN_SECONDS,
    };
  } catch {
    return null;
  }
}

function loadGameSettings(): Promise<PersistedGameSettings | null> {
  if (cachedSettings !== undefined) return Promise.resolve(cachedSettings);
  if (!settingsLoad) {
    settingsLoad = AsyncStorage.getItem(STORAGE_KEY)
      .then(mergeGameSettings)
      .then((value) => {
        cachedSettings = value;
        return value;
      })
      .catch(() => null);
  }
  return settingsLoad;
}

export type RosterEntry = {
  team: Team;
  player: Team['players'][number];
  teamIndex: number;
  playerIndex: number;
};

export type GameContextValue = {
  state: GameState;
  teams: Team[];
  roster: RosterEntry[];
  standings: TeamScore[];
  currentTeam: Team | undefined;
  currentPlayer: Team['players'][number] | undefined;
  currentTeamIndexInRoster: number;
  totalWords: number;
  wordsLeft: number;
  canProceed: boolean;
  setTurnSeconds: (seconds: number) => void;
  setWordsPerPlayer: (count: number) => void;
  ensureDefaultTeams: () => void;
  addTeam: (name: string) => void;
  removeTeam: (teamId: string) => void;
  renameTeam: (teamId: string, name: string) => void;
  setTeamColor: (teamId: string, color: string) => void;
  addPlayer: (teamId: string, name: string) => string;
  renamePlayer: (teamId: string, playerId: string, name: string) => void;
  removePlayer: (teamId: string, playerId: string) => void;
  startWordEntry: () => void;
  setPlayerWords: (teamId: string, playerId: string, words: string[]) => void;
  startGame: () => void;
  startRound: (round: number) => void;
  startTurn: () => void;
  correctGuess: () => void;
  passGuess: () => void;
  tick: (now: number) => void;
  endTurn: () => void;
  endRound: () => void;
  nextRound: () => void;
  /** Nieuw spel: teams blijven staan, de woorden worden opnieuw ingevuld. */
  newGame: () => void;
  reset: () => void;
};

export function useGame(): GameContextValue {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const [wordsPerPlayer, turnSeconds] = [state.wordsPerPlayer, state.turnSeconds];
  const typeRef = useRef({ phase: state.phase, wordsPerPlayer, turnSeconds });
  useEffect(() => {
    typeRef.current = { phase: state.phase, wordsPerPlayer, turnSeconds };
  }, [state.phase, wordsPerPlayer, turnSeconds]);

  useEffect(() => {
    let active = true;
    loadGameSettings().then((saved) => {
      if (!active || !saved || typeRef.current.phase !== 'setup') return;
      if (saved.turnSeconds !== typeRef.current.turnSeconds) dispatch({ type: 'SET_TURN_SECONDS', seconds: saved.turnSeconds });
      if (saved.wordsPerPlayer !== typeRef.current.wordsPerPlayer) dispatch({ type: 'SET_WORDS_PER_PLAYER', count: saved.wordsPerPlayer });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ wordsPerPlayer, turnSeconds })).catch(() => {});
  }, [wordsPerPlayer, turnSeconds]);

  const roster = useMemo<RosterEntry[]>(() => {
    const list: RosterEntry[] = [];
    state.teams.forEach((team, teamIndex) => {
      team.players.forEach((player, playerIndex) => {
        list.push({ team, player, teamIndex, playerIndex });
      });
    });
    return list;
  }, [state.teams]);

  const standings = useMemo(
    () => rankStandings(teamScoresOf(state.teams, state.scores)),
    [state.teams, state.scores]
  );

  const currentTeam = state.teams[state.currentTeamIndex];
  const currentPlayer = currentTeam?.players[state.currentPlayerIndex];
  const currentTeamIndexInRoster = state.teams.findIndex((t) => t.id === currentTeam?.id);
  const totalWords = allWords(state).length;

  const send = useCallback((action: GameAction) => dispatch(action), []);

  return {
    state,
    teams: state.teams,
    roster,
    standings,
    currentTeam,
    currentPlayer,
    currentTeamIndexInRoster,
    totalWords,
    wordsLeft: state.pot.length,
    canProceed: isSetupValid(state),
    setTurnSeconds: (seconds) => send({ type: 'SET_TURN_SECONDS', seconds }),
    setWordsPerPlayer: (count) => send({ type: 'SET_WORDS_PER_PLAYER', count }),
    ensureDefaultTeams: () => send({ type: 'ENSURE_DEFAULT_TEAMS' }),
    addTeam: (name) => send({ type: 'ADD_TEAM', name }),
    removeTeam: (teamId) => send({ type: 'REMOVE_TEAM', teamId }),
    renameTeam: (teamId, name) => send({ type: 'RENAME_TEAM', teamId, name }),
    setTeamColor: (teamId, color) => send({ type: 'SET_TEAM_COLOR', teamId, color }),
    addPlayer: (teamId, name) => {
      const playerId = uid();
      send({ type: 'ADD_PLAYER', teamId, name, playerId });
      return playerId;
    },
    renamePlayer: (teamId, playerId, name) => send({ type: 'RENAME_PLAYER', teamId, playerId, name }),
    removePlayer: (teamId, playerId) => send({ type: 'REMOVE_PLAYER', teamId, playerId }),
    startWordEntry: () => send({ type: 'START_WORD_ENTRY' }),
    setPlayerWords: (teamId, playerId, words) => send({ type: 'SET_PLAYER_WORDS', teamId, playerId, words }),
    startGame: () => send({ type: 'START_GAME' }),
    startRound: (round) => send({ type: 'START_ROUND', round }),
    startTurn: () => send({ type: 'START_TURN', now: Date.now() }),
    correctGuess: () => send({ type: 'CORRECT_GUESS', now: Date.now() }),
    passGuess: () => send({ type: 'PASS_GUESS', now: Date.now() }),
    tick: (now) => send({ type: 'TICK', now }),
    endTurn: () => send({ type: 'END_TURN' }),
    endRound: () => send({ type: 'END_ROUND' }),
    nextRound: () => send({ type: 'NEXT_ROUND' }),
    newGame: () => send({ type: 'NEW_GAME' }),
    reset: () => send({ type: 'RESET' }),
  };
}
