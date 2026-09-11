# Branching-tree scenario schema (v1)

This is the thing to sanity-check before the rest of the content gets written.
It is defined in TypeScript at `src/domain/scenario.ts`, enforced at runtime by
`src/engine/validate.ts`, and mirrored in Postgres by the `scenarios` table in
`supabase/migrations/0001_init.sql`.

## Shape

A scenario is a small **directed acyclic graph**, not a list of questions.

```
Scenario
├── id, kind, title, summary, setting
├── role_relevance[]        PL | APL | SPL
├── rank_relevance[]        scout … eagle
├── primary_dimensions[]    the dimensions it exercises (drives selection)
├── estimated_minutes
└── branching_tree
    ├── version: 1
    ├── root: <node id>
    └── nodes: { [id]: DecisionNode | OutcomeNode }

DecisionNode                       OutcomeNode
├── type: 'decision'               ├── type: 'outcome'
├── prompt                         ├── prompt      (how it actually wrapped up)
├── speaker?, line?                ├── debrief     (the closing reflection)
└── choices[]                      └── edge_focus?
    ├── id, text
    ├── deltas        { dimension: -3..+3 }
    ├── coaching      { text, edge_stage?, principle? }
    └── next          <node id>
```

### Why this shape

- **Feedback hangs off the choice, not the ending.** Every choice carries its
  own `coaching`, so a scout is told the specific thing that worked about the
  specific thing they did. There is no win/lose ending to chase.
- **Deltas hang off the choice too.** Scoring never needs to walk to a leaf, so
  a half-finished scenario still has a meaningful partial score.
- **Nodes are a map, not nested objects.** Two branches can converge on the same
  node, which is how a scenario models "you can recover from this" without
  duplicating the recovery text.
- **Choices are 2-4 per node.** More than four on a phone stops being a decision
  and starts being a reading test.
- **Deltas are authored on a -3..+3 scale**, not in score points. How a delta
  turns into a score change is a tuning decision (`src/engine/scoring.ts`), and
  keeping it out of the content means tuning does not mean rewriting content.

### Rules the validator enforces

Run with `npm run content:validate`; also covered by `tests/validate.test.ts`.

1. Exactly one `root`, and it must be a decision node.
2. Every `next` points at a node that exists, and never at its own node.
3. Every node is reachable from the root.
4. No cycles. Every path terminates at an outcome node.
5. Every choice moves at least one dimension, within `-3..+3`, and names only
   real dimensions.
6. Every choice has coaching text; every outcome has a debrief.
7. Decision nodes have 2-4 choices with unique ids.
8. Scenario ids are lower-kebab-case slugs (they are the database primary key).

## Worked example

`calib-quiet-patrol-meeting`, from `src/content/calibration.ts` — the smallest
legal tree: one decision, four choices, one outcome.

```jsonc
{
  "id": "calib-quiet-patrol-meeting",
  "kind": "calibration",
  "title": "Nobody Answers",
  "summary": "You ask your patrol a question and get silence.",
  "setting": "Patrol corner, Tuesday troop meeting",
  "role_relevance": ["PL", "APL", "SPL"],
  "rank_relevance": ["scout", "tenderfoot", "second_class", "first_class", "star", "life", "eagle"],
  "primary_dimensions": ["communication"],
  "estimated_minutes": 1,
  "branching_tree": {
    "version": 1,
    "root": "ask",
    "nodes": {
      "ask": {
        "id": "ask",
        "type": "decision",
        "prompt": "Your patrol is sitting in a circle. You ask, \"So who wants to handle food for the campout?\" Six scouts look at the floor. Nobody says anything for about ten seconds.",
        "choices": [
          {
            "id": "name-and-ask",
            "text": "Say, \"Marcus, you did food last spring and it went well. Want it again, or want to teach someone else to do it?\"",
            "deltas": { "communication": 3 },
            "coaching": {
              "text": "Naming one scout turns a question nobody owns into a question one person has to answer. Offering the teaching option makes it a step up rather than the same chore twice.",
              "edge_stage": "enable",
              "principle": "Ask a person, not a room"
            },
            "next": "wrap"
          },
          {
            "id": "just-do-it",
            "text": "Say, \"Fine, I will do food,\" and move to the next item.",
            "deltas": { "communication": -2, "delegation": -1 },
            "coaching": {
              "text": "This ends the silence and teaches the patrol that silence works. Next meeting the pause will be longer, because waiting you out is now the cheapest option.",
              "principle": "Do not reward the wait"
            },
            "next": "wrap"
          }
          // ... two more choices
        ]
      },
      "wrap": {
        "id": "wrap",
        "type": "outcome",
        "prompt": "The meeting moves on.",
        "debrief": "How you ask decides what you get. Specific beats general, and a named scout beats an open room almost every time."
      }
    }
  }
}
```

A training scenario uses the same schema with more depth. `dish-duty-drift` has
a root decision, three mid-level decision nodes, and four outcomes, with two of
the branches converging on the same "private conversation" node — a scout who
handles it badly in public can still recover by moving it out of the group.

## How the pieces are used

| Field | Read by | For |
| --- | --- | --- |
| `primary_dimensions` | `engine/adaptive.ts` | weakest-dimension weighting |
| `role_relevance` | `engine/adaptive.ts` | role weighting (never a hard filter) |
| `rank_relevance` | `engine/adaptive.ts` | soft rank weighting by ladder distance |
| `choices[].deltas` | `engine/scoring.ts` | score movement |
| `choices[].coaching` | `ui/components/ScenarioPlayer.tsx` | the card shown after a choice |
| `nodes[].debrief` | `ui/components/ScenarioPlayer.tsx` | the closing screen |

## Changing the schema

Bump `SCHEMA_VERSION` in `src/domain/scenario.ts`, update the
`scenarios_tree_shape` check constraint in the migration, and add a validator
rule. The version lives inside `branching_tree` so rows written by an older
authoring pass are identifiable in the database.
