alter table public.profiles
  add column if not exists hide_gut_check_details boolean not null default false;
