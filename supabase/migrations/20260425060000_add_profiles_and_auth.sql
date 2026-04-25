
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  is_admin boolean default false,
  tokens_remaining int default 20,
  last_token_reset timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Add user_id to pages
alter table public.pages add column user_id uuid references auth.users;

-- Update pages policies
drop policy if exists "Public read pages" on public.pages;
create policy "Anyone can view pages"
  on public.pages for select
  using (true);

create policy "Authenticated users can insert pages"
  on public.pages for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own pages"
  on public.pages for update
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_admin)
  values (new.id, new.email, new.email = 'aryanthealgohype@gmail.com');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
