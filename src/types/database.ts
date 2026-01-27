export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types
export type UserRole =
  | "superadmin"
  | "campus_admin"
  | "admissions"
  | "financial_aid"
  | "instructor"
  | "registrar"
  | "student"
  | "auditor";

export type StudentStatus =
  | "lead"
  | "applicant"
  | "accepted"
  | "enrolled"
  | "active"
  | "graduated"
  | "withdrawn"
  | "loa"
  | "lost"
  | "denied"
  | "declined"
  | "no_show";

export type DocumentStatus =
  | "pending"
  | "uploaded"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

export type SignatureStatus =
  | "pending"
  | "sent"
  | "viewed"
  | "signed"
  | "declined"
  | "voided";

export type AidStatus =
  | "not_started"
  | "fafsa_submitted"
  | "isir_received"
  | "verification_required"
  | "verification_complete"
  | "packaged"
  | "accepted"
  | "declined";

export type DisbursementStatus =
  | "scheduled"
  | "pending_release"
  | "released"
  | "posted"
  | "cancelled"
  | "returned";

export type SapStatus =
  | "satisfactory"
  | "warning"
  | "probation"
  | "suspension"
  | "appeal_pending"
  | "appeal_approved"
  | "appeal_denied";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "tardy"
  | "excused"
  | "pending_approval";

export interface Database {
  public: {
    Tables: {
      campuses: {
        Row: {
          id: string;
          name: string;
          code: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          zip: string;
          phone: string;
          email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state?: string;
          zip: string;
          phone: string;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          zip?: string;
          phone?: string;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      programs: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          total_hours: number;
          theory_hours: number;
          practical_hours: number;
          tuition_amount: number;
          books_supplies_amount: number;
          registration_fee: number;
          duration_weeks: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          total_hours: number;
          theory_hours: number;
          practical_hours: number;
          tuition_amount: number;
          books_supplies_amount?: number;
          registration_fee?: number;
          duration_weeks: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          total_hours?: number;
          theory_hours?: number;
          practical_hours?: number;
          tuition_amount?: number;
          books_supplies_amount?: number;
          registration_fee?: number;
          duration_weeks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      program_schedules: {
        Row: {
          id: string;
          program_id: string;
          name: string;
          hours_per_week: number;
          days_per_week: number;
          start_time: string | null;
          end_time: string | null;
          expected_weeks: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          name: string;
          hours_per_week: number;
          days_per_week: number;
          start_time?: string | null;
          end_time?: string | null;
          expected_weeks: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          name?: string;
          hours_per_week?: number;
          days_per_week?: number;
          start_time?: string | null;
          end_time?: string | null;
          expected_weeks?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_campus_assignments: {
        Row: {
          id: string;
          user_id: string;
          campus_id: string;
          is_primary: boolean;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          campus_id: string;
          is_primary?: boolean;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          campus_id?: string;
          is_primary?: boolean;
          assigned_at?: string;
          assigned_by?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          campus_id: string | null;
          program_id: string | null;
          preferred_schedule_id: string | null;
          preferred_start_date: string | null;
          source: string | null;
          source_detail: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          status: StudentStatus;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          converted_at: string | null;
          lost_at: string | null;
          lost_reason: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          campus_id?: string | null;
          program_id?: string | null;
          preferred_schedule_id?: string | null;
          preferred_start_date?: string | null;
          source?: string | null;
          source_detail?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: StudentStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          converted_at?: string | null;
          lost_at?: string | null;
          lost_reason?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          campus_id?: string | null;
          program_id?: string | null;
          preferred_schedule_id?: string | null;
          preferred_start_date?: string | null;
          source?: string | null;
          source_detail?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          status?: StudentStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          converted_at?: string | null;
          lost_at?: string | null;
          lost_reason?: string | null;
        };
      };
      applications: {
        Row: {
          id: string;
          lead_id: string | null;
          user_id: string | null;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          preferred_name: string | null;
          date_of_birth: string;
          ssn_encrypted: string | null;
          gender: string | null;
          email: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          zip: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relationship: string | null;
          high_school_name: string | null;
          high_school_city: string | null;
          high_school_state: string | null;
          graduation_year: number | null;
          ged_completion_date: string | null;
          highest_education: string | null;
          campus_id: string;
          program_id: string;
          schedule_id: string | null;
          desired_start_date: string | null;
          has_felony_conviction: boolean | null;
          felony_explanation: string | null;
          previous_barber_training: boolean | null;
          previous_training_details: string | null;
          status: StudentStatus;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          decision_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          user_id?: string | null;
          first_name: string;
          middle_name?: string | null;
          last_name: string;
          preferred_name?: string | null;
          date_of_birth: string;
          ssn_encrypted?: string | null;
          gender?: string | null;
          email: string;
          phone: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          zip: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          high_school_name?: string | null;
          high_school_city?: string | null;
          high_school_state?: string | null;
          graduation_year?: number | null;
          ged_completion_date?: string | null;
          highest_education?: string | null;
          campus_id: string;
          program_id: string;
          schedule_id?: string | null;
          desired_start_date?: string | null;
          has_felony_conviction?: boolean | null;
          felony_explanation?: string | null;
          previous_barber_training?: boolean | null;
          previous_training_details?: string | null;
          status?: StudentStatus;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          decision_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          user_id?: string | null;
          first_name?: string;
          middle_name?: string | null;
          last_name?: string;
          preferred_name?: string | null;
          date_of_birth?: string;
          ssn_encrypted?: string | null;
          gender?: string | null;
          email?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          zip?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          high_school_name?: string | null;
          high_school_city?: string | null;
          high_school_state?: string | null;
          graduation_year?: number | null;
          ged_completion_date?: string | null;
          highest_education?: string | null;
          campus_id?: string;
          program_id?: string;
          schedule_id?: string | null;
          desired_start_date?: string | null;
          has_felony_conviction?: boolean | null;
          felony_explanation?: string | null;
          previous_barber_training?: boolean | null;
          previous_training_details?: string | null;
          status?: StudentStatus;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          decision_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          student_id: string;
          application_id: string | null;
          document_type_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          file_hash: string | null;
          mime_type: string | null;
          status: DocumentStatus;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          version: number;
          replaces_document_id: string | null;
          uploaded_by: string;
          upload_ip: string | null;
          created_at: string;
          updated_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          application_id?: string | null;
          document_type_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          file_hash?: string | null;
          mime_type?: string | null;
          status?: DocumentStatus;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          version?: number;
          replaces_document_id?: string | null;
          uploaded_by: string;
          upload_ip?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          application_id?: string | null;
          document_type_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          file_hash?: string | null;
          mime_type?: string | null;
          status?: DocumentStatus;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          version?: number;
          replaces_document_id?: string | null;
          uploaded_by?: string;
          upload_ip?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
        };
      };
      document_types: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          category: string;
          is_required: boolean;
          requires_signature: boolean;
          retention_years: number;
          file_types_allowed: string[];
          max_file_size_mb: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          category: string;
          is_required?: boolean;
          requires_signature?: boolean;
          retention_years?: number;
          file_types_allowed?: string[];
          max_file_size_mb?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          category?: string;
          is_required?: boolean;
          requires_signature?: boolean;
          retention_years?: number;
          file_types_allowed?: string[];
          max_file_size_mb?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          student_number: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          ssn_encrypted: string | null;
          campus_id: string;
          program_id: string;
          schedule_id: string | null;
          status: StudentStatus;
          enrollment_date: string | null;
          start_date: string | null;
          expected_graduation_date: string | null;
          actual_graduation_date: string | null;
          withdrawal_date: string | null;
          last_date_of_attendance: string | null;
          total_hours_scheduled: number;
          total_hours_completed: number;
          theory_hours_completed: number;
          practical_hours_completed: number;
          is_transfer_student: boolean;
          transfer_hours_accepted: number;
          current_sap_status: SapStatus;
          last_sap_evaluation_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          student_number?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          ssn_encrypted?: string | null;
          campus_id: string;
          program_id: string;
          schedule_id?: string | null;
          status?: StudentStatus;
          enrollment_date?: string | null;
          start_date?: string | null;
          expected_graduation_date?: string | null;
          actual_graduation_date?: string | null;
          withdrawal_date?: string | null;
          last_date_of_attendance?: string | null;
          total_hours_scheduled?: number;
          total_hours_completed?: number;
          theory_hours_completed?: number;
          practical_hours_completed?: number;
          is_transfer_student?: boolean;
          transfer_hours_accepted?: number;
          current_sap_status?: SapStatus;
          last_sap_evaluation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          student_number?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string | null;
          ssn_encrypted?: string | null;
          campus_id?: string;
          program_id?: string;
          schedule_id?: string | null;
          status?: StudentStatus;
          enrollment_date?: string | null;
          start_date?: string | null;
          expected_graduation_date?: string | null;
          actual_graduation_date?: string | null;
          withdrawal_date?: string | null;
          last_date_of_attendance?: string | null;
          total_hours_scheduled?: number;
          total_hours_completed?: number;
          theory_hours_completed?: number;
          practical_hours_completed?: number;
          is_transfer_student?: boolean;
          transfer_hours_accepted?: number;
          current_sap_status?: SapStatus;
          last_sap_evaluation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          student_id: string;
          campus_id: string;
          attendance_date: string;
          clock_in_time: string | null;
          clock_out_time: string | null;
          scheduled_hours: number | null;
          actual_hours: number | null;
          theory_hours: number;
          practical_hours: number;
          status: AttendanceStatus;
          recorded_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          is_correction: boolean;
          original_record_id: string | null;
          correction_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          campus_id: string;
          attendance_date: string;
          clock_in_time?: string | null;
          clock_out_time?: string | null;
          scheduled_hours?: number | null;
          actual_hours?: number | null;
          theory_hours?: number;
          practical_hours?: number;
          status?: AttendanceStatus;
          recorded_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          is_correction?: boolean;
          original_record_id?: string | null;
          correction_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          campus_id?: string;
          attendance_date?: string;
          clock_in_time?: string | null;
          clock_out_time?: string | null;
          scheduled_hours?: number | null;
          actual_hours?: number | null;
          theory_hours?: number;
          practical_hours?: number;
          status?: AttendanceStatus;
          recorded_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          is_correction?: boolean;
          original_record_id?: string | null;
          correction_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_aid_records: {
        Row: {
          id: string;
          student_id: string;
          academic_year: string;
          fafsa_submitted: boolean;
          fafsa_submitted_date: string | null;
          transaction_number: string | null;
          efc: number | null;
          isir_received: boolean;
          isir_received_date: string | null;
          isir_comment_codes: string[] | null;
          verification_required: boolean;
          verification_tracking_group: string | null;
          verification_status: string | null;
          verification_completed_date: string | null;
          status: AidStatus;
          dependency_status: string | null;
          packaged_by: string | null;
          packaged_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          academic_year: string;
          fafsa_submitted?: boolean;
          fafsa_submitted_date?: string | null;
          transaction_number?: string | null;
          efc?: number | null;
          isir_received?: boolean;
          isir_received_date?: string | null;
          isir_comment_codes?: string[] | null;
          verification_required?: boolean;
          verification_tracking_group?: string | null;
          verification_status?: string | null;
          verification_completed_date?: string | null;
          status?: AidStatus;
          dependency_status?: string | null;
          packaged_by?: string | null;
          packaged_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          academic_year?: string;
          fafsa_submitted?: boolean;
          fafsa_submitted_date?: string | null;
          transaction_number?: string | null;
          efc?: number | null;
          isir_received?: boolean;
          isir_received_date?: string | null;
          isir_comment_codes?: string[] | null;
          verification_required?: boolean;
          verification_tracking_group?: string | null;
          verification_status?: string | null;
          verification_completed_date?: string | null;
          status?: AidStatus;
          dependency_status?: string | null;
          packaged_by?: string | null;
          packaged_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      financial_aid_awards: {
        Row: {
          id: string;
          financial_aid_record_id: string;
          award_type: string;
          award_name: string;
          fund_source: string | null;
          offered_amount: number;
          accepted_amount: number | null;
          declined_amount: number;
          status: string;
          offered_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          financial_aid_record_id: string;
          award_type: string;
          award_name: string;
          fund_source?: string | null;
          offered_amount: number;
          accepted_amount?: number | null;
          declined_amount?: number;
          status?: string;
          offered_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          financial_aid_record_id?: string;
          award_type?: string;
          award_name?: string;
          fund_source?: string | null;
          offered_amount?: number;
          accepted_amount?: number | null;
          declined_amount?: number;
          status?: string;
          offered_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      disbursements: {
        Row: {
          id: string;
          financial_aid_award_id: string;
          student_id: string;
          disbursement_number: number;
          scheduled_date: string;
          scheduled_amount: number;
          actual_date: string | null;
          actual_amount: number | null;
          status: DisbursementStatus;
          hold_reason: string | null;
          hold_placed_by: string | null;
          hold_placed_at: string | null;
          released_by: string | null;
          released_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          financial_aid_award_id: string;
          student_id: string;
          disbursement_number: number;
          scheduled_date: string;
          scheduled_amount: number;
          actual_date?: string | null;
          actual_amount?: number | null;
          status?: DisbursementStatus;
          hold_reason?: string | null;
          hold_placed_by?: string | null;
          hold_placed_at?: string | null;
          released_by?: string | null;
          released_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          financial_aid_award_id?: string;
          student_id?: string;
          disbursement_number?: number;
          scheduled_date?: string;
          scheduled_amount?: number;
          actual_date?: string | null;
          actual_amount?: number | null;
          status?: DisbursementStatus;
          hold_reason?: string | null;
          hold_placed_by?: string | null;
          hold_placed_at?: string | null;
          released_by?: string | null;
          released_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      student_accounts: {
        Row: {
          id: string;
          student_id: string;
          total_charges: number;
          total_payments: number;
          total_aid_posted: number;
          current_balance: number;
          has_payment_plan: boolean;
          payment_plan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          total_charges?: number;
          total_payments?: number;
          total_aid_posted?: number;
          current_balance?: number;
          has_payment_plan?: boolean;
          payment_plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          total_charges?: number;
          total_payments?: number;
          total_aid_posted?: number;
          current_balance?: number;
          has_payment_plan?: boolean;
          payment_plan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      charges: {
        Row: {
          id: string;
          student_account_id: string;
          student_id: string;
          charge_type: string;
          description: string;
          amount: number;
          charge_date: string;
          due_date: string | null;
          period_start: string | null;
          period_end: string | null;
          is_voided: boolean;
          voided_reason: string | null;
          voided_by: string | null;
          voided_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          student_account_id: string;
          student_id: string;
          charge_type: string;
          description: string;
          amount: number;
          charge_date: string;
          due_date?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          is_voided?: boolean;
          voided_reason?: string | null;
          voided_by?: string | null;
          voided_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          student_account_id?: string;
          student_id?: string;
          charge_type?: string;
          description?: string;
          amount?: number;
          charge_date?: string;
          due_date?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          is_voided?: boolean;
          voided_reason?: string | null;
          voided_by?: string | null;
          voided_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          student_account_id: string;
          student_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          stripe_payment_id: string | null;
          check_number: string | null;
          reference_number: string | null;
          disbursement_id: string | null;
          status: PaymentStatus;
          is_refund: boolean;
          refund_reason: string | null;
          original_payment_id: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          student_account_id: string;
          student_id: string;
          amount: number;
          payment_method: string;
          payment_date: string;
          stripe_payment_id?: string | null;
          check_number?: string | null;
          reference_number?: string | null;
          disbursement_id?: string | null;
          status?: PaymentStatus;
          is_refund?: boolean;
          refund_reason?: string | null;
          original_payment_id?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          student_account_id?: string;
          student_id?: string;
          amount?: number;
          payment_method?: string;
          payment_date?: string;
          stripe_payment_id?: string | null;
          check_number?: string | null;
          reference_number?: string | null;
          disbursement_id?: string | null;
          status?: PaymentStatus;
          is_refund?: boolean;
          refund_reason?: string | null;
          original_payment_id?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      audit_log: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          user_id: string | null;
          user_email: string | null;
          user_role: UserRole | null;
          campus_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          old_data: Json | null;
          new_data: Json | null;
          changed_fields: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: UserRole | null;
          campus_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_fields?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: UserRole | null;
          campus_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          changed_fields?: string[] | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      student_status: StudentStatus;
      document_status: DocumentStatus;
      signature_status: SignatureStatus;
      aid_status: AidStatus;
      disbursement_status: DisbursementStatus;
      sap_status: SapStatus;
      payment_status: PaymentStatus;
      attendance_status: AttendanceStatus;
    };
  };
}

// Convenience type helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Commonly used type aliases
export type UserProfile = Tables<"user_profiles">;
export type Campus = Tables<"campuses">;
export type Program = Tables<"programs">;
export type ProgramSchedule = Tables<"program_schedules">;
export type Student = Tables<"students">;
export type Application = Tables<"applications">;
export type Document = Tables<"documents">;
export type DocumentType = Tables<"document_types">;
export type AttendanceRecord = Tables<"attendance_records">;
export type FinancialAidRecord = Tables<"financial_aid_records">;
export type FinancialAidAward = Tables<"financial_aid_awards">;
export type Disbursement = Tables<"disbursements">;
export type StudentAccount = Tables<"student_accounts">;
export type Charge = Tables<"charges">;
export type Payment = Tables<"payments">;
