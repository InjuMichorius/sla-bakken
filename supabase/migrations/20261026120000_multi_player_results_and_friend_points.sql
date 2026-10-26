drop function if exists public.add_friend(uuid);
drop function if exists public.list_friends();

create or replace function public.add_friend(p_friend_id uuid)
returns table (friend_id uuid, name text, points integer, added_at timestamptz)
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
  select u.id, u.name, u.points, f.created_at
  from public.friends f
  join public.users u on u.id = f.friend_id
  where f.user_id = current_user_id
    and f.friend_id = p_friend_id;
end;
$$;

create or replace function public.list_friends()
returns table (friend_id uuid, name text, points integer, added_at timestamptz)
language sql
security definer
set search_path = ''
stable
as $$
  select f.friend_id, u.name, u.points, f.created_at
  from public.friends f
  join public.users u on u.id = f.friend_id
  where f.user_id = auth.uid()
  order by f.created_at desc, u.name asc;
$$;

create or replace function public.remove_friend(p_friend_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  removed integer;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_friend_id is null or p_friend_id = current_user_id then
    raise exception 'invalid_friend';
  end if;

  delete from public.friends
  where (user_id = current_user_id and friend_id = p_friend_id)
     or (user_id = p_friend_id and friend_id = current_user_id);

  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

create or replace function public.record_game_results(p_game_id text, p_results jsonb)
returns table (user_id uuid, points integer, games_played integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_caller uuid := (select auth.uid());
  v_entry jsonb;
  v_target uuid;
  v_entry_points integer;
  v_inserted bigint;
  v_caller_included boolean := false;
  v_seen uuid[] := '{}';
begin
  if v_caller is null then
    raise exception 'not_authenticated';
  end if;

  if p_game_id is null or btrim(p_game_id) = '' or char_length(p_game_id) > 128 then
    raise exception 'invalid_game_id';
  end if;

  if p_results is null or jsonb_typeof(p_results) <> 'array' then
    raise exception 'invalid_results';
  end if;

  if jsonb_array_length(p_results) < 1 or jsonb_array_length(p_results) > 64 then
    raise exception 'invalid_results';
  end if;

  for v_entry in select value from jsonb_array_elements(p_results)
  loop
    begin
      v_target := (v_entry ->> 'user_id')::uuid;
      v_entry_points := (v_entry ->> 'points')::integer;
    exception when others then
      raise exception 'invalid_results';
    end;

    if v_target is null or v_entry_points is null or v_entry_points < 0 or v_entry_points > 100000 then
      raise exception 'invalid_results';
    end if;

    if v_target = any(v_seen) then
      continue;
    end if;

    v_seen := array_append(v_seen, v_target);
    if v_target = v_caller then
      v_caller_included := true;
    end if;

    if not exists (select 1 from public.users u where u.id = v_target) then
      raise exception 'user_not_found';
    end if;

    insert into public.game_results (user_id, game_id, points)
    values (v_target, p_game_id, v_entry_points)
    on conflict (user_id, game_id) do nothing;

    get diagnostics v_inserted = row_count;

    if v_inserted > 0 then
      update public.users as u
      set points = u.points + v_entry_points,
          games_played = u.games_played + 1
      where u.id = v_target;
    end if;
  end loop;

  if not v_caller_included then
    raise exception 'caller_not_in_results';
  end if;

  return query
  select u.id, u.points, u.games_played
  from public.users u
  where u.id = any(v_seen);
end;
$$;

revoke all on function public.add_friend(uuid) from public, anon, authenticated;
revoke all on function public.list_friends() from public, anon, authenticated;
revoke all on function public.remove_friend(uuid) from public, anon, authenticated;
revoke all on function public.record_game_results(text, jsonb) from public, anon, authenticated;
grant execute on function public.add_friend(uuid) to authenticated;
grant execute on function public.list_friends() to authenticated;
grant execute on function public.remove_friend(uuid) to authenticated;
grant execute on function public.record_game_results(text, jsonb) to authenticated;
