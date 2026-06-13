-- EventMatch — Supabase schema (core: profiles · connections · requests)
-- Run this once in your project's SQL Editor (Supabase Dashboard → SQL → New query → paste → Run).
-- Identity model: anonymous auth (each device gets an auth user). RLS keys everything to auth.uid().
-- Discovery: the app shows the 25 built-in demo attendees client-side and MERGES real profiles
-- from this table on top, so the People list is never empty — no DB seeding needed.

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — one row per device/user. `data` holds the full card (name, role,
-- interests, skills, intents, socials …) as JSON so the shape can evolve freely.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         text primary key,            -- = auth.uid()::text for the owner's own row
  name       text,                        -- denormalised for ordering/search
  data       jsonb not null default '{}', -- the full User object
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone (incl. anonymous) can read every profile — this is the attendee directory.
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select using (true);

-- You may only create / change / delete YOUR OWN row (id must equal your auth uid).
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid()::text);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()::text) with check (id = auth.uid()::text);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete using (id = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- connections — people THIS device has matched with (one direction, per owner).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.connections (
  id          uuid primary key default gen_random_uuid(),
  owner       text not null,               -- = auth.uid()::text
  target_id   text not null,               -- matched person's profile id
  target_card jsonb,                        -- optional snapshot (e.g. for share-link matches)
  created_at  timestamptz not null default now(),
  unique (owner, target_id)
);

alter table public.connections enable row level security;

drop policy if exists connections_select_own on public.connections;
create policy connections_select_own on public.connections
  for select using (owner = auth.uid()::text);

drop policy if exists connections_insert_own on public.connections;
create policy connections_insert_own on public.connections
  for insert with check (owner = auth.uid()::text);

drop policy if exists connections_delete_own on public.connections;
create policy connections_delete_own on public.connections
  for delete using (owner = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- requests — meeting requests. Sender = from_id, recipient = to_id.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.requests (
  id         uuid primary key default gen_random_uuid(),
  from_id    text not null,                -- = auth.uid()::text (sender)
  to_id      text not null,                -- recipient profile id
  note       text,
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;

-- You can see requests addressed TO you or sent BY you.
drop policy if exists requests_select_mine on public.requests;
create policy requests_select_mine on public.requests
  for select using (to_id = auth.uid()::text or from_id = auth.uid()::text);

-- You can only send requests AS yourself.
drop policy if exists requests_insert_own on public.requests;
create policy requests_insert_own on public.requests
  for insert with check (from_id = auth.uid()::text);

-- Only the recipient can accept / decline (update) a request.
drop policy if exists requests_update_recipient on public.requests;
create policy requests_update_recipient on public.requests
  for update using (to_id = auth.uid()::text) with check (to_id = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- tasks — private follow-up tasks. Keyed to the auth user so they follow a logged-in
-- account across devices. Only the owner can read/write them.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id         text not null,                -- app-generated task id
  owner      text not null,                -- = auth.uid()::text
  data       jsonb not null default '{}',  -- the full Task (dueDate as ISO string)
  updated_at timestamptz not null default now(),
  primary key (owner, id)
);

alter table public.tasks enable row level security;

drop policy if exists tasks_select_own on public.tasks;
create policy tasks_select_own on public.tasks for select using (owner = auth.uid()::text);
drop policy if exists tasks_insert_own on public.tasks;
create policy tasks_insert_own on public.tasks for insert with check (owner = auth.uid()::text);
drop policy if exists tasks_update_own on public.tasks;
create policy tasks_update_own on public.tasks for update using (owner = auth.uid()::text) with check (owner = auth.uid()::text);
drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_delete_own on public.tasks for delete using (owner = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- Realtime — let the front-end subscribe to live inserts/updates.
-- (Safe to re-run: ignore "already member of publication" errors.)
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.profiles';    exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.connections';  exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.requests';     exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.tasks';        exception when others then null; end;
end $$;
