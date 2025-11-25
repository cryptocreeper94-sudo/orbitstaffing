# ORBIT Staffing OS - Compressed Documentation

## Overview

ORBIT Staffing OS is an automated, white-label platform for staffing agencies managing temporary workers across skilled trades, hospitality, and general labor. It provides end-to-end automation from recruitment to payroll and invoicing, including mobile applications and an administrative dashboard. The platform aims to be a scalable, production-ready solution for reducing operational costs, improving efficiency, and capturing market share through flexible features, robust compliance, and customization options.

## User Preferences

-   **Communication:** I prefer clear, concise explanations with minimal jargon.
-   **Workflow:** I prefer an iterative development approach. Please ask for my approval before implementing major changes or new features.
-   **Codebase Changes:** Do not make changes to the `replit.md` file or the `docs/` folder without explicit instruction.
-   **Prioritization:** Focus on features that directly contribute to closing franchise deals and improving core platform stability.
-   **Reporting:** Provide regular updates on progress, especially regarding critical features and bug fixes.

## System Architecture

The ORBIT Staffing OS is a unified, multi-tenant white-label platform with a three-tier access model:

**1. Master Admin (System Owner):** Full access to the entire ORBIT ecosystem via a System Control Panel, managing franchises, customers, admins, system health, and global settings.

**2. Assigned Admins (Team Members):** Role-based access via an Admin Panel, with specific responsibilities (e.g., Franchise Admin, Finance Admin) and data isolation per organization.

**3. End Users (Franchisees/Customers):** Access the ORBIT Main App, branded with their company name, providing full ORBIT functionality for their business (worker/client management, scheduling, payroll, mobile apps). They can configure internal admin roles based on industry, size, billing tier, and compliance.

**ORBIT Brand Promise:** All tiers utilize the same core ORBIT technology with white-label branding, industry-specific configurations, unified quality, complete data isolation, and scalability.

**ORBIT Hallmark Asset System:** All franchisee deployments include a non-removable "Powered by ORBIT" button with a unique asset number. This hallmark is stamped on all tangible outputs (invoices, paystubs) and is verifiable, forming a foundation for future tokenization.

### UI/UX Decisions

-   **Aesthetic:** Dark industrial theme with an "aqua Saturn 3D watermark."
-   **Component Library:** Radix UI.
-   **Styling:** Tailwind CSS.
-   **Mobile Design:** React Native + Expo for cross-platform apps with features like JWT authentication, biometric login, and GPS-verified clock-in/out.

### Technical Implementations

-   **Frontend:** React 18 with Wouter.
-   **Backend:** Express.js and Node.js with TypeScript.
-   **Database:** PostgreSQL on Neon, managed with Drizzle ORM.
-   **Real-time Capabilities:** WebSocket support.
-   **Security:** Encrypted SSN storage, session-based authentication, audit trails, RBAC, HTTPS.
-   **Compliance:** Integrated state-specific rules (e.g., TN/KY), prevailing wage, I-9 tracking.
-   **Modular Design:** Organized file structure for maintainability.

### Feature Specifications

-   **CRM:** Worker, client, and company management.
-   **Payroll & Invoicing:** Automated, multi-state compliant payroll and customizable invoices.
-   **Scheduling & Assignments:** Job posting, worker assignment, bulk operations, real-time updates.
-   **GPS Verification:** Geofencing (200-300ft radius) for accurate clock-in/out.
-   **Messaging:** In-app communication.
-   **Time Off Management:** Request and approval workflows.
-   **Real-time Dashboard:** Operational visibility.
-   **Franchise & Licensing System:** Supports flexible billing (monthly, revenue share), license management, payment tracking, warranty/support.
-   **Feature Request System:** Customer submission, categorization, prioritization, and tracking of feature requests.
-   **Mobile App (Android/iOS):** Secure authentication, biometric login, GPS check-in, real-time assignment updates, sandbox/live mode.
-   **Equipment Tracking:** PPE inventory and assignment, auto-deduction for unreturned items.
-   **Worker Bonuses:** Real-time, multi-tier calculations.
-   **Quick Shift Accept/Reject:** One-click shift management.
-   **Worker Availability Calendar:** 2-week scheduling with heatmap.
-   **Referral Bonus Tracking:** Management of referral rewards.
-   **SMS Notifications:** Twilio-ready system for various message types with worker consent.

### System Design Choices

-   **Scalability:** Supports a large number of companies and workers.
-   **Flexibility:** Adaptable billing and white-label capabilities.
-   **Customer-Driven Development:** Feature request system for product evolution.
-   **Multi-Tenant Isolation (Nov 25, 2025):** Added `tenantId` field to all critical operational tables for complete data isolation between ORBIT, franchisees, and white-label customers. Each tenant's data is segregated via database-enforced constraints, NOT payment provider IDs. Tenant validation middleware ensures requests can only access their own data.

### Multi-Tenant Architecture (Nov 25, 2025)

**Implementation Details:**
- Added `tenantId` (NOT `stripeCustomerId`) to all critical tables: workers, clients, jobPostings, assignments, timesheets, payroll, workerBonuses, equipment, invoices, paystubs, incidents, franchiseeTeamCRM
- Added `tenantId` to users table to map users to their tenant (company)
- Database indexes on all tenantId fields for query performance
- Tenant validation middleware in routes.ts: `getTenantIdFromRequest()` and `validateTenantAccess()`

**Why NOT Stripe ID:**
- Stripe IDs should only be used for billing purposes
- Using payment provider IDs for data isolation couples architecture to the payment provider
- If switching payment providers, entire data isolation breaks
- Industry standard is to use a tenant/organization ID independent of payment layer

**Tenant Resolution Priority:**
1. User's tenantId from session/auth context
2. User's companyId from session/auth context (backward compatible)
3. tenantId query parameter
4. Reject with 401 if no tenant context found

**Next Steps:**
- Integrate tenant validation into all API endpoints (started with helper functions)
- Add tenant context to session middleware
- Test data isolation across franchisees

## External Dependencies

-   **Database Hosting:** Neon (for PostgreSQL)
-   **Mobile Development Framework:** Expo
-   **SMS Service:** Twilio (ready for credentials)
-   **Payment Gateway (Planned):** Stripe (API key field present, currently supports bank transfers, checks, invoices)
-   **SMTP Service:** For email notifications