import React from 'react';
import { StyleSheet, View } from 'react-native';

import { DIMENSION_LABELS, type Dimension } from '../../domain/types';
import { scoreBand } from '../../engine/scoring';
import { colors, dimensionColors, radius, spacing } from '../theme';
import { Text } from './Text';

interface Props {
  dimension: Dimension;
  score: number;
  /** Movement from the last scenario, shown as a signed number when present. */
  delta?: number;
}

const bandLabels = {
  building: 'Building',
  steady: 'Steady',
  strong: 'Strong',
} as const;

export function DimensionBar({ dimension, score, delta }: Props) {
  const color = dimensionColors[dimension];
  const width = `${Math.max(2, Math.min(100, score))}%` as const;

  return (
    <View style={styles.row} accessibilityRole="progressbar"
      accessibilityLabel={`${DIMENSION_LABELS[dimension]}: ${Math.round(score)} out of 100`}>
      <View style={styles.header}>
        <Text variant="bodyStrong">{DIMENSION_LABELS[dimension]}</Text>
        <View style={styles.values}>
          {delta !== undefined && delta !== 0 && (
            <Text
              variant="smallStrong"
              tone={delta > 0 ? 'positive' : 'negative'}
              style={styles.delta}
            >
              {delta > 0 ? '+' : ''}
              {Math.round(delta * 10) / 10}
            </Text>
          )}
          <Text variant="bodyStrong">{Math.round(score)}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
      <Text variant="small" tone="muted">
        {bandLabels[scoreBand(score)]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  values: { flexDirection: 'row', alignItems: 'center' },
  delta: { marginRight: spacing.sm },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
