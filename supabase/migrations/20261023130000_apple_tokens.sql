create table if not exists public.apple_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.apple_tokens enable row level security;

revoke all on table public.apple_tokens from public;
revoke all on table public.apple_tokens from anon, authenticated;
grant all on table public.apple_tokens to service_role;
