import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '@/i18n/LanguageProvider';
import { colors, spacing } from '@/theme';

export function AuthDivider() {
  const { t } = useI18n();

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{t('auth.or')}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
});
