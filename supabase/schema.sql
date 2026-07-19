-- Dhira — Supabase schema (identified accounts + notifications).
--
-- HOW TO USE (plain English):
-- 1. In your Supabase project, open the SQL Editor.
-- 2. Paste this whole file and click "Run".
-- 3. Enable the auth methods you want: Email (password) and Phone (OTP via an
--    SMS provider such as Twilio) under Authentication -> Providers.
-- 4. Add your project URL + keys to .env.local (see .env.example).
--
-- Identity comes from Supabase Auth (auth.users). Each person's profile row
-- uses their auth user id as its primary key. Row-Level Security is ON for
-- every table and scoped to the logged-in user (auth.uid() = user's id).

create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  alias             text not null default 'Friend',
  avatar            text not null default 'moon',
  language          text not null default 'hinglish',
  email             text,
  phone_e164        text,
  preferred_channel text not null default 'email',   -- 'email' | 'whatsapp'
  email_opt_in      boolean not null default true,
  whatsapp_opt_in   boolean not null default false,
  timezone          text not null default 'Asia/Kolkata',
  consent_checkin   boolean not null default true,
  consent_memory    boolean not null default true,
  checkin_frequency text not null default 'daily',
  checkin_window    text not null default '22:00-23:00',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists chat_messages (
  id         uuid primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  role       text not null check (role in ('user', 'dhira')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_profile_idx on chat_messages(profile_id, created_at);

create table if not exists mood_logs (
  id                  uuid primary key,
  profile_id          uuid not null references profiles(id) on delete cascade,
  mood                text not null,
  valence             real not null default 0,
  emotional_intensity real not null default 0,
  topic_tag           text not null default 'self',
  source              text not null default 'chat' check (source in ('chat', 'manual')),
  created_at          timestamptz not null default now()
);
create index if not exists mood_logs_profile_idx on mood_logs(profile_id, created_at);

create table if not exists memories (
  id            uuid primary key,
  profile_id    uuid not null references profiles(id) on delete cascade,
  summary       text not null,
  mood          text not null default 'neutral',
  topic_tag     text not null default 'self',
  carry_forward text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists memories_profile_idx on memories(profile_id, created_at);

create table if not exists risk_events (
  id         uuid primary key,
  profile_id uuid not null references profiles(id) on delete cascade,
  risk_level text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRISIS')),
  signal     text not null default '',
  handled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists risk_events_created_idx on risk_events(created_at);

-- Notifications: one row per message Dhira sends the user (email / WhatsApp).
create table if not exists notifications (
  id                  uuid primary key,
  profile_id          uuid not null references profiles(id) on delete cascade,
  channel             text not null check (channel in ('email', 'whatsapp')),
  type                text not null check (type in ('proactive_checkin', 'weekly_summary', 'crisis_followup')),
  content             text not null,
  status              text not null default 'queued' check (status in ('queued', 'sent', 'delivered', 'failed')),
  provider_message_id text,
  scheduled_for       timestamptz,
  sent_at             timestamptz,
  created_at          timestamptz not null default now()
);
create index if not exists notifications_profile_idx on notifications(profile_id, created_at);

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table profiles      enable row level security;
alter table chat_messages enable row level security;
alter table mood_logs     enable row level security;
alter table memories      enable row level security;
alter table risk_events   enable row level security;
alter table notifications enable row level security;

-- Each user can read/write ONLY their own rows.
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own messages" on chat_messages
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "own moods" on mood_logs
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "own memories" on memories
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "own risk_events" on risk_events
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "own notifications" on notifications
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- NOTE: Dhira's server uses the service-role key (which bypasses RLS) for
-- agent writes, mood tagging, memory notes, risk logging, and admin aggregates.
-- The service-role key must never be exposed to the browser.
