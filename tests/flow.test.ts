/**
 * End-to-end exercise of the first slice, against the local repository:
 * onboarding -> calibration -> adaptive selection -> training -> profile.
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { CALIBRATION_SCENARIOS, findScenario, TRAINING_SCENARIOS } from '../src/content';
import { LocalRepository, type KeyValueStore } from '../src/data/localRepository';
import { NoScoutError } from '../src/data/repository';
import { getRootNode } from '../src/domain/scenario';
import { DIMENSIONS } from '../src/domain/types';
import { selectNextScenario } from '../src/engine/adaptive';
import { applyTrainingDeltas, profileFromCalibration } from '../src/engine/scoring';
import { advance, chooseOption, currentDecision, sessionDeltas, startSession } from '../src/engine/session';

class MemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>();
  async getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  async setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  async removeItem(key: string) {
    this.map.delete(key);
  }
  poke(key: string, value: string) {
    this.map.set(key, value);
  }
}

let store: MemoryStore;
let repository: LocalRepository;
let counter: number;

beforeEach(() => {
  store = new MemoryStore();
  counter = 0;
  repository = new LocalRepository(
    store,
    undefined,
    () => '2026-01-01T00:00:00.000Z',
    () => `id-${++counter}`,
  );
});

/** Plays a scenario start to finish, always taking the choice at `pick`. */
function play(scenarioId: string, pick: (count: number) => number) {
  const scenario = findScenario(scenarioId)!;
  let session = startSession(scenario);
  let steps = 0;
  while (!session.finished) {
    const decision = currentDecision(scenario, session);
    if (!decision) break;
    const index = Math.min(pick(steps), decision.choices.length - 1);
    session = advance(scenario, chooseOption(scenario, session, decision.choices[index].id));
    steps += 1;
  }
  return session;
}

describe('first-slice flow', () => {
  it('has no session before onboarding', async () => {
    expect(await repository.loadSession()).toBeNull();
  });

  it('refuses writes before a scout exists', async () => {
    await expect(repository.recordAttempt({
      scenario_id: 'dish-duty-drift',
      choices_made: [],
      score_deltas: {},
    })).rejects.toBeInstanceOf(NoScoutError);
  });

  it('creates a scout with a baseline profile', async () => {
    const scout = await repository.createScout({
      name: '  Rowan  ',
      rank: 'star',
      current_role: 'SPL',
    });
    expect(scout.name).toBe('Rowan');

    const session = await repository.loadSession();
    expect(session?.profile.calibrated_at).toBeNull();
    for (const dimension of DIMENSIONS) expect(session?.profile[dimension]).toBe(50);
  });

  it('runs the whole first slice and leaves a coherent profile', async () => {
    await repository.createScout({ name: 'Rowan', rank: 'first_class', current_role: 'PL' });

    // Calibration: always take the last choice of each item.
    const calibrationDeltas = CALIBRATION_SCENARIOS.map((scenario) => {
      const root = getRootNode(scenario);
      const session = chooseOption(
        scenario,
        startSession(scenario),
        root.choices[root.choices.length - 1].id,
      );
      return sessionDeltas(session);
    });

    const initial = profileFromCalibration(calibrationDeltas);
    await repository.saveProfile(initial, '2026-01-01T00:00:00.000Z');

    let state = (await repository.loadSession())!;
    expect(state.profile.calibrated_at).not.toBeNull();

    // Three adaptive rounds, taking the strongest-looking first choice each time.
    const played: string[] = [];
    for (let round = 0; round < 3; round += 1) {
      const recommendation = selectNextScenario(TRAINING_SCENARIOS, {
        scores: state.profile,
        role: state.scout.current_role,
        rank: state.scout.rank,
        attempts: state.attempts,
      });
      expect(recommendation).not.toBeNull();

      const session = play(recommendation!.scenario.id, () => 1);
      const deltas = sessionDeltas(session);

      await repository.saveProfile(applyTrainingDeltas(state.profile, deltas));
      await repository.recordAttempt({
        scenario_id: session.scenarioId,
        choices_made: session.history,
        score_deltas: deltas,
      });

      played.push(recommendation!.scenario.id);
      state = (await repository.loadSession())!;
    }

    expect(new Set(played).size).toBe(3);
    expect(state.attempts).toHaveLength(3);
    expect(state.attempts[0].scenario_id).toBe(played[2]); // newest first
    for (const dimension of DIMENSIONS) {
      expect(state.profile[dimension]).toBeGreaterThanOrEqual(0);
      expect(state.profile[dimension]).toBeLessThanOrEqual(100);
    }
  });

  it('keeps role changes without disturbing scores', async () => {
    await repository.createScout({ name: 'Rowan', rank: 'first_class', current_role: 'PL' });
    const before = (await repository.loadSession())!.profile;

    const updated = await repository.updateScout({ current_role: 'SPL' });
    expect(updated.current_role).toBe('SPL');

    const after = (await repository.loadSession())!;
    expect(after.scout.name).toBe('Rowan');
    for (const dimension of DIMENSIONS) {
      expect(after.profile[dimension]).toBe(before[dimension]);
    }
  });

  it('recovers from corrupt local state instead of throwing', async () => {
    await repository.createScout({ name: 'Rowan', rank: 'scout', current_role: 'APL' });
    store.poke('scoutleader/v1/state', '{not json');
    expect(await repository.loadSession()).toBeNull();
  });

  it('clears everything on reset', async () => {
    await repository.createScout({ name: 'Rowan', rank: 'scout', current_role: 'APL' });
    await repository.reset();
    expect(await repository.loadSession()).toBeNull();
  });
});
