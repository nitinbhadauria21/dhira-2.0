-- Add city/state (sign-up + Location) and voice preference (Manage Voice).
-- Safe to run on existing projects: columns are nullable so older profiles stay valid.

alter table profiles add column if not exists state text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists voice_preference text;
