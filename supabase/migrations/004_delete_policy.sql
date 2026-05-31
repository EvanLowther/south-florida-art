-- Allow authenticated admins to delete inquiries
CREATE POLICY "Allow authenticated delete on instrument_inquiries"
  ON instrument_inquiries FOR DELETE
  TO authenticated
  USING (true);

-- Allow authenticated admins to delete subscriptions
CREATE POLICY "Allow authenticated delete on newsletter_subscriptions"
  ON newsletter_subscriptions FOR DELETE
  TO authenticated
  USING (true);
