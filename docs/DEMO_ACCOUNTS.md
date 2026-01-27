# Mystros Barber Academy - Demo Accounts

## Overview

These demo accounts are pre-configured for testing different role-based access levels in the platform.

---

## Demo Accounts

| Email | Name | Role | Campus Access | Password |
|-------|------|------|---------------|----------|
| `eros@chatmanconcierge.com` | Eros Shaw | **SuperAdmin** (Owner) | North + Missouri City | `demo1234` |
| `steve@demo.com` | Steve Farrell | **Campus Admin** (Director) | Missouri City only | `demo1234` |
| `teacher@demo.com` | Demo Teacher | **Instructor** | North Campus | `demo1234` |
| `compliance@demo.com` | Demo Auditor | **Auditor** (Read-only) | Both Campuses | `demo1234` |
| `cashier@demo.com` | Demo Cashier | **Financial Aid** | North Campus | `demo1234` |
| `student@demo.com` | Demo Student | **Student** | North Campus | `demo1234` |

---

## Role Permissions Summary

### SuperAdmin (`eros@chatmanconcierge.com`)
- Full access to all features across all campuses
- User management and role assignments
- System settings and program configuration
- Can view/edit all student records
- Financial aid packaging and disbursements
- Compliance reports and audit logs

### Campus Admin (`steve@demo.com`)
- Full access within assigned campus (Missouri City)
- Cannot see North Campus data
- User management for their campus only
- Student admissions and enrollment
- Attendance management
- Financial processing

### Instructor (`teacher@demo.com`)
- Record daily attendance
- View students in their campus
- Cannot modify student records
- Cannot access financial information

### Auditor (`compliance@demo.com`)
- **Read-only access** to both campuses
- View all student records and documents
- Access audit logs
- Generate compliance reports
- Cannot create, edit, or delete any records

### Financial Aid (`cashier@demo.com`)
- Process payments and refunds
- Financial aid packaging
- Disbursement tracking
- SAP evaluations
- View student financial records

### Student (`student@demo.com`)
- View own dashboard and progress
- Upload required documents
- Sign enrollment agreements
- View attendance and hours
- View financial aid status and balance
- Cannot see other students' data

---

## Setting Up Demo Accounts in Supabase

### Option 1: Supabase Dashboard

1. Go to Authentication > Users in Supabase Dashboard
2. Click "Add User" for each demo account
3. Use these specific UUIDs (important for the seed data to work):

```
eros@chatmanconcierge.com: d1000000-0000-0000-0000-000000000001
steve@demo.com:      d1000000-0000-0000-0000-000000000002
teacher@demo.com:    d1000000-0000-0000-0000-000000000003
compliance@demo.com: d1000000-0000-0000-0000-000000000004
cashier@demo.com:    d1000000-0000-0000-0000-000000000005
student@demo.com:    d1000000-0000-0000-0000-000000000006
```

4. Set password to `demo1234` for all
5. Run the migration: `00005_demo_users.sql`

### Option 2: SQL (Local Development)

For local Supabase development, you can create auth users directly:

```sql
-- Run in Supabase SQL Editor (requires service role)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'eros@demo.com', crypt('demo1234', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000002', 'steve@demo.com', crypt('demo1234', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000003', 'teacher@demo.com', crypt('demo1234', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000004', 'compliance@demo.com', crypt('demo1234', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000005', 'cashier@demo.com', crypt('demo1234', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('d1000000-0000-0000-0000-000000000006', 'student@demo.com', crypt('demo1234', gen_salt('bf')), NOW(), NOW(), NOW());
```

---

## Demo Student Data

The `student@demo.com` account has pre-populated data:

- **Program**: Class A Barber (1000 hours)
- **Status**: Active
- **Hours Completed**: 342.5 / 1000
- **SAP Status**: Satisfactory
- **Account Balance**: $2,450.00
- **Financial Aid**:
  - Pell Grant: $7,395 (accepted)
  - Direct Sub Loan: $1,955 (accepted)

---

## Testing Scenarios

### Test Role-Based Access
1. Login as `eros@chatmanconcierge.com` - should see all campuses
2. Login as `steve@demo.com` - should only see Missouri City data
3. Login as `compliance@demo.com` - should see all data but no edit buttons

### Test Student Portal
1. Login as `student@demo.com`
2. View dashboard with hours progress
3. Check attendance history
4. View financial aid status
5. See account balance

### Test Attendance Recording
1. Login as `teacher@demo.com`
2. Go to attendance recording
3. Should only see North Campus students
4. Can record clock-in/clock-out

---

*Last Updated: January 2025*
