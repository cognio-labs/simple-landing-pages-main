create table public.pages (
  id text primary key,
  html text not null,
  prompt text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pages enable row level security;

create policy "Public read pages"
  on public.pages for select
  using (true);

create policy "Public insert pages"
  on public.pages for insert
  with check (true);

create policy "Public update pages"
  on public.pages for update
  using (true)
  with check (true);

create index pages_created_at_idx on public.pages (created_at desc);