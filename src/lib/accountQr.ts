const ACCOUNT_QR_PREFIX = 'slabakken:account:';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function accountQrValue(userId: string): string {
  return `${ACCOUNT_QR_PREFIX}${userId}`;
}

export function accountIdFromQr(value: string): string | null {
  if (!value.startsWith(ACCOUNT_QR_PREFIX)) return null;

  const userId = value.slice(ACCOUNT_QR_PREFIX.length).trim().toLowerCase();
  return UUID_PATTERN.test(userId) ? userId : null;
}
