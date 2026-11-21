import { useAuth } from '@/auth/AuthProvider';
import { AppleNameDialog } from '@/components/AppleNameDialog';
import { hasConfirmedProfileName, isReservedProfileName } from '@/lib/profileName';

export function ProfileNameGate() {
  const { session, profile } = useAuth();
  const isAppleUser = session?.user.app_metadata?.provider === 'apple';
  const needsName = !!session && isAppleUser && !hasConfirmedProfileName(session.user);

  if (!needsName) return null;

  const savedName = profile?.name?.trim();
  const initialName = savedName && !isReservedProfileName(savedName) ? savedName : '';

  return (
    <AppleNameDialog
      initialName={initialName}
      currentName={profile?.name ?? null}
      onSaved={() => undefined}
    />
  );
}
