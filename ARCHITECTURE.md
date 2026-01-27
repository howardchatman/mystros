# Mystros Barber Academy Platform Architecture

## Executive Summary

A comprehensive, compliance-ready student lifecycle management platform serving Mystros Barber Academy's two Houston-area campuses. The platform encompasses public marketing, student admissions/onboarding, financial aid packaging, clock-hour tracking, and regulatory compliance workflows.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MYSTROS PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   PUBLIC     │  │   STUDENT    │  │    ADMIN     │  │   AUDITOR    │   │
│  │    SITE      │  │   PORTAL     │  │   PORTAL     │  │    VIEW      │   │
│  │  (Marketing) │  │  (Applicant/ │  │ (Staff/Ops)  │  │  (Read-only) │   │
│  │              │  │   Student)   │  │              │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │           │
│         └─────────────────┴────────┬────────┴─────────────────┘           │
│                                    │                                       │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐ │
│  │                     NEXT.JS APP ROUTER (v14+)                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │  │   Server    │ │   Server    │ │    API      │ │   Middleware    │  │ │
│  │  │ Components  │ │   Actions   │ │   Routes    │ │ (Auth/Campus)   │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                       │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐ │
│  │                         SUPABASE BACKEND                              │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │ │
│  │  │   Auth   │ │ Postgres │ │  Storage │ │ Realtime │ │  Edge Fns   │  │ │
│  │  │  (SSO)   │ │  + RLS   │ │  (Docs)  │ │ (Status) │ │  (Webhooks) │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                    │                                       │
│  ┌─────────────────────────────────▼─────────────────────────────────────┐ │
│  │                      EXTERNAL INTEGRATIONS                            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │ │
│  │  │  Stripe  │ │  Twilio  │ │ DocuSign │ │ SendGrid │ │   S3/R2     │  │ │
│  │  │(Payments)│ │  (SMS)   │ │ (E-Sign) │ │ (Email)  │ │  (Backup)   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Brand Design System

### Color Palette (Extracted from Shield Logo)

| Token          | HEX       | RGB              | Usage                          |
|----------------|-----------|------------------|--------------------------------|
| `--bg`         | `#0a0e17` | 10, 14, 23       | Page backgrounds               |
| `--bg-elevated`| `#111827` | 17, 24, 39       | Card backgrounds               |
| `--primary`    | `#1e3a5f` | 30, 58, 95       | Primary brand navy             |
| `--accent`     | `#3b82f6` | 59, 130, 246     | Interactive elements, links    |
| `--accent2`    | `#60a5fa` | 96, 165, 250     | Hover states, highlights       |
| `--ice`        | `#93c5fd` | 147, 197, 253    | Subtle accents, borders        |
| `--text`       | `#f8fafc` | 248, 250, 252    | Primary text                   |
| `--muted`      | `#64748b` | 100, 116, 139    | Secondary text, placeholders   |
| `--success`    | `#10b981` | 16, 185, 129     | Success states                 |
| `--warning`    | `#f59e0b` | 245, 158, 11     | Warning states                 |
| `--error`      | `#ef4444` | 239, 68, 68      | Error states                   |
| `--gold`       | `#d4af37` | 212, 175, 55     | Premium accents (graduation)   |

### Visual Texture System

1. **Noise Overlay**: 3% opacity grain texture on dark backgrounds
2. **Blueprint Grid**: Faint 0.5% opacity barbershop blueprint pattern (optional sections)
3. **Gradient Layers**: Radial gradient spots for depth (accent color at 5-10% opacity)
4. **Glassmorphism**: Cards with `backdrop-blur-xl`, subtle white border glow
5. **Brushed Metal**: Optional metallic texture for hero sections

---

## Folder Structure

```
mystros/
├── .env.local                    # Environment variables
├── .env.example                  # Template for env vars
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind + brand tokens
├── tsconfig.json                 # TypeScript config
├── package.json
│
├── supabase/
│   ├── config.toml               # Supabase project config
│   ├── migrations/
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   ├── 00003_audit_triggers.sql
│   │   ├── 00004_seed_data.sql
│   │   └── 00005_functions.sql
│   └── seed.sql                  # Development seed data
│
├── public/
│   ├── logo-shield.png           # Main logo
│   ├── scissors-icon.png         # Accent icon
│   ├── textures/
│   │   ├── noise.svg             # Noise overlay
│   │   ├── blueprint.svg         # Blueprint pattern
│   │   └── brushed-metal.png     # Metal texture
│   ├── og-image.png              # Social sharing image
│   └── favicon.ico
│
├── content/
│   ├── videos.json               # Video gallery data
│   ├── campuses.json             # Campus information
│   ├── programs.json             # Program details
│   ├── testimonials.json         # Student testimonials
│   ├── faqs.json                 # FAQ content
│   └── disclosures.json          # Consumer disclosures
│
├── src/
│   ├── app/
│   │   ├── (public)/             # Public marketing site
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Home
│   │   │   ├── programs/
│   │   │   │   ├── page.tsx      # Programs overview
│   │   │   │   ├── class-a-barber/page.tsx
│   │   │   │   └── crossover/page.tsx
│   │   │   ├── admissions/page.tsx
│   │   │   ├── financial-aid/page.tsx
│   │   │   ├── student-resources/page.tsx
│   │   │   ├── community/page.tsx
│   │   │   ├── tutorials/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── apply/page.tsx
│   │   │
│   │   ├── (auth)/               # Authentication flows
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── verify/page.tsx
│   │   │
│   │   ├── (student)/            # Student portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── application/
│   │   │   │   ├── page.tsx      # Application status
│   │   │   │   ├── documents/page.tsx
│   │   │   │   └── agreements/page.tsx
│   │   │   ├── academics/
│   │   │   │   ├── page.tsx      # Progress overview
│   │   │   │   ├── attendance/page.tsx
│   │   │   │   └── hours/page.tsx
│   │   │   ├── finances/
│   │   │   │   ├── page.tsx      # Account overview
│   │   │   │   ├── aid/page.tsx  # Financial aid status
│   │   │   │   └── payments/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── (admin)/              # Admin portal
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── admissions/
│   │   │   │   ├── page.tsx      # Pipeline view
│   │   │   │   ├── leads/page.tsx
│   │   │   │   ├── applicants/page.tsx
│   │   │   │   └── [id]/page.tsx # Applicant detail
│   │   │   ├── students/
│   │   │   │   ├── page.tsx      # Student roster
│   │   │   │   ├── [id]/page.tsx # Student detail
│   │   │   │   └── [id]/compliance/page.tsx
│   │   │   ├── attendance/
│   │   │   │   ├── page.tsx      # Daily view
│   │   │   │   ├── corrections/page.tsx
│   │   │   │   └── reports/page.tsx
│   │   │   ├── financial-aid/
│   │   │   │   ├── page.tsx      # Aid overview
│   │   │   │   ├── packaging/page.tsx
│   │   │   │   ├── disbursements/page.tsx
│   │   │   │   └── sap/page.tsx  # SAP tracking
│   │   │   ├── financials/
│   │   │   │   ├── page.tsx      # AR overview
│   │   │   │   ├── invoices/page.tsx
│   │   │   │   └── payments/page.tsx
│   │   │   ├── compliance/
│   │   │   │   ├── page.tsx      # Compliance dashboard
│   │   │   │   ├── checklist/page.tsx
│   │   │   │   ├── audit-log/page.tsx
│   │   │   │   └── exports/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/
│   │   │       ├── page.tsx
│   │   │       ├── users/page.tsx
│   │   │       ├── programs/page.tsx
│   │   │       └── campuses/page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts
│   │   │   │   └── docusign/route.ts
│   │   │   ├── cron/
│   │   │   │   ├── reminders/route.ts
│   │   │   │   └── sap-check/route.ts
│   │   │   └── exports/
│   │   │       └── student-file/route.ts
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── error.tsx             # Error boundary
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (full shadcn set)
│   │   │
│   │   ├── layout/
│   │   │   ├── public-header.tsx
│   │   │   ├── public-footer.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── student-sidebar.tsx
│   │   │   ├── campus-switcher.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── marketing/
│   │   │   ├── hero-section.tsx
│   │   │   ├── program-card.tsx
│   │   │   ├── campus-card.tsx
│   │   │   ├── testimonial-carousel.tsx
│   │   │   ├── video-gallery.tsx
│   │   │   ├── video-card.tsx
│   │   │   ├── trust-badges.tsx
│   │   │   ├── cta-banner.tsx
│   │   │   └── texture-background.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── lead-capture-form.tsx
│   │   │   ├── application-form.tsx
│   │   │   ├── document-upload.tsx
│   │   │   ├── e-signature.tsx
│   │   │   ├── attendance-form.tsx
│   │   │   └── payment-form.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── pipeline-board.tsx
│   │   │   ├── student-table.tsx
│   │   │   ├── compliance-checklist.tsx
│   │   │   ├── attendance-grid.tsx
│   │   │   ├── disbursement-tracker.tsx
│   │   │   ├── audit-log-viewer.tsx
│   │   │   ├── stats-card.tsx
│   │   │   └── export-dialog.tsx
│   │   │
│   │   └── student/
│   │       ├── status-tracker.tsx
│   │       ├── document-checklist.tsx
│   │       ├── hours-progress.tsx
│   │       ├── payment-history.tsx
│   │       └── aid-status-card.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   ├── admin.ts          # Service role client
│   │   │   └── middleware.ts     # Auth middleware
│   │   │
│   │   ├── actions/              # Server actions
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── applications.ts
│   │   │   ├── documents.ts
│   │   │   ├── students.ts
│   │   │   ├── attendance.ts
│   │   │   ├── financial-aid.ts
│   │   │   ├── payments.ts
│   │   │   └── compliance.ts
│   │   │
│   │   ├── validations/          # Zod schemas
│   │   │   ├── lead.ts
│   │   │   ├── application.ts
│   │   │   ├── student.ts
│   │   │   ├── attendance.ts
│   │   │   └── financial-aid.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts             # Class name utility
│   │   │   ├── format.ts         # Formatters
│   │   │   ├── dates.ts          # Date utilities
│   │   │   ├── currency.ts       # Currency formatting
│   │   │   ├── hours.ts          # Clock hours calculations
│   │   │   └── encryption.ts     # PII encryption helpers
│   │   │
│   │   └── constants/
│   │       ├── roles.ts          # Role definitions
│   │       ├── statuses.ts       # Status enums
│   │       ├── documents.ts      # Document type configs
│   │       └── compliance.ts     # Compliance rules
│   │
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-campus.ts
│   │   ├── use-realtime.ts
│   │   └── use-permissions.ts
│   │
│   └── types/
│       ├── database.ts           # Generated from Supabase
│       ├── forms.ts
│       └── api.ts
│
├── docs/
│   ├── COMPLIANCE.md             # Compliance requirements
│   ├── API.md                    # API documentation
│   ├── DEPLOYMENT.md             # Deployment guide
│   └── AUDIT.md                  # Audit procedures
│
└── tests/
    ├── e2e/                      # Playwright tests
    └── unit/                     # Vitest tests
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPERADMIN                                  │
│     (Full system access, both campuses, user management)            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  CAMPUS ADMIN   │  │  CAMPUS ADMIN   │  │      AUDITOR        │ │
│  │  (North Campus) │  │ (Missouri City) │  │    (Read-Only)      │ │
│  └────────┬────────┘  └────────┬────────┘  └─────────────────────┘ │
│           │                    │                                    │
│  ┌────────┴────────────────────┴────────┐                          │
│  │         CAMPUS-SCOPED ROLES          │                          │
│  ├──────────────────────────────────────┤                          │
│  │  ADMISSIONS  │  FINANCIAL_AID  │     │                          │
│  │  INSTRUCTOR  │  REGISTRAR      │     │                          │
│  └──────────────────────────────────────┘                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                          STUDENT                                    │
│              (Own records only, limited actions)                    │
└─────────────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Action                      | SuperAdmin | CampusAdmin | Admissions | FinancialAid | Instructor | Registrar | Student | Auditor |
|-----------------------------|:----------:|:-----------:|:----------:|:------------:|:----------:|:---------:|:-------:|:-------:|
| View all campuses           | ✅         | ❌          | ❌         | ❌           | ❌         | ❌        | ❌      | ✅      |
| Manage users                | ✅         | ✅*         | ❌         | ❌           | ❌         | ❌        | ❌      | ❌      |
| View leads                  | ✅         | ✅          | ✅         | ❌           | ❌         | ❌        | ❌      | ✅      |
| Create/edit applications    | ✅         | ✅          | ✅         | ❌           | ❌         | ❌        | ✅**    | ❌      |
| Approve enrollment          | ✅         | ✅          | ✅         | ❌           | ❌         | ❌        | ❌      | ❌      |
| View student records        | ✅         | ✅          | ✅         | ✅           | ✅*        | ✅        | ✅**    | ✅      |
| Edit student records        | ✅         | ✅          | ❌         | ❌           | ❌         | ✅        | ❌      | ❌      |
| Record attendance           | ✅         | ✅          | ❌         | ❌           | ✅         | ❌        | ❌      | ❌      |
| Approve attendance edits    | ✅         | ✅          | ❌         | ❌           | ❌         | ✅        | ❌      | ❌      |
| View financial aid          | ✅         | ✅          | ❌         | ✅           | ❌         | ❌        | ✅**    | ✅      |
| Package financial aid       | ✅         | ✅          | ❌         | ✅           | ❌         | ❌        | ❌      | ❌      |
| Process disbursements       | ✅         | ✅          | ❌         | ✅           | ❌         | ❌        | ❌      | ❌      |
| View financials/AR          | ✅         | ✅          | ❌         | ✅           | ❌         | ✅        | ✅**    | ✅      |
| Process payments            | ✅         | ✅          | ❌         | ✅           | ❌         | ✅        | ❌      | ❌      |
| View audit logs             | ✅         | ✅          | ❌         | ❌           | ❌         | ❌        | ❌      | ✅      |
| Export compliance reports   | ✅         | ✅          | ❌         | ❌           | ❌         | ✅        | ❌      | ✅      |
| Manage programs/settings    | ✅         | ❌          | ❌         | ❌           | ❌         | ❌        | ❌      | ❌      |

*Campus-scoped only
**Own records only

---

## Student Lifecycle Stages

```
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐
│  LEAD   │──▶│ APPLICANT │──▶│ ACCEPTED │──▶│ ENROLLED │──▶│ ACTIVE │
└─────────┘   └───────────┘   └──────────┘   └──────────┘   └────────┘
     │              │              │              │              │
     │              │              │              │              ▼
     ▼              ▼              ▼              ▼        ┌───────────┐
┌─────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐ │ GRADUATED │
│  LOST   │   │  DENIED   │   │ DECLINED │   │ NO-SHOW  │ └───────────┘
└─────────┘   └───────────┘   └──────────┘   └──────────┘       │
                                                                 │
                              ┌──────────────────────────────────┤
                              ▼                                  ▼
                        ┌───────────┐                     ┌────────────┐
                        │ WITHDRAWN │◀────────────────────│ LOA (Leave)│
                        └───────────┘                     └────────────┘
```

---

## Compliance Requirements Summary

### FERPA Compliance
- Student records accessible only to authorized personnel
- Written consent required for third-party disclosure
- Directory information opt-out capability
- Audit trail for all record access

### Financial Aid Compliance
- Satisfactory Academic Progress (SAP) monitoring
- Return to Title IV (R2T4) calculation documentation
- Disbursement timing rules adherence
- ISIR verification workflow

### State Licensing (TDLR - Texas)
- Clock hour tracking accuracy (1000 hours for Class A Barber)
- Attendance record retention (5 years minimum)
- Monthly progress reports capability

### COE Accreditation
- Consumer disclosure accessibility
- Completion/placement rate tracking
- Student complaint procedure documentation

---

## Build Milestones

### Phase 1: Foundation (Week 1-2)
- [ ] Project scaffold + Supabase setup
- [ ] Auth system + role management
- [ ] Public site: Home, Programs, Contact pages
- [ ] Brand implementation (colors, textures, components)

### Phase 2: Public Site Complete (Week 3)
- [ ] All public pages built
- [ ] Video gallery system
- [ ] Lead capture form
- [ ] Mobile optimization + performance tuning

### Phase 3: Admissions Pipeline (Week 4-5)
- [ ] Lead management
- [ ] Application form + document upload
- [ ] E-signature workflow
- [ ] Status tracking + notifications

### Phase 4: Student Portal (Week 6-7)
- [ ] Student dashboard
- [ ] Document checklist view
- [ ] Attendance/hours view
- [ ] Financial aid status view

### Phase 5: Admin Core (Week 8-10)
- [ ] Admin dashboard + pipeline board
- [ ] Student management
- [ ] Attendance recording + corrections
- [ ] Basic financial aid packaging

### Phase 6: Financials (Week 11-12)
- [ ] Tuition/payment plan setup
- [ ] Invoice generation
- [ ] Payment processing (Stripe)
- [ ] Disbursement tracking

### Phase 7: Compliance (Week 13-14)
- [ ] Compliance checklist module
- [ ] Audit log viewer
- [ ] Export functionality
- [ ] R2T4 workflow

### Phase 8: Polish & Launch (Week 15-16)
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment

---

## Security Measures

1. **Authentication**: Supabase Auth with MFA option
2. **Authorization**: Row-Level Security (RLS) on all tables
3. **Encryption**:
   - TLS 1.3 in transit
   - AES-256 at rest for PII fields (SSN, DOB)
4. **Audit Logging**: Immutable audit trail via triggers
5. **Session Management**: Secure httpOnly cookies, 15-min sliding expiry for admin
6. **Input Validation**: Zod schemas on all forms/APIs
7. **CORS**: Strict origin policies
8. **Rate Limiting**: API route protection
9. **Document Security**: Signed URLs with expiration, virus scanning

---

## Performance Targets

| Metric                | Target    |
|-----------------------|-----------|
| Lighthouse Performance| 90+       |
| FCP (First Contentful)| < 1.5s    |
| LCP (Largest Content) | < 2.5s    |
| CLS (Cumulative Shift)| < 0.1     |
| TTI (Time to Interact)| < 3.5s    |
| API Response (p95)    | < 200ms   |

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: Claude (Principal Product Designer + Senior Full-Stack Architect)*
