import { Fragment } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CirclePlay, CircleQuestionMark, Languages, Settings } from 'lucide-react-native';
import { AppButton } from '@/components/AppButton';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/LanguageProvider';
import { colors, spacing } from '@/theme';

export default function MainMenuScreen() {
  const { t } = useI18n();
  const tagline = [t('menu.taglineRounds'), t('menu.taglineTeams'), t('menu.taglinePhone')];

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Sla Bakken</Text>
        <View style={styles.tagline}>
          {tagline.map((part, index) => (
            <Fragment key={part}>
              {index > 0 ? <View style={styles.taglineDot} /> : null}
              <Text style={styles.taglineText}>{part}</Text>
            </Fragment>
          ))}
        </View>
      </View>

      <View style={styles.menu}>
        <AppButton label={t('menu.start')} size="xl" onPress={() => router.push('/setup')} icon={<CirclePlay size={22} color="#241A00" />} />
        <AppButton
          label={t('menu.settings')}
          size="lg"
          variant="secondary"
          onPress={() => router.push('/settings')}
          icon={<Settings size={20} color={colors.text} />}
        />
        <AppButton
          label={t('menu.rules')}
          size="lg"
          variant="secondary"
          onPress={() => router.push('/how-to-play')}
          icon={<CircleQuestionMark size={20} color={colors.text} />}
        />
        <AppButton
          label={t('menu.languages')}
          size="lg"
          variant="secondary"
          onPress={() => router.push('/languages')}
          icon={<Languages size={20} color={colors.text} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', gap: spacing.xxl },
  hero: { alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  logoImage: { width: '100%', height: '100%' },
  title: { color: colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1.2 },
  tagline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taglineDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.muted },
  taglineText: { color: colors.muted, fontSize: 15, fontWeight: '600' },
  menu: { gap: spacing.md },
});
