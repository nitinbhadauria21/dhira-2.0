-- CalmLink pack: city/state (if missing), shift preference, notebook entries.

alter table profiles add column if not exists state text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists voice_preference text;
alter table profiles add column if not exists shift text not null default 'day';

create table if not exists notebook_entries (
  id               uuid primary key,
  profile_id       uuid not null references profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  mode             text not null check (mode in ('write', 'speak')),
  body             text not null,
  mood             text not null,
  topics           text[] not null default '{}',
  share_with_dhira boolean not null default true
);

create index if not exists notebook_entries_profile_idx
  on notebook_entries(profile_id, created_at desc);

alter table notebook_entries enable row level security;

drop policy if exists notebook_entries_own on notebook_entries;
create policy notebook_entries_own on notebook_entries
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
