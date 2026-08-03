-- Update the mood_logs source check constraint to allow 'elevenlabs'
ALTER TABLE public.mood_logs DROP CONSTRAINT IF EXISTS mood_logs_source_check;
ALTER TABLE public.mood_logs ADD CONSTRAINT mood_logs_source_check CHECK (source IN ('chat', 'manual', 'elevenlabs'));
