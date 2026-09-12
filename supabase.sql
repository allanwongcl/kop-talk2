-- Run this once in your Supabase project's SQL editor (Supabase dashboard → SQL Editor → New query)

create table posts (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  name text not null default 'Anonymous Red',
  text text not null,
  reactions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index posts_match_id_idx on posts (match_id);

-- Allow anyone to read and write posts (fine for a public fan forum prototype).
-- Tighten this later if you add real user accounts.
alter table posts enable row level security;

create policy "Anyone can read posts"
  on posts for select
  using (true);

create policy "Anyone can insert posts"
  on posts for insert
  with check (true);

create policy "Anyone can update posts"
  on posts for update
  using (true);

-- Enable realtime so comments/reactions update live for everyone in a thread
alter publication supabase_realtime add table posts;

-- Caches goal-scorer/assist events fetched from api-football.com (see
-- lib/apiFootball.js). Its free plan only allows looking a fixture up for
-- ~3 days around today, so the first successful fetch for a match is saved
-- here and reused forever after — no more re-typing scorers into
-- MANUAL_GOALS by hand once at least one fetch has succeeded while the
-- match was inside that window.
create table match_goals (
  match_id text primary key,
  goals jsonb not null,
  updated_at timestamptz not null default now()
);

alter table match_goals enable row level security;

create policy "Anyone can read match goals"
  on match_goals for select
  using (true);

create policy "Anyone can insert match goals"
  on match_goals for insert
  with check (true);

create policy "Anyone can update match goals"
  on match_goals for update
  using (true);
