import { router } from 'expo-router';
import { CircleArrowLeft } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { AppButton } from '@/components/AppButton';
import { haptics } from '@/lib/haptics';
import { colors } from '@/theme';

/** Terugknop onderaan een scherm; valt terug op het doelpad bij een lege geschiedenis. */
export function BackFooter({ to = '/' }: { to?: string }) {
  const { play } = useFeedback();

  const goBack = () => {
    haptics.light();
    play('decline');
    if (router.canGoBack()) router.back();
    else router.replace(to as never);
  };

  return <AppButton label="Terug" variant="ghost" size="lg" icon={<CircleArrowLeft size={18} color={colors.muted} />} onPress={goBack} sound={null} />;
}