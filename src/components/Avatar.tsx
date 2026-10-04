import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/theme';

// const AVATAR_STYLE = 'toon-head';
const AVATAR_STYLE = 'critters';

type AvatarProps = {
  /** Doubles as the DiceBear seed, so one name always yields one face. */
  name: string;
  color: string;
  size?: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** DiceBear avatar with a coloured initial badge as offline/error fallback. */
export function Avatar({ name, color, size = 44 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const url = `https://api.dicebear.com/10.x/${AVATAR_STYLE}/png?seed=${encodeURIComponent(name)}&backgroundColor=16161a&radius=50`;

  if (failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceAlt }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  initials: { color: '#10131A', fontWeight: '900' },
});