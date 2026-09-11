/**
 * Companion mode — out of scope for this build. Navigation entry point only.
 */

import React from 'react';
import { StyleSheet } from 'react-native';

import type { ScreenProps } from '../navigation/types';
import { Button, Card, Screen, Text } from '../ui/components';
import { spacing } from '../ui/theme';

export function CompanionScreen({ navigation }: ScreenProps<'Companion'>) {
  return (
    <Screen footer={<Button label="Back to training" onPress={() => navigation.goBack()} />}>
      <Text variant="display">Companion mode</Text>
      <Text variant="body" tone="muted" style={styles.intro}>
        Not built yet. This is where real-task guidance will live — walking you through an actual
        duty roster, meeting plan, or campout as you run it, instead of a practice scenario.
      </Text>

      <Card>
        <Text variant="label" tone="muted">
          PLANNED
        </Text>
        <Text variant="body" style={styles.item}>
          Live checklists tied to your patrol and the trip you are on.
        </Text>
        <Text variant="body" style={styles.item}>
          Coaching prompts based on the dimensions you are weakest in.
        </Text>
        <Text variant="body" style={styles.item}>
          Patrol roster and duty assignment, using the patrols table that is already in the schema.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: spacing.sm, marginBottom: spacing.xl },
  item: { marginTop: spacing.md },
});
