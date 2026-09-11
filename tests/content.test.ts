import { describe, expect, it } from 'vitest';

import { ALL_SCENARIOS, CALIBRATION_SCENARIOS, TRAINING_SCENARIOS } from '../src/content';
import { DELTA_RANGE, isDecisionNode } from '../src/domain/scenario';
import { DIMENSIONS, ROLES } from '../src/domain/types';
import { formatIssues, validateLibrary } from '../src/engine/validate';
import { maxDepth } from '../src/engine/session';

describe('scenario library', () => {
  it('passes structural validation', () => {
    const issues = validateLibrary(ALL_SCENARIOS);
    expect(issues.length, `\n${formatIssues(issues)}`).toBe(0);
  });

  it('ships 5-8 calibration scenarios and 10-15 training scenarios', () => {
    expect(CALIBRATION_SCENARIOS.length).toBeGreaterThanOrEqual(5);
    expect(CALIBRATION_SCENARIOS.length).toBeLessThanOrEqual(8);
    expect(TRAINING_SCENARIOS.length).toBeGreaterThanOrEqual(10);
    expect(TRAINING_SCENARIOS.length).toBeLessThanOrEqual(15);
  });

  it('covers every dimension in calibration', () => {
    const covered = new Set(CALIBRATION_SCENARIOS.flatMap((s) => s.primary_dimensions));
    for (const dimension of DIMENSIONS) {
      expect(covered.has(dimension), `calibration never measures ${dimension}`).toBe(true);
    }
  });

  it('covers every dimension and every role in training', () => {
    const dimensions = new Set(TRAINING_SCENARIOS.flatMap((s) => s.primary_dimensions));
    for (const dimension of DIMENSIONS) {
      expect(dimensions.has(dimension), `no training scenario targets ${dimension}`).toBe(true);
    }
    const roles = new Set(TRAINING_SCENARIOS.flatMap((s) => s.role_relevance));
    for (const role of ROLES) {
      expect(roles.has(role), `no training scenario is written for ${role}`).toBe(true);
    }
  });

  it('gives every training scenario real branching, not a single decision', () => {
    for (const scenario of TRAINING_SCENARIOS) {
      expect(maxDepth(scenario), `${scenario.id} is only one decision deep`).toBeGreaterThanOrEqual(2);
    }
  });

  it('offers a meaningful spread of deltas on every decision', () => {
    for (const scenario of ALL_SCENARIOS) {
      for (const node of Object.values(scenario.branching_tree.nodes)) {
        if (!isDecisionNode(node)) continue;
        const sums = node.choices.map((choice) =>
          Object.values(choice.deltas).reduce((total, delta) => total + delta, 0),
        );
        expect(
          Math.max(...sums) - Math.min(...sums),
          `${scenario.id}/${node.id} choices are scored identically`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('keeps authored deltas inside the documented range', () => {
    for (const scenario of ALL_SCENARIOS) {
      for (const node of Object.values(scenario.branching_tree.nodes)) {
        if (!isDecisionNode(node)) continue;
        for (const choice of node.choices) {
          for (const delta of Object.values(choice.deltas)) {
            expect(delta).toBeGreaterThanOrEqual(DELTA_RANGE.min);
            expect(delta).toBeLessThanOrEqual(DELTA_RANGE.max);
          }
        }
      }
    }
  });

  it('writes coaching for every single choice', () => {
    for (const scenario of ALL_SCENARIOS) {
      for (const node of Object.values(scenario.branching_tree.nodes)) {
        if (!isDecisionNode(node)) continue;
        for (const choice of node.choices) {
          expect(
            choice.coaching.text.length,
            `${scenario.id}/${node.id}/${choice.id} has thin coaching`,
          ).toBeGreaterThan(40);
        }
      }
    }
  });
});
