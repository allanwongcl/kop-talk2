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
