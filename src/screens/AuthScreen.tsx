/**
 * Supabase mode: sign in, or sign up with a troop join code.
 *
 * The join code is how a scout gets attached to a troop — register_scout()
 * resolves it server-side, so a wrong code fails without telling the app
 * anything about which troops exist.
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import {
  RANK_LABELS,
  RANKS,
  ROLE_BLURBS,
  ROLE_LABELS,
  ROLES,
  type Rank,
  type Role,
} from '../domain/types';
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

export function AuthScreen() {
  const { signIn, signUp } = useApp();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [troopCode, setTroopCode] = useState('');
  const [rank, setRank] = useState<Rank>('first_class');
  const [role, setRole] = useState<Role>('PL');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('Email and password are both required.');
      return;
    }
    if (mode === 'sign-up' && (!name.trim() || !troopCode.trim())) {
      setError('Your name and your troop join code are both required.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'sign-in') {
        await signIn(email, password);
      } else {
        const result = await signUp(
          email,
          password,
          { name, rank, current_role: role },
          troopCode,
        );
        if (result.needsEmailConfirmation) {
          setNotice(
            'Check your email for a confirmation link, then come back and sign in. You will pick your troop on the way in.',
          );
          setMode('sign-in');
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen
        footer={
          <View>
            <Button
              label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
              onPress={submit}
              busy={busy}
            />
            <Button
              variant="ghost"
              label={
                mode === 'sign-in'
                  ? 'New here? Join with a troop code'
                  : 'Already have an account? Sign in'
              }
              onPress={() => {
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
                setError(null);
              }}
              style={styles.switch}
            />
          </View>
        }
      >
        <Text variant="display">Patrol Leadership</Text>
        <Text variant="body" tone="muted" style={styles.intro}>
          {mode === 'sign-in'
            ? 'Sign in to pick up where you left off.'
            : 'Your troop gives out a join code. Ask your SPL or Scoutmaster if you do not have one.'}
        </Text>

        <Field label="EMAIL">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </Field>

        <Field label="PASSWORD">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
          />
        </Field>

        {mode === 'sign-up' ? (
          <View>
            <Field label="NAME">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="What your patrol calls you"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="words"
              />
            </Field>

            <Field label="TROOP JOIN CODE">
              <TextInput
                value={troopCode}
                onChangeText={setTroopCode}
                placeholder="e.g. T412-ELK"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </Field>

            <View style={styles.spacer} />

            <OptionGroup
              label="Rank"
              options={rankOptions}
              value={rank}
              onChange={setRank}
              compact
            />
            <OptionGroup
              label="Position you are in, or going for"
              options={roleOptions}
              value={role}
              onChange={setRole}
            />
          </View>
        ) : null}

        {notice ? (
          <Text variant="small" tone="primary" style={styles.message}>
            {notice}
          </Text>
        ) : null}
        {error ? (
          <Text variant="small" tone="negative" style={styles.message}>
            {error}
          </Text>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text variant="label" tone="muted" style={styles.fieldLabel}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { marginTop: spacing.sm, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  fieldLabel: { marginBottom: spacing.sm },
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
  spacer: { height: spacing.md },
  message: { marginTop: spacing.sm },
  switch: { marginTop: spacing.xs },
});
