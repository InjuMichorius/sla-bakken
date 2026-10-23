import * as SecureStore from 'expo-secure-store';
import type { AuthStorage } from './authStorage.types';

const CHUNK_SIZE = 1800;

function storageKey(key: string, suffix?: string): string {
  const safeKey = key.replace(/[^A-Za-z0-9._-]/g, '_');
  return suffix ? `sb_${safeKey}_${suffix}` : `sb_${safeKey}`;
}

function chunkKey(key: string, index: number): string {
  return storageKey(key, `chunk_${index}`);
}

function splitValue(value: string): string[] {
  const chunks: string[] = [];
  for (let offset = 0; offset < value.length; offset += CHUNK_SIZE) {
    chunks.push(value.slice(offset, offset + CHUNK_SIZE));
  }
  return chunks.length > 0 ? chunks : [''];
}

function parseCount(meta: string | null): number {
  if (!meta) return 0;
  const count = Number.parseInt(meta, 10);
  return Number.isInteger(count) && count > 0 ? count : 0;
}

/**
 * Supabase sessions can exceed the ~2 KB value limit that iOS keychain releases
 * historically enforced. Store the session in small chunks with a manifest so
 * refresh tokens never sit unencrypted in AsyncStorage.
 */
export const authStorage: AuthStorage = {
  async getItem(key) {
    const count = parseCount(await SecureStore.getItemAsync(storageKey(key, 'meta')));
    if (count === 0) return null;

    const chunks = await Promise.all(
      Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkKey(key, index))),
    );

    if (chunks.some((chunk) => chunk === null)) return null;
    return chunks.map((chunk) => chunk ?? '').join('');
  },

  async setItem(key, value) {
    const previousCount = parseCount(await SecureStore.getItemAsync(storageKey(key, 'meta')));
    const chunks = splitValue(value);

    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkKey(key, index), chunk)));
    await SecureStore.setItemAsync(storageKey(key, 'meta'), String(chunks.length));

    const staleChunks: Promise<void>[] = [];
    for (let index = chunks.length; index < previousCount; index += 1) {
      staleChunks.push(SecureStore.deleteItemAsync(chunkKey(key, index)));
    }
    await Promise.all(staleChunks);
  },

  async removeItem(key) {
    const count = parseCount(await SecureStore.getItemAsync(storageKey(key, 'meta')));
    const deletions: Promise<void>[] = [SecureStore.deleteItemAsync(storageKey(key, 'meta'))];

    for (let index = 0; index < count; index += 1) {
      deletions.push(SecureStore.deleteItemAsync(chunkKey(key, index)));
    }

    await Promise.all(deletions);
  },
};
