-- ============================================================
-- EventSphere Database Functions & Triggers
-- ============================================================

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'attendee'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INCREMENT TICKET SOLD COUNT (ATOMIC)
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_sold_count(p_ticket_type_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE ticket_types 
  SET sold_count = sold_count + p_quantity
  WHERE id = p_ticket_type_id
  AND sold_count + p_quantity <= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough tickets available';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DECREMENT TICKET SOLD COUNT (FOR REFUNDS)
-- ============================================================

CREATE OR REPLACE FUNCTION public.decrement_sold_count(p_ticket_type_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE ticket_types 
  SET sold_count = GREATEST(sold_count - p_quantity, 0)
  WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GENERATE UNIQUE SLUG FOR EVENTS
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_event_slug(p_title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := lower(regexp_replace(trim(p_title), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  
  WHILE EXISTS (SELECT 1 FROM events WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- GET EVENT STATISTICS (FOR ORGANISER DASHBOARD)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_event_stats(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_registrations', (
      SELECT COUNT(*) FROM registrations 
      WHERE event_id = p_event_id AND status = 'confirmed'
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments 
      WHERE registration_id IN (
        SELECT id FROM registrations WHERE event_id = p_event_id
      ) AND status = 'completed'
    ),
    'total_checkins', (
      SELECT COUNT(*) FROM checkins WHERE event_id = p_event_id
    ),
    'total_tickets_sold', (
      SELECT COALESCE(SUM(sold_count), 0) FROM ticket_types 
      WHERE event_id = p_event_id
    ),
    'total_capacity', (
      SELECT COALESCE(SUM(quantity), 0) FROM ticket_types 
      WHERE event_id = p_event_id
    ),
    'avg_rating', (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) FROM reviews 
      WHERE event_id = p_event_id AND is_visible = true
    ),
    'total_reviews', (
      SELECT COUNT(*) FROM reviews 
      WHERE event_id = p_event_id AND is_visible = true
    ),
    'total_views', (
      SELECT COUNT(*) FROM event_views WHERE event_id = p_event_id
    ),
    'wishlist_count', (
      SELECT COUNT(*) FROM wishlists WHERE event_id = p_event_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GET ORGANISER DASHBOARD STATS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_organiser_stats(p_organiser_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', (
      SELECT COUNT(*) FROM events WHERE organiser_id = p_organiser_id
    ),
    'published_events', (
      SELECT COUNT(*) FROM events 
      WHERE organiser_id = p_organiser_id AND status = 'published'
    ),
    'total_registrations', (
      SELECT COUNT(*) FROM registrations r
      JOIN events e ON e.id = r.event_id
      WHERE e.organiser_id = p_organiser_id AND r.status = 'confirmed'
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(p.amount), 0) FROM payments p
      JOIN registrations r ON r.id = p.registration_id
      JOIN events e ON e.id = r.event_id
      WHERE e.organiser_id = p_organiser_id AND p.status = 'completed'
    ),
    'total_checkins', (
      SELECT COUNT(*) FROM checkins c
      JOIN events e ON e.id = c.event_id
      WHERE e.organiser_id = p_organiser_id
    ),
    'total_views', (
      SELECT COUNT(*) FROM event_views ev
      JOIN events e ON e.id = ev.event_id
      WHERE e.organiser_id = p_organiser_id
    ),
    'pending_refunds', (
      SELECT COUNT(*) FROM refund_requests rr
      JOIN registrations r ON r.id = rr.registration_id
      JOIN events e ON e.id = r.event_id
      WHERE e.organiser_id = p_organiser_id AND rr.status = 'pending'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GET ADMIN DASHBOARD STATS
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users WHERE role = 'attendee'),
    'total_organisers', (SELECT COUNT(*) FROM users WHERE role = 'organiser'),
    'total_admins', (SELECT COUNT(*) FROM users WHERE role = 'admin'),
    'total_events', (SELECT COUNT(*) FROM events),
    'published_events', (SELECT COUNT(*) FROM events WHERE status = 'published'),
    'total_registrations', (SELECT COUNT(*) FROM registrations WHERE status = 'confirmed'),
    'total_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed'
    ),
    'pending_refunds', (
      SELECT COUNT(*) FROM refund_requests WHERE status = 'pending'
    ),
    'total_categories', (SELECT COUNT(*) FROM categories),
    'events_this_month', (
      SELECT COUNT(*) FROM events 
      WHERE created_at >= date_trunc('month', now())
    ),
    'registrations_this_month', (
      SELECT COUNT(*) FROM registrations 
      WHERE created_at >= date_trunc('month', now()) AND status = 'confirmed'
    ),
    'revenue_this_month', (
      SELECT COALESCE(SUM(amount), 0) FROM payments 
      WHERE created_at >= date_trunc('month', now()) AND status = 'completed'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VALIDATE AND APPLY DISCOUNT CODE
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_discount_code(p_code TEXT, p_event_id UUID)
RETURNS JSON AS $$
DECLARE
  discount RECORD;
BEGIN
  SELECT * INTO discount FROM discount_codes
  WHERE code = p_code 
  AND event_id = p_event_id
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_uses IS NULL OR used_count < max_uses);
  
  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'message', 'Invalid or expired discount code');
  END IF;
  
  RETURN json_build_object(
    'valid', true,
    'id', discount.id,
    'discount_type', discount.discount_type,
    'discount_value', discount.discount_value,
    'min_order_amount', discount.min_order_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INCREMENT DISCOUNT CODE USAGE
-- ============================================================

CREATE OR REPLACE FUNCTION public.use_discount_code(p_discount_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discount_codes
  SET used_count = used_count + 1
  WHERE id = p_discount_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REALTIME PUBLICATIONS
-- ============================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
