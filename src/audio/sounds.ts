/**
 * Centrale registry van alle geluiden in de app.
 *
 * De bestanden in `assets/sounds/` zijn korte placeholder-tonen. Wil je eigen
 * geluiden? Vervang het bijbehorende bestand (liefst .wav of .mp3, max ~1 seconde)
 * of wijzig hieronder de `require` naar jouw bestand. De sleutel, label en
 * speelmoment blijven hetzelfde, dus de rest van de app hoeft niet te veranderen.
 *
 * De taal is bewust binair: **accept** (verder gaan of iets positiefs doen) en
 * **decline** (teruggaan, stoppen of annuleren) zijn de twee knopgeluiden.
 * **swap** is het eigen geluidje van de random-woordknop. `ticking` (continue
 * loop die in de laatste tien seconden zacht begint en langzaam harder wordt),
 * `timeUp` en `victory` zijn gebeurtenisgeluiden zonder knop.
 */
import type { TranslationKey } from '@/i18n/translations';

export type SoundKey = 'accept' | 'decline' | 'swap' | 'correct' | 'turnStart' | 'ticking' | 'timeUp' | 'victory';

export type SoundMeta = {
  key: SoundKey;
  /** Vertaleningssleutel van de naam die in het instellingenscherm te zien is. */
  label: TranslationKey;
  /** Vertaleningssleutel van wanneer dit geluid afgespeeld wordt. */
  hint: TranslationKey;
  source: number;
};

export const SOUNDS: SoundMeta[] = [
  { key: 'accept', label: 'sound.accept.label', hint: 'sound.accept.hint', source: require('../../assets/sounds/accept.wav') },
  { key: 'decline', label: 'sound.decline.label', hint: 'sound.decline.hint', source: require('../../assets/sounds/decline.wav') },
  { key: 'swap', label: 'sound.swap.label', hint: 'sound.swap.hint', source: require('../../assets/sounds/swap.wav') },
  { key: 'correct', label: 'sound.correct.label', hint: 'sound.correct.hint', source: require('../../assets/sounds/correct.wav') },
  { key: 'turnStart', label: 'sound.turnStart.label', hint: 'sound.turnStart.hint', source: require('../../assets/sounds/turnStart.wav') },
  { key: 'ticking', label: 'sound.ticking.label', hint: 'sound.ticking.hint', source: require('../../assets/sounds/ticking.wav') },
  { key: 'timeUp', label: 'sound.timeUp.label', hint: 'sound.timeUp.hint', source: require('../../assets/sounds/timeUp.wav') },
  { key: 'victory', label: 'sound.victory.label', hint: 'sound.victory.hint', source: require('../../assets/sounds/victory.wav') },
];

const BY_KEY = new Map(SOUNDS.map((s) => [s.key, s]));

export function soundSource(key: SoundKey): number {
  const meta = BY_KEY.get(key);
  if (!meta) throw new Error(`Onbekend geluid: ${key}`);
  return meta.source;
}