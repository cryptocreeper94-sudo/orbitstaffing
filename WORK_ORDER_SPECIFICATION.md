# ORBIT Staffing OS - Work Order Specification

**Date:** November 22, 2025  
**Purpose:** Customer-facing document that captures all staffing requirements

---

## Overview

The **Work Order** is the primary document clients use to specify their staffing needs. It pairs with the CSA (legal agreement) to form the complete staffing request.

**Two-Document System:**
1. **CSA** (signed once) - Legal terms, conversion policy, NDA
2. **Work Order** (multiple per client) - Specific job requirements

---

## Work Order Components

### **Header Section**
- Client name
- Location(s)
- Date issued
- Work Order reference number (auto-generated)
- Client contact person

### **Job Details**
- **Position Title** (required)
  - Example: "Electrician - Residential"
  
- **Job Category** (dropdown)
  - Skilled Trades: Electrician, Plumber, HVAC, Carpenter, Welder
  - Hospitality: Server, Bartender, Chef, Host, Busser
  - General Labor: Laborer, Forklift Operator, Warehouse, Delivery
  - Administrative: Data Entry, Receptionist, Clerical
  - Healthcare: CNA, RN, Medical Assistant
  - Manufacturing: Machine Operator, Assembly, Quality Control
  - Custom: User-defined

- **Skills Required** (checklist)
  - Trade certifications needed
  - Equipment operation
  - Licenses (CDL, forklift, OSHA, etc.)
  - Software (Excel, SAP, etc.)
  - Languages
  - Physical requirements (lifting, standing, etc.)

- **Industry Requirements** (auto-populate based on category)
  - Background check level
  - Drug screening
  - Safety certifications needed
  - OSHA requirements
  - Union requirements

### **Assignment Details**
- **Start Date** (required)
- **End Date** (if applicable)
- **Duration Type**
  - One-time/day labor
  - Temporary (1-4 weeks)
  - Long-term (1-6 months)
  - Ongoing/recurring
  
- **Hours Per Day/Week**
  - Daily hours (8, 10, 12 hour shifts)
  - Days per week
  - Schedule pattern (Monday-Friday, rotating, weekends, etc.)

- **Location Details**
  - Site address
  - Google Maps integration (auto-fill via GPS)
  - Job site contact name & phone
  - Special access instructions (gate code, parking, etc.)

- **Pay Rate & Terms**
  - Hourly rate offered
  - Payment frequency (weekly, bi-weekly)
  - OT policy (after 40h, after 8h daily, etc.)
  - Shift differentials (nights, weekends)

### **Staffing Request**
- **Number of Workers Needed**
  - Immediate need
  - Can fill immediately with fewer?
  - Backup availability needed?

- **Preferred Qualifications** (nice-to-have)
  - Experience level
  - Age/demographic preferences (if legal)
  - Previous client work

- **Sourcing Strategy** (client selects)
  - ☐ Internal ORBIT pool
  - ☐ Indeed database (commission-based)
  - ☐ LinkedIn professionals
  - ☐ Local workforce agencies
  - ☐ Combination

### **Special Requirements**
- **Safety/Compliance**
  - OSHA requirements
  - Hazmat certifications
  - Confined space training
  - Fall protection training
  
- **Equipment/Uniforms**
  - Client provides?
  - Worker buys/reimbursed?
  - Steel-toed boots required?
  - PPE provided?

- **Communication**
  - Daily check-ins required?
  - Reporting structure
  - Job site supervisor details

### **Terms & Conditions**
- **Worker Replacement**
  - If worker no-shows, replace within X hours
  - Who decides replacement timing?

- **Cancellation Policy**
  - Client cancellation terms
  - Notice required
  - Liability for partial days

- **Invoice Details**
  - Invoice frequency
  - Payment terms
  - PO number required?
  - Cost center allocation

- **GPS Verification**
  - ☐ Required (worker must check-in via GPS)
  - ☐ Optional
  - Notes about geofence/flexibility

---

## Work Order States

1. **Draft** - Client filling it out
2. **Submitted** - Client submits to ORBIT
3. **Under Review** - ORBIT confirms feasibility
4. **Approved** - ORBIT can fill
5. **Active** - Workers assigned
6. **Completed** - Job finished
7. **Cancelled** - Client/ORBIT cancelled

---

## Data Model

```typescript
workOrders {
  id: UUID (ORBIT reference)
  clientId: UUID (which client)
  companyId: UUID (which agency)
  
  // Header
  referenceNumber: string ("WO-2024-11-001")
  clientName: string
  clientContactName: string
  clientContactPhone: string
  clientLocation: string
  
  // Job Details
  positionTitle: string
  jobCategory: string (enum: skilled_trades, hospitality, general, admin, healthcare, manufacturing, custom)
  jobDescription: text
  skillsRequired: string[] (array of skills)
  industryRequirements: string[] (array)
  certificationsNeeded: string[]
  
  // Assignment
  startDate: date
  endDate: date (nullable)
  durationType: string (one_time, temporary, long_term, ongoing)
  dailyHours: integer
  daysPerWeek: integer
  schedulePattern: string
  
  // Location
  jobSiteAddress: string
  jobSiteLatitude: decimal
  jobSiteLongitude: decimal
  jobSiteContactName: string
  jobSiteContactPhone: string
  accessInstructions: text
  
  // Pay
  hourlyRate: decimal
  paymentFrequency: string (weekly, biweekly, etc)
  overtimePolicy: string
  shiftDifferentials: text
  
  // Staffing Request
  workersNeeded: integer
  canFillPartial: boolean
  backupAvailabilityNeeded: boolean
  
  // Special Requirements
  safetyRequirements: string[]
  equipmentProvided: string[]
  uniformsRequired: string
  ppeProvided: string
  
  // Sourcing
  sourcingStrategy: string[] (orbit_pool, indeed, linkedin, local, combined)
  
  // Terms
  replacementHours: integer
  cancellationNotice: integer (days)
  gpsVerificationRequired: boolean
  
  // Invoice
  invoiceFrequency: string
  paymentTerms: integer (days)
  poNumberRequired: boolean
  costCenter: string
  
  // Status
  status: string (draft, submitted, under_review, approved, active, completed, cancelled)
  
  // Metadata
  createdAt: timestamp
  submittedAt: timestamp
  approvedAt: timestamp
  completedAt: timestamp
  updatedAt: timestamp
}
```

---

## Client Portal Features

### **Create Work Order**
1. Client clicks "New Work Order"
2. Form with sections:
   - Basic info (title, category, dates)
   - Location details (auto-GPS fill from Google Maps)
   - Job requirements (skills checklist)
   - Staffing request (how many, when)
   - Terms (pay, hours, special reqs)
3. Client submits
4. ORBIT reviews feasibility
5. Client sees status: "Under Review" → "Approved"

### **View/Edit Work Orders**
- List of all work orders
- Filter by status (active, pending, completed)
- Quick view: job title, location, status, dates
- Full details modal
- Edit if still in "Draft" or "Submitted"
- Generate PDF for printing/filing

### **Worker Assignment View**
- See assigned workers
- Confirm start dates
- Cancel assignments (with notice)
- Rate/review workers after completion

### **Invoices**
- Auto-generated based on work order terms
- Shows workers who worked, hours, rates
- Links to GPS verification for accuracy

---

## Integration with Other Systems

### **Indeed Integration**
If client selects "Indeed database" sourcing:
- ORBIT searches Indeed for matching candidates
- Pay commission per hire ($5-15)
- Client sees candidates sourced from Indeed
- Mark as "sourced from Indeed" for compliance

### **GPS Verification**
If "GPS required" is checked:
- Workers must check-in at job site
- GPS coordinates verified against work order location
- Hours locked to actual check-in/out times
- Client sees real-time worker verification

### **Invoicing**
- Auto-generate invoice from work order terms
- Include hourly rate × hours worked (from GPS)
- Apply multiplier (1.35x = client bill rate)
- Send to client for approval/payment

---

## Example Work Order

```
ORBIT STAFFING OS - WORK ORDER

Reference: WO-2024-11-22-001
Client: ABC Construction
Contact: John Smith (615-555-1234)

POSITION: Electrician - Residential Wiring
Category: Skilled Trades
Location: Nissan Stadium, Nashville TN
Start: Nov 23, 2024
Duration: One-time job (3 days)

SCHEDULE:
- Mon-Wed, 8:00 AM - 5:00 PM
- 9 hours/day (including 1h lunch)

PAY RATE: $45/hour
- ORBIT bills client: $60.75/hour (1.35x markup)
- Worker receives: $45/hour

WORKERS NEEDED: 2 electricians

SKILLS REQUIRED:
☑ Residential wiring
☑ Blueprint reading
☑ NEC code knowledge
☑ OSHA-10 certification
☐ Journeyman license (preferred)

SPECIAL REQUIREMENTS:
- Steel-toed boots required
- OSHA certification on file
- Valid driver's license
- Can work from ladder

LOCATION DETAILS:
- Gate code: 5678
- Ask for: Mike (site supervisor)
- Parking: Lot B, east side
- GPS verified check-in required

SOURCING:
☑ ORBIT pool
☑ Indeed database
☐ LinkedIn professionals

WORKER REPLACEMENT:
If no-show, ORBIT replaces within 4 hours

INVOICE: Weekly (every Friday)
Payment Terms: Net 30

Signed: _________________ (Client)
Date: __________________
```

---

## Benefits

**For Clients:**
- ✅ Clear specification of needs
- ✅ No confusion about requirements
- ✅ GPS verification of actual attendance
- ✅ Fair billing based on work actually done
- ✅ Reusable template for repeat jobs

**For ORBIT:**
- ✅ Clear sourcing strategy
- ✅ Legally documented requirements
- ✅ Automation hooks (GPS, invoicing, Indeed sourcing)
- ✅ Compliance tracking

**For Workers:**
- ✅ Know exactly what's expected
- ✅ Fair pay rates
- ✅ Clear job site info & access instructions
- ✅ GPS prevents disputes about hours

---

## Next Steps

1. Build Work Order creation form (client portal)
2. Build Work Order approval workflow (ORBIT admin)
3. Link work orders to job assignments
4. Auto-generate invoices from work orders
5. Add Indeed sourcing integration hook
6. Add GPS verification validation

