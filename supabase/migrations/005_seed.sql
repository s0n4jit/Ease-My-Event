-- ============================================================
-- EventSphere Seed Data
-- Categories + Admin User
-- ============================================================

-- ============================================================
-- SEED DEFAULT CATEGORIES
-- ============================================================

INSERT INTO categories (name, slug, description, icon) VALUES
  ('Technology', 'technology', 'Tech conferences, hackathons, and developer meetups', 'cpu'),
  ('Music', 'music', 'Concerts, festivals, and live performances', 'music'),
  ('Business', 'business', 'Networking events, seminars, and corporate gatherings', 'briefcase'),
  ('Sports', 'sports', 'Tournaments, fitness events, and athletic competitions', 'trophy'),
  ('Arts & Culture', 'arts-culture', 'Art exhibitions, theater, and cultural festivals', 'palette'),
  ('Education', 'education', 'Workshops, courses, and educational seminars', 'graduation-cap'),
  ('Food & Drink', 'food-drink', 'Food festivals, tastings, and culinary events', 'utensils'),
  ('Health & Wellness', 'health-wellness', 'Yoga retreats, health summits, and wellness workshops', 'heart-pulse'),
  ('Science', 'science', 'Research symposiums, science fairs, and innovation expos', 'flask-conical'),
  ('Community', 'community', 'Social gatherings, charity events, and community meetups', 'users'),
  ('Gaming', 'gaming', 'Esports tournaments, game launches, and gaming conventions', 'gamepad-2'),
  ('Photography', 'photography', 'Photo walks, exhibitions, and photography workshops', 'camera')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- NOTE ON ADMIN USER
-- ============================================================
-- The admin user must be created through Supabase Auth first.
-- After creating the auth user (email: admin@eventsphere.local, password: Admin@123456),
-- the handle_new_user() trigger will automatically create a profile.
-- Then update the role to admin:
--
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@eventsphere.local';
--
-- For a hackathon setup, you can run this manually in the Supabase SQL editor
-- after signing up the admin account through the app's signup form.
-- 
-- Alternatively, create the user via Supabase Dashboard:
-- 1. Go to Authentication > Users > Add User
-- 2. Email: admin@eventsphere.local, Password: Admin@123456
-- 3. Run: UPDATE public.users SET role = 'admin' WHERE email = 'admin@eventsphere.local';
