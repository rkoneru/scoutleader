import { describe, expect, it } from 'vitest';

import { emptyScores } from '../src/domain/types';
import {
  BASELINE_SCORE,
  applyTrainingDeltas,
  averageScore,
  gainFactor,
  mergeDeltas,
  profileFromCalibration,
  rankedByNeed,
  scoreBand,
  weakestDimension,
} from '../src/engine/scoring';

describe('profileFromCalibration', () => {
  it('leaves untouched dimensions at baseline', () => {
    const scores = profileFromCalibration([{ communication: 2 }]);
    expect(scores.planning).toBe(BASELINE_SCORE);
    expect(scores.communication).toBeGreaterThan(BASELINE_SCORE);
  });

  it('averages repeated measurements of one dimension', () => {
    const scores = profileFromCalibration([{ planning: 3 }, { planning: -1 }]);
    // mean delta 1 * weight 8
    expect(scores.planning).toBe(58);
  });

  it('keeps a strong run and a weak run inside sane bounds', () => {
    const strong = profileFromCalibration([{ communication: 3 }, { communication: 3 }]);
    const weak = profileFromCalibration([{ communication: -3 }, { communication: -3 }]);
    expect(strong.communication).toBe(74);
    expect(weak.communication).toBe(26);
  });

  it('never produces a score outside 0-100', () => {
    const extreme = profileFromCalibration(Array.from({ length: 20 }, () => ({ initiative: 3 })));
    expect(extreme.initiative).toBeLessThanOrEqual(100);
    expect(extreme.initiative).toBeGreaterThanOrEqual(0);
  });
});

describe('applyTrainingDeltas', () => {
  it('moves only the named dimensions', () => {
    const before = emptyScores(50);
    const after = applyTrainingDeltas(before, { delegation: 2 });
    expect(after.delegation).toBeGreaterThan(50);
    expect(after.planning).toBe(50);
  });

  it('applies losses at full weight and gains at a reduced weight', () => {
    const before = emptyScores(50);
    const gained = applyTrainingDeltas(before, { planning: 2 });
    const lost = applyTrainingDeltas(before, { planning: -2 });
    expect(50 - lost.planning).toBeGreaterThan(gained.planning - 50);
  });

  it('makes gains smaller the higher the score already is', () => {
    const low = applyTrainingDeltas(emptyScores(20), { initiative: 2 });
    const high = applyTrainingDeltas(emptyScores(90), { initiative: 2 });
    expect(low.initiative - 20).toBeGreaterThan(high.initiative - 90);
  });

  it('clamps at both ends', () => {
    let scores = emptyScores(99);
    for (let i = 0; i < 50; i += 1) scores = applyTrainingDeltas(scores, { communication: 3 });
    expect(scores.communication).toBeLessThanOrEqual(100);

    let floor = emptyScores(2);
    for (let i = 0; i < 50; i += 1) floor = applyTrainingDeltas(floor, { communication: -3 });
    expect(floor.communication).toBe(0);
  });

  it('cannot be ground to 100 by one repeated +1 branch in a realistic number of plays', () => {
    let scores = emptyScores(50);
    for (let i = 0; i < 20; i += 1) scores = applyTrainingDeltas(scores, { delegation: 1 });
    expect(scores.delegation).toBeLessThan(100);
  });
});

describe('gainFactor', () => {
  it('stays inside its documented bounds', () => {
    for (let score = 0; score <= 100; score += 5) {
      expect(gainFactor(score)).toBeGreaterThanOrEqual(0.35);
      expect(gainFactor(score)).toBeLessThanOrEqual(1.25);
    }
  });
});

describe('helpers', () => {
  it('merges sparse deltas', () => {
    expect(mergeDeltas([{ planning: 1 }, { planning: 2, initiative: -1 }])).toEqual({
      planning: 3,
      initiative: -1,
    });
  });

  it('orders dimensions weakest first with a deterministic tie-break', () => {
    const scores = { ...emptyScores(50), planning: 10, initiative: 10 };
    expect(rankedByNeed(scores).slice(0, 2)).toEqual(['initiative', 'planning']);
    expect(weakestDimension(scores)).toBe('initiative');
  });

  it('averages and bands scores', () => {
    expect(averageScore(emptyScores(40))).toBe(40);
    expect(scoreBand(30)).toBe('building');
    expect(scoreBand(50)).toBe('steady');
    expect(scoreBand(80)).toBe('strong');
  });
});
