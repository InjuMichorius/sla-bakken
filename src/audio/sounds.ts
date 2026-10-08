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
 * `tick`, `timeUp` en `victory` zijn gebeurtenisgeluiden zonder knop.
 */
export type SoundKey = 'accept' | 'decline' | 'correct' | 'turnStart' | 'tick' | 'timeUp' | 'victory';

export type SoundMeta = {
  key: SoundKey;
  /** Naam die in het instellingenscherm te zien is. */
  label: string;
  /** Wanneer dit geluid afgespeeld wordt. */
  hint: string;
  source: number;
};

export const SOUNDS: SoundMeta[] = [
  { key: 'accept', label: 'Doorgaan', hint: 'Bij verder gaan of iets positiefs', source: require('../../assets/sounds/accept.wav') },
  { key: 'decline', label: 'Terug/annuleren', hint: 'Bij teruggaan, stoppen of annuleren', source: require('../../assets/sounds/decline.wav') },
  { key: 'correct', label: 'Goed geraden', hint: 'Vrolijke kort ja-toon op de "Goed"-knop', source: require('../../assets/sounds/correct.wav') },
  { key: 'turnStart', label: 'Beurt starten', hint: 'Piep wanneer de beurt begint', source: require('../../assets/sounds/turnStart.wav') },
  { key: 'tick', label: 'Timer tikt', hint: 'Om de 2 seconden in de laatste 10 seconden', source: require('../../assets/sounds/tick.wav') },
  { key: 'timeUp', label: 'Tijd op', hint: 'Als de timer op nul staat', source: require('../../assets/sounds/timeUp.wav') },
  { key: 'victory', label: 'Winnaar', hint: 'Op het eindstandscherm', source: require('../../assets/sounds/victory.wav') },
];

const BY_KEY = new Map(SOUNDS.map((s) => [s.key, s]));

export function soundSource(key: SoundKey): number {
  const meta = BY_KEY.get(key);
  if (!meta) throw new Error(`Onbekend geluid: ${key}`);
  return meta.source;
}