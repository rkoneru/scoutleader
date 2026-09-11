/**
 * The five dimension scores, role and rank, and recent history.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { findScenario } from '../content';
import {
  DIMENSIONS,
  DIMENSION_BLURBS,
  DIMENSION_LABELS,
  RANKS,
  RANK_LABELS,
  ROLES,
  ROLE_BLURBS,
  ROLE_LABELS,
  type Rank,
  type Role,
} from '../domain/types';
import { averageScore, rankedByNeed } from '../engine/scoring';
import type { ScreenProps } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { Button, Card, DimensionBar, OptionGroup, Screen, Text, type Option } from '../ui/components';
import { colors, dimensionColors, spacing } from '../ui/theme';

const rankOptions: Option<Rank>[] = RANKS.map((rank) => ({
  value: rank,
  label: RANK_LABELS[rank],
}));

const roleOptions: Option<Role>[] = ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
  hint: ROLE_BLURBS[role],
}));

export function ProfileScreen({ navigation }: ScreenProps<'Profile'>) {
  const { scout, profile, attempts, scenarios, updateScout, signOut, repositoryKind } = useApp();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const history = useMemo(
    () =>
      attempts.slice(0, 12).map((attempt) => ({
        attempt,
        scenario: findScenario(attempt.scenario_id, scenarios),
      })),
    [attempts, scenarios],
  );

  if (!scout || !profile) return null;

  const weakest = rankedByNeed(profile)[0];

  const change = async (patch: { rank?: Rank; current_role?: Role }) => {
    try {
      await updateScout(patch);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };

  return (
    <Screen>
      <Text variant="display">{scout.name}</Text>
      <Text variant="body" tone="muted" style={styles.subtitle}>
        {ROLE_LABELS[scout.current_role]} · {RANK_LABELS[scout.rank]} · overall{' '}
        {Math.round(averageScore(profile))}
      </Text>

      <Card style={styles.card}>
        {DIMENSIONS.map((dimension) => (
          <DimensionBar key={dimension} dimension={dimension} score={profile[dimension]} />
        ))}
        <View style={styles.focus}>
          <Text variant="smallStrong" style={{ color: dimensionColors[weakest] }}>
            Training is weighted toward {DIMENSION_LABELS[weakest]} right now
          </Text>
          <Text variant="small" tone="muted" style={styles.focusBlurb}>
            {DIMENSION_BLURBS[weakest]}
          </Text>
        </View>
      </Card>

      <Button
        variant="secondary"
        label={editing ? 'Done editing' : 'Change rank or position'}
        onPress={() => setEditing(!editing)}
        style={styles.card}
      />

      {editing ? (
        <Card style={styles.card}>
          <OptionGroup
            label="Rank"
            options={rankOptions}
            value={scout.rank}
            onChange={(rank) => change({ rank })}
            compact
          />
          <OptionGroup
            label="Position"
            options={roleOptions}
            value={scout.current_role}
            onChange={(current_role) => change({ current_role })}
          />
          <Text variant="small" tone="muted">
            Changing your position changes which scenarios come up first. Your scores stay.
          </Text>
        </Card>
      ) : null}

      <Text variant="label" tone="muted" style={styles.sectionLabel}>
        RECENT
      </Text>
      {history.length ? (
        history.map(({ attempt, scenario }) => (
          <Card key={attempt.id} style={styles.historyCard}>
            <Text variant="bodyStrong">{scenario?.title ?? attempt.scenario_id}</Text>
            <Text variant="small" tone="muted">
              {new Date(attempt.completed_at).toLocaleDateString()} ·{' '}
              {attempt.choices_made.length} decision
              {attempt.choices_made.length === 1 ? '' : 's'}
            </Text>
          </Card>
        ))
      ) : (
        <Card style={styles.historyCard}>
          <Text variant="body" tone="muted">
            Nothing yet.
          </Text>
        </Card>
      )}

      {error ? (
        <Text variant="small" tone="negative" style={styles.sectionLabel}>
          {error}
        </Text>
      ) : null}

      <Button
        variant="ghost"
        label={repositoryKind === 'supabase' ? 'Sign out' : 'Reset this device'}
        onPress={() => {
          void signOut().then(() => navigation.popToTop());
        }}
        style={styles.signOut}
      />
      <Text variant="small" tone="muted" center>
        {repositoryKind === 'supabase'
          ? 'Signed in — progress syncs to your troop account.'
          : 'Local mode — progress is stored on this device only.'}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl },
  card: { marginBottom: spacing.lg },
  focus: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  focusBlurb: { marginTop: spacing.xs },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  historyCard: { marginBottom: spacing.sm, paddingVertical: spacing.md },
  signOut: { marginTop: spacing.xl },
});
