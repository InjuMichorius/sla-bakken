import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

const MAX_WIDTH = 560;

type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  /** Pinned above the content, outside of the scroll area, e.g. the quit button. */
  topBar?: ReactNode;
  /** Pinned to the bottom, outside of the scroll area. */
  footer?: ReactNode;
  contentStyle?: ViewStyle;
  scroll?: boolean;
  background?: string;
};

export function Screen({ children, title, subtitle, topBar, footer, contentStyle, scroll = true, background = colors.bg }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const body = (
    <View style={[styles.content, contentStyle]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: background, paddingTop: insets.top }]}
    >
      {topBar ? (
        <View style={styles.topBarOuter}>
          <View style={styles.topBar}>{topBar}</View>
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  topBarOuter: {
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: -spacing.sm },
  footer: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  footerInner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: spacing.md },
});
