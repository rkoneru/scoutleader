/**
 * Branching-tree scenario schema (version 1).
 *
 * A scenario is a small directed acyclic graph. Every node is either a
 * `decision` (the scout picks one of 2-4 choices) or an `outcome` (a terminal
 * node that closes the story and debriefs it). Every choice carries its own
 * score deltas and its own coaching text, so feedback is tied to the specific
 * thing the scout did rather than to a "correct" ending.
 *
 * Design rules the validator enforces (see src/engine/validate.ts):
 *   - exactly one root, and it must be a decision node
 *   - every `next` points at a node that exists
 *   - every node is reachable from the root
 *   - no cycles; every path terminates at an outcome node
 *   - deltas stay within DELTA_RANGE and only name real dimensions
 *   - every choice has coaching text
 */

import type {
  Dimension,
  DimensionDeltas,
  EdgeStage,
  Rank,
  Role,
} from './types';

export const SCHEMA_VERSION = 1 as const;

/** Choice deltas are authored on a small, human-readable scale. */
export const DELTA_RANGE = { min: -3, max: 3 } as const;

export type ScenarioKind = 'calibration' | 'training';

export interface Scenario {
  /** Stable slug, e.g. "campout-dish-duty". Used as the DB primary key. */
  id: string;
  kind: ScenarioKind;
  title: string;
  /** One line shown in lists — the situation, not the lesson. */
  summary: string;
  /** Where and when this happens, e.g. "Saturday morning, fall campout". */
  setting: string;
  /** Roles this scenario is written for. Others can still play it. */
  role_relevance: Role[];
  /** Ranks the situation fits. Used as a softer weighting than role. */
  rank_relevance: Rank[];
  /** Dimensions the scenario mainly exercises. Drives adaptive selection. */
  primary_dimensions: Dimension[];
  estimated_minutes: number;
  branching_tree: BranchingTree;
}

export interface BranchingTree {
  version: typeof SCHEMA_VERSION;
  root: string;
  nodes: Record<string, ScenarioNode>;
}

export type ScenarioNode = DecisionNode | OutcomeNode;

export interface DecisionNode {
  id: string;
  type: 'decision';
  /** Narrative beat leading into the decision. */
  prompt: string;
  /** Optional line of dialogue attributed to another scout or adult. */
  speaker?: string;
  line?: string;
  choices: Choice[];
}

export interface Choice {
  id: string;
  /** What the scout says or does. Written in the scout's voice. */
  text: string;
  deltas: DimensionDeltas;
  coaching: Coaching;
  /** Node this choice leads to. */
  next: string;
}

export interface Coaching {
  /**
   * Two or three sentences naming the specific thing that worked or did not.
   * No praise-then-correction sandwich, no slang.
   */
  text: string;
  /** Which EDGE stage this choice illustrates (or fails to reach). */
  edge_stage?: EdgeStage;
  /** Short tag shown as a chip, e.g. "Ask before you assume". */
  principle?: string;
}

export interface OutcomeNode {
  id: string;
  type: 'outcome';
  /** How the situation actually wrapped up. */
  prompt: string;
  /** Closing reflection tying the path back to the leadership idea. */
  debrief: string;
  edge_focus?: EdgeStage;
}

export function isDecisionNode(node: ScenarioNode): node is DecisionNode {
  return node.type === 'decision';
}

export function isOutcomeNode(node: ScenarioNode): node is OutcomeNode {
  return node.type === 'outcome';
}

export function getNode(scenario: Scenario, nodeId: string): ScenarioNode {
  const node = scenario.branching_tree.nodes[nodeId];
  if (!node) {
    throw new Error(`Scenario "${scenario.id}" has no node "${nodeId}"`);
  }
  return node;
}

export function getRootNode(scenario: Scenario): DecisionNode {
  const node = getNode(scenario, scenario.branching_tree.root);
  if (!isDecisionNode(node)) {
    throw new Error(`Scenario "${scenario.id}" root must be a decision node`);
  }
  return node;
}

export function getChoice(node: DecisionNode, choiceId: string): Choice {
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) {
    throw new Error(`Node "${node.id}" has no choice "${choiceId}"`);
  }
  return choice;
}
