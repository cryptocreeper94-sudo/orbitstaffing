# ORBIT Staffing OS - Development Documentation

## Project Overview

**ORBIT Staffing OS** - Fully automated staffing agency platform serving temporary workers across skilled trades, hospitality, and general labor. Built as a standalone, potentially sellable product with white-label franchise capabilities.

**Builder:** Jason (DarkWave Studios LLC)  
**Domain:** orbitstaffing.net  
**Status:** Production-Ready with Active Development

---

## Current Architecture

### Technology Stack
- **Frontend:** React 18 + Wouter routing + Radix UI components
- **Backend:** Express.js + Node.js
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Styling:** Tailwind CSS + custom dark industrial theme
- **Real-time:** WebSocket support for messaging
- **Security:** Encrypted SSN storage, GPS verification, audit trails

### Database (13 Tables)
1. `users` - Authentication & roles
2. `companies` - Business accounts (with flexible billing)
3. `workers` - Temp worker profiles
4. `clients` - Client companies
5. `jobs` - Job postings
6. `assignments` - Worker-to-job assignments
7. `timesheets` - Hour tracking
8. `payroll` - Payment processing
9. `invoices` - Client billing
10. `messages` - Internal messaging
11. `timeOffRequests` - PTO management
12. `stateCompliance` - TN/KY compliance rules (seeded)
13. `billingHistory` - Billing model changes (NEW)

---

## Recent Changes (November 22, 2025)

### ✅ Flexible Billing System (COMPLETE)
**Game Changer Feature:** Two pricing models with free switching every 6 months

**Added to Companies table:**
- `billingModel`: "fixed" or "revenue_share"
- `billingTier`: "startup", "growth", "enterprise"
- `revenueSharePercentage`: 2.0% (default)
- `monthlyBillingAmount`: Calculated based on tier
- `lastBillingModelChange`: Tracks last switch
- `nextBillingModelChangeAvailable`: 6-month window
- `billingModelChangeCount`: Counter for tracking

**New Tables:**
- `billingHistory`: Audit trail of all billing changes

**New UI Page:** `/billing` - Billing Settings
- Current plan display
- Model selection (Monthly vs Revenue Share)
- Tier comparison cards
- Clear switch rules & fees
- Confirmation modal with pricing

**API Endpoints:**
- `POST /api/billing/change-model` - Change billing model
- `GET /api/billing/history` - Get billing history

**Pricing Tiers:**
| Tier | Monthly | Workers | Features |
|------|---------|---------|----------|
| Startup | $199 | 50 | Basic payroll, 5 clients |
| Growth | $599 | 500 | Full automation, unlimited clients |
| Enterprise | Custom | 1000+ | White-label, API, dedicated support |

**Revenue Share:** 2% of monthly placement billing (scales with success)

**Switching Policy:**
- Free switch every 6 months
- $299 for extra switches
- Complete audit trail

---

## User Preferences & Context

**From Jason's Background:**
- Worked at Superior Staffing (60% markup model = 1.6x revenue)
- Knows staffing compliance inside-out
- Security/encryption is non-negotiable (SSN handling)
- Interested in white-label/franchise model
- Wants feature parity with manual operations

**Key Business Insights:**
- $99/month was unsustainable for volume agencies
- 2% revenue share aligns incentives
- Event coordination (Nissan Stadium = 250-300 workers) is real use case
- Flexible billing gives agencies control (competitive advantage)

---

## Feature Roadmap

### ✅ Completed
1. Full-stack infrastructure (auth, database, API)
2. GPS geofencing (200-300ft radius)
3. State compliance automation (TN/KY seeded)
4. Complete payroll system
5. Invoice generation
6. **Flexible billing system** (NEW)

### 🔄 In Progress / Next
1. **Event Coordination** - Bulk staffing for large events (250-300 workers)
   - Event creation & management
   - Bulk worker assignment
   - Real-time roster tracking
   - Event-specific payroll
2. Event scheduling & calendar
3. Client event management (recurring bookings)
4. Advanced reporting & analytics

### 🚀 Future
1. Accounting integrations (QuickBooks, Xero)
2. Automated invoicing
3. Predictive cost analysis
4. Mobile app for workers
5. API marketplace

---

## Design System

### Aesthetic
- **Dark Industrial Theme** - Matches staffing/labor industry
- **Aqua Accent Color** - Saturn 3D watermark (centered, fixed background)
- **3D Effects** - Perspective transforms, drop shadows, glows
- **Responsive Design** - Mobile-first, works on all devices

### Components
- Using Radix UI for accessible base components
- Custom Tailwind styling throughout
- Consistent spacing & typography
- Data-testid attributes on all interactive elements

---

## Security Priorities

✅ **Implemented:**
- Encrypted SSN storage (never plain text)
- No email sharing between platforms
- GPS verification for worker check-in
- Audit trails for all changes
- Session-based authentication
- Password hashing (bcrypt)

🔒 **Architecture:**
- Secrets managed via Replit environment variables
- Database credentials in .env
- No sensitive data in logs
- Role-based access control

---

## File Structure

```
project/
├── shared/
│   └── schema.ts           # Drizzle schema (13 tables + billing)
├── server/
│   ├── index-dev.ts        # Dev server entry
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Storage interface & implementation
│   └── routes.ts          # API endpoints (25+)
├── client/
│   ├── src/
│   │   ├── App.tsx        # Main router
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── Configuration.tsx
│   │   │   ├── BillingSettings.tsx  (NEW)
│   │   │   ├── BusinessConfig.tsx
│   │   │   └── ... (10+ pages)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── ui/         # Radix UI components
│   │   │   └── ... (custom components)
│   │   └── index.css       # Tailwind + custom styles
│   └── index.html          # Meta tags
└── docs/
    ├── BILLING_SYSTEM.md   (NEW)
    ├── DATABASE_SCHEMA.md
    └── TN_KY_COMPLIANCE_DATA.md
```

---

## Key Decisions

### Pricing Model
- Rejected $99/month for scale - unsustainable
- Adopted flexible model: Monthly + Revenue Share
- Free switch every 6 months builds trust
- $299 switch fee prevents abuse

### Event Coordination Approach
- Separate feature from regular assignments
- Bulk operations for 250-300 worker events
- Event-specific pricing/rates
- Real-time roster management

### Database Design
- UUID primary keys (not serial)
- Timestamps for all changes
- Foreign keys for relationships
- Indexes on frequently queried columns

### Frontend Routing
- Wouter (lightweight alternative to React Router)
- File-based pages in `/pages`
- Simple navigation structure
- Each page is self-contained component

---

## Testing

**Current Testing:**
- Manual testing via UI
- API endpoint testing with curl
- Browser console for errors
- Server logs for backend issues

**Recommended Next:**
- Unit tests for storage layer
- Integration tests for API
- E2E tests for critical flows

---

## Deployment

**Current:** Development server running `npm run dev`

**Ready for:** 
- Publishing to Replit (one-click deployment)
- Custom domain setup (orbitstaffing.net)
- Production database (Neon PostgreSQL)

**Build Command:** `npm run build`  
**Start Command:** `NODE_ENV=production npm run start`

---

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run db:push            # Sync schema to database
npm run db:studio          # Open Drizzle Studio

# Build & Deploy
npm run build              # Build production
npm run start              # Start production server

# Database
npm run db:push --force    # Force schema push (if needed)
```

---

## Notes for Next Session

- GPS geofencing is fully implemented (worker app uses it)
- State compliance data seeded for TN & KY
- Billing system ready for testing
- Event coordination feature is next priority
- Consider automated invoicing integration after events

---

## Contact & Support

Built by: Jason (DarkWave Studios LLC)  
Project: ORBIT Staffing OS  
Domain: orbitstaffing.net  
Status: Active Development → Production Ready
