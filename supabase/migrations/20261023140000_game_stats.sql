alter table public.users
  add column if not exists games_played integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.users'::regclass
      and conname = 'users_games_played_nonnegative'
  ) then
    alter table public.users
      add constraint users_games_played_nonnegative check (games_played >= 0);
  end if;
end
$$;

create table if not exists public.game_results (
  user_id uuid not null references public.users (id) on delete cascade,
  game_id text not null,
  points integer not null check (points >= 0),
  played_at timestamptz not null default now(),
  primary key (user_id, game_id),
  constraint game_results_game_id_length check (char_length(game_id) between 1 and 128)
);

alter table public.game_results enable row level security;

revoke all on table public.game_results from public;
revoke all on table public.game_results from anon, authenticated;

create or replace function public.record_game_result(p_game_id text, p_points integer)
returns table (points integer, games_played integer)
language plpgsql
security definer
set search_path = ''
as $$
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
grant select on table public.users to authenticated;
