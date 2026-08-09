-- Track whether mood was tagged by live model or offline heuristic (admin/debug).
ALTER TABLE public.mood_logs
  ADD COLUMN IF NOT EXISTS mood_tag_source text
  CHECK (mood_tag_source IS NULL OR mood_tag_source IN ('live', 'offline'));
