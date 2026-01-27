-- ============================================================================
-- MYSTROS BARBER ACADEMY - ROW LEVEL SECURITY POLICIES
-- Version: 1.0
-- Description: Comprehensive RLS policies for FERPA-compliant access control
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_campus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_aid_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_aid_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sap_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE r2t4_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is auditor
CREATE OR REPLACE FUNCTION is_auditor()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'auditor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is campus admin for a specific campus
CREATE OR REPLACE FUNCTION is_campus_admin(check_campus_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN user_campus_assignments uca ON up.id = uca.user_id
    WHERE up.id = auth.uid()
    AND up.role IN ('superadmin', 'campus_admin')
    AND (up.role = 'superadmin' OR uca.campus_id = check_campus_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get user's assigned campus IDs
CREATE OR REPLACE FUNCTION get_user_campus_ids()
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG(campus_id)
  FROM user_campus_assignments
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has access to a campus
CREATE OR REPLACE FUNCTION has_campus_access(check_campus_id UUID)
RETURNS BOOLEAN AS $$
  SELECT is_superadmin() OR is_auditor() OR EXISTS (
    SELECT 1 FROM user_campus_assignments
    WHERE user_id = auth.uid() AND campus_id = check_campus_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has a specific role (or higher)
CREATE OR REPLACE FUNCTION has_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = ANY(required_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is the student being accessed
CREATE OR REPLACE FUNCTION is_own_student_record(student_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = student_user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Staff roles that can view student data
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'campus_admin', 'admissions', 'financial_aid', 'instructor', 'registrar', 'auditor')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- CAMPUSES POLICIES
-- ============================================================================

-- Everyone can read active campuses (public info)
CREATE POLICY "campuses_select_public"
  ON campuses FOR SELECT
  USING (is_active = true);

-- Only superadmin can modify campuses
CREATE POLICY "campuses_insert_superadmin"
  ON campuses FOR INSERT
  WITH CHECK (is_superadmin());

CREATE POLICY "campuses_update_superadmin"
  ON campuses FOR UPDATE
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- ============================================================================
-- PROGRAMS POLICIES
-- ============================================================================

-- Everyone can read active programs (public info)
CREATE POLICY "programs_select_public"
  ON programs FOR SELECT
  USING (is_active = true);

-- Only superadmin can modify programs
CREATE POLICY "programs_insert_superadmin"
  ON programs FOR INSERT
  WITH CHECK (is_superadmin());

CREATE POLICY "programs_update_superadmin"
  ON programs FOR UPDATE
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- ============================================================================
-- PROGRAM SCHEDULES POLICIES
-- ============================================================================

CREATE POLICY "program_schedules_select_public"
  ON program_schedules FOR SELECT
  USING (is_active = true);

CREATE POLICY "program_schedules_insert_superadmin"
  ON program_schedules FOR INSERT
  WITH CHECK (is_superadmin());

CREATE POLICY "program_schedules_update_superadmin"
  ON program_schedules FOR UPDATE
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- Staff can read profiles in their campus
CREATE POLICY "user_profiles_select_staff"
  ON user_profiles FOR SELECT
  USING (
    is_staff() AND (
      is_superadmin() OR is_auditor() OR
      id IN (
        SELECT user_id FROM user_campus_assignments
        WHERE campus_id = ANY(get_user_campus_ids())
      )
    )
  );

-- Users can update their own non-sensitive fields
CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    role = (SELECT role FROM user_profiles WHERE id = auth.uid()) -- Can't change own role
  );

-- Superadmin and campus admin can update profiles
CREATE POLICY "user_profiles_update_admin"
  ON user_profiles FOR UPDATE
  USING (
    is_superadmin() OR (
      has_role(ARRAY['campus_admin']::user_role[]) AND
      id IN (
        SELECT user_id FROM user_campus_assignments
        WHERE campus_id = ANY(get_user_campus_ids())
      )
    )
  );

-- ============================================================================
-- USER CAMPUS ASSIGNMENTS POLICIES
-- ============================================================================

CREATE POLICY "user_campus_assignments_select_own"
  ON user_campus_assignments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_campus_assignments_select_admin"
  ON user_campus_assignments FOR SELECT
  USING (is_superadmin() OR has_role(ARRAY['campus_admin']::user_role[]));

CREATE POLICY "user_campus_assignments_modify_superadmin"
  ON user_campus_assignments FOR ALL
  USING (is_superadmin());

-- ============================================================================
-- LEADS POLICIES
-- ============================================================================

-- Admissions staff can see leads for their campus
CREATE POLICY "leads_select_staff"
  ON leads FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'auditor']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- Admissions can create leads
CREATE POLICY "leads_insert_admissions"
  ON leads FOR INSERT
  WITH CHECK (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- Admissions can update leads in their campus
CREATE POLICY "leads_update_admissions"
  ON leads FOR UPDATE
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- ============================================================================
-- LEAD ACTIVITIES POLICIES
-- ============================================================================

CREATE POLICY "lead_activities_select"
  ON lead_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_activities.lead_id
      AND has_campus_access(leads.campus_id)
    ) AND
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'auditor']::user_role[])
  );

CREATE POLICY "lead_activities_insert"
  ON lead_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = lead_activities.lead_id
      AND has_campus_access(leads.campus_id)
    ) AND
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions']::user_role[])
  );

-- ============================================================================
-- APPLICATIONS POLICIES
-- ============================================================================

-- Students can see their own application
CREATE POLICY "applications_select_own"
  ON applications FOR SELECT
  USING (user_id = auth.uid());

-- Staff can see applications for their campus
CREATE POLICY "applications_select_staff"
  ON applications FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'auditor']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- Students can create/update their own application (before submission)
CREATE POLICY "applications_insert_student"
  ON applications FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions']::user_role[])
  );

CREATE POLICY "applications_update_own"
  ON applications FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'applicant' AND submitted_at IS NULL) OR
    (has_role(ARRAY['superadmin', 'campus_admin', 'admissions']::user_role[]) AND has_campus_access(campus_id))
  );

-- ============================================================================
-- DOCUMENT TYPES POLICIES
-- ============================================================================

-- Everyone can read document types
CREATE POLICY "document_types_select_all"
  ON document_types FOR SELECT
  USING (true);

-- Only superadmin can modify
CREATE POLICY "document_types_modify_superadmin"
  ON document_types FOR ALL
  USING (is_superadmin());

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

-- Students can see their own documents
CREATE POLICY "documents_select_own"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = documents.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Staff can see documents for students in their campus
CREATE POLICY "documents_select_staff"
  ON documents FOR SELECT
  USING (
    is_staff() AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = documents.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- Students can upload their own documents
CREATE POLICY "documents_insert_own"
  ON documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = documents.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Staff can upload documents for students in their campus
CREATE POLICY "documents_insert_staff"
  ON documents FOR INSERT
  WITH CHECK (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'financial_aid', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = documents.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- Staff can update document status
CREATE POLICY "documents_update_staff"
  ON documents FOR UPDATE
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'financial_aid', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = documents.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- STUDENTS POLICIES
-- ============================================================================

-- Students can see their own record
CREATE POLICY "students_select_own"
  ON students FOR SELECT
  USING (user_id = auth.uid());

-- Staff can see students in their campus
CREATE POLICY "students_select_staff"
  ON students FOR SELECT
  USING (
    is_staff() AND has_campus_access(campus_id)
  );

-- Registrar and above can create/update students
CREATE POLICY "students_insert_staff"
  ON students FOR INSERT
  WITH CHECK (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'registrar']::user_role[]) AND
    has_campus_access(campus_id)
  );

CREATE POLICY "students_update_staff"
  ON students FOR UPDATE
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'registrar']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- ============================================================================
-- ATTENDANCE POLICIES
-- ============================================================================

-- Students can see their own attendance
CREATE POLICY "attendance_select_own"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance_records.student_id
      AND students.user_id = auth.uid()
    )
  );

-- Staff can see attendance for their campus
CREATE POLICY "attendance_select_staff"
  ON attendance_records FOR SELECT
  USING (
    is_staff() AND has_campus_access(campus_id)
  );

-- Instructors can record attendance
CREATE POLICY "attendance_insert_instructor"
  ON attendance_records FOR INSERT
  WITH CHECK (
    has_role(ARRAY['superadmin', 'campus_admin', 'instructor']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- Instructors can update same-day attendance
CREATE POLICY "attendance_update_instructor"
  ON attendance_records FOR UPDATE
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'instructor']::user_role[]) AND
    has_campus_access(campus_id) AND
    (attendance_date = CURRENT_DATE OR has_role(ARRAY['superadmin', 'campus_admin', 'registrar']::user_role[]))
  );

-- ============================================================================
-- ATTENDANCE CORRECTIONS POLICIES
-- ============================================================================

CREATE POLICY "attendance_corrections_select"
  ON attendance_corrections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance_corrections.student_id
      AND (students.user_id = auth.uid() OR has_campus_access(students.campus_id))
    )
  );

CREATE POLICY "attendance_corrections_insert"
  ON attendance_corrections FOR INSERT
  WITH CHECK (
    has_role(ARRAY['superadmin', 'campus_admin', 'instructor', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance_corrections.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "attendance_corrections_update"
  ON attendance_corrections FOR UPDATE
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = attendance_corrections.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- FINANCIAL AID POLICIES
-- ============================================================================

-- Students can see their own financial aid
CREATE POLICY "fa_records_select_own"
  ON financial_aid_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = financial_aid_records.student_id
      AND students.user_id = auth.uid()
    )
  );

-- FA staff can see records for their campus
CREATE POLICY "fa_records_select_staff"
  ON financial_aid_records FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = financial_aid_records.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- FA staff can create/update records
CREATE POLICY "fa_records_insert"
  ON financial_aid_records FOR INSERT
  WITH CHECK (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = financial_aid_records.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "fa_records_update"
  ON financial_aid_records FOR UPDATE
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = financial_aid_records.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- FINANCIAL AID AWARDS POLICIES
-- ============================================================================

CREATE POLICY "fa_awards_select_own"
  ON financial_aid_awards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM financial_aid_records far
      JOIN students s ON s.id = far.student_id
      WHERE far.id = financial_aid_awards.financial_aid_record_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "fa_awards_select_staff"
  ON financial_aid_awards FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM financial_aid_records far
      JOIN students s ON s.id = far.student_id
      WHERE far.id = financial_aid_awards.financial_aid_record_id
      AND has_campus_access(s.campus_id)
    )
  );

CREATE POLICY "fa_awards_modify"
  ON financial_aid_awards FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM financial_aid_records far
      JOIN students s ON s.id = far.student_id
      WHERE far.id = financial_aid_awards.financial_aid_record_id
      AND has_campus_access(s.campus_id)
    )
  );

-- ============================================================================
-- DISBURSEMENTS POLICIES
-- ============================================================================

CREATE POLICY "disbursements_select_own"
  ON disbursements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = disbursements.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "disbursements_select_staff"
  ON disbursements FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = disbursements.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "disbursements_modify"
  ON disbursements FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = disbursements.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- SAP EVALUATIONS POLICIES
-- ============================================================================

CREATE POLICY "sap_select_own"
  ON sap_evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = sap_evaluations.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "sap_select_staff"
  ON sap_evaluations FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = sap_evaluations.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "sap_modify"
  ON sap_evaluations FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = sap_evaluations.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- STUDENT ACCOUNTS / CHARGES / PAYMENTS POLICIES
-- ============================================================================

-- Student accounts
CREATE POLICY "student_accounts_select_own"
  ON student_accounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_accounts.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "student_accounts_select_staff"
  ON student_accounts FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_accounts.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "student_accounts_modify"
  ON student_accounts FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = student_accounts.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- Charges
CREATE POLICY "charges_select_own"
  ON charges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = charges.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "charges_select_staff"
  ON charges FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = charges.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "charges_modify"
  ON charges FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = charges.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- Payments
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = payments.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "payments_select_staff"
  ON payments FOR SELECT
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar', 'auditor']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = payments.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "payments_modify"
  ON payments FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'financial_aid', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = payments.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- AUDIT LOG POLICIES
-- ============================================================================

-- Only superadmin and auditor can read audit logs
CREATE POLICY "audit_log_select"
  ON audit_log FOR SELECT
  USING (has_role(ARRAY['superadmin', 'auditor']::user_role[]));

-- Campus admins can see audit logs for their campus
CREATE POLICY "audit_log_select_campus_admin"
  ON audit_log FOR SELECT
  USING (
    has_role(ARRAY['campus_admin']::user_role[]) AND
    has_campus_access(campus_id)
  );

-- Audit log inserts are done via triggers with service role

-- ============================================================================
-- COMPLIANCE CHECKLIST POLICIES
-- ============================================================================

CREATE POLICY "compliance_select_own"
  ON compliance_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = compliance_checklist_items.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "compliance_select_staff"
  ON compliance_checklist_items FOR SELECT
  USING (
    is_staff() AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = compliance_checklist_items.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "compliance_modify"
  ON compliance_checklist_items FOR ALL
  USING (
    has_role(ARRAY['superadmin', 'campus_admin', 'admissions', 'financial_aid', 'registrar']::user_role[]) AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = compliance_checklist_items.student_id
      AND has_campus_access(students.campus_id)
    )
  );

-- ============================================================================
-- TASKS POLICIES
-- ============================================================================

-- Users can see tasks assigned to them
CREATE POLICY "tasks_select_own"
  ON tasks FOR SELECT
  USING (assigned_to = auth.uid());

-- Staff can see tasks for their campus
CREATE POLICY "tasks_select_campus"
  ON tasks FOR SELECT
  USING (
    is_staff() AND has_campus_access(campus_id)
  );

-- Staff can create tasks
CREATE POLICY "tasks_insert"
  ON tasks FOR INSERT
  WITH CHECK (
    is_staff() AND has_campus_access(campus_id)
  );

-- Users can update their own tasks or admins can update any
CREATE POLICY "tasks_update"
  ON tasks FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    has_role(ARRAY['superadmin', 'campus_admin']::user_role[])
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can see their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Staff can see notifications for audit
CREATE POLICY "notifications_select_staff"
  ON notifications FOR SELECT
  USING (has_role(ARRAY['superadmin', 'campus_admin', 'auditor']::user_role[]));

-- System inserts notifications via service role

-- ============================================================================
-- SIGNATURE ENVELOPES & RECORDS POLICIES
-- ============================================================================

CREATE POLICY "signature_envelopes_select_own"
  ON signature_envelopes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = signature_envelopes.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "signature_envelopes_select_staff"
  ON signature_envelopes FOR SELECT
  USING (
    is_staff() AND
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = signature_envelopes.student_id
      AND has_campus_access(students.campus_id)
    )
  );

CREATE POLICY "signature_records_select_own"
  ON signature_records FOR SELECT
  USING (signer_id = auth.uid());

CREATE POLICY "signature_records_select_staff"
  ON signature_records FOR SELECT
  USING (
    is_staff() AND
    EXISTS (
      SELECT 1 FROM signature_envelopes se
      JOIN students s ON s.id = se.student_id
      WHERE se.id = signature_records.envelope_id
      AND has_campus_access(s.campus_id)
    )
  );

-- ============================================================================
-- SESSION LOG POLICIES
-- ============================================================================

-- Users can see their own session log
CREATE POLICY "session_log_select_own"
  ON session_log FOR SELECT
  USING (user_id = auth.uid());

-- Admins and auditors can see all session logs
CREATE POLICY "session_log_select_admin"
  ON session_log FOR SELECT
  USING (has_role(ARRAY['superadmin', 'auditor']::user_role[]));

-- Inserts via service role only
