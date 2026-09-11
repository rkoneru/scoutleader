import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, type as typeScale } from '../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, busy, style }: Props) {
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!busy }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      <View style={styles.inner}>
        {busy ? (
          <ActivityIndicator color={variant === 'primary' ? colors.textInverse : colors.primary} />
        ) : (
          <Text
            style={[
              typeScale.bodyStrong,
              { color: variant === 'primary' ? colors.textInverse : colors.primary },
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
};
