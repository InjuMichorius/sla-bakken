create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Speler',
  points integer not null default 0,
  first_login timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.users
  add column if not exists created_at timestamptz not null default now();

update public.users set name = 'Speler' where name is null;
update public.users set points = 0 where points is null;

alter table public.users
  alter column name set default 'Speler',
  alter column name set not null,
  alter column points set default 0,
  alter column points set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'first_login'
      and data_type = 'boolean'
  ) then
    alter table public.users alter column first_login drop default;
    execute 'alter table public.users alter column first_login type timestamptz using coalesce(created_at, now())';
  end if;
end
$$;

update public.users set first_login = coalesce(created_at, now()) where first_login is null;

alter table public.users
  alter column first_login set default now(),
  alter column first_login set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and conname = 'users_points_nonnegative'
  ) then
    alter table public.users
      add constraint users_points_nonnegative check (points >= 0);
  end if;
end
$$;

alter table public.users enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can read their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

create policy "Users can read their own profile"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on table public.users from public;
revoke all on table public.users from anon, authenticated;
revoke all (id, name, points, first_login, created_at) on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
grant update (name) on table public.users to authenticated;

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
begin
  if tg_op = 'INSERT' then
    insert into public.users (id, name, points, first_login)
    values (new.id, coalesce(supplied_name, 'Speler'), 0, now())
    on conflict (id) do nothing;
  end if;

  if supplied_name is not null then
    update public.users
    set name = supplied_name
    where id = new.id
      and name is distinct from supplied_name;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_auth_user() from public, anon, authenticated;
grant execute on function public.handle_auth_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created_or_updated on auth.users;

create trigger on_auth_user_created_or_updated
  after insert or update of raw_user_meta_data on auth.users
  for each row
  execute function public.handle_auth_user();
