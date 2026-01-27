-- ============================================================================
-- MYSTROS BARBER ACADEMY - DEMO USERS
-- Version: 1.0
-- Description: Demo accounts for testing different role access levels
-- ============================================================================

-- NOTE: In production, users are created through Supabase Auth.
-- This seed file creates the user_profiles entries assuming the auth.users
-- already exist (you'll need to create them in Supabase Dashboard or via Auth API)

-- Demo User UUIDs (use these when creating auth.users in Supabase Dashboard)
-- eros@demo.com:       d1000000-0000-0000-0000-000000000001
-- steve@demo.com:      d1000000-0000-0000-0000-000000000002
-- teacher@demo.com:    d1000000-0000-0000-0000-000000000003
-- compliance@demo.com: d1000000-0000-0000-0000-000000000004
-- cashier@demo.com:    d1000000-0000-0000-0000-000000000005
-- student@demo.com:    d1000000-0000-0000-0000-000000000006

-- ============================================================================
-- DEMO USER PROFILES
-- ============================================================================

-- For local development, we can insert directly if using Supabase local
-- In production, these profiles are created when users sign up

INSERT INTO user_profiles (id, email, first_name, last_name, phone, role, is_active)
VALUES
  -- Eros Shaw - Owner/SuperAdmin (both campuses)
  (
    'd1000000-0000-0000-0000-000000000001',
    'eros@chatmanconcierge.com',
    'Eros',
    'Shaw',
    '832-286-4248',
    'superadmin',
    true
  ),

  -- Steve Farrell - Campus Director (Missouri City/South campus only)
  (
    'd1000000-0000-0000-0000-000000000002',
    'steve@demo.com',
    'Steve',
    'Farrell',
    '281-969-7565',
    'campus_admin',
    true
  ),

  -- Demo Teacher
  (
    'd1000000-0000-0000-0000-000000000003',
    'teacher@demo.com',
    'Demo',
    'Teacher',
    '832-555-0003',
    'instructor',
    true
  ),

  -- Compliance Auditor
  (
    'd1000000-0000-0000-0000-000000000004',
    'compliance@demo.com',
    'Demo',
    'Auditor',
    '832-555-0004',
    'auditor',
    true
  ),

  -- Cashier / Financial
  (
    'd1000000-0000-0000-0000-000000000005',
    'cashier@demo.com',
    'Demo',
    'Cashier',
    '832-555-0005',
    'financial_aid',
    true
  ),

  -- Demo Student
  (
    'd1000000-0000-0000-0000-000000000006',
    'student@demo.com',
    'Demo',
    'Student',
    '832-555-0006',
    'student',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;

-- ============================================================================
-- CAMPUS ASSIGNMENTS
-- ============================================================================

-- Eros Shaw - Assigned to BOTH campuses (SuperAdmin)
INSERT INTO user_campus_assignments (user_id, campus_id, is_primary)
VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001', -- North Campus
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000001',
    'c2000000-0000-0000-0000-000000000002', -- Missouri City Campus
    false
  )
ON CONFLICT (user_id, campus_id) DO NOTHING;

-- Steve Farrell - Missouri City Campus ONLY
INSERT INTO user_campus_assignments (user_id, campus_id, is_primary)
VALUES
  (
    'd1000000-0000-0000-0000-000000000002',
    'c2000000-0000-0000-0000-000000000002', -- Missouri City Campus
    true
  )
ON CONFLICT (user_id, campus_id) DO NOTHING;

-- Teacher - North Campus
INSERT INTO user_campus_assignments (user_id, campus_id, is_primary)
VALUES
  (
    'd1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001', -- North Campus
    true
  )
ON CONFLICT (user_id, campus_id) DO NOTHING;

-- Compliance Auditor - Both campuses (read-only access)
INSERT INTO user_campus_assignments (user_id, campus_id, is_primary)
VALUES
  (
    'd1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001', -- North Campus
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'c2000000-0000-0000-0000-000000000002', -- Missouri City Campus
    false
  )
ON CONFLICT (user_id, campus_id) DO NOTHING;

-- Cashier - North Campus
INSERT INTO user_campus_assignments (user_id, campus_id, is_primary)
VALUES
  (
    'd1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000001', -- North Campus
    true
  )
ON CONFLICT (user_id, campus_id) DO NOTHING;

-- Student - North Campus
INSERT INTO user_campus_assignments (user_id, campus_id, is_primary)
VALUES
  (
    'd1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000001', -- North Campus
    true
  )
ON CONFLICT (user_id, campus_id) DO NOTHING;

-- ============================================================================
-- DEMO STUDENT RECORD
-- ============================================================================

-- Create a student record for the demo student
INSERT INTO students (
  id,
  user_id,
  student_number,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  campus_id,
  program_id,
  status,
  enrollment_date,
  start_date,
  expected_graduation_date,
  total_hours_scheduled,
  total_hours_completed,
  theory_hours_completed,
  practical_hours_completed,
  current_sap_status
)
VALUES
  (
    '51000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000006', -- Demo Student user
    'STU-2025-0001',
    'Demo',
    'Student',
    'student@demo.com',
    '832-555-0006',
    '2000-01-15',
    'c1000000-0000-0000-0000-000000000001', -- North Campus
    'a1000000-0000-0000-0000-000000000001', -- Class A Barber
    'active',
    '2025-01-06',
    '2025-01-13',
    '2025-07-15',
    1000,
    342.5,
    102.5,
    240.0,
    'satisfactory'
  )
ON CONFLICT (id) DO NOTHING;

-- Create student account for financials
INSERT INTO student_accounts (id, student_id, total_charges, total_payments, total_aid_posted, current_balance)
VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    '51000000-0000-0000-0000-000000000001',
    16800.00,
    5000.00,
    9350.00,
    2450.00
  )
ON CONFLICT (id) DO NOTHING;

-- Add some sample attendance records
INSERT INTO attendance_records (student_id, campus_id, attendance_date, clock_in_time, clock_out_time, scheduled_hours, actual_hours, theory_hours, practical_hours, status)
VALUES
  ('51000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day', (CURRENT_DATE - INTERVAL '1 day')::date + TIME '09:00', (CURRENT_DATE - INTERVAL '1 day')::date + TIME '17:00', 8.0, 8.0, 2.0, 6.0, 'present'),
  ('51000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', (CURRENT_DATE - INTERVAL '2 days')::date + TIME '09:00', (CURRENT_DATE - INTERVAL '2 days')::date + TIME '17:00', 8.0, 8.0, 2.5, 5.5, 'present'),
  ('51000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days', (CURRENT_DATE - INTERVAL '3 days')::date + TIME '09:00', (CURRENT_DATE - INTERVAL '3 days')::date + TIME '17:00', 8.0, 8.0, 2.0, 6.0, 'present'),
  ('51000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '4 days', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '09:15', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '16:45', 8.0, 7.5, 2.0, 5.5, 'present')
ON CONFLICT DO NOTHING;

-- Add financial aid record
INSERT INTO financial_aid_records (
  id,
  student_id,
  academic_year,
  fafsa_submitted,
  fafsa_submitted_date,
  isir_received,
  isir_received_date,
  verification_required,
  verification_status,
  status
)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    '51000000-0000-0000-0000-000000000001',
    '2024-2025',
    true,
    '2025-01-05',
    true,
    '2025-01-08',
    false,
    NULL,
    'packaged'
  )
ON CONFLICT (id) DO NOTHING;

-- Add financial aid awards
INSERT INTO financial_aid_awards (id, financial_aid_record_id, award_type, award_name, fund_source, offered_amount, accepted_amount, status)
VALUES
  ('fa100000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'pell_grant', 'Federal Pell Grant', 'federal', 7395.00, 7395.00, 'accepted'),
  ('fa200000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'direct_sub', 'Direct Subsidized Loan', 'federal', 3500.00, 1955.00, 'accepted')
ON CONFLICT (id) DO NOTHING;
