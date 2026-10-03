import { Platform } from 'react-native';
import type { TextStyle } from 'react-native';

export const colors = {
  bg: '#0B0E14',
  surface: '#151A24',
  surfaceAlt: '#1E2432',
  border: '#2C3446',
  text: '#F4F7FB',
  muted: '#8D99AE',
  accent: '#FFC53D',
  accentSoft: 'rgba(255, 197, 61, 0.14)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.14)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  warning: '#FB923C',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** react-native-web draws a focus ring on inputs; the native types don't know about it. */
export const noOutline: TextStyle = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : {};
