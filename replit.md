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

## Last Session Summary (December 3, 2025)

### Current Version: v2.5.2 (Published)

### What Was Accomplished
1. **Desktop Layout Fix** - All multi-card sections now use `sm:grid` pattern to fill full width with zero white space on desktop
2. **Pricing Card Alignment** - Buttons now align horizontally using flexbox with `h-full` cards and `flex-1` features
3. **Orby Hallmark Redesign** - Mascot now presents the certificate in a side-by-side layout instead of covering it
4. **Custom Orby Mascot** - Generated new mascot image with correct arm positioning (left up, right down) and transparent background using rembg
5. **Slower Animations** - All bounce animations slowed to 6s for smoother, more elegant floating effect (hallmark Orby, AI chat Orby, weather button)
6. **Weather Button Enhancement** - Temperature now displays integrated into the weather emoji button with localStorage persistence
7. **Visual Alignment** - Weather button and Orby AI chat now sit on the same baseline (bottom-left and bottom-right)

### Design Patterns Established
- **Responsive sections:** `flex flex-row flex-nowrap ... sm:grid sm:grid-cols-N sm:overflow-visible`
- **Card pattern:** `flex-shrink-0 w-[XXpx] sm:w-auto snap-start` for grid expansion on desktop
- **Pricing cards:** `h-full flex flex-col` with `flex-1` on features to align buttons
- **Float animations:** 6s duration for smooth, elegant movement

### Key Files Modified
- `client/src/pages/Landing.tsx` - Desktop grid layouts
- `client/src/components/FloatingWeatherButton.tsx` - Temperature display, positioning
- `client/src/components/OrbitChatAssistant.tsx` - Animation timing, positioning
- `client/src/components/OrbyHallmark.tsx` - Side-by-side layout redesign
- `client/src/components/DarkwaveFooter.tsx` - Version stamp
- `client/src/components/FeatureInventory.tsx` - Publish log entry

### Protocol Reminder
- Always confirm before starting implementation - user must approve with "go"
- EVERY multi-card section must be horizontal scroll carousel on mobile
- Desktop layouts must fill full width with zero white space
- Keep text-heavy accordions/dropdowns as-is - only convert multi-card sections