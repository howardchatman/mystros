-- ============================================================================
-- PHASE 2: Announcements, In-App Notifications, Calendar Events
-- ============================================================================

-- Announcements (school-wide or per-campus)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  target_audience VARCHAR(20) DEFAULT 'all',
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In-app notifications (per-user inbox)
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  link_url VARCHAR(500),
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events (holidays, closures, deadlines)
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(30) NOT NULL,
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  all_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_announcements_campus ON announcements(campus_id);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON in_app_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON in_app_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON in_app_notifications(category);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_campus ON calendar_events(campus_id);

-- RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Announcements policies
CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid()
      AND role IN ('superadmin', 'campus_admin')
  ));

CREATE POLICY "Users can view published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = true
    AND (published_at IS NULL OR published_at <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- In-app notifications policies
CREATE POLICY "Users can view own notifications"
  ON in_app_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications read"
  ON in_app_notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can create notifications"
  ON in_app_notifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid()
      AND role IN ('superadmin', 'campus_admin', 'financial_aid', 'registrar', 'instructor')
  ));

-- Calendar events policies
CREATE POLICY "Admins can manage calendar events"
  ON calendar_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid()
      AND role IN ('superadmin', 'campus_admin')
  ));

CREATE POLICY "All users can view calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Updated_at triggers
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
