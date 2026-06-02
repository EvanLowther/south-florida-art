-- Create events table for admin-managed events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on events" ON events;
CREATE POLICY "Allow public read on events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon or authenticated
-- Only service_role (edge functions) can write — this is the default deny

-- Create index for ordering queries
CREATE INDEX IF NOT EXISTS idx_events_sort_order ON events(sort_order ASC);

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  false,
  26214400,
  ARRAY['image/png', 'image/jpeg']::text[]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read on event-images" ON storage.objects;
CREATE POLICY "Allow public read on event-images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow authenticated insert on event-images" ON storage.objects;
CREATE POLICY "Allow authenticated insert on event-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow authenticated update on event-images" ON storage.objects;
CREATE POLICY "Allow authenticated update on event-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Allow authenticated delete on event-images" ON storage.objects;
CREATE POLICY "Allow authenticated delete on event-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-images');
