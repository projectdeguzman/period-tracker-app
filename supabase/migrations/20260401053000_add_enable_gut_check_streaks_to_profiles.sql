alter table public.profiles
  add column if not exists enable_gut_check_streaks boolean not null default true;
