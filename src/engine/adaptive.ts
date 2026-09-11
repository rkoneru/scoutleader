/**
 * Adaptive scenario selection.
 *
 * Ranking is a weighted sum of four signals, multiplied by a repeat penalty:
 *
 *   need     (0.45) — how far the scenario's primary dimensions are below 100
 *   role     (0.30) — does it target the scout's current leadership position
 *   rank     (0.15) — does the situation fit where they are in advancement
 *   breadth  (0.10) — nudges toward dimensions they have seen least often
 *
 * The result is deterministic: same profile and history, same ordering. Ties
 * break on scenario id so tests and the UI agree.
 */

import type { Scenario } from '../domain/scenario';
import {
  DIMENSIONS,
  type Dimension,
  type Rank,
  type Role,
  RANKS,
  type DimensionScores,
  type ScenarioAttempt,
} from '../domain/types';

export const WEIGHTS = {
  need: 0.45,
  role: 0.3,
  rank: 0.15,
  breadth: 0.1,
} as const;

/** Multiplier applied by how many times the scout has already played it. */
export const REPEAT_PENALTY = [1, 0.35, 0.15] as const;

export interface SelectionContext {
  scores: DimensionScores;
  role: Role;
  rank: Rank;
  attempts: ScenarioAttempt[];
}

export interface RankedScenario {
  scenario: Scenario;
  score: number;
  attemptCount: number;
  /** Dimension that earned this scenario its place, for the "why this one" line. */
  focusDimension: Dimension;
  reason: string;
  components: {
    need: number;
    role: number;
    rank: number;
    breadth: number;
    repeatPenalty: number;
  };
}

export function rankScenarios(
  scenarios: Scenario[],
  context: SelectionContext,
): RankedScenario[] {
  const attemptCounts = countAttempts(context.attempts);
  const exposure = dimensionExposure(scenarios, context.attempts);

  return scenarios
    .filter((scenario) => scenario.kind === 'training')
    .map((scenario) => score(scenario, context, attemptCounts, exposure))
    .sort((a, b) => b.score - a.score || a.scenario.id.localeCompare(b.scenario.id));
}

export function selectNextScenario(
  scenarios: Scenario[],
  context: SelectionContext,
): RankedScenario | null {
  return rankScenarios(scenarios, context)[0] ?? null;
}

function score(
  scenario: Scenario,
  context: SelectionContext,
  attemptCounts: Map<string, number>,
  exposure: Map<Dimension, number>,
): RankedScenario {
  const need = needComponent(scenario, context.scores);
  const role = roleComponent(scenario, context.role);
  const rank = rankComponent(scenario, context.rank);
  const breadth = breadthComponent(scenario, exposure);

  const attemptCount = attemptCounts.get(scenario.id) ?? 0;
  const repeatPenalty =
    REPEAT_PENALTY[Math.min(attemptCount, REPEAT_PENALTY.length - 1)];

  const total =
    (WEIGHTS.need * need +
      WEIGHTS.role * role +
      WEIGHTS.rank * rank +
      WEIGHTS.breadth * breadth) *
    repeatPenalty;

  const focusDimension = weakestOf(scenario.primary_dimensions, context.scores);

  return {
    scenario,
    score: Number(total.toFixed(4)),
    attemptCount,
    focusDimension,
    reason: explain(scenario, context, focusDimension, attemptCount),
    components: { need, role, rank, breadth, repeatPenalty },
  };
}

/** Average shortfall across the scenario's primary dimensions, normalised 0-1. */
function needComponent(scenario: Scenario, scores: DimensionScores): number {
  const dimensions = scenario.primary_dimensions.length
    ? scenario.primary_dimensions
    : [...DIMENSIONS];
  const total = dimensions.reduce((sum, d) => sum + (100 - scores[d]) / 100, 0);
  return total / dimensions.length;
}

function roleComponent(scenario: Scenario, role: Role): number {
  return scenario.role_relevance.includes(role) ? 1 : 0.25;
}

/**
 * Rank relevance is soft: an exact match scores full, a near-miss on the
 * advancement ladder still scores most of the way, a far miss scores little.
 */
function rankComponent(scenario: Scenario, rank: Rank): number {
  if (scenario.rank_relevance.includes(rank)) return 1;
  const index = RANKS.indexOf(rank);
  const distances = scenario.rank_relevance.map((r) => Math.abs(RANKS.indexOf(r) - index));
  const nearest = distances.length ? Math.min(...distances) : RANKS.length;
  return Math.max(0.2, 1 - nearest * 0.25);
}

/** Favours dimensions the scout has practised least, to keep coverage even. */
function breadthComponent(scenario: Scenario, exposure: Map<Dimension, number>): number {
  const max = Math.max(1, ...exposure.values());
  const dimensions = scenario.primary_dimensions.length
    ? scenario.primary_dimensions
    : [...DIMENSIONS];
  const total = dimensions.reduce((sum, d) => sum + (1 - (exposure.get(d) ?? 0) / max), 0);
  return total / dimensions.length;
}

function countAttempts(attempts: ScenarioAttempt[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const attempt of attempts) {
    counts.set(attempt.scenario_id, (counts.get(attempt.scenario_id) ?? 0) + 1);
  }
  return counts;
}

function dimensionExposure(
  scenarios: Scenario[],
  attempts: ScenarioAttempt[],
): Map<Dimension, number> {
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const exposure = new Map<Dimension, number>(DIMENSIONS.map((d) => [d, 0]));
  for (const attempt of attempts) {
    const scenario = byId.get(attempt.scenario_id);
    if (!scenario) continue;
    for (const dimension of scenario.primary_dimensions) {
      exposure.set(dimension, (exposure.get(dimension) ?? 0) + 1);
    }
  }
  return exposure;
}

function weakestOf(dimensions: Dimension[], scores: DimensionScores): Dimension {
  const pool = dimensions.length ? dimensions : [...DIMENSIONS];
  return [...pool].sort((a, b) => scores[a] - scores[b] || a.localeCompare(b))[0];
}

function explain(
  scenario: Scenario,
  context: SelectionContext,
  focusDimension: Dimension,
  attemptCount: number,
): string {
  const labels: Record<Dimension, string> = {
    communication: 'communication',
    conflict_resolution: 'conflict resolution',
    delegation: 'delegation',
    planning: 'planning',
    initiative: 'initiative',
  };
  const parts: string[] = [`works your ${labels[focusDimension]}`];
  if (scenario.role_relevance.includes(context.role)) {
    parts.push(`written for a ${context.role}`);
  }
  if (attemptCount > 0) {
    parts.push(attemptCount === 1 ? 'played once before' : `played ${attemptCount} times before`);
  }
  return parts.join(' · ');
}
