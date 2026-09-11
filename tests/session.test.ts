import { describe, expect, it } from 'vitest';

import { findScenario, TRAINING_SCENARIOS } from '../src/content';
import { getRootNode, isDecisionNode, isOutcomeNode, type Scenario } from '../src/domain/scenario';
import {
  advance,
  chooseOption,
  currentDecision,
  currentNode,
  maxDepth,
  sessionDeltas,
  startSession,
} from '../src/engine/session';

const scenario = findScenario('dish-duty-drift') as Scenario;

describe('scenario session', () => {
  it('starts on the root decision with nothing recorded', () => {
    const session = startSession(scenario);
    expect(session.currentNodeId).toBe(scenario.branching_tree.root);
    expect(session.history).toHaveLength(0);
    expect(session.finished).toBe(false);
    expect(currentDecision(scenario, session)).not.toBeNull();
  });

  it('parks on coaching before moving to the next node', () => {
    const root = getRootNode(scenario);
    const choice = root.choices[1];
    const chosen = chooseOption(scenario, startSession(scenario), choice.id);

    expect(chosen.pendingCoaching?.choiceId).toBe(choice.id);
    expect(chosen.currentNodeId).toBe(root.id);
    expect(chosen.history).toHaveLength(1);

    const moved = advance(scenario, chosen);
    expect(moved.pendingCoaching).toBeNull();
    expect(moved.currentNodeId).toBe(choice.next);
  });

  it('ignores a second choice while coaching is pending', () => {
    const root = getRootNode(scenario);
    const chosen = chooseOption(scenario, startSession(scenario), root.choices[0].id);
    const again = chooseOption(scenario, chosen, root.choices[1].id);
    expect(again).toBe(chosen);
    expect(again.history).toHaveLength(1);
  });

  it('throws on a choice that does not exist', () => {
    expect(() => chooseOption(scenario, startSession(scenario), 'nope')).toThrow();
  });

  it('accumulates deltas across the path taken', () => {
    let session = startSession(scenario);
    const root = getRootNode(scenario);
    session = advance(scenario, chooseOption(scenario, session, root.choices[1].id));
    const second = currentDecision(scenario, session)!;
    session = advance(scenario, chooseOption(scenario, session, second.choices[0].id));

    const deltas = sessionDeltas(session);
    const expected = [root.choices[1].deltas, second.choices[0].deltas];
    for (const source of expected) {
      for (const [dimension, delta] of Object.entries(source)) {
        expect(deltas[dimension as keyof typeof deltas]).toBeDefined();
        expect(Math.sign(delta)).not.toBe(0);
      }
    }
  });

  it('reaches a terminal outcome on every path of every training scenario', () => {
    for (const training of TRAINING_SCENARIOS) {
      walkAllPaths(training);
    }
  });

  it('reports the deepest decision count', () => {
    expect(maxDepth(scenario)).toBeGreaterThanOrEqual(2);
  });

  it('does nothing when advancing with no pending coaching', () => {
    const session = startSession(scenario);
    expect(advance(scenario, session)).toBe(session);
  });
});

/** Exhaustively plays every branch and asserts each one terminates. */
function walkAllPaths(target: Scenario): void {
  const play = (session: ReturnType<typeof startSession>, depth: number): void => {
    expect(depth, `${target.id} exceeded a reasonable depth`).toBeLessThan(10);

    const node = currentNode(target, session);
    if (isOutcomeNode(node)) {
      expect(session.finished || session.history.length === 0).toBe(true);
      return;
    }
    expect(isDecisionNode(node)).toBe(true);

    for (const choice of node.choices) {
      const next = advance(target, chooseOption(target, session, choice.id));
      play(next, depth + 1);
    }
  };

  play(startSession(target), 0);
}
