-- Allow authenticated admins to update inquiry status
DROP POLICY IF EXISTS "Allow authenticated update on instrument_inquiries" ON instrument_inquiries;
CREATE POLICY "Allow authenticated update on instrument_inquiries"
  ON instrument_inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
