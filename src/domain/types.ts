/**
 * Core domain vocabulary for the Patrol Leadership Simulator.
 *
 * Terminology follows Scouting BSA national usage (patrol method, PLC, EDGE)
 * and deliberately avoids troop-specific conventions so content travels.
 */

/** The five leadership dimensions the simulator tracks. */
export const DIMENSIONS = [
  'communication',
  'conflict_resolution',
  'delegation',
  'planning',
  'initiative',
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  communication: 'Communication',
  conflict_resolution: 'Conflict Resolution',
  delegation: 'Delegation',
  planning: 'Planning',
  initiative: 'Initiative',
};

export const DIMENSION_BLURBS: Record<Dimension, string> = {
  communication:
    'Saying the thing clearly the first time — instructions, expectations, and bad news included.',
  conflict_resolution:
    'Handling friction between scouts without letting it become a bigger deal than it is.',
  delegation:
    'Handing real work to other scouts and letting them own it instead of doing it yourself.',
  planning:
    'Thinking a step ahead: duty rosters, gear, timing, and what happens when the plan slips.',
  initiative:
    'Noticing what needs doing and starting it before someone tells you to.',
};

/** Youth leadership positions this build covers. */
export const ROLES = ['PL', 'APL', 'SPL'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  PL: 'Patrol Leader',
  APL: 'Assistant Patrol Leader',
  SPL: 'Senior Patrol Leader',
};

export const ROLE_BLURBS: Record<Role, string> = {
  PL: 'Runs one patrol. Closest to the day-to-day: duty rosters, patrol gear, peer conflict.',
  APL: 'Backs up the PL and steps in when they are out. Leads without the title.',
  SPL: 'Runs the troop and the PLC. Works through patrol leaders instead of around them.',
};

/** Scouting BSA ranks, in order of advancement. */
export const RANKS = [
  'scout',
  'tenderfoot',
  'second_class',
  'first_class',
  'star',
  'life',
  'eagle',
] as const;
export type Rank = (typeof RANKS)[number];

export const RANK_LABELS: Record<Rank, string> = {
  scout: 'Scout',
  tenderfoot: 'Tenderfoot',
  second_class: 'Second Class',
  first_class: 'First Class',
  star: 'Star',
  life: 'Life',
  eagle: 'Eagle',
};

/** The four stages of the BSA EDGE teaching method. */
export const EDGE_STAGES = ['explain', 'demonstrate', 'guide', 'enable'] as const;
export type EdgeStage = (typeof EDGE_STAGES)[number];

export const EDGE_LABELS: Record<EdgeStage, string> = {
  explain: 'Explain',
  demonstrate: 'Demonstrate',
  guide: 'Guide',
  enable: 'Enable',
};

/** A score for every dimension, 0-100. */
export type DimensionScores = Record<Dimension, number>;

/** Sparse score movement applied by a single choice. */
export type DimensionDeltas = Partial<Record<Dimension, number>>;

export interface Scout {
  id: string;
  name: string;
  rank: Rank;
  current_role: Role;
  troop_id: string | null;
  created_at: string;
}

export interface SkillProfile extends DimensionScores {
  scout_id: string;
  updated_at: string;
  /** Null until the calibration assessment has been completed. */
  calibrated_at: string | null;
}

export interface ScenarioAttempt {
  id: string;
  scout_id: string;
  scenario_id: string;
  choices_made: AttemptChoice[];
  score_deltas: DimensionDeltas;
  completed_at: string;
}

export interface AttemptChoice {
  node_id: string;
  choice_id: string;
  deltas: DimensionDeltas;
}

export interface Troop {
  id: string;
  name: string;
  /** Short code a scout types to join. Never displayed to other troops. */
  join_code: string;
}

export interface Patrol {
  id: string;
  troop_id: string;
  name: string;
}

export function emptyScores(value = 0): DimensionScores {
  return {
    communication: value,
    conflict_resolution: value,
    delegation: value,
    planning: value,
    initiative: value,
  };
}
