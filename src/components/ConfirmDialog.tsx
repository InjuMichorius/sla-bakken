import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Own dialog instead of `Alert`, because react-native-web ships a no-op Alert.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuleren',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel={cancelLabel} />
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.button,
                styles.confirm,
                destructive && styles.confirmDestructive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.confirmLabel, destructive && styles.confirmLabelDestructive]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 11, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '900' },
  message: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  button: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancel: { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  cancelLabel: { color: colors.text, fontSize: 15, fontWeight: '800' },
  confirm: { borderColor: 'transparent', backgroundColor: colors.accent },
  confirmDestructive: { backgroundColor: colors.danger },
  confirmLabel: { color: '#241A00', fontSize: 15, fontWeight: '900' },
  confirmLabelDestructive: { color: '#2A0707' },
  pressed: { opacity: 0.75 },
});