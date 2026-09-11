/**
 * Supabase-backed repository. Content comes from the `scenarios` table when it
 * has rows (so content can be updated without an app release) and falls back to
 * the bundled library otherwise.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { ALL_SCENARIOS } from '../content';
import type { BranchingTree, Scenario, ScenarioKind } from '../domain/scenario';
import {
  type DimensionScores,
  type Rank,
  type Role,
  type Scout,
  type ScenarioAttempt,
  type SkillProfile,
} from '../domain/types';
import {
  NoScoutError,
  type AttemptDraft,
  type Repository,
  type ScoutDraft,
  type SessionState,
} from './repository';

interface ScenarioRow {
  id: string;
  kind: ScenarioKind;
  title: string;
  summary: string;
  setting: string;
  role_relevance: Role[];
  rank_relevance: Rank[];
  primary_dimensions: string[];
  estimated_minutes: number;
  branching_tree: BranchingTree;
}

export class SupabaseRepository implements Repository {
  readonly kind = 'supabase' as const;

  constructor(private readonly client: SupabaseClient) {}

  async loadScenarios(): Promise<Scenario[]> {
    const { data, error } = await this.client
      .from('scenarios')
      .select(
        'id, kind, title, summary, setting, role_relevance, rank_relevance, primary_dimensions, estimated_minutes, branching_tree',
      )
      .eq('is_published', true);

    if (error || !data?.length) {
      // Offline, unseeded, or unreadable — the bundled library still works.
      return ALL_SCENARIOS;
    }
    return (data as ScenarioRow[]).map(toScenario);
  }

  async loadSession(): Promise<SessionState | null> {
    const userId = await this.userId();
    if (!userId) return null;

    const [scoutResult, profileResult, attemptsResult] = await Promise.all([
      this.client.from('scouts').select('*').eq('id', userId).maybeSingle(),
      this.client.from('skill_profiles').select('*').eq('scout_id', userId).maybeSingle(),
      this.client
        .from('scenario_attempts')
        .select('*')
        .eq('scout_id', userId)
        .order('completed_at', { ascending: false }),
    ]);

    if (scoutResult.error) throw scoutResult.error;
    if (!scoutResult.data) return null;
    if (profileResult.error) throw profileResult.error;
    if (attemptsResult.error) throw attemptsResult.error;

    return {
      scout: scoutResult.data as Scout,
      profile: toProfile(profileResult.data, userId),
      attempts: (attemptsResult.data ?? []) as ScenarioAttempt[],
    };
  }

  /**
   * Completes sign-up for an already-authenticated user. `troopCode` is
   * required: register_scout resolves it to a troop id server-side, so the app
   * never reads the troops table.
   */
  async registerWithTroopCode(draft: ScoutDraft, troopCode: string): Promise<Scout> {
    const { data, error } = await this.client.rpc('register_scout', {
      p_name: draft.name.trim(),
      p_rank: draft.rank,
      p_role: draft.current_role,
      p_join_code: troopCode.trim(),
    });
    if (error) throw error;
    return data as Scout;
  }

  async createScout(draft: ScoutDraft): Promise<Scout> {
    const userId = await this.requireUserId();
    const { data, error } = await this.client
      .from('scouts')
      .insert({
        id: userId,
        name: draft.name.trim(),
        rank: draft.rank,
        current_role: draft.current_role,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Scout;
  }

  async updateScout(patch: Partial<ScoutDraft>): Promise<Scout> {
    const userId = await this.requireUserId();
    const { data, error } = await this.client
      .from('scouts')
      .update({
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.rank !== undefined ? { rank: patch.rank } : {}),
        ...(patch.current_role !== undefined ? { current_role: patch.current_role } : {}),
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Scout;
  }

  async saveProfile(scores: DimensionScores, calibratedAt?: string): Promise<SkillProfile> {
    const userId = await this.requireUserId();
    const { data, error } = await this.client
      .from('skill_profiles')
      .upsert(
        {
          scout_id: userId,
          ...scores,
          ...(calibratedAt ? { calibrated_at: calibratedAt } : {}),
        },
        { onConflict: 'scout_id' },
      )
      .select()
      .single();
    if (error) throw error;
    return toProfile(data, userId);
  }

  async recordAttempt(draft: AttemptDraft): Promise<ScenarioAttempt> {
    const userId = await this.requireUserId();
    const { data, error } = await this.client
      .from('scenario_attempts')
      .insert({
        scout_id: userId,
        scenario_id: draft.scenario_id,
        choices_made: draft.choices_made,
        score_deltas: draft.score_deltas,
      })
      .select()
      .single();
    if (error) throw error;
    return data as ScenarioAttempt;
  }

  async reset(): Promise<void> {
    await this.client.auth.signOut();
  }

  private async userId(): Promise<string | null> {
    const { data } = await this.client.auth.getUser();
    return data.user?.id ?? null;
  }

  private async requireUserId(): Promise<string> {
    const userId = await this.userId();
    if (!userId) throw new NoScoutError();
    return userId;
  }
}

function toScenario(row: ScenarioRow): Scenario {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    summary: row.summary,
    setting: row.setting,
    role_relevance: row.role_relevance ?? [],
    rank_relevance: row.rank_relevance ?? [],
    primary_dimensions: (row.primary_dimensions ?? []) as Scenario['primary_dimensions'],
    estimated_minutes: row.estimated_minutes,
    branching_tree: row.branching_tree,
  };
}

/** Postgres numeric comes back as a string through PostgREST. */
function toProfile(row: Record<string, unknown> | null, scoutId: string): SkillProfile {
  const num = (value: unknown): number => {
    const parsed = typeof value === 'string' ? Number.parseFloat(value) : (value as number);
    return Number.isFinite(parsed) ? parsed : 50;
  };
  return {
    scout_id: scoutId,
    communication: num(row?.communication),
    conflict_resolution: num(row?.conflict_resolution),
    delegation: num(row?.delegation),
    planning: num(row?.planning),
    initiative: num(row?.initiative),
    updated_at: (row?.updated_at as string) ?? new Date().toISOString(),
    calibrated_at: (row?.calibrated_at as string | null) ?? null,
  };
}
