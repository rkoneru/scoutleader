/**
 * Setup: name, rank, current or target leadership role — plus the troop join
 * code when the app is running against Supabase. In local mode nothing here
 * leaves the device.
 */

import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { RANK_LABELS, RANKS, ROLE_BLURBS, ROLE_LABELS, ROLES, type Rank, type Role } from '../domain/types';
import { useApp } from '../state/AppContext';
import { Button, OptionGroup, Screen, Text, type Option } from '../ui/components';
import { colors, radius, spacing, type as typeScale } from '../ui/theme';

const rankOptions: Option<Rank>[] = RANKS.map((rank) => ({
  value: rank,
  label: RANK_LABELS[rank],
}));

const roleOptions: Option<Role>[] = ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
  hint: ROLE_BLURBS[role],
}));

export function OnboardingScreen() {
  const { registerScout, supabaseEnabled } = useApp();
  const [name, setName] = useState('');
  const [troopCode, setTroopCode] = useState('');
  const [rank, setRank] = useState<Rank>('first_class');
  const [role, setRole] = useState<Role>('PL');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setError('Put your name in so the app knows who it is tracking.');
      return;
    }
    if (supabaseEnabled && !troopCode.trim()) {
      setError('Your troop join code is required. Ask your SPL or Scoutmaster for it.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await registerScout({ name, rank, current_role: role }, troopCode);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setBusy(false);
    }
  };

  return (
    <Screen
      footer={<Button label="Start the assessment" onPress={submit} busy={busy} />}
    >
      <Text variant="display">Set up</Text>
      <Text variant="body" tone="muted" style={styles.intro}>
        Three questions, then six short situations that figure out where you are starting from.
        There is no score to pass.
      </Text>

      <Text variant="label" tone="muted" style={styles.label}>
        NAME
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="What your patrol calls you"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="words"
        returnKeyType="done"
      />

      {supabaseEnabled ? (
        <View style={styles.spacer}>
          <Text variant="label" tone="muted" style={styles.label}>
            TROOP JOIN CODE
          </Text>
          <TextInput
            value={troopCode}
            onChangeText={setTroopCode}
            placeholder="e.g. T412-ELK"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
      ) : null}

      <View style={styles.spacer} />

      <OptionGroup label="Rank" options={rankOptions} value={rank} onChange={setRank} compact />
      <OptionGroup
        label="Position you are in, or going for"
        options={roleOptions}
        value={role}
        onChange={setRole}
      />

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
  label: { marginBottom: spacing.sm },
  input: {
    ...typeScale.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  spacer: { marginTop: spacing.xl },
  error: { marginTop: spacing.sm },
});
