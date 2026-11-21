create or replace function public.is_reserved_profile_name(p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(btrim(coalesce(p_name, ''))) ~ '^(speler|player|spieler|joueur)([[:space:]]+[0-9]+)?$';
$$;

create or replace function public.is_name_available(p_name text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select p_name is not null
    and btrim(p_name) <> ''
    and char_length(btrim(p_name)) <= 10
    and not public.is_reserved_profile_name(p_name)
    and not exists (
      select 1
      from public.users
      where lower(btrim(name)) = lower(btrim(p_name))
    );
$$;

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  is_email_signup boolean := coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'email';
  base_name text;
  candidate text;
  suffix integer;
begin
  if supplied_name is not null
    and (public.is_reserved_profile_name(supplied_name) or char_length(supplied_name) > 10) then
    supplied_name := null;
  end if;

  if tg_op = 'INSERT' then
    if supplied_name is not null
      and is_email_signup
      and exists (
        select 1
        from public.users
        where lower(btrim(name)) = lower(btrim(supplied_name))
      ) then
      raise exception 'name_taken';
    end if;

    base_name := coalesce(supplied_name, 'Gast');
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
    if exists (
      select 1
      from public.users
      where id <> new.id
        and lower(btrim(name)) = lower(btrim(supplied_name))
    ) then
      raise exception 'name_taken';
    end if;

    update public.users
    set name = supplied_name
    where id = new.id
      and name is distinct from supplied_name;
  end if;

  return new;
end;
$$;

revoke all on function public.is_reserved_profile_name(text) from public, anon, authenticated;
revoke all on function public.is_name_available(text) from public, anon, authenticated;
grant execute on function public.is_name_available(text) to anon, authenticated;
revoke all on function public.handle_auth_user() from public, anon, authenticated;
grant execute on function public.handle_auth_user() to supabase_auth_admin;
