-- ============================================================
-- EventSphere Row Level Security Policies
-- Complete RLS for every table
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is organiser
CREATE OR REPLACE FUNCTION public.is_organiser()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = (SELECT auth.uid()) AND role IN ('organiser', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is the organiser of a specific event
CREATE OR REPLACE FUNCTION public.is_event_organiser(p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = p_event_id AND organiser_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE organiser_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendee_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_descriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS POLICIES
-- ============================================================

-- Anyone authenticated can view user profiles
CREATE POLICY "users_select_all" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Admin can update any user
CREATE POLICY "users_admin_update" ON users
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Users can insert their own profile (triggered by signup)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Admin can delete users
CREATE POLICY "users_admin_delete" ON users
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================

-- Anyone can view categories (even anonymous)
CREATE POLICY "categories_select_all" ON categories
  FOR SELECT
  USING (true);

-- Only admin can manage categories
CREATE POLICY "categories_admin_insert" ON categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_admin_update" ON categories
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "categories_admin_delete" ON categories
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- EVENTS POLICIES
-- ============================================================

-- Anyone can view published events
CREATE POLICY "events_select_published" ON events
  FOR SELECT
  USING (status = 'published' OR status = 'completed');

-- Organisers can view their own events (any status)
CREATE POLICY "events_select_own" ON events
  FOR SELECT TO authenticated
  USING (organiser_id = (SELECT auth.uid()));

-- Admin can view all events
CREATE POLICY "events_admin_select" ON events
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Organisers can create events
CREATE POLICY "events_organiser_insert" ON events
  FOR INSERT TO authenticated
  WITH CHECK (
    organiser_id = (SELECT auth.uid()) AND public.is_organiser()
  );

-- Organisers can update their own events
CREATE POLICY "events_organiser_update" ON events
  FOR UPDATE TO authenticated
  USING (organiser_id = (SELECT auth.uid()))
  WITH CHECK (organiser_id = (SELECT auth.uid()));

-- Admin can update any event
CREATE POLICY "events_admin_update" ON events
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Organisers can delete their own draft events
CREATE POLICY "events_organiser_delete" ON events
  FOR DELETE TO authenticated
  USING (organiser_id = (SELECT auth.uid()) AND status = 'draft');

-- Admin can delete any event
CREATE POLICY "events_admin_delete" ON events
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- EVENT IMAGES POLICIES
-- ============================================================

-- Anyone can view event images for published events
CREATE POLICY "event_images_select" ON event_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_images.event_id 
      AND (events.status = 'published' OR events.status = 'completed')
    )
  );

-- Organiser can view images of own events
CREATE POLICY "event_images_select_own" ON event_images
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

-- Organiser can manage images for own events
CREATE POLICY "event_images_insert" ON event_images
  FOR INSERT TO authenticated
  WITH CHECK (public.is_event_organiser(event_id));

CREATE POLICY "event_images_update" ON event_images
  FOR UPDATE TO authenticated
  USING (public.is_event_organiser(event_id));

CREATE POLICY "event_images_delete" ON event_images
  FOR DELETE TO authenticated
  USING (public.is_event_organiser(event_id));

-- ============================================================
-- SPEAKERS POLICIES
-- ============================================================

-- Anyone can view speakers for published events
CREATE POLICY "speakers_select" ON speakers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = speakers.event_id 
      AND (events.status = 'published' OR events.status = 'completed')
    )
  );

-- Organiser can view speakers of own events
CREATE POLICY "speakers_select_own" ON speakers
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

-- Organiser can manage speakers
CREATE POLICY "speakers_insert" ON speakers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_event_organiser(event_id));

CREATE POLICY "speakers_update" ON speakers
  FOR UPDATE TO authenticated
  USING (public.is_event_organiser(event_id));

CREATE POLICY "speakers_delete" ON speakers
  FOR DELETE TO authenticated
  USING (public.is_event_organiser(event_id));

-- ============================================================
-- TICKET TYPES POLICIES
-- ============================================================

-- Anyone can view active ticket types for published events
CREATE POLICY "ticket_types_select" ON ticket_types
  FOR SELECT
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = ticket_types.event_id 
      AND events.status = 'published'
    )
  );

-- Organiser can view all ticket types for own events
CREATE POLICY "ticket_types_select_own" ON ticket_types
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

-- Organiser can manage ticket types
CREATE POLICY "ticket_types_insert" ON ticket_types
  FOR INSERT TO authenticated
  WITH CHECK (public.is_event_organiser(event_id));

CREATE POLICY "ticket_types_update" ON ticket_types
  FOR UPDATE TO authenticated
  USING (public.is_event_organiser(event_id));

CREATE POLICY "ticket_types_delete" ON ticket_types
  FOR DELETE TO authenticated
  USING (public.is_event_organiser(event_id));

-- ============================================================
-- DISCOUNT CODES POLICIES
-- ============================================================

-- Authenticated users can validate discount codes (SELECT by code)
CREATE POLICY "discount_codes_validate" ON discount_codes
  FOR SELECT TO authenticated
  USING (
    is_active = true AND (expires_at IS NULL OR expires_at > now())
  );

-- Organiser can manage discount codes for own events
CREATE POLICY "discount_codes_select_own" ON discount_codes
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

CREATE POLICY "discount_codes_insert" ON discount_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_event_organiser(event_id));

CREATE POLICY "discount_codes_update" ON discount_codes
  FOR UPDATE TO authenticated
  USING (public.is_event_organiser(event_id));

CREATE POLICY "discount_codes_delete" ON discount_codes
  FOR DELETE TO authenticated
  USING (public.is_event_organiser(event_id));

-- ============================================================
-- REGISTRATIONS POLICIES
-- ============================================================

-- Users can view their own registrations
CREATE POLICY "registrations_select_own" ON registrations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Organisers can view registrations for their events
CREATE POLICY "registrations_select_organiser" ON registrations
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

-- Admin can view all registrations
CREATE POLICY "registrations_admin_select" ON registrations
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Authenticated users can create registrations
CREATE POLICY "registrations_insert" ON registrations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update own registrations (e.g., cancel)
CREATE POLICY "registrations_update_own" ON registrations
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Admin/organiser can update registrations
CREATE POLICY "registrations_admin_update" ON registrations
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR public.is_event_organiser(event_id));

-- ============================================================
-- TICKETS POLICIES
-- ============================================================

-- Users can view their own tickets
CREATE POLICY "tickets_select_own" ON tickets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations 
      WHERE registrations.id = tickets.registration_id 
      AND registrations.user_id = (SELECT auth.uid())
    )
  );

-- Organisers can view tickets for their events
CREATE POLICY "tickets_select_organiser" ON tickets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.id = tickets.registration_id 
      AND e.organiser_id = (SELECT auth.uid())
    )
  );

-- Admin can view all tickets
CREATE POLICY "tickets_admin_select" ON tickets
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- System can create tickets (via server function)
CREATE POLICY "tickets_insert" ON tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registrations 
      WHERE registrations.id = tickets.registration_id 
      AND registrations.user_id = (SELECT auth.uid())
    )
  );

-- Organiser/admin can update ticket status
CREATE POLICY "tickets_update" ON tickets
  FOR UPDATE TO authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.id = tickets.registration_id 
      AND e.organiser_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================

-- Users can view their own payments
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Organisers can view payments for their events
CREATE POLICY "payments_select_organiser" ON payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.id = payments.registration_id 
      AND e.organiser_id = (SELECT auth.uid())
    )
  );

-- Admin can view all payments
CREATE POLICY "payments_admin_select" ON payments
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Users can create payments for their registrations
CREATE POLICY "payments_insert" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- System can update payment status
CREATE POLICY "payments_update" ON payments
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- ============================================================
-- CHECKINS POLICIES
-- ============================================================

-- Organisers can view check-ins for their events
CREATE POLICY "checkins_select_organiser" ON checkins
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

-- Admin can view all check-ins
CREATE POLICY "checkins_admin_select" ON checkins
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Organisers can create check-ins
CREATE POLICY "checkins_insert" ON checkins
  FOR INSERT TO authenticated
  WITH CHECK (public.is_event_organiser(event_id));

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

-- Anyone can view visible reviews
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT
  USING (is_visible = true);

-- Users can view their own reviews
CREATE POLICY "reviews_select_own" ON reviews
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Authenticated users can create reviews
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Admin can manage all reviews
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL TO authenticated
  USING (public.is_admin());

-- ============================================================
-- WISHLISTS POLICIES
-- ============================================================

-- Users can view their own wishlists
CREATE POLICY "wishlists_select_own" ON wishlists
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Users can add to wishlist
CREATE POLICY "wishlists_insert" ON wishlists
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can remove from wishlist
CREATE POLICY "wishlists_delete_own" ON wishlists
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- System/admin can create notifications
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own" ON notifications
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- REFUND REQUESTS POLICIES
-- ============================================================

-- Users can view their own refund requests
CREATE POLICY "refund_requests_select_own" ON refund_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Admin can view all refund requests
CREATE POLICY "refund_requests_admin_select" ON refund_requests
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Organisers can view refund requests for their events
CREATE POLICY "refund_requests_organiser_select" ON refund_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE r.id = refund_requests.registration_id 
      AND e.organiser_id = (SELECT auth.uid())
    )
  );

-- Users can create refund requests
CREATE POLICY "refund_requests_insert" ON refund_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Admin can update refund requests
CREATE POLICY "refund_requests_admin_update" ON refund_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- ORGANISER PAYOUTS POLICIES
-- ============================================================

-- Organisers can view their own payouts
CREATE POLICY "organiser_payouts_select_own" ON organiser_payouts
  FOR SELECT TO authenticated
  USING (organiser_id = (SELECT auth.uid()));

-- Admin can view all payouts
CREATE POLICY "organiser_payouts_admin_select" ON organiser_payouts
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admin can manage payouts
CREATE POLICY "organiser_payouts_admin_insert" ON organiser_payouts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "organiser_payouts_admin_update" ON organiser_payouts
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- ATTENDEE NETWORKS POLICIES
-- ============================================================

-- Users can view attendee networks for events they registered for
CREATE POLICY "attendee_networks_select" ON attendee_networks
  FOR SELECT TO authenticated
  USING (
    share_linkedin = true AND
    EXISTS (
      SELECT 1 FROM registrations 
      WHERE registrations.event_id = attendee_networks.event_id 
      AND registrations.user_id = (SELECT auth.uid())
      AND registrations.status = 'confirmed'
    )
  );

-- Users can view their own network entries
CREATE POLICY "attendee_networks_select_own" ON attendee_networks
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Users can manage their own network entries
CREATE POLICY "attendee_networks_insert" ON attendee_networks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "attendee_networks_update" ON attendee_networks
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "attendee_networks_delete" ON attendee_networks
  FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- EVENT VIEWS POLICIES
-- ============================================================

-- Anyone can insert event views (analytics)
CREATE POLICY "event_views_insert" ON event_views
  FOR INSERT
  WITH CHECK (true);

-- Organisers can view analytics for their events
CREATE POLICY "event_views_select_organiser" ON event_views
  FOR SELECT TO authenticated
  USING (public.is_event_organiser(event_id));

-- Admin can view all analytics
CREATE POLICY "event_views_admin_select" ON event_views
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ============================================================
-- AI RECOMMENDATIONS POLICIES
-- ============================================================

-- Users can view their own recommendations
CREATE POLICY "ai_recommendations_select_own" ON ai_recommendations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- System can insert recommendations
CREATE POLICY "ai_recommendations_insert" ON ai_recommendations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- System can update recommendations
CREATE POLICY "ai_recommendations_update" ON ai_recommendations
  FOR UPDATE TO authenticated
  USING (true);

-- ============================================================
-- AI GENERATED DESCRIPTIONS POLICIES
-- ============================================================

-- Users can view their own generated descriptions
CREATE POLICY "ai_descriptions_select_own" ON ai_generated_descriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Organisers can create AI descriptions
CREATE POLICY "ai_descriptions_insert" ON ai_generated_descriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()) AND public.is_organiser());

-- Organisers can update their own AI descriptions
CREATE POLICY "ai_descriptions_update" ON ai_generated_descriptions
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));
