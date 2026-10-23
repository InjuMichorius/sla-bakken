create or replace function public.record_game_result(p_game_id text, p_points integer)
returns table (points integer, games_played integer)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_user_id uuid := (select auth.uid());
  v_inserted bigint;
begin
  if v_user_id is null then
    raise exception 'Niet ingelogd';
  end if;

  if p_game_id is null or btrim(p_game_id) = '' or char_length(p_game_id) > 128 then
    raise exception 'Ongeldige game-id';
  end if;

  if p_points is null or p_points < 0 or p_points > 100000 then
    raise exception 'Ongeldig puntenaantal';
  end if;

  insert into public.game_results (user_id, game_id, points)
  values (v_user_id, p_game_id, p_points)
  on conflict (user_id, game_id) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update public.users
    set points = points + p_points,
        games_played = games_played + 1
    where id = v_user_id;
  end if;

  return query
  select u.points, u.games_played
  from public.users u
  where u.id = v_user_id;
end;
$$;

revoke all on function public.record_game_result(text, integer) from public, anon, authenticated;
grant execute on function public.record_game_result(text, integer) to authenticated;
