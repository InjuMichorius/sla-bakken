export const WORDS_PER_PLAYER = 5;
export const MIN_WORDS_PER_PLAYER = 1;
export const MAX_WORDS_PER_PLAYER = 10;
export const MAX_PLAYER_NAME_LENGTH = 10;
export const MAX_TEAM_NAME_LENGTH = 24;
export const DEFAULT_WORDS_PER_PLAYER = WORDS_PER_PLAYER;

export const TURN_SECONDS_OPTIONS = [30, 45, 60, 90, 120] as const;
export const DEFAULT_TURN_SECONDS = 60;

export const MIN_TEAMS = 2;
export const MIN_PLAYERS_PER_TEAM = 2;

export type RoundMeta = {
  number: number;
  title: string;
  verb: string;
  tagline: string;
  rules: string[];
  icon: 'message-circle' | 'hand' | 'zap';
};

export const ROUNDS: RoundMeta[] = [
  {
    number: 1,
    title: 'Omschrijven',
    verb: 'Omschrijf het woord',
    tagline: 'Verboden woord',
    icon: 'message-circle',
    rules: [
      'Omschrijf het woord zo dat je team het kan raden.',
      'Zeg nooit het woord zelf, ook niet deels of per letter.',
      'Geen directe synoniemen of woorden die het meteen weggeven.',
      'Moeilijke woorden mag je gerust overslaan met "Pas".',
    ],
  },
  {
    number: 2,
    title: 'Uitbeelden',
    verb: 'Beeld het woord uit',
    tagline: 'Hints & mime',
    icon: 'hand',
    rules: [
      'Beeld het woord uit met handen, gezicht en lichaam.',
      'Praten, mompelen en geluiden maken is niet toegestaan.',
      'Schrijven mag ook niet — alleen gebaren.',
      'Je team lacht vandaag hardop, dus wees duidelijk.',
    ],
  },
  {
    number: 3,
    title: 'Eén Woord',
    verb: 'Zeg precies één woord',
    tagline: 'Hint',
    icon: 'zap',
    rules: [
      'Zeg als hint exact één enkel woord.',
      'Geen zinnen, geen uitleg, geen tweede woord.',
      'Het woord zelf mag uiteraard niet gezegd worden.',
      'Dit is de laatste ronde — geef je beste schot.',
    ],
  },
];
