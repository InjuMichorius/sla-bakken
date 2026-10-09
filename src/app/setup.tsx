import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { CircleArrowLeft, CircleArrowRight, Check, Lock, SquarePen, Trash, UserPlus } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { GameSettingsCard } from '@/components/GameSettingsCard';
import { Screen } from '@/components/Screen';
import { TEAM_COLORS } from '@/game/colors';
import {
  MAX_PLAYER_NAME_LENGTH,
  MAX_TEAM_NAME_LENGTH,
  MIN_PLAYERS_PER_TEAM,
} from '@/game/constants';
import { useGameContext } from '@/game/GameProvider';
import { isNameTaken } from '@/game/names';
import type { Team } from '@/game/types';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, noOutline, radius, spacing } from '@/theme';

const TOTAL_STEPS = 3;

export default function SetupScreen() {
  const { t } = useI18n();
  const {
    state,
    teams,
    canProceed,
    ensureDefaultTeams,
    renameTeam,
    setTeamColor,
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
  const teamCardRef = useRef<{ commit: () => void }>(null);

  useEffect(() => {
    if (teams.length === 0) ensureDefaultTeams();
  }, [teams.length, ensureDefaultTeams]);

  const isLastStep = step >= lastStep;
  const commitPendingEdit = () => teamCardRef.current?.commit();
  const goNext = () => {
    haptics.light();
    commitPendingEdit();
    setStep((s) => Math.min(lastStep, s + 1));
  };
  const goBack = () => {
    haptics.light();
    commitPendingEdit();
    setStep((s) => Math.max(0, s - 1));
  };

  const goMenu = () => {
    haptics.light();
    commitPendingEdit();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const start = () => {
    if (!canProceed) return;
    haptics.success();
    commitPendingEdit();
    startWordEntry();
  };

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footerRow}>
          <AppButton
            label={t('common.back')}
            variant="ghost"
            size="lg"
            onPress={step === 0 ? goMenu : goBack}
            fullWidth={false}
            sound="decline"
            icon={<CircleArrowLeft size={18} color={colors.muted} />}
          />
          <View style={styles.footerGrow}>
            {isLastStep ? (
              <AppButton label={t('setup.startGame')} size="lg" onPress={start} disabled={!canProceed} icon={<CircleArrowRight size={18} color="#241A00" />} />
            ) : (
              <AppButton label={t('setup.next')} size="lg" onPress={goNext} icon={<CircleArrowRight size={18} color="#241A00" />} />
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
            <Text style={styles.heading}>{t('setup.heading')}</Text>
          </View>
          <GameSettingsCard wordsPerPlayer={state.wordsPerPlayer} turnSeconds={state.turnSeconds} onWords={setWordsPerPlayer} onSeconds={setTurnSeconds} />
        </>
      ) : currentTeam ? (
        <TeamCard
          ref={teamCardRef}
          key={currentTeam.id}
          team={currentTeam}
          otherTeams={teams.filter((t) => t.id !== currentTeam.id)}
          onRename={(name) => renameTeam(currentTeam.id, name)}
          onPickColor={(color) => setTeamColor(currentTeam.id, color)}
          onRenamePlayer={(playerId, name) => renamePlayer(currentTeam.id, playerId, name)}
          onRemovePlayer={(playerId) => removePlayer(currentTeam.id, playerId)}
          onAddPlayer={() => addPlayer(currentTeam.id, t('setup.playerDefault', { n: currentTeam.players.length + 1 }))}
        />
      ) : null}
    </Screen>
  );
}

type TeamCardProps = {
  team: Team;
  otherTeams: Team[];
  onRename: (name: string) => void;
  onPickColor: (color: string) => void;
  onRenamePlayer: (playerId: string, name: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onAddPlayer: () => string;
};

const TeamCard = forwardRef<{ commit: () => void }, TeamCardProps>(function TeamCard(
  { team, otherTeams, onRename, onPickColor, onRenamePlayer, onRemovePlayer, onAddPlayer },
  ref
) {
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamDraft, setTeamDraft] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerDraft, setPlayerDraft] = useState('');
  const { play } = useFeedback();
  const { t } = useI18n();
  const color = team.color;
  const otherTeamNames = otherTeams.map((t) => t.name);

  useImperativeHandle(
    ref,
    () => ({
      commit: () => {
        if (editingPlayerId != null) {
          const trimmed = playerDraft.trim();
          const taken = team.players.filter((p) => p.id !== editingPlayerId).map((p) => p.name);
          if (trimmed.length > 0 && !isNameTaken(trimmed, taken)) onRenamePlayer(editingPlayerId, trimmed);
          setPlayerDraft('');
          setEditingPlayerId(null);
        }
        if (editingTeam) {
          const trimmed = teamDraft.trim();
          if (trimmed.length > 0 && !isNameTaken(trimmed, otherTeamNames)) onRename(trimmed);
          setTeamDraft('');
          setEditingTeam(false);
        }
      },
    }),
    [editingPlayerId, playerDraft, editingTeam, teamDraft, otherTeamNames, team.players, onRenamePlayer, onRename]
  );

  const commitPlayerDraft = () => {
    if (editingPlayerId == null) return;
    const trimmed = playerDraft.trim();
    const taken = team.players.filter((p) => p.id !== editingPlayerId).map((p) => p.name);
    if (trimmed.length > 0 && !isNameTaken(trimmed, taken)) onRenamePlayer(editingPlayerId, trimmed);
    setPlayerDraft('');
    setEditingPlayerId(null);
  };

  const beginEditTeam = () => {
    haptics.light();
    setTeamDraft(team.name);
    setEditingTeam(true);
  };

  const beginEditPlayer = (playerId: string) => {
    haptics.light();
    commitPlayerDraft();
    setPlayerDraft(team.players.find((p) => p.id === playerId)?.name ?? '');
    setEditingPlayerId(playerId);
  };

  return (
    <View style={styles.teamBlock}>
      {editingTeam ? (
        <View style={styles.teamNameEditRow}>
          <View style={styles.teamNameEditPill}>
            <NameInput
              framed={false}
              value={teamDraft}
              onChangeText={setTeamDraft}
              takenNames={otherTeamNames}
              onCancel={() => {
                setTeamDraft('');
                setEditingTeam(false);
              }}
              onSubmit={(name) => {
                onRename(name);
                setTeamDraft('');
                setEditingTeam(false);
              }}
            />
          </View>
        </View>
      ) : (
        <Pressable
          onPress={beginEditTeam}
          accessibilityRole="button"
          accessibilityLabel={t('setup.editTeamName', { name: team.name })}
          style={({ pressed }) => [styles.teamNameRow, pressed && styles.pressed]}
        >
          <Text style={styles.heading} numberOfLines={1}>
            {team.name}
          </Text>
          <SquarePen size={19} color={colors.muted} />
        </Pressable>
      )}

      <View style={styles.swatches}>
        {TEAM_COLORS.map((option) => {
          const active = option.id.toLowerCase() === color.toLowerCase();
          const takenBy = otherTeams.find((t) => t.color.toLowerCase() === option.id.toLowerCase());
          const locked = !active && takenBy !== undefined;
          return (
            <Pressable
              key={option.id}
              onPress={() => {
                if (locked) return;
                haptics.light();
                play('accept');
                onPickColor(option.id);
              }}
              disabled={locked}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: locked }}
              accessibilityLabel={
                locked
                  ? t('setup.teamColorTaken', { name: option.name, taken: takenBy.name })
                  : t('setup.teamColorFree', { name: option.name })
              }
              style={({ pressed }) => [styles.swatchTouch, pressed && styles.pressed]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: option.id },
                  active && styles.swatchActive,
                  locked && styles.swatchLocked,
                ]}
              >
                {active ? <Check size={16} color="#10131A" strokeWidth={3} /> : null}
                {locked ? <Lock size={13} color={colors.text} strokeWidth={2.6} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.players}>
        {team.players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <View style={[styles.playerPill, editingPlayerId === player.id && styles.playerPillEditing]}>
              {editingPlayerId === player.id ? (
                <NameInput
                  framed={false}
                  maxLength={MAX_PLAYER_NAME_LENGTH}
                  value={playerDraft}
                  onChangeText={setPlayerDraft}
                  takenNames={team.players.filter((p) => p.id !== player.id).map((p) => p.name)}
                  onCancel={() => {
                    setPlayerDraft('');
                    setEditingPlayerId(null);
                  }}
                  onSubmit={(name) => {
                    onRenamePlayer(player.id, name);
                    setPlayerDraft('');
                    setEditingPlayerId(null);
                  }}
                />
              ) : (
                <>
                  <Avatar name={player.name} color={color} size={40} />
                  <Pressable
                    onPress={() => beginEditPlayer(player.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('setup.editPlayerName', { name: player.name })}
                    style={({ pressed }) => [styles.playerNameWrap, pressed && styles.pressed]}
                  >
                    <Text style={styles.playerName} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <SquarePen size={16} color={colors.muted} />
                  </Pressable>
                  {team.players.length > MIN_PLAYERS_PER_TEAM ? (
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        play('decline');
                        onRemovePlayer(player.id);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={t('setup.removePlayer', { name: player.name })}
                      style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                    >
                      <Trash size={16} color={colors.accent} />
                    </Pressable>
                  ) : null}
                </>
              )}
            </View>
          </View>
        ))}

        <Pressable
          onPress={() => {
            haptics.light();
            play('accept');
            commitPlayerDraft();
            const newPlayerId = onAddPlayer();
            setPlayerDraft('');
            setEditingPlayerId(newPlayerId);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('setup.addPlayerTo', { team: team.name })}
          style={({ pressed }) => [styles.addPlayer, pressed && styles.pressed]}
        >
          <UserPlus size={18} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.addPlayerText}>{t('setup.addPlayer')}</Text>
        </Pressable>
      </View>
    </View>
  );
});

function NameInput({
  value,
  onChangeText,
  onSubmit,
  onCancel,
  takenNames = [],
  framed = true,
  maxLength = MAX_TEAM_NAME_LENGTH,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  takenNames?: string[];
  framed?: boolean;
  maxLength?: number;
}) {
  const ref = useRef<TextInput>(null);
  const { play } = useFeedback();
  const { t } = useI18n();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const trimmed = value.trim();
  const isTaken = trimmed.length > 0 && isNameTaken(trimmed, takenNames);
  const canSubmit = trimmed.length > 0 && !isTaken;

  const submit = () => {
    if (canSubmit) {
      play('accept');
      onSubmit(trimmed);
    } else onCancel();
  };

  return (
    <View style={styles.editBlock}>
      <View style={styles.editRow}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={submit}
          onBlur={submit}
          autoCapitalize="words"
          returnKeyType="done"
          maxLength={maxLength}
          placeholderTextColor={colors.muted}
          selectionColor={colors.accent}
          selectTextOnFocus
          style={[styles.editInput, noOutline, framed && styles.editInputFramed]}
        />
        {isTaken ? <Text style={styles.editTaken}>{t('common.taken')}</Text> : null}
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          accessibilityLabel={t('common.save')}
          style={({ pressed }) => [styles.editOk, !canSubmit && styles.editOkDisabled, canSubmit && pressed && styles.pressed]}
        >
          <Check size={18} color={canSubmit ? '#241A00' : colors.muted} strokeWidth={3} />
        </Pressable>
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
  teamNameEditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.xs,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    minHeight: 56,
  },
  swatches: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  swatchTouch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  swatch: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: 2, borderColor: colors.text },
  swatchLocked: { opacity: 0.4 },
  headingRow: { alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  heading: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.7 },

  players: { gap: spacing.sm },
  playerRow: { gap: spacing.xs },
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

  editBlock: { flex: 1, gap: spacing.xs },
  editRow: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editTaken: { color: colors.danger, fontSize: 12, fontWeight: '800', textAlign: 'center' },
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
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editOkDisabled: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    opacity: 0.7,
  },

  footerRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  footerGrow: { flex: 1 },
  pressed: { opacity: 0.7 },
});
