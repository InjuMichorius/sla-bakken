import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import {
  MAX_WORDS_PER_PLAYER,
  MIN_WORDS_PER_PLAYER,
  ROUNDS,
  TURN_SECONDS_OPTIONS,
} from '@/game/constants';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

/** Instellingenkaart: woorden per speler, tijd per beurt en de drie rondes. */
export function GameSettingsCard({
  wordsPerPlayer,
  turnSeconds,
  onWords,
  onSeconds,
}: {
  wordsPerPlayer: number;
  turnSeconds: number;
  onWords: (count: number) => void;
  onSeconds: (seconds: number) => void;
}) {
  const { t } = useI18n();
  const bumpWords = (delta: number) => {
    haptics.light();
    onWords(wordsPerPlayer + delta);
  };

  return (
    <View style={styles.card}>
      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>{t('gamecard.wordsPerPlayer')}</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => bumpWords(-1)}
            disabled={wordsPerPlayer <= MIN_WORDS_PER_PLAYER}
            accessibilityRole="button"
            accessibilityLabel={t('gamecard.oneLess')}
            style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
          >
            <Minus size={20} color={wordsPerPlayer <= MIN_WORDS_PER_PLAYER ? colors.border : colors.text} />
          </Pressable>
          <Text style={styles.stepperValue}>{wordsPerPlayer}</Text>
          <Pressable
            onPress={() => bumpWords(1)}
            disabled={wordsPerPlayer >= MAX_WORDS_PER_PLAYER}
            accessibilityRole="button"
            accessibilityLabel={t('gamecard.oneMore')}
            style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
          >
            <Plus size={20} color={wordsPerPlayer >= MAX_WORDS_PER_PLAYER ? colors.border : colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.settingBlock}>
        <Text style={styles.settingLabel}>{t('gamecard.turnSeconds')}</Text>
        <View style={styles.secondsRow}>
          {TURN_SECONDS_OPTIONS.map((seconds) => {
            const active = seconds === turnSeconds;
            return (
              <Pressable
                key={seconds}
                onPress={() => {
                  haptics.light();
                  onSeconds(seconds);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [styles.secondsChip, active && styles.secondsChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.secondsChipText, active && styles.secondsChipTextActive]}>{seconds}s</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.settingBlock}>
        <Text style={styles.settingLabel}>{t('gamecard.theRounds')}</Text>
        <View style={styles.rounds}>
          {ROUNDS.map((round) => (
            <View key={round.number} style={styles.roundRow}>
              <Text style={styles.roundNumber}>{round.number}</Text>
              <Text style={styles.roundTitle}>{t(round.title)}</Text>
              <Text style={styles.roundVerb}>{t(round.verb)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingBlock: { gap: spacing.sm },
  settingText: { flex: 1, gap: 2 },
  settingLabel: { color: colors.text, fontSize: 17, fontWeight: '800' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepperValue: { color: colors.accent, fontSize: 22, fontWeight: '900', minWidth: 34, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
  secondsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  secondsChip: {
    minWidth: 58,
    minHeight: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  secondsChipActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  secondsChipText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  secondsChipTextActive: { color: '#241A00' },

  rounds: { gap: spacing.sm },
  roundRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  roundNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
    overflow: 'hidden',
  },
  roundTitle: { color: colors.text, fontSize: 15, fontWeight: '800', minWidth: 110 },
  roundVerb: { color: colors.muted, fontSize: 13, flex: 1 },
  pressed: { opacity: 0.7 },
});
