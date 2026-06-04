-- Revoke direct anon inserts — all writes go through edge functions
DROP POLICY IF EXISTS "Allow public insert on instrument_inquiries" ON instrument_inquiries;
DROP POLICY IF EXISTS "Allow public insert on newsletter_subscriptions" ON newsletter_subscriptions;

-- Allow authenticated admins to read inquiries
DROP POLICY IF EXISTS "Allow authenticated read on instrument_inquiries" ON instrument_inquiries;
CREATE POLICY "Allow authenticated read on instrument_inquiries"
  ON instrument_inquiries FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admins to read subscriptions
DROP POLICY IF EXISTS "Allow authenticated read on newsletter_subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Allow authenticated read on newsletter_subscriptions"
  ON newsletter_subscriptions FOR SELECT
  TO authenticated
  USING (true);
