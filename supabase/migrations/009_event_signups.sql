-- Add has_signup_button toggle to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS has_signup_button BOOLEAN DEFAULT false;

-- Create event_signups table
CREATE TABLE IF NOT EXISTS event_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;

-- Allow anon INSERT (public form submissions)
DROP POLICY IF EXISTS "Allow anon insert on event_signups" ON event_signups;
CREATE POLICY "Allow anon insert on event_signups"
  ON event_signups FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated SELECT (admin reads)
DROP POLICY IF EXISTS "Allow authenticated select on event_signups" ON event_signups;
CREATE POLICY "Allow authenticated select on event_signups"
  ON event_signups FOR SELECT
  TO authenticated
  USING (true);

-- Index for filtering by event
CREATE INDEX IF NOT EXISTS idx_event_signups_event_id ON event_signups(event_id);
CREATE INDEX IF NOT EXISTS idx_event_signups_created_at ON event_signups(created_at DESC);
