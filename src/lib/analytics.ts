import type { AnalyticsEvent, LogAnalyticsEventArgs } from './analytics.types';

/**
 * Web / default implementation.
 *
 * Firebase Analytics native (via @react-native-firebase) only runs on iOS and
 * Android. On web (and in any non-native build) the app still calls the same
 * API, but events go to a safe no-op logger instead of a native SDK. This keeps
 * `src/app` platform-agnostic and keeps `expo export --platform web` building
 * without pulling native-only modules into the bundle.
 *
 * The native implementation lives in `analytics.native.ts`; Metro picks that
 * file automatically on iOS/Android.
 */
export type { AnalyticsEvent, AnalyticsEventParams, LogAnalyticsEventArgs } from './analytics.types';

const isDev = process.env.NODE_ENV !== 'production';

export function initAnalytics(): void {
  if (isDev) {
    console.log('[analytics] web/native-afwezig: gebeurtenissen worden alleen gelogd, niet verzonden');
  }
}

export function logAnalyticsEvent<E extends AnalyticsEvent>(event: E, ...args: LogAnalyticsEventArgs<E>): void {
  if (isDev) {
    console.log(`[analytics] ${event}`, args[0] ?? '');
  }
}

export function logError(error: Error, contextMessage?: string): void {
  if (isDev) {
    console.warn(`[analytics] ${contextMessage ?? 'error'}`, error);
  }
}

export function isAnalyticsEnabled(): boolean {
  return false;
}

/** Alleen voor development: testknoppen in de instellingen. Web/native-afwezig = no-op. */
export function sendAnalyticsTestEvent(): void {
  if (isDev) console.log('[analytics] test-event (web/native-afwezig: niet verzonden)');
}

export function sendAnalyticsTestNonFatal(): void {
  if (isDev) console.warn('[analytics] test non-fatal (web/native-afwezig: niet verzonden)');
}

export function sendAnalyticsTestCrash(): void {
  if (isDev) console.warn('[analytics] test-crash (web/native-afwezig: niet uitgevoerd)');
}
