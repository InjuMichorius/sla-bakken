import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth/AuthProvider';
import { FeedbackProvider } from '@/audio/FeedbackProvider';
import { GameProvider, useGameContext } from '@/game/GameProvider';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { Phase } from '@/game/types';
import { initAnalytics } from '@/lib/analytics';
import { GameAnalyticsBridge } from '@/lib/gameAnalytics';
import { colors } from '@/theme';

/**
 * The reducer owns the single source of truth for which screen belongs to the
 * current phase, so the URL can never drift out of sync with the game state.
 */
const ROUTE_FOR_PHASE: Record<Phase, string> = {
  setup: '/setup',
  wordEntry: '/words',
  roundIntro: '/round',
  handoff: '/play',
  playing: '/play',
  turnReview: '/turn-review',
  roundReview: '/play',
  summary: '/summary',
};

/** Zolang er geen spel loopt mag de gebruiker vrij tussen menu, setup, instellingen, talen en uitleg. */
const MENU_ROUTES = new Set(['/', '/setup', '/settings', '/languages', '/how-to-play']);

/** Overlays die bovenop de fase-router mogen openen, ook tijdens een actief spel. */
const OVERLAY_ROUTES = new Set(['/profile', '/settings', '/languages', '/word-review']);

function PhaseRouter() {
  const { state } = useGameContext();
  const pathname = usePathname();
  const target = ROUTE_FOR_PHASE[state.phase];

  useEffect(() => {
    if (target === pathname) return;
    if (OVERLAY_ROUTES.has(pathname)) return;
    if (state.phase === 'setup' && MENU_ROUTES.has(pathname)) return;
    router.replace(target as never);
  }, [state.phase, target, pathname]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <SafeAreaProvider>
      <FeedbackProvider>
        <LanguageProvider>
          <AuthProvider>
            <GameProvider>
              <StatusBar style="light" />
              <PhaseRouter />
              <GameAnalyticsBridge />
              <View style={styles.root}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.bg },
                    animation: 'fade',
                    gestureEnabled: false,
                  }}
                />
              </View>
            </GameProvider>
          </AuthProvider>
        </LanguageProvider>
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
