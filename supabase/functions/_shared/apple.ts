const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token';
const APPLE_REVOKE_URL = 'https://appleid.apple.com/auth/revoke';

type AppleConfig = {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKey: string;
};

type AppleTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
};

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlText(value: string): string {
  return base64Url(new TextEncoder().encode(value));
}

function pemToBytes(pem: string): Uint8Array {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function getAppleConfig(): AppleConfig | null {
  const clientId = Deno.env.get('APPLE_CLIENT_ID')?.trim();
  const teamId = Deno.env.get('APPLE_TEAM_ID')?.trim();
  const keyId = Deno.env.get('APPLE_KEY_ID')?.trim();
  const privateKey = Deno.env.get('APPLE_PRIVATE_KEY')?.replace(/\\n/g, '\n').trim();

  if (!clientId || !teamId || !keyId || !privateKey) return null;
  return { clientId, teamId, keyId, privateKey };
}

async function createClientSecret(config: AppleConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlText(JSON.stringify({ alg: 'ES256', kid: config.keyId, typ: 'JWT' }));
  const payload = base64UrlText(
    JSON.stringify({
      iss: config.teamId,
      iat: now,
      exp: now + 60 * 60 * 24 * 180,
      aud: 'https://appleid.apple.com',
      sub: config.clientId,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(config.privateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64Url(new Uint8Array(signature))}`;
}

export function isAppleConfigured(): boolean {
  return getAppleConfig() !== null;
}

export async function exchangeAuthorizationCode(code: string): Promise<AppleTokenResponse> {
  const config = getAppleConfig();
  if (!config) throw new Error('Apple is niet geconfigureerd');

  const response = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: await createClientSecret(config),
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple token exchange mislukt: ${await response.text()}`);
  }

  return (await response.json()) as AppleTokenResponse;
}

export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  const config = getAppleConfig();
  if (!config) return false;

  const response = await fetch(APPLE_REVOKE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: await createClientSecret(config),
      token: refreshToken,
      token_type_hint: 'refresh_token',
    }),
  });

  if (!response.ok) {
    console.error('[apple] token intrekken mislukt', await response.text());
    return false;
  }

  return true;
}
