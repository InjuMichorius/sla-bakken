import { useCallback, useMemo, useReducer } from 'react';
import type { GameAction, TeamScore } from './reducer';
import { allWords, gameReducer, isSetupValid, rankStandings, teamScoresOf } from './reducer';
import type { GameState, Team } from './types';
import { initialGameState } from './types';

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
  addPlayer: (teamId: string, name: string) => void;
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
  reset: () => void;
};

export function useGame(): GameContextValue {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

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
    addPlayer: (teamId, name) => send({ type: 'ADD_PLAYER', teamId, name }),
    renamePlayer: (teamId, playerId, name) => send({ type: 'RENAME_PLAYER', teamId, playerId, name }),
    removePlayer: (teamId, playerId) => send({ type: 'REMOVE_PLAYER', teamId, playerId }),
    startWordEntry: () => send({ type: 'START_WORD_ENTRY' }),
    setPlayerWords: (teamId, playerId, words) => send({ type: 'SET_PLAYER_WORDS', teamId, playerId, words }),
    startGame: () => send({ type: 'START_GAME' }),
    startRound: (round) => send({ type: 'START_ROUND', round }),
    startTurn: () => send({ type: 'START_TURN' }),
    correctGuess: () => send({ type: 'CORRECT_GUESS' }),
    passGuess: () => send({ type: 'PASS_GUESS' }),
    tick: (now) => send({ type: 'TICK', now }),
    endTurn: () => send({ type: 'END_TURN' }),
    endRound: () => send({ type: 'END_ROUND' }),
    nextRound: () => send({ type: 'NEXT_ROUND' }),
    reset: () => send({ type: 'RESET' }),
  };
}
