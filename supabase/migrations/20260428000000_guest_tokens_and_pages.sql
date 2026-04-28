-- Guest support + monthly Pro tokens

-- Pages: allow linking to a guest identity (for sidebar + edit permissions)
alter table public.pages
  add column if not exists guest_id text;

create index if not exists pages_guest_id_idx on public.pages (guest_id);
create index if not exists pages_user_id_idx on public.pages (user_id);

-- Guest profiles (tokens + plan) managed only by Edge Functions (service role)
create table if not exists public.guest_profiles (
  id text primary key,
  plan text not null default 'free',
  tokens_remaining int not null default 3,
  token_period_start timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.guest_profiles enable row level security;

-- No public policies on guest_profiles (service role bypasses RLS).

-- Add plan + period start to authenticated profiles
alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists token_period_start timestamptz not null default now();

alter table public.profiles
  alter column tokens_remaining set default 3;

