import { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type BadgeProps = {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'muted';
  style?: ViewStyle;
};

const tones = {
  neutral: { bg: colors.surfaceAlt, fg: colors.text },
  accent: { bg: colors.accentSoft, fg: colors.accent },
  success: { bg: colors.successSoft, fg: colors.success },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  muted: { bg: 'rgba(141, 153, 174, 0.14)', fg: colors.muted },
} as const;

export function Badge({ children, tone = 'neutral', style }: BadgeProps) {
  const palette = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.text, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    ...Platform.select({ web: { userSelect: 'none' as const }, default: {} }),
  },
  text: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
});
