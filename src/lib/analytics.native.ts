import Constants from 'expo-constants';
import type { AnalyticsEvent, LogAnalyticsEventArgs } from './analytics.types';

/**
 * Native (iOS/Android) implementation backed by Firebase Analytics and
 * Crashlytics via @react-native-firebase.
 *
 * The Firebase modules are loaded lazily with require() instead of a static
 * import. A static import is evaluated at module-load time, so if the native
 * module is missing (Expo Go, or a build that was not rebuilt after adding the
 * dependency) it throws before any try/catch can run and takes the whole app
 * down. Loading lazily means we can detect the missing module and fall back to
 * a silent no-op, exactly like the web build.
 *
 * No user id, name or entered word is ever attached to an event (the app stays
 * anonymous by design).
 */
export type { AnalyticsEvent, AnalyticsEventParams, LogAnalyticsEventArgs } from './analytics.types';

type AnalyticsModule = typeof import('@react-native-firebase/analytics');
type CrashlyticsModule = typeof import('@react-native-firebase/crashlytics');

type FirebaseModules = {
  analytics: AnalyticsModule;
  crashlytics: CrashlyticsModule;
};

const isDev = process.env.NODE_ENV !== 'production';
/** Expo Go kan geen eigen native modules laden; Firebase werkt daar nooit. */
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let modules: FirebaseModules | null = null;
let loadFailed = false;

function getModules(): FirebaseModules | null {
  if (modules) return modules;
  if (loadFailed) return null;

  if (isExpoGo) {
    loadFailed = true;
    if (isDev) {
      console.warn('[analytics] Expo Go bevat geen Firebase. Gebruik een development build (npx expo run:ios/android).');
    }
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const analytics = require('@react-native-firebase/analytics') as AnalyticsModule | undefined;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crashlytics = require('@react-native-firebase/crashlytics') as CrashlyticsModule | undefined;
    // Als de native module ontbreekt, is de namespace leeg (undefined) of mist
    // de functie. Beide betekenen: de app is niet opnieuw gebouwd.
    if (typeof analytics?.getAnalytics !== 'function' || typeof crashlytics?.getCrashlytics !== 'function') {
      throw new Error('Firebase native modules zijn niet geregistreerd');
    }
    // Forceer initialisatie: dit gooit als de native module niet in de build zit.
    analytics.getAnalytics();
    crashlytics.getCrashlytics();
    modules = { analytics, crashlytics };
    return modules;
  } catch (error) {
    loadFailed = true;
    if (isDev) {
      console.warn(
        '[analytics] Firebase niet beschikbaar — draai een development build (npx expo run:ios/android of eas build --profile development), niet Expo Go.',
        error,
      );
    }
    return null;
  }
}

let collectionEnabledCalled = false;
let globalErrorHandlerInstalled = false;

/**
 * Zet dataverzameling expliciet aan. De vlag IS_ANALYTICS_ENABLED in
 * GoogleService-Info.plist staat in sommige downloads op false en zou anders
 * alles stilhouden; deze runtime-call overschrijft die default.
 */
function enableCollection(): void {
  if (collectionEnabledCalled) return;
  const mods = getModules();
  if (!mods) return;
  collectionEnabledCalled = true;
  try {
    mods.analytics
      .setAnalyticsCollectionEnabled(mods.analytics.getAnalytics(), true)
      .catch((error: unknown) => {
        if (isDev) console.warn('[analytics] setAnalyticsCollectionEnabled mislukt', error);
      });
  } catch (error) {
    if (isDev) console.warn('[analytics] setAnalyticsCollectionEnabled mislukt', error);
  }
}

/**
 * Meldt ongevangen fouten aan Crashlytics. De bestaande handler (LogBox/
 * redbox) wordt bewaard en daarna aangeroepen zodat het gedrag in dev niet
 * verandert.
 */
function installGlobalErrorHandler(): void {
  if (globalErrorHandlerInstalled) return;
  const errorUtils = (
    globalThis as unknown as {
      ErrorUtils?: {
        getGlobalHandler?: () => ((error: Error, isFatal?: boolean) => void) | undefined;
        setGlobalHandler: (callback: (error: Error, isFatal?: boolean) => void) => void;
      };
    }
  ).ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;
  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error, isFatal) => {
    logError(error, isFatal ? 'Fatale ongevangen fout' : 'Ongevangen fout');
    previous?.(error, isFatal);
  });
  globalErrorHandlerInstalled = true;
}

export function initAnalytics(): void {
  const mods = getModules();
  if (!mods) return;
  enableCollection();
  installGlobalErrorHandler();
  if (isDev) console.log('[analytics] Firebase Analytics + Crashlytics actief');
}

export function logAnalyticsEvent<E extends AnalyticsEvent>(event: E, ...args: LogAnalyticsEventArgs<E>): void {
  const params = args[0] as Record<string, unknown> | undefined;
  if (isDev) console.log(`[analytics] ${event}`, params ?? '');
  const mods = getModules();
  if (!mods) return;
  try {
    mods.analytics.logEvent(mods.analytics.getAnalytics(), event, params);
  } catch (error) {
    if (isDev) console.warn(`[analytics] logEvent "${event}" mislukt`, error);
  }
}

export function logError(error: Error, contextMessage?: string): void {
  if (isDev) console.warn(`[analytics] ${contextMessage ?? 'error'}`, error);
  const mods = getModules();
  if (!mods) return;
  try {
    const crashlytics = mods.crashlytics.getCrashlytics();
    if (contextMessage) mods.crashlytics.log(crashlytics, contextMessage);
    mods.crashlytics.recordError(crashlytics, error);
  } catch (loggingError) {
    if (isDev) console.warn('[analytics] logError mislukt', loggingError);
  }
}

export function isAnalyticsEnabled(): boolean {
  return getModules() != null;
}

/** Alleen voor development: stuurt een handmatig test-event naar Firebase Analytics. */
export function sendAnalyticsTestEvent(): void {
  if (!getModules()) {
    if (isDev) console.warn('[analytics] test-event niet verzonden: Firebase niet beschikbaar');
    return;
  }
  logAnalyticsEvent('analytics_test', { source: 'settings_button' });
  if (isDev) console.log('[analytics] analytics_test verzonden');
}

/** Alleen voor development: meldt een niet-fatale fout aan Crashlytics. */
export function sendAnalyticsTestNonFatal(): void {
  const mods = getModules();
  if (!mods) {
    if (isDev) console.warn('[analytics] test non-fatal niet verzonden: Firebase niet beschikbaar');
    return;
  }
  try {
    const crashlytics = mods.crashlytics.getCrashlytics();
    mods.crashlytics.log(crashlytics, 'Handmatige test vanuit instellingen');
    mods.crashlytics.recordError(crashlytics, new Error('Test non-fatal vanuit instellingen'));
    if (isDev) console.log('[analytics] test non-fatal verzonden');
  } catch (error) {
    if (isDev) console.warn('[analytics] test non-fatal mislukt', error);
  }
}

/** Alleen voor development: forceert een native crash die Crashlytics zou moeten opvangen. */
export function sendAnalyticsTestCrash(): void {
  const mods = getModules();
  if (!mods) {
    if (isDev) console.warn('[analytics] test-crash niet uitgevoerd: Firebase niet beschikbaar');
    return;
  }
  if (isDev) console.log('[analytics] test-crash — de app crasht nu');
  mods.crashlytics.crash(mods.crashlytics.getCrashlytics());
}
