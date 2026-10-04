import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useGameContext } from '@/game/GameProvider';
import { haptics } from '@/lib/haptics';
import { colors } from '@/theme';

/** Top-left exit for every screen after setup; asks before throwing the game away. */
export function QuitGameButton() {
  const { reset } = useGameContext();
  const [open, setOpen] = useState(false);

  const confirm = () => {
    haptics.warning();
    setOpen(false);
    reset();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Spel verlaten"
        accessibilityHint="Stopt het huidige spel en gaat terug naar het begin"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={styles.dot}>
          <LogOut size={13} color="#2A0707" strokeWidth={2.75} style={styles.icon} />
        </View>
      </Pressable>
      <ConfirmDialog
        visible={open}
        title="Spel verlaten?"
        message="De teams, woorden en scores van dit spel verdwijnen. Je begint opnieuw bij de instellingen."
        confirmLabel="Spel verlaten"
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