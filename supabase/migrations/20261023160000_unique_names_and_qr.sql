do $$
declare
  duplicate record;
  candidate text;
  suffix integer;
begin
  for duplicate in
    select id, name
    from (
      select
        id,
        name,
        row_number() over (
          partition by lower(btrim(name))
          order by first_login asc, created_at asc, id asc
        ) as position
      from public.users
    ) ranked
    where position > 1
    order by lower(btrim(name)), position
  loop
    suffix := 2;

    loop
      candidate := btrim(duplicate.name) || ' ' || suffix;
      exit when not exists (
        select 1
        from public.users
        where id <> duplicate.id
          and lower(btrim(name)) = lower(btrim(candidate))
      );
      suffix := suffix + 1;
    end loop;

    update public.users set name = candidate where id = duplicate.id;
  end loop;
end
$$;

create unique index if not exists users_name_unique_idx
  on public.users (lower(btrim(name)));

create or replace function public.is_name_available(p_name text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select p_name is not null
    and btrim(p_name) <> ''
    and not exists (
      select 1
      from public.users
      where lower(btrim(name)) = lower(btrim(p_name))
    );
$$;

create or replace function public.get_player_identity(p_user_id uuid)
returns table (id uuid, name text)
language sql
security definer
set search_path = ''
stable
as $$
  select u.id, u.name
  from public.users u
  where u.id = p_user_id;
$$;

revoke all on function public.is_name_available(text) from public, anon, authenticated;
revoke all on function public.get_player_identity(uuid) from public, anon, authenticated;
grant execute on function public.is_name_available(text) to anon, authenticated;
grant execute on function public.get_player_identity(uuid) to anon, authenticated;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  base_name text := coalesce(supplied_name, 'Speler');
  candidate text;
  suffix integer;
begin
  if tg_op = 'INSERT' then
    candidate := base_name;
    suffix := 1;

    while exists (
      select 1
      from public.users
      where lower(btrim(name)) = lower(btrim(candidate))
    ) loop
      suffix := suffix + 1;
      candidate := base_name || ' ' || suffix;
    end loop;

    insert into public.users (id, name, points, first_login)
    values (new.id, candidate, 0, now())
    on conflict (id) do nothing;

    return new;
  end if;

  if supplied_name is not null then
    candidate := supplied_name;
    suffix := 1;

    while exists (
      select 1
      from public.users
      where id <> new.id
        and lower(btrim(name)) = lower(btrim(candidate))
    ) loop
      suffix := suffix + 1;
      candidate := supplied_name || ' ' || suffix;
    end loop;

    update public.users
    set name = candidate
    where id = new.id
      and name is distinct from candidate;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_auth_user() from public, anon, authenticated;
grant execute on function public.handle_auth_user() to supabase_auth_admin;
