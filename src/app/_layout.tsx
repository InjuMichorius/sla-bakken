import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGameContext } from '@/game/GameProvider';
import { Phase } from '@/game/types';
import { colors } from '@/theme';

/**
 * The reducer owns the single source of truth for which screen belongs to the
 * current phase, so the URL can never drift out of sync with the game state.
 */
const ROUTE_FOR_PHASE: Record<Phase, string> = {
  setup: '/',
  wordEntry: '/words',
  roundIntro: '/round',
  handoff: '/play',
  playing: '/play',
  roundReview: '/play',
  summary: '/summary',
};

function PhaseRouter() {
  const { state } = useGameContext();
  const pathname = usePathname();
  const target = ROUTE_FOR_PHASE[state.phase];

  useEffect(() => {
    if (target !== pathname) router.replace(target as never);
  }, [target, pathname]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <PhaseRouter />
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
