create table if not exists public.gut_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cycle_entry_id uuid references public.cycle_entries (id) on delete set null,
  log_date date not null,
  poop_type text not null check (poop_type in ('smooth', 'hard', 'loose', 'none')),
  effort text check (effort is null or effort in ('easy', 'normal', 'struggled')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists gut_tracking_user_id_log_date_idx
  on public.gut_tracking (user_id, log_date desc);

create index if not exists gut_tracking_cycle_entry_id_idx
  on public.gut_tracking (cycle_entry_id);

alter table public.gut_tracking enable row level security;

create policy "Users can select own gut tracking entries"
  on public.gut_tracking
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own gut tracking entries"
  on public.gut_tracking
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own gut tracking entries"
  on public.gut_tracking
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own gut tracking entries"
  on public.gut_tracking
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_gut_tracking_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_gut_tracking_updated_at on public.gut_tracking;

create trigger set_gut_tracking_updated_at
  before update on public.gut_tracking
  for each row
  execute function public.set_gut_tracking_updated_at();
