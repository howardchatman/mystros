# Mystros Barber Academy - Compliance Checklist Module

## Overview

The Compliance Checklist module provides a centralized view of each student's regulatory compliance status. This ensures all required documents, acknowledgments, and milestones are tracked for accreditation audits, state licensing requirements, and institutional policies.

---

## Checklist Categories & Items

### 1. ENROLLMENT DOCUMENTS

| Item Code | Item Name | Required | Source | Notes |
|-----------|-----------|----------|--------|-------|
| `ENR-001` | Government-Issued Photo ID | Yes | Upload | Valid driver's license, passport, or state ID |
| `ENR-002` | High School Diploma or GED | Yes | Upload | Official document or certified copy |
| `ENR-003` | Social Security Card | Yes | Upload | Original or official copy |
| `ENR-004` | Birth Certificate | No | Upload | May be required for age verification |
| `ENR-005` | Proof of TX Residency | No | Upload | For in-state tuition if applicable |
| `ENR-006` | Cosmetology License | Crossover Only | Upload | Required for crossover program only |

### 2. ENROLLMENT AGREEMENTS

| Item Code | Item Name | Required | Source | Notes |
|-----------|-----------|----------|--------|-------|
| `AGR-001` | Enrollment Agreement | Yes | E-Sign | Main enrollment contract |
| `AGR-002` | Student Handbook Acknowledgment | Yes | E-Sign | Confirms receipt of handbook |
| `AGR-003` | FERPA Release Authorization | Yes | E-Sign | Privacy consent |
| `AGR-004` | Photo/Media Release | No | E-Sign | Marketing consent |
| `AGR-005` | Drug-Free Campus Policy | Yes | E-Sign | Policy acknowledgment |
| `AGR-006` | Satisfactory Academic Progress Policy | Yes | E-Sign | SAP policy acknowledgment |
| `AGR-007` | Refund Policy Acknowledgment | Yes | E-Sign | Refund terms consent |
| `AGR-008` | Attendance Policy Acknowledgment | Yes | E-Sign | Attendance requirements |

### 3. FINANCIAL AID (Title IV Recipients)

| Item Code | Item Name | Required | Source | Notes |
|-----------|-----------|----------|--------|-------|
| `FA-001` | FAFSA Application Submitted | FA Recipients | System Flag | Date tracked |
| `FA-002` | ISIR Received | FA Recipients | System Flag | Date tracked |
| `FA-003` | Verification Documents | If Selected | Upload | Tax transcripts, W-2s, etc. |
| `FA-004` | Verification Complete | If Selected | System Flag | Staff confirmation |
| `FA-005` | Award Letter Signed | FA Recipients | E-Sign | Acceptance of award |
| `FA-006` | Entrance Counseling Complete | Loan Recipients | System Flag | studentaid.gov completion |
| `FA-007` | Master Promissory Note Signed | Loan Recipients | System Flag | studentaid.gov completion |
| `FA-008` | Exit Counseling Complete | Loan Recipients | System Flag | Required before graduation |

### 4. ACADEMIC PROGRESS

| Item Code | Item Name | Required | Source | Notes |
|-----------|-----------|----------|--------|-------|
| `ACA-001` | SAP Evaluation Current | Yes | System | Auto-checked at payment periods |
| `ACA-002` | SAP Status Satisfactory | Yes | System | Warning/Probation flags |
| `ACA-003` | SAP Appeal (if applicable) | Conditional | Upload + E-Sign | Required if on probation |
| `ACA-004` | Attendance Rate ≥67% | Yes | System | Calculated from attendance |
| `ACA-005` | Within Maximum Timeframe | Yes | System | 150% of program length |

### 5. PROGRAM COMPLETION

| Item Code | Item Name | Required | Source | Notes |
|-----------|-----------|----------|--------|-------|
| `COM-001` | Minimum Hours Completed | Yes | System | 1000 or 300 hours |
| `COM-002` | Theory Requirements Met | Yes | System | Minimum theory hours |
| `COM-003` | Practical Requirements Met | Yes | System | Minimum practical hours |
| `COM-004` | Exit Counseling Complete | Loan Recipients | System Flag | Before transcript release |
| `COM-005` | Account Balance Zero | Yes | System | All balances paid |
| `COM-006` | Graduation Paperwork | Yes | System | Internal clearance |

### 6. WITHDRAWAL (If Applicable)

| Item Code | Item Name | Required | Source | Notes |
|-----------|-----------|----------|--------|-------|
| `WD-001` | Withdrawal Form | Yes | E-Sign | Student or admin initiated |
| `WD-002` | Last Date of Attendance Documented | Yes | System | From attendance records |
| `WD-003` | R2T4 Calculation Complete | FA Recipients | Upload | Calculation worksheet |
| `WD-004` | R2T4 Funds Returned | FA Recipients | System Flag | Return confirmation |
| `WD-005` | Exit Interview Complete | Recommended | System Flag | Optional counseling |

---

## Implementation Details

### Database Tables

```sql
-- Compliance item definitions (seeded data)
CREATE TABLE compliance_item_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  required_for_programs TEXT[],  -- ['class-a-barber', 'crossover'] or NULL for all
  required_for_fa_recipients BOOLEAN DEFAULT false,
  required_for_loan_recipients BOOLEAN DEFAULT false,
  evidence_type VARCHAR(50),  -- 'document', 'esign', 'system_flag'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Per-student compliance status (already in schema as compliance_checklist_items)
```

### API Endpoints

```typescript
// Server Actions
export async function getStudentComplianceStatus(studentId: string)
export async function updateComplianceItem(studentId: string, itemCode: string, data: ComplianceUpdate)
export async function generateComplianceReport(studentId: string, format: 'pdf' | 'csv')
export async function sendComplianceReminder(studentId: string, itemCodes: string[])
export async function bulkUpdateCompliance(studentId: string, updates: ComplianceUpdate[])

// Types
interface ComplianceUpdate {
  isComplete: boolean;
  documentId?: string;
  notes?: string;
}

interface ComplianceStatus {
  studentId: string;
  studentName: string;
  program: string;
  overallScore: number;
  totalItems: number;
  completedItems: number;
  categories: ComplianceCategory[];
}

interface ComplianceCategory {
  name: string;
  items: ComplianceItem[];
  isComplete: boolean;
}

interface ComplianceItem {
  code: string;
  name: string;
  isRequired: boolean;
  isComplete: boolean;
  completedAt?: Date;
  completedBy?: string;
  documentId?: string;
  notes?: string;
  dueDate?: Date;
  isOverdue: boolean;
}
```

### UI Components

#### `ComplianceChecklist` Component

```tsx
// components/admin/compliance-checklist.tsx
interface ComplianceChecklistProps {
  studentId: string;
  readonly?: boolean;  // For auditor view
  onItemUpdate?: (itemCode: string, update: ComplianceUpdate) => void;
}

// Features:
// - Collapsible category sections
// - Status badges (Complete, Pending, Overdue, N/A)
// - Quick actions (upload doc, send reminder, mark complete)
// - Progress percentage per category and overall
// - Export to PDF/CSV
// - Print-friendly view
```

#### `ComplianceDashboard` Component

```tsx
// components/admin/compliance-dashboard.tsx
// Campus-wide compliance overview
// - Students with missing items (sorted by urgency)
// - Compliance score distribution
// - Common missing items
// - Audit preparation checklist
```

### Automated Checks

```typescript
// Cron job: Daily compliance check
// - Calculate SAP status from attendance/grades
// - Check document expiration dates
// - Flag upcoming due dates
// - Send automated reminders for overdue items

// Triggers:
// - On document upload → mark related compliance item
// - On e-sign completion → mark related compliance item
// - On attendance update → recalculate attendance compliance
// - On disbursement → verify FA compliance
```

---

## Compliance Scoring

### Overall Score Calculation

```typescript
function calculateComplianceScore(items: ComplianceItem[]): number {
  const requiredItems = items.filter(i => i.isRequired);
  const completedRequired = requiredItems.filter(i => i.isComplete);
  return Math.round((completedRequired.length / requiredItems.length) * 100);
}
```

### Status Indicators

| Status | Color | Condition |
|--------|-------|-----------|
| Complete | Green | All required items complete |
| On Track | Blue | Score ≥80%, no overdue items |
| Attention Needed | Yellow | Score 60-79% or has overdue items |
| Critical | Red | Score <60% or multiple overdue items |

---

## Audit Export Format

### Student File Export (PDF Bundle)

```
StudentFile_JohnDoe_STU-2025-0042.zip
├── cover_sheet.pdf
├── compliance_checklist.pdf
├── documents/
│   ├── ENR-001_government_id.pdf
│   ├── ENR-002_diploma.pdf
│   ├── ENR-003_ssn_card.pdf
│   └── ...
├── agreements/
│   ├── AGR-001_enrollment_agreement_signed.pdf
│   ├── AGR-002_handbook_ack_signed.pdf
│   └── ...
├── attendance/
│   ├── attendance_summary.pdf
│   └── daily_attendance_log.csv
├── financial_aid/
│   ├── award_letter.pdf
│   ├── disbursement_history.pdf
│   └── sap_evaluations.pdf
└── audit_log.csv
```

### Cover Sheet Contents

- Student name, ID, program, campus
- Enrollment date, expected graduation
- Current status, hours completed
- Compliance score with breakdown
- Generated timestamp, generated by

---

## Integration Points

1. **Document Upload** → Auto-marks compliance item when document type matches
2. **E-Signature** → Auto-marks compliance item when document signed
3. **Attendance System** → Updates `ACA-004` (attendance rate) daily
4. **Financial Aid Module** → Updates FA compliance items on status changes
5. **Student Portal** → Students see their own compliance checklist (read-only sensitive items)
6. **Notification System** → Sends reminders for overdue/upcoming items

---

## Security & Privacy

- SSN and sensitive documents encrypted at rest
- Document access logged in audit trail
- Role-based access to compliance data:
  - Admissions: Enrollment documents only
  - Financial Aid: FA compliance items only
  - Registrar: Full access
  - Auditor: Read-only full access
  - Student: Own checklist (limited view)

---

*Document Version: 1.0*
*Last Updated: January 2025*
