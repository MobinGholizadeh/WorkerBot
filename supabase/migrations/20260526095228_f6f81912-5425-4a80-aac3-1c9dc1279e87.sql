
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- hires
create type public.hire_status as enum ('setting_up', 'active', 'paused', 'canceled');

create table public.hires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null,
  status public.hire_status not null default 'setting_up',
  brief text not null default '',
  price_cents integer not null default 0,
  started_at timestamptz not null default now(),
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);
create index hires_user_id_idx on public.hires(user_id);
alter table public.hires enable row level security;
create policy "hires_select_own" on public.hires for select using (auth.uid() = user_id);
create policy "hires_insert_own" on public.hires for insert with check (auth.uid() = user_id);
create policy "hires_update_own" on public.hires for update using (auth.uid() = user_id);
create policy "hires_delete_own" on public.hires for delete using (auth.uid() = user_id);

-- agent_configs (one per hire)
create table public.agent_configs (
  hire_id uuid primary key references public.hires(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  fields jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.agent_configs enable row level security;
create policy "agent_configs_select_own" on public.agent_configs for select using (auth.uid() = user_id);
create policy "agent_configs_insert_own" on public.agent_configs for insert with check (auth.uid() = user_id);
create policy "agent_configs_update_own" on public.agent_configs for update using (auth.uid() = user_id);
create policy "agent_configs_delete_own" on public.agent_configs for delete using (auth.uid() = user_id);

-- agent_connections
create type public.connection_status as enum ('pending', 'connected', 'disconnected', 'error');

create table public.agent_connections (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status public.connection_status not null default 'pending',
  external_account text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hire_id, provider)
);
create index agent_connections_user_id_idx on public.agent_connections(user_id);
alter table public.agent_connections enable row level security;
create policy "agent_connections_select_own" on public.agent_connections for select using (auth.uid() = user_id);
create policy "agent_connections_insert_own" on public.agent_connections for insert with check (auth.uid() = user_id);
create policy "agent_connections_update_own" on public.agent_connections for update using (auth.uid() = user_id);
create policy "agent_connections_delete_own" on public.agent_connections for delete using (auth.uid() = user_id);

-- payments
create type public.payment_status as enum ('succeeded', 'failed');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null,
  status public.payment_status not null,
  mock_card_last4 text,
  failure_reason text,
  hire_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index payments_user_id_idx on public.payments(user_id);
alter table public.payments enable row level security;
create policy "payments_select_own" on public.payments for select using (auth.uid() = user_id);
create policy "payments_insert_own" on public.payments for insert with check (auth.uid() = user_id);
