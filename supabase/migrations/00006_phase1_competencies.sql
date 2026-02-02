-- ============================================================================
-- PHASE 1: Competency Tracking, SAP Configuration, Student Milestones
-- ============================================================================

-- Competency definitions (program-specific skills checklist)
CREATE TABLE IF NOT EXISTS competency_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  milestone_hours INTEGER,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student competency progress
CREATE TABLE IF NOT EXISTS student_competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  competency_definition_id UUID NOT NULL REFERENCES competency_definitions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  evaluated_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, competency_definition_id)
);

-- SAP evaluation configuration (per-program thresholds)
CREATE TABLE IF NOT EXISTS sap_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  evaluation_interval_hours INTEGER NOT NULL DEFAULT 450,
  min_completion_rate DECIMAL(5,2) NOT NULL DEFAULT 67.00,
  max_timeframe_percentage DECIMAL(5,2) NOT NULL DEFAULT 150.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id)
);

-- Student milestones tracking
CREATE TABLE IF NOT EXISTS student_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL,
  milestone_name VARCHAR(255) NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, milestone_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competency_defs_program ON competency_definitions(program_id);
CREATE INDEX IF NOT EXISTS idx_student_competencies_student ON student_competencies(student_id);
CREATE INDEX IF NOT EXISTS idx_student_competencies_definition ON student_competencies(competency_definition_id);
CREATE INDEX IF NOT EXISTS idx_student_milestones_student ON student_milestones(student_id);
CREATE INDEX IF NOT EXISTS idx_sap_config_program ON sap_configurations(program_id);

-- RLS
ALTER TABLE competency_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sap_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;

-- Policies: staff can read all, admins/instructors can write
CREATE POLICY "Staff can view competency definitions"
  ON competency_definitions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role != 'student'
  ));

CREATE POLICY "Admins can manage competency definitions"
  ON competency_definitions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('superadmin', 'campus_admin')
  ));

CREATE POLICY "Staff can view student competencies"
  ON student_competencies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role != 'student'
  ));

CREATE POLICY "Instructors and admins can manage student competencies"
  ON student_competencies FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid()
      AND role IN ('superadmin', 'campus_admin', 'instructor', 'registrar')
  ));

CREATE POLICY "Staff can view SAP configurations"
  ON sap_configurations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role != 'student'
  ));

CREATE POLICY "Admins can manage SAP configurations"
  ON sap_configurations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('superadmin', 'campus_admin')
  ));

CREATE POLICY "Staff can view student milestones"
  ON student_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role != 'student'
  ));

CREATE POLICY "Instructors and admins can manage student milestones"
  ON student_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid()
      AND role IN ('superadmin', 'campus_admin', 'instructor', 'registrar')
  ));

-- Students can view their own competencies and milestones
CREATE POLICY "Students can view own competencies"
  ON student_competencies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM students WHERE students.id = student_competencies.student_id
      AND students.user_id = auth.uid()
  ));

CREATE POLICY "Students can view own milestones"
  ON student_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM students WHERE students.id = student_milestones.student_id
      AND students.user_id = auth.uid()
  ));

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competency_definitions_updated_at
  BEFORE UPDATE ON competency_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_competencies_updated_at
  BEFORE UPDATE ON student_competencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sap_configurations_updated_at
  BEFORE UPDATE ON sap_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED: SAP Configurations for existing programs
-- ============================================================================
INSERT INTO sap_configurations (program_id, evaluation_interval_hours, min_completion_rate, max_timeframe_percentage)
SELECT id, 450, 67.00, 150.00 FROM programs WHERE code = 'CLASS_A'
ON CONFLICT (program_id) DO NOTHING;

INSERT INTO sap_configurations (program_id, evaluation_interval_hours, min_completion_rate, max_timeframe_percentage)
SELECT id, 150, 67.00, 150.00 FROM programs WHERE code = 'CROSSOVER'
ON CONFLICT (program_id) DO NOTHING;

-- ============================================================================
-- SEED: Competency Definitions for Class A Barber Program
-- ============================================================================
DO $$
DECLARE
  v_program_id UUID;
BEGIN
  SELECT id INTO v_program_id FROM programs WHERE code = 'CLASS_A' LIMIT 1;
  IF v_program_id IS NULL THEN RETURN; END IF;

  -- Haircutting
  INSERT INTO competency_definitions (program_id, category, name, sort_order, milestone_hours) VALUES
    (v_program_id, 'Haircutting', 'Clipper Cutting - Basic', 1, 100),
    (v_program_id, 'Haircutting', 'Clipper Cutting - Advanced (Fades)', 2, 250),
    (v_program_id, 'Haircutting', 'Shear Cutting - Basic', 3, 100),
    (v_program_id, 'Haircutting', 'Shear Cutting - Advanced (Texturizing)', 4, 300),
    (v_program_id, 'Haircutting', 'Taper Fade', 5, 200),
    (v_program_id, 'Haircutting', 'Skin Fade', 6, 300),
    (v_program_id, 'Haircutting', 'Flat Top', 7, 400),
    (v_program_id, 'Haircutting', 'Razor Cutting', 8, 350),
    (v_program_id, 'Haircutting', 'Hair Design / Patterns', 9, 500),
    (v_program_id, 'Haircutting', 'Children''s Haircuts', 10, 200),
    (v_program_id, 'Haircutting', 'Women''s Haircuts', 11, 400)
  ON CONFLICT DO NOTHING;

  -- Chemical Services
  INSERT INTO competency_definitions (program_id, category, name, sort_order, milestone_hours) VALUES
    (v_program_id, 'Chemical Services', 'Hair Coloring - Basic Application', 1, 300),
    (v_program_id, 'Chemical Services', 'Hair Coloring - Advanced (Highlights/Lowlights)', 2, 500),
    (v_program_id, 'Chemical Services', 'Relaxer Application', 3, 400),
    (v_program_id, 'Chemical Services', 'Permanent Wave', 4, 400),
    (v_program_id, 'Chemical Services', 'Chemical Safety & Patch Testing', 5, 200)
  ON CONFLICT DO NOTHING;

  -- Shaving
  INSERT INTO competency_definitions (program_id, category, name, sort_order, milestone_hours) VALUES
    (v_program_id, 'Shaving', 'Straight Razor Shave', 1, 250),
    (v_program_id, 'Shaving', 'Facial Hair Design (Beard Trim/Shape)', 2, 200),
    (v_program_id, 'Shaving', 'Hot Towel Service', 3, 150),
    (v_program_id, 'Shaving', 'Mustache Trim', 4, 150)
  ON CONFLICT DO NOTHING;

  -- Sanitation & Safety
  INSERT INTO competency_definitions (program_id, category, name, sort_order, milestone_hours) VALUES
    (v_program_id, 'Sanitation & Safety', 'Tool Sterilization & Disinfection', 1, 50),
    (v_program_id, 'Sanitation & Safety', 'OSHA Standards Compliance', 2, 100),
    (v_program_id, 'Sanitation & Safety', 'Bloodborne Pathogens / First Aid', 3, 100),
    (v_program_id, 'Sanitation & Safety', 'Workstation Sanitation', 4, 50),
    (v_program_id, 'Sanitation & Safety', 'Client Protection & Draping', 5, 50)
  ON CONFLICT DO NOTHING;

  -- Business & Professional Ethics
  INSERT INTO competency_definitions (program_id, category, name, sort_order, milestone_hours) VALUES
    (v_program_id, 'Business & Ethics', 'Customer Consultation & Communication', 1, 200),
    (v_program_id, 'Business & Ethics', 'Appointment Scheduling & Management', 2, 300),
    (v_program_id, 'Business & Ethics', 'State Board Laws & Regulations', 3, 500),
    (v_program_id, 'Business & Ethics', 'Shop Management & Bookkeeping', 4, 600),
    (v_program_id, 'Business & Ethics', 'Professional Ethics & Conduct', 5, 100)
  ON CONFLICT DO NOTHING;

  -- Scalp & Hair Care
  INSERT INTO competency_definitions (program_id, category, name, sort_order, milestone_hours) VALUES
    (v_program_id, 'Scalp & Hair Care', 'Shampooing & Conditioning', 1, 50),
    (v_program_id, 'Scalp & Hair Care', 'Scalp Analysis & Treatments', 2, 200),
    (v_program_id, 'Scalp & Hair Care', 'Hair & Scalp Disorders Recognition', 3, 200)
  ON CONFLICT DO NOTHING;
END $$;
