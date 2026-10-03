import { ReactNode } from 'react';
import { Platform, Pressable, PressableProps, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const background: Record<Variant, string> = {
  primary: colors.accent,
  secondary: colors.surfaceAlt,
  ghost: 'transparent',
  success: colors.success,
  danger: colors.danger,
};

const foreground: Record<Variant, string> = {
  primary: '#241A00',
  secondary: colors.text,
  ghost: colors.muted,
  success: '#04231A',
  danger: '#2A0707',
};

const sizes: Record<Size, { height: number; fontSize: number; paddingHorizontal: number }> = {
  sm: { height: 36, fontSize: 13, paddingHorizontal: spacing.lg },
  md: { height: 48, fontSize: 15, paddingHorizontal: spacing.xl },
  lg: { height: 60, fontSize: 18, paddingHorizontal: spacing.xl },
  xl: { height: 78, fontSize: 24, paddingHorizontal: spacing.xl },
};

type AppButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function AppButton({ label, variant = 'primary', size = 'md', icon, iconOnly = false, fullWidth = true, disabled, style, ...rest }: AppButtonProps) {
  const dims = sizes[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={(state) => [
        styles.base,
        {
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          backgroundColor: background[variant],
          borderColor: variant === 'ghost' ? colors.border : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          opacity: disabled ? 0.4 : state.pressed ? 0.75 : 1,
        },
        fullWidth ? styles.fullWidth : styles.autoWidth,
        style,
      ]}
      {...rest}
    >
      {icon ? <View style={iconOnly ? styles.iconOnly : styles.icon}>{icon}</View> : null}
      {iconOnly ? null : (
        <Text
          numberOfLines={1}
          style={[styles.label, { color: foreground[variant], fontSize: dims.fontSize, opacity: disabled ? 0.7 : 1 }]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  fullWidth: { alignSelf: 'stretch' },
  autoWidth: { alignSelf: 'flex-start' },
  icon: { marginRight: 2 },
  iconOnly: { marginRight: 0 },
  label: { fontWeight: '800', letterSpacing: 0.2, textAlign: 'center' },
});
