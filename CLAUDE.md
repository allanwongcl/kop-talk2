# KopTalk — Project Context for Claude Code

KopTalk is a Liverpool match discussion site: one thread per fixture, with
public live comments and emoji reactions. Built with Next.js (App Router) and
Supabase.

## Stack

- Next.js 14.2.5 (App Router), React 18.3.1
- Tailwind CSS for styling
- Supabase (`@supabase/supabase-js`) for the database, auth-free public
  comments, and realtime updates
- Deployed on Vercel

## Project structure

- `app/page.js` — homepage: fixtures ticker + list of matches, pulls comment
  counts per match from Supabase
- `app/match/[id]/page.js` — a single match thread: comments + reactions
- `app/layout.js` — root layout, sets page metadata
- `app/api/fixtures/route.js` — merges the live football-data.org fixture list
  with the static friendlies + manual goals; cached 60s (see "Updating fixtures")
- `app/api/match-goals/route.js` — goal events for a fixture via api-football.com,
  falling back to the Supabase cache once that API's date window closes (see
  "Updating fixtures")
- `lib/footballData.js` — football-data.org client + match→fixture mapping
- `lib/apiFootball.js` — api-football.com client (goal events by fixture date)
- `lib/matchGoalsStore.js` — reads/writes the `match_goals` cache table in Supabase
- `lib/matches.js` — friendlies, manual goal breakdowns, offline fallback
- `lib/useFixtures.js` — client hook: polls `/api/fixtures` every 60s
- `lib/useMatchGoals.js` — client hook: polls `/api/match-goals` every 2 minutes
- `lib/supabaseClient.js` — creates the Supabase client from env vars
- `supabase.sql` — run once in the Supabase SQL Editor; creates the `posts` and
  `match_goals` tables, RLS policies, and enables realtime
- `.env.local.example` — template for required env vars

## Setup status / how to help me

I'm setting this up for the first time. Please help me:

1. **Local setup**: copy `.env.local.example` to `.env.local`, run
   `npm install`, then `npm run dev`, and confirm it's working at
   http://localhost:3000
2. **Supabase**: once I've created a Supabase project and pasted my Project
   URL + anon key into `.env.local`, help me run `supabase.sql` correctly and
   verify the `posts` table looks right
3. **Git & GitHub**: initialize git, commit, and push to a GitHub repo I've
   created (ask me for the repo URL if you don't have it)
4. **Vercel**: walk me through importing the repo on vercel.com and setting
   the two required env vars: `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

I don't have accounts set up yet on Supabase/GitHub/Vercel — those need to
happen in my browser, so prompt me for URLs/keys/confirmation at those steps
rather than assuming you can create them.

## Environment variables

Required in `.env.local` (Supabase keys from Supabase → Project Settings → API;
`FOOTBALL_DATA_API_KEY` from football-data.org):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
FOOTBALL_DATA_API_KEY=your-football-data-org-token
API_FOOTBALL_KEY=your-api-football-com-key
```

`FOOTBALL_DATA_API_KEY` is required for the live fixture list. `API_FOOTBALL_KEY`
is used for live goal scorers, but its free plan only allows looking a fixture
up for ~3 days around today — see "Updating fixtures" for how that's cached so
it isn't a recurring problem. All four are already set locally and on Vercel.

## Updating fixtures

The fixture list is pulled live from football-data.org (Liverpool, team id 64 —
Premier League + Champions League) through `/api/fixtures`, mapped in
`lib/footballData.js`, and re-polled every 60s by `lib/useFixtures.js`. Scores
and status (kickoff time → LIVE → HALF-TIME → FULL-TIME) update automatically,
no redeploy. Fixture ids are `pl<matchday>` / `cl<matchday>` so Supabase comment
threads stay attached across deploys.

Goal scorers/assists for competitive fixtures come from api-football.com via
`/api/match-goals` (`lib/apiFootball.js`), polled by `lib/useMatchGoals.js`
whenever a match thread is open. Its free plan only allows looking a fixture
up for ~3 days around today, so the first successful fetch for a match is
cached in Supabase's `match_goals` table (`lib/matchGoalsStore.js`) and reused
after that window closes — no manual entry needed as long as someone opens
the match thread within a few days of kickoff. `MANUAL_GOALS` in
`lib/matches.js` is now only a last-resort fallback for a match nobody opened
in time; check it's actually empty for a fixture before typing scorers in by
hand.

Two other things still live in `lib/matches.js` because the free tier doesn't
provide them:

- `STATIC_MATCHES` — pre-season friendlies (no live feed exists). Hand-entered.
- `FALLBACK_MATCHES` — snapshot shown only if the API call fails. Keep it roughly
  current so an outage doesn't show a stale/empty list.

If Liverpool reach the CL knockout stage, fixtures with no `matchday` get the id
`cl-<footballDataId>`; check `mapMatch` in `lib/footballData.js` handles the
stage label the way you want.

## Notes / constraints

- Comments and reactions are intentionally public with no account required —
  this is fine for a casual fan space. Don't add auth unless I ask for it.
- Realtime is enabled via Supabase so comments/reactions appear live without
  a page refresh — keep this working if you touch the comment/reaction code.
- Row Level Security is enabled on `posts` with permissive
  read/insert/update policies for anonymous users (see `supabase.sql`). Don't
  tighten these without checking with me first, since it would break
  anonymous posting.
