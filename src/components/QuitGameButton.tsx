import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useGameContext } from '@/game/GameProvider';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors } from '@/theme';

/** Top-left exit for every screen after setup; asks before throwing the game away. */
export function QuitGameButton() {
  const { reset } = useGameContext();
  const { play } = useFeedback();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const confirm = () => {
    haptics.warning();
    setOpen(false);
    reset();
    router.replace('/');
  };

  return (
    <>
      <Pressable
        onPress={() => {
          play('decline');
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('quit.a11y')}
        accessibilityHint={t('quit.a11yHint')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={styles.dot}>
          <LogOut size={13} color="#2A0707" strokeWidth={2.75} style={styles.icon} />
        </View>
      </Pressable>
      <ConfirmDialog
        visible={open}
        title={t('quit.title')}
        message={t('quit.message')}
        confirmLabel={t('quit.confirm')}
        destructive
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  /** The arrow points right, but the button sits top-left, so leaving means going back. */
  icon: { transform: [{ scaleX: -1 }] },
  pressed: { opacity: 0.7 },
});