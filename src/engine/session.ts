/**
 * Runtime state machine for playing one scenario. Pure and serialisable so a
 * half-finished scenario can be resumed and so the whole flow is testable
 * without rendering anything.
 */

import {
  getChoice,
  getNode,
  isDecisionNode,
  isOutcomeNode,
  type Choice,
  type DecisionNode,
  type OutcomeNode,
  type Scenario,
} from '../domain/scenario';
import type { AttemptChoice, DimensionDeltas } from '../domain/types';
import { mergeDeltas } from './scoring';

export interface ScenarioSession {
  scenarioId: string;
  currentNodeId: string;
  history: AttemptChoice[];
  /** Coaching shown after the most recent choice, cleared when advancing. */
  pendingCoaching: PendingCoaching | null;
  finished: boolean;
}

export interface PendingCoaching {
  nodeId: string;
  choiceId: string;
  choiceText: string;
  coaching: Choice['coaching'];
  deltas: DimensionDeltas;
  nextNodeId: string;
}

export function startSession(scenario: Scenario): ScenarioSession {
  return {
    scenarioId: scenario.id,
    currentNodeId: scenario.branching_tree.root,
    history: [],
    pendingCoaching: null,
    finished: false,
  };
}

export function currentNode(scenario: Scenario, session: ScenarioSession) {
  return getNode(scenario, session.currentNodeId);
}

export function currentDecision(
  scenario: Scenario,
  session: ScenarioSession,
): DecisionNode | null {
  const node = currentNode(scenario, session);
  return isDecisionNode(node) ? node : null;
}

export function currentOutcome(
  scenario: Scenario,
  session: ScenarioSession,
): OutcomeNode | null {
  const node = currentNode(scenario, session);
  return isOutcomeNode(node) ? node : null;
}

/**
 * Records a choice. The session stays parked on the same node with coaching
 * pending — the scout reads the feedback before the story moves on.
 */
export function chooseOption(
  scenario: Scenario,
  session: ScenarioSession,
  choiceId: string,
): ScenarioSession {
  if (session.finished) return session;
  if (session.pendingCoaching) return session;

  const node = currentNode(scenario, session);
  if (!isDecisionNode(node)) return session;

  const choice = getChoice(node, choiceId);
  return {
    ...session,
    history: [
      ...session.history,
      { node_id: node.id, choice_id: choice.id, deltas: choice.deltas },
    ],
    pendingCoaching: {
      nodeId: node.id,
      choiceId: choice.id,
      choiceText: choice.text,
      coaching: choice.coaching,
      deltas: choice.deltas,
      nextNodeId: choice.next,
    },
  };
}

/** Dismisses the coaching card and moves to the node the choice pointed at. */
export function advance(scenario: Scenario, session: ScenarioSession): ScenarioSession {
  if (!session.pendingCoaching) return session;

  const nextNodeId = session.pendingCoaching.nextNodeId;
  const nextNode = getNode(scenario, nextNodeId);

  return {
    ...session,
    currentNodeId: nextNodeId,
    pendingCoaching: null,
    finished: isOutcomeNode(nextNode),
  };
}

export function sessionDeltas(session: ScenarioSession): DimensionDeltas {
  return mergeDeltas(session.history.map((entry) => entry.deltas));
}

/** Number of decisions on the path taken, used for the progress dots. */
export function pathLength(session: ScenarioSession): number {
  return session.history.length;
}

/**
 * Longest number of decisions any path through the scenario requires. Used to
 * render progress without assuming every branch is the same depth.
 */
export function maxDepth(scenario: Scenario): number {
  const seen = new Set<string>();

  const walk = (nodeId: string): number => {
    if (seen.has(nodeId)) return 0; // validator forbids cycles; be safe anyway
    const node = getNode(scenario, nodeId);
    if (isOutcomeNode(node)) return 0;
    seen.add(nodeId);
    const depths = node.choices.map((choice) => 1 + walk(choice.next));
    seen.delete(nodeId);
    return Math.max(0, ...depths);
  };

  return walk(scenario.branching_tree.root);
}
