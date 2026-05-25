-- ============================================================
-- EventSphere Storage Buckets & Policies
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-banners', 'event-banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('event-gallery', 'event-gallery', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('speaker-images', 'speaker-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-images', 'profile-images', false, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- EVENT BANNERS - Public read, organiser write
-- ============================================================

CREATE POLICY "event_banners_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-banners');

CREATE POLICY "event_banners_organiser_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event-banners' AND public.is_organiser()
  );

CREATE POLICY "event_banners_organiser_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'event-banners' AND public.is_organiser()
  );

CREATE POLICY "event_banners_organiser_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'event-banners' AND public.is_organiser()
  );

-- ============================================================
-- EVENT GALLERY - Public read, organiser write
-- ============================================================

CREATE POLICY "event_gallery_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-gallery');

CREATE POLICY "event_gallery_organiser_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'event-gallery' AND public.is_organiser()
  );

CREATE POLICY "event_gallery_organiser_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'event-gallery' AND public.is_organiser()
  );

CREATE POLICY "event_gallery_organiser_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'event-gallery' AND public.is_organiser()
  );

-- ============================================================
-- SPEAKER IMAGES - Public read, organiser write
-- ============================================================

CREATE POLICY "speaker_images_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'speaker-images');

CREATE POLICY "speaker_images_organiser_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'speaker-images' AND public.is_organiser()
  );

CREATE POLICY "speaker_images_organiser_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'speaker-images' AND public.is_organiser()
  );

CREATE POLICY "speaker_images_organiser_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'speaker-images' AND public.is_organiser()
  );

-- ============================================================
-- PROFILE IMAGES - Private, user-specific
-- ============================================================

CREATE POLICY "profile_images_own_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "profile_images_own_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "profile_images_own_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "profile_images_own_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Admin can access all profile images
CREATE POLICY "profile_images_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-images' AND public.is_admin()
  );
