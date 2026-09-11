/**
 * Structural validation for authored scenarios. Run by the test suite and by
 * `npm run content:validate` so a malformed tree never ships in a content OTA
 * update.
 */

import {
  DELTA_RANGE,
  SCHEMA_VERSION,
  isDecisionNode,
  isOutcomeNode,
  type Scenario,
  type ScenarioNode,
} from '../domain/scenario';
import { DIMENSIONS, RANKS, ROLES, type Dimension, type Rank, type Role } from '../domain/types';

export interface ValidationIssue {
  scenarioId: string;
  path: string;
  message: string;
}

export function validateScenario(scenario: Scenario): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (path: string, message: string) =>
    issues.push({ scenarioId: scenario.id, path, message });

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(scenario.id)) {
    add('id', 'must be a lower-kebab-case slug');
  }
  if (scenario.branching_tree.version !== SCHEMA_VERSION) {
    add('branching_tree.version', `must be ${SCHEMA_VERSION}`);
  }
  if (!scenario.title.trim()) add('title', 'is required');
  if (!scenario.summary.trim()) add('summary', 'is required');
  if (!scenario.setting.trim()) add('setting', 'is required');
  if (scenario.estimated_minutes <= 0) add('estimated_minutes', 'must be positive');

  if (!scenario.role_relevance.length) add('role_relevance', 'must list at least one role');
  for (const role of scenario.role_relevance) {
    if (!ROLES.includes(role as Role)) add('role_relevance', `unknown role "${role}"`);
  }
  if (!scenario.rank_relevance.length) add('rank_relevance', 'must list at least one rank');
  for (const rank of scenario.rank_relevance) {
    if (!RANKS.includes(rank as Rank)) add('rank_relevance', `unknown rank "${rank}"`);
  }
  if (!scenario.primary_dimensions.length) {
    add('primary_dimensions', 'must list at least one dimension');
  }
  for (const dimension of scenario.primary_dimensions) {
    if (!DIMENSIONS.includes(dimension as Dimension)) {
      add('primary_dimensions', `unknown dimension "${dimension}"`);
    }
  }

  const nodes = scenario.branching_tree.nodes;
  const nodeIds = Object.keys(nodes);
  if (!nodeIds.length) {
    add('branching_tree.nodes', 'is empty');
    return issues;
  }

  for (const [id, node] of Object.entries(nodes)) {
    if (node.id !== id) add(`nodes.${id}.id`, `key and node.id disagree ("${node.id}")`);
    validateNode(scenario, node, add);
  }

  const root = nodes[scenario.branching_tree.root];
  if (!root) {
    add('branching_tree.root', `points at missing node "${scenario.branching_tree.root}"`);
    return issues;
  }
  if (!isDecisionNode(root)) add('branching_tree.root', 'must be a decision node');

  // Reachability and acyclicity in one walk.
  const reachable = new Set<string>();
  const stack: string[] = [];
  const walk = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return; // already reported as a dangling `next`
    if (stack.includes(nodeId)) {
      add(`nodes.${nodeId}`, `is part of a cycle: ${[...stack, nodeId].join(' -> ')}`);
      return;
    }
    if (reachable.has(nodeId)) return;
    reachable.add(nodeId);
    if (!isDecisionNode(node)) return;
    stack.push(nodeId);
    for (const choice of node.choices) walk(choice.next);
    stack.pop();
  };
  walk(scenario.branching_tree.root);

  for (const id of nodeIds) {
    if (!reachable.has(id)) add(`nodes.${id}`, 'is unreachable from the root');
  }

  const outcomes = nodeIds.filter((id) => isOutcomeNode(nodes[id]));
  if (!outcomes.length) add('branching_tree.nodes', 'has no outcome node');

  return issues;
}

function validateNode(
  scenario: Scenario,
  node: ScenarioNode,
  add: (path: string, message: string) => void,
): void {
  const nodes = scenario.branching_tree.nodes;

  if (isOutcomeNode(node)) {
    if (!node.prompt.trim()) add(`nodes.${node.id}.prompt`, 'is required');
    if (!node.debrief.trim()) add(`nodes.${node.id}.debrief`, 'is required');
    return;
  }

  if (!node.prompt.trim()) add(`nodes.${node.id}.prompt`, 'is required');
  if (node.choices.length < 2) add(`nodes.${node.id}.choices`, 'needs at least two choices');
  if (node.choices.length > 4) add(`nodes.${node.id}.choices`, 'has more than four choices');
  if (node.line && !node.speaker) {
    add(`nodes.${node.id}.speaker`, 'is required when a line of dialogue is set');
  }

  const seenChoiceIds = new Set<string>();
  for (const choice of node.choices) {
    const path = `nodes.${node.id}.choices.${choice.id}`;
    if (seenChoiceIds.has(choice.id)) add(path, 'duplicate choice id');
    seenChoiceIds.add(choice.id);

    if (!choice.text.trim()) add(`${path}.text`, 'is required');
    if (!choice.coaching.text.trim()) add(`${path}.coaching.text`, 'is required');
    if (!nodes[choice.next]) add(`${path}.next`, `points at missing node "${choice.next}"`);
    if (choice.next === node.id) add(`${path}.next`, 'points at its own node');

    const deltaEntries = Object.entries(choice.deltas);
    if (!deltaEntries.length) add(`${path}.deltas`, 'must move at least one dimension');
    for (const [dimension, delta] of deltaEntries) {
      if (!DIMENSIONS.includes(dimension as Dimension)) {
        add(`${path}.deltas`, `unknown dimension "${dimension}"`);
        continue;
      }
      if (typeof delta !== 'number' || Number.isNaN(delta)) {
        add(`${path}.deltas.${dimension}`, 'must be a number');
        continue;
      }
      if (delta < DELTA_RANGE.min || delta > DELTA_RANGE.max) {
        add(
          `${path}.deltas.${dimension}`,
          `must be between ${DELTA_RANGE.min} and ${DELTA_RANGE.max}`,
        );
      }
    }
  }
}

export function validateLibrary(scenarios: Scenario[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  for (const scenario of scenarios) {
    if (seen.has(scenario.id)) {
      issues.push({
        scenarioId: scenario.id,
        path: 'id',
        message: 'duplicate scenario id',
      });
    }
    seen.add(scenario.id);
    issues.push(...validateScenario(scenario));
  }
  return issues;
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((i) => `  ${i.scenarioId} · ${i.path}: ${i.message}`).join('\n');
}
