/**
 * Training home: the adaptively selected next scenario up top, then the rest of
 * the library ranked the same way.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { DIMENSION_LABELS, ROLE_LABELS, RANK_LABELS } from '../domain/types';
import { averageScore, rankedByNeed } from '../engine/scoring';
import type { ScreenProps } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { Button, Card, Chip, Screen, Text } from '../ui/components';
import { colors, dimensionColors, radius, spacing } from '../ui/theme';

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const { scout, profile, attempts, recommendations } = useApp();
  const ranked = useMemo(() => recommendations(), [recommendations]);

  if (!scout || !profile) return null;

  const [next, ...rest] = ranked;
  const weakest = rankedByNeed(profile)[0];
  const completed = new Set(attempts.map((attempt) => attempt.scenario_id)).size;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="display">{scout.name}</Text>
          <Text variant="small" tone="muted">
            {ROLE_LABELS[scout.current_role]} · {RANK_LABELS[scout.rank]}
          </Text>
        </View>
        <Button
          variant="secondary"
          label="Profile"
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        />
      </View>

      <Card style={styles.summary}>
        <View style={styles.summaryRow}>
          <Summary label="SCENARIOS DONE" value={`${completed}`} />
          <Summary label="OVERALL" value={`${Math.round(averageScore(profile))}`} />
          <Summary
            label="WORKING ON"
            value={DIMENSION_LABELS[weakest]}
            color={dimensionColors[weakest]}
          />
        </View>
      </Card>

      {next ? (
        <View>
          <Text variant="label" tone="muted" style={styles.sectionLabel}>
            NEXT UP
          </Text>
          <Card
            onPress={() => navigation.navigate('Scenario', { scenarioId: next.scenario.id })}
            accessibilityLabel={`Start ${next.scenario.title}`}
            style={styles.nextCard}
          >
            <Text variant="title">{next.scenario.title}</Text>
            <Text variant="small" tone="muted" style={styles.setting}>
              {next.scenario.setting}
            </Text>
            <Text variant="body" style={styles.summaryText}>
              {next.scenario.summary}
            </Text>
            <View style={styles.chips}>
              {next.scenario.primary_dimensions.map((dimension) => (
                <Chip
                  key={dimension}
                  label={DIMENSION_LABELS[dimension]}
                  color={dimensionColors[dimension]}
                />
              ))}
              <Chip label={`${next.scenario.estimated_minutes} min`} color={colors.textMuted} />
            </View>
            <Text variant="small" tone="muted" style={styles.reason}>
              Picked because it {next.reason}
            </Text>
          </Card>
        </View>
      ) : (
        <Card>
          <Text variant="body">No scenarios loaded.</Text>
        </Card>
      )}

      <Text variant="label" tone="muted" style={styles.sectionLabel}>
        ALSO WORTH DOING
      </Text>
      {rest.map((item) => (
        <Card
          key={item.scenario.id}
          onPress={() => navigation.navigate('Scenario', { scenarioId: item.scenario.id })}
          accessibilityLabel={`Start ${item.scenario.title}`}
          style={styles.listCard}
        >
          <View style={styles.listRow}>
            <View style={styles.listText}>
              <Text variant="bodyStrong">{item.scenario.title}</Text>
              <Text variant="small" tone="muted" style={styles.listSummary}>
                {item.scenario.summary}
              </Text>
            </View>
            {item.attemptCount > 0 ? (
              <View style={styles.doneBadge}>
                <Text variant="smallStrong" tone="muted">
                  {item.attemptCount}×
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.chips}>
            {item.scenario.primary_dimensions.map((dimension) => (
              <Chip
                key={dimension}
                label={DIMENSION_LABELS[dimension]}
                color={dimensionColors[dimension]}
              />
            ))}
          </View>
        </Card>
      ))}

      <Button
        variant="secondary"
        label="Companion mode"
        onPress={() => navigation.navigate('Companion')}
        style={styles.companion}
      />
    </Screen>
  );
}

function Summary({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="heading" style={color ? { color } : undefined}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.lg },
  headerText: { flex: 1 },
  profileButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 40 },
  summary: { marginBottom: spacing.xl, paddingVertical: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  summaryItem: { flex: 1 },
  sectionLabel: { marginBottom: spacing.sm, marginTop: spacing.md },
  nextCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  setting: { marginTop: spacing.xs },
  summaryText: { marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  reason: { marginTop: spacing.md },
  listCard: { marginBottom: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'flex-start' },
  listText: { flex: 1 },
  listSummary: { marginTop: 2 },
  doneBadge: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  companion: { marginTop: spacing.lg },
});
