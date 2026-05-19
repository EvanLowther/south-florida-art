-- Create instrument_inquiries table
CREATE TABLE IF NOT EXISTS instrument_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  instrument_type TEXT NOT NULL,
  condition_description TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE instrument_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public to insert instrument inquiries
CREATE POLICY "Allow public insert on instrument_inquiries"
  ON instrument_inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public to insert newsletter subscriptions
CREATE POLICY "Allow public insert on newsletter_subscriptions"
  ON newsletter_subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_instrument_inquiries_created_at ON instrument_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);