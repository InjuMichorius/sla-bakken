import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import type { Player, Team } from '@/game/types';
import { translateDefaultPlayerName, useI18n } from '@/i18n/LanguageProvider';
import { colors, spacing } from '@/theme';

type TurnHeaderProps = {
  team: Team;
  player: Player;
  color: string;
  trailing: ReactNode;
};

export function TurnHeader({ team, player, color, trailing }: TurnHeaderProps) {
  const { t, language } = useI18n();

  return (
    <View style={styles.headRow}>
      <Avatar name={translateDefaultPlayerName(player.name, language)} color={color} size={58} />
      <View style={styles.headText}>
        <View style={styles.headLabelRow}>
          <Text style={styles.headLabel}>{t('words.turnOf')}</Text>
          <Badge color={color}>{team.name}</Badge>
        </View>
        <Text style={styles.headName} numberOfLines={1}>
          {translateDefaultPlayerName(player.name, language)}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headText: { flex: 1 },
  headLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  headName: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginTop: spacing.sm },
});
