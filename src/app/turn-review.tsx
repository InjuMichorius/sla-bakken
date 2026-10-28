import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, ClipboardCheck, X } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { GameMenu } from '@/components/GameMenu';
import { Screen } from '@/components/Screen';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { useGameContext } from '@/game/GameProvider';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export default function TurnReviewScreen() {
  const { state, rejectGuess, continueTurn } = useGameContext();
  const { t } = useI18n();
  const [rejected, setRejected] = useState<Record<string, boolean>>({});

  // Bij een lege pot is de ronde geëindigd zonder END_TURN, dus de beurt is
  // dan nog niet opgeteld. Vastleggen bij openen, zodat afkeuren de lijst niet
  // van beurt laat verspringen.
  const [reviewTurn] = useState(() =>
    state.currentWord == null ? state.turnsThisRound : state.turnsThisRound - 1
  );
  const guesses = state.acceptedGuesses
    .filter((guess) => guess.round === state.currentRound && guess.turn === reviewTurn)
    .slice()
    .reverse();
  const approvedCount = guesses.filter((guess) => !rejected[guess.id]).length;

  const toggle = (id: string) => {
    haptics.light();
    setRejected((current) => ({ ...current, [id]: !current[id] }));
  };

  const proceed = () => {
    guesses.forEach((guess) => {
      if (rejected[guess.id]) rejectGuess(guess.id);
    });
    haptics.medium();
    continueTurn();
  };

  return (
    <Screen
      topBar={
        <>
          <TeamScoreboard />
          <GameMenu />
        </>
      }
      footer={<AppButton label={t('turnReview.continue', { n: approvedCount })} size="xl" onPress={proceed} />}
      contentStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.icon}>
          <ClipboardCheck size={30} color={colors.accent} />
        </View>
        <Text style={styles.title}>{t('turnReview.title')}</Text>
        <Text style={styles.subtitle}>{t('turnReview.subtitle')}</Text>
      </View>

      {guesses.length > 0 ? (
        <View style={styles.list}>
          {guesses.map((guess) => {
            const isRejected = !!rejected[guess.id];
            return (
              <View key={guess.id} style={[styles.row, isRejected && styles.rowRejected]}>
                <Text style={styles.word} numberOfLines={2}>
                  {guess.word}
                </Text>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: !isRejected }}
                  accessibilityLabel={t('turnReview.toggleLabel', { word: guess.word })}
                  onPress={() => toggle(guess.id)}
                  style={({ pressed }) => [
                    styles.toggle,
                    isRejected ? styles.approveAction : styles.rejectAction,
                    pressed && styles.pressed,
                  ]}
                >
                  {isRejected ? (
                    <Check size={18} color={colors.success} strokeWidth={3} />
                  ) : (
                    <X size={18} color={colors.danger} strokeWidth={3} />
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('turnReview.empty')}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  header: { alignItems: 'center', gap: spacing.sm },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 197, 61, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowRejected: { borderColor: colors.danger },
  word: { color: colors.text, fontSize: 20, fontWeight: '900', flex: 1 },
  toggle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectAction: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  approveAction: { backgroundColor: colors.successSoft, borderColor: colors.success },
  pressed: { opacity: 0.75 },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  emptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
