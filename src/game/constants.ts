import type { TranslationKey } from '@/i18n/translations';

export const WORDS_PER_PLAYER = 5;
export const MIN_WORDS_PER_PLAYER = 1;
export const MAX_WORDS_PER_PLAYER = 10;
export const MAX_PLAYER_NAME_LENGTH = 10;
export const MAX_TEAM_NAME_LENGTH = 12;
export const DEFAULT_WORDS_PER_PLAYER = WORDS_PER_PLAYER;

export const TURN_SECONDS_OPTIONS = [15, 30, 45, 60, 90] as const;
export const DEFAULT_TURN_SECONDS = 30;

export const MIN_TEAMS = 2;
export const MIN_PLAYERS_PER_TEAM = 2;

export type RoundMeta = {
  number: number;
  /** Vertaleningssleutel van de titel, werkwoord, toevoeging en regels. */
  title: TranslationKey;
  verb: TranslationKey;
  tagline: TranslationKey;
  rules: TranslationKey[];
  icon: 'message-circle' | 'hand' | 'zap';
};

export const ROUNDS: RoundMeta[] = [
  {
    number: 1,
    title: 'rounds.describe.title',
    verb: 'rounds.describe.verb',
    tagline: 'rounds.describe.tagline',
    icon: 'message-circle',
    rules: [
      'rounds.describe.rule1',
      'rounds.describe.rule2',
      'rounds.describe.rule3',
      'rounds.describe.rule4',
      'rounds.describe.rule5',
    ],
  },
  {
    number: 2,
    title: 'rounds.act.title',
    verb: 'rounds.act.verb',
    tagline: 'rounds.act.tagline',
    icon: 'hand',
    rules: [
      'rounds.act.rule1',
      'rounds.act.rule2',
      'rounds.act.rule3',
      'rounds.act.rule4',
    ],
  },
  {
    number: 3,
    title: 'rounds.oneword.title',
    verb: 'rounds.oneword.verb',
    tagline: 'rounds.oneword.tagline',
    icon: 'zap',
    rules: [
      'rounds.oneword.rule1',
      'rounds.oneword.rule2',
      'rounds.oneword.rule3',
      'rounds.oneword.rule4',
    ],
  },
];
