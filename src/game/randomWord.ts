import type { Language } from '@/i18n/translations';
import { WORD_BANK } from './wordBank';
import { DE_WORD_BANK } from './wordBank.de';
import { EN_WORD_BANK } from './wordBank.en';
import { FR_WORD_BANK } from './wordBank.fr';

const BANKS: Record<Language, string[]> = {
  nl: WORD_BANK,
  en: EN_WORD_BANK,
  de: DE_WORD_BANK,
  fr: FR_WORD_BANK,
};

/**
 * Picks a random word from the bank of the active language that is not yet in
 * use, so a player can always re-roll without ending up with a word somebody
 * else already entered.
 */
export function pickRandomWord(used: string[] = [], language: Language = 'nl'): string {
  const bank = BANKS[language] ?? WORD_BANK;
  const taken = new Set(used.map((w) => w.trim().toLowerCase()).filter(Boolean));
  const pool = bank.filter((w) => !taken.has(w.toLowerCase()));
  const source = pool.length > 0 ? pool : bank;
  return source[Math.floor(Math.random() * source.length)];
}
