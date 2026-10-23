import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppButton } from '@/components/AppButton';
import { Avatar } from '@/components/Avatar';
import { useI18n } from '@/i18n/LanguageProvider';
import { accountQrValue } from '@/lib/accountQr';
import { colors, radius, spacing } from '@/theme';

type AccountQrDialogProps = {
  visible: boolean;
  userId: string;
  name: string;
  onClose: () => void;
};

export function AccountQrDialog({ visible, userId, name, onClose }: AccountQrDialogProps) {
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title}>{t('profile.qrTitle')}</Text>

          <View style={styles.identity}>
            <Avatar name={name} color={colors.accent} size={56} />
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          </View>

          <View style={styles.qrFrame}>
            <QRCode
              value={accountQrValue(userId)}
              size={220}
              color="#0B0E14"
              backgroundColor="#FFFFFF"
              quietZone={8}
              ecl="M"
            />
          </View>

          <Text style={styles.hint}>{t('profile.qrHint')}</Text>

          <AppButton label={t('common.close')} variant="secondary" onPress={onClose} sound="decline" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 11, 0.82)',
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
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  identity: { alignItems: 'center', gap: spacing.sm, maxWidth: '100%' },
  name: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  qrFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
