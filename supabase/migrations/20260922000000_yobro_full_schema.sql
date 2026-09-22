-- YoBro — Full schema migration
-- Creates all tables needed to store real YoBro user data:
--   profiles, chat_messages (chat history), mood_logs, memories,
--   notebook_entries (journal), risk_events, notifications,
--   telegram_link_tokens, telegram_processed_updates, email_processed_messages
--
-- Safe to run multiple times (idempotent).
-- Applies all incremental migrations in one shot for a fresh project.

-- ── 1. Core tables ──────────────────────────────────────────────────────────

-- Users / profiles (id = auth.users.id)
create table if not exists public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  alias                   text not null default 'Friend',
  avatar                  text not null default 'moon',
  language                text not null default 'hinglish',
  language_2              text,
  email                   text,
  phone_e164              text,
  preferred_channel       text not null default 'email',
  email_opt_in            boolean not null default true,
  whatsapp_opt_in         boolean not null default false,
  telegram_chat_id        text,
  telegram_opt_in         boolean not null default false,
  telegram_connected_at   timestamptz,
  timezone                text not null default 'Asia/Kolkata',
  state                   text,
  city                    text,
  shift                   text not null default 'day',
  voice_preference        text,
  consent_checkin         boolean not null default true,
  consent_memory          boolean not null default true,
  checkin_frequency       text not null default 'daily',
  checkin_window          text not null default '22:00-23:00',
  last_proactive_at       timestamptz,
  last_weekly_at          timestamptz,
  user_pattern_profile    text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Chat history (every user / YoBro turn)
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  role        text not null check (role in ('user', 'dhira', 'yobro')),
  content     text not null,
  created_at  timestamptz not null default now()
);

-- Mood logs (auto-tagged from chat + manual check-ins)
create table if not exists public.mood_logs (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references public.profiles(id) on delete cascade,
  mood                 text not null,
  valence              real not null default 0,
  emotional_intensity  real not null default 0,
  topic_tag            text not null default 'self',
  source               text not null default 'chat' check (source in ('chat', 'manual', 'elevenlabs')),
  mood_tag_source      text check (mood_tag_source is null or mood_tag_source in ('live', 'offline')),
  created_at           timestamptz not null default now()
);

-- Memories (safe "YoBro remembers" notes — no raw PII)
create table if not exists public.memories (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  summary        text not null,
  mood           text not null default 'neutral',
  topic_tag      text not null default 'self',
  carry_forward  text not null default '',
  created_at     timestamptz not null default now()
);

-- Journal / notebook entries
create table if not exists public.notebook_entries (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null references public.profiles(id) on delete cascade,
  created_at        timestamptz not null default now(),
  mode              text not null check (mode in ('write', 'speak')),
  body              text not null,
  mood              text not null,
  topics            text[] not null default '{}',
  share_with_dhira  boolean not null default true
);

-- Risk / safety events
create table if not exists public.risk_events (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  risk_level          text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRISIS')),
  signal              text not null default '',
  risk_classification text,
  handled             boolean not null default true,
  created_at          timestamptz not null default now()
);

-- Outbound notifications (email / WhatsApp / Telegram)
create table if not exists public.notifications (
  id                   uuid primary key default gen_random_uuid(),
  profile_id           uuid not null references public.profiles(id) on delete cascade,
  channel              text not null check (channel in ('email', 'whatsapp', 'telegram')),
  type                 text not null check (type in ('proactive_checkin', 'weekly_summary', 'crisis_followup')),
  content              text not null,
  status               text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'failed')),
  provider_message_id  text,
  scheduled_for        timestamptz,
  sent_at              timestamptz,
  template_key         text,
  subject              text,
  created_at           timestamptz not null default now()
);

-- Timeline: one row per week summarising the user's journey
create table if not exists public.timeline_weeks (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  week_start  date not null,
  week_end    date not null,
  summary     text not null default '',
  mood_trend  text,
  highlights  text[] not null default '{}',
  created_at  timestamptz not null default now(),
  unique (profile_id, week_start)
);

-- Telegram deep-link tokens
create table if not exists public.telegram_link_tokens (
  token       text primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- Idempotency for inbound Telegram webhook retries
create table if not exists public.telegram_processed_updates (
  update_id     bigint primary key,
  processed_at  timestamptz not null default now()
);

-- Idempotency for inbound email webhook retries
create table if not exists public.email_processed_messages (
  message_id    text primary key,
  processed_at  timestamptz not null default now()
);

-- ── 2. Indexes ──────────────────────────────────────────────────────────────

create index if not exists chat_messages_profile_idx
  on public.chat_messages (profile_id, created_at);

create index if not exists mood_logs_profile_idx
  on public.mood_logs (profile_id, created_at);

create index if not exists memories_profile_idx
  on public.memories (profile_id, created_at);

create index if not exists notebook_entries_profile_idx
  on public.notebook_entries (profile_id, created_at desc);

create index if not exists risk_events_created_idx
  on public.risk_events (created_at);

create index if not exists risk_events_profile_idx
  on public.risk_events (profile_id, created_at);

create index if not exists notifications_profile_idx
  on public.notifications (profile_id, created_at);

create index if not exists timeline_weeks_profile_idx
  on public.timeline_weeks (profile_id, week_start desc);

create index if not exists telegram_link_tokens_profile_idx
  on public.telegram_link_tokens (profile_id);

create index if not exists telegram_processed_updates_at_idx
  on public.telegram_processed_updates (processed_at);

create index if not exists email_processed_messages_at_idx
  on public.email_processed_messages (processed_at);

create index if not exists profiles_checkin_due_idx
  on public.profiles (consent_checkin, last_proactive_at);

create unique index if not exists profiles_telegram_chat_id_uidx
  on public.profiles (telegram_chat_id) where telegram_chat_id is not null;

-- ── 3. Auto-create profile on sign-up ───────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (
    id,
    alias,
    avatar,
    language,
    email,
    phone_e164,
    preferred_channel,
    email_opt_in,
    whatsapp_opt_in,
    telegram_opt_in,
    timezone,
    consent_checkin,
    consent_memory,
    checkin_frequency,
    checkin_window,
    created_at,
    updated_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'alias', new.raw_user_meta_data->>'full_name', 'Friend'),
    coalesce(new.raw_user_meta_data->>'avatar', 'moon'),
    coalesce(new.raw_user_meta_data->>'language', 'hinglish'),
    new.email,
    new.phone,
    'email',
    true,
    false,
    false,
    coalesce(new.raw_user_meta_data->>'timezone', 'Asia/Kolkata'),
    true,
    true,
    'daily',
    '22:00-23:00',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 4. Row-Level Security ────────────────────────────────────────────────────

alter table public.profiles                  enable row level security;
alter table public.chat_messages             enable row level security;
alter table public.mood_logs                 enable row level security;
alter table public.memories                  enable row level security;
alter table public.notebook_entries          enable row level security;
alter table public.risk_events               enable row level security;
alter table public.notifications             enable row level security;
alter table public.timeline_weeks            enable row level security;
alter table public.telegram_link_tokens      enable row level security;

-- profiles
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- chat_messages
drop policy if exists "own messages" on public.chat_messages;
create policy "own messages" on public.chat_messages
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- mood_logs
drop policy if exists "own moods" on public.mood_logs;
create policy "own moods" on public.mood_logs
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- memories
drop policy if exists "own memories" on public.memories;
create policy "own memories" on public.memories
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- notebook_entries (journal)
drop policy if exists "own notebook" on public.notebook_entries;
create policy "own notebook" on public.notebook_entries
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- risk_events
drop policy if exists "own risk_events" on public.risk_events;
create policy "own risk_events" on public.risk_events
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- notifications
drop policy if exists "own notifications" on public.notifications;
create policy "own notifications" on public.notifications
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- timeline_weeks
drop policy if exists "own timeline" on public.timeline_weeks;
create policy "own timeline" on public.timeline_weeks
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- telegram_link_tokens
drop policy if exists "own telegram tokens" on public.telegram_link_tokens;
create policy "own telegram tokens" on public.telegram_link_tokens
  for all to authenticated
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- NOTE: telegram_processed_updates, email_processed_messages, and
-- risk_events are written by the server using the service-role key
-- (which bypasses RLS). No user-facing RLS needed on those tables.
