import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/auth/AuthProvider';
import { AppleNameDialog } from '@/components/AppleNameDialog';
import { useI18n } from '@/i18n/LanguageProvider';
import { colors, radius, spacing } from '@/theme';

type AppleSignInButtonProps = {
  onSuccess?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function AppleSignInButton({ onSuccess, style }: AppleSignInButtonProps) {
  const { signIn, error, clearError } = useAuth();
  const { t } = useI18n();
  const [available, setAvailable] = useState(Platform.OS === 'ios');
  const [isBusy, setIsBusy] = useState(false);
  const [namePromptOpen, setNamePromptOpen] = useState(false);
  const [suggestedName, setSuggestedName] = useState('');
  const [currentName, setCurrentName] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    let active = true;

    AppleAuthentication.isAvailableAsync()
      .then((isAvailable) => {
        if (active) setAvailable(isAvailable);
      })
      .catch(() => {
        if (active) setAvailable(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!available) {
    return (
      <View style={[styles.unavailable, style]}>
        <Text style={styles.unavailableText}>{t('auth.iosOnly')}</Text>
      </View>
    );
  }

  const handlePress = async () => {
    if (isBusy) return;

    clearError();
    setIsBusy(true);

    try {
      const result = await signIn();
      if (!result.ok) return;

      if (result.suggestedName !== null) {
        setSuggestedName(result.suggestedName);
        setCurrentName(result.currentName);
        setNamePromptOpen(true);
        return;
      }

      onSuccess?.();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.buttonWrapper, isBusy && styles.busy]}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={radius.md}
          style={styles.button}
          onPress={() => {
            void handlePress();
          }}
        />
      </View>
      {error && !namePromptOpen ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {namePromptOpen ? (
        <AppleNameDialog
          initialName={suggestedName}
          currentName={currentName}
          onSaved={() => {
            setNamePromptOpen(false);
            setSuggestedName('');
            setCurrentName(null);
            onSuccess?.();
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  buttonWrapper: { width: '100%' },
  button: { width: '100%', height: 52 },
  busy: { opacity: 0.6 },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18, textAlign: 'center' },
  unavailable: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  unavailableText: { color: colors.muted, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
