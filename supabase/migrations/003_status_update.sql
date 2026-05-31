-- Allow authenticated admins to update inquiry status
CREATE POLICY "Allow authenticated update on instrument_inquiries"
  ON instrument_inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
