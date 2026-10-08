import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PartyPopper, RotateCcw, Trophy } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export default function SummaryScreen() {
  const { state, standings, newGame } = useGameContext();
  const { play } = useFeedback();
  const winners = standings.filter((s) => s.isWinner);
  const isTie = winners.length > 1;

  const guessTimes = state.guessTimes;
  const fastest = guessTimes.reduce<{ word: string; seconds: number } | null>(
    (best, guess) => (best === null || guess.seconds < best.seconds ? guess : best),
    null
  );
  const avgSeconds = guessTimes.length > 0 ? guessTimes.reduce((sum, guess) => sum + guess.seconds, 0) / guessTimes.length : null;
  const hasGuesses = guessTimes.length > 0;

  const stats = [
    {
      key: 'fastest',
      label: fastest != null ? `Snelst geraden (${fastest.seconds.toFixed(1)}s)` : 'Snelst geraden',
      value: fastest?.word ?? '–',
      wide: true,
    },
    { key: 'avg', label: 'Gemiddeld per woord', value: avgSeconds != null ? `${avgSeconds.toFixed(1)}s` : '–', wide: false },
    { key: 'streak', label: 'Langste reeks', value: hasGuesses ? String(state.maxGuessStreak) : '–', wide: false },
  ] as const;

  /** Een keer bij het openen van de eindstand, niet opnieuw bij elke settings-wijziging. */
  const celebrated = useRef(false);
  useEffect(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    play('victory');
  }, [play]);

  const playAgain = () => {
    haptics.medium();
    newGame();
  };

  return (
    <Screen
      topBar={
        <>
          <QuitGameButton />
          <TeamScoreboard />
        </>
      }
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
        {standings.map((row) => {
          const team = state.teams.find((t) => t.id === row.teamId);
          return (
            <View
              key={row.teamId}
              style={[
                styles.podiumRow,
                { borderColor: row.isWinner ? colors.accent : colors.border, backgroundColor: row.isWinner ? colors.accentSoft : colors.surface },
              ]}
            >
              <View style={styles.podiumHeader}>
                <View style={[styles.podiumDot, { backgroundColor: row.color }]} />
                <Text style={styles.podiumName} numberOfLines={1}>
                  {row.name}
                </Text>
                <Text style={[styles.podiumScore, row.isWinner && { color: colors.accent }]}>{row.score}</Text>
              </View>
              {team ? (
                <View style={styles.roster}>
                  {team.players.map((player) => (
                    <View key={player.id} style={styles.player}>
                      <Avatar name={player.name} color={row.color} size={28} />
                      <Text style={styles.playerName} numberOfLines={1}>
                        {player.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.key} style={[styles.stat, stat.wide && styles.statWide]}>
            <Text style={[styles.statValue, stat.wide && styles.statValueWord]} numberOfLines={1}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
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
  content: { justifyContent: 'flex-start', gap: spacing.lg },
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
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  winner: { color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  winnerLabel: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  podium: { gap: spacing.sm },
  podiumRow: {
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  podiumHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  podiumDot: { width: 12, height: 12, borderRadius: 6 },
  podiumName: { color: colors.text, fontSize: 17, fontWeight: '800', flex: 1 },
  podiumScore: { color: colors.text, fontSize: 24, fontWeight: '900' },
  roster: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  player: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  playerName: { color: colors.muted, fontSize: 13, fontWeight: '700' },
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
  statWide: { flexGrow: 2 },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '900' },
  statValueWord: { fontSize: 18, maxWidth: '100%' },
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
