import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Lets node run the app's extensionless relative imports (Metro/bundler style). */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const base = new URL(specifier, context.parentURL);
    for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
      const candidate = new URL(base.href + ext);
      if (existsSync(fileURLToPath(candidate))) {
        return nextResolve(candidate.href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
