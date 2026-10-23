import { useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LogOut, Menu as MenuIcon, Pencil, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '@/audio/FeedbackProvider';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useGameContext } from '@/game/GameProvider';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

type GameMenuAction = 'edit' | 'end';

export function GameMenu() {
  const { reset } = useGameContext();
  const { play } = useFeedback();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<GameMenuAction | null>(null);

  const close = () => setOpen(false);

  const openMenu = () => {
    haptics.light();
    play('accept');
    setOpen(true);
  };

  const openProfile = () => {
    close();
    haptics.light();
    play('accept');
    router.push('/profile');
  };

  const askConfirm = (action: GameMenuAction) => {
    close();
    haptics.light();
    play('decline');
    // Let the menu Modal finish dismissing before presenting the confirm Modal.
    setTimeout(() => setConfirmAction(action), 300);
  };

  const confirm = () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;

    haptics.warning();
    reset();
    router.replace(action === 'edit' ? '/setup' : '/');
  };

  return (
    <>
      <Pressable
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={t('menu.open')}
        accessibilityHint={t('menu.openHint')}
        hitSlop={8}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <View style={styles.triggerInner}>
          <MenuIcon size={20} color={colors.text} strokeWidth={2.5} />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          />
          <View style={[styles.panel, { marginTop: insets.top + 56 }]}>
            <Text style={styles.panelTitle}>{t('menu.title')}</Text>
            <MenuItem
              icon={<Pencil size={18} color={colors.text} />}
              label={t('menu.editGame')}
              onPress={() => askConfirm('edit')}
            />
            <MenuItem
              icon={<UserRound size={18} color={colors.text} />}
              label={t('menu.profile')}
              onPress={openProfile}
            />
            <View style={styles.divider} />
            <MenuItem
              icon={<LogOut size={18} color={colors.danger} />}
              label={t('menu.endGame')}
              danger
              onPress={() => askConfirm('end')}
            />
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmAction !== null}
        title={confirmAction === 'edit' ? t('menu.editTitle') : t('quit.title')}
        message={confirmAction === 'edit' ? t('menu.editMessage') : t('quit.message')}
        confirmLabel={confirmAction === 'edit' ? t('menu.editConfirm') : t('quit.confirm')}
        destructive
        onConfirm={confirm}
        onCancel={() => setConfirmAction(null)}
      />
    </>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={[styles.itemIcon, danger && styles.itemIconDanger]}>{icon}</View>
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  triggerInner: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  modalRoot: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(4, 6, 11, 0.55)',
  },
  panel: {
    width: 236,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  panelTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  itemPressed: { backgroundColor: colors.surfaceAlt },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  itemIconDanger: { backgroundColor: colors.dangerSoft },
  itemLabel: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  itemLabelDanger: { color: colors.danger },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
