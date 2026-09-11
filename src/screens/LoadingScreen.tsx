import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '../ui/components';
import { colors, spacing } from '../ui/theme';

export function LoadingScreen() {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text variant="small" tone="muted" style={styles.label}>
        Loading your patrol
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: spacing.md },
});
