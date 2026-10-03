import { WORD_BANK } from './wordBank';

/**
 * Picks a random word that is not yet in use, so a player can always re-roll
 * without ending up with a word somebody else already entered.
 */
export function pickRandomWord(used: string[] = []): string {
  const taken = new Set(used.map((w) => w.trim().toLowerCase()).filter(Boolean));
  const pool = WORD_BANK.filter((w) => !taken.has(w.toLowerCase()));
  const source = pool.length > 0 ? pool : WORD_BANK;
  return source[Math.floor(Math.random() * source.length)];
}
