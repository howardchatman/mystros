-- ============================================================================
-- MYSTROS BARBER ACADEMY - AUDIT TRIGGERS
-- Version: 1.0
-- Description: Automatic audit logging for compliance-sensitive operations
-- ============================================================================

-- ============================================================================
-- AUDIT LOGGING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changed_fields TEXT[];
  v_user_id UUID;
  v_user_email VARCHAR(255);
  v_user_role user_role;
  v_campus_id UUID;
BEGIN
  -- Get current user info (may be NULL for service role operations)
  v_user_id := auth.uid();

  IF v_user_id IS NOT NULL THEN
    SELECT email, role INTO v_user_email, v_user_role
    FROM user_profiles
    WHERE id = v_user_id;
  END IF;

  -- Determine the operation and data
  IF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;

    -- Try to get campus_id from old record
    IF OLD ? 'campus_id' THEN
      v_campus_id := (OLD->>'campus_id')::UUID;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);

    -- Calculate changed fields
    SELECT array_agg(key)
    INTO v_changed_fields
    FROM (
      SELECT key
      FROM jsonb_each(v_new_data)
      WHERE v_new_data->key IS DISTINCT FROM v_old_data->key
    ) changed;

    -- Try to get campus_id from new record
    IF NEW ? 'campus_id' THEN
      v_campus_id := (NEW->>'campus_id')::UUID;
    ELSIF OLD ? 'campus_id' THEN
      v_campus_id := (OLD->>'campus_id')::UUID;
    END IF;

  ELSIF TG_OP = 'INSERT' THEN
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);

    -- Try to get campus_id from new record
    IF NEW ? 'campus_id' THEN
      v_campus_id := (NEW->>'campus_id')::UUID;
    END IF;
  END IF;

  -- Remove sensitive fields from logged data
  IF v_old_data IS NOT NULL THEN
    v_old_data := v_old_data - 'ssn_encrypted';
  END IF;
  IF v_new_data IS NOT NULL THEN
    v_new_data := v_new_data - 'ssn_encrypted';
  END IF;

  -- Insert audit log entry
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    user_id,
    user_email,
    user_role,
    campus_id,
    old_data,
    new_data,
    changed_fields
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    v_user_id,
    v_user_email,
    v_user_role,
    v_campus_id,
    v_old_data,
    v_new_data,
    v_changed_fields
  );

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APPLY AUDIT TRIGGERS TO SENSITIVE TABLES
-- ============================================================================

-- Students table - all operations
CREATE TRIGGER audit_students
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Applications table - all operations
CREATE TRIGGER audit_applications
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Documents table - all operations
CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Signature records - all operations
CREATE TRIGGER audit_signature_records
  AFTER INSERT OR UPDATE OR DELETE ON signature_records
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Attendance records - all operations
CREATE TRIGGER audit_attendance_records
  AFTER INSERT OR UPDATE OR DELETE ON attendance_records
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Attendance corrections - all operations
CREATE TRIGGER audit_attendance_corrections
  AFTER INSERT OR UPDATE OR DELETE ON attendance_corrections
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Financial aid records - all operations
CREATE TRIGGER audit_financial_aid_records
  AFTER INSERT OR UPDATE OR DELETE ON financial_aid_records
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Financial aid awards - all operations
CREATE TRIGGER audit_financial_aid_awards
  AFTER INSERT OR UPDATE OR DELETE ON financial_aid_awards
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Disbursements - all operations
CREATE TRIGGER audit_disbursements
  AFTER INSERT OR UPDATE OR DELETE ON disbursements
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- SAP evaluations - all operations
CREATE TRIGGER audit_sap_evaluations
  AFTER INSERT OR UPDATE OR DELETE ON sap_evaluations
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Charges - all operations
CREATE TRIGGER audit_charges
  AFTER INSERT OR UPDATE OR DELETE ON charges
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Payments - all operations
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Withdrawals - all operations
CREATE TRIGGER audit_withdrawals
  AFTER INSERT OR UPDATE OR DELETE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- R2T4 returns - all operations
CREATE TRIGGER audit_r2t4_returns
  AFTER INSERT OR UPDATE OR DELETE ON r2t4_returns
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Compliance checklist items - all operations
CREATE TRIGGER audit_compliance_checklist_items
  AFTER INSERT OR UPDATE OR DELETE ON compliance_checklist_items
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- User profiles - updates only (inserts handled by auth)
CREATE TRIGGER audit_user_profiles
  AFTER UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- User campus assignments - all operations
CREATE TRIGGER audit_user_campus_assignments
  AFTER INSERT OR UPDATE OR DELETE ON user_campus_assignments
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================================================
-- SESSION LOGGING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION log_session_event(
  p_user_id UUID,
  p_action VARCHAR(50),
  p_session_id VARCHAR(100) DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO session_log (
    user_id,
    session_id,
    ip_address,
    user_agent,
    action
  ) VALUES (
    p_user_id,
    p_session_id,
    p_ip_address,
    p_user_agent,
    p_action
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTIONS FOR AUDIT QUERIES
-- ============================================================================

-- Get audit trail for a specific record
CREATE OR REPLACE FUNCTION get_record_audit_trail(
  p_table_name VARCHAR(100),
  p_record_id UUID
)
RETURNS TABLE (
  id UUID,
  action VARCHAR(20),
  user_email VARCHAR(255),
  user_role user_role,
  changed_fields TEXT[],
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.user_email,
    al.user_role,
    al.changed_fields,
    al.old_data,
    al.new_data,
    al.created_at
  FROM audit_log al
  WHERE al.table_name = p_table_name
    AND al.record_id = p_record_id
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent audit events for a campus
CREATE OR REPLACE FUNCTION get_campus_audit_events(
  p_campus_id UUID,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  table_name VARCHAR(100),
  record_id UUID,
  action VARCHAR(20),
  user_email VARCHAR(255),
  user_role user_role,
  changed_fields TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.table_name,
    al.record_id,
    al.action,
    al.user_email,
    al.user_role,
    al.changed_fields,
    al.created_at
  FROM audit_log al
  WHERE al.campus_id = p_campus_id
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get audit events for a specific student
CREATE OR REPLACE FUNCTION get_student_audit_events(
  p_student_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  table_name VARCHAR(100),
  record_id UUID,
  action VARCHAR(20),
  user_email VARCHAR(255),
  changed_fields TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.table_name,
    al.record_id,
    al.action,
    al.user_email,
    al.changed_fields,
    al.created_at
  FROM audit_log al
  WHERE
    -- Direct student record changes
    (al.table_name = 'students' AND al.record_id = p_student_id)
    -- Or related records (need to join to find student_id in the data)
    OR (al.new_data->>'student_id' = p_student_id::TEXT)
    OR (al.old_data->>'student_id' = p_student_id::TEXT)
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
