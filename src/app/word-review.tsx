import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Undo2 } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { BackFooter } from '@/components/BackFooter';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Screen } from '@/components/Screen';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { useGameContext } from '@/game/GameProvider';
import type { AcceptedGuess } from '@/game/types';
import { translateDefaultPlayerName, useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export default function WordReviewScreen() {
  const { state, rejectGuess } = useGameContext();
  const { t, language } = useI18n();
  const [pending, setPending] = useState<AcceptedGuess | null>(null);

  const guesses = state.acceptedGuesses.filter((guess) => guess.round === state.currentRound).slice().reverse();

  useEffect(() => {
    if (state.phase === 'playing' || state.phase === 'handoff') return;
    if (router.canGoBack()) router.back();
    else router.replace('/play');
  }, [state.phase]);

  const confirmReject = () => {
    if (!pending) return;
    haptics.warning();
    rejectGuess(pending.id);
    setPending(null);
  };

  return (
    <Screen
      topBar={<TeamScoreboard />}
      title={t('wordReview.title')}
      subtitle={t('wordReview.subtitle')}
      footer={<BackFooter to="/play" />}
      contentStyle={styles.content}
    >
      <Text style={styles.round}>{t('wordReview.round', { n: state.currentRound })}</Text>

      {guesses.length > 0 ? (
        <View style={styles.list}>
          {guesses.map((guess) => {
            const team = state.teams.find((entry) => entry.id === guess.teamId);
            return (
              <View key={guess.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.word} numberOfLines={2}>
                    {guess.word}
                  </Text>
                  <Text style={styles.score}>+1</Text>
                </View>
                <View style={styles.meta}>
                  <View style={[styles.dot, { backgroundColor: team?.color ?? colors.muted }]} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {guess.teamName} · {translateDefaultPlayerName(guess.playerName, language)}
                  </Text>
                </View>
                <AppButton
                  label={t('wordReview.reject')}
                  variant="dangerOutline"
                  size="sm"
                  fullWidth={false}
                  sound="decline"
                  onPress={() => {
                    haptics.light();
                    setPending(guess);
                  }}
                  accessibilityLabel={t('wordReview.rejectLabel', { word: guess.word })}
                  icon={<Undo2 size={16} color={colors.danger} />}
                  style={styles.rejectButton}
                />
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Undo2 size={28} color={colors.muted} />
          </View>
          <Text style={styles.emptyText}>{t('wordReview.empty')}</Text>
        </View>
      )}

      <ConfirmDialog
        visible={pending !== null}
        title={t('wordReview.confirmTitle')}
        message={pending ? t('wordReview.confirmMessage', { word: pending.word, team: pending.teamName }) : ''}
        confirmLabel={t('wordReview.confirm')}
        destructive
        onConfirm={confirmReject}
        onCancel={() => setPending(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  round: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  word: { color: colors.text, fontSize: 22, fontWeight: '900', flex: 1 },
  score: { color: colors.danger, fontSize: 18, fontWeight: '900' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  metaText: { color: colors.muted, fontSize: 13, fontWeight: '700', flex: 1 },
  rejectButton: { alignSelf: 'flex-start', marginTop: spacing.xs },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
