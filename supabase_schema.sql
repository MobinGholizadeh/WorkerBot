create type public.user_role as enum ('client', 'admin');
create type public.hire_status as enum ('setting_up', 'active', 'paused', 'canceled');
create type public.connection_status as enum ('pending', 'connected', 'disconnected', 'error');
create type public.log_level as enum ('info', 'success', 'warning', 'error');
create type public.interaction_status as enum ('active', 'completed', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'client',
  created_at timestamptz not null default now()
);

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

revoke execute on function public.handle_new_user() from anon, authenticated, public;

create table public.agents (
  id text primary key,
  name text not null,
  role text not null,
  tagline text not null,
  bio text not null,
  skills text[] not null default '{}',
  price_cents integer not null default 0,
  avatar_seed text not null,
  accent text not null,
  config_fields jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.agents (id, name, role, tagline, bio, skills, price_cents, avatar_seed, accent, config_fields) values
('ada', 'Ada', 'Executive Secretary', 'Schedules meetings, organizes your inbox, never sleeps.', 'Ada handles calendar logistics, drafts replies in your voice, triages email, and prepares briefings before every meeting. She learns your preferences within a week.', array['Calendar', 'Email triage', 'Briefings', 'Travel booking'], 4900, 'Ada', 'from-amber-200 to-yellow-400', '[
  {"kind": "input", "key": "fullName", "label": "Your full name", "type": "text", "placeholder": "Jane Doe", "required": true},
  {"kind": "connect", "key": "gmail", "label": "Gmail", "provider": "gmail", "required": true, "description": "Read, triage and reply to your inbox."},
  {"kind": "connect", "key": "calendar", "label": "Google Calendar", "provider": "google_calendar", "required": true, "description": "Schedule and reschedule meetings."},
  {"kind": "input", "key": "timezone", "label": "Timezone", "type": "text", "placeholder": "Europe/Berlin"},
  {"kind": "input", "key": "workingHours", "label": "Working hours", "type": "text", "placeholder": "9:00 - 18:00"}
]'::jsonb),
('milo', 'Milo', 'Sales Development Rep', 'Researches leads and writes cold emails that get replies.', 'Milo runs prospect research, enriches CRM records, and drafts personalized outbound sequences. Plugs into HubSpot, Salesforce, and Apollo.', array['Lead research', 'Email sequences', 'CRM sync', 'LinkedIn'], 8900, 'Milo', 'from-sky-200 to-blue-400', '[
  {"kind": "input", "key": "company", "label": "Company name", "type": "text", "placeholder": "Acme Inc.", "required": true},
  {"kind": "input", "key": "icp", "label": "Ideal customer profile", "type": "textarea", "placeholder": "Series A SaaS, 50-200 employees, US/EU"},
  {"kind": "connect", "key": "hubspot", "label": "HubSpot CRM", "provider": "hubspot", "description": "Enrich leads and sync activity."},
  {"kind": "connect", "key": "linkedin", "label": "LinkedIn", "provider": "linkedin", "description": "Research prospects and send connection requests."},
  {"kind": "input", "key": "sendingDomain", "label": "Sending domain", "type": "url", "placeholder": "outbound.acme.com"},
  {"kind": "input", "key": "tone", "label": "Voice & tone", "type": "text", "placeholder": "Friendly, direct, no fluff"}
]'::jsonb);

create table public.hires (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null references public.agents(id) on delete restrict,
  status public.hire_status not null default 'setting_up',
  brief text not null default '',
  price_cents integer not null default 0,
  started_at timestamptz not null default now(),
  canceled_at timestamptz,
  created_at timestamptz not null default now()
);

create index hires_user_id_idx on public.hires(user_id);

create table public.agent_configs (
  hire_id uuid primary key references public.hires(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  fields jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.agent_connections (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status public.connection_status not null default 'pending',
  external_account text,
  vault_secret_id uuid references vault.secrets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hire_id, provider)
);

create index agent_connections_user_id_idx on public.agent_connections(user_id);

create table public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  level public.log_level not null default 'info',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index agent_logs_hire_id_created_at_idx on public.agent_logs(hire_id, created_at desc);

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  hire_id uuid not null references public.hires(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  title text not null,
  external_recipient text not null,
  status public.interaction_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interactions_hire_id_idx on public.interactions(hire_id);

create table public.interaction_messages (
  id uuid primary key default gen_random_uuid(),
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  sender text not null,
  content text not null,
  media_urls text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index interaction_messages_interaction_idx on public.interaction_messages(interaction_id, created_at asc);

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.hires enable row level security;
alter table public.agent_configs enable row level security;
alter table public.agent_connections enable row level security;
alter table public.agent_logs enable row level security;
alter table public.interactions enable row level security;
alter table public.interaction_messages enable row level security;

create policy "profiles_select" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id or public.is_admin());

create policy "agents_select" on public.agents for select using (is_active = true or public.is_admin());
create policy "agents_all_admin" on public.agents for all using (public.is_admin());

create policy "hires_select" on public.hires for select using (auth.uid() = user_id or public.is_admin());
create policy "hires_insert" on public.hires for insert with check (auth.uid() = user_id);
create policy "hires_update" on public.hires for update using (auth.uid() = user_id or public.is_admin());
create policy "hires_delete" on public.hires for delete using (auth.uid() = user_id or public.is_admin());

create policy "configs_select" on public.agent_configs for select using (auth.uid() = user_id or public.is_admin());
create policy "configs_insert" on public.agent_configs for insert with check (auth.uid() = user_id);
create policy "configs_update" on public.agent_configs for update using (auth.uid() = user_id or public.is_admin());
create policy "configs_delete" on public.agent_configs for delete using (auth.uid() = user_id or public.is_admin());

create policy "connections_select" on public.agent_connections for select using (auth.uid() = user_id or public.is_admin());
create policy "connections_insert" on public.agent_connections for insert with check (auth.uid() = user_id);
create policy "connections_update" on public.agent_connections for update using (auth.uid() = user_id or public.is_admin());
create policy "connections_delete" on public.agent_connections for delete using (auth.uid() = user_id or public.is_admin());

create policy "logs_select" on public.agent_logs for select using (auth.uid() = user_id or public.is_admin());

create policy "interactions_select" on public.interactions for select using (auth.uid() = user_id or public.is_admin());
create policy "messages_select" on public.interaction_messages for select using (
  public.is_admin() or 
  exists (
    select 1 from public.interactions
    where id = interaction_messages.interaction_id
      and user_id = auth.uid()
  )
);
