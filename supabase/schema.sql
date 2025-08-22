-- Table to store each user’s Strava OAuth tokens
create table if not exists public.strava_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  athlete_id bigint,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null, -- epoch seconds
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.strava_tokens enable row level security;

-- Policy: user can read/update only their row
create policy "user can select own token" on public.strava_tokens
for select using (auth.uid() = user_id);

create policy "user can upsert own token" on public.strava_tokens
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
