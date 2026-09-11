import type { Scenario } from '../../domain/scenario';
import { ASSISTANT_PATROL_LEADER_SCENARIOS } from './assistant-patrol-leader';
import { PATROL_LEADER_SCENARIOS } from './patrol-leader';
import { SENIOR_PATROL_LEADER_SCENARIOS } from './senior-patrol-leader';

export const TRAINING_SCENARIOS: Scenario[] = [
  ...PATROL_LEADER_SCENARIOS,
  ...ASSISTANT_PATROL_LEADER_SCENARIOS,
  ...SENIOR_PATROL_LEADER_SCENARIOS,
];
