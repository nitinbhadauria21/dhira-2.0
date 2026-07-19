-- Dhira — Supabase schema (anonymous-first).
--
-- HOW TO USE (plain English):
-- 1. In your Supabase project, open the SQL Editor.
-- 2. Paste this whole file and click "Run".
-- 3. Add your project URL + keys to .env.local (see .env.example).
--
-- We only store the anonymous metadata the product allows: no real names,
-- no raw personal identifiers. Row-Level Security (RLS) is ON for every
-- table; the app's server talks to these tables with the service-role key,
-- and always filters by profile_id, so users only ever touch their own rows.

create table if not exists profiles (
  id                text primary key,          -- anonymous id from a secure cookie
  alias             text not null default 'Friend',
  avatar            text not null default 'moon',
  language          text not null default 'hinglish',
  consent_checkin   boolean not null default true,
  consent_memory    boolean not null default true,
  checkin_frequency text not null default 'daily',
  checkin_window    text not null default '22:00-23:00',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists chat_messages (
  id         uuid primary key,
  profile_id text not null references profiles(id) on delete cascade,
  role       text not null check (role in ('user', 'dhira')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_profile_idx on chat_messages(profile_id, created_at);

create table if not exists mood_logs (
  id                 uuid primary key,
  profile_id         text not null references profiles(id) on delete cascade,
  mood               text not null,
  valence            real not null default 0,
  emotional_intensity real not null default 0,
  topic_tag          text not null default 'self',
  source             text not null default 'chat' check (source in ('chat', 'manual')),
  created_at         timestamptz not null default now()
);
create index if not exists mood_logs_profile_idx on mood_logs(profile_id, created_at);

create table if not exists memories (
  id           uuid primary key,
  profile_id   text not null references profiles(id) on delete cascade,
  summary      text not null,
  mood         text not null default 'neutral',
  topic_tag    text not null default 'self',
  carry_forward text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists memories_profile_idx on memories(profile_id, created_at);

create table if not exists risk_events (
  id         uuid primary key,
  profile_id text not null references profiles(id) on delete cascade,
  risk_level text not null check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'CRISIS')),
  signal     text not null default '',
  handled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists risk_events_created_idx on risk_events(created_at);

-- Lock everything down: RLS ON, no public policies. Only the server's
-- service-role key (which bypasses RLS) may read/write. This keeps the
-- anonymous data private by default.
alter table profiles     enable row level security;
alter table chat_messages enable row level security;
alter table mood_logs    enable row level security;
alter table memories     enable row level security;
alter table risk_events  enable row level security;
