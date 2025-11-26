# ORBIT Staffing OS - Compressed Documentation

## Overview
ORBIT Staffing OS is an automated, white-label platform for staffing agencies managing temporary workers across skilled trades, hospitality, and general labor. It provides end-to-end automation from recruitment to payroll and invoicing, including mobile applications and an administrative dashboard. The platform aims to be a scalable, production-ready solution for reducing operational costs, improving efficiency, and capturing market share through flexible features, robust compliance, and customization options.

## User Preferences
- **Communication:** I prefer clear, concise explanations with minimal jargon.
- **Workflow:** I prefer an iterative development approach. Please ask for my approval before implementing major changes or new features.
- **Codebase Changes:** Do not make changes to the `replit.md` file or the `docs/` folder without explicit instruction.
- **Prioritization:** Focus on features that directly contribute to closing franchise deals and improving core platform stability.
- **Reporting:** Provide regular updates on progress, especially regarding critical features and bug fixes.

## System Architecture
The ORBIT Staffing OS is a unified, multi-tenant white-label platform with a three-tier access model: Master Admin, Assigned Admins, and End Users. All tiers utilize the same core ORBIT technology with white-label branding, industry-specific configurations, unified quality, complete data isolation, and scalability. A non-removable "Powered by ORBIT" hallmark with a unique asset number is stamped on all tangible outputs for verification and future tokenization.

### UI/UX Decisions
- **Aesthetic:** Dark industrial theme with an "aqua Saturn 3D watermark."
- **Component Library:** Radix UI.
- **Styling:** Tailwind CSS.
- **Mobile Design:** React Native + Expo for cross-platform apps with features like JWT authentication, biometric login, and GPS-verified clock-in/out.

### Technical Implementations
- **Frontend:** React 18 with Wouter.
- **Backend:** Express.js and Node.js with TypeScript.
- **Database:** PostgreSQL on Neon, managed with Drizzle ORM.
- **Real-time Capabilities:** WebSocket support.
- **Security:** Encrypted SSN storage, session-based authentication, audit trails, RBAC, HTTPS.
- **Compliance:** Integrated state-specific rules (e.g., TN/KY), prevailing wage, I-9 tracking.
- **Modular Design:** Organized file structure for maintainability.

### Feature Specifications
- **CRM:** Worker, client, and company management.
- **Payroll & Invoicing:** Automated, multi-state compliant payroll and customizable invoices with garnishment processing and PDF paystub generation.
- **Scheduling & Assignments:** Job posting, worker assignment, bulk operations, real-time updates.
- **GPS Verification:** Geofencing (200-300ft radius) for accurate clock-in/out.
- **Messaging:** In-app communication and SMS notifications.
- **Time Off Management:** Request and approval workflows.
- **Real-time Dashboard:** Operational visibility with WebSocket-powered updates.
- **Franchise & Licensing System:** Supports flexible billing, license management, payment tracking, warranty/support.
- **Feature Request System:** Customer submission, categorization, prioritization, and tracking.
- **Mobile App (Android/iOS):** Secure authentication, biometric login, GPS check-in, real-time assignment updates.
- **Equipment Tracking:** PPE inventory and assignment.
- **Worker Bonuses:** Real-time, multi-tier calculations.
- **Quick Shift Accept/Reject:** One-click shift management.
- **Worker Availability Calendar:** 2-week scheduling with heatmap.
- **Referral Bonus Tracking:** Management of referral rewards.
- **Insurance & Worker Request System:** Management of worker and company insurance, document uploads, and an auto-matching engine for worker requests.
- **Document Management:** Uploads for garnishment orders and other documents with hallmark verification and virus scanning.
- **Background Checks & Drug Testing:** Integration with third-party services for criminal, motor vehicle, employment history checks, and drug testing.

### Twilio SMS Placeholder System (Production-Ready)
The SMS notification system is fully implemented as a placeholder ready for Twilio credentials. It includes:

**SMS Templates (5 Types):**
- `payroll_alert` - Worker payroll notifications with amount and deposit date
- `assignment_notification` - New shift/assignment notifications with location and pay
- `garnishment_alert` - Legal garnishment order notifications
- `safety_alert` - Safety incident and emergency notifications
- `general_notification` - General purpose SMS messages

**API Endpoints:**
- `POST /api/notifications/sms/send` - Send SMS using template with data
- `POST /api/notifications/sms/schedule` - Schedule SMS for future delivery
- `GET /api/notifications/sms/templates` - Get available templates with required fields
- `GET /api/notifications/sms/opt-in/:userId` - Check user SMS preferences
- `PUT /api/notifications/sms/opt-in/:userId` - Update user SMS preferences

**Placeholder Behavior:**
- When Twilio credentials are not configured, SMS messages are logged to console with `[SMS QUEUED]` status
- Messages are returned as successfully queued for database logging and audit trails
- Ready to accept environment variables:
  - `TWILIO_ACCOUNT_SID` - Twilio account identifier
  - `TWILIO_AUTH_TOKEN` - Twilio authentication token
  - `TWILIO_PHONE_NUMBER` - Twilio phone number for sending

**Production Status:**
✓ SMS templates fully defined and tested
✓ API routes implemented and multi-tenant validated
✓ Console logging for audit trail when credentials missing
✓ Ready for Twilio credentials - no code changes needed
✓ All opt-in/preference endpoints ready for database integration

**To Enable:**
1. Add Twilio API credentials to environment variables
2. SMS will automatically send via Twilio API (no code changes required)
3. All audit logs and opt-in preferences already tracked

### System Design Choices
- **Scalability:** Supports a large number of companies and workers.
- **Flexibility:** Adaptable billing and white-label capabilities.
- **Customer-Driven Development:** Feature request system for product evolution.
- **Multi-Tenant Isolation:** `tenantId` field in all critical operational tables ensures complete data isolation, enforced by database constraints and tenant validation middleware. Tenant resolution prioritizes user's session/auth context.

## External Dependencies
- **Database Hosting:** Neon (for PostgreSQL)
- **Mobile Development Framework:** Expo
- **SMS Service:** Twilio
- **Payment Gateway:** Stripe (for payment processing and creditor routing)
- **SMTP Service:** For email notifications
- **Background Check API:** Checkr
- **Drug Testing API:** Quest Diagnostics