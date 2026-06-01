-- Create rate_limits table for tracking request frequency per IP
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ip_address, endpoint)
);

-- Allow the edge functions to read/write rate_limits (via service_role key)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role all on rate_limits"
  ON rate_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Cleanup old entries periodically
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
