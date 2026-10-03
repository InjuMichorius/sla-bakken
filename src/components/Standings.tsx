import { StyleSheet, Text, View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { TeamScore } from '@/game/reducer';
import { colors, radius, spacing } from '@/theme';

type StandingsProps = {
  standings: TeamScore[];
  compact?: boolean;
  title?: string;
};

export function Standings({ standings, compact = false, title }: StandingsProps) {
  const best = Math.max(1, ...standings.map((s) => s.score));
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {standings.map((row) => (
        <View key={row.teamId} style={[styles.row, row.isWinner && styles.rowWinner]}>
          <View style={[styles.dot, { backgroundColor: row.color }]} />
          <Text style={styles.name} numberOfLines={1}>
            {row.name}
          </Text>
          {!compact && row.isWinner ? <Trophy size={16} color={colors.accent} /> : null}
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.max(4, (row.score / best) * 100)}%`, backgroundColor: row.color },
              ]}
            />
          </View>
          <Text style={styles.score}>{row.score}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowWinner: { borderColor: 'rgba(255, 197, 61, 0.45)' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700', flexShrink: 1, maxWidth: '38%' },
  barTrack: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill },
  score: { color: colors.text, fontSize: 18, fontWeight: '900', minWidth: 28, textAlign: 'right' },
});
