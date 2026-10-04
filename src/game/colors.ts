/**
 * Fixed team colors. Deliberately skips yellow and green: those already mean
 * "accent" and "goed gedaan" in the theme, so they would misread as status
 * instead of as a team's identity. Two teams can never share one, which keeps
 * the scoreboard, avatars and standings unambiguous.
 */
export const TEAM_COLORS = [
  { id: '#60A5FA', name: 'blauw' },
  { id: '#FB923C', name: 'oranje' },
  { id: '#A78BFA', name: 'paars' },
  { id: '#F472B6', name: 'roze' },
] as const;

export type TeamColorId = (typeof TEAM_COLORS)[number]['id'];

export function isTeamColor(color: string): color is TeamColorId {
  return TEAM_COLORS.some((option) => option.id.toLowerCase() === color.toLowerCase());
}

/** Default colour for the team at this position, used when none is chosen yet. */
export function teamColor(index: number): string {
  return TEAM_COLORS[((index % TEAM_COLORS.length) + TEAM_COLORS.length) % TEAM_COLORS.length].id;
}

/** First palette colour no other team uses, so fresh teams never clash. */
export function nextFreeTeamColor(used: string[]): string {
  const taken = used.map((color) => color.toLowerCase());
  return TEAM_COLORS.find((option) => !taken.includes(option.id.toLowerCase()))?.id ?? teamColor(taken.length);
}