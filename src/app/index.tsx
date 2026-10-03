import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, SquarePen, Trash, UserPlus } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { Screen } from '@/components/Screen';
import { teamColor } from '@/game/colors';
import {
  MAX_PLAYER_NAME_LENGTH,
  MAX_TEAM_NAME_LENGTH,
  MAX_WORDS_PER_PLAYER,
  MIN_PLAYERS_PER_TEAM,
  MIN_WORDS_PER_PLAYER,
  ROUNDS,
  TURN_SECONDS_OPTIONS,
} from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import type { Team } from '@/game/types';
import { haptics } from '@/lib/haptics';
import { colors, noOutline, radius, spacing } from '@/theme';

const TOTAL_STEPS = 3;

export default function SetupScreen() {
  const {
    state,
    teams,
    canProceed,
    ensureDefaultTeams,
    renameTeam,
    addPlayer,
    renamePlayer,
    removePlayer,
    setTurnSeconds,
    setWordsPerPlayer,
    startWordEntry,
  } = useGameContext();
  const [step, setStep] = useState(0);
  const lastStep = TOTAL_STEPS - 1;
  const currentTeam = teams[step];

  useEffect(() => {
    if (teams.length === 0) ensureDefaultTeams();
  }, [teams.length, ensureDefaultTeams]);

  const isLastStep = step >= lastStep;
  const goNext = () => {
    haptics.light();
    setStep((s) => Math.min(lastStep, s + 1));
  };
  const goBack = () => {
    haptics.light();
    setStep((s) => Math.max(0, s - 1));
  };

  const start = () => {
    if (!canProceed) return;
    haptics.success();
    startWordEntry();
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footerRow}>
          {step > 0 ? (
            <AppButton label="Terug" variant="ghost" size="lg" onPress={goBack} fullWidth={false} icon={<ArrowLeft size={18} color={colors.muted} />} />
          ) : null}
          <View style={styles.footerGrow}>
            {isLastStep ? (
              <AppButton label="Start het spel" size="lg" onPress={start} disabled={!canProceed} icon={<ArrowRight size={18} color="#241A00" />} />
            ) : (
              <AppButton label="Volgende" size="lg" onPress={goNext} icon={<ArrowRight size={18} color="#241A00" />} />
            )}
          </View>
        </View>
      }
      topBar={
        <View style={styles.steps}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View key={i} style={styles.stepTrack}>
              <View style={[styles.stepDot, i <= step && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                {i < step ? (
                  <Check size={14} color="#241A00" strokeWidth={3} />
                ) : (
                  <Text style={[styles.stepDotText, i === step && styles.stepDotTextActive]}>{i + 1}</Text>
                )}
              </View>
              {i < TOTAL_STEPS - 1 ? <View style={[styles.stepLine, i < step && { backgroundColor: colors.accent }]} /> : null}
            </View>
          ))}
        </View>
      }
    >

      {isLastStep ? (
        <>
          <View style={styles.headingRow}>
            <Text style={styles.heading}>Instellingen</Text>
          </View>
          <SettingsCard wordsPerPlayer={state.wordsPerPlayer} turnSeconds={state.turnSeconds} onWords={setWordsPerPlayer} onSeconds={setTurnSeconds} />
        </>
      ) : currentTeam ? (
        <TeamCard
          key={currentTeam.id}
          team={currentTeam}
          index={step}
          onRename={(name) => renameTeam(currentTeam.id, name)}
          onRenamePlayer={(playerId, name) => renamePlayer(currentTeam.id, playerId, name)}
          onRemovePlayer={(playerId) => removePlayer(currentTeam.id, playerId)}
          onAddPlayer={() => addPlayer(currentTeam.id, `Speler ${currentTeam.players.length + 1}`)}
        />
      ) : null}
    </Screen>
  );
}

type TeamCardProps = {
  team: Team;
  index: number;
  onRename: (name: string) => void;
  onRenamePlayer: (playerId: string, name: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onAddPlayer: () => void;
};

function TeamCard({ team, index, onRename, onRenamePlayer, onRemovePlayer, onAddPlayer }: TeamCardProps) {
  const [editingTeam, setEditingTeam] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const color = teamColor(index);

  return (
    <View style={styles.teamBlock}>
      {editingTeam ? (
        <View style={styles.teamNameEditRow}>
          <NameInput
            initialValue={team.name}
            onCancel={() => setEditingTeam(false)}
            onSubmit={(name) => {
              onRename(name);
              setEditingTeam(false);
            }}
          />
        </View>
      ) : (
        <Pressable
          onPress={() => {
            haptics.light();
            setEditingTeam(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Teamnaam ${team.name} aanpassen`}
          style={({ pressed }) => [styles.teamNameRow, pressed && styles.pressed]}
        >
          <Text style={styles.heading} numberOfLines={1}>
            {team.name}
          </Text>
          <SquarePen size={19} color={colors.muted} />
        </Pressable>
      )}

      <View style={styles.players}>
        {team.players.map((player) => (
          <View key={player.id} style={[styles.playerPill, editingPlayerId === player.id && styles.playerPillEditing]}>
            {editingPlayerId === player.id ? (
              <NameInput
                framed={false}
                maxLength={MAX_PLAYER_NAME_LENGTH}
                initialValue={player.name}
                onCancel={() => setEditingPlayerId(null)}
                onSubmit={(name) => {
                  onRenamePlayer(player.id, name);
                  setEditingPlayerId(null);
                }}
              />
            ) : (
              <>
                <Avatar seed={`${team.name} ${player.name}`} name={player.name} color={color} size={40} />
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setEditingPlayerId(player.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Naam van ${player.name} aanpassen`}
                  style={({ pressed }) => [styles.playerNameWrap, pressed && styles.pressed]}
                >
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <SquarePen size={16} color={colors.muted} />
                </Pressable>
                {team.players.length > MIN_PLAYERS_PER_TEAM ? (
                  <Pressable
                    onPress={() => onRemovePlayer(player.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${player.name} verwijderen`}
                    style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                  >
                    <Trash size={16} color={colors.accent} />
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        ))}

        <Pressable
          onPress={() => {
            haptics.light();
            onAddPlayer();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Speler toevoegen aan ${team.name}`}
          style={({ pressed }) => [styles.addPlayer, pressed && styles.pressed]}
        >
          <UserPlus size={18} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.addPlayerText}>Speler toevoegen</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NameInput({
  initialValue,
  onSubmit,
  onCancel,
  framed = true,
  maxLength = MAX_TEAM_NAME_LENGTH,
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  framed?: boolean;
  maxLength?: number;
}) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = () => {
    const next = value.trim();
    if (next) onSubmit(next);
    else onCancel();
  };

  return (
    <View style={styles.editRow}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        onBlur={submit}
        autoCapitalize="words"
        returnKeyType="done"
        maxLength={maxLength}
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.editInput, noOutline, framed && styles.editInputFramed]}
      />
      <Pressable onPress={submit} accessibilityRole="button" accessibilityLabel="Opslaan" style={({ pressed }) => [styles.editOk, pressed && styles.pressed]}>
        <Check size={18} color="#241A00" strokeWidth={3} />
      </Pressable>
    </View>
  );
}

function SettingsCard({
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
  const bumpWords = (delta: number) => {
    haptics.light();
    onWords(wordsPerPlayer + delta);
  };

  return (
    <View style={styles.card}>
      <View style={styles.settingRow}>
        <View style={styles.settingText}>
          <Text style={styles.settingLabel}>Woorden per speler</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => bumpWords(-1)}
            disabled={wordsPerPlayer <= MIN_WORDS_PER_PLAYER}
            accessibilityRole="button"
            accessibilityLabel="Eén woord minder"
            style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
          >
            <Minus size={20} color={wordsPerPlayer <= MIN_WORDS_PER_PLAYER ? colors.border : colors.text} />
          </Pressable>
          <Text style={styles.stepperValue}>{wordsPerPlayer}</Text>
          <Pressable
            onPress={() => bumpWords(1)}
            disabled={wordsPerPlayer >= MAX_WORDS_PER_PLAYER}
            accessibilityRole="button"
            accessibilityLabel="Eén woord meer"
            style={({ pressed }) => [styles.stepperButton, pressed && styles.pressed]}
          >
            <Plus size={20} color={wordsPerPlayer >= MAX_WORDS_PER_PLAYER ? colors.border : colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.settingBlock}>
        <Text style={styles.settingLabel}>Tijd per beurt</Text>
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
        <Text style={styles.settingLabel}>De drie rondes</Text>
        <View style={styles.rounds}>
          {ROUNDS.map((round) => (
            <View key={round.number} style={styles.roundRow}>
              <Text style={styles.roundNumber}>{round.number}</Text>
              <Text style={styles.roundTitle}>{round.title}</Text>
              <Text style={styles.roundVerb}>{round.verb}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  steps: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepTrack: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerPillEditing: { borderColor: colors.accent },
  stepDotText: { color: colors.muted, fontSize: 13, fontWeight: '900' },
  stepDotTextActive: { color: '#241A00' },
  stepLine: { width: 56, height: 2, borderRadius: 1, backgroundColor: colors.border },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },

  teamBlock: { gap: spacing.lg },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  teamNameEditRow: { width: '100%', maxWidth: 360, alignSelf: 'center' },
  headingRow: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  heading: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.7 },

  players: { gap: spacing.sm },
  playerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    minHeight: 56,
  },
  playerNameWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  playerName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  addPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 50,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  addPlayerText: { color: 'rgba(255, 255, 255, 0.72)', fontSize: 15, fontWeight: '400' },

  editRow: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editInput: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  editInputFramed: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  editOk: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
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

  footerRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  footerGrow: { flex: 1 },
  pressed: { opacity: 0.7 },
});