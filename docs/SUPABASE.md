# Supabase setup

The app runs without any of this. Do it when you want accounts, sync across
devices, and content updates that do not need an app release.

## 1. Create the project and apply the schema

```bash
# With the Supabase CLI, from the repo root:
supabase link --project-ref <your-project-ref>
supabase db push                       # applies supabase/migrations/*

# Or paste supabase/migrations/0001_init.sql into the SQL editor.
```

## 2. Seed the scenario content

```bash
npm run content:seed                   # regenerates supabase/seed/scenarios.sql
```

Run the generated file in the SQL editor, or with `psql`. It upserts by id, so
rerunning it after a content change updates rows in place. Writes to
`scenarios` are service-role only, so run it as an admin, not from the app.

## 3. Create a troop and hand out its join code

```sql
insert into public.troops (name, join_code)
values ('Troop 412', 'T412-ELK');

-- Optional: patrols exist for companion mode. No app logic reads them yet.
insert into public.patrols (troop_id, name)
select id, unnest(array['Elk', 'Hawk', 'Viper'])
from public.troops where join_code = 'T412-ELK';
```

Give scouts the code. That is the whole provisioning step.

## 4. Point the app at the project

```bash
cp .env.example .env
# EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
npx expo start --clear
```

## Auth model

Self sign-up with a troop join code:

1. The scout signs up with email and password through Supabase Auth.
2. The app calls `register_scout(name, rank, role, join_code)`.
3. That function is `security definer`: it resolves the code to a troop id,
   inserts the `scouts` row keyed to `auth.uid()`, and a trigger creates the
   baseline `skill_profiles` row.

`troops` is not directly selectable, so join codes cannot be listed or
enumerated through PostgREST — the only path in is the function, which fails
the same way for every bad code.

### What RLS guarantees

| Table | A signed-in scout can |
| --- | --- |
| `scouts` | read and write their own row; read name/rank of troop mates |
| `skill_profiles` | read and write only their own — scores are not troop-visible |
| `scenario_attempts` | read and insert only their own |
| `scenarios` | read published rows; no writes |
| `troops` | read only the troop they belong to |
| `patrols` | read patrols in their own troop; no writes yet |

### Things worth deciding before a real rollout

These are flagged rather than assumed, because they are policy questions for the
troop and not technical ones:

- **Age and email.** Scouts are 11-17, so signing up with email puts you in
  COPPA territory for the under-13s. Options: require a parent's email for
  younger scouts, or switch to troop-admin-provisioned accounts (the schema
  supports it — an admin creates the auth user and calls `register_scout`).
- **Join-code rotation.** Codes do not expire. If one leaks, a stranger can
  create an account attached to the troop. Rotating the code in `troops` is
  immediate; there is no automatic rotation yet.
- **Brute force.** `register_scout` has no rate limit of its own beyond
  Supabase's auth throttling. If codes get short, add one.
- **Leaving a troop.** There is no unenrol path yet. `scouts.troop_id` is
  nullable and `on delete set null`, so it is a small addition when needed.
