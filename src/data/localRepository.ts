/**
 * On-device repository. Used when no Supabase project is configured, and as
 * the storage layer for the "try it without an account" path.
 *
 * The storage interface is injected so the whole thing is testable with a plain
 * Map instead of AsyncStorage.
 */

import { ALL_SCENARIOS } from '../content';
import type { Scenario } from '../domain/scenario';
import {
  emptyScores,
  type DimensionScores,
  type Scout,
  type ScenarioAttempt,
  type SkillProfile,
} from '../domain/types';
import { BASELINE_SCORE } from '../engine/scoring';
import {
  NoScoutError,
  type AttemptDraft,
  type Repository,
  type ScoutDraft,
  type SessionState,
} from './repository';

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const KEY = 'scoutleader/v1/state';

interface PersistedState {
  scout: Scout;
  profile: SkillProfile;
  attempts: ScenarioAttempt[];
}

export class LocalRepository implements Repository {
  readonly kind = 'local' as const;

  constructor(
    private readonly store: KeyValueStore,
    private readonly library: Scenario[] = ALL_SCENARIOS,
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly newId: () => string = defaultId,
  ) {}

  async loadScenarios(): Promise<Scenario[]> {
    return this.library;
  }

  async loadSession(): Promise<SessionState | null> {
    const state = await this.read();
    return state ? { ...state } : null;
  }

  async createScout(draft: ScoutDraft): Promise<Scout> {
    const timestamp = this.now();
    const scout: Scout = {
      id: this.newId(),
      name: draft.name.trim(),
      rank: draft.rank,
      current_role: draft.current_role,
      troop_id: null,
      created_at: timestamp,
    };
    const profile: SkillProfile = {
      ...emptyScores(BASELINE_SCORE),
      scout_id: scout.id,
      updated_at: timestamp,
      calibrated_at: null,
    };
    await this.write({ scout, profile, attempts: [] });
    return scout;
  }

  async updateScout(patch: Partial<ScoutDraft>): Promise<Scout> {
    const state = await this.require();
    const scout: Scout = {
      ...state.scout,
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.rank !== undefined ? { rank: patch.rank } : {}),
      ...(patch.current_role !== undefined ? { current_role: patch.current_role } : {}),
    };
    await this.write({ ...state, scout });
    return scout;
  }

  async saveProfile(scores: DimensionScores, calibratedAt?: string): Promise<SkillProfile> {
    const state = await this.require();
    const profile: SkillProfile = {
      ...state.profile,
      ...scores,
      updated_at: this.now(),
      calibrated_at: calibratedAt ?? state.profile.calibrated_at,
    };
    await this.write({ ...state, profile });
    return profile;
  }

  async recordAttempt(draft: AttemptDraft): Promise<ScenarioAttempt> {
    const state = await this.require();
    const attempt: ScenarioAttempt = {
      id: this.newId(),
      scout_id: state.scout.id,
      scenario_id: draft.scenario_id,
      choices_made: draft.choices_made,
      score_deltas: draft.score_deltas,
      completed_at: this.now(),
    };
    await this.write({ ...state, attempts: [attempt, ...state.attempts] });
    return attempt;
  }

  async reset(): Promise<void> {
    await this.store.removeItem(KEY);
  }

  private async read(): Promise<PersistedState | null> {
    const raw = await this.store.getItem(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedState;
    } catch {
      // Corrupt local state is not worth crashing over — start clean.
      await this.store.removeItem(KEY);
      return null;
    }
  }

  private async require(): Promise<PersistedState> {
    const state = await this.read();
    if (!state) throw new NoScoutError();
    return state;
  }

  private async write(state: PersistedState): Promise<void> {
    await this.store.setItem(KEY, JSON.stringify(state));
  }
}

function defaultId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `local-${Date.now().toString(36)}-${random}`;
}
