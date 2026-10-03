import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { Badge } from '@/components/Badge';
import { RoundIcon } from '@/components/RoundIcon';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { Standings } from '@/components/Standings';
import { ROUNDS } from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

export default function RoundIntroScreen() {
  const { state, standings, totalWords, startRound } = useGameContext();
  const meta = ROUNDS.find((r) => r.number === state.currentRound) ?? ROUNDS[0];
  const previousRound = state.currentRound - 1;
  const previousDone = previousRound > 0 && state.roundResults.some((r) => r.round === previousRound && r.completed);

  const begin = () => {
    haptics.medium();
    startRound(meta.number);
  };

  return (
    <Screen
      topBar={<QuitGameButton />}
      scroll={false}
      contentStyle={styles.content}
      footer={<AppButton label={`Start ronde ${meta.number}`} size="xl" onPress={begin} />}
    >
      <View style={styles.top}>
        <View style={styles.eyebrowRow}>
          <Badge tone="accent">Ronde {meta.number} van 3</Badge>
          <Badge tone="muted">{totalWords} woorden in de pot</Badge>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <RoundIcon name={meta.icon} size={34} />
          </View>
          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.verb}>{meta.verb}</Text>
        </View>

        <View style={styles.rules}>
          {meta.rules.map((rule, i) => (
            <View key={rule} style={styles.ruleRow}>
              <View style={styles.ruleIndex}>
                <Text style={styles.ruleIndexText}>{i + 1}</Text>
              </View>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {previousDone ? (
          <View style={styles.review}>
            <Text style={styles.reviewTitle}>Ronde {previousRound} afgelopen — tussenstand</Text>
            <Standings standings={standings} compact />
          </View>
        ) : (
          <View style={styles.review}>
            <Text style={styles.reviewTitle}>Hoe een beurt werkt</Text>
            <Text style={styles.reviewBody}>
              De beurt wisselt telkens van team; binnen een team komen de spelers om de beurt. Elke speler krijgt {state.turnSeconds} seconden. Elk goed
              geraad woord is één punt voor het team. Bij <Text style={styles.strong}>Pas</Text> gaat het woord terug in de pot zonder punt. De ronde stopt
              zodra de pot leeg is.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  top: { gap: spacing.lg, flex: 1, justifyContent: 'center' },
  eyebrowRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  hero: { alignItems: 'center', gap: spacing.sm },
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
  verb: { color: colors.accent, fontSize: 16, fontWeight: '700' },
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
  reviewBody: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  strong: { color: colors.text, fontWeight: '800' },
});
