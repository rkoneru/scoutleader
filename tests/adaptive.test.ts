import { describe, expect, it } from 'vitest';

import { TRAINING_SCENARIOS } from '../src/content';
import type { Scenario } from '../src/domain/scenario';
import { emptyScores, type ScenarioAttempt } from '../src/domain/types';
import { rankScenarios, selectNextScenario } from '../src/engine/adaptive';

function scenario(overrides: Partial<Scenario> & Pick<Scenario, 'id'>): Scenario {
  return {
    kind: 'training',
    title: overrides.id,
    summary: '',
    setting: '',
    role_relevance: ['PL'],
    rank_relevance: ['first_class'],
    primary_dimensions: ['planning'],
    estimated_minutes: 3,
    branching_tree: {
      version: 1,
      root: 'a',
      nodes: {
        a: {
          id: 'a',
          type: 'decision',
          prompt: 'x',
          choices: [
            { id: 'one', text: 'one', deltas: { planning: 1 }, coaching: { text: 'x' }, next: 'end' },
            { id: 'two', text: 'two', deltas: { planning: -1 }, coaching: { text: 'y' }, next: 'end' },
          ],
        },
        end: { id: 'end', type: 'outcome', prompt: 'done', debrief: 'done' },
      },
    },
    ...overrides,
  };
}

function attempt(scenarioId: string): ScenarioAttempt {
  return {
    id: `${scenarioId}-attempt`,
    scout_id: 'scout',
    scenario_id: scenarioId,
    choices_made: [],
    score_deltas: {},
    completed_at: new Date().toISOString(),
  };
}

describe('rankScenarios', () => {
  it('prefers the scenario that targets the weakest dimension', () => {
    const scores = { ...emptyScores(80), delegation: 15 };
    const candidates = [
      scenario({ id: 'planning-one', primary_dimensions: ['planning'] }),
      scenario({ id: 'delegation-one', primary_dimensions: ['delegation'] }),
    ];
    const top = selectNextScenario(candidates, {
      scores,
      role: 'PL',
      rank: 'first_class',
      attempts: [],
    });
    expect(top?.scenario.id).toBe('delegation-one');
    expect(top?.focusDimension).toBe('delegation');
  });

  it('prefers the scenario written for the scout\'s role when need is equal', () => {
    const candidates = [
      scenario({ id: 'for-spl', role_relevance: ['SPL'] }),
      scenario({ id: 'for-pl', role_relevance: ['PL'] }),
    ];
    const top = selectNextScenario(candidates, {
      scores: emptyScores(50),
      role: 'PL',
      rank: 'first_class',
      attempts: [],
    });
    expect(top?.scenario.id).toBe('for-pl');
  });

  it('weighs rank relevance softly — a near-miss still beats a far miss', () => {
    const candidates = [
      scenario({ id: 'near', rank_relevance: ['star'] }),
      scenario({ id: 'far', rank_relevance: ['scout'] }),
    ];
    const ranked = rankScenarios(candidates, {
      scores: emptyScores(50),
      role: 'PL',
      rank: 'life',
      attempts: [],
    });
    expect(ranked[0].scenario.id).toBe('near');
    // Both stay in play — rank never filters a scenario out.
    expect(ranked.map((item) => item.scenario.id)).toContain('far');
  });

  it('pushes an already-played scenario down but keeps it available', () => {
    const candidates = [
      scenario({ id: 'played' }),
      scenario({ id: 'fresh', primary_dimensions: ['communication'] }),
    ];
    const scores = { ...emptyScores(80), planning: 10 };
    const ranked = rankScenarios(candidates, {
      scores,
      role: 'PL',
      rank: 'first_class',
      attempts: [attempt('played')],
    });
    expect(ranked[0].scenario.id).toBe('fresh');
    expect(ranked).toHaveLength(2);
    expect(ranked[1].attemptCount).toBe(1);
  });

  it('penalises a third play more than a second', () => {
    const candidates = [scenario({ id: 'repeat' })];
    const context = { scores: emptyScores(50), role: 'PL' as const, rank: 'first_class' as const };
    const once = rankScenarios(candidates, { ...context, attempts: [attempt('repeat')] })[0];
    const twice = rankScenarios(candidates, {
      ...context,
      attempts: [attempt('repeat'), attempt('repeat')],
    })[0];
    expect(twice.score).toBeLessThan(once.score);
  });

  it('excludes calibration scenarios from training selection', () => {
    const candidates = [
      scenario({ id: 'calib', kind: 'calibration' }),
      scenario({ id: 'training' }),
    ];
    const ranked = rankScenarios(candidates, {
      scores: emptyScores(50),
      role: 'PL',
      rank: 'first_class',
      attempts: [],
    });
    expect(ranked.map((item) => item.scenario.id)).toEqual(['training']);
  });

  it('is deterministic for the same inputs', () => {
    const context = {
      scores: { ...emptyScores(50), initiative: 22 },
      role: 'SPL' as const,
      rank: 'life' as const,
      attempts: [],
    };
    const first = rankScenarios(TRAINING_SCENARIOS, context).map((item) => item.scenario.id);
    const second = rankScenarios(TRAINING_SCENARIOS, context).map((item) => item.scenario.id);
    expect(first).toEqual(second);
  });

  it('adapts to role across the real library', () => {
    const scores = emptyScores(50);
    const asSpl = selectNextScenario(TRAINING_SCENARIOS, {
      scores,
      role: 'SPL',
      rank: 'life',
      attempts: [],
    });
    const asPl = selectNextScenario(TRAINING_SCENARIOS, {
      scores,
      role: 'PL',
      rank: 'first_class',
      attempts: [],
    });
    expect(asSpl?.scenario.role_relevance).toContain('SPL');
    expect(asPl?.scenario.role_relevance).toContain('PL');
    expect(asSpl?.scenario.id).not.toBe(asPl?.scenario.id);
  });

  it('never recommends the same scenario twice in a row across a long run', () => {
    const attempts: ScenarioAttempt[] = [];
    const scores = emptyScores(50);
    let previous: string | null = null;
    for (let i = 0; i < 10; i += 1) {
      const next = selectNextScenario(TRAINING_SCENARIOS, {
        scores,
        role: 'PL',
        rank: 'first_class',
        attempts,
      });
      expect(next).not.toBeNull();
      expect(next!.scenario.id).not.toBe(previous);
      previous = next!.scenario.id;
      attempts.push(attempt(previous));
    }
  });
});
