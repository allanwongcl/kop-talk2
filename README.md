# KopTalk

A Liverpool match discussion site — one thread per fixture, live comments and emoji reactions.

## 1. Set up Supabase (your database — free tier is plenty)

1. Go to supabase.com → New project.
2. Once it's created, open **SQL Editor** → New query, paste the contents of `supabase.sql`, and run it. This creates the `posts` table.
3. Go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key.

## 2. Configure locally

1. Copy `.env.local.example` to `.env.local`.
2. Paste in your Supabase URL and anon key.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see the preseason fixtures.

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial KopTalk site"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kop-talk.git
git push -u origin main
```

## 5. Deploy on Vercel (free)

1. Go to vercel.com → sign in with GitHub → **New Project** → import your `kop-talk` repo.
2. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as your `.env.local`).
3. Click **Deploy**. You'll get a live URL like `kop-talk.vercel.app` in about a minute.
4. Optional: add a custom domain under Project Settings → Domains.

## Updating fixtures

Match data lives in `lib/matches.js` — hardcoded for now since it's preseason. Once the season proper starts and you want live scores/status pulled automatically, swap this file for a call to a football data API (e.g. football-data.org, api-football.com) and cache the response.

## Notes

- Comments and reactions are public — anyone can post without an account. Fine for a casual fan space; add Supabase Auth later if you want named/verified accounts.
- Realtime is on, so reactions and new comments in a thread appear for everyone without refreshing.
