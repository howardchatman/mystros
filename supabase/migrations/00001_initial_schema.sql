-- ============================================================================
-- MYSTROS BARBER ACADEMY - DATABASE SCHEMA
-- Version: 1.0
-- Description: Complete schema for student onboarding, financial aid, and compliance
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM (
  'superadmin',
  'campus_admin',
  'admissions',
  'financial_aid',
  'instructor',
  'registrar',
  'student',
  'auditor'
);

-- Student lifecycle stages
CREATE TYPE student_status AS ENUM (
  'lead',
  'applicant',
  'accepted',
  'enrolled',
  'active',
  'graduated',
  'withdrawn',
  'loa',          -- Leave of Absence
  'lost',         -- Lead lost
  'denied',       -- Application denied
  'declined',     -- Offer declined
  'no_show'       -- Never started
);

-- Document status
CREATE TYPE document_status AS ENUM (
  'pending',
  'uploaded',
  'under_review',
  'approved',
  'rejected',
  'expired'
);

-- E-signature status
CREATE TYPE signature_status AS ENUM (
  'pending',
  'sent',
  'viewed',
  'signed',
  'declined',
  'voided'
);

-- Financial aid status
CREATE TYPE aid_status AS ENUM (
  'not_started',
  'fafsa_submitted',
  'isir_received',
  'verification_required',
  'verification_complete',
  'packaged',
  'accepted',
  'declined'
);

-- Disbursement status
CREATE TYPE disbursement_status AS ENUM (
  'scheduled',
  'pending_release',
  'released',
  'posted',
  'cancelled',
  'returned'
);

-- SAP status
CREATE TYPE sap_status AS ENUM (
  'satisfactory',
  'warning',
  'probation',
  'suspension',
  'appeal_pending',
  'appeal_approved',
  'appeal_denied'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

-- Attendance status
CREATE TYPE attendance_status AS ENUM (
  'present',
  'absent',
  'tardy',
  'excused',
  'pending_approval'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Campuses
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL DEFAULT 'TX',
  zip VARCHAR(10) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  total_hours INTEGER NOT NULL,  -- Required clock hours
  theory_hours INTEGER NOT NULL,
  practical_hours INTEGER NOT NULL,
  tuition_amount DECIMAL(10, 2) NOT NULL,
  books_supplies_amount DECIMAL(10, 2) DEFAULT 0,
  registration_fee DECIMAL(10, 2) DEFAULT 0,
  duration_weeks INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Program schedules (full-time, part-time options)
CREATE TABLE program_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,  -- e.g., "Full-Time Day", "Part-Time Evening"
  hours_per_week DECIMAL(4, 1) NOT NULL,
  days_per_week INTEGER NOT NULL,
  start_time TIME,
  end_time TIME,
  expected_weeks INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER & AUTH TABLES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User campus assignments (staff can be assigned to one or both campuses)
CREATE TABLE user_campus_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES user_profiles(id),
  UNIQUE(user_id, campus_id)
);

-- ============================================================================
-- LEADS & ADMISSIONS
-- ============================================================================

-- Leads (prospective students)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),

  -- Interest
  campus_id UUID REFERENCES campuses(id),
  program_id UUID REFERENCES programs(id),
  preferred_schedule_id UUID REFERENCES program_schedules(id),
  preferred_start_date DATE,

  -- Source tracking
  source VARCHAR(100),  -- website, referral, walk-in, event, etc.
  source_detail TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Status
  status student_status DEFAULT 'lead',
  assigned_to UUID REFERENCES user_profiles(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,  -- When converted to applicant
  lost_at TIMESTAMPTZ,
  lost_reason TEXT
);

-- Lead activity log
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,  -- call, email, tour, note, status_change
  description TEXT,
  performed_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES user_profiles(id),  -- Linked after account creation

  -- Personal info
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  date_of_birth DATE NOT NULL,
  ssn_encrypted BYTEA,  -- Encrypted SSN
  gender VARCHAR(20),

  -- Contact
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  zip VARCHAR(10) NOT NULL,

  -- Emergency contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),

  -- Education
  high_school_name VARCHAR(255),
  high_school_city VARCHAR(100),
  high_school_state VARCHAR(2),
  graduation_year INTEGER,
  ged_completion_date DATE,
  highest_education VARCHAR(50),

  -- Program selection
  campus_id UUID NOT NULL REFERENCES campuses(id),
  program_id UUID NOT NULL REFERENCES programs(id),
  schedule_id UUID REFERENCES program_schedules(id),
  desired_start_date DATE,

  -- Background
  has_felony_conviction BOOLEAN,
  felony_explanation TEXT,
  previous_barber_training BOOLEAN,
  previous_training_details TEXT,

  -- Status
  status student_status DEFAULT 'applicant',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES user_profiles(id),
  decision_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS & E-SIGNATURES
-- ============================================================================

-- Document types configuration
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,  -- identification, education, enrollment, financial_aid, etc.
  is_required BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  retention_years INTEGER DEFAULT 5,
  file_types_allowed TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png'],
  max_file_size_mb INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL,  -- References students table
  application_id UUID REFERENCES applications(id),
  document_type_id UUID NOT NULL REFERENCES document_types(id),

  -- File info
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,  -- Supabase Storage path
  file_size INTEGER,
  file_hash VARCHAR(64),  -- SHA-256 for integrity
  mime_type VARCHAR(100),

  -- Status
  status document_status DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES user_profiles(id),
  rejection_reason TEXT,

  -- Version tracking
  version INTEGER DEFAULT 1,
  replaces_document_id UUID REFERENCES documents(id),

  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES user_profiles(id),
  upload_ip VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- E-signature envelopes
CREATE TABLE signature_envelopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL,
  application_id UUID REFERENCES applications(id),

  -- Document
  document_type_id UUID REFERENCES document_types(id),
  document_name VARCHAR(255) NOT NULL,
  template_id VARCHAR(100),  -- DocuSign template or internal template ID

  -- Status
  status signature_status DEFAULT 'pending',
  external_envelope_id VARCHAR(100),  -- DocuSign envelope ID

  -- Timestamps
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E-signature records (for audit)
CREATE TABLE signature_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  envelope_id UUID NOT NULL REFERENCES signature_envelopes(id) ON DELETE CASCADE,

  -- Signer info
  signer_id UUID NOT NULL REFERENCES user_profiles(id),
  signer_name VARCHAR(200) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,

  -- Signature data (for native e-sign)
  typed_signature VARCHAR(255),
  signature_image_path TEXT,  -- Base64 or storage path for drawn signature

  -- Verification
  ip_address VARCHAR(45),
  user_agent TEXT,
  signed_at TIMESTAMPTZ NOT NULL,

  -- Hash of signed document
  document_hash VARCHAR(64),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDENT RECORDS
-- ============================================================================

-- Students (enrolled/active students)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  application_id UUID REFERENCES applications(id),

  -- Student info (denormalized for convenience)
  student_number VARCHAR(20) UNIQUE,  -- Generated student ID
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  ssn_encrypted BYTEA,

  -- Enrollment
  campus_id UUID NOT NULL REFERENCES campuses(id),
  program_id UUID NOT NULL REFERENCES programs(id),
  schedule_id UUID REFERENCES program_schedules(id),

  -- Status
  status student_status DEFAULT 'enrolled',

  -- Dates
  enrollment_date DATE,
  start_date DATE,
  expected_graduation_date DATE,
  actual_graduation_date DATE,
  withdrawal_date DATE,
  last_date_of_attendance DATE,

  -- Academic tracking
  total_hours_scheduled DECIMAL(7, 2) DEFAULT 0,
  total_hours_completed DECIMAL(7, 2) DEFAULT 0,
  theory_hours_completed DECIMAL(7, 2) DEFAULT 0,
  practical_hours_completed DECIMAL(7, 2) DEFAULT 0,

  -- Flags
  is_transfer_student BOOLEAN DEFAULT false,
  transfer_hours_accepted DECIMAL(7, 2) DEFAULT 0,

  -- SAP
  current_sap_status sap_status DEFAULT 'satisfactory',
  last_sap_evaluation_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ATTENDANCE & CLOCK HOURS
-- ============================================================================

-- Daily attendance records
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id),

  -- Date/Time
  attendance_date DATE NOT NULL,
  clock_in_time TIMESTAMPTZ,
  clock_out_time TIMESTAMPTZ,

  -- Hours
  scheduled_hours DECIMAL(4, 2),
  actual_hours DECIMAL(4, 2),
  theory_hours DECIMAL(4, 2) DEFAULT 0,
  practical_hours DECIMAL(4, 2) DEFAULT 0,

  -- Status
  status attendance_status DEFAULT 'present',

  -- Approvals
  recorded_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  -- Corrections
  is_correction BOOLEAN DEFAULT false,
  original_record_id UUID REFERENCES attendance_records(id),
  correction_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, attendance_date, is_correction)
);

-- Attendance correction requests
CREATE TABLE attendance_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_record_id UUID NOT NULL REFERENCES attendance_records(id),
  student_id UUID NOT NULL REFERENCES students(id),

  -- Request
  requested_by UUID NOT NULL REFERENCES user_profiles(id),
  request_reason TEXT NOT NULL,
  requested_clock_in TIMESTAMPTZ,
  requested_clock_out TIMESTAMPTZ,
  requested_status attendance_status,

  -- Approval
  status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, denied
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL AID
-- ============================================================================

-- Financial aid applications (per student)
CREATE TABLE financial_aid_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year VARCHAR(9) NOT NULL,  -- e.g., "2025-2026"

  -- FAFSA
  fafsa_submitted BOOLEAN DEFAULT false,
  fafsa_submitted_date DATE,
  transaction_number VARCHAR(20),
  efc INTEGER,  -- Expected Family Contribution

  -- ISIR
  isir_received BOOLEAN DEFAULT false,
  isir_received_date DATE,
  isir_comment_codes TEXT[],

  -- Verification
  verification_required BOOLEAN DEFAULT false,
  verification_tracking_group VARCHAR(5),
  verification_status VARCHAR(50),
  verification_completed_date DATE,

  -- Status
  status aid_status DEFAULT 'not_started',

  -- Dependency
  dependency_status VARCHAR(20),  -- dependent, independent

  -- Packaging
  packaged_by UUID REFERENCES user_profiles(id),
  packaged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, academic_year)
);

-- Financial aid awards
CREATE TABLE financial_aid_awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financial_aid_record_id UUID NOT NULL REFERENCES financial_aid_records(id) ON DELETE CASCADE,

  -- Award details
  award_type VARCHAR(50) NOT NULL,  -- pell_grant, direct_sub, direct_unsub, etc.
  award_name VARCHAR(255) NOT NULL,
  fund_source VARCHAR(50),  -- federal, state, institutional, private

  -- Amounts
  offered_amount DECIMAL(10, 2) NOT NULL,
  accepted_amount DECIMAL(10, 2),
  declined_amount DECIMAL(10, 2) DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'offered',  -- offered, accepted, declined, cancelled

  -- Dates
  offered_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disbursements
CREATE TABLE disbursements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financial_aid_award_id UUID NOT NULL REFERENCES financial_aid_awards(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),

  -- Disbursement details
  disbursement_number INTEGER NOT NULL,  -- 1st, 2nd, etc.
  scheduled_date DATE NOT NULL,
  scheduled_amount DECIMAL(10, 2) NOT NULL,

  -- Actual disbursement
  actual_date DATE,
  actual_amount DECIMAL(10, 2),

  -- Status
  status disbursement_status DEFAULT 'scheduled',

  -- Holds
  hold_reason TEXT,
  hold_placed_by UUID REFERENCES user_profiles(id),
  hold_placed_at TIMESTAMPTZ,

  -- Release
  released_by UUID REFERENCES user_profiles(id),
  released_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAP evaluations
CREATE TABLE sap_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Evaluation period
  evaluation_date DATE NOT NULL,
  evaluation_point VARCHAR(50),  -- payment_period_end, academic_year_end, etc.

  -- Metrics at time of evaluation
  hours_attempted DECIMAL(7, 2) NOT NULL,
  hours_completed DECIMAL(7, 2) NOT NULL,
  completion_rate DECIMAL(5, 2) NOT NULL,  -- Percentage
  cumulative_gpa DECIMAL(3, 2),

  -- Max timeframe check
  max_timeframe_hours DECIMAL(7, 2),
  is_within_max_timeframe BOOLEAN,

  -- Status
  status sap_status NOT NULL,
  previous_status sap_status,

  -- Override/Appeal
  is_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  override_by UUID REFERENCES user_profiles(id),

  -- Appeal
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_date DATE,
  appeal_decision sap_status,
  appeal_decided_by UUID REFERENCES user_profiles(id),
  appeal_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FINANCIALS / TUITION
-- ============================================================================

-- Student accounts (ledger header)
CREATE TABLE student_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,

  -- Balances (computed, but cached for performance)
  total_charges DECIMAL(10, 2) DEFAULT 0,
  total_payments DECIMAL(10, 2) DEFAULT 0,
  total_aid_posted DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,

  -- Payment plan
  has_payment_plan BOOLEAN DEFAULT false,
  payment_plan_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charges (tuition, fees, etc.)
CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_account_id UUID NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),

  -- Charge details
  charge_type VARCHAR(50) NOT NULL,  -- tuition, registration_fee, books, supplies, etc.
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  charge_date DATE NOT NULL,
  due_date DATE,

  -- Period
  period_start DATE,
  period_end DATE,

  -- Status
  is_voided BOOLEAN DEFAULT false,
  voided_reason TEXT,
  voided_by UUID REFERENCES user_profiles(id),
  voided_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_account_id UUID NOT NULL REFERENCES student_accounts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id),

  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,  -- cash, check, card, financial_aid, scholarship
  payment_date DATE NOT NULL,

  -- External references
  stripe_payment_id VARCHAR(100),
  check_number VARCHAR(50),
  reference_number VARCHAR(100),

  -- Financial aid link
  disbursement_id UUID REFERENCES disbursements(id),

  -- Status
  status payment_status DEFAULT 'completed',

  -- Refund tracking
  is_refund BOOLEAN DEFAULT false,
  refund_reason TEXT,
  original_payment_id UUID REFERENCES payments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Payment plans
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  student_account_id UUID NOT NULL REFERENCES student_accounts(id),

  -- Plan details
  total_amount DECIMAL(10, 2) NOT NULL,
  down_payment DECIMAL(10, 2) DEFAULT 0,
  number_of_payments INTEGER NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_frequency VARCHAR(20) DEFAULT 'monthly',  -- weekly, bi-weekly, monthly

  -- Dates
  start_date DATE NOT NULL,
  first_payment_date DATE NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- active, completed, defaulted, cancelled

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Payment plan installments
CREATE TABLE payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,

  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount_due DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, paid, partial, late, waived

  -- Linked payment
  payment_id UUID REFERENCES payments(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- R2T4 / WITHDRAWAL
-- ============================================================================

-- Withdrawal records
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),

  -- Withdrawal info
  withdrawal_date DATE NOT NULL,
  last_date_of_attendance DATE NOT NULL,
  determination_date DATE NOT NULL,

  -- Reason
  withdrawal_type VARCHAR(50) NOT NULL,  -- official, unofficial, administrative
  reason TEXT,

  -- R2T4 calculation
  r2t4_required BOOLEAN DEFAULT false,

  -- Title IV aid info at withdrawal
  title_iv_disbursed DECIMAL(10, 2),
  title_iv_could_disburse DECIMAL(10, 2),

  -- Calculation results
  percentage_completed DECIMAL(5, 4),
  title_iv_earned DECIMAL(10, 2),
  title_iv_unearned DECIMAL(10, 2),
  school_return_amount DECIMAL(10, 2),
  student_return_amount DECIMAL(10, 2),

  -- Post-withdrawal disbursement
  pwd_amount DECIMAL(10, 2),
  pwd_offered_date DATE,
  pwd_response_deadline DATE,
  pwd_accepted BOOLEAN,
  pwd_disbursed_date DATE,

  -- Calculation document
  calculation_document_id UUID REFERENCES documents(id),

  -- Approvals
  calculated_by UUID REFERENCES user_profiles(id),
  calculated_at TIMESTAMPTZ,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, calculated, approved, completed

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- R2T4 return schedule
CREATE TABLE r2t4_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  withdrawal_id UUID NOT NULL REFERENCES withdrawals(id) ON DELETE CASCADE,

  fund_type VARCHAR(50) NOT NULL,  -- direct_unsub, direct_sub, pell, etc.
  return_amount DECIMAL(10, 2) NOT NULL,
  return_order INTEGER NOT NULL,

  -- Return tracking
  return_date DATE,
  confirmation_number VARCHAR(100),

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, returned, confirmed

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE & AUDIT
-- ============================================================================

-- Immutable audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What changed
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,  -- INSERT, UPDATE, DELETE

  -- Who
  user_id UUID REFERENCES user_profiles(id),
  user_email VARCHAR(255),
  user_role user_role,

  -- Context
  campus_id UUID REFERENCES campuses(id),
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Data
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],

  -- Timestamp (immutable)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Make audit log immutable
ALTER TABLE audit_log SET (autovacuum_enabled = false);
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- Compliance checklist items (per student)
CREATE TABLE compliance_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Item definition
  item_code VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,  -- enrollment, financial_aid, academics, documents

  -- Status
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES user_profiles(id),

  -- Evidence
  document_id UUID REFERENCES documents(id),
  notes TEXT,

  -- Due date (if applicable)
  due_date DATE,
  is_overdue BOOLEAN GENERATED ALWAYS AS (
    due_date IS NOT NULL AND due_date < CURRENT_DATE AND NOT is_complete
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, item_code)
);

-- Session log (for security audit)
CREATE TABLE session_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  session_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,

  action VARCHAR(50) NOT NULL,  -- login, logout, session_refresh, failed_login

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS & TASKS
-- ============================================================================

-- Task queue (for staff follow-ups)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Task info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent

  -- Related records
  student_id UUID REFERENCES students(id),
  application_id UUID REFERENCES applications(id),
  lead_id UUID REFERENCES leads(id),

  -- Assignment
  campus_id UUID REFERENCES campuses(id),
  assigned_to UUID REFERENCES user_profiles(id),
  assigned_by UUID REFERENCES user_profiles(id),

  -- Dates
  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, in_progress, completed, cancelled

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  channel VARCHAR(20) NOT NULL,  -- email, sms, in_app

  subject VARCHAR(255),
  body TEXT NOT NULL,

  -- Variables available (for documentation)
  available_variables TEXT[],

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification log
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  template_id UUID REFERENCES notification_templates(id),
  recipient_id UUID REFERENCES user_profiles(id),

  channel VARCHAR(20) NOT NULL,
  recipient_address VARCHAR(255) NOT NULL,  -- email or phone

  subject VARCHAR(255),
  body TEXT NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, delivered, failed, bounced
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,

  -- External IDs
  external_id VARCHAR(100),  -- SendGrid message ID, Twilio SID, etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User profiles
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Campus assignments
CREATE INDEX idx_user_campus_assignments_user ON user_campus_assignments(user_id);
CREATE INDEX idx_user_campus_assignments_campus ON user_campus_assignments(campus_id);

-- Leads
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_campus ON leads(campus_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- Applications
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_campus ON applications(campus_id);
CREATE INDEX idx_applications_user ON applications(user_id);

-- Students
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_campus ON students(campus_id);
CREATE INDEX idx_students_program ON students(program_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_students_number ON students(student_number);

-- Attendance
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_campus_date ON attendance_records(campus_id, attendance_date);

-- Financial aid
CREATE INDEX idx_fa_records_student ON financial_aid_records(student_id);
CREATE INDEX idx_fa_awards_record ON financial_aid_awards(financial_aid_record_id);
CREATE INDEX idx_disbursements_student ON disbursements(student_id);
CREATE INDEX idx_disbursements_status ON disbursements(status);

-- Financials
CREATE INDEX idx_charges_account ON charges(student_account_id);
CREATE INDEX idx_payments_account ON payments(student_account_id);

-- Audit log
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- Documents
CREATE INDEX idx_documents_student ON documents(student_id);
CREATE INDEX idx_documents_type ON documents(document_type_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Tasks
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);

-- Compliance
CREATE INDEX idx_compliance_student ON compliance_checklist_items(student_id);
CREATE INDEX idx_compliance_incomplete ON compliance_checklist_items(student_id) WHERE NOT is_complete;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_campuses_updated_at BEFORE UPDATE ON campuses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_signature_envelopes_updated_at BEFORE UPDATE ON signature_envelopes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_financial_aid_records_updated_at BEFORE UPDATE ON financial_aid_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_financial_aid_awards_updated_at BEFORE UPDATE ON financial_aid_awards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_disbursements_updated_at BEFORE UPDATE ON disbursements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_student_accounts_updated_at BEFORE UPDATE ON student_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payment_plan_installments_updated_at BEFORE UPDATE ON payment_plan_installments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_compliance_checklist_items_updated_at BEFORE UPDATE ON compliance_checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
