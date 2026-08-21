-- Telegram proactive check-ins (add-on). Safe to run on existing projects.

alter table profiles
  add column if not exists telegram_chat_id text,
  add column if not exists telegram_opt_in boolean not null default false,
  add column if not exists telegram_connected_at timestamptz;

create unique index if not exists profiles_telegram_chat_id_uidx
  on profiles (telegram_chat_id)
  where telegram_chat_id is not null;

-- Extend notification channel enum (drop/recreate check if present).
alter table notifications drop constraint if exists notifications_channel_check;
alter table notifications add constraint notifications_channel_check
  check (channel in ('email', 'whatsapp', 'telegram'));

-- One-time link tokens for bot /start deep links (service-role only).
create table if not exists telegram_link_tokens (
  token       text primary key,
  profile_id  uuid not null references profiles(id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists telegram_link_tokens_profile_idx
  on telegram_link_tokens (profile_id);
