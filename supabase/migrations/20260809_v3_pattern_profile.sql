-- Agent Prompts v3: user pattern profile + risk classification metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_pattern_profile text;
ALTER TABLE risk_events ADD COLUMN IF NOT EXISTS risk_classification text;
