import { MAX_PLAYER_NAME_LENGTH, MAX_TEAM_NAME_LENGTH } from './constants';

export function normalizeTeamName(name: string): string {
  return name.trim().slice(0, MAX_TEAM_NAME_LENGTH);
}

export function normalizePlayerName(name: string): string {
  return name.trim().slice(0, MAX_PLAYER_NAME_LENGTH);
}

/** Names collide when they match case-insensitively, ignoring surrounding whitespace. */
export function isNameTaken(name: string, taken: string[]): boolean {
  const key = name.trim().toLowerCase();
  if (!key) return false;
  return taken.some((other) => other.trim().toLowerCase() === key);
}

/** First free "Speler n" name, so generated names never collide. */
export function nextFreePlayerName(taken: string[]): string {
  let n = 1;
  while (isNameTaken(`Speler ${n}`, taken)) n += 1;
  return `Speler ${n}`;
}
/** Keep a requested name when possible, otherwise append a numeric suffix. */
export function nextAvailablePlayerName(name: string, taken: string[]): string {
  const base = normalizePlayerName(name);
  if (!base) return nextFreePlayerName(taken);
  if (!isNameTaken(base, taken)) return base;

  let suffix = 2;
  while (true) {
    const tail = ` ${suffix}`;
    const candidate = normalizePlayerName(base.slice(0, MAX_PLAYER_NAME_LENGTH - tail.length)) + tail;
    if (!isNameTaken(candidate, taken)) return candidate;
    suffix += 1;
  }
}
