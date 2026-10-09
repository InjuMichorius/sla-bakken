import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useFeedback } from '@/audio/FeedbackProvider';

import { BackFooter } from '@/components/BackFooter';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/LanguageProvider';
import type { Language } from '@/i18n/translations';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

const LANGUAGES: { code: Language; titleKey: 'languages.nl' | 'languages.en' | 'languages.de' | 'languages.fr'; hintKey: 'languages.nlHint' | 'languages.enHint' | 'languages.deHint' | 'languages.frHint' }[] = [
  { code: 'nl', titleKey: 'languages.nl', hintKey: 'languages.nlHint' },
  { code: 'en', titleKey: 'languages.en', hintKey: 'languages.enHint' },
  { code: 'de', titleKey: 'languages.de', hintKey: 'languages.deHint' },
  { code: 'fr', titleKey: 'languages.fr', hintKey: 'languages.frHint' },
];

export default function LanguagesScreen() {
  const { language, setLanguage, t } = useI18n();
  const { play } = useFeedback();

  const pick = (code: Language) => {
    haptics.light();
    play('accept');
    setLanguage(code);
  };

  return (
    <Screen
      topBar={
        <>
          <View style={styles.topBarSide} />
          <Text style={styles.headerTitle}>{t('languages.title')}</Text>
          <View style={styles.topBarSide} />
        </>
      }
      footer={<BackFooter />}
      contentStyle={styles.content}
    >
      <Text style={styles.hint}>{t('languages.hint')}</Text>

      <View style={styles.card}>
        {LANGUAGES.map((option, index) => {
          const active = language === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => pick(option.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(option.titleKey)}
              style={({ pressed }) => [styles.option, index > 0 && styles.optionBorder, pressed && styles.pressed]}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{t(option.titleKey)}</Text>
                <Text style={styles.optionHint}>{t(option.hintKey)}</Text>
              </View>
              <View style={[styles.check, active && styles.checkActive]}>
                {active ? <Check size={16} color="#241A00" strokeWidth={3} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  topBarSide: { width: 44 },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    ...Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
  },
  optionBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  optionHint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  check: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  checkActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  pressed: { opacity: 0.7 },
});