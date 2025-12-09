# ORBIT Staffing OS

## Overview
ORBIT Staffing OS is an automated, white-label platform designed for staffing agencies managing temporary workers across various sectors like skilled trades, hospitality, and general labor. It offers end-to-end automation from recruitment to payroll and invoicing, featuring mobile applications and an administrative dashboard. The platform aims to be a scalable, production-ready solution to reduce operational costs, enhance efficiency, and capture market share through flexible features, robust compliance, and extensive customization options.

## User Preferences
- **Communication:** I prefer clear, concise explanations with minimal jargon.
- **Workflow:** I prefer an iterative development approach. Please ask for my approval before implementing major changes or new features.
- **Codebase Changes:** Do not make changes to the `replit.md` file or the `docs/` folder without explicit instruction.
- **Prioritization:** Focus on features that directly contribute to closing franchise deals and improving core platform stability.
- **Reporting:** Provide regular updates on progress, especially regarding critical features and bug fixes.

## System Architecture
The ORBIT Staffing OS is a unified, multi-tenant white-label platform with a three-tier access model: Master Admin, Assigned Admins, and End Users. It utilizes a core ORBIT technology with white-label branding, industry-specific configurations, unified quality, complete data isolation, and scalability. All tangible outputs are stamped with a non-removable "Powered by ORBIT" hallmark for verification.

### UI/UX Decisions
- **Aesthetic:** Dark industrial theme with an "aqua Saturn 3D watermark."
- **Component Library:** Radix UI.
- **Styling:** Tailwind CSS.
- **Mobile Design:** React Native + Expo for cross-platform applications with JWT authentication, biometric login, and GPS-verified clock-in/out.

### Technical Implementations
- **Frontend:** React 18 with Wouter.
- **Backend:** Express.js and Node.js with TypeScript.
- **Database:** PostgreSQL on Neon, managed with Drizzle ORM.
- **Real-time Capabilities:** WebSocket support.
- **Security:** Encrypted SSN storage, session-based authentication, audit trails, RBAC, HTTPS.
- **Compliance:** Integrated state-specific rules (e.g., TN/KY), prevailing wage, I-9 tracking.
- **Modular Design:** Organized file structure for maintainability.
- **AI Mascot System:** "Orbit" (cyan Saturn character) provides AI-powered guidance, welcome popups, and a floating chat assistant with keyword responses for various categories (payroll, workers, compliance, jobs, pricing).

### System Design Choices
- **Scalability:** Designed to support a large number of companies and workers.
- **Flexibility:** Adaptable billing and white-label capabilities.
- **Customer-Driven Development:** Incorporates a feature request system.
- **Multi-Tenant Isolation:** Enforced via `tenantId` in critical tables, database constraints, and tenant validation middleware.

### ORBIT Pay Card (Coming Soon)
Branded Visa debit card for workers to receive instant pay, powered by Stripe Issuing.
- **Status:** UI complete, waitlist active, awaiting Stripe Issuing approval
- **Features:** Instant pay access, no fees, mobile wallet integration, 55k+ free ATMs, cashback rewards
- **Database:** `pay_card_waitlist`, `pay_card_applications`, `worker_payment_preferences`
- **API:** Public waitlist signup, admin-only preferences management

## External Dependencies
- **Database Hosting:** Neon (for PostgreSQL)
- **Mobile Development Framework:** Expo
- **SMS Service:** Twilio (placeholder, awaiting credentials)
- **Payment Gateway:** Stripe (for payment processing, creditor routing, and ORBIT Pay Card system)
- **Background Check API:** Checkr (awaiting credentials)
- **Drug Testing API:** Quest Diagnostics
- **SMTP Service:** For email notifications (awaiting credentials)
- **OAuth Integrations (Awaiting Credentials):** QuickBooks, Xero, Indeed, LinkedIn, ZipRecruiter

---

## Last Session Summary (December 7, 2025)

### Current Version: v2.7.0 (Ready for Publishing)

### What Was Accomplished
1. **DarkWave Ecosystem Hub - COMPLETE ✅**
   - POST /api/admin/ecosystem/register-app - app registration endpoint
   - GET /api/ecosystem/status - connection status
   - POST /api/ecosystem/sync/* - workers, contractors, W-2, 1099, timesheets, certifications
   - GET /api/ecosystem/shops/* - worker and payroll queries
   - POST/GET /api/ecosystem/snippets - code snippet sharing
   - POST/GET /api/ecosystem/logs - activity logging
   - HMAC-SHA256 authentication on all endpoints

2. **GarageBot Integration - CONNECTED ✅**
   - GarageBot app registered: `dw_app_3c88bda688e781b58b2b46144bf6006a49add5c28eed327e`
   - EcosystemClient class provided for external agents
   - Full endpoint matrix ready for syncing operations
   - Cross-product data exchange activated (workers, contractors, payroll data)

3. **API Route Fixes**
   - Fixed SPA catch-all middleware to skip /api/* routes
   - Vite middleware now passes API requests to Express handlers
   - All 13+ ecosystem endpoints responding with JSON

4. **Solana Blockchain Stamps (December 7, 2025)**
   - ORBIT Staffing OS v2.7.0: Hash `55e9cc3f6404342bcad7739df4e0723ef49dfdad30f21a0ac2ecdf1fe37e7cdf`
   - Previous v2.6.1: Hash `ea7987aeae03ddd1d21c20e4931b7abbbf0ba1bc7b847f8494d0cd4a6c5a80dd`

5. **Previous Session (Dec 5) - PWA Complete**
   - Full-color Orby mascot as home screen icon
   - Splash screen with Orby presenting pose
   - Automatic install prompt with 7-day cooldown
   - Service worker for offline caching

### DarkWave Ecosystem Integration Status
| App | Integration | Status | API Key |
|-----|-------------|--------|---------|
| ORBIT Staffing OS | Developer Hub | ✅ Live | dw_app_orbit |
| Brew & Board Coffee | Connected | ✅ Active | dw_app_brewandboard |
| GarageBot | Connected | ✅ Active | dw_app_3c88bda... |
| Lot Ops Pro | Ready | Pending | - |
| DarkWave Pulse | Ready | Pending | - |
| Orby | Ready | Pending | - |

### DarkWave Studios Products
| Product | Emblem | Hallmark | URL | Hub Status |
|---------|--------|----------|-----|-----------|
| ORBIT Staffing OS | ✓ (Orby mascot) | ✓ (auto QR) | orbitstaffing.io | ✅ Hub Live |
| Orby | ✓ | ✓ | getorby.io | Pending |
| DarkWave Pulse | ✓ | ✓ | - | Pending |
| Lot Ops Pro | ✓ | ✓ | lotopspro.io | Pending |
| Brew & Board Coffee | ✓ | ✓ | brewandboard.coffee | ✅ Connected |
| GarageBot | ✓ | ✓ | garagebot.io | ✅ Connected |

### Key Files
- `client/src/pages/ProductsGallery.tsx` - Full-screen product cards with carousel navigation
- `client/src/components/DarkwaveFooter.tsx` - Minimal footer with `minimal={true}` prop
- `client/src/components/DarkWaveAssistant.tsx` - Soundwave AI button
- `client/src/App.tsx` - Domain redirect logic for darkwavestudios.io → /studio

### Franchise System Architecture
- **Two-tier ownership model:**
  - `subscriber_managed` - ORBIT controls hallmark, customer pays monthly SaaS
  - `franchise_owned` - Customer owns hallmark, pays one-time franchise fee + monthly royalties
- **Franchise tiers:** Standard (city), Premium (regional), Enterprise (state-level with sub-franchise rights)
- **Territory checking:** `/api/franchise-territory-availability` validates exclusive territory before application
- **Email notifications:** Application received, approved (with Stripe checkout link), rejected (with reason)
- **Payment flow:** Stripe checkout for franchise fee + recurring monthly support subscription

### User Access Structure
- **Jason (0424):** Developer, full access to everything
- **Sid (4444):** Partner, full sandbox access (can interact, nothing saves to production)
- **Future:** Admin roles will be created for salespeople

### Protocol Reminder
- Always confirm before starting implementation - user must approve with "go"
- EVERY multi-card section must be horizontal scroll carousel on mobile
- Desktop layouts must fill full width with zero white space
- Keep text-heavy accordions/dropdowns as-is - only convert multi-card sections
- Arrow navigation buttons must be hidden on desktop breakpoints (sm:hidden or md:hidden)