import { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Camera, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '@/audio/FeedbackProvider';
import { AppButton } from '@/components/AppButton';
import { useI18n } from '@/i18n/LanguageProvider';
import { accountIdFromQr } from '@/lib/accountQr';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

type QrScannerDialogProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (userId: string) => void;
};

export function QrScannerDialog({ visible, onClose, onScanned }: QrScannerDialogProps) {
  const { t } = useI18n();
  const { play } = useFeedback();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [invalid, setInvalid] = useState(false);
  const locked = useRef(false);
  const requested = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      locked.current = false;
      requested.current = false;
      if (resetTimer.current) clearTimeout(resetTimer.current);
      return;
    }

    if (permission && !permission.granted && !requested.current) {
      requested.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission, visible]);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const handleBarcode = (result: BarcodeScanningResult) => {
    if (locked.current) return;

    const userId = accountIdFromQr(result.data);
    if (!userId) {
      locked.current = true;
      setInvalid(true);
      haptics.warning();
      play('decline');
      resetTimer.current = setTimeout(() => {
        locked.current = false;
        setInvalid(false);
      }, 1600);
      return;
    }

    locked.current = true;
    haptics.success();
    play('accept');
    onScanned(userId);
  };

  const close = () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    locked.current = false;
    setInvalid(false);
    onClose();
  };

  if (!visible) return null;

  const granted = permission?.granted === true;
  const canAskAgain = permission?.canAskAgain !== false;

  return (
    <Modal visible transparent={false} animationType="slide" statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        {granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcode}
          />
        ) : null}

        <View
          style={[
            styles.overlay,
            { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{t('scanner.title')}</Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <X size={22} color={colors.text} />
            </Pressable>
          </View>

          {granted ? (
            <>
              <View style={styles.scanArea}>
                <View style={styles.frame} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.hint}>{t('scanner.hint')}</Text>
                {invalid ? <Text style={styles.error}>{t('scanner.invalid')}</Text> : null}
              </View>
            </>
          ) : (
            <View style={styles.permissionCard}>
              <View style={styles.permissionIcon}>
                <Camera size={30} color={colors.accent} />
              </View>
              <Text style={styles.permissionTitle}>{t('scanner.permissionTitle')}</Text>
              <Text style={styles.permissionBody}>{t('scanner.permissionBody')}</Text>

              {permission ? (
                <AppButton
                  label={canAskAgain ? t('scanner.grant') : t('scanner.settings')}
                  onPress={() => {
                    if (canAskAgain) {
                      void requestPermission();
                    } else {
                      void Linking.openSettings();
                    }
                  }}
                />
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { color: colors.text, fontSize: 20, fontWeight: '900', flex: 1 },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(11, 14, 20, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.72 },
  scanArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 250,
    height: 250,
    maxWidth: '82%',
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.accent,
    backgroundColor: 'rgba(255, 197, 61, 0.06)',
  },
  footer: { gap: spacing.sm, alignItems: 'center' },
  hint: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  error: { color: colors.danger, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  permissionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  permissionTitle: { color: colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  permissionBody: { color: colors.muted, fontSize: 15, lineHeight: 21, textAlign: 'center' },
});
