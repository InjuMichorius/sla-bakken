import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { CircleArrowRight, Check, RefreshCcw } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { useGameContext } from '@/game/GameProvider';
import type { Player, Team } from '@/game/types';
import { pickRandomWord } from '@/game/randomWord';
import type { RosterEntry } from '@/game/useGame';
import { haptics } from '@/lib/haptics';
import { colors, noOutline, radius, spacing } from '@/theme';

const emptyWords = (count: number): string[] => Array.from({ length: count }, () => '');

const FIELD_SIZE = 52;

export default function WordEntryScreen() {
  const { roster, startGame } = useGameContext();
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<'handoff' | 'entry'>('handoff');

  const entry = roster[index];

  if (!entry) {
    return (
      <Screen topBar={<TeamScoreboard />} scroll={false} contentStyle={styles.centered}>
        <Text style={styles.muted}>Iedereen heeft zijn woorden ingevoerd.</Text>
        <AppButton label="Naar de regels" size="lg" onPress={startGame} />
      </Screen>
    );
  }

  const color = entry.team.color;

  if (stage === 'handoff') {
    return (
      <Screen
        topBar={
          <>
            <QuitGameButton />
            <RosterDots roster={roster} index={index} currentFill={0.5} />
            <TeamScoreboard />
          </>
        }
        scroll={false}
        contentStyle={styles.handoffContent}
        footer={
          <AppButton
            label="Ik heb de telefoon"
            size="lg"
            onPress={() => {
              haptics.light();
              setStage('entry');
            }}
            icon={<CircleArrowRight size={20} color="#241A00" />}
          />
        }
      >
        <View style={styles.handoffBody}>
          <Text style={styles.handoffTitle}>Geef de telefoon aan</Text>
          <Avatar name={entry.player.name} color={color} size={104} />
          <Text style={styles.handoffName}>{entry.player.name}</Text>
          <Badge color={color} style={styles.teamBadge}>
            {entry.team.name}
          </Badge>
        </View>
      </Screen>
    );
  }

  return (
    <PlayerWordForm
      key={entry.player.id}
      team={entry.team}
      player={entry.player}
      color={color}
      position={index + 1}
      isLast={index === roster.length - 1}
      roster={roster}
      index={index}
      onSave={() => {
        if (index === roster.length - 1) {
          startGame();
          return;
        }
        setIndex((i) => i + 1);
        setStage('handoff');
      }}
    />
  );
}

type PlayerWordFormProps = {
  team: Team;
  player: Player;
  color: string;
  position: number;
  isLast: boolean;
  roster: RosterEntry[];
  index: number;
  onSave: () => void;
};

function PlayerWordForm({ team, player, color, position, isLast, roster, index, onSave }: PlayerWordFormProps) {
  const { state, setPlayerWords } = useGameContext();
  const inputs = useRef<(TextInput | null)[]>([]);
  const perPlayer = state.wordsPerPlayer;
  const [words, setWords] = useState<string[]>(() => {
    const saved = state.wordEntries.filter((e) => e.playerId === player.id).map((e) => e.word);
    const next = emptyWords(state.wordsPerPlayer);
    saved.forEach((word, i) => {
      if (i < state.wordsPerPlayer) next[i] = word;
    });
    return next;
  });

  const filled = words.filter((w) => w.trim().length > 0).length;
  const missing = Math.max(0, perPlayer - filled);
  const [focused, setFocused] = useState<number | null>(null);

  const roll = (index: number) => {
    const used = [
      ...words.filter((w, i) => i !== index && w.trim().length > 0),
      ...state.wordEntries.filter((e) => e.playerId !== player.id).map((e) => e.word),
    ];
    setWords((prev) => prev.map((w, i) => (i === index ? pickRandomWord(used) : w)));
    haptics.light();
  };

  /** The check commits this word: on to the next field, or close the keyboard on the last one. */
  const confirm = (index: number) => {
    haptics.light();
    const next = inputs.current[index + 1];
    if (next) next.focus();
    else inputs.current[index]?.blur();
  };

  const save = () => {
    setPlayerWords(team.id, player.id, words);
    haptics.success();
    onSave();
  };

  return (
    <Screen
      topBar={
        <>
          <QuitGameButton />
          <RosterDots roster={roster} index={index} currentFill={1} />
          <TeamScoreboard />
        </>
      }
      footer={
        <>
          <AppButton
            label={isLast ? 'Opslaan & naar de regels' : 'Opslaan & volgende speler'}
            size="lg"
            onPress={save}
            disabled={filled === 0}
          />
          <Text style={styles.footerHint}>
            {missing === 0
              ? 'Alles ingevuld, je kunt doorgaan.'
              : `Nog ${missing} woord${missing === 1 ? '' : 'en'} te gaan (minimaal 1 woord nodig).`}
          </Text>
        </>
      }
    >
      <View style={styles.headRow}>
        <Avatar name={player.name} color={color} size={46} />
        <View style={styles.headText}>
          <Text style={styles.headLabel}>Aan de beurt</Text>
          <Text style={styles.headName} numberOfLines={1}>
            {player.name}
          </Text>
        </View>
        <Badge tone={filled === 0 ? 'danger' : filled === perPlayer ? 'success' : 'accent'}>
          {filled}/{perPlayer}
        </Badge>
      </View>

      <Text style={styles.instruction}>
        Bedenk {perPlayer} willekeurige woorden. Je team gaat ze straks proberen te raden.
      </Text>

      <View style={styles.fields}>
        {words.map((value, i) => (
          <View key={i} style={styles.fieldRow}>
            <Text style={styles.indexText}>{i + 1}</Text>
            <TextInput
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={value}
              onChangeText={(text) => setWords((prev) => prev.map((w, idx) => (idx === i ? text : w)))}
              onSubmitEditing={() => {
                const next = inputs.current[i + 1];
                if (next) next.focus();
                else save();
              }}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused((current) => (current === i ? null : current))}
              selectTextOnFocus
              selectionColor={colors.accent}
              placeholder={`Geheim woord ${i + 1}`}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={i === perPlayer - 1 ? 'done' : 'next'}
              style={[styles.input, noOutline, focused === i && styles.inputFocused]}
            />
            {focused === i ? (
              <AppButton
                label=""
                accessibilityLabel={`Woord ${i + 1} bevestigen`}
                accessibilityHint="Slaat dit woord op en gaat naar het volgende veld"
                iconOnly
                icon={<Check size={20} color="#241A00" strokeWidth={3} />}
                size="md"
                fullWidth={false}
                onPress={() => confirm(i)}
                style={styles.fieldAction}
              />
            ) : (
              <AppButton
                label=""
                accessibilityLabel={value.trim() ? `Opnieuw rollen voor woord ${i + 1}` : `Random woord voor veld ${i + 1}`}
                accessibilityHint="Vult dit veld met een willekeurig woord uit de woordenbank"
                iconOnly
                icon={<RefreshCcw size={20} color={colors.text} />}
                variant="secondary"
                size="md"
                fullWidth={false}
                onPress={() => roll(i)}
                style={styles.fieldAction}
              />
            )}
          </View>
        ))}
      </View>
    </Screen>
  );
}

/**
 * One dot per player in the roster. Every player takes two steps: handing the
 * phone over counts as half, picking the words as a full one. So the current
 * player's dot sits at half on the handoff screen and fills up on the form.
 * A half dot is split vertically, like a pie chart, so the next player is easy
 * to spot in the row.
 */
function RosterDots({ roster, index, currentFill }: { roster: RosterEntry[]; index: number; currentFill: number }) {
  return (
    <View
      style={styles.dots}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Speler ${index + 1} van ${roster.length}`}
    >
      {roster.map((r, i) => {
        const fill = i < index ? 1 : i > index ? 0 : currentFill;
        return (
          <View key={r.player.id} style={[styles.dot, i === index && styles.dotCurrent, fill === 1 && styles.dotFull]}>
            {fill > 0 && fill < 1 ? <View style={[styles.dotFill, { width: `${fill * 100}%` }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  muted: { color: colors.muted, fontSize: 15, marginBottom: spacing.lg },
  handoffContent: { justifyContent: 'flex-start', gap: spacing.xl },
  handoffBody: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: spacing.lg, paddingTop: spacing.xl },
  handoffTitle: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center' },
  handoffName: { color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  /** Badge stretches to the start by default, which breaks the centred handoff column. */
  teamBadge: { alignSelf: 'center' },
  dots: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  dotCurrent: { borderWidth: 2, borderColor: colors.accent },
  dotFull: { backgroundColor: colors.accent },
  /** Half fill splits the dot vertically, so the halves read as pie slices. */
  dotFill: { position: 'absolute', top: 0, bottom: 0, left: 0, backgroundColor: colors.accent },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headText: { flex: 1 },
  headLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  headName: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  instruction: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  fields: { gap: spacing.md },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fieldAction: { width: FIELD_SIZE, height: FIELD_SIZE, borderRadius: FIELD_SIZE / 2, paddingHorizontal: 0 },
  indexText: { width: 16, color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  input: {
    flex: 1,
    height: FIELD_SIZE,
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputFocused: { borderColor: colors.accent },
  footerHint: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
