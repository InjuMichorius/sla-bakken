import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Check, CircleArrowLeft, CircleArrowRight } from 'lucide-react-native';
import { AccountButton } from '@/components/AccountButton';
import { AppButton } from '@/components/AppButton';
import { HowToPreview, type HowToPreviewVariant } from '@/components/HowToPreview';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { logAnalyticsEvent } from '@/lib/analytics';
import { haptics } from '@/lib/haptics';
import { colors, radius, spacing } from '@/theme';

type HowToPage = {
  title: TranslationKey;
  subtitle: TranslationKey;
  body: TranslationKey;
  variant: HowToPreviewVariant;
  rules?: TranslationKey[];
  note?: TranslationKey;
};

const PAGES: HowToPage[] = [
  {
    title: 'howto.page1.title',
    subtitle: 'howto.page1.subtitle',
    body: 'howto.page1.body',
    variant: 'setup',
  },
  {
    title: 'howto.page2.title',
    subtitle: 'howto.page2.subtitle',
    body: 'howto.page2.body',
    variant: 'words',
  },
  {
    title: 'howto.page3.title',
    subtitle: 'howto.page3.subtitle',
    body: 'howto.page3.body',
    variant: 'describe',
    rules: ['rounds.describe.rule2', 'rounds.describe.rule3', 'rounds.describe.rule4'],
  },
  {
    title: 'howto.page4.title',
    subtitle: 'howto.page4.subtitle',
    body: 'howto.page4.body',
    variant: 'act',
    rules: ['rounds.act.rule2', 'rounds.act.rule3'],
  },
  {
    title: 'howto.page5.title',
    subtitle: 'howto.page5.subtitle',
    body: 'howto.page5.body',
    variant: 'oneword',
    rules: ['rounds.oneword.rule2', 'rounds.oneword.rule3'],
    note: 'howto.page5.note',
  },
];

export default function HowToPlayScreen() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const tracked = useRef(false);
  const page = PAGES[step];
  const isFirst = step === 0;
  const isLast = step === PAGES.length - 1;

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    logAnalyticsEvent('how_to_play_opened');
  }, []);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const goBack = () => {
    haptics.light();
    if (isFirst) close();
    else setStep((current) => current - 1);
  };

  const goNext = () => {
    if (isLast) {
      haptics.success();
      close();
      return;
    }
    haptics.light();
    setStep((current) => current + 1);
  };

  return (
    <Screen
      topBar={
        <>
          <View style={styles.topBarSide} />
          <View style={styles.steps} accessible accessibilityLabel={t('howto.stepOf', { n: step + 1, total: PAGES.length })}>
            {PAGES.map((_, index) => (
              <View key={index} style={styles.stepTrack}>
                <View style={[styles.stepDot, index <= step && styles.stepDotActive]}>
                  {index < step ? (
                    <Check size={13} color="#241A00" strokeWidth={3} />
                  ) : (
                    <Text style={[styles.stepDotText, index === step && styles.stepDotTextActive]}>{index + 1}</Text>
                  )}
                </View>
                {index < PAGES.length - 1 ? <View style={[styles.stepLine, index < step && styles.stepLineActive]} /> : null}
              </View>
            ))}
          </View>
          <AccountButton />
        </>
      }
      footer={
        <View style={styles.footerRow}>
          <AppButton
            label={isFirst ? t('common.back') : t('howto.previous')}
            variant="ghost"
            size="lg"
            onPress={goBack}
            fullWidth={false}
            sound="decline"
            icon={<CircleArrowLeft size={18} color={colors.muted} />}
          />
          <View style={styles.footerGrow}>
            <AppButton
              label={isLast ? t('howto.finish') : t('howto.next')}
              size="lg"
              onPress={goNext}
              icon={isLast ? <Check size={20} color="#241A00" strokeWidth={3} /> : <CircleArrowRight size={18} color="#241A00" />}
            />
          </View>
        </View>
      }
      contentStyle={styles.content}
    >
      <View style={styles.pageHeader}>
        <Text style={styles.eyebrow}>{t('howto.stepOf', { n: step + 1, total: PAGES.length })}</Text>
        <Text style={styles.pageTitle}>{t(page.title)}</Text>
        <Text style={styles.pageSubtitle}>{t(page.subtitle)}</Text>
      </View>

      <HowToPreview variant={page.variant} />

      <Text style={styles.body}>{t(page.body)}</Text>

      {page.rules ? (
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>{t('howto.remember')}</Text>
          {page.rules.map((rule) => (
            <View key={rule} style={styles.ruleRow}>
              <View style={styles.bullet} />
              <Text style={styles.ruleText}>{t(rule)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {page.note ? (
        <View style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Check size={16} color={colors.accent} strokeWidth={3} />
          </View>
          <Text style={styles.noteText}>{t(page.note)}</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start', gap: spacing.lg },
  topBarSide: { width: 44 },
  steps: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepTrack: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepDotText: { color: colors.muted, fontSize: 11, fontWeight: '900' },
  stepDotTextActive: { color: '#241A00' },
  stepLine: { width: 10, height: 2, borderRadius: 1, backgroundColor: colors.border },
  stepLineActive: { backgroundColor: colors.accent },

  pageHeader: { gap: spacing.xs },
  eyebrow: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  pageTitle: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8, lineHeight: 33 },
  pageSubtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23 },

  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rulesTitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 8 },
  ruleText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 },

  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 197, 61, 0.28)',
    padding: spacing.lg,
  },
  noteIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 197, 61, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },

  footerRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  footerGrow: { flex: 1 },
});
