create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_name text := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  is_email_signup boolean := coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'email';
  base_name text := coalesce(supplied_name, 'Speler');
  candidate text;
  suffix integer;
begin
  if tg_op = 'INSERT' then
    if supplied_name is not null and exists (
      select 1
      from public.users
      where lower(btrim(name)) = lower(btrim(supplied_name))
    ) then
      if is_email_signup then
        raise exception 'name_taken';
      end if;
    end if;

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
      if is_email_signup then
        raise exception 'name_taken';
      end if;
    end if;

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
