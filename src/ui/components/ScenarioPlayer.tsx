/**
 * Renders one scenario: the situation, the choices, the coaching card after a
 * choice, and the closing debrief. Used by both the calibration assessment and
 * training mode — calibration just runs without coaching cards.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  DIMENSION_LABELS,
  EDGE_LABELS,
  type Dimension,
  type DimensionDeltas,
} from '../../domain/types';
import type { Scenario } from '../../domain/scenario';
import {
  advance,
  chooseOption,
  currentDecision,
  currentOutcome,
  maxDepth,
  startSession,
  type ScenarioSession,
} from '../../engine/session';
import { colors, dimensionColors, radius, spacing } from '../theme';
import { Button } from './Button';
import { Card } from './Card';
import { Text } from './Text';

interface Props {
  scenario: Scenario;
  mode?: 'training' | 'calibration';
  /** Rendered above the situation, e.g. "Question 3 of 6". */
  eyebrow?: string;
  onFinish: (session: ScenarioSession) => void;
  finishLabel?: string;
}

export function ScenarioPlayer({
  scenario,
  mode = 'training',
  eyebrow,
  onFinish,
  finishLabel = 'Finish',
}: Props) {
  const [session, setSession] = useState<ScenarioSession>(() => startSession(scenario));
  const depth = useMemo(() => maxDepth(scenario), [scenario]);

  const decision = currentDecision(scenario, session);
  const outcome = currentOutcome(scenario, session);
  const coaching = session.pendingCoaching;

  const handleChoice = (choiceId: string) => {
    const chosen = chooseOption(scenario, session, choiceId);
    if (mode === 'calibration') {
      // No coaching card during the assessment — keep it moving.
      const next = advance(scenario, chosen);
      if (next.finished) {
        onFinish(next);
        return;
      }
      setSession(next);
      return;
    }
    setSession(chosen);
  };

  const handleContinue = () => setSession(advance(scenario, session));

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        {eyebrow ? (
          <Text variant="label" tone="muted">
            {eyebrow.toUpperCase()}
          </Text>
        ) : null}
        <Text variant="title" style={styles.title}>
          {scenario.title}
        </Text>
        <Text variant="small" tone="muted">
          {scenario.setting}
        </Text>
        {mode === 'training' && depth > 1 ? (
          <ProgressDots total={depth} done={session.history.length} />
        ) : null}
      </View>

      {coaching ? (
        <View>
          <Card style={styles.chosenCard}>
            <Text variant="label" tone="muted">
              YOU CHOSE
            </Text>
            <Text variant="body" style={styles.chosenText}>
              {coaching.choiceText}
            </Text>
          </Card>

          <Card style={styles.coachingCard}>
            {coaching.coaching.principle ? (
              <Text variant="label" tone="primary" style={styles.principle}>
                {coaching.coaching.principle.toUpperCase()}
              </Text>
            ) : null}
            <Text variant="body">{coaching.coaching.text}</Text>
            <View style={styles.metaRow}>
              {coaching.coaching.edge_stage ? (
                <View style={styles.edgeTag}>
                  <Text variant="smallStrong" tone="primary">
                    EDGE · {EDGE_LABELS[coaching.coaching.edge_stage]}
                  </Text>
                </View>
              ) : null}
              <DeltaRow deltas={coaching.deltas} />
            </View>
          </Card>

          <Button label="Continue" onPress={handleContinue} style={styles.action} />
        </View>
      ) : decision ? (
        <View>
          <Card style={styles.promptCard}>
            <Text variant="body">{decision.prompt}</Text>
            {decision.line && decision.speaker ? (
              <View style={styles.quote}>
                <Text variant="body" style={styles.quoteText}>
                  {decision.line}
                </Text>
                <Text variant="small" tone="muted">
                  — {decision.speaker}
                </Text>
              </View>
            ) : null}
          </Card>

          <Text variant="label" tone="muted" style={styles.choicesLabel}>
            WHAT DO YOU DO?
          </Text>

          {decision.choices.map((choice) => (
            <Pressable
              key={choice.id}
              accessibilityRole="button"
              onPress={() => handleChoice(choice.id)}
              style={({ pressed }) => [styles.choice, pressed && styles.choicePressed]}
            >
              <Text variant="body">{choice.text}</Text>
            </Pressable>
          ))}
        </View>
      ) : outcome ? (
        <View>
          <Card style={styles.promptCard}>
            <Text variant="label" tone="muted">
              HOW IT WENT
            </Text>
            <Text variant="body" style={styles.chosenText}>
              {outcome.prompt}
            </Text>
          </Card>

          <Card style={styles.debriefCard}>
            <Text variant="label" tone="primary" style={styles.principle}>
              {outcome.edge_focus ? `EDGE · ${EDGE_LABELS[outcome.edge_focus]}` : 'DEBRIEF'}
            </Text>
            <Text variant="body">{outcome.debrief}</Text>
          </Card>

          <Button label={finishLabel} onPress={() => onFinish(session)} style={styles.action} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function ProgressDots({ total, done }: { total: number; done: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index < done ? styles.dotFilled : undefined]}
        />
      ))}
    </View>
  );
}

function DeltaRow({ deltas }: { deltas: DimensionDeltas }) {
  const entries = Object.entries(deltas) as [Dimension, number][];
  if (!entries.length) return null;
  return (
    <View style={styles.deltas}>
      {entries.map(([dimension, delta]) => (
        <View
          key={dimension}
          style={[styles.deltaPill, { borderColor: dimensionColors[dimension] }]}
        >
          <Text variant="smallStrong" style={{ color: dimensionColors[dimension] }}>
            {DIMENSION_LABELS[dimension]} {delta > 0 ? '+' : ''}
            {delta}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  title: { marginTop: spacing.xs, marginBottom: spacing.xs },
  dots: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  dot: {
    width: 22,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  dotFilled: { backgroundColor: colors.primary },
  promptCard: { marginBottom: spacing.lg },
  quote: {
    marginTop: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.md,
  },
  quoteText: { fontStyle: 'italic', marginBottom: 2 },
  choicesLabel: { marginBottom: spacing.sm },
  choice: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  choicePressed: { backgroundColor: colors.surfaceMuted, opacity: 0.95 },
  chosenCard: { marginBottom: spacing.md, backgroundColor: colors.surfaceMuted },
  chosenText: { marginTop: spacing.xs },
  coachingCard: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  debriefCard: { borderLeftWidth: 4, borderLeftColor: colors.accent },
  principle: { marginBottom: spacing.sm },
  metaRow: { marginTop: spacing.md },
  edgeTag: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  deltas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  deltaPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  action: { marginTop: spacing.lg },
});
