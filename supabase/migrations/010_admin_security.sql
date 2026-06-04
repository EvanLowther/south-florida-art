-- Restrict admin data access to service_role only (edge functions)
-- Drop permissive RLS policies that allowed any authenticated user to read/write admin data
DROP POLICY IF EXISTS "Allow authenticated read on instrument_inquiries" ON instrument_inquiries;
DROP POLICY IF EXISTS "Allow authenticated update on instrument_inquiries" ON instrument_inquiries;
DROP POLICY IF EXISTS "Allow authenticated delete on instrument_inquiries" ON instrument_inquiries;
DROP POLICY IF EXISTS "Allow authenticated delete on newsletter_subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Allow authenticated read on donations" ON donations;

-- Restrict event_signups: no direct anon INSERT (must go through edge function)
DROP POLICY IF EXISTS "Allow anon insert on event_signups" ON event_signups;
DROP POLICY IF EXISTS "Allow authenticated select on event_signups" ON event_signups;

-- Allow service_role full access to admin tables (edge functions)
DROP POLICY IF EXISTS "Allow service_role all on instrument_inquiries" ON instrument_inquiries;
CREATE POLICY "Allow service_role all on instrument_inquiries"
  ON instrument_inquiries FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role all on newsletter_subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow service_role all on newsletter_subscriptions"
  ON newsletter_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role all on donations" ON donations;
CREATE POLICY "Allow service_role all on donations"
  ON donations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service_role all on event_signups" ON event_signups;
CREATE POLICY "Allow service_role all on event_signups"
  ON event_signups FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Keep public read on events (needed for the public events page)
-- Already exists from migration 008, no change needed

-- Note: After this migration, all admin data access goes through edge functions.
-- Set the ADMIN_EMAILS environment variable on Supabase edge functions
-- to a comma-separated list of admin email addresses.
