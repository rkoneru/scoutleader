/**
 * Plays one training scenario, then saves the attempt and shows what moved.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { findScenario } from '../content';
import { DIMENSIONS, type DimensionScores } from '../domain/types';
import type { ScenarioSession } from '../engine/session';
import { sessionDeltas } from '../engine/session';
import type { ScreenProps } from '../navigation/types';
import { useApp } from '../state/AppContext';
import { Button, Card, DimensionBar, Screen, ScenarioPlayer, Text } from '../ui/components';
import { colors, spacing } from '../ui/theme';

export function ScenarioScreen({ navigation, route }: ScreenProps<'Scenario'>) {
  const { scenarios, profile, completeScenario } = useApp();
  const { scenarioId } = route.params;

  const scenario = useMemo(() => findScenario(scenarioId, scenarios), [scenarioId, scenarios]);
  const [before] = useState<DimensionScores | null>(profile ? { ...profile } : null);
  const [after, setAfter] = useState<DimensionScores | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!scenario) {
    return (
      <Screen>
        <Text variant="title">Scenario not found</Text>
        <Text variant="body" tone="muted" style={styles.gap}>
          It may have been retired in a content update.
        </Text>
        <Button label="Back" onPress={() => navigation.goBack()} style={styles.gap} />
      </Screen>
    );
  }

  const handleFinish = async (session: ScenarioSession) => {
    setBusy(true);
    setError(null);
    try {
      const scores = await completeScenario({
        scenario_id: session.scenarioId,
        choices_made: session.history,
        score_deltas: sessionDeltas(session),
      });
      setAfter(scores);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  };

  if (after && before) {
    const moved = DIMENSIONS.filter(
      (dimension) => Math.abs(after[dimension] - before[dimension]) >= 0.05,
    );
    return (
      <Screen footer={<Button label="Done" onPress={() => navigation.navigate('Home')} />}>
        <Text variant="display">What moved</Text>
        <Text variant="body" tone="muted" style={styles.intro}>
          From the choices you made in {scenario.title}.
        </Text>
        <Card>
          {(moved.length ? moved : DIMENSIONS).map((dimension) => (
            <DimensionBar
              key={dimension}
              dimension={dimension}
              score={after[dimension]}
              delta={after[dimension] - before[dimension]}
            />
          ))}
        </Card>
        {error ? (
          <Text variant="small" tone="negative" style={styles.gap}>
            {error}
          </Text>
        ) : null}
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <ScenarioPlayer
        scenario={scenario}
        onFinish={handleFinish}
        finishLabel={busy ? 'Saving…' : 'Save and see what moved'}
      />
      {error ? (
        <View style={styles.errorBar}>
          <Text variant="small" tone="inverse">
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  intro: { marginTop: spacing.sm, marginBottom: spacing.xl },
  gap: { marginTop: spacing.lg },
  errorBar: { backgroundColor: colors.negative, padding: spacing.md },
});
