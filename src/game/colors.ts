const teamPalette = ['#FF6B6B', '#4ECDC4', '#A78BFA', '#60A5FA', '#F472B6', '#34D399', '#FB923C', '#FACC15'] as const;

export function teamColor(index: number): string {
  return teamPalette[((index % teamPalette.length) + teamPalette.length) % teamPalette.length];
}
