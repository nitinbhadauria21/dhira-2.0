-- Idempotency for inbound email webhook retries (provider message id dedupe).
create table if not exists email_processed_messages (
  message_id    text primary key,
  processed_at  timestamptz not null default now()
);

create index if not exists email_processed_messages_at_idx
  on email_processed_messages (processed_at);
