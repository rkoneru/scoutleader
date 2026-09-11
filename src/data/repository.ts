/**
 * Storage boundary. Everything above this interface is the same whether the
 * app is running against Supabase or against on-device storage.
 */

import type { Scenario } from '../domain/scenario';
import type {
  AttemptChoice,
  DimensionDeltas,
  DimensionScores,
  Rank,
  Role,
  Scout,
  ScenarioAttempt,
  SkillProfile,
} from '../domain/types';

export interface ScoutDraft {
  name: string;
  rank: Rank;
  current_role: Role;
}

export interface AttemptDraft {
  scenario_id: string;
  choices_made: AttemptChoice[];
  score_deltas: DimensionDeltas;
}

export interface SessionState {
  scout: Scout;
  profile: SkillProfile;
  attempts: ScenarioAttempt[];
}

export interface Repository {
  /** 'supabase' when a project is configured and signed in, otherwise 'local'. */
  readonly kind: 'local' | 'supabase';

  /** Scenario library. Remote content wins over the bundled copy when present. */
  loadScenarios(): Promise<Scenario[]>;

  /** Everything the app needs for the signed-in scout, or null if there isn't one. */
  loadSession(): Promise<SessionState | null>;

  createScout(draft: ScoutDraft): Promise<Scout>;
  updateScout(patch: Partial<ScoutDraft>): Promise<Scout>;

  saveProfile(scores: DimensionScores, calibratedAt?: string): Promise<SkillProfile>;
  recordAttempt(draft: AttemptDraft): Promise<ScenarioAttempt>;

  /** Local mode only: wipes the on-device scout. Supabase mode signs out. */
  reset(): Promise<void>;
}

export class NoScoutError extends Error {
  constructor() {
    super('No scout is set up yet');
    this.name = 'NoScoutError';
  }
}
