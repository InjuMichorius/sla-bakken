import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Play, Volume2, VolumeX } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { SOUNDS } from '@/audio/sounds';

import { BackFooter } from '@/components/BackFooter';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

const VOLUME_STEPS = [25, 50, 75, 100];

export default function SettingsScreen() {
  const { t } = useI18n();
  const { settings, setSoundEnabled, setVolume, toggleMuted, setHaptics, preview } = useFeedback();

  return (
    <Screen
      topBar={
        <>
          <View style={styles.topBarSide} />
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <View style={styles.topBarSide} />
        </>
      }
      footer={<BackFooter />}
      contentStyle={styles.content}
    >
      <Text style={styles.section}>{t('settings.soundsSection')}</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{t('settings.soundsOn')}</Text>
            <Text style={styles.rowHint}>{t('settings.soundsOnHint')}</Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => {
              haptics.light();
              setSoundEnabled(value);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            ios_backgroundColor={colors.surfaceAlt}
            accessibilityLabel={t('settings.soundsOn')}
          />
        </View>

        <View style={[styles.row, !settings.soundEnabled && styles.rowDimmed]}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{t('settings.volume')}</Text>
            <Text style={styles.rowHint}>{t('settings.volumeHint')}</Text>
          </View>
          <View style={styles.chips}>
            {VOLUME_STEPS.map((step) => {
              const active = Math.round(settings.volume * 100) === step;
              return (
                <Pressable
                  key={step}
                  disabled={!settings.soundEnabled}
                  onPress={() => {
                    haptics.light();
                    setVolume(step / 100);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active, disabled: !settings.soundEnabled }}
                  style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{step}%</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.divider} />

        {SOUNDS.map((sound, index) => {
          const muted = !!settings.muted[sound.key];
          const label = t(sound.label);
          return (
            <View key={sound.key} style={[styles.soundRow, index > 0 && styles.soundRowBorder]}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowHint}>{t(sound.hint)}</Text>
              </View>
              <Pressable
                onPress={() => preview(sound.key)}
                accessibilityRole="button"
                accessibilityLabel={t('settings.playLabel', { label })}
                style={({ pressed }) => [styles.iconButton, styles.previewButton, pressed && styles.pressed]}
              >
                <Play size={16} color="#241A00" fill="#241A00" />
              </Pressable>
              <Pressable
                onPress={() => {
                  haptics.light();
                  toggleMuted(sound.key);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: !muted }}
                accessibilityLabel={t(muted ? 'settings.soundEnable' : 'settings.soundDisable', { label })}
                style={({ pressed }) => [
                  styles.iconButton,
                  styles.muteButton,
                  muted && styles.muteButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                {muted ? <VolumeX size={18} color={colors.danger} /> : <Volume2 size={18} color={colors.text} />}
              </Pressable>
            </View>
          );
        })}
      </View>

      <Text style={styles.section}>{t('settings.hapticsSection')}</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{t('settings.hapticsOn')}</Text>
            <Text style={styles.rowHint}>{t('settings.hapticsOnHint')}</Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => {
              setHaptics(value);
            }}
            trackColor={{ false: colors.border, true: colors.accent }}
            ios_backgroundColor={colors.surfaceAlt}
            accessibilityLabel={t('settings.hapticsOn')}
          />
        </View>
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
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDimmed: { opacity: 0.5 },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { color: colors.text, fontSize: 16, fontWeight: '800' },
  rowHint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  chips: { flexDirection: 'row', gap: spacing.xs },
  chip: {
    minWidth: 52,
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  chipTextActive: { color: '#241A00' },
  divider: { height: 1, backgroundColor: colors.border },
  soundRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  soundRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  previewButton: { backgroundColor: colors.accent },
  muteButton: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  muteButtonActive: { borderColor: 'rgba(248, 113, 113, 0.5)', backgroundColor: colors.dangerSoft },
  pressed: { opacity: 0.7 },
});
