import { StyleSheet, Text, View } from 'react-native';
import { PartyPopper, RotateCcw, Trophy } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function SummaryScreen() {
  const { state, standings, totalWords, reset } = useGameContext();
  const winners = standings.filter((s) => s.isWinner);
  const isTie = winners.length > 1;

  const playAgain = () => {
    haptics.medium();
    reset();
  };

  return (
    <Screen
      topBar={<QuitGameButton />}
      scroll={false}
      contentStyle={styles.content}
      footer={<AppButton label="Nieuw spel" size="xl" onPress={playAgain} icon={<RotateCcw size={20} color="#241A00" />} />}
    >
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          {isTie ? <PartyPopper size={32} color={colors.accent} /> : <Trophy size={32} color={colors.accent} />}
        </View>
        <Text style={styles.eyebrow}>Eindstand na 3 rondes</Text>
        <Text style={styles.winner} numberOfLines={2}>
          {isTie ? winners.map((w) => w.name).join(' & ') : `${winners[0]?.name ?? 'Iedereen'}`}
        </Text>
        <Text style={styles.winnerLabel}>{isTie ? 'Gewonnen met gelijkspel' : 'wint met ' + (winners[0]?.score ?? 0) + ' punten'}</Text>
      </View>

      <View style={styles.podium}>
        {standings.slice(0, 3).map((row, i) => (
          <View
            key={row.teamId}
            style={[
              styles.podiumRow,
              { borderColor: row.isWinner ? colors.accent : colors.border, backgroundColor: row.isWinner ? colors.accentSoft : colors.surface },
            ]}
          >
            <Text style={styles.medal}>{MEDALS[i]}</Text>
            <View style={[styles.podiumDot, { backgroundColor: row.color }]} />
            <Text style={styles.podiumName} numberOfLines={1}>
              {row.name}
            </Text>
            <Text style={[styles.podiumScore, row.isWinner && { color: colors.accent }]}>{row.score}</Text>
          </View>
        ))}
        {standings.length > 3
          ? standings.slice(3).map((row) => (
              <View key={row.teamId} style={styles.extraRow}>
                <Text style={styles.extraName} numberOfLines={1}>
                  {row.name}
                </Text>
                <Text style={styles.extraScore}>{row.score}</Text>
              </View>
            ))
          : null}
      </View>

      <View style={styles.stats}>
        {[
          ['Rondes gespeeld', '3'],
          ['Woorden in de pot', String(totalWords)],
          ['Totaal geraad', String(state.totalWords)],
          ['Seconden per beurt', `${state.turnSeconds}`],
        ].map(([label, value]) => (
          <View key={label} style={styles.stat}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.rounds}>
        {ROUNDS.map((r) => (
          <View key={r.number} style={styles.roundRow}>
            <View style={styles.roundIndex}>
              <Text style={styles.roundIndexText}>{r.number}</Text>
            </View>
            <Text style={styles.roundName}>{r.title}</Text>
            <Text style={styles.roundRule}>{r.tagline}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 197, 61, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  winner: { color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  winnerLabel: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  podium: { gap: spacing.sm },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  medal: { fontSize: 24 },
  podiumDot: { width: 12, height: 12, borderRadius: 6 },
  podiumName: { color: colors.text, fontSize: 17, fontWeight: '800', flex: 1 },
  podiumScore: { color: colors.text, fontSize: 24, fontWeight: '900' },
  extraRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  extraName: { color: colors.muted, fontSize: 14, fontWeight: '600', flex: 1 },
  extraScore: { color: colors.muted, fontSize: 14, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    flexGrow: 1,
    minWidth: 80,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  rounds: { gap: spacing.xs },
  roundRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roundIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundIndexText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  roundName: { color: colors.text, fontSize: 14, fontWeight: '700', width: 110 },
  roundRule: { color: colors.muted, fontSize: 13, flex: 1 },
});
