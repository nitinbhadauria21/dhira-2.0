-- Idempotency for inbound Telegram webhook retries (update_id dedupe).
create table if not exists telegram_processed_updates (
  update_id     bigint primary key,
  processed_at  timestamptz not null default now()
);

create index if not exists telegram_processed_updates_at_idx
  on telegram_processed_updates (processed_at);
