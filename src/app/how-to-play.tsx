import { StyleSheet, Text, View } from 'react-native';
import { BackButton } from '@/components/BackButton';
import { BackFooter } from '@/components/BackFooter';
import { RoundIcon } from '@/components/RoundIcon';
import { Screen } from '@/components/Screen';
import { ROUNDS } from '@/game/constants';
import { colors, radius, spacing } from '@/theme';

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Teams instellen',
    body: 'Maak twee teams, geef ze een naam en een kleur en voeg minimaal twee spelers per team toe.',
  },
  {
    title: 'Woorden invoeren',
    body: 'Iedere speler vult in het geheim woorden in voor zijn of haar eigen team. De telefoon gaat daarbij rond, zodat niemand andermans woorden ziet.',
  },
  {
    title: 'Drie rondes spelen',
    body: 'Elke ronde gebruikt alle woorden opnieuw. Per beurt draait het om één woord en een timer.',
  },
  {
    title: 'Winnaar bepalen',
    body: 'Na de derde ronde wint het team met de meeste punten. Bij gelijkspel winnen alle teams met de hoogste score.',
  },
];

const TURN_ACTIONS = [
  { label: 'Goed', tone: 'success', body: 'Het woord is geraden: +1 punt. Het volgende woord verschijnt meteen.' },
  { label: 'Pas', tone: 'muted', body: 'Niet geraden? Het woord gaat terug in de pot en de timer loopt door.' },
  { label: 'Beurt stoppen', tone: 'danger', body: 'De beurt eindigt vroeg; het open woord gaat terug in de pot.' },
] as const;

export default function HowToPlayScreen() {
  return (
    <Screen
      topBar={
        <>
          <BackButton />
          <Text style={styles.headerTitle}>Speluitleg</Text>
          <View style={styles.topBarSide} />
        </>
      }
      footer={<BackFooter />}
      contentStyle={styles.content}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Het idee</Text>
        <Text style={styles.body}>
          Jullie spelen met één gedeelde telefoon. Twee teams nemen om de beurt een beurt, waarin de speler aan de beurt zo veel mogelijk woorden
          probeert te raden binnen de tijd. Na drie rondes met een eigen opdracht telt alleen het totaal aantal geraden woorden.
        </Text>
      </View>

      <Text style={styles.section}>Zo speel je</Text>
      <View style={styles.card}>
        {STEPS.map((step, index) => (
          <View key={step.title} style={[styles.stepRow, index === STEPS.length - 1 && styles.stepRowLast]}>
            <View style={styles.stepIndex}>
              <Text style={styles.stepIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.section}>De drie rondes</Text>
      <View style={styles.card}>
        {ROUNDS.map((round, index) => (
          <View key={round.number} style={[styles.roundBlock, index > 0 && styles.roundBlockSpaced]}>
            <View style={styles.roundHead}>
              <RoundIcon name={round.icon} size={18} />
              <Text style={styles.roundTitle}>
                {round.number}. {round.title}
              </Text>
              <Text style={styles.roundTag}>{round.tagline}</Text>
            </View>
            {round.rules.map((rule) => (
              <View key={rule} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.body}>{rule}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Text style={styles.section}>Een beurt</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          Eerst zie je “Geef de telefoon aan”. Pas als de speler op <Text style={styles.strong}>Start beurt</Text> drukt, gaat de timer lopen. Het
          woord staat groot in beeld; in de laatste tien seconden tikt de timer en bij nul stopt de beurt vanzelf.
        </Text>
        <View style={styles.divider} />
        {TURN_ACTIONS.map((action) => (
          <View key={action.label} style={styles.actionRow}>
            <View
              style={[
                styles.actionPill,
                action.tone === 'success' && styles.actionPillSuccess,
                action.tone === 'danger' && styles.actionPillDanger,
              ]}
            >
              <Text
                style={[
                  styles.actionLabel,
                  action.tone === 'success' && { color: colors.success },
                  action.tone === 'danger' && { color: colors.danger },
                ]}
              >
                {action.label}
              </Text>
            </View>
            <Text style={[styles.body, styles.actionBody]}>{action.body}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Punten</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          Elk goed geraden woord levert het team <Text style={styles.strong}>exact één punt</Text> op. Er zijn geen bonussen voor snelheid en “Pas”
          kost geen punt. De scores lopen door over de rondes heen: na elke ronde zie je de tussenstand, na ronde 3 de eindstand.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  topBarSide: { width: 44 },
  section: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  strong: { color: colors.text, fontWeight: '800' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  stepRow: { flexDirection: 'row', gap: spacing.md, paddingBottom: spacing.md },
  stepRowLast: { paddingBottom: 0 },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: { color: colors.accent, fontSize: 12, fontWeight: '900' },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },

  roundBlock: { gap: spacing.xs },
  roundBlockSpaced: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  roundHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  roundTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  roundTag: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: 8 },

  actionRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  actionPill: {
    minWidth: 104,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionPillSuccess: { borderColor: 'rgba(52, 211, 153, 0.4)', backgroundColor: colors.successSoft },
  actionPillDanger: { borderColor: 'rgba(248, 113, 113, 0.4)', backgroundColor: colors.dangerSoft },
  actionLabel: { color: colors.text, fontSize: 13, fontWeight: '800' },
  actionBody: { flex: 1 },
});
