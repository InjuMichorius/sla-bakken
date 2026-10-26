import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { PartyPopper, RotateCcw, Trophy } from 'lucide-react-native';
import { useAuth } from '@/auth/AuthProvider';
import { useFeedback } from '@/audio/FeedbackProvider';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { GameMenu } from '@/components/GameMenu';
import { Screen } from '@/components/Screen';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { translateDefaultPlayerName, useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export default function SummaryScreen() {
  const { state, standings, newGame } = useGameContext();
  const { session, recordGameResults } = useAuth();
  const { play } = useFeedback();
  const { t, language } = useI18n();
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
      label: fastest != null ? t('summary.fastestWith', { s: fastest.seconds.toFixed(1) }) : t('summary.fastest'),
      value: fastest?.word ?? '–',
      wide: true,
    },
    { key: 'avg', label: t('summary.avg'), value: avgSeconds != null ? `${avgSeconds.toFixed(1)}s` : '–', wide: false },
    { key: 'streak', label: t('summary.streak'), value: hasGuesses ? String(state.maxGuessStreak) : '–', wide: false },
  ] as const;

  /** Een keer bij het openen van de eindstand, niet opnieuw bij elke settings-wijziging. */
  const celebrated = useRef(false);
  useEffect(() => {
    if (celebrated.current) return;
    celebrated.current = true;
    play('victory');
  }, [play]);

  const [confetti] = useState(() => Array.from({ length: 80 }, (_, i) => ({
    key: i,
    x: new Animated.Value(Math.random() * Dimensions.get('window').width),
    y: new Animated.Value(-20 - Math.random() * 200),
    rot: new Animated.Value(0),
    color: ['#FFC53D', '#22D3EE', '#A78BFA', '#22C55E', '#F43F5E'][i % 5],
  })));

  useEffect(() => {
    const animations = confetti.map((piece) =>
      Animated.parallel([
        Animated.timing(piece.y, {
          toValue: Dimensions.get('window').height + 100,
          duration: 2000 + Math.random() * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rot, {
          toValue: 360 * (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3),
          duration: 2000 + Math.random() * 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(10, animations).start();
  }, [confetti]);

  const recorded = useRef<string | null>(null);
  useEffect(() => {
    const userId = session?.user.id;
    const gameId = state.gameId;
    if (state.phase !== 'summary' || !userId || !gameId) return;

    const results = new Map<string, number>();
    state.teams.forEach((team) => {
      const score = standings.find((row) => row.teamId === team.id)?.score ?? 0;
      team.players.forEach((player) => {
        if (player.userId && !results.has(player.userId)) results.set(player.userId, score);
      });
    });

    if (!results.has(userId)) return;

    const key = `${gameId}:${userId}`;
    if (recorded.current === key) return;

    recorded.current = key;
    void recordGameResults(
      gameId,
      Array.from(results, ([playerId, points]) => ({ userId: playerId, points })),
    ).then((stats) => {
      if (stats.length === 0) recorded.current = null;
    });
  }, [recordGameResults, session?.user.id, standings, state.gameId, state.phase, state.teams]);

  const playAgain = () => {
    haptics.medium();
    newGame();
  };

  return (
    <View style={styles.root}>
      {confetti.map((piece) => (
        <Animated.View
          key={piece.key}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rot.interpolate({
                    inputRange: [-1080, 1080],
                    outputRange: ['-1080deg', '1080deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
      <Screen
        topBar={
          <>
            <TeamScoreboard />
            <GameMenu />
          </>
        }
        contentStyle={styles.content}
        footer={<AppButton label={t('summary.newGame')} size="xl" onPress={playAgain} icon={<RotateCcw size={20} color="#241A00" />} />}
      >
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          {isTie ? <PartyPopper size={32} color={colors.accent} /> : <Trophy size={32} color={colors.accent} />}
        </View>
        <Text style={styles.eyebrow}>{t('summary.eyebrow')}</Text>
        <Text style={styles.winner} numberOfLines={2}>
          {isTie ? winners.map((w) => w.name).join(' & ') : `${winners[0]?.name ?? t('summary.everyone')}`}
        </Text>
        <Text style={styles.winnerLabel}>
          {isTie ? t('summary.tie') : t('summary.wins', { n: winners[0]?.score ?? 0 })}
        </Text>
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
                    <Avatar name={translateDefaultPlayerName(player.name, language)} color={row.color} size={28} />
                    <Text style={styles.playerName} numberOfLines={1}>
                      {translateDefaultPlayerName(player.name, language)}
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
            <Text style={styles.roundName}>{t(r.title)}</Text>
            <Text style={styles.roundRule}>{t(r.tagline)}</Text>
          </View>
        ))}
      </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 16,
    borderRadius: 2,
    zIndex: 10,
  },
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
