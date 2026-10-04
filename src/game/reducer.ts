import { nextFreeTeamColor, teamColor, isTeamColor } from './colors';
import { MAX_WORDS_PER_PLAYER, MIN_PLAYERS_PER_TEAM, MIN_TEAMS, MIN_WORDS_PER_PLAYER, ROUNDS } from './constants';
import { isNameTaken, nextFreePlayerName, normalizePlayerName, normalizeTeamName } from './names';
import type { GameState, Point, Team } from './types';
import { initialGameState } from './types';

export type GameAction =
  | { type: 'SET_TURN_SECONDS'; seconds: number }
  | { type: 'SET_WORDS_PER_PLAYER'; count: number }
  | { type: 'ENSURE_DEFAULT_TEAMS' }
  | { type: 'ADD_TEAM'; name: string }
  | { type: 'REMOVE_TEAM'; teamId: string }
  | { type: 'RENAME_TEAM'; teamId: string; name: string }
  | { type: 'SET_TEAM_COLOR'; teamId: string; color: string }
  | { type: 'ADD_PLAYER'; teamId: string; name: string }
  | { type: 'RENAME_PLAYER'; teamId: string; playerId: string; name: string }
  | { type: 'REMOVE_PLAYER'; teamId: string; playerId: string }
  | { type: 'START_WORD_ENTRY' }
  | { type: 'SET_PLAYER_WORDS'; teamId: string; playerId: string; words: string[] }
  | { type: 'START_GAME' }
  | { type: 'START_ROUND'; round: number }
  | { type: 'START_TURN' }
  | { type: 'CORRECT_GUESS' }
  | { type: 'PASS_GUESS' }
  | { type: 'TICK'; now: number }
  | { type: 'END_TURN' }
  | { type: 'END_ROUND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET' };

let idCounter = 0;
function uid(): string {
  idCounter += 1;
  return `id-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function shuffle<T>(input: T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** The last element of the pot is the word that is currently "open". */
function popCurrent(pot: string[]): { rest: string[]; current: string | null } {
  if (pot.length === 0) return { rest: [], current: null };
  return { rest: pot.slice(0, -1), current: pot[pot.length - 1] };
}

/** Rebuilds the pot (optionally shuffling a word back into it) and opens a new word. */
function redraw(rest: string[], returned: string | null): { pot: string[]; current: string | null } {
  const pool = returned != null ? shuffle([...rest, returned]) : rest;
  if (pool.length === 0) return { pot: [], current: null };
  return { pot: pool, current: pool[pool.length - 1] };
}

export function allWords(state: GameState): string[] {
  const seen = new Set<string>();
  return state.wordEntries
    .map((e) => e.word)
    .filter((w) => {
      const key = w.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function freshScores(teams: Team[]): Record<string, number> {
  return Object.fromEntries(teams.map((t) => [t.id, 0]));
}

/** The team that opens the next round. */
export function firstTeamWithPlayers(state: GameState): number {
  const index = state.teams.findIndex((t) => t.players.length > 0);
  return index < 0 ? 0 : index;
}

/**
 * Teams strictly alternate every turn; inside a team the players take turns.
 * With 2 teams and 2 players per team: A1, B1, A2, B2, A1, ...
 */
export function nextPoint(state: GameState): Point {
  const teamCount = Math.max(1, state.teams.length);
  const nextTurn = state.turnsThisRound + 1;
  const teamIndex = (state.currentTeamIndex + 1) % teamCount;
  const playerCount = Math.max(1, state.teams[teamIndex]?.players.length ?? 1);
  return { teamIndex, playerIndex: Math.floor(nextTurn / teamCount) % playerCount };
}

export function isSetupValid(state: GameState): boolean {
  if (state.teams.length < MIN_TEAMS) return false;
  return state.teams.every((t) => t.players.length >= MIN_PLAYERS_PER_TEAM);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_TURN_SECONDS': {
      const seconds = Math.max(15, Math.min(300, Math.round(action.seconds)));
      return { ...state, turnSeconds: seconds, timerRemaining: seconds };
    }

    case 'SET_WORDS_PER_PLAYER': {
      const count = Math.max(MIN_WORDS_PER_PLAYER, Math.min(MAX_WORDS_PER_PLAYER, Math.round(action.count)));
      return { ...state, wordsPerPlayer: count };
    }

    case 'ENSURE_DEFAULT_TEAMS': {
      if (state.teams.length > 0) return state;
      const teams: Team[] = [1, 2].map((teamNumber) => ({
        id: uid(),
        name: `Team ${teamNumber}`,
        color: teamColor(teamNumber - 1),
        players: Array.from({ length: MIN_PLAYERS_PER_TEAM }, (_, i) => ({
          id: uid(),
          name: `Speler ${(teamNumber - 1) * MIN_PLAYERS_PER_TEAM + i + 1}`,
        })),
      }));
      return { ...state, teams, scores: freshScores(teams) };
    }

    case 'ADD_TEAM': {
      const name = normalizeTeamName(action.name);
      if (!name) return state;
      if (isNameTaken(name, state.teams.map((t) => t.name))) return state;
      const team: Team = { id: uid(), name, color: nextFreeTeamColor(state.teams.map((t) => t.color)), players: [] };
      return { ...state, teams: [...state.teams, team], scores: { ...state.scores, [team.id]: 0 } };
    }

    case 'REMOVE_TEAM': {
      const teams = state.teams.filter((t) => t.id !== action.teamId);
      const scores = { ...state.scores };
      delete scores[action.teamId];
      return {
        ...state,
        teams,
        scores,
        currentTeamIndex: Math.min(state.currentTeamIndex, Math.max(0, teams.length - 1)),
        currentPlayerIndex: 0,
      };
    }

    case 'RENAME_TEAM': {
      const name = normalizeTeamName(action.name);
      if (!name) return state;
      if (isNameTaken(name, state.teams.filter((t) => t.id !== action.teamId).map((t) => t.name))) return state;
      return { ...state, teams: state.teams.map((t) => (t.id === action.teamId ? { ...t, name } : t)) };
    }

    case 'SET_TEAM_COLOR': {
      if (!isTeamColor(action.color)) return state;
      // Colours are exclusive: a team can only take one no other team holds.
      const inUse = state.teams.some((t) => t.id !== action.teamId && t.color.toLowerCase() === action.color.toLowerCase());
      if (inUse) return state;
      return { ...state, teams: state.teams.map((t) => (t.id === action.teamId ? { ...t, color: action.color } : t)) };
    }

    case 'ADD_PLAYER': {
      return {
        ...state,
        teams: state.teams.map((t) => {
          if (t.id !== action.teamId) return t;
          const taken = t.players.map((p) => p.name);
          const requested = normalizePlayerName(action.name);
          const name = !requested || isNameTaken(requested, taken) ? nextFreePlayerName(taken) : requested;
          return { ...t, players: [...t.players, { id: uid(), name }] };
        }),
      };
    }

    case 'RENAME_PLAYER': {
      const name = normalizePlayerName(action.name);
      if (!name) return state;
      return {
        ...state,
        teams: state.teams.map((t) => {
          if (t.id !== action.teamId) return t;
          if (isNameTaken(name, t.players.filter((p) => p.id !== action.playerId).map((p) => p.name))) return t;
          return { ...t, players: t.players.map((p) => (p.id === action.playerId ? { ...p, name } : p)) };
        }),
      };
    }

    case 'REMOVE_PLAYER': {
      return {
        ...state,
        teams: state.teams.map((t) => (t.id === action.teamId ? { ...t, players: t.players.filter((p) => p.id !== action.playerId) } : t)),
      };
    }

    case 'START_WORD_ENTRY': {
      if (!isSetupValid(state)) return state;
      return {
        ...state,
        phase: 'wordEntry',
        currentRound: 0,
        currentTeamIndex: firstTeamWithPlayers(state),
        currentPlayerIndex: 0,
        turnsThisRound: 0,
        wordEntries: [],
        pot: [],
        currentWord: null,
        turnPoints: 0,
        turnPasses: 0,
        totalWords: 0,
        scores: freshScores(state.teams),
        roundResults: [],
        winners: [],
        timerRemaining: state.turnSeconds,
      };
    }

    case 'SET_PLAYER_WORDS': {
      const team = state.teams.find((t) => t.id === action.teamId);
      const player = team?.players.find((p) => p.id === action.playerId);
      if (!team || !player) return state;
      const words = action.words.map((w) => w.trim()).filter(Boolean).slice(0, state.wordsPerPlayer);
      const without = state.wordEntries.filter((e) => e.playerId !== action.playerId);
      const added = words.map((word) => ({
        playerId: player.id,
        playerName: player.name,
        teamId: team.id,
        teamName: team.name,
        word,
      }));
      return { ...state, wordEntries: [...without, ...added] };
    }

    case 'START_GAME': {
      const words = allWords(state);
      if (words.length === 0) return state;
      return { ...state, phase: 'roundIntro', currentRound: 1, pot: [], currentWord: null };
    }

    case 'START_ROUND': {
      const pot = shuffle(allWords(state));
      const startTeamIndex = firstTeamWithPlayers(state);
      return {
        ...state,
        phase: 'handoff',
        currentRound: action.round,
        pot,
        currentWord: pot.length > 0 ? pot[pot.length - 1] : null,
        currentTeamIndex: startTeamIndex,
        currentPlayerIndex: 0,
        turnsThisRound: 0,
        turnPoints: 0,
        turnPasses: 0,
        timerRemaining: state.turnSeconds,
        timerStartedAt: null,
        roundResults: [...state.roundResults.filter((r) => r.round !== action.round), { round: action.round, completed: false }],
      };
    }

    case 'START_TURN': {
      return { ...state, phase: 'playing', timerRemaining: state.turnSeconds, timerStartedAt: Date.now() };
    }

    case 'CORRECT_GUESS': {
      const { rest, current } = popCurrent(state.pot);
      if (current == null) return state;
      const teamId = state.teams[state.currentTeamIndex]?.id;
      const scores = teamId ? { ...state.scores, [teamId]: (state.scores[teamId] ?? 0) + 1 } : state.scores;
      const { pot, current: next } = redraw(rest, null);
      return {
        ...state,
        scores,
        pot,
        currentWord: next,
        turnPoints: state.turnPoints + 1,
        totalWords: state.totalWords + 1,
        phase: next == null ? 'roundReview' : 'playing',
      };
    }

    case 'PASS_GUESS': {
      const { rest, current } = popCurrent(state.pot);
      if (current == null) return state;
      const { pot, current: next } = redraw(rest, current);
      return { ...state, pot, currentWord: next, turnPasses: state.turnPasses + 1 };
    }

    case 'TICK': {
      if (state.timerStartedAt == null || state.phase !== 'playing') return state;
      const remaining = Math.max(0, state.turnSeconds - Math.floor((action.now - state.timerStartedAt) / 1000));
      if (remaining === 0) return gameReducer({ ...state, timerRemaining: 0 }, { type: 'END_TURN' });
      return { ...state, timerRemaining: remaining };
    }

    case 'END_TURN': {
      const { rest, current } = popCurrent(state.pot);
      const { pot, current: next } = redraw(rest, current);
      const point = nextPoint(state);
      return {
        ...state,
        phase: 'handoff',
        pot,
        currentWord: next,
        currentTeamIndex: point.teamIndex,
        currentPlayerIndex: point.playerIndex,
        turnsThisRound: state.turnsThisRound + 1,
        turnPoints: 0,
        turnPasses: 0,
        timerRemaining: state.turnSeconds,
        timerStartedAt: null,
      };
    }

    case 'END_ROUND': {
      const roundResults = state.roundResults.map((r) => (r.round === state.currentRound ? { ...r, completed: true } : r));
      if (state.currentRound >= 3) {
        const best = Math.max(0, ...state.teams.map((t) => state.scores[t.id] ?? 0));
        return {
          ...state,
          phase: 'summary',
          roundResults,
          winners: state.teams.filter((t) => (state.scores[t.id] ?? 0) === best).map((t) => t.id),
        };
      }
      return { ...state, phase: 'roundReview', roundResults };
    }

    case 'NEXT_ROUND': {
      const next = Math.min(ROUNDS.length, state.currentRound + 1);
      return {
        ...state,
        phase: 'roundIntro',
        currentRound: next,
        pot: [],
        currentWord: null,
        turnPoints: 0,
        turnPasses: 0,
        timerRemaining: state.turnSeconds,
        timerStartedAt: null,
      };
    }

    case 'RESET': {
      return { ...initialGameState, turnSeconds: state.turnSeconds, timerRemaining: state.turnSeconds, wordsPerPlayer: state.wordsPerPlayer };
    }

    default:
      return state;
  }
}

export type TeamScore = {
  teamId: string;
  name: string;
  color: string;
  score: number;
  rank: number;
  isWinner: boolean;
};

export function teamScoresOf(teams: Team[], scores: Record<string, number>): Omit<TeamScore, 'rank' | 'isWinner'>[] {
  return teams.map((team) => ({
    teamId: team.id,
    name: team.name,
    color: team.color,
    score: scores[team.id] ?? 0,
  }));
}

/** Ranks teams with standard competition ranking, so ties share a rank. */
export function rankStandings(rows: Omit<TeamScore, 'rank' | 'isWinner'>[]): TeamScore[] {
  const ranked = rows.slice().sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const best = ranked[0]?.score ?? 0;
  return ranked.reduce<TeamScore[]>((acc, row, index) => {
    const previous = acc[index - 1];
    const rank = previous && previous.score === row.score ? previous.rank : index + 1;
    acc.push({ ...row, rank, isWinner: row.score === best });
    return acc;
  }, []);
}
