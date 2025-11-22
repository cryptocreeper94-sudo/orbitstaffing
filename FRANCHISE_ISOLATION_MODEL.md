# ORBIT Franchise/License Isolation Model

**Date:** November 22, 2025  
**Purpose:** Define how franchised systems are completely separated from ORBIT's main platform

---

## Core Principle

**"Complete Isolation"** - Each franchisee/licensee gets their own completely separate ORBIT instance. They do NOT share databases, servers, or systems with ORBIT or other franchisees.

**What they get:**
- ✅ White-labeled ORBIT (their branding, their domain)
- ✅ Separate database (their data only)
- ✅ Separate servers/infrastructure (their instance)
- ✅ Separate admin panel (their management)
- ✅ Separate CRM (their contacts/clients/workers)

**What they DON'T get:**
- ❌ Access to ORBIT's data
- ❌ Access to other franchisee's data
- ❌ Shared infrastructure
- ❌ Tied to ORBIT in any operational way

---

## Architecture Diagram

```
ORBIT Main System (orbitstaffing.net)
├── Database (ORBIT data)
├── Admin Dashboard
├── Licensing Manager
└── Support/Billing

---FRANCHISE BOUNDARY---

Franchisee #1 (Superior Staffing - superirostaffing.com)
├── Separate Database (Mike's data only)
├── Separate Servers
├── White-labeled Interface
├── Their Own Admin Panel
├── Their Own CRM
└── Support from ORBIT (as part of warranty)

---FRANCHISE BOUNDARY---

Franchisee #2 (Another Agency - theiragency.com)
├── Separate Database
├── Separate Servers
├── White-labeled Interface
├── Their Own Admin Panel
├── Their Own CRM
└── Support from ORBIT (as part of warranty)

---FRANCHISE BOUNDARY---

iOS App Users (Individual Workers)
├── Connect to either ORBIT or Franchisee APIs
├── Separate authentication per instance
└── No cross-instance data access
```

---

## Data Architecture

### ORBIT's Main System
```
Database: orbitstaffing_prod
├── Users (ORBIT staff + admin)
├── Companies (franchisees - billing info only)
├── Licenses (track what they paid for)
├── Payments (billing history)
├── Feature Requests (from all franchisees)
└── iOS Interest List (for app store notification)

NO WORKER/CLIENT/JOB DATA HERE - That belongs to franchisees
```

### Franchisee Instance (e.g., Superior Staffing)
```
Database: superior_staffing_prod (completely separate)
├── Users (Mike's staff + admins)
├── Workers (Mike's workers only)
├── Clients (Mike's clients only)
├── Jobs (Mike's jobs only)
├── Assignments (Mike's assignments only)
├── Timesheets (Mike's timesheets only)
├── Payroll (Mike's payroll only)
├── Invoices (Mike's invoices only)
├── CRM (Mike's customer relationships)
└── Everything else (Mike's data)

COMPLETELY ISOLATED - Can't access ORBIT data or other franchisees
```

---

## Deployment Model

### ORBIT Main System
- **Domain:** orbitstaffing.net
- **Database:** Hosted on Replit + Neon (or equivalent)
- **Purpose:** Licensing, billing, support, admin functions
- **No customer data here**

### Each Franchisee Gets:
- **Custom domain:** e.g., superiostaffing.com (or their domain)
- **Separate deployment:** Separate Replit instance or similar
- **Separate database:** Their own Neon instance
- **Separate codebase:** Same codebase, different configuration
- **No connection to ORBIT except API calls for:**
  - License verification (is their license valid?)
  - Feature request submissions
  - Support ticket creation
  - Usage analytics (optional)

---

## How Franchisees Are Created

### Step 1: ORBIT Creates License
```
Jason creates license in ORBIT system:
- Company: "Superior Staffing"
- Owner: Mike
- License Type: "Franchise"
- Fee: $19,000 (one-time)
- Tier: "Startup" (50 workers, 5 clients)
- Support Period: 12 months
- Status: "Active"
```

### Step 2: ORBIT Deploys Separate Instance
```
For each franchisee, ORBIT deploys:
1. New Replit project (separate from main)
2. New Neon PostgreSQL database
3. Custom domain configuration
4. Branded UI (their logo, colors)
5. Custom API endpoints
6. Separate admin panel
7. Their own worker app (iOS/Android)
```

### Step 3: Franchisee Gets Admin Credentials
```
Mike receives:
- Admin username/password
- API keys for his instance
- Documentation for his system
- Support contact info
- License verification info
```

### Step 4: Mike Manages Completely Independently
```
Mike's admin can now:
✅ Create workers in his system (not ORBIT's)
✅ Create clients in his system (not ORBIT's)
✅ Create jobs in his system (not ORBIT's)
✅ View his payroll (not ORBIT's)
✅ View his invoices (not ORBIT's)
✅ Manage his CRM (not ORBIT's)
✅ Control his own settings
✅ Request features from ORBIT (separate channel)
❌ Cannot see ORBIT data
❌ Cannot see other franchisees' data
❌ Cannot access ORBIT admin functions
```

---

## CRM Separation

### ORBIT's CRM (orbitstaffing.net)
```
ORBIT contacts (for licensing, support, etc.):
- Companies (franchisees)
- Support requests
- Feature requests
- Billing info
```

### Each Franchisee's CRM (their own system)
```
Superior Staffing's CRM:
- Workers (hundreds of them)
- Clients (their clients)
- Jobs
- Communication history
- Custom notes
- Everything Mike needs to run his business

This is MIKE'S DATA, completely separate from ORBIT
```

---

## License Verification

**How franchisees stay connected to ORBIT (but isolated):**

```typescript
// In franchisee's system, on app startup:
1. Check local license file (cached)
2. If offline: Use cached license, continue
3. If online: Call ORBIT's license verification API

ORBIT API endpoint: POST /api/licenses/verify
Request: { licenseeId, timestamp }
Response: {
  valid: true,
  expiresAt: "2025-11-22",
  tier: "startup",
  features: [...]
}

If license invalid:
- Show warning to franchisee admin
- Allow current operations to complete
- No new operations until license renewed
```

**Key:** License verification is read-only. Franchisee can't change it.

---

## Support Model

### Year 1 - Warranty Period
```
Mike purchased 12-month warranty ($19k includes this)

Mike can request features via:
/feature-requests on his ORBIT installation

Jason reviews Mike's requests:
1. Prioritize by revenue impact
2. Implement features in Mike's codebase
3. Deploy to Mike's instance
4. Notify Mike of completion

This is normal support - not special. Mike's instance gets
updated independently.
```

### After Year 1
```
License continues in force (perpetual)
Mike can optionally buy:
- Extended support ($X per month)
- Custom development ($X per hour)
- Annual upgrades ($X per year)

Or he can run it independently with no support from ORBIT
```

---

## Worker App - Multi-Instance

### Workers Download App From Different Stores
```
Android Play Store:
- ORBIT app (for ORBIT workers)
- Superior Staffing app (for Mike's workers)
- Other franchisee apps (for their workers)

Each is a DIFFERENT APP with different:
- Bundle ID
- App name
- Branding
- API endpoint
- Support contact
```

### At Login, App Knows Which Instance
```
User opens "Superior Staffing" app
App tries: api.superiostaffing.com/auth/login

System checks:
1. Is email in Mike's worker database?
2. Is password correct?
3. Issue JWT token
4. All API calls go to Mike's instance

User never connects to ORBIT's systems
```

---

## Data Flow Diagram

```
Mike's Worker → Superior Staffing App → superiostaffing.com/api
                                             ↓
                                    Superior Staffing Database
                                    (Completely separate from ORBIT)

ORBIT User → ORBIT App → orbitstaffing.net/api
                              ↓
                        ORBIT Main Database
                        (No worker/client/job data)

ORBIT to Superior Staffing:
Only communication point is license verification API
(Read-only, happens once per day)
```

---

## Comparison: Old Model vs. New Model

### OLD (Wrong - Don't Do This)
```
All franchisees in same database:
- Worker 1 (ORBIT) could see Worker 2 (Mike)
- Mike could see ORBIT's data
- ORBIT and Mike share tables
= SECURITY RISK, DATA LEAK RISK
```

### NEW (Correct - What We're Building)
```
Each franchisee has separate database:
- Worker 1 (ORBIT) ≠ Worker 2 (Mike)
- Mike's database doesn't contain ORBIT data
- No shared tables
= SECURE, ISOLATED, COMPLIANT
```

---

## Implementation Checklist

### For ORBIT to Launch Franchisee
1. [ ] Create separate Replit project for franchisee
2. [ ] Set up separate Neon database
3. [ ] Configure custom domain
4. [ ] Set up branded UI (logo, colors)
5. [ ] Generate admin credentials
6. [ ] Create license record in ORBIT DB
7. [ ] Send franchisee documentation
8. [ ] Test license verification API
9. [ ] Set up support ticket system
10. [ ] Document onboarding steps

### For Franchisee to Go Live
1. [ ] Log into admin panel
2. [ ] Create first workers
3. [ ] Create first clients
4. [ ] Create first jobs
5. [ ] Add team members as admins
6. [ ] Configure company settings
7. [ ] Test worker app login
8. [ ] Train team on system
9. [ ] Go live with first assignment

---

## Security Considerations

### What Franchisees CAN'T DO
- ❌ Access ORBIT's main database
- ❌ Access other franchisee databases
- ❌ Modify license terms
- ❌ Download ORBIT's codebase
- ❌ Access ORBIT's admin functions
- ❌ See other franchisee data

### What ORBIT CAN'T DO
- ❌ Access franchisee's worker data without permission
- ❌ Modify franchisee's settings without permission
- ❌ Shut down franchisee without notice
- ❌ Share franchisee data with other franchisees
- ❌ Access franchisee's CRM or business data

---

## Example: Mike's Workflow

```
YEAR 1 - Warranty Period ($19k includes this)

1. Mike receives admin login
2. Mike logs into: superiostaffing.com/admin
3. Mike creates 30 workers
4. Mike creates 5 clients
5. Mike requests feature: "Auto-sync to QuickBooks"
6. Jason implements in Mike's instance
7. Feature deployed to superiostaffing.com
8. Mike's system auto-syncs to QB
9. Mike's accountant is happy
10. Mike continues operations for 12 months

YEAR 2+

Mike continues to run the system
- No recurring fees
- No connection to ORBIT (except optional support)
- His domain, his brand, his data
- Completely independent

If Mike wants new features:
- Pay ORBIT for custom development
- Or hire own developer
- Or use built-in feature request system
```

---

## Conclusion

**The isolation model solves:**
✅ Security concerns (data isn't exposed)
✅ Privacy concerns (ORBIT can't see business data)
✅ Independence concerns (franchise operates autonomously)
✅ Scalability concerns (each instance can grow independently)
✅ Compliance concerns (data residency, GDPR, etc.)
✅ Future concerns (franchisee can replace ORBIT if needed)

**Result:** Mike gets a world-class staffing platform that's completely his own after warranty period. ORBIT gets a sustainable model where franchisees don't feel locked in.

