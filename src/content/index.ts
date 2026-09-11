/**
 * The bundled scenario library.
 *
 * Content ships inside the app so a scout can train with no network and no
 * Supabase project configured. When Supabase is configured, the same scenarios
 * live in the `scenarios` table (see supabase/seed) and the remote copy wins,
 * which is what makes content updates possible without an app store release.
 */

import type { Scenario } from '../domain/scenario';
import { CALIBRATION_SCENARIOS } from './calibration';
import { TRAINING_SCENARIOS } from './scenarios';

export { CALIBRATION_SCENARIOS, TRAINING_SCENARIOS };

export const ALL_SCENARIOS: Scenario[] = [...CALIBRATION_SCENARIOS, ...TRAINING_SCENARIOS];

export function findScenario(id: string, library: Scenario[] = ALL_SCENARIOS): Scenario | null {
  return library.find((scenario) => scenario.id === id) ?? null;
}
