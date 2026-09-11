/**
 * Single app-wide store. Holds the repository, the scenario library, and the
 * signed-in scout's profile and history, and owns the two write paths that
 * change scores: finishing the calibration assessment and finishing a training
 * scenario.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { CALIBRATION_SCENARIOS } from '../content';
import { createRepository, type AttemptDraft, type Repository, type ScoutDraft } from '../data';
import { SupabaseRepository } from '../data/supabaseRepository';
import type { Scenario } from '../domain/scenario';
import type {
  DimensionDeltas,
  DimensionScores,
  Scout,
  ScenarioAttempt,
  SkillProfile,
} from '../domain/types';
import { rankScenarios, type RankedScenario } from '../engine/adaptive';
import { applyTrainingDeltas, profileFromCalibration } from '../engine/scoring';
import { isSupabaseConfigured } from '../lib/env';
import { getSupabaseClient } from '../lib/supabase';

export type Stage = 'loading' | 'signed-out' | 'onboarding' | 'assessment' | 'ready';

interface AppState {
  stage: Stage;
  error: string | null;
  scout: Scout | null;
  profile: SkillProfile | null;
  attempts: ScenarioAttempt[];
  scenarios: Scenario[];
  calibrationScenarios: Scenario[];
  repositoryKind: Repository['kind'];
  supabaseEnabled: boolean;
}

interface AppActions {
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    draft: ScoutDraft,
    troopCode: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  /** Finishes setup. `troopCode` is required in Supabase mode, ignored locally. */
  registerScout: (draft: ScoutDraft, troopCode?: string) => Promise<void>;
  updateScout: (patch: Partial<ScoutDraft>) => Promise<void>;
  completeCalibration: (deltas: DimensionDeltas[], attempts: AttemptDraft[]) => Promise<void>;
  completeScenario: (draft: AttemptDraft) => Promise<DimensionScores>;
  recommendations: () => RankedScenario[];
  signOut: () => Promise<void>;
  clearError: () => void;
}

type AppContextValue = AppState & AppActions;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const repositoryRef = useRef<Repository | null>(null);
  if (!repositoryRef.current) repositoryRef.current = createRepository();
  const repository = repositoryRef.current;

  const supabaseEnabled = isSupabaseConfigured();

  const [stage, setStage] = useState<Stage>('loading');
  const [error, setError] = useState<string | null>(null);
  const [scout, setScout] = useState<Scout | null>(null);
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [attempts, setAttempts] = useState<ScenarioAttempt[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [library, session] = await Promise.all([
        repository.loadScenarios(),
        repository.loadSession(),
      ]);
      setScenarios(library);

      if (!session) {
        setScout(null);
        setProfile(null);
        setAttempts([]);
        // A signed-in user with no scout row confirmed their email but never
        // finished setup, so send them to onboarding rather than back to
        // sign-in, which would loop.
        setStage(supabaseEnabled && !(await hasAuthUser()) ? 'signed-out' : 'onboarding');
        return;
      }

      setScout(session.scout);
      setProfile(session.profile);
      setAttempts(session.attempts);
      setStage(session.profile.calibrated_at ? 'ready' : 'assessment');
    } catch (caught) {
      setError(messageOf(caught));
      setStage(supabaseEnabled ? 'signed-out' : 'onboarding');
    }
  }, [repository, supabaseEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep the app in step with sign-in/out that happens outside our own calls
  // (token refresh failures, sign-out from another screen).
  useEffect(() => {
    if (!supabaseEnabled) return;
    const client = getSupabaseClient();
    if (!client) return;
    const { data } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh, supabaseEnabled]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase is not configured');
      const { error: authError } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw new Error(authError.message);
      await refresh();
    },
    [refresh],
  );

  const signUp = useCallback(
    async (email: string, password: string, draft: ScoutDraft, troopCode: string) => {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase is not configured');

      const { data, error: authError } = await client.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) throw new Error(authError.message);

      // With email confirmation on, there is no session yet, so the troop join
      // has to wait until the first sign-in.
      if (!data.session) {
        return { needsEmailConfirmation: true };
      }

      if (repository instanceof SupabaseRepository) {
        await repository.registerWithTroopCode(draft, troopCode);
      }
      await refresh();
      return { needsEmailConfirmation: false };
    },
    [refresh, repository],
  );

  const registerScout = useCallback(
    async (draft: ScoutDraft, troopCode?: string) => {
      if (repository instanceof SupabaseRepository) {
        if (!troopCode?.trim()) throw new Error('A troop join code is required');
        await repository.registerWithTroopCode(draft, troopCode);
      } else {
        await repository.createScout(draft);
      }
      await refresh();
    },
    [refresh, repository],
  );

  const updateScout = useCallback(
    async (patch: Partial<ScoutDraft>) => {
      const updated = await repository.updateScout(patch);
      setScout(updated);
    },
    [repository],
  );

  const completeCalibration = useCallback(
    async (deltas: DimensionDeltas[], attemptDrafts: AttemptDraft[]) => {
      const scores = profileFromCalibration(deltas);
      const saved = await repository.saveProfile(scores, new Date().toISOString());
      setProfile(saved);

      // Recorded so the assessment shows up in history. Calibration scenarios
      // are excluded from adaptive selection by kind, not by attempt count.
      const recorded: ScenarioAttempt[] = [];
      for (const draft of attemptDrafts) {
        try {
          recorded.push(await repository.recordAttempt(draft));
        } catch {
          // A dropped assessment attempt is not worth blocking onboarding.
        }
      }
      setAttempts((previous) => [...recorded, ...previous]);
      setStage('ready');
    },
    [repository],
  );

  const completeScenario = useCallback(
    async (draft: AttemptDraft) => {
      if (!profile) throw new Error('No profile loaded');
      const nextScores = applyTrainingDeltas(profile, draft.score_deltas);
      const [saved, attempt] = await Promise.all([
        repository.saveProfile(nextScores),
        repository.recordAttempt(draft),
      ]);
      setProfile(saved);
      setAttempts((previous) => [attempt, ...previous]);
      return nextScores;
    },
    [profile, repository],
  );

  const recommendations = useCallback((): RankedScenario[] => {
    if (!profile || !scout) return [];
    return rankScenarios(scenarios, {
      scores: profile,
      role: scout.current_role,
      rank: scout.rank,
      attempts,
    });
  }, [attempts, profile, scenarios, scout]);

  const signOut = useCallback(async () => {
    await repository.reset();
    await refresh();
  }, [refresh, repository]);

  const calibrationScenarios = useMemo(() => {
    const remote = scenarios.filter((scenario) => scenario.kind === 'calibration');
    return remote.length ? remote : CALIBRATION_SCENARIOS;
  }, [scenarios]);

  const value: AppContextValue = {
    stage,
    error,
    scout,
    profile,
    attempts,
    scenarios,
    calibrationScenarios,
    repositoryKind: repository.kind,
    supabaseEnabled,
    refresh,
    signIn,
    signUp,
    registerScout,
    updateScout,
    completeCalibration,
    completeScenario,
    recommendations,
    signOut,
    clearError: () => setError(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside an AppProvider');
  return value;
}

async function hasAuthUser(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  const { data } = await client.auth.getSession();
  return !!data.session?.user;
}

function messageOf(caught: unknown): string {
  if (caught instanceof Error) return caught.message;
  return String(caught);
}
