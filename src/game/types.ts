import { DEFAULT_TURN_SECONDS, DEFAULT_WORDS_PER_PLAYER } from './constants';

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  /** One of TEAM_COLORS; picked on the setup screen. */
  color: string;
  players: Player[];
};

export type WordEntry = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  word: string;
};

export type RoundResult = {
  round: number;
  completed: boolean;
};

export type Phase = 'setup' | 'wordEntry' | 'roundIntro' | 'handoff' | 'playing' | 'roundReview' | 'summary';

export type Point = {
  teamIndex: number;
  playerIndex: number;
};

export type GuessTiming = {
  word: string;
  seconds: number;
};

export type GameState = {
  teams: Team[];
  wordEntries: WordEntry[];
  phase: Phase;
  /** 0 = not started yet, 1-3 during play. */
  currentRound: number;
  currentTeamIndex: number;
  currentPlayerIndex: number;
  /** Turns played in the current round; drives strict team rotation. */
  turnsThisRound: number;
  /** Configured in step 3 of the setup wizard. */
  wordsPerPlayer: number;
  turnSeconds: number;
  timerRemaining: number;
  /** Deadline-based so backgrounding the app cannot freeze or skip the clock. */
  timerStartedAt: number | null;
  /** Moment waarop het huidige woord voor het eerst zichtbaar werd (bij start van de beurt of na een wissel). */
  wordOpenedAt: number | null;
  /** Per correct geraden woord de tijd die het open stond. */
  guessTimes: GuessTiming[];
  /** Langste reeks direct goed geraden woorden binnen één beurt. */
  maxGuessStreak: number;
  /** Lopende reeks in de huidige beurt. */
  guessStreak: number;
  /** Shuffled queue. The last element is the word that is currently open. */
  pot: string[];
  currentWord: string | null;
  turnPoints: number;
  turnPasses: number;
  totalWords: number;
  scores: Record<string, number>;
  roundResults: RoundResult[];
  winners: string[];
};

export const initialGameState: GameState = {
  teams: [],
  wordEntries: [],
  phase: 'setup',
  currentRound: 0,
  currentTeamIndex: 0,
  currentPlayerIndex: 0,
  turnsThisRound: 0,
  wordsPerPlayer: DEFAULT_WORDS_PER_PLAYER,
  turnSeconds: DEFAULT_TURN_SECONDS,
  timerRemaining: DEFAULT_TURN_SECONDS,
  timerStartedAt: null,
  wordOpenedAt: null,
  guessTimes: [],
  maxGuessStreak: 0,
  guessStreak: 0,
  pot: [],
  currentWord: null,
  turnPoints: 0,
  turnPasses: 0,
  totalWords: 0,
  scores: {},
  roundResults: [],
  winners: [],
};
