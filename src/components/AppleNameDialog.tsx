import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { useAuth } from '@/auth/AuthProvider';
import { AppButton } from '@/components/AppButton';
import { useI18n } from '@/i18n/LanguageProvider';
import { isNameAvailable, MAX_PROFILE_NAME_LENGTH } from '@/lib/auth';
import { colors, noOutline, radius, spacing } from '@/theme';

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'error';

type AppleNameDialogProps = {
  initialName: string;
  currentName: string | null;
  onSaved: () => void;
};

export function AppleNameDialog({ initialName, currentName, onSaved }: AppleNameDialogProps) {
  const { t } = useI18n();
  const { play } = useFeedback();
  const { updateName, error, clearError } = useAuth();
  const [name, setName] = useState(() => initialName.trim().slice(0, MAX_PROFILE_NAME_LENGTH));
  const [checkState, setCheckState] = useState<CheckState>(() =>
    initialName.trim() ? 'checking' : 'idle',
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isCurrentName =
    currentName !== null && name.trim().toLowerCase() === currentName.trim().toLowerCase();
  const effectiveCheckState: CheckState = isCurrentName ? 'available' : checkState;

  useEffect(() => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > MAX_PROFILE_NAME_LENGTH) return;
    if (currentName !== null && trimmed.toLowerCase() === currentName.trim().toLowerCase()) return;

    let active = true;

    const timer = setTimeout(() => {
      isNameAvailable(trimmed)
        .then((available) => {
          if (active) setCheckState(available ? 'available' : 'taken');
        })
        .catch(() => {
          if (active) setCheckState('error');
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, currentName]);

  const submit = async () => {
    if (saving) return;

    const trimmed = name.trim();

    setLocalError(null);
    clearError();

    if (!trimmed) {
      setLocalError(t('auth.usernameRequired'));
      return;
    }
    if (trimmed.length > MAX_PROFILE_NAME_LENGTH) {
      setLocalError(t('auth.usernameTooLong', { n: MAX_PROFILE_NAME_LENGTH }));
      return;
    }
    if (effectiveCheckState === 'checking') return;
    if (effectiveCheckState === 'taken') {
      setLocalError(t('auth.appleNameTaken'));
      return;
    }
    if (effectiveCheckState === 'error') {
      setLocalError(t('auth.appleNameCheckFailed'));
      return;
    }

    setSaving(true);
    const ok = await updateName(trimmed);
    setSaving(false);

    if (ok) {
      play('accept');
      onSaved();
    }
  };

  const status =
    effectiveCheckState === 'checking'
      ? t('auth.appleNameChecking')
      : effectiveCheckState === 'available'
        ? t('auth.appleNameAvailable')
        : effectiveCheckState === 'taken'
          ? t('auth.appleNameTaken')
          : null;

  const message = localError ?? error;
  const canSubmit =
    !saving &&
    name.trim().length > 0 &&
    name.trim().length <= MAX_PROFILE_NAME_LENGTH &&
    effectiveCheckState !== 'checking' &&
    effectiveCheckState !== 'taken' &&
    effectiveCheckState !== 'error';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => undefined}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.appleNameTitle')}</Text>
          <Text style={styles.hint}>{t('auth.appleNameHint', { n: MAX_PROFILE_NAME_LENGTH })}</Text>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{t('auth.username')}</Text>
              <Text style={styles.counter}>
                {name.trim().length}/{MAX_PROFILE_NAME_LENGTH}
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                setCheckState(value.trim() ? 'checking' : 'idle');
                setLocalError(null);
                clearError();
              }}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              textContentType="name"
              returnKeyType="done"
              maxLength={MAX_PROFILE_NAME_LENGTH}
              placeholder={t('auth.usernamePlaceholder')}
              placeholderTextColor={colors.muted}
              selectionColor={colors.accent}
              editable={!saving}
              onSubmitEditing={() => {
                void submit();
              }}
              style={[styles.input, noOutline]}
            />
          </View>

          {status ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.status,
                checkState === 'available' && styles.statusSuccess,
                checkState === 'taken' && styles.statusDanger,
              ]}
            >
              {status}
            </Text>
          ) : null}

          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {message}
            </Text>
          ) : null}

          <AppButton
            label={saving ? t('auth.busy') : t('auth.appleNameSave')}
            onPress={() => {
              void submit();
            }}
            disabled={!canSubmit}
            sound={null}
          />
        </View>
      </KeyboardAvoidingView>
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
  hint: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  counter: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
  },
  status: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  statusSuccess: { color: colors.success },
  statusDanger: { color: colors.danger },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
});
