import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LogOut, QrCode, ScanLine, Star, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/auth/AuthProvider';
import { AccountQrDialog } from '@/components/AccountQrDialog';
import { AppleSignInButton } from '@/components/AppleSignInButton';
import { AuthDivider } from '@/components/AuthDivider';
import { Avatar } from '@/components/Avatar';
import { BackFooter } from '@/components/BackFooter';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmailAuthForm } from '@/components/EmailAuthForm';
import { QrScannerDialog } from '@/components/QrScannerDialog';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/LanguageProvider';
import { colors, radius, spacing } from '@/theme';

function formatDate(value: string | null | undefined, locale: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const { t, language } = useI18n();
  const { isConfigured, isLoading, session, profile, friends, error, signOut, addFriend, removeFriend } = useAuth();
  const [signOutVisible, setSignOutVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scanFailed, setScanFailed] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<(typeof friends)[number] | null>(null);

  const name = profile?.name?.trim() || t('common.unknown');
  const points = profile?.points ?? 0;
  const gamesPlayed = profile?.games_played ?? 0;
  const firstLogin = formatDate(profile?.first_login, language);

  return (
    <Screen
      topBar={
        <>
          <View style={styles.topBarSide}>
            {session ? (
              <Pressable
                onPress={() => setSignOutVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={t('settings.signOut')}
                hitSlop={8}
                style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
              >
                <LogOut size={18} color="#2A0707" />
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={[styles.topBarSide, styles.topBarSideRight]}>
            {session ? (
              <Pressable
                onPress={() => {
                  setScanMessage(null);
                  setScanFailed(false);
                  setScannerVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('profile.scanQr')}
                hitSlop={8}
                style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]}
              >
                <ScanLine size={18} color={colors.text} />
              </Pressable>
            ) : null}
          </View>
        </>
      }
      footer={<BackFooter />}
      contentStyle={styles.content}
    >
      {!isConfigured ? (
        <View style={styles.card}>
          <Text style={styles.hint}>{t('profile.notConfigured')}</Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.hint}>{t('profile.loading')}</Text>
        </View>
      ) : session ? (
        <>
          <View style={styles.hero}>
            <Avatar name={name} color={colors.accent} size={76} />
            <Text style={styles.name}>{name}</Text>
            <View style={styles.pointsPill}>
              <Star size={15} color={colors.accent} fill={colors.accent} />
              <Text style={styles.pointsText}>{t('settings.accountPoints', { n: points })}</Text>
            </View>
            <Pressable
              onPress={() => setQrVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={t('profile.showQr')}
              style={({ pressed }) => [styles.qrButton, pressed && styles.pressed]}
            >
              <QrCode size={16} color={colors.text} />
              <Text style={styles.qrButtonText}>{t('profile.showQr')}</Text>
            </Pressable>
          </View>

          {scanMessage ? (
            <Text accessibilityLiveRegion="polite" style={[styles.scanMessage, scanFailed && styles.scanMessageError]}>
              {scanMessage}
            </Text>
          ) : null}

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.name')}</Text>
              <Text style={styles.rowValue}>{name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.points')}</Text>
              <Text style={styles.rowValue}>{points}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.gamesPlayed')}</Text>
              <Text style={styles.rowValue}>{gamesPlayed}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('profile.firstLogin')}</Text>
              <Text style={styles.rowValue}>{firstLogin ?? t('common.unknown')}</Text>
            </View>
          </View>

          <View style={styles.friendsCard}>
            <View style={styles.friendsHeader}>
              <Text style={styles.friendsTitle}>{t('profile.friends')}</Text>
              <Text style={styles.friendsCount}>{friends.length}</Text>
            </View>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <View key={friend.friend_id} style={styles.friendRow}>
                  <Avatar name={friend.name} color={colors.success} size={36} />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName} numberOfLines={1}>
                      {friend.name}
                    </Text>
                    <View style={styles.friendPointsRow}>
                      <Star size={12} color={colors.accent} fill={colors.accent} />
                      <Text style={styles.friendPoints}>
                        {t('profile.friendPoints', { n: friend.points ?? 0 })}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => setFriendToRemove(friend)}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('profile.removeFriend')}: ${friend.name}`}
                    hitSlop={8}
                    style={({ pressed }) => [styles.removeFriendButton, pressed && styles.pressed]}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={styles.friendsEmpty}>{t('profile.noFriends')}</Text>
            )}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      ) : (
        <>
          <View style={styles.hero}>
            <Avatar name={t('profile.guest')} color={colors.muted} size={76} />
            <Text style={styles.name}>{t('profile.notSignedIn')}</Text>
            <Text style={styles.hint}>{t('profile.signInHint')}</Text>
          </View>

          <AppleSignInButton />
          <AuthDivider />

          <View style={styles.authCard}>
            <EmailAuthForm />
          </View>
        </>
      )}

      <ConfirmDialog
        visible={signOutVisible}
        title={t('profile.signOutTitle')}
        message={t('profile.signOutMessage')}
        confirmLabel={t('settings.signOut')}
        destructive
        onConfirm={() => {
          setSignOutVisible(false);
          setScanMessage(null);
          setScanFailed(false);
          void signOut().then(() => router.replace('/'));
        }}
        onCancel={() => setSignOutVisible(false)}
      />

      <ConfirmDialog
        visible={friendToRemove !== null}
        title={t('profile.removeFriendTitle')}
        message={t('profile.removeFriendMessage', { name: friendToRemove?.name ?? '' })}
        confirmLabel={t('profile.removeFriendConfirm')}
        destructive
        onConfirm={() => {
          const friend = friendToRemove;
          setFriendToRemove(null);
          if (friend) void removeFriend(friend.friend_id);
        }}
        onCancel={() => setFriendToRemove(null)}
      />

      {session ? (
        <>
          <AccountQrDialog
            visible={qrVisible}
            userId={session.user.id}
            name={name}
            onClose={() => setQrVisible(false)}
          />
          <QrScannerDialog
            visible={scannerVisible}
            onClose={() => setScannerVisible(false)}
            onScanned={(userId) => {
              setScannerVisible(false);
              setScanMessage(null);
              setScanFailed(false);

              if (userId === session.user.id) {
                setScanFailed(true);
                setScanMessage(t('profile.friendSelf'));
                return;
              }

              if (friends.some((friend) => friend.friend_id === userId)) {
                setScanMessage(t('profile.friendAlready'));
                return;
              }

              void addFriend(userId).then((friend) => {
                if (friend) {
                  setScanMessage(t('profile.friendAdded', { name: friend.name }));
                } else {
                  setScanFailed(true);
                  setScanMessage(t('profile.scanFailed'));
                }
              });
            }}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'flex-start' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  topBarSide: { width: 44, alignItems: 'flex-start' },
  topBarSideRight: { alignItems: 'flex-end' },
  signOutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.75 },
  loading: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  name: { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  pointsText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  qrButtonText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  scanMessage: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    textAlign: 'center',
  },
  scanMessageError: { color: colors.danger },
  friendsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  friendsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  friendsTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  friendsCount: { color: colors.muted, fontSize: 13, fontWeight: '800' },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  friendInfo: { flex: 1, gap: 2 },
  friendName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  friendPointsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  friendPoints: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  removeFriendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
  },
  friendsEmpty: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  hint: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  rowLabel: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '800', flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
