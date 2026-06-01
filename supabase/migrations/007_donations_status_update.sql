-- Add 'pending' to the donations status check constraint
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'completed', 'refunded'));
ALTER TABLE donations ALTER COLUMN status SET DEFAULT 'pending';

-- Add update policy for service_role (webhook updates pending → completed)
DROP POLICY IF EXISTS "Allow service_role insert on donations" ON donations;
CREATE POLICY "Allow service_role all on donations"
  ON donations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
