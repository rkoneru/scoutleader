import { describe, expect, it } from 'vitest';

import type { Scenario } from '../src/domain/scenario';
import { validateLibrary, validateScenario } from '../src/engine/validate';

function base(): Scenario {
  return {
    id: 'test-scenario',
    kind: 'training',
    title: 'Test',
    summary: 'A test.',
    setting: 'Somewhere',
    role_relevance: ['PL'],
    rank_relevance: ['first_class'],
    primary_dimensions: ['planning'],
    estimated_minutes: 2,
    branching_tree: {
      version: 1,
      root: 'start',
      nodes: {
        start: {
          id: 'start',
          type: 'decision',
          prompt: 'Something happens.',
          choices: [
            { id: 'a', text: 'A', deltas: { planning: 1 }, coaching: { text: 'ok' }, next: 'end' },
            { id: 'b', text: 'B', deltas: { planning: -1 }, coaching: { text: 'ok' }, next: 'end' },
          ],
        },
        end: { id: 'end', type: 'outcome', prompt: 'Over.', debrief: 'Learned.' },
      },
    },
  };
}

const messages = (scenario: Scenario) =>
  validateScenario(scenario).map((issue) => `${issue.path}: ${issue.message}`);

describe('validateScenario', () => {
  it('accepts a well-formed scenario', () => {
    expect(validateScenario(base())).toEqual([]);
  });

  it('rejects a dangling next pointer', () => {
    const scenario = base();
    (scenario.branching_tree.nodes.start as any).choices[0].next = 'missing';
    expect(messages(scenario).join()).toMatch(/missing node "missing"/);
  });

  it('rejects an unreachable node', () => {
    const scenario = base();
    scenario.branching_tree.nodes.orphan = {
      id: 'orphan',
      type: 'outcome',
      prompt: 'x',
      debrief: 'y',
    };
    expect(messages(scenario).join()).toMatch(/unreachable/);
  });

  it('rejects a cycle', () => {
    const scenario = base();
    scenario.branching_tree.nodes.loop = {
      id: 'loop',
      type: 'decision',
      prompt: 'again',
      choices: [
        { id: 'x', text: 'X', deltas: { planning: 1 }, coaching: { text: 'ok' }, next: 'start' },
        { id: 'y', text: 'Y', deltas: { planning: 1 }, coaching: { text: 'ok' }, next: 'end' },
      ],
    };
    (scenario.branching_tree.nodes.start as any).choices[0].next = 'loop';
    expect(messages(scenario).join()).toMatch(/cycle/);
  });

  it('rejects an out-of-range delta', () => {
    const scenario = base();
    (scenario.branching_tree.nodes.start as any).choices[0].deltas = { planning: 9 };
    expect(messages(scenario).join()).toMatch(/between -3 and 3/);
  });

  it('rejects an unknown dimension', () => {
    const scenario = base();
    (scenario.branching_tree.nodes.start as any).choices[0].deltas = { charisma: 1 };
    expect(messages(scenario).join()).toMatch(/unknown dimension/);
  });

  it('rejects a decision with one choice', () => {
    const scenario = base();
    (scenario.branching_tree.nodes.start as any).choices.pop();
    expect(messages(scenario).join()).toMatch(/at least two choices/);
  });

  it('rejects missing coaching text', () => {
    const scenario = base();
    (scenario.branching_tree.nodes.start as any).choices[0].coaching.text = '';
    expect(messages(scenario).join()).toMatch(/coaching\.text: is required/);
  });

  it('rejects an outcome node as the root', () => {
    const scenario = base();
    scenario.branching_tree.root = 'end';
    expect(messages(scenario).join()).toMatch(/must be a decision node/);
  });

  it('rejects a non-slug id', () => {
    const scenario = base();
    scenario.id = 'Not A Slug';
    expect(messages(scenario).join()).toMatch(/kebab-case/);
  });

  it('catches duplicate ids across a library', () => {
    const issues = validateLibrary([base(), base()]);
    expect(issues.map((issue) => issue.message).join()).toMatch(/duplicate scenario id/);
  });
});
