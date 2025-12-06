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

## Last Session Summary (December 5, 2025)

### Current Version: v2.5.9 (Publishing)

### What Was Accomplished
1. **PWA (Progressive Web App) Complete Setup**
   - Full-color Orby mascot as home screen icon (waving pose on dark slate background)
   - Splash screen with Orby (presenting pose) and "Welcome back! Let's get to work." message
   - Automatic install prompt appears after 2 seconds on first visit
   - iOS-specific instructions for manual Add to Home Screen
   - Service worker for offline caching
   - 7-day dismissal cooldown for install prompt

2. **DarkWave Studios Product Gallery - Complete with Emblems & Hallmarks**
   - ORBIT Staffing OS: Emblem ✓ + Hallmark ✓
   - Orby (getorby.io): Emblem ✓ + Hallmark ✓
   - DarkWave Pulse: Pending (emblem + hallmark)
   - Lot Ops Pro: Emblem ✓ + Hallmark ✓
   - Brew & Board Coffee: Emblem ✓ (bg-removed, amber-tinted) + Hallmark ✓
   - GarageBot: Emblem ✓ (bg-removed) + Hallmark ✓

3. **Business Intelligence Dashboard** - Completed with real-time valuation tracking ($2M-$8M pre-revenue range)

### PWA Technical Implementation
- **Manifest:** `client/public/manifest.json` - App metadata, icons (192px, 512px, maskable variants)
- **Service Worker:** `client/public/sw.js` - Offline caching with network-first strategy
- **Icons:** `client/public/pwa/` - Orby icons with solid dark slate background (no transparency)
- **Install Prompt:** `client/src/components/PWAInstallPrompt.tsx` - Auto-shows on first visit
- **Splash Screen:** `client/src/components/PWASplashScreen.tsx` - Shows in standalone mode
- **Apple Touch Icons:** Added to `client/index.html` for iOS home screen

### Key Files Modified
- `client/index.html` - Manifest link, apple-touch-icons, service worker registration
- `client/src/App.tsx` - Added PWAInstallPrompt and PWASplashScreen components
- `client/src/pages/ProductsGallery.tsx` - Added GarageBot product

### DarkWave Studios Products
| Product | Emblem | Hallmark | URL |
|---------|--------|----------|-----|
| ORBIT Staffing OS | ✓ | ✓ | orbitstaffing.io |
| Orby | ✓ | Pending | - |
| DarkWave Pulse | ✗ | ✗ | - |
| Lot Ops Pro | ✓ | ✓ | lotops.pro |
| Brew & Board Coffee | ✗ | ✗ | brewandboard.coffee |
| GarageBot | ✓ | Pending | garagebot.io |

### Design Patterns Established
- **Arrow button navigation:** Rounded circular buttons (w-10 h-10) positioned absolutely on carousel sides
- **Mobile carousel wrapper:** `relative` div containing absolute-positioned arrow buttons
- **Scroll function:** `scrollCarousel(ref, 'left'|'right')` with 300-340px scroll amount and smooth behavior
- **Responsive sections:** `flex flex-row flex-nowrap ... sm:grid sm:grid-cols-N sm:overflow-visible`
- **Card pattern:** `flex-shrink-0 w-[XXpx] sm:w-auto snap-start` for grid expansion on desktop
- **PWA Install Prompt:** Bottom slide-in card with Orby icon, dismiss stores timestamp in localStorage

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