import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing, type as typeScale } from '../theme';
import { Text } from './Text';

interface Props {
  label: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, color = colors.primary, selected, onPress }: Props) {
  const content = (
    <Text
      style={[
        typeScale.smallStrong,
        { color: selected ? colors.textInverse : color },
      ]}
    >
      {label}
    </Text>
  );

  const style = [
    styles.chip,
    { borderColor: color },
    selected && { backgroundColor: color },
  ];

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [style, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignSelf: 'flex-start',
  },
  pressed: { opacity: 0.75 },
});
