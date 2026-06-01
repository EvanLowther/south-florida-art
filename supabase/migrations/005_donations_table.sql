-- Create donations table for storing confirmed Stripe payments
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to read donations
CREATE POLICY "Allow authenticated read on donations"
  ON donations FOR SELECT
  TO authenticated
  USING (true);

-- Allow the stripe-webhook edge function to insert donations
-- (uses service_role key via Supabase dashboard)
CREATE POLICY "Allow service_role insert on donations"
  ON donations FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
