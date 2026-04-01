alter table public.profiles
  add column if not exists hide_intimacy_details boolean not null default false;
