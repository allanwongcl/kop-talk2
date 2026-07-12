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
- `lib/matches.js` — hardcoded fixture list (see "Updating fixtures" below)
- `lib/supabaseClient.js` — creates the Supabase client from env vars
- `supabase.sql` — run once in the Supabase SQL Editor; creates the `posts`
  table, RLS policies, and enables realtime
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

Required in `.env.local` (get these from Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Updating fixtures

Match data is hardcoded in `lib/matches.js` since it's currently preseason.
Once the season proper starts and live scores are wanted, this should be
swapped for a call to a football data API (football-data.org, api-football.com)
with the response cached — don't do this until I ask for it.

## Notes / constraints

- Comments and reactions are intentionally public with no account required —
  this is fine for a casual fan space. Don't add auth unless I ask for it.
- Realtime is enabled via Supabase so comments/reactions appear live without
  a page refresh — keep this working if you touch the comment/reaction code.
- Row Level Security is enabled on `posts` with permissive
  read/insert/update policies for anonymous users (see `supabase.sql`). Don't
  tighten these without checking with me first, since it would break
  anonymous posting.
