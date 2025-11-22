# ORBIT Staffing OS - Data Migration & Integration Strategy

**Date:** November 22, 2025  
**Subject:** Connecting Existing Systems (QuickBooks, ADP, UKG Pro) Without Conflict

---

## 1. THE OPPORTUNITY

**Jason's Question:** "Can we transfer their current file system into our system? Connect QuickBooks here, ADP here, UKG Pro, and it'll populate the database we need?"

**Answer:** YES. ORBIT becomes the **consolidation hub** for all their staffing data.

### Why This Works:
- Existing clients have data scattered across multiple systems
- QuickBooks tracks payments
- ADP tracks workers & payroll
- UKG Pro tracks scheduling
- ORBIT aggregates all of it into ONE place
- Zero data loss—all their systems stay running, we just sync the data

---

## 2. ARCHITECTURE OVERVIEW

### **Data Flow:**

```
Client's Systems          ORBIT Integration         ORBIT Database
─────────────────         ──────────────────        ──────────────

QuickBooks       ─┐
  ↓                ├──→ ORBIT API Connectors  ──→ Consolidated
ADP             ─┤     • OAuth 2.0             → Worker Data
  ↓               ├──→ • API Keys              → Payroll Data
UKG Pro         ─┤     • Data Transformation  → Invoices
  ↓               └──→ • Field Mapping         → Schedules
Paylocity          • Error Handling
(and more...)
```

### **Non-Conflicting Reference Numbers:**

Instead of replacing their reference numbers, we **store both**:

```typescript
// In ORBIT Database:
Job {
  id: "job-uuid-12345",                    // ORBIT's internal ID
  clientJobReference: "QB-2024-11-22-001", // Their QuickBooks reference
  externalJobId: "jb_abc123xyz",           // Their system's native ID
  title: "Electrician - Nissan Stadium"
}

Assignment {
  id: "asn-uuid-67890",                    // ORBIT's internal ID
  externalAssignmentId: "ADP-TM-2024-11",  // Their ADP reference
  externalClientName: "ABC Construction",  // How they refer to client
  jobId: "job-uuid-12345"
}

Worker {
  id: "wrk-uuid-11111",                    // ORBIT's internal ID
  externalWorkerId: "ADP-EMP-98765",       // Their ADP employee ID
  externalSsn: "encrypted",                // Their SSN if in their system
  firstName: "John",
  lastName: "Smith"
}
```

**Benefits:**
- ✅ All their references preserved
- ✅ Easy to sync back to their system
- ✅ No data loss or confusion
- ✅ Can run alongside their systems indefinitely

---

## 3. SUPPORTED INTEGRATIONS

### **Phase 1: Immediate (Most Common)**

#### **QuickBooks Online**
- **What:** Accounting & invoicing system
- **Sync:** Clients, invoices, payments, expenses
- **Method:** OAuth 2.0 API
- **Data Pulled:**
  - Client list
  - Invoice history
  - Customer billing info
  - Payment transactions
- **Action:**
  - Create ORBIT clients from QB customers
  - Import invoice history
  - Link QB invoice numbers to ORBIT invoices

#### **ADP Workforce Now**
- **What:** Payroll, HR, time tracking
- **Sync:** Workers, pay rates, hours, payroll runs
- **Method:** API Key + OAuth
- **Data Pulled:**
  - Employee list
  - Hourly rates & pay codes
  - Timesheet data
  - Pay history
  - Tax withholdings
- **Action:**
  - Import all employees as workers
  - Sync pay rates
  - Create initial paychecks in ORBIT
  - Track hours worked

#### **UKG Pro (Kronos)**
- **What:** Workforce scheduling & time tracking
- **Sync:** Schedules, worker availability, hours logged
- **Method:** API
- **Data Pulled:**
  - Master schedule
  - Employee availability
  - Time entries
  - Shift patterns
- **Action:**
  - Import existing schedules
  - Populate worker availability
  - Sync historical timesheets
  - Validate against GPS check-ins

#### **Paylocity**
- **What:** Payroll, HR, benefits
- **Sync:** Similar to ADP
- **Method:** API + OAuth

#### **BambooHR**
- **What:** HR management
- **Sync:** Employee records, documents, leave tracking
- **Method:** API

---

### **Phase 2: Extended (Q1 2026)**

- Gusto (payroll)
- OnPay (payroll)
- Namely (HR)
- Slack (notifications)
- Stripe (payments)
- Sagemaker (invoicing)

---

## 4. INTEGRATION SETUP FLOW

### **User Journey:**

```
1. ORBIT Dashboard
   ↓
2. Settings → Integrations
   ↓
3. "Connect QuickBooks"
   ↓
4. Redirects to QB login
   ↓
5. User approves ORBIT access
   ↓
6. OAuth token returned to ORBIT
   ↓
7. ORBIT syncs data
   ↓
8. "QuickBooks connected! Syncing 250 clients..."
   ↓
9. Initial import completes
   ↓
10. Ongoing syncs every 24 hours
```

### **What Happens in Step 7 (Data Sync):**

```
QuickBooks API
    ↓
ORBIT Integration Service
    ↓
Field Mapping (Their format → Our format)
    ↓
Data Transformation
    ↓
Conflict Resolution (Already in ORBIT? Update or skip)
    ↓
Validation (Is data valid?)
    ↓
Database Insert/Update
    ↓
Sync Log Entry
    ↓
Send success/error notification
```

---

## 5. FIELD MAPPING EXAMPLES

### **QuickBooks Customer → ORBIT Client**

```json
{
  "mapping": {
    "Id": "clientId",
    "DisplayName": "clientName",
    "BillAddr.Line1": "address",
    "BillAddr.City": "city",
    "BillAddr.CountrySubDivisionCode": "state",
    "BillAddr.PostalCode": "zipCode",
    "PrimaryPhone.FreeFormNumber": "phone",
    "PrimaryEmailAddr.Address": "email",
    "Active": "isActive"
  }
}
```

### **ADP Employee → ORBIT Worker**

```json
{
  "mapping": {
    "id": "workerId",
    "firstName": "firstName",
    "lastName": "lastName",
    "contact.emailAddress": "email",
    "contact.mobile": "phone",
    "employment.terminationDate": null,
    "workContact.emailAddress": "workEmail",
    "compensation.rate": "hourlyRate",
    "compensation.paycode": "payCode"
  }
}
```

### **UKG Pro Schedule → ORBIT Assignment**

```json
{
  "mapping": {
    "employeeId": "workerId",
    "startDate": "startDate",
    "endDate": "endDate",
    "startTime": "startTime",
    "endTime": "endTime",
    "shiftCode": "jobCategory",
    "locationId": "clientId"
  }
}
```

---

## 6. CONFLICT RESOLUTION

### **When Data Conflicts, ORBIT Decides:**

**Scenario 1: Worker exists in both ADP and ORBIT**
- **In ADP:** John Smith, 98765, $28/hr
- **In ORBIT:** John Smith, already registered

**Resolution:**
- ✅ Check if same person (email/phone match)
- ✅ If yes, update ORBIT with ADP's rates and ID
- ✅ If no, create as new worker (maybe John Smith Jr.)
- ✅ Log: "Updated John Smith (id: wrk-xxx) with ADP rate $28/hr"

**Scenario 2: Invoice exists in both QB and ORBIT**
- **In QB:** Invoice 2024-001, $5,000
- **In ORBIT:** Invoice from same client, same date, $5,000

**Resolution:**
- ✅ Check if same transaction (amount + client + date)
- ✅ If yes, link QB reference number
- ✅ If no, create new invoice
- ✅ Log: "Linked Invoice #2024-001 to ORBIT invoice inv-xyz"

**Scenario 3: New data in external system**
- **In ADP:** New hire started today
- **In ORBIT:** Not yet

**Resolution:**
- ✅ Create new worker in ORBIT
- ✅ Import all their data
- ✅ Link external ID for future syncs

---

## 7. SYNC STRATEGY

### **Initial Import (One-time)**

When first connecting:

1. **Full Sync** - Import ALL historical data
2. **De-duplication** - Remove duplicates
3. **Conflict Resolution** - Resolve any conflicts
4. **Verification** - Admin reviews import
5. **Activation** - Go live with synced data

**Timeline:** 30 minutes to a few hours (depends on data size)

### **Ongoing Syncs (Automated)**

After initial import:

1. **Daily Syncs** - 2 AM every morning
2. **Incremental** - Only pull changed data (faster)
3. **Real-time Webhooks** - Some systems (QB, ADP) can push changes immediately
4. **Conflict Resolution** - Auto-resolve if possible, flag if manual needed

---

## 8. TECHNICAL IMPLEMENTATION

### **Database Schema (Already in shared/schema.ts)**

```typescript
// External Integrations Table
externalIntegrations {
  id: UUID,
  companyId: UUID,
  integrationType: "quickbooks" | "adp" | "ukgpro" | ...,
  apiKey: string (encrypted),
  apiSecret: string (encrypted),
  oauthToken: string,
  refreshToken: string,
  status: "connected" | "disconnected" | "error",
  lastSyncAt: timestamp,
  nextSyncAt: timestamp,
  fieldMapping: JSON,
  lastError: string,
  errorCount: integer
}

// Sync Logs Table
syncLogs {
  id: UUID,
  companyId: UUID,
  integrationId: UUID,
  syncType: "initial_import" | "incremental" | "manual",
  status: "running" | "completed" | "failed",
  recordsAttempted: integer,
  recordsSucceeded: integer,
  recordsFailed: integer,
  errorLog: JSON,
  summary: string,
  startedAt: timestamp,
  completedAt: timestamp,
  duration: integer
}

// Job Reference Numbers
jobs {
  ...
  clientJobReference: string, // "QB-2024-11-22-001"
  externalJobId: string       // "jb_abc123"
}

// Worker External References
workers {
  ...
  externalWorkerId: string,   // "ADP-EMP-98765"
  externalSsn: string         // encrypted
}

// Assignment External References
assignments {
  ...
  externalAssignmentId: string,  // "ADP-TM-2024-11"
  externalClientName: string     // How they refer to client
}
```

### **API Endpoints (To be built)**

```
POST /api/integrations/quickbooks/connect
  - Initiates OAuth flow
  - Returns auth URL

POST /api/integrations/quickbooks/callback
  - Receives OAuth token
  - Stores encrypted credentials
  - Starts initial import

POST /api/integrations/adp/connect
  - Takes API key/secret
  - Tests connection
  - Starts initial import

GET /api/integrations
  - Lists all connected integrations
  - Shows sync status

GET /api/integrations/:id/sync-logs
  - Shows sync history
  - Displays errors

POST /api/integrations/:id/sync
  - Manual trigger sync
  - Shows progress

DELETE /api/integrations/:id
  - Disconnects integration
  - Preserves all synced data
```

---

## 9. SECURITY & DATA PRIVACY

### **API Keys/Secrets:**
- ✅ **Encrypted at rest** - AES-256
- ✅ **Encrypted in transit** - HTTPS only
- ✅ **Never logged** - Excluded from logs
- ✅ **Rotated regularly** - Annual minimum
- ✅ **Only Jason can see** - Admin access restricted

### **Data Handling:**
- ✅ **Minimal scope** - Only request data we need
- ✅ **Data retention** - Keep 7 years (legal requirement)
- ✅ **User consent** - Users approve integrations
- ✅ **GDPR/CCPA compliance** - Data deletion honored
- ✅ **Audit trail** - All syncs logged

### **Webhook Security:**
- ✅ **Signature verification** - Validate webhook source
- ✅ **SSL pinning** - Verify certificate
- ✅ **Rate limiting** - Prevent abuse
- ✅ **Replay protection** - Check timestamp

---

## 10. ERROR HANDLING

### **What if sync fails?**

```
Sync attempted at 2:00 AM
    ↓
ADP API timeout
    ↓
Error logged: "Connection timeout after 30s"
    ↓
Retry at 3:00 AM
    ↓
Still fails
    ↓
Jason gets email: "ADP sync failed 2x. Check credentials."
    ↓
Jason reconnects ADP
    ↓
Next sync succeeds
```

### **Error Tracking:**
- ✅ Error count (auto-disconnect if >5 failures)
- ✅ Last error message
- ✅ Notifications to Jason
- ✅ Sync logs detail every attempt

---

## 11. MULTI-AGENCY CONSOLIDATION

For Multi-Agency Hub customers (consolidating 10+ agencies):

### **Before ORBIT:**
- Agency A has QuickBooks
- Agency B has ADP
- Agency C has UKG Pro
- Parent company sees nothing unified

### **After ORBIT Integration:**
- All 3 agencies' data flows to ORBIT
- Parent company sees unified dashboard
- One system for all payroll, scheduling, compliance
- **Savings:** 6-7 systems reduced to 1

---

## 12. ROADMAP

### **This Month:**
- ✅ Design integration schema (done)
- Build integrations dashboard page
- Build QuickBooks connector

### **Next Month:**
- QuickBooks MVP testing
- ADP connector
- Data validation tools

### **Q1 2026:**
- UKG Pro connector
- Paylocity, Gusto
- Webhook support for real-time syncs

### **Long-term:**
- 10+ integrations
- Marketplace for custom connectors
- Revenue share with integration partners

---

## 13. CUSTOMER VALUE

### **What Clients Get:**

**Before ORBIT:**
- QuickBooks for invoicing
- ADP for payroll
- UKG Pro for scheduling
- Manual data entry between systems
- **Cost:** $50k-100k/year in systems

**After ORBIT Integration:**
- One dashboard for all data
- Automated syncs
- No manual entry
- Real-time visibility
- GPS verification (bonus)
- **Cost:** $20k/year total with ORBIT

**Savings:** $30-80k/year per agency

---

## 14. NEXT STEPS

1. ✅ Schema designed (done)
2. Build integrations dashboard (`/integrations` page)
3. Implement QuickBooks OAuth connector
4. Test with real QB account
5. Add ADP/UKG Pro connectors
6. Launch with first franchise (Mike/Superior Staffing)

---

**Status:** Architecture Complete  
**Owner:** Jason (CEO)  
**Next Action:** Build integrations dashboard page
