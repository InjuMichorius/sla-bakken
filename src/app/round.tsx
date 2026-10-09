import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Badge } from '@/components/Badge';
import { RoundIcon } from '@/components/RoundIcon';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { Standings } from '@/components/Standings';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export default function RoundIntroScreen() {
  const { state, standings, totalWords, startRound } = useGameContext();
  const { t } = useI18n();
  const meta = ROUNDS.find((r) => r.number === state.currentRound) ?? ROUNDS[0];
  const previousRound = state.currentRound - 1;
  const previousDone = previousRound > 0 && state.roundResults.some((r) => r.round === previousRound && r.completed);

  const begin = () => {
    haptics.medium();
    startRound(meta.number);
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
      footer={<AppButton label={t('round.start', { n: meta.number })} size="xl" onPress={begin} />}
    >
      <View style={styles.top}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <RoundIcon name={meta.icon} size={34} />
          </View>
          <Text style={styles.title}>{t(meta.title)}</Text>
          <Badge tone="muted" style={styles.potBadge}>
            {t('round.wordsInPot', { n: totalWords })}
          </Badge>
        </View>

        <View style={styles.rules}>
          {meta.rules.map((rule, i) => (
            <View key={rule} style={styles.ruleRow}>
              <View style={styles.ruleIndex}>
                <Text style={styles.ruleIndexText}>{i + 1}</Text>
              </View>
              <Text style={styles.ruleText}>{t(rule)}</Text>
            </View>
          ))}
        </View>

        {previousDone ? (
          <View style={styles.review}>
            <Text style={styles.reviewTitle}>{t('round.previousTitle', { n: previousRound })}</Text>
            <Standings standings={standings} compact />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  top: { gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.sm },
  potBadge: { alignSelf: 'center' },
  heroIcon: {
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
  title: { color: colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
  rules: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  ruleRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  ruleIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleIndexText: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  ruleText: { color: colors.text, fontSize: 14, lineHeight: 20, flex: 1 },
  review: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  reviewTitle: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
});
