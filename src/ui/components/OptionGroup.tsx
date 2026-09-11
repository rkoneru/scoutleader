import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import { Text } from './Text';

export interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string> {
  label: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** Lays options out in a wrapping row instead of a stack. */
  compact?: boolean;
}

export function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  compact,
}: Props<T>) {
  return (
    <View style={styles.group}>
      <Text variant="label" tone="muted" style={styles.label}>
        {label.toUpperCase()}
      </Text>
      <View style={compact ? styles.wrap : undefined}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                compact ? styles.compactOption : styles.option,
                selected && styles.selected,
                pressed && styles.pressed,
              ]}
            >
              <Text variant="bodyStrong" tone={selected ? 'inverse' : 'default'}>
                {option.label}
              </Text>
              {option.hint ? (
                <Text
                  variant="small"
                  tone={selected ? 'inverse' : 'muted'}
                  style={styles.hint}
                >
                  {option.hint}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing.xl },
  label: { marginBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  compactOption: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.8 },
  hint: { marginTop: 2 },
});
