import { StyleSheet, Text, View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { TeamScore } from '@/game/reducer';
import { colors, radius, spacing } from '@/theme';

type StandingsProps = {
  standings: TeamScore[];
  compact?: boolean;
  title?: string;
  /** Centres the title, for screens where the block itself is centred. */
  centerTitle?: boolean;
};

export function Standings({ standings, compact = false, title, centerTitle = false }: StandingsProps) {
  const { totalWords } = useGameContext();
  // Scores accumulate over all rounds while the pot is refilled every round, so
  // the bar scales to the most points a team can collect in the whole game.
  // Otherwise a team that swept round 1 already shows a full bar in round 2.
  const max = Math.max(1, ROUNDS.length * totalWords);
  return (
    <View style={styles.wrap}>
      {title ? <Text style={[styles.title, centerTitle && styles.titleCenter]}>{title}</Text> : null}
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
                { width: `${Math.min(100, Math.max(4, (row.score / max) * 100))}%`, backgroundColor: row.color },
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
  titleCenter: { alignSelf: 'stretch', textAlign: 'center' },
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
