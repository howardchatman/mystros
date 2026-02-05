-- ============================================================================
-- PHASE 9: ENROLLMENT GROWTH SYSTEM
-- Email sequences, lead tracking, Retell call capture
-- ============================================================================

-- Email sequences (drip campaign definitions)
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  trigger_event VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Steps in each sequence
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 0,
  subject VARCHAR(255) NOT NULL,
  template_code VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_number)
);

-- Track enrollments in sequences
CREATE TABLE IF NOT EXISTS email_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  current_step INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_email_sent_at TIMESTAMPTZ,
  next_email_due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log of sequence emails sent
CREATE TABLE IF NOT EXISTS email_sequence_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES email_sequence_enrollments(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES email_sequence_steps(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  resend_message_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'sent'
);

-- Retell call tracking
CREATE TABLE IF NOT EXISTS retell_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id VARCHAR(100) NOT NULL UNIQUE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  caller_name VARCHAR(200),
  caller_email VARCHAR(255),
  caller_phone VARCHAR(20),
  duration_ms INTEGER,
  transcript TEXT,
  summary TEXT,
  sentiment VARCHAR(50),
  call_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS retell_call_id VARCHAR(100);

-- Extend applications table for abandonment tracking
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_sequence_enrollments_status ON email_sequence_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_email_sequence_enrollments_next_due ON email_sequence_enrollments(next_email_due_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_email_sequence_logs_enrollment ON email_sequence_logs(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_retell_calls_lead ON retell_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_retell_call ON leads(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_applications_abandonment ON applications(last_activity_at, submitted_at) WHERE submitted_at IS NULL;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_email_sequences_updated_at ON email_sequences;
CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON email_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_email_sequence_enrollments_updated_at ON email_sequence_enrollments;
CREATE TRIGGER update_email_sequence_enrollments_updated_at BEFORE UPDATE ON email_sequence_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default sequences
INSERT INTO email_sequences (name, code, description, trigger_event) VALUES
  ('New Lead Nurture', 'new_lead_nurture', 'Welcome sequence for new website leads', 'new_lead'),
  ('Application Reminder', 'application_reminder', 'Reminder sequence for incomplete applications', 'abandoned_application'),
  ('Accepted Follow-Up', 'accepted_followup', 'Follow-up sequence for accepted applicants', 'accepted')
ON CONFLICT (code) DO NOTHING;

-- Seed sequence steps for new_lead_nurture
INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_code)
SELECT id, 1, 0, 'Thanks for your interest in Mystros Barber Academy!', 'new_lead_welcome'
FROM email_sequences WHERE code = 'new_lead_nurture'
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_code)
SELECT id, 2, 72, 'Still thinking about barber school?', 'new_lead_followup'
FROM email_sequences WHERE code = 'new_lead_nurture'
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_code)
SELECT id, 3, 168, 'Questions? We''re here to help', 'new_lead_final'
FROM email_sequences WHERE code = 'new_lead_nurture'
ON CONFLICT (sequence_id, step_number) DO NOTHING;

-- Seed sequence steps for application_reminder
INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_code)
SELECT id, 1, 0, 'Your application is waiting!', 'application_reminder'
FROM email_sequences WHERE code = 'application_reminder'
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_code)
SELECT id, 2, 72, 'Last chance to complete your application', 'application_final_reminder'
FROM email_sequences WHERE code = 'application_reminder'
ON CONFLICT (sequence_id, step_number) DO NOTHING;

-- Seed sequence steps for accepted_followup
INSERT INTO email_sequence_steps (sequence_id, step_number, delay_hours, subject, template_code)
SELECT id, 1, 24, 'Next steps to finalize your enrollment', 'accepted_enrollment_reminder'
FROM email_sequences WHERE code = 'accepted_followup'
ON CONFLICT (sequence_id, step_number) DO NOTHING;
