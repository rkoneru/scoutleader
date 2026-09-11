import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** Pinned to the bottom, outside the scroll area. */
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
}

export function Screen({ children, scroll = true, footer, contentStyle }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + (footer ? 0 : insets.bottom),
    paddingHorizontal: spacing.lg,
  };

  return (
    <View style={styles.root}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.static, padding, contentStyle]}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: spacing.lg + insets.bottom }]}>{footer}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  static: { flex: 1 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
