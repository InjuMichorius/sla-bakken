create table if not exists public.friends (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  constraint friends_no_self check (user_id <> friend_id)
);

alter table public.friends enable row level security;

revoke all on table public.friends from public, anon, authenticated;

create index if not exists friends_user_created_idx
  on public.friends (user_id, created_at desc);

create or replace function public.add_friend(p_friend_id uuid)
returns table (friend_id uuid, name text, added_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  linked_at timestamptz := now();
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_friend_id is null or p_friend_id = current_user_id then
    raise exception 'invalid_friend';
  end if;

  if not exists (
    select 1
    from public.users
    where id = p_friend_id
  ) then
    raise exception 'friend_not_found';
  end if;

  insert into public.friends (user_id, friend_id, created_at)
  values
    (current_user_id, p_friend_id, linked_at),
    (p_friend_id, current_user_id, linked_at)
  on conflict do nothing;

  return query
  select u.id, u.name, f.created_at
  from public.friends f
  join public.users u on u.id = f.friend_id
  where f.user_id = current_user_id
    and f.friend_id = p_friend_id;
end;
$$;

create or replace function public.list_friends()
returns table (friend_id uuid, name text, added_at timestamptz)
language sql
security definer
set search_path = ''
stable
as $$
  select f.friend_id, u.name, f.created_at
  from public.friends f
  join public.users u on u.id = f.friend_id
  where f.user_id = auth.uid()
  order by f.created_at desc, u.name asc;
$$;

revoke all on function public.add_friend(uuid) from public, anon, authenticated;
revoke all on function public.list_friends() from public, anon, authenticated;
grant execute on function public.add_friend(uuid) to authenticated;
grant execute on function public.list_friends() to authenticated;
