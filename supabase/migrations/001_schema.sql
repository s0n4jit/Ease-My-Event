-- ============================================================
-- EventSphere Database Schema
-- Complete production-ready schema with 20+ tables
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('attendee', 'organiser', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE event_type AS ENUM ('online', 'offline', 'hybrid');
CREATE TYPE ticket_status AS ENUM ('valid', 'used', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE registration_status AS ENUM ('confirmed', 'cancelled', 'refunded');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE discount_type AS ENUM ('percentage', 'flat');
CREATE TYPE notification_type AS ENUM ('registration', 'reminder', 'cancellation', 'refund', 'review', 'system', 'checkin', 'payout');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'attendee',
  phone TEXT,
  bio TEXT,
  linkedin_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'tag',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================================
-- EVENTS TABLE
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  event_type event_type NOT NULL DEFAULT 'offline',
  venue_name TEXT,
  venue_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  online_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  capacity INTEGER,
  status event_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  banner_url TEXT,
  faq JSONB DEFAULT '[]'::jsonb,
  agenda JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_organiser ON events(organiser_id);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_featured ON events(is_featured) WHERE is_featured = true;

-- ============================================================
-- EVENT IMAGES TABLE
-- ============================================================

CREATE TABLE event_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_images_event ON event_images(event_id);

-- ============================================================
-- SPEAKERS TABLE
-- ============================================================

CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_speakers_event ON speakers(event_id);

-- ============================================================
-- TICKET TYPES TABLE
-- ============================================================

CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  quantity INTEGER NOT NULL,
  sold_count INTEGER NOT NULL DEFAULT 0,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);

-- ============================================================
-- DISCOUNT CODES TABLE
-- ============================================================

CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(10,2),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, code)
);

CREATE INDEX idx_discount_codes_event ON discount_codes(event_id);
CREATE INDEX idx_discount_codes_code ON discount_codes(code);

-- ============================================================
-- REGISTRATIONS TABLE
-- ============================================================

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'confirmed',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- ============================================================
-- TICKETS TABLE
-- ============================================================

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
  qr_code TEXT UNIQUE NOT NULL,
  status ticket_status NOT NULL DEFAULT 'valid',
  attendee_name TEXT,
  attendee_email TEXT,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tickets_registration ON tickets(registration_id);
CREATE INDEX idx_tickets_ticket_type ON tickets(ticket_type_id);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_registration ON payments(registration_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- CHECK-INS TABLE
-- ============================================================

CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
  method TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_checkins_ticket ON checkins(ticket_id);
CREATE INDEX idx_checkins_event ON checkins(event_id);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_reviews_event ON reviews(event_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================================
-- WISHLISTS TABLE
-- ============================================================

CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_wishlists_event ON wishlists(event_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- ============================================================
-- REFUND REQUESTS TABLE
-- ============================================================

CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status refund_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refund_requests_registration ON refund_requests(registration_id);
CREATE INDEX idx_refund_requests_user ON refund_requests(user_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- ============================================================
-- ORGANISER PAYOUTS TABLE
-- ============================================================

CREATE TABLE organiser_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organiser_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payout_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organiser_payouts_organiser ON organiser_payouts(organiser_id);
CREATE INDEX idx_organiser_payouts_event ON organiser_payouts(event_id);

-- ============================================================
-- ATTENDEE NETWORKS TABLE
-- ============================================================

CREATE TABLE attendee_networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_linkedin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_attendee_networks_event ON attendee_networks(event_id);
CREATE INDEX idx_attendee_networks_user ON attendee_networks(user_id);

-- ============================================================
-- EVENT VIEWS TABLE
-- ============================================================

CREATE TABLE event_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_views_event ON event_views(event_id);
CREATE INDEX idx_event_views_user ON event_views(user_id);

-- ============================================================
-- AI RECOMMENDATIONS TABLE
-- ============================================================

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  score DECIMAL(5,4) NOT NULL DEFAULT 0,
  reason TEXT,
  model_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_score ON ai_recommendations(score DESC);

-- ============================================================
-- AI GENERATED DESCRIPTIONS TABLE
-- ============================================================

CREATE TABLE ai_generated_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  model_version TEXT,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_descriptions_event ON ai_generated_descriptions(event_id);
CREATE INDEX idx_ai_descriptions_user ON ai_generated_descriptions(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
