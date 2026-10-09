import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Check, Flag, SkipForward, Timer, X } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
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
import { useI18n } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

/**
 * Aftellen start pas in de laatste paar seconden, en het maximale volume ligt
 * bewust onder 1 zodat het getik de andere geluiden niet overstemt.
 */
const TICK_WINDOW_SECONDS = 5;
const TICK_MAX_VOLUME = 0.5;

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
function RoundTopBar({ round, title }: { round: number; title: TranslationKey }) {
  const { t } = useI18n();
  return (
    <>
      <QuitGameButton />
      <View style={styles.topCenter} pointerEvents="none">
        <Badge tone="accent" style={styles.roundPill}>
          {t('play.round')} {round} · {t(title)}
        </Badge>
      </View>
      <TeamScoreboard />
    </>
  );
}

export default function PlayScreen() {
  const { state, currentTeam, currentPlayer, standings, totalWords, startTurn, correctGuess, passGuess, tick, endTurn, endRound, nextRound } =
    useGameContext();
  const { play, playLoop, stopLoop } = useFeedback();
  const { t } = useI18n();

  const meta = ROUNDS.find((r) => r.number === state.currentRound) ?? ROUNDS[0];
  const color = currentTeam?.color ?? teamColor(0);

  /** Tijd-op-geluid lokaal uit de deadline, zodat het precies op nul valt. */
  const timeUpPlayed = useRef(false);

  const remaining = state.timerRemaining;
  const urgent = remaining <= 10;
  const urgentCritical = remaining <= 5;

  /** Pulserende schaalanimatie voor de timer in de laatste 10 seconden. */
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (state.phase !== 'playing') {
      timeUpPlayed.current = false;
      return;
    }
    const startedAt = state.timerStartedAt;
    const turnSeconds = state.turnSeconds;
    if (startedAt == null) return;

    const id = setInterval(() => {
      const left = turnSeconds - Math.floor((Date.now() - startedAt) / 1000);
      if (left <= 0) {
        if (!timeUpPlayed.current) {
          timeUpPlayed.current = true;
          play('timeUp');
          haptics.timeUp();
        }
      }
      tick(Date.now());
    }, 200);
    return () => clearInterval(id);
  }, [state.phase, state.timerStartedAt, state.turnSeconds, tick, play]);

  /**
   * Eén doorlopende tik in de laatste paar seconden: het volume begint
   * fluisterzacht en groeit naar een plafond, zonder per seconde te herstarten
   * (geen losse tikjes).
   */
  useEffect(() => {
    if (state.phase !== 'playing') {
      stopLoop('ticking');
      return;
    }
    const startedAt = state.timerStartedAt;
    const turnSeconds = state.turnSeconds;
    if (startedAt == null) return;

    let looping = false;
    const update = () => {
      const left = turnSeconds - (Date.now() - startedAt) / 1000;
      if (left > 0 && left <= TICK_WINDOW_SECONDS) {
        // Kwadratisch en met een plafond: begint fluisterzacht en groeit pas
        // tegen het einde, zonder de andere geluiden te overstemmen.
        const progress = (TICK_WINDOW_SECONDS - left) / TICK_WINDOW_SECONDS;
        playLoop('ticking', TICK_MAX_VOLUME * progress * progress);
        looping = true;
      } else if (looping) {
        stopLoop('ticking');
        looping = false;
      }
    };
    update();
    const id = setInterval(update, 100);
    return () => {
      clearInterval(id);
      stopLoop('ticking');
    };
  }, [state.phase, state.timerStartedAt, state.turnSeconds, playLoop, stopLoop]);

  useEffect(() => {
    if (!urgent || state.phase !== 'playing') {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [urgent, state.phase, pulse]);

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
        footer={<AppButton label={isLastRound ? t('play.viewResults') : t('play.toRound', { n: state.currentRound + 1 })} size="xl" onPress={finish} />}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewIcon}>
            <Flag size={30} color={colors.success} />
          </View>
          <Text style={styles.reviewTitle}>{t('play.roundFinished', { n: state.currentRound })}</Text>
          <Text style={styles.reviewBody}>
            {isLastRound ? t('play.finishedLast') : t('play.finishedNext', { n: totalWords, n2: state.currentRound + 1 })}
          </Text>
        </View>
        <View style={styles.reviewBlock}>
          <Standings standings={standings} title={t('play.standingsAfter', { n: state.currentRound })} />
        </View>
        {!isLastRound ? (
          <View style={styles.nextRoundHint}>
            <RoundIcon name={ROUNDS[state.currentRound].icon} size={18} />
            <Text style={styles.nextRoundText}>
              {t('play.nextRound')} <Text style={styles.strong}>{t(ROUNDS[state.currentRound].title)}</Text>
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
            label={t('play.startTurn')}
            size="xl"
            onPress={startTurn}
            sound="turnStart"
            icon={<Timer size={20} color="#241A00" />}
          />
        }
      >
        <View style={styles.handoffBody}>
          <Text style={styles.handoffTitle}>{t('words.givePhone')}</Text>
          <Avatar name={currentPlayer?.name ?? t('common.unknown')} color={color} size={104} />
          <Text style={styles.handoffName}>{currentPlayer?.name ?? t('common.unknown')}</Text>
          <Badge color={color} style={styles.teamBadge}>
            {currentTeam?.name}
          </Badge>
          <View style={styles.handoffRule}>
            <RoundIcon name={meta.icon} size={15} color={colors.muted} />
            <Text style={styles.handoffRuleText}>
              {t(meta.verb).toLowerCase()} / {t(meta.tagline)}
            </Text>
          </View>
        </View>

        <View style={styles.handoffStandings}>
          <Standings standings={standings} compact title={t('play.standingsAfter', { n: state.currentRound })} centerTitle />
        </View>
      </Screen>
    );
  }

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
          <Text style={styles.turnPointsLabel}>{t('play.guessed')}</Text>
        </View>
      </View>

      <View style={styles.playTop}>
        <View style={styles.timerRow}>
          <View style={[styles.timerRing, urgent && styles.timerRingUrgent, urgentCritical && styles.timerRingCritical]}>
            <Animated.Text style={[styles.timerText, urgent && styles.timerTextUrgent, urgent && { transform: [{ scale: pulse }] }]}>
              {formatTime(remaining)}
            </Animated.Text>
            <Text style={styles.timerUnit}>{t('play.seconds')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.wordBox}>
        <Text style={styles.wordLabel}>{t('play.wordLabel')}</Text>
        <Text style={styles.word} numberOfLines={3} adjustsFontSizeToFit>
          {state.currentWord ?? '—'}
        </Text>
        <Text style={styles.wordRule}>{t(meta.verb)}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          label={t('play.good')}
          size="xl"
          variant="success"
          onPress={onCorrect}
          sound="correct"
          icon={<Check size={26} color="#04231A" />}
          style={styles.goedButton}
        />
        <View style={styles.actionRow}>
          <AppButton
            label={t('play.pass')}
            size="lg"
            variant="secondary"
            onPress={onPass}
            sound="decline"
            icon={<SkipForward size={20} color={colors.text} />}
            style={styles.actionPass}
          />
          <AppButton
            label={t('play.endTurn')}
            size="lg"
            variant="dangerOutline"
            onPress={endTurn}
            sound="decline"
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
  timerTextUrgent: { color: colors.danger },
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
