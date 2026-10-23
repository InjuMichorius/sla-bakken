import type { AuthStorage } from './authStorage.types';

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Web fallback. Native builds use `authStorage.native.ts`, which stores the
 * session encrypted in the iOS keychain / Android keystore.
 */
export const authStorage: AuthStorage = {
  async getItem(key) {
    return getLocalStorage()?.getItem(key) ?? null;
  },
  async setItem(key, value) {
    getLocalStorage()?.setItem(key, value);
  },
  async removeItem(key) {
    getLocalStorage()?.removeItem(key);
  },
};
