import { StyleSheet, Text, View } from 'react-native';
import { teamColor } from '@/game/colors';
import { useGameContext } from '@/game/GameProvider';
import { spacing } from '@/theme';

/**
 * Live score for every team, pinned to the top-right of a screen. Sits on every
 * screen after setup so the standing is never more than a glance away, and reads
 * the same everywhere because it derives the colours from the team index.
 */
export function TeamScoreboard() {
  const { state, teams } = useGameContext();
  const { scores } = state;

  if (teams.length === 0) return null;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Stand: ${teams.map((team, i) => `${team.name} ${scores[team.id] ?? 0} punten`).join(', ')}`}
    >
      {teams.map((team, i) => (
        <View key={team.id} style={styles.entry}>
          <View style={[styles.dot, { backgroundColor: teamColor(i) }]} />
          <Text style={[styles.score, { color: teamColor(i) }]}>{scores[team.id] ?? 0}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  /** marginLeft: auto pins this to the far right of Screen's topBar row. */
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: 'auto' },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  score: { fontSize: 15, fontWeight: '900', letterSpacing: -0.2, fontVariant: ['tabular-nums'] },
});
