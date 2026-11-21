export const MAX_PROFILE_NAME_LENGTH = 10;

const RESERVED_PROFILE_NAME_PATTERN = /^(?:speler|player|spieler|joueur)(?:\s+\d+)?$/i;

export function isReservedProfileName(name: string): boolean {
  return RESERVED_PROFILE_NAME_PATTERN.test(name.trim());
}

export function isProfileNameFormatValid(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_PROFILE_NAME_LENGTH && !isReservedProfileName(trimmed);
}
