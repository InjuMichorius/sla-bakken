import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LogOut, Star } from 'lucide-react-native';
import { useAuth } from '@/auth/AuthProvider';
import { AppButton } from '@/components/AppButton';
import { AppleSignInButton } from '@/components/AppleSignInButton';
import { AuthDivider } from '@/components/AuthDivider';
import { Avatar } from '@/components/Avatar';
import { BackFooter } from '@/components/BackFooter';
import { EmailAuthForm } from '@/components/EmailAuthForm';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/LanguageProvider';
import { colors, radius, spacing } from '@/theme';

function formatDate(value: string | null | undefined, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const { t, language } = useI18n();
  const { isConfigured, isLoading, session, profile, error, signOut } = useAuth();

  const name = profile?.name?.trim() || t('common.unknown');
  const points = profile?.points ?? 0;
  const firstLogin = formatDate(profile?.first_login, language);

  return (
    <Screen
      topBar={
        <>
          <View style={styles.topBarSide} />
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={styles.topBarSide} />
        </>
      }
      footer={<BackFooter />}
      contentStyle={styles.content}
    >
      {!isConfigured ? (
        <View style={styles.card}>
          <Text style={styles.hint}>{t('profile.notConfigured')}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.hint}>{t('profile.loading')}</Text>
        </View>
      ) : session ? (
        <>
          <View style={styles.hero}>
            <Avatar name={name} color={colors.accent} size={76} />
            <Text style={styles.name}>{name}</Text>
            <View style={styles.pointsPill}>
              <Star size={15} color={colors.accent} fill={colors.accent} />
              <Text style={styles.pointsText}>{t('settings.accountPoints', { n: points })}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.name')}</Text>
              <Text style={styles.rowValue}>{name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.points')}</Text>
              <Text style={styles.rowValue}>{points}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.firstLogin')}</Text>
              <Text style={styles.rowValue}>{firstLogin ?? t('common.unknown')}</Text>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton
            label={t('settings.signOut')}
            variant="secondary"
            icon={<LogOut size={18} color={colors.text} />}
            onPress={() => {
              void signOut();
            }}
          />
        </>
      ) : (
        <>
          <View style={styles.hero}>
            <Avatar name={t('profile.guest')} color={colors.muted} size={76} />
            <Text style={styles.name}>{t('profile.notSignedIn')}</Text>
            <Text style={styles.hint}>{t('profile.signInHint')}</Text>
          </View>

          <AppleSignInButton />
          <AuthDivider />

          <View style={styles.authCard}>
            <EmailAuthForm />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  topBarSide: { width: 44 },
  loading: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  pointsText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  rowLabel: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
