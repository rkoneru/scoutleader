/**
 * The calibration assessment: six short situations, one decision each, no
 * coaching in between. The deltas collected here set the starting profile.
 */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { AttemptDraft } from '../data';
import { DIMENSIONS, DIMENSION_BLURBS, DIMENSION_LABELS } from '../domain/types';
import type { DimensionDeltas } from '../domain/types';
import { profileFromCalibration } from '../engine/scoring';
import type { ScenarioSession } from '../engine/session';
import { sessionDeltas } from '../engine/session';
import { useApp } from '../state/AppContext';
import { Button, Card, DimensionBar, Screen, ScenarioPlayer, Text } from '../ui/components';
import { colors, spacing } from '../ui/theme';

type Phase = 'intro' | 'running' | 'results';

export function AssessmentScreen() {
  const { calibrationScenarios, completeCalibration, scout } = useApp();
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [deltas, setDeltas] = useState<DimensionDeltas[]>([]);
  const [drafts, setDrafts] = useState<AttemptDraft[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenarios = calibrationScenarios;
  const scores = useMemo(() => profileFromCalibration(deltas), [deltas]);

  const handleFinish = (session: ScenarioSession) => {
    const collected = sessionDeltas(session);
    const nextDeltas = [...deltas, collected];
    const nextDrafts: AttemptDraft[] = [
      ...drafts,
      {
        scenario_id: session.scenarioId,
        choices_made: session.history,
        score_deltas: collected,
      },
    ];
    setDeltas(nextDeltas);
    setDrafts(nextDrafts);

    if (index + 1 >= scenarios.length) {
      setPhase('results');
      return;
    }
    setIndex(index + 1);
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await completeCalibration(deltas, drafts);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setBusy(false);
    }
  };

  if (phase === 'intro') {
    return (
      <Screen footer={<Button label="Start" onPress={() => setPhase('running')} />}>
        <Text variant="display">Where you are now</Text>
        <Text variant="body" tone="muted" style={styles.intro}>
          {scenarios.length} situations, one decision each, about four minutes total. Pick what you
          would actually do, not what sounds best. Nothing here is pass or fail — it decides which
          training you get first.
        </Text>

        <Text variant="label" tone="muted" style={styles.sectionLabel}>
          WHAT IT MEASURES
        </Text>
        {DIMENSIONS.map((dimension) => (
          <Card key={dimension} style={styles.dimensionCard}>
            <Text variant="bodyStrong">{DIMENSION_LABELS[dimension]}</Text>
            <Text variant="small" tone="muted" style={styles.blurb}>
              {DIMENSION_BLURBS[dimension]}
            </Text>
          </Card>
        ))}
      </Screen>
    );
  }

  if (phase === 'running') {
    const scenario = scenarios[index];
    return (
      <View style={styles.playerRoot}>
        <ScenarioPlayer
          key={scenario.id}
          scenario={scenario}
          mode="calibration"
          eyebrow={`Situation ${index + 1} of ${scenarios.length}`}
          onFinish={handleFinish}
        />
      </View>
    );
  }

  return (
    <Screen footer={<Button label="Go to training" onPress={save} busy={busy} />}>
      <Text variant="display">Your starting point</Text>
      <Text variant="body" tone="muted" style={styles.intro}>
        {scout ? `${scout.name}, this` : 'This'} is where you are starting. Everything moves as you
        train — the lower numbers just decide what comes up first.
      </Text>

      <Card>
        {DIMENSIONS.map((dimension) => (
          <DimensionBar key={dimension} dimension={dimension} score={scores[dimension]} />
        ))}
      </Card>

      {error ? (
        <Text variant="small" tone="negative" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: spacing.sm, marginBottom: spacing.xl },
  sectionLabel: { marginBottom: spacing.sm },
  dimensionCard: { marginBottom: spacing.md },
  blurb: { marginTop: spacing.xs },
  playerRoot: { flex: 1, backgroundColor: colors.background },
  error: { marginTop: spacing.md },
});
