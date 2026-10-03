import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowRight, RotateCcw } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Screen } from '@/components/Screen';
import { QuitGameButton } from '@/components/QuitGameButton';
import { TeamScoreboard } from '@/components/TeamScoreboard';
import { teamColor } from '@/game/colors';
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

  const color = teamColor(entry.teamIndex);

  if (stage === 'handoff') {
    return (
      <Screen
        topBar={
          <>
            <QuitGameButton />
            <RosterDots roster={roster} index={index} />
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
            icon={<ArrowRight size={20} color="#241A00" />}
          />
        }
      >
        <View style={styles.handoffBody}>
          <Text style={styles.handoffTitle}>Geef de telefoon aan</Text>
          <Avatar seed={`${entry.team.name} ${entry.player.name}`} name={entry.player.name} color={color} size={104} />
          <Text style={styles.handoffName}>{entry.player.name}</Text>
          <View style={[styles.teamTag, { borderColor: color }]}>
            <View style={[styles.teamDot, { backgroundColor: color }]} />
            <Text style={styles.teamTagText}>{entry.team.name}</Text>
          </View>
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

  const roll = (index: number) => {
    const used = [
      ...words.filter((w, i) => i !== index && w.trim().length > 0),
      ...state.wordEntries.filter((e) => e.playerId !== player.id).map((e) => e.word),
    ];
    setWords((prev) => prev.map((w, i) => (i === index ? pickRandomWord(used) : w)));
    haptics.light();
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
          <RosterDots roster={roster} index={index} />
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
        <Avatar seed={`${team.name} ${player.name}`} name={player.name} color={color} size={46} />
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
              placeholder={`Geheim woord ${i + 1}`}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={i === perPlayer - 1 ? 'done' : 'next'}
              style={[styles.input, noOutline, value.trim().length > 0 ? { borderColor: color } : null]}
            />
            <AppButton
              label=""
              accessibilityLabel={value.trim() ? `Opnieuw rollen voor woord ${i + 1}` : `Random woord voor veld ${i + 1}`}
              accessibilityHint="Vult dit veld met een willekeurig woord uit de woordenbank"
              iconOnly
              icon={<RotateCcw size={20} color={colors.text} />}
              variant="secondary"
              size="md"
              fullWidth={false}
              onPress={() => roll(i)}
              style={styles.rollButton}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

function RosterDots({ roster, index }: { roster: RosterEntry[]; index: number }) {
  return (
    <View style={styles.dots}>
      {roster.map((r, i) => (
        <View
          key={r.player.id}
          style={[
            styles.dot,
            { backgroundColor: i < index ? teamColor(r.teamIndex) : 'transparent' },
            i === index ? { borderColor: colors.accent, borderWidth: 2 } : { borderColor: colors.border, borderWidth: 1 },
          ]}
        />
      ))}
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
  teamTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  teamTagText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headText: { flex: 1 },
  headLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  headName: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  instruction: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  fields: { gap: spacing.md },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rollButton: { width: FIELD_SIZE, height: FIELD_SIZE, borderRadius: FIELD_SIZE / 2, paddingHorizontal: 0 },
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
  footerHint: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
