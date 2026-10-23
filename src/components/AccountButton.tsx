import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { useAuth } from '@/auth/AuthProvider';
import { Avatar } from '@/components/Avatar';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius } from '@/theme';

/** Accountknop voor de startschermen, die geen in-game hamburgermenu hebben. */
export function AccountButton() {
  const { session, profile } = useAuth();
  const { play } = useFeedback();
  const { t } = useI18n();
  const name = profile?.name?.trim();

  const open = () => {
    haptics.light();
    play('accept');
    router.push('/profile');
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={t('profile.open')}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      {session && name ? (
        <Avatar name={name} color={colors.accent} size={32} />
      ) : (
        <View style={[styles.guest, session && styles.guestActive]}>
          <UserRound size={18} color={session ? colors.accent : colors.muted} strokeWidth={2.4} />
        </View>
      )}
      {session ? <View style={styles.statusDot} /> : null}
    </Pressable>
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
  guest: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  guestActive: { borderColor: 'rgba(255, 197, 61, 0.45)', backgroundColor: colors.accentSoft },
  statusDot: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  pressed: { opacity: 0.7 },
});
