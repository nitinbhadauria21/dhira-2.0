-- Dhira — notification orchestration fields (Emergent Demo Day)
-- Run this in Supabase → SQL Editor → New query → Run
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

alter table profiles
  add column if not exists last_proactive_at timestamptz,
  add column if not exists last_weekly_at timestamptz;

alter table notifications
  add column if not exists template_key text,
  add column if not exists subject text;

create index if not exists profiles_checkin_due_idx
  on profiles(consent_checkin, last_proactive_at);
