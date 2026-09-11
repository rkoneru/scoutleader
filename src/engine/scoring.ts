/**
 * Score maths. Pure functions, no I/O — everything here is unit tested.
 *
 * Scores live on a 0-100 scale where 50 is "about what you'd expect from a
 * scout who just took the position". There is no pass mark and no win state:
 * the numbers exist to steer scenario selection and to show movement.
 */

import {
  DIMENSIONS,
  emptyScores,
  type Dimension,
  type DimensionDeltas,
  type DimensionScores,
} from '../domain/types';

export const BASELINE_SCORE = 50;

/** How far one calibration answer can move a starting score. */
export const CALIBRATION_WEIGHT = 8;

/** Base step for a training choice before the gain factor is applied. */
export const TRAINING_STEP = 2.5;

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Gains shrink as a score climbs, so a scout cannot grind one dimension to
 * 100 by replaying the same easy branch. Losses always land at full weight.
 */
export function gainFactor(currentScore: number): number {
  const raw = 0.35 + ((100 - currentScore) / 100) * 0.9;
  return Math.max(0.35, Math.min(1.25, raw));
}

export function applyTrainingDeltas(
  scores: DimensionScores,
  deltas: DimensionDeltas,
): DimensionScores {
  const next = { ...scores };
  for (const dimension of DIMENSIONS) {
    const delta = deltas[dimension];
    if (!delta) continue;
    const weighted =
      delta > 0 ? delta * TRAINING_STEP * gainFactor(next[dimension]) : delta * TRAINING_STEP;
    next[dimension] = clampScore(round1(next[dimension] + weighted));
  }
  return next;
}

/**
 * Turns the raw deltas collected during the calibration assessment into a
 * starting profile. Dimensions the assessment never touched stay at baseline.
 */
export function profileFromCalibration(deltas: DimensionDeltas[]): DimensionScores {
  const totals = emptyScores(0);
  const counts = emptyScores(0);

  for (const entry of deltas) {
    for (const dimension of DIMENSIONS) {
      const delta = entry[dimension];
      if (delta === undefined) continue;
      totals[dimension] += delta;
      counts[dimension] += 1;
    }
  }

  const scores = emptyScores(BASELINE_SCORE);
  for (const dimension of DIMENSIONS) {
    if (counts[dimension] === 0) continue;
    const average = totals[dimension] / counts[dimension];
    scores[dimension] = clampScore(round1(BASELINE_SCORE + average * CALIBRATION_WEIGHT));
  }
  return scores;
}

export function mergeDeltas(entries: DimensionDeltas[]): DimensionDeltas {
  const merged: DimensionDeltas = {};
  for (const entry of entries) {
    for (const dimension of DIMENSIONS) {
      const delta = entry[dimension];
      if (delta === undefined) continue;
      merged[dimension] = round1((merged[dimension] ?? 0) + delta);
    }
  }
  return merged;
}

/** Dimensions ordered weakest first. Ties break alphabetically for determinism. */
export function rankedByNeed(scores: DimensionScores): Dimension[] {
  return [...DIMENSIONS].sort((a, b) => scores[a] - scores[b] || a.localeCompare(b));
}

export function weakestDimension(scores: DimensionScores): Dimension {
  return rankedByNeed(scores)[0];
}

export function averageScore(scores: DimensionScores): number {
  const total = DIMENSIONS.reduce((sum, dimension) => sum + scores[dimension], 0);
  return round1(total / DIMENSIONS.length);
}

/** Plain-language band for a single score. Shown next to the bars. */
export function scoreBand(score: number): 'building' | 'steady' | 'strong' {
  if (score < 45) return 'building';
  if (score < 70) return 'steady';
  return 'strong';
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
