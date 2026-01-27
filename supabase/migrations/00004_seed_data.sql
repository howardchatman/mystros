-- ============================================================================
-- MYSTROS BARBER ACADEMY - SEED DATA
-- Version: 1.0
-- Description: Initial data for campuses, programs, document types, etc.
-- ============================================================================

-- ============================================================================
-- CAMPUSES
-- ============================================================================

INSERT INTO campuses (id, name, code, address_line1, city, state, zip, phone, email, is_active)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'North Campus',
    'NORTH',
    '1434 FM 1960 Suite B',
    'Houston',
    'TX',
    '77090',
    '832-286-4248',
    'INFOMYSTROSBARBERACADEMY@GMAIL.COM',
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Missouri City Campus',
    'MOCITY',
    '2420 Cartwright Rd',
    'Missouri City',
    'TX',
    '77489',
    '281-969-7565',
    'INFOMYSTROSBARBERACADEMY@GMAIL.COM',
    true
  );

-- ============================================================================
-- PROGRAMS
-- ============================================================================

INSERT INTO programs (id, name, code, description, total_hours, theory_hours, practical_hours, tuition_amount, books_supplies_amount, registration_fee, duration_weeks, is_active)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'Class A Barber',
    'BARBER-1000',
    'Comprehensive 1000-hour program preparing students for the Texas Class A Barber license. Covers cutting techniques, shaving, facial hair design, sanitation, and business skills.',
    1000,
    300,
    700,
    15500.00,
    1200.00,
    100.00,
    25,
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000002',
    'Cosmetology Operator to Class A Barber Crossover',
    'CROSSOVER-300',
    'Accelerated 300-hour program for licensed cosmetologists seeking their Class A Barber license. Focuses on barber-specific techniques including clipper work and straight razor shaving.',
    300,
    90,
    210,
    4650.00,
    600.00,
    100.00,
    8,
    true
  );

-- ============================================================================
-- PROGRAM SCHEDULES
-- ============================================================================

INSERT INTO program_schedules (id, program_id, name, hours_per_week, days_per_week, start_time, end_time, expected_weeks, is_active)
VALUES
  -- Class A Barber schedules
  (
    's1000000-0000-0000-0000-000000000001',
    'p1000000-0000-0000-0000-000000000001',
    'Full-Time Day',
    40,
    5,
    '09:00',
    '17:00',
    25,
    true
  ),
  (
    's1000000-0000-0000-0000-000000000002',
    'p1000000-0000-0000-0000-000000000001',
    'Part-Time Evening',
    20,
    5,
    '17:30',
    '21:30',
    50,
    true
  ),
  -- Crossover schedules
  (
    's1000000-0000-0000-0000-000000000003',
    'p1000000-0000-0000-0000-000000000002',
    'Full-Time Day',
    40,
    5,
    '09:00',
    '17:00',
    8,
    true
  ),
  (
    's1000000-0000-0000-0000-000000000004',
    'p1000000-0000-0000-0000-000000000002',
    'Part-Time Evening',
    20,
    5,
    '17:30',
    '21:30',
    15,
    true
  );

-- ============================================================================
-- DOCUMENT TYPES
-- ============================================================================

INSERT INTO document_types (id, name, code, description, category, is_required, requires_signature, retention_years, file_types_allowed, max_file_size_mb, sort_order, is_active)
VALUES
  -- Enrollment Documents
  (
    'd1000000-0000-0000-0000-000000000001',
    'Government-Issued Photo ID',
    'ENR-001',
    'Valid driver''s license, passport, or state ID',
    'enrollment',
    true,
    false,
    7,
    ARRAY['pdf', 'jpg', 'jpeg', 'png'],
    10,
    1,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'High School Diploma or GED',
    'ENR-002',
    'Official diploma or GED certificate',
    'enrollment',
    true,
    false,
    7,
    ARRAY['pdf', 'jpg', 'jpeg', 'png'],
    10,
    2,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'Social Security Card',
    'ENR-003',
    'Original or official copy of Social Security card',
    'enrollment',
    true,
    false,
    7,
    ARRAY['pdf', 'jpg', 'jpeg', 'png'],
    10,
    3,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'Birth Certificate',
    'ENR-004',
    'May be required for age verification',
    'enrollment',
    false,
    false,
    7,
    ARRAY['pdf', 'jpg', 'jpeg', 'png'],
    10,
    4,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000005',
    'Proof of Texas Residency',
    'ENR-005',
    'Utility bill, lease, or other proof of residence',
    'enrollment',
    false,
    false,
    7,
    ARRAY['pdf', 'jpg', 'jpeg', 'png'],
    10,
    5,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000006',
    'Texas Cosmetology License',
    'ENR-006',
    'Required for Crossover program only',
    'enrollment',
    false,
    false,
    7,
    ARRAY['pdf', 'jpg', 'jpeg', 'png'],
    10,
    6,
    true
  ),

  -- Enrollment Agreements
  (
    'd1000000-0000-0000-0000-000000000010',
    'Enrollment Agreement',
    'AGR-001',
    'Main enrollment contract',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    10,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000011',
    'Student Handbook Acknowledgment',
    'AGR-002',
    'Confirms receipt and understanding of student handbook',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    11,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000012',
    'FERPA Release Authorization',
    'AGR-003',
    'Privacy consent for education records',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    12,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000013',
    'Photo/Media Release',
    'AGR-004',
    'Consent for use of photos/video in marketing',
    'agreement',
    false,
    true,
    7,
    ARRAY['pdf'],
    10,
    13,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000014',
    'Drug-Free Campus Policy',
    'AGR-005',
    'Acknowledgment of drug-free campus policy',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    14,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000015',
    'SAP Policy Acknowledgment',
    'AGR-006',
    'Acknowledgment of Satisfactory Academic Progress policy',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    15,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000016',
    'Refund Policy Acknowledgment',
    'AGR-007',
    'Acknowledgment of refund policy terms',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    16,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000017',
    'Attendance Policy Acknowledgment',
    'AGR-008',
    'Acknowledgment of attendance requirements',
    'agreement',
    true,
    true,
    7,
    ARRAY['pdf'],
    10,
    17,
    true
  ),

  -- Financial Aid Documents
  (
    'd1000000-0000-0000-0000-000000000020',
    'Verification Worksheet',
    'FA-001',
    'Verification documents for financial aid',
    'financial_aid',
    false,
    false,
    7,
    ARRAY['pdf'],
    10,
    20,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000021',
    'Tax Return Transcript',
    'FA-002',
    'IRS tax return transcript for verification',
    'financial_aid',
    false,
    false,
    7,
    ARRAY['pdf'],
    10,
    21,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000022',
    'Award Letter',
    'FA-003',
    'Financial aid award acceptance',
    'financial_aid',
    false,
    true,
    7,
    ARRAY['pdf'],
    10,
    22,
    true
  ),

  -- Academic Documents
  (
    'd1000000-0000-0000-0000-000000000030',
    'SAP Appeal',
    'ACA-001',
    'Satisfactory Academic Progress appeal documentation',
    'academic',
    false,
    true,
    7,
    ARRAY['pdf'],
    10,
    30,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000031',
    'Leave of Absence Request',
    'ACA-002',
    'Request for approved leave of absence',
    'academic',
    false,
    true,
    7,
    ARRAY['pdf'],
    10,
    31,
    true
  ),

  -- Withdrawal Documents
  (
    'd1000000-0000-0000-0000-000000000040',
    'Withdrawal Form',
    'WD-001',
    'Official withdrawal request',
    'withdrawal',
    false,
    true,
    7,
    ARRAY['pdf'],
    10,
    40,
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000041',
    'R2T4 Calculation',
    'WD-002',
    'Return of Title IV funds calculation worksheet',
    'withdrawal',
    false,
    false,
    7,
    ARRAY['pdf', 'xlsx'],
    10,
    41,
    true
  );

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

INSERT INTO notification_templates (id, name, code, channel, subject, body, available_variables, is_active)
VALUES
  (
    'n1000000-0000-0000-0000-000000000001',
    'Welcome Email',
    'WELCOME',
    'email',
    'Welcome to Mystros Barber Academy!',
    'Dear {{first_name}},

Welcome to Mystros Barber Academy! We''re excited to have you join our community.

Your student portal account has been created. You can log in at {{portal_url}} to:
- Complete your enrollment documents
- Track your application status
- View your schedule and attendance

If you have any questions, please contact us at {{campus_phone}} or {{campus_email}}.

Best regards,
Mystros Barber Academy Team',
    ARRAY['first_name', 'portal_url', 'campus_phone', 'campus_email'],
    true
  ),
  (
    'n1000000-0000-0000-0000-000000000002',
    'Document Reminder',
    'DOC_REMINDER',
    'email',
    'Action Required: Missing Documents',
    'Dear {{first_name}},

Our records show the following documents are still needed to complete your enrollment:

{{document_list}}

Please upload these documents through your student portal at {{portal_url}} or bring them to campus.

Questions? Contact us at {{campus_phone}}.

Best regards,
Mystros Barber Academy Admissions',
    ARRAY['first_name', 'document_list', 'portal_url', 'campus_phone'],
    true
  ),
  (
    'n1000000-0000-0000-0000-000000000003',
    'Application Status Update',
    'APP_STATUS',
    'email',
    'Application Status Update - Mystros Barber Academy',
    'Dear {{first_name}},

Your application status has been updated to: {{status}}

{{status_message}}

Log in to your portal at {{portal_url}} for more details.

Best regards,
Mystros Barber Academy Admissions',
    ARRAY['first_name', 'status', 'status_message', 'portal_url'],
    true
  ),
  (
    'n1000000-0000-0000-0000-000000000004',
    'Payment Reminder',
    'PAYMENT_REMINDER',
    'email',
    'Payment Reminder - Mystros Barber Academy',
    'Dear {{first_name}},

This is a friendly reminder that your payment of ${{amount}} is due on {{due_date}}.

Current balance: ${{balance}}

You can make a payment online at {{portal_url}} or in person at your campus.

Questions about your account? Contact us at {{campus_phone}}.

Best regards,
Mystros Barber Academy Business Office',
    ARRAY['first_name', 'amount', 'due_date', 'balance', 'portal_url', 'campus_phone'],
    true
  ),
  (
    'n1000000-0000-0000-0000-000000000005',
    'Tour Confirmation',
    'TOUR_CONFIRM',
    'email',
    'Campus Tour Confirmation - Mystros Barber Academy',
    'Dear {{first_name}},

Your campus tour has been scheduled!

Date: {{tour_date}}
Time: {{tour_time}}
Campus: {{campus_name}}
Address: {{campus_address}}

What to bring:
- Valid photo ID
- Questions about our programs

We look forward to meeting you!

Best regards,
Mystros Barber Academy Admissions',
    ARRAY['first_name', 'tour_date', 'tour_time', 'campus_name', 'campus_address'],
    true
  ),
  (
    'n1000000-0000-0000-0000-000000000006',
    'SMS Tour Reminder',
    'TOUR_REMINDER_SMS',
    'sms',
    NULL,
    'Mystros Barber Academy: Reminder - Your campus tour is tomorrow at {{tour_time}}. See you at {{campus_name}}! Questions? Call {{campus_phone}}',
    ARRAY['tour_time', 'campus_name', 'campus_phone'],
    true
  ),
  (
    'n1000000-0000-0000-0000-000000000007',
    'Financial Aid Status',
    'FA_STATUS',
    'email',
    'Financial Aid Update - Mystros Barber Academy',
    'Dear {{first_name}},

Your financial aid status has been updated:

Status: {{fa_status}}
{{status_details}}

If action is required, please log in to your portal at {{portal_url}}.

Questions? Contact our Financial Aid office at {{campus_phone}}.

Best regards,
Mystros Barber Academy Financial Aid Office',
    ARRAY['first_name', 'fa_status', 'status_details', 'portal_url', 'campus_phone'],
    true
  );

-- ============================================================================
-- COMPLIANCE ITEM DEFINITIONS (for reference - actual items created per student)
-- ============================================================================

-- Note: This is a reference table for the compliance checklist module
-- Actual compliance items are created in compliance_checklist_items per student

CREATE TABLE IF NOT EXISTS compliance_item_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  required_for_programs TEXT[],
  required_for_fa_recipients BOOLEAN DEFAULT false,
  required_for_loan_recipients BOOLEAN DEFAULT false,
  evidence_type VARCHAR(50),
  document_type_id UUID REFERENCES document_types(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO compliance_item_definitions (code, name, category, description, is_required, required_for_programs, required_for_fa_recipients, required_for_loan_recipients, evidence_type, sort_order)
VALUES
  -- Enrollment Documents
  ('ENR-001', 'Government-Issued Photo ID', 'enrollment', 'Valid driver''s license, passport, or state ID', true, NULL, false, false, 'document', 1),
  ('ENR-002', 'High School Diploma or GED', 'enrollment', 'Official diploma or GED certificate', true, NULL, false, false, 'document', 2),
  ('ENR-003', 'Social Security Card', 'enrollment', 'Original or official copy', true, NULL, false, false, 'document', 3),
  ('ENR-006', 'Cosmetology License', 'enrollment', 'Required for crossover program', true, ARRAY['CROSSOVER-300'], false, false, 'document', 6),

  -- Agreements
  ('AGR-001', 'Enrollment Agreement', 'enrollment', 'Main enrollment contract', true, NULL, false, false, 'esign', 10),
  ('AGR-002', 'Student Handbook Acknowledgment', 'enrollment', 'Confirms receipt of handbook', true, NULL, false, false, 'esign', 11),
  ('AGR-003', 'FERPA Release Authorization', 'enrollment', 'Privacy consent', true, NULL, false, false, 'esign', 12),
  ('AGR-005', 'Drug-Free Campus Policy', 'enrollment', 'Policy acknowledgment', true, NULL, false, false, 'esign', 14),
  ('AGR-006', 'SAP Policy Acknowledgment', 'enrollment', 'SAP policy acknowledgment', true, NULL, false, false, 'esign', 15),
  ('AGR-007', 'Refund Policy Acknowledgment', 'enrollment', 'Refund terms consent', true, NULL, false, false, 'esign', 16),
  ('AGR-008', 'Attendance Policy Acknowledgment', 'enrollment', 'Attendance requirements', true, NULL, false, false, 'esign', 17),

  -- Financial Aid
  ('FA-001', 'FAFSA Submitted', 'financial_aid', 'FAFSA application submitted', true, NULL, true, false, 'system_flag', 20),
  ('FA-002', 'ISIR Received', 'financial_aid', 'ISIR received from DOE', true, NULL, true, false, 'system_flag', 21),
  ('FA-003', 'Verification Complete', 'financial_aid', 'If selected for verification', false, NULL, true, false, 'system_flag', 22),
  ('FA-004', 'Award Accepted', 'financial_aid', 'Financial aid award accepted', true, NULL, true, false, 'esign', 23),
  ('FA-005', 'Entrance Counseling', 'financial_aid', 'Loan entrance counseling', true, NULL, false, true, 'system_flag', 24),
  ('FA-006', 'MPN Signed', 'financial_aid', 'Master Promissory Note', true, NULL, false, true, 'system_flag', 25),
  ('FA-007', 'Exit Counseling', 'financial_aid', 'Required before graduation', true, NULL, false, true, 'system_flag', 26),

  -- Academic
  ('ACA-001', 'SAP Evaluation Current', 'academic', 'SAP evaluated at payment periods', true, NULL, false, false, 'system_flag', 30),
  ('ACA-002', 'Attendance Rate ≥67%', 'academic', 'Minimum attendance rate', true, NULL, false, false, 'system_flag', 31),
  ('ACA-003', 'Within Max Timeframe', 'academic', '150% of program length', true, NULL, false, false, 'system_flag', 32),

  -- Completion
  ('COM-001', 'Hours Completed', 'completion', 'Required clock hours', true, NULL, false, false, 'system_flag', 40),
  ('COM-002', 'Account Balance Zero', 'completion', 'All balances paid', true, NULL, false, false, 'system_flag', 41);
