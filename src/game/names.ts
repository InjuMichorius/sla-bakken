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