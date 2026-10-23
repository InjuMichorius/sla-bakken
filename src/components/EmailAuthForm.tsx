import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LogIn, UserPlus } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';
import { useAuth } from '@/auth/AuthProvider';
import { AppButton } from '@/components/AppButton';
import { useI18n } from '@/i18n/LanguageProvider';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

type Mode = 'signIn' | 'signUp';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function EmailAuthForm() {
  const { t } = useI18n();
  const { play } = useFeedback();
  const { signInWithEmail, signUpWithEmail, error, clearError } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    if (next === mode || busy) return;

    haptics.light();
    play('accept');
    setMode(next);
    setLocalError(null);
    setNotice(null);
    clearError();
  };

  const submit = async () => {
    if (busy) return;

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    setLocalError(null);
    setNotice(null);
    clearError();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setLocalError(t('auth.invalidEmail'));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(t('auth.passwordTooShort'));
      return;
    }
    if (mode === 'signUp' && !trimmedName) {
      setLocalError(t('auth.usernameRequired'));
      return;
    }

    haptics.light();
    setBusy(true);

    if (mode === 'signIn') {
      const ok = await signInWithEmail(trimmedEmail, password);
      setBusy(false);
      if (ok) setPassword('');
      return;
    }

    const result = await signUpWithEmail(trimmedEmail, password, trimmedName);
    setBusy(false);

    if (!result.ok) return;

    if (result.needsConfirmation) {
      setNotice(t('auth.checkEmail'));
      setMode('signIn');
      setPassword('');
    } else {
      setPassword('');
    }
  };

  const message = localError ?? error;

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        <TabButton label={t('auth.signInTab')} active={mode === 'signIn'} onPress={() => switchMode('signIn')} />
        <TabButton label={t('auth.signUpTab')} active={mode === 'signUp'} onPress={() => switchMode('signUp')} />
      </View>

      <View style={styles.form}>
        {mode === 'signUp' ? (
          <Field
            label={t('auth.username')}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.usernamePlaceholder')}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            editable={!busy}
          />
        ) : null}

        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          editable={!busy}
        />

        <Field
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
          secureTextEntry
          editable={!busy}
          onSubmitEditing={() => {
            void submit();
          }}
        />

        {message ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {message}
          </Text>
        ) : null}
        {notice ? (
          <Text accessibilityLiveRegion="polite" style={styles.notice}>
            {notice}
          </Text>
        ) : null}

        <AppButton
          label={busy ? t('auth.busy') : mode === 'signUp' ? t('auth.signUp') : t('auth.signIn')}
          onPress={() => {
            void submit();
          }}
          disabled={busy}
          icon={
            mode === 'signUp' ? (
              <UserPlus size={18} color="#241A00" />
            ) : (
              <LogIn size={18} color="#241A00" />
            )
          }
        />

        <Text style={styles.hint}>{t('auth.emailHint')}</Text>
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoComplete?: 'email' | 'name' | 'new-password' | 'current-password';
  textContentType?: 'emailAddress' | 'name' | 'newPassword' | 'password';
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  editable?: boolean;
  onSubmitEditing?: () => void;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
  autoCorrect = false,
  autoComplete,
  textContentType,
  keyboardType = 'default',
  secureTextEntry,
  editable = true,
  onSubmitEditing,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        textContentType={textContentType}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  tabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: colors.accent },
  tabLabel: { color: colors.muted, fontSize: 14, fontWeight: '800' },
  tabLabelActive: { color: '#241A00' },
  pressed: { opacity: 0.75 },
  form: { gap: spacing.md },
  field: { gap: 6 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
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
  error: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  notice: { color: colors.success, fontSize: 13, lineHeight: 18 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17, textAlign: 'center' },
});
