import { StyleSheet, Text, View } from 'react-native';
import { Check, Lock, Plus, SkipForward, Sparkles, SquarePen, Timer, UserRound, VolumeX } from 'lucide-react-native';
import { RoundIcon } from '@/components/RoundIcon';
import { TEAM_COLORS } from '@/game/colors';
import { useI18n } from '@/i18n/LanguageProvider';
import { colors, radius, spacing } from '@/theme';

export type HowToPreviewVariant = 'setup' | 'words' | 'describe' | 'act' | 'oneword';

type Props = {
  variant: HowToPreviewVariant;
};

const BLUE = TEAM_COLORS[0].id;
const ORANGE = TEAM_COLORS[1].id;

export function HowToPreview({ variant }: Props) {
  const { t } = useI18n();

  return (
    <View style={styles.shell} accessible accessibilityRole="image" accessibilityLabel={t('howto.previewLabel')}>
      <View style={[styles.orb, styles.orbTop]} />
      <View style={[styles.orb, styles.orbBottom]} />

      <View style={styles.stage}>
        <View style={styles.phone}>
          <View style={styles.islandWrap}>
            <View style={styles.island} />
          </View>
          <View style={styles.screen}>
            {variant === 'setup' ? <SetupPreview /> : null}
            {variant === 'words' ? <WordsPreview /> : null}
            {variant === 'describe' ? <RoundPreview round={1} /> : null}
            {variant === 'act' ? <RoundPreview round={2} /> : null}
            {variant === 'oneword' ? <RoundPreview round={3} /> : null}
          </View>
        </View>

        <View style={styles.tag}>
          <Sparkles size={12} color={colors.accent} />
          <Text style={styles.tagText}>{t('howto.previewLabel')}</Text>
        </View>
      </View>
    </View>
  );
}

function SetupPreview() {
  const { t } = useI18n();

  return (
    <View style={styles.screenContent}>
      <View style={styles.setupTop}>
        <View style={styles.miniSteps}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.miniStepTrack}>
              <View style={[styles.miniStepDot, index === 0 && styles.miniStepDotActive]}>
                {index === 0 ? <Check size={7} color="#241A00" strokeWidth={3} /> : null}
              </View>
              {index < 2 ? <View style={styles.miniStepLine} /> : null}
            </View>
          ))}
        </View>
        <View style={styles.miniAccount}>
          <UserRound size={10} color={colors.muted} />
        </View>
      </View>

      <Text style={styles.miniHeading}>{t('setup.heading')}</Text>

      <MiniTeam color={BLUE} name="Team 1" />
      <MiniTeam color={ORANGE} name="Team 2" />

      <View style={styles.settingsCard}>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>{t('gamecard.wordsPerPlayer')}</Text>
          <View style={styles.valuePill}>
            <Text style={styles.valueText}>5</Text>
          </View>
        </View>
        <View style={styles.settingsDivider} />
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>{t('gamecard.turnSeconds')}</Text>
          <View style={styles.valuePill}>
            <Text style={styles.valueText}>30s</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function WordsPreview() {
  const { t } = useI18n();

  return (
    <View style={styles.screenContent}>
      <MiniPlayHeader color={BLUE} team="Team 1" player={t('setup.playerDefault', { n: 1 })} score="2" />

      <View style={styles.handoffCard}>
        <MiniAvatar label="IN" color={BLUE} size={34} />
        <View style={styles.handoffText}>
          <Text style={styles.miniMuted}>{t('words.givePhone')}</Text>
          <Text style={styles.handoffName}>{t('setup.playerDefault', { n: 1 })}</Text>
        </View>
      </View>

      <View style={styles.miniPrimaryButton}>
        <Text style={styles.miniPrimaryButtonText}>{t('words.iHavePhone')}</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.formHeader}>
          <Lock size={10} color={colors.accent} strokeWidth={2.6} />
          <Text style={styles.formTitle}>{t('howto.preview.secretWords')}</Text>
          <View style={styles.countPill}>
            <Text style={styles.countText}>3/5</Text>
          </View>
        </View>
        <MiniField index="1" value={t('howto.preview.word')} />
        <MiniField index="2" value={t('howto.preview.word2')} />
        <MiniField index="3" value={t('words.placeholder', { n: 3 })} muted />
      </View>
    </View>
  );
}

function RoundPreview({ round }: { round: 1 | 2 | 3 }) {
  const { t } = useI18n();
  const meta =
    round === 1
      ? { icon: 'message-circle' as const, label: t('rounds.describe.title'), rule: t('rounds.describe.verb') }
      : round === 2
        ? { icon: 'hand' as const, label: t('rounds.act.title'), rule: t('rounds.act.verb') }
        : { icon: 'zap' as const, label: t('rounds.oneword.title'), rule: t('rounds.oneword.verb') };

  return (
    <View style={styles.screenContent}>
      <MiniPlayHeader color={round === 2 ? ORANGE : BLUE} team={round === 2 ? 'Team 2' : 'Team 1'} player={t('setup.playerDefault', { n: 1 })} score={round === 3 ? '8' : '5'} />

      <View style={styles.roundRow}>
        <View style={styles.roundPill}>
          <RoundIcon name={meta.icon} size={11} color={colors.accent} />
          <Text style={styles.roundPillText}>
            {round} · {meta.label}
          </Text>
        </View>
        <View style={styles.timerPill}>
          <Timer size={10} color={colors.text} strokeWidth={2.4} />
          <Text style={styles.timerText}>0:24</Text>
        </View>
      </View>

      <View style={styles.wordCard}>
        <Text style={styles.wordLabel}>{t('play.wordLabel')}</Text>
        <Text style={styles.wordText} numberOfLines={1} adjustsFontSizeToFit>
          {t('howto.preview.word')}
        </Text>
        <View style={styles.wordFooter}>
          <Text style={styles.wordRule}>{meta.rule}</Text>
          {round === 2 ? (
            <View style={styles.smallChip}>
              <VolumeX size={9} color={colors.danger} strokeWidth={2.5} />
              <Text style={styles.smallChipText}>{t('howto.preview.noWords')}</Text>
            </View>
          ) : null}
          {round === 3 ? (
            <View style={styles.smallChip}>
              <Text style={styles.smallChipText}>{t('howto.preview.hint', { word: t('howto.preview.hintWord') })}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={[styles.miniAction, styles.miniActionGood]}>
          <Check size={11} color="#04231A" strokeWidth={3} />
          <Text style={[styles.miniActionText, styles.miniActionTextGood]}>{t('play.good')}</Text>
        </View>
        <View style={styles.miniAction}>
          <SkipForward size={10} color={colors.text} strokeWidth={2.4} />
          <Text style={styles.miniActionText}>{t('play.pass')}</Text>
        </View>
      </View>
    </View>
  );
}

function MiniPlayHeader({ color, team, player, score }: { color: string; team: string; player: string; score: string }) {
  const { t } = useI18n();

  return (
    <View style={styles.playHeader}>
      <View style={[styles.teamBar, { backgroundColor: color }]} />
      <View style={styles.playHeaderText}>
        <Text style={styles.miniMuted}>{team}</Text>
        <Text style={styles.miniPlayer}>{player}</Text>
      </View>
      <View style={styles.score}>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>{t('play.guessed')}</Text>
      </View>
    </View>
  );
}

function MiniTeam({ color, name }: { color: string; name: string }) {
  return (
    <View style={styles.teamCard}>
      <View style={styles.teamTitleRow}>
        <View style={[styles.teamDot, { backgroundColor: color }]} />
        <Text style={styles.teamName}>{name}</Text>
        <SquarePen size={10} color={colors.muted} strokeWidth={2.3} />
      </View>
      <View style={styles.peopleRow}>
        <MiniAvatar label="IN" color={color} />
        <MiniAvatar label="SA" color={color} />
        <View style={styles.addPlayer}>
          <Plus size={10} color={colors.muted} strokeWidth={2.6} />
        </View>
      </View>
    </View>
  );
}

function MiniAvatar({ label, color, size = 22 }: { label: string; color: string; size?: number }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{label}</Text>
    </View>
  );
}

function MiniField({ index, value, muted = false }: { index: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldIndex}>{index}</Text>
      <Text style={[styles.fieldValue, muted && styles.fieldValueMuted]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    width: '100%',
  },
  stage: { width: 254, alignItems: 'center' },
  orb: { position: 'absolute', borderRadius: radius.pill, opacity: 0.12 },
  orbTop: { top: 6, width: 216, height: 216, backgroundColor: colors.accent },
  orbBottom: { bottom: 8, left: '16%', width: 108, height: 108, backgroundColor: colors.success, opacity: 0.08 },
  phone: {
    width: 254,
    height: 320,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#3A4358',
    backgroundColor: '#10141D',
    padding: 7,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  islandWrap: { position: 'absolute', top: 11, left: 0, right: 0, alignItems: 'center', zIndex: 2 },
  island: { width: 54, height: 6, borderRadius: 3, backgroundColor: '#05070B' },
  screen: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  screenContent: { flex: 1, paddingHorizontal: 10, paddingTop: 20, paddingBottom: 10, gap: 6 },
  tag: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  tagText: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },

  setupTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniSteps: { flexDirection: 'row', alignItems: 'center' },
  miniStepTrack: { flexDirection: 'row', alignItems: 'center' },
  miniStepDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStepDotActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  miniStepLine: { width: 17, height: 1.5, backgroundColor: colors.border },
  miniAccount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniHeading: { color: colors.text, fontSize: 15, fontWeight: '900', letterSpacing: -0.2 },

  teamCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 8,
    gap: 7,
  },
  teamTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teamDot: { width: 7, height: 7, borderRadius: 4 },
  teamName: { flex: 1, color: colors.text, fontSize: 11, fontWeight: '800' },
  peopleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#10131A', fontWeight: '900' },
  addPlayer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 15 },
  settingsLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  settingsDivider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  valuePill: {
    minWidth: 26,
    alignItems: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  valueText: { color: colors.text, fontSize: 9, fontWeight: '900' },

  playHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 7,
    paddingVertical: 6,
    minHeight: 36,
  },
  teamBar: { width: 3, height: 24, borderRadius: 2 },
  playHeaderText: { flex: 1 },
  miniMuted: { color: colors.muted, fontSize: 7, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  miniPlayer: { color: colors.text, fontSize: 11, fontWeight: '900' },
  score: { alignItems: 'flex-end' },
  scoreValue: { fontSize: 14, fontWeight: '900', lineHeight: 15 },
  scoreLabel: { color: colors.muted, fontSize: 6, fontWeight: '700' },

  handoffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 8,
  },
  handoffText: { flex: 1 },
  handoffName: { color: colors.text, fontSize: 13, fontWeight: '900' },
  miniPrimaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    paddingVertical: 5,
  },
  miniPrimaryButtonText: { color: '#241A00', fontSize: 9, fontWeight: '900' },

  formCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 7,
    gap: 4,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 1 },
  formTitle: { flex: 1, color: colors.text, fontSize: 9, fontWeight: '800' },
  countPill: { borderRadius: radius.pill, backgroundColor: colors.accentSoft, paddingHorizontal: 5, paddingVertical: 1 },
  countText: { color: colors.accent, fontSize: 7, fontWeight: '900' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  fieldIndex: { color: colors.muted, fontSize: 7, fontWeight: '900', width: 6 },
  fieldValue: { flex: 1, color: colors.text, fontSize: 9, fontWeight: '800' },
  fieldValueMuted: { color: colors.muted, fontWeight: '600' },

  roundRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  roundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 197, 61, 0.35)',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  roundPillText: { color: colors.text, fontSize: 8, fontWeight: '800' },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  timerText: { color: colors.text, fontSize: 9, fontWeight: '900', fontVariant: ['tabular-nums'] },

  wordCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  wordLabel: { color: colors.muted, fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  wordText: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.6, textAlign: 'center' },
  wordFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 5 },
  wordRule: { color: colors.accent, fontSize: 8, fontWeight: '700', textAlign: 'center' },
  smallChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  smallChipText: { color: colors.muted, fontSize: 7, fontWeight: '800' },

  actionsRow: { flexDirection: 'row', gap: 6 },
  miniAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 7,
  },
  miniActionGood: { backgroundColor: colors.success },
  miniActionText: { color: colors.text, fontSize: 9, fontWeight: '900' },
  miniActionTextGood: { color: '#04231A' },
});
