import { Platform, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CircleArrowLeft } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { haptics } from '@/lib/haptics';
import { colors } from '@/theme';

/** Terugknop voor menu-achtige schermen; valt terug op het hoofdmenu bij een lege geschiedenis. */
export function BackButton({ to = '/', label = 'Terug' }: { to?: string; label?: string }) {
  const { play } = useFeedback();

  const goBack = () => {
    haptics.light();
    play('decline');
    if (router.canGoBack()) router.back();
    else router.replace(to as never);
  };

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <CircleArrowLeft size={24} color={colors.text} />
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
  pressed: { opacity: 0.7 },
});
