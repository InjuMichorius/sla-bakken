import { ReactNode, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CircleHelp } from 'lucide-react-native';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

type HintTooltipProps = {
  /** Short label on the trigger, e.g. "Hoe een beurt werkt". */
  label: string;
  /** The explanation itself. Rendered as a single run of text. */
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * A dismissible hint bubble on a text trigger. Rendered inline instead of floating
 * so it can never overflow a short screen, and it unmounts with the screen that
 * owns it, so it is never left open across a round.
 */
export function HintTooltip({ label, children, style }: HintTooltipProps) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    haptics.light();
    setOpen((value) => !value);
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={open ? 'Verbergt de uitleg' : 'Toont de uitleg'}
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <CircleHelp size={15} color={colors.muted} strokeWidth={2.25} />
        <Text style={styles.triggerLabel}>{label}</Text>
      </Pressable>

      {open ? (
        <View style={styles.bubble}>
          <View style={styles.arrow} />
          <Text style={styles.body}>{children}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  triggerLabel: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  bubble: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  /** Fill-coloured triangle that continues the bubble's top border, so it reads as one shape. */
  arrow: {
    position: 'absolute',
    top: -6,
    left: spacing.sm,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.surfaceAlt,
  },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
});
