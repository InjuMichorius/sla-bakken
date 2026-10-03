import { Hand, MessageCircle, Zap } from 'lucide-react-native';
import { colors } from '@/theme';

const map = {
  'message-circle': MessageCircle,
  hand: Hand,
  zap: Zap,
} as const;

type Props = {
  name: keyof typeof map;
  size?: number;
  color?: string;
};

export function RoundIcon({ name, size = 22, color = colors.accent }: Props) {
  const Icon = map[name];
  return <Icon size={size} color={color} />;
}
