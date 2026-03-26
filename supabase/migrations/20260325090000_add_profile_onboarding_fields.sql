alter table public.profiles
  add column if not exists name text,
  add column if not exists date_of_birth date,
  add column if not exists avg_cycle_length integer check (
    avg_cycle_length is null or avg_cycle_length between 15 and 60
  );
