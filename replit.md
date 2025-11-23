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