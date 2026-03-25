create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cycle_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  log_type text not null check (
    log_type in ('Period started', 'Period ended', 'Symptoms', 'Ovulation signs')
  ),
  symptoms text[] not null default '{}',
  mood text check (
    mood is null or mood in ('energized', 'steady', 'sensitive', 'low', 'playful')
  ),
  cravings text,
  sex_drive text check (
    sex_drive is null or sex_drive in ('Low', 'Normal', 'High')
  ),
  discharge text check (
    discharge is null or discharge in ('None', 'Dry', 'Sticky', 'Creamy', 'Watery', 'Egg-white')
  ),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.intimacy_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  entry_type text not null check (entry_type in ('Partner', 'Self')),
  protection_used boolean not null,
  mood text check (
    mood is null or mood in ('energized', 'steady', 'sensitive', 'low', 'playful')
  ),
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cycle_entries_user_id_date_idx
  on public.cycle_entries (user_id, date desc);

create index if not exists intimacy_entries_user_id_date_idx
  on public.intimacy_entries (user_id, date desc);

alter table public.profiles enable row level security;
alter table public.cycle_entries enable row level security;
alter table public.intimacy_entries enable row level security;

create policy "Users can select own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles
  for delete
  using (auth.uid() = id);

create policy "Users can select own cycle entries"
  on public.cycle_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own cycle entries"
  on public.cycle_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cycle entries"
  on public.cycle_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cycle entries"
  on public.cycle_entries
  for delete
  using (auth.uid() = user_id);

create policy "Users can select own intimacy entries"
  on public.intimacy_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own intimacy entries"
  on public.intimacy_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own intimacy entries"
  on public.intimacy_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own intimacy entries"
  on public.intimacy_entries
  for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name)
select
  users.id,
  nullif(trim(users.raw_user_meta_data ->> 'display_name'), '')
from auth.users as users
on conflict (id) do nothing;
