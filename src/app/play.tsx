import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check, Flag, SkipForward, Timer, X } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { RoundIcon } from '@/components/RoundIcon';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { Standings } from '@/components/Standings';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { teamColor } from '@/game/colors';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

function formatTime(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Top bar for the in-round screens. The round badge is centred across the full
 * row instead of sitting in a flex slot, so a long title keeps its pill shape
 * rather than wrapping to a second line. The exit button and scoreboard stay in
 * the normal flow on either side.
 */
function RoundTopBar({ round, title }: { round: number; title: string }) {
  return (
    <>
      <QuitGameButton />
      <View style={styles.topCenter} pointerEvents="none">
        <Badge tone="accent" style={styles.roundPill}>
          Ronde {round} · {title}
        </Badge>
      </View>
      <TeamScoreboard />
    </>
  );
}

export default function PlayScreen() {
  const { state, currentTeam, currentPlayer, standings, totalWords, startTurn, correctGuess, passGuess, tick, endTurn, endRound, nextRound } =
    useGameContext();

  const meta = ROUNDS.find((r) => r.number === state.currentRound) ?? ROUNDS[0];
  const color = currentTeam?.color ?? teamColor(0);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const id = setInterval(() => tick(Date.now()), 200);
    return () => clearInterval(id);
  }, [state.phase, tick]);

  if (state.phase === 'roundReview') {
    const isLastRound = state.currentRound >= 3;
    const finish = () => {
      haptics.medium();
      endRound();
      if (!isLastRound) nextRound();
    };
    return (
      <Screen
        topBar={
          <>
            <QuitGameButton />
            <TeamScoreboard />
          </>
        }
        scroll={false}
        contentStyle={styles.reviewContent}
        footer={<AppButton label={isLastRound ? 'Eindstand bekijken' : `Naar ronde ${state.currentRound + 1}`} size="xl" onPress={finish} />}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewIcon}>
            <Flag size={30} color={colors.success} />
          </View>
          <Text style={styles.reviewTitle}>Ronde {state.currentRound} afgelopen</Text>
          <Text style={styles.reviewBody}>
            {isLastRound ? 'Alle drie de rondes zijn gespeeld. Dit is de eindstand.' : `Alle ${totalWords} woorden zijn geraden. De pot wordt opnieuw gevuld voor ronde ${state.currentRound + 1}.`}
          </Text>
        </View>
        <View style={styles.reviewBlock}>
          <Standings standings={standings} title={`Tussenstand na ronde ${state.currentRound}`} />
        </View>
        {!isLastRound ? (
          <View style={styles.nextRoundHint}>
            <RoundIcon name={ROUNDS[state.currentRound].icon} size={18} />
            <Text style={styles.nextRoundText}>
              Volgende ronde: <Text style={styles.strong}>{ROUNDS[state.currentRound].title}</Text>
            </Text>
          </View>
        ) : null}
      </Screen>
    );
  }

  if (state.phase === 'handoff') {
    return (
      <Screen
topBar={<RoundTopBar round={state.currentRound} title={meta.title} />}
        scroll={false}
        contentStyle={styles.handoffContent}
        footer={
          <AppButton
            label="Start beurt"
            size="xl"
            onPress={startTurn}
            icon={<Timer size={20} color="#241A00" />}
          />
        }
      >
        <View style={styles.handoffBody}>
          <Text style={styles.handoffTitle}>Geef de telefoon aan</Text>
          <Avatar name={currentPlayer?.name ?? 'Onbekend'} color={color} size={104} />
          <Text style={styles.handoffName}>{currentPlayer?.name ?? 'Onbekend'}</Text>
          <Badge color={color} style={styles.teamBadge}>
            {currentTeam?.name}
          </Badge>
          <View style={styles.handoffRule}>
            <RoundIcon name={meta.icon} size={15} color={colors.muted} />
            <Text style={styles.handoffRuleText}>
              {meta.verb.toLowerCase()} / {meta.tagline}
            </Text>
          </View>
        </View>

        <View style={styles.handoffStandings}>
          <Standings standings={standings} compact title="Tussenstand" centerTitle />
        </View>
      </Screen>
    );
  }

  const remaining = state.timerRemaining;
  const urgent = remaining <= 10;
  const urgentCritical = remaining <= 5;

  const onCorrect = () => {
    haptics.success();
    correctGuess();
  };

  const onPass = () => {
    haptics.warning();
    passGuess();
  };

  return (
    <Screen
      topBar={<RoundTopBar round={state.currentRound} title={meta.title} />}
      scroll={false}
      contentStyle={styles.playContent}
    >
      <View style={styles.turnRow}>
        <View style={[styles.colorBar, { backgroundColor: color }]} />
        <View style={styles.turnText}>
          <Text style={styles.turnTeam}>{currentTeam?.name}</Text>
          <Text style={styles.turnPlayer}>{currentPlayer?.name}</Text>
        </View>
        <View style={styles.turnPoints}>
          <Text style={styles.turnPointsValue}>{state.totalWords}</Text>
          <Text style={styles.turnPointsLabel}>geraden</Text>
        </View>
      </View>

      <View style={styles.playTop}>
        <View style={styles.timerRow}>
          <View style={[styles.timerRing, urgent && styles.timerRingUrgent, urgentCritical && styles.timerRingCritical]}>
            <Text style={[styles.timerText, urgent && styles.timerTextUrgent]}>{formatTime(remaining)}</Text>
            <Text style={styles.timerUnit}>seconden</Text>
          </View>
        </View>
      </View>

      <View style={styles.wordBox}>
        <Text style={styles.wordLabel}>TE RADEN WOORD</Text>
        <Text style={styles.word} numberOfLines={3} adjustsFontSizeToFit>
          {state.currentWord ?? '—'}
        </Text>
        <Text style={styles.wordRule}>{meta.verb}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Goed"
          size="xl"
          variant="success"
          onPress={onCorrect}
          icon={<Check size={26} color="#04231A" />}
          style={styles.goedButton}
        />
        <View style={styles.actionRow}>
          <AppButton
            label="Pas"
            size="lg"
            variant="secondary"
            onPress={onPass}
            icon={<SkipForward size={20} color={colors.text} />}
            style={styles.actionPass}
          />
          <AppButton
            label="Beurt stoppen"
            size="lg"
            variant="dangerOutline"
            onPress={endTurn}
            icon={<X size={20} color={colors.danger} />}
            style={styles.actionStop}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  playContent: { padding: 0 },
  playTop: { padding: spacing.lg, paddingBottom: 0 },
  timerRow: { alignItems: 'center' },
  timerRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 5,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingUrgent: { borderColor: colors.warning, backgroundColor: 'rgba(251, 146, 60, 0.14)' },
  timerRingCritical: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  timerText: { color: colors.text, fontSize: 44, fontWeight: '900', letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  timerTextUrgent: { color: colors.warning },
  timerUnit: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  turnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  colorBar: { width: 5, height: 40, borderRadius: radius.pill },
  turnText: { flex: 1 },
  turnTeam: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  turnPlayer: { color: colors.text, fontSize: 20, fontWeight: '900' },
  turnPoints: { alignItems: 'flex-end' },
  turnPointsValue: { color: colors.accent, fontSize: 26, fontWeight: '900' },
  turnPointsLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  wordBox: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  wordLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  word: {
    color: colors.text,
    fontSize: 46,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  wordRule: { color: colors.accent, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  actions: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  goedButton: { width: '100%' },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  /** "Beurt stoppen" carries more text, so it gets the larger share of the row. */
  actionPass: { flex: 0.7, paddingHorizontal: spacing.md },
  actionStop: { flex: 1.3, paddingHorizontal: spacing.md },

  topCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  /** Badge pins itself to the start by default, which would pull the pill off-centre. */
  roundPill: { alignSelf: 'center' },

  /** Mirrors the word-entry handoff, so both handovers share the same title height. */
  handoffContent: { justifyContent: 'flex-start', gap: spacing.lg },
  handoffBody: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: spacing.lg, paddingTop: spacing.xl },
  handoffTitle: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center' },
  handoffName: { color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  /** Badge stretches to the start by default, which breaks the centred handoff column. */
  teamBadge: { alignSelf: 'center' },
  handoffRule: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  handoffRuleText: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  handoffStandings: { width: '100%' },

  reviewContent: { justifyContent: 'flex-start', gap: spacing.xl },
  reviewHeader: { alignItems: 'center', gap: spacing.md },
  reviewIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, textAlign: 'center' },
  reviewBody: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  reviewBlock: { width: '100%' },
  nextRoundHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  nextRoundText: { color: colors.muted, fontSize: 14, flex: 1 },
  strong: { color: colors.text, fontWeight: '800' },
});
