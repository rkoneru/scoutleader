# Patrol Leadership Simulator

A React Native (Expo) app that helps Scouts BSA youth leaders — Patrol Leader,
Assistant Patrol Leader, Senior Patrol Leader — practise the parts of the job
that are hard to rehearse: telling a scout he is not pulling his weight, running
a PLC that will not end, covering for a PL who called in sick two hours before
departure.

Branching scenarios, coaching grounded in EDGE, no win/lose framing. Every path
teaches something; some paths teach it faster.

## Run it

```bash
npm install
npm start          # then press i / a, or scan the QR code with Expo Go
npm run web        # or run it in a browser
```

No backend needed. With no Supabase project configured the app runs local-first:
scenarios ship in the bundle, profile and history live on the device.

```bash
npm test                  # 56 tests: engine, content, end-to-end flow
npm run typecheck
npm run content:validate  # structural check over the scenario library
npm run content:seed      # regenerate supabase/seed/scenarios.sql
```

To turn on troop accounts and sync, see [docs/SUPABASE.md](docs/SUPABASE.md).

## What is in this build

The full first slice, end to end:

1. **Skill assessment** — 6 calibration scenarios, one decision each, that set a
   starting score across five dimensions: Communication, Conflict Resolution,
   Delegation, Planning, Initiative.
2. **Scenario engine** — renders branching decision trees, applies score deltas
   per choice, shows coaching feedback tied to that choice.
3. **13 original training scenarios** across PL/APL/SPL situations, each tagged
   with role relevance, rank relevance, primary dimensions, and EDGE-grounded
   coaching on every branch.
4. **Adaptive selection** — weakest-dimension + role-relevance weighting, with
   a repeat penalty and a breadth nudge.
5. **Profile screen** — the five scores, role and rank, recent history.

**Companion mode** (real-task guidance) is a stubbed navigation entry point
only, as specified.

## How it fits together

```
src/
  domain/          types + the branching-tree schema (the contract)
  content/         the scenario library — calibration/ and scenarios/
  engine/          pure logic: scoring, adaptive selection, session, validation
  data/            repository boundary: local (AsyncStorage) or Supabase
  state/           one app-wide store
  ui/              theme + components, including the scenario player
  screens/         onboarding, assessment, home, scenario, profile, companion
supabase/
  migrations/      schema, RLS policies, register_scout()
  seed/            generated from src/content — never edited by hand
```

Everything in `engine/` is pure and unit-tested. Everything above `data/` is
identical whether the app is running on-device or against Supabase.

### The five dimensions

Scores run 0-100 with 50 as "about what you'd expect from a scout who just took
the position". There is no pass mark — the numbers steer which scenario comes up
next and show movement over time. Gains shrink as a score climbs, so a dimension
cannot be ground to 100 by replaying one easy branch.

### Adaptive selection

Each candidate scenario is scored as a weighted sum, multiplied by a repeat
penalty (1 → 0.35 → 0.15):

| Signal | Weight | What it measures |
| --- | --- | --- |
| need | 0.45 | how far the scenario's dimensions sit below 100 |
| role | 0.30 | is it written for the scout's current position |
| rank | 0.15 | does the situation fit their advancement (soft, never a filter) |
| breadth | 0.10 | dimensions they have practised least |

Deterministic: the same profile and history produce the same ordering, which is
what makes it testable and what lets the home screen explain its own pick
("works your delegation · written for a PL").

## Content

See [docs/SCENARIO_SCHEMA.md](docs/SCENARIO_SCHEMA.md) for the branching-tree
schema, the rules the validator enforces, and a worked example.

Scenarios are authored as typed TypeScript in `src/content/`, validated in CI by
`npm test`, and mirrored into Postgres by `npm run content:seed`. The app prefers
the database copy when one is present, so content can be corrected or added
without an App Store round trip.

### Writing conventions

- Situations come from real patrol life: campouts, meetings, service projects,
  peer conflict, ceremonies, budgeting, safety calls.
- Written for 11-17 year olds: plain and direct, no slang, no exclamation
  points, no praise-sandwich coaching. Feedback names the specific thing that
  worked or did not.
- No choice is a trap and none is free. The weakest option always gets a reason
  it is tempting; the strongest always gets a reason it is hard.
- Standard Scouting BSA terminology (patrol method, PLC, duty roster,
  grubmaster, Totin' Chip, EDGE), kept troop-generic so scenarios travel.

## Assumptions worth checking

- **Auth**: self sign-up with a troop join code, per the build decision. The
  age/COPPA, code-rotation, and leaving-a-troop questions are laid out in
  [docs/SUPABASE.md](docs/SUPABASE.md) — they are troop policy calls, not
  technical blockers.
- **A `troops` table was added.** The spec's `scouts.troop_id` implied one, and
  join codes need somewhere to live.
- **`scouts.patrol_id`** is nullable and unused, present so companion mode has
  somewhere to attach.
- **Scores are private to the scout.** No leaderboard, no troop-wide score
  visibility. Easy to relax later; hard to walk back once scouts have seen it.
