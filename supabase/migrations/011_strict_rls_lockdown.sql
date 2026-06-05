-- Drop leaked authenticated read on newsletter_subscriptions (migration 002 created it, 010 missed it)
DROP POLICY IF EXISTS "Allow authenticated read on newsletter_subscriptions" ON newsletter_subscriptions;

-- Drop unnecessary storage policies for event-images (we use base64 data URIs, not storage)
DROP POLICY IF EXISTS "Allow authenticated insert on event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on event-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on event-images" ON storage.objects;

-- Keep public read on event-images storage (harmless, no files stored there)
-- Keep public read on events (needed for public site)
