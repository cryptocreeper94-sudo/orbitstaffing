# ORBIT Staffing OS - Compressed Documentation

## Overview

ORBIT Staffing OS is a fully automated, white-label capable platform designed for staffing agencies managing temporary workers across skilled trades, hospitality, and general labor. The platform offers end-to-end automation from recruitment to payroll and invoicing, including mobile applications for workers and a comprehensive administrative dashboard. Its core purpose is to provide a scalable, production-ready solution that can be sold as a standalone product or licensed to franchisees, significantly reducing operational costs and improving efficiency for staffing businesses. The project aims to capture a significant market share by offering a flexible, feature-rich system with robust compliance and customization options, exemplified by its first potential franchise deal with "Superior Staffing."

## User Preferences

- **Communication:** I prefer clear, concise explanations with minimal jargon.
- **Workflow:** I prefer an iterative development approach. Please ask for my approval before implementing major changes or new features.
- **Codebase Changes:** Do not make changes to the `replit.md` file or the `docs/` folder without explicit instruction.
- **Prioritization:** Focus on features that directly contribute to closing franchise deals and improving core platform stability.
- **Reporting:** Provide regular updates on progress, especially regarding critical features and bug fixes.

## System Architecture

The ORBIT Staffing OS is a **unified, multi-tenant white-label platform** where all users access the same ORBIT technology with appropriate access levels and branding:

### Three-Tier Access Model (One Platform, Different Views)

**Tier 1: Master Admin (System Owner - YOU)**
- Entry point: System Control Panel (PIN login)
- Full access to entire ORBIT ecosystem
- Manage all franchises, customers, and admins
- System health monitoring and configuration
- Create & delegate admin roles to your team
- Set rules, compliance policies, and system-wide settings
- View all analytics and metrics

**Tier 2: Assigned Admins (Your Team)**
- Entry point: Admin Panel (PIN login)  
- Role-based access with specific responsibilities:
  - **Franchise Admin**: Oversee franchise operations
  - **Customer Admin**: Manage monthly subscriptions
  - **Staff Admin**: Worker & client management
  - **Finance Admin**: Billing, payments, collections
  - **Operations Admin**: Scheduling & assignments
- Only see data for their assigned organization
- Complete data isolation from other franchises/customers
- Enforce policies and manage their scope

**Tier 3: End Users (Business Owners - Franchisees/Customers)**
- Entry point: ORBIT Main App (branded with their company name)
- **"Superior Staffing powered by ORBIT"** style branding
- Full ORBIT functionality for their business:
  - Worker & client management
  - Real-time scheduling & assignments
  - Payroll & invoicing
  - GPS verification & mobile apps
  - Collections & compliance
- **Configurable Admin System** (delegated by us):
  - They can assign team members to admin roles we define for them
  - The available roles & permissions are determined by:
    - Their industry type (skilled trades, hospitality, general labor)
    - Their company size & business needs
    - Their billing tier and payment model
    - Jurisdiction compliance requirements (TN, KY, etc)
  - They control WHO gets WHAT ROLE, we control WHAT ROLES EXIST
  - Common pre-configured roles: Owner, Manager, Finance, Operations, HR, etc.
- Direct communication with ORBIT
  - Support messaging
  - Feature requests & feedback loop
  - Issue reporting
  - Direct line during onboarding & setup
- Complete data isolation - zero visibility into other businesses

### The ORBIT Brand Promise
- **Same core platform**: All tiers use identical ORBIT technology and features
- **White-label capability**: Franchisee branding on top (company name, logo, colors)
- **Industry-specific configurations**: One ORBIT app, adapted for their vertical
- **Unified quality**: No "lesser" or "different" product - same ORBIT excellence
- **Complete data isolation**: Multi-tenant security at database level
- **Scalable**: From 1 franchise to 1000+ franchises, all on same infrastructure

### ORBIT Hallmark Asset System
- **Required Element**: Every franchisee deployment includes a "Powered by ORBIT" button with Saturn watermark
- **Non-removable**: This is a hardcoded, required asset per franchise agreement
- **Unique Hallmark Numbers**: Each asset receives a unique ORBIT-ASSET-XXXXXX-XXXXXX number
- **Asset Registry**: All deployed assets tracked in a running database with timestamps, franchisee info, and metadata
- **Lead Generation**: Franchisee customers can click the button to discover ORBIT
- **Compliance**: Removal of the hallmark asset violates franchise agreement terms
- **Asset Stamping**: Any tangible output (invoices, paystubs, contracts, reports, certifications, deployments) automatically gets stamped with hallmark + QR code
- **Verification**: Every asset verifiable at `/verify/{assetNumber}` with proof of legitimacy
- **Blockchain Ready**: Foundation for future tokenization - every asset is trackable, auditable, and verifiable

### UI/UX Decisions

-   **Aesthetic:** Dark industrial theme with an "aqua Saturn 3D watermark."
-   **Component Library:** Radix UI for robust and accessible components.
-   **Styling:** Tailwind CSS for utility-first styling.
-   **Mobile Design:** React Native + Expo for cross-platform mobile apps (Android and iOS) with full feature parity with the web platform. Key mobile features include secure JWT authentication, biometric login, and GPS-verified clock-in/out.

### Technical Implementations

-   **Frontend:** React 18 with Wouter for routing.
-   **Backend:** Express.js and Node.js with TypeScript for a robust API layer.
-   **Database:** PostgreSQL, hosted on Neon, managed with Drizzle ORM.
-   **Real-time Capabilities:** WebSocket support for features like in-app messaging.
-   **Security:** Encrypted SSN storage, session-based authentication, audit trails, role-based access control, and HTTPS communication.
-   **Compliance:** Integrated state-specific compliance rules (e.g., TN/KY), prevailing wage calculations, and I-9 tracking.
-   **Modular Design:** File organization separates shared schemas, server logic, client-side code, and documentation for maintainability and scalability.

### Feature Specifications

-   **CRM:** Comprehensive management for workers, clients, and companies.
-   **Payroll & Invoicing:** Automated payroll processing with multi-state compliance and auto-generated, customizable invoices.
-   **Scheduling & Assignments:** Job posting, worker assignment, bulk operations, and real-time updates.
-   **GPS Verification:** Geofencing (200-300ft radius) for accurate worker clock-in/out.
-   **Messaging:** In-app communication between workers and managers.
-   **Time Off Management:** Request and approval workflows.
-   **Real-time Dashboard:** Operational visibility into workers, assignments, and key metrics.
-   **Franchise & Licensing System:** Supports flexible billing models (fixed monthly or revenue share), manages licenses (one-time, subscription, enterprise), tracks payments, and offers warranty/support period tracking.
-   **Feature Request System:** Allows customers to submit, categorize, prioritize, and track feature requests with audit trails.
-   **Mobile App (Android/iOS):** Secure authentication, biometric login, GPS check-in, real-time assignment updates, and sandbox/live mode toggle.

### System Design Choices

-   **Scalability:** Designed to support a large number of companies and workers (e.g., 1000+ companies).
-   **Flexibility:** Adaptable billing models and white-label capabilities for franchise partners.
-   **Customer-Driven Development:** The feature request system is central to evolving the product based on user needs, especially for franchise partners during their warranty period.

## External Dependencies

-   **Database Hosting:** Neon (for PostgreSQL)
-   **Payment Gateway (Planned):** Stripe (API key field present, but currently supports bank transfers, checks, invoices)
-   **Mobile Development Framework:** Expo
-   **SMTP Service:** For email notifications (production SMTP with console fallback)
## Production Deployment Status (Nov 24, 2025)

### ✅ PHASE 2 COMPLETE - V2 ROADMAP FRAMEWORK DEPLOYED

**Seven Core Systems Fully Operational:**

1. **Equipment Tracking** (`/equipment-tracking`)
   - Real-time PPE inventory management
   - Worker assignment with 2-day return deadline
   - Auto-deduction for unreturned items
   - Database persistence to `employeeEquipmentLoaned` table

2. **GPS Clock-In System** (`/gps-clock-in`)
   - 300-foot geofencing verification
   - Real-time location capture with accuracy
   - Timesheet records created in database
   - Complete audit trail of clock-in/out events

3. **Payroll Processing** (`/payroll-processing`)
   - Timesheet approval workflow
   - Gross/net pay calculations
   - Hallmark codes generated for each paystub
   - QR verification with `/verify/{hallmarkId}` endpoint
   - Paystub PDF generation

4. **Worker Bonuses** (`/worker-bonuses`)
   - Real-time bonus calculations
   - Multi-tier bonus structure
   - Performance rating integration
   - Referral bonus tracking

5. **Quick Shift Accept/Reject** (`/worker-shifts`)
   - 1-click shift acceptance
   - Real-time shift tracking
   - Rejection with reason capture

6. **Worker Availability Calendar** (`/worker-availability`)
   - 2-week scheduling interface
   - Heatmap visualization on Admin Panel
   - Smart shift recommendations
   - Calendar synced across all dashboards

7. **Referral Bonus Tracking** (`/worker-referrals`)
   - $100+ per referral
   - Milestone bonus rewards
   - Real-time earnings tracking

**V2 Features Infrastructure (Ready to Flip Switch Q2 2026):**

**Feature Flag System** 
- Database table: `featureFlags`
- Admin controls for toggling features
- API endpoints: `/api/feature-flags`, `/api/feature-flags/toggle`
- Status: LOCKED (comes Q2 2026)

**SMS Notifications** (Twilio Ready)
- Database table: `smsQueue`
- Message types: shift_offer, confirmation, reminder, alert, bonus_update
- Retry logic: up to 3 retries per message
- API endpoints: `/api/sms/send`, `/api/sms/pending`, `/api/sms/:smsId/status`
- Status: LOCKED (comes Q2 2026)

**Skill Verification & Badges**
- Database table: `workerSkillVerifications`
- Certification tracking with expiration dates
- Badge award system
- API endpoints: `/api/skills/create`, `/api/skills/worker/:workerId`, `/api/skills/:skillId/verify`
- Status: LOCKED (comes Q2 2026)

**Quality Assurance System**
- Database table: `workQualityAssurance`
- Photo/video evidence submission
- Verification & dispute workflows
- API endpoints: `/api/qa/submit`, `/api/qa/assignment/:assignmentId`, `/api/qa/:qaId/approve`
- Status: LOCKED (comes Q2 2026)

**Instant/Daily Pay** (Stripe Connect Ready)
- Database table: `instantPayRequests`
- 2.5% processing fee structure
- Payout status tracking
- API endpoints: `/api/instant-pay/request`, `/api/instant-pay/:requestId`, `/api/instant-pay/worker/:workerId`
- Status: LOCKED (comes Q2 2026)

**Frontend Pages:**
- `/roadmap` - V2 Feature roadmap with Q2/Q3 2026 timeline
- `/payment-plans` - Pricing tiers with Stripe integration callouts

**Backend Integration Complete:**
- 5 new database tables created
- 25+ new storage methods implemented
- 20+ new API routes wired
- All endpoints wired to PostgreSQL database
- Real storage layer implemented (not mock data)
- Feature flags ready for admin controls

**All Dashboards Integrated:**
- **Worker Portal**: Quick-access buttons for Bonuses, Shifts, Availability, Referrals
- **Admin Panel**: Worker Availability Management tab with heatmaps
- **Developer Panel**: Full API testing access

**API Endpoints Production-Ready:**
- Equipment: `GET /api/equipment/inventory`, `POST /api/equipment/assign`
- GPS: `GET /api/clock-in/active`, `POST /api/clock-in/submit`
- Payroll: `POST /api/payroll/process`, `GET /verify/:hallmarkId`
- Bonuses: `GET /api/bonuses/worker/:workerId`, `POST /api/bonuses/calculate`
- Availability: `GET /api/availability/:workerId`, `PUT /api/availability/:availabilityId`
- Feature Flags: `GET /api/feature-flags`, `POST /api/feature-flags/toggle`
- SMS: `POST /api/sms/send`, `GET /api/sms/pending` (ready for Twilio API key)
- Skills: `POST /api/skills/create`, `GET /api/skills/worker/:workerId`
- QA: `POST /api/qa/submit`, `POST /api/qa/:qaId/approve`
- Instant Pay: `POST /api/instant-pay/request` (ready for Stripe Connect)

**Next Steps:**
✅ UI/UX complete with all features
✅ Backend fully integrated with database
✅ V2 features architecture in place (locked until Q2 2026)
✅ Production database schema aligned
✅ Error handling implemented
✅ All routes tested and working
✅ Roadmap & Payment Plans pages published
⏳ Q2 2026: Enable feature flags + integrate Twilio for SMS
⏳ Q2 2026: Integrate Stripe Connect for Instant Pay
⏳ Q3 2026: Enable AI Job Matching & Predictive Analytics

**Ready for Sidonie Deployment:**
Deploy to orbitstaffing.net domain - all systems verified operational
