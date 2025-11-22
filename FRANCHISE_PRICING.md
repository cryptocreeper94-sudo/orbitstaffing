# ORBIT Staffing OS - Franchise & One-Off Licensing

## Overview

You now have a complete **payment + licensing infrastructure** ready for:
- ✅ One-off franchise sales (like Mike)
- ✅ Subscription recurring billing (when you're ready)
- ✅ White-label partnerships
- ✅ Enterprise deals with custom terms

**Stripe integration:** Ready to plug in API keys whenever you're ready

---

## License Types

### 1. Franchise License (One-Off, Perpetual)
**Perfect for:** Business owners who want to own their platform
- **One-time fee:** $15,000 - $25,000 (depending on terms)
- **No recurring fees:** Buy once, run forever
- **White-label:** Full branding with their company name
- **Support:** Email/phone support included
- **Capacity:** Up to 100 workers (scalable)
- **Features:** Everything built-in (CRM, payroll, invoicing, scheduling, GPS)
- **Updates:** Free updates for 1 year, then optional annual support ($2k/year)

**Example: Mike's Deal**
- Superior Staffing Franchise License
- One-time: $18,500
- Includes: White-label branding, API access, unlimited workers, custom domain setup
- Support: 1 year included, then $2k/year optional

---

### 2. Growth Subscription (Monthly, Flexible)
**Perfect for:** Agencies testing the platform or scaling gradually
- **Monthly:** $199-$599 depending on tier
- **Can switch to 2% Revenue Share** (free every 6 months)
- **$299 fee** for additional switches
- **Auto-renews** each month
- **Cancel anytime** (no lock-in)

---

### 3. Enterprise (Custom Deal)
**Perfect for:** Large agencies or holding companies
- **Custom pricing** based on needs
- **Multi-location support**
- **Dedicated account manager**
- **Custom integrations**
- **SLA guarantees**

---

## Pricing Breakdown: Mike's Deal

### What He Gets (Replaces His Entire Operation)

**Current State (Disconnected Systems):**
- CRM scattered across systems
- Payroll done manually or in QuickBooks
- Invoicing in multiple places
- Worker scheduling on paper/text
- No real-time visibility
- 5-6 different platforms he pays for
- Constant manual data entry

**With ORBIT Franchise:**
- ✅ Complete CRM (workers, clients, history)
- ✅ Automated payroll (TN/KY compliant)
- ✅ Auto-generated invoices
- ✅ Real-time scheduling & GPS verification
- ✅ Mobile app for workers
- ✅ Automated compliance tracking
- ✅ Real-time dashboard (phone or desktop)
- ✅ Message workers directly (in-app)
- ✅ Time-off & payroll approval automation
- ✅ Everything in ONE system

**Cost Savings:**
- QuickBooks: ~$40/month = $480/year
- Payroll service: ~$50/month = $600/year
- CRM (HubSpot, Pipedrive): ~$50/month = $600/year
- Scheduling software: ~$30/month = $360/year
- Other misc systems: ~$50/month = $600/year
- **Total current spend: ~$2,640/year**

**Plus:** Probably 20+ hours/month on manual data entry = $400-600/month lost productivity
- **Real productivity cost: $5,000-7,000/year**

**TOTAL VALUE REPLACEMENT: $8,000-10,000/year minimum**

---

## Fair Pricing for Mike's Franchise

### The Math

**Option 1: One-Time Franchise Fee**
```
Professional staffing software development cost: $20,000-50,000
Annual SaaS platform cost: $2,000-10,000/year
White-label rights: +$5,000-10,000 value

Fair One-Time Price: $15,000-25,000

RECOMMENDATION FOR MIKE:
$18,500 - $20,000
(Middle of fair market, reflects relationship + loyalty)
```

**Why $18,500-20,000 is fair:**

1. **Replaces $8-10k/year in software costs** → ROI in 2 years
2. **Includes white-label rights** (big value)
3. **Perpetual license** (never pay again, unlike competitors)
4. **Eliminates 20+ hrs/month** of manual work
5. **Includes 1 year of support** (~$3k value)
6. **He knows you & knows the value** (trust discount vs strangers)

---

## Payment Structure Options

### Option 1: Full Upfront (Simplest)
```
$18,500 due upon signature
- Send him an invoice
- He pays via bank transfer, check, or card
- License activated immediately
- Done
```

### Option 2: Payment Plan (If Cash Flow Needed)
```
$18,500 total:
- $10,000 at signing
- $8,500 in 30 days
```

### Option 3: Hybrid (Business Model)
```
$15,000 upfront + $300/month for 12 months
- Converts to full perpetual license after 12 months
- Total: $18,600
- Smoother cash flow for him
- Still profitable for you
```

---

## What Gets Setup for Mike

### 1. Dedicated Account
- Company: "Superior Staffing"
- Owner: Mike (your contact)
- License Type: Franchise (Perpetual)
- Capacity: 100 workers (can scale higher if needed)
- Features: All enabled (white-label, API, custom support)

### 2. White-Label Branding
- Remove ORBIT branding
- Replace with "Superior Staffing"
- Custom domain: superiorfstaffing.com (or his choice)
- Custom logo throughout
- Branded email templates

### 3. Initial Setup
- Import existing workers (if he has a list)
- Configure TN/KY compliance settings
- Set up his client list
- Train him 1-2 hours on system
- Email/phone support for first 90 days

### 4. Payment Record
- Create License entry in system:
  ```
  licenseType: "franchise"
  oneTimeFee: 18500
  status: "active"
  perpetual: true
  features: [whiteLabel, apiAccess, dedicatedSupport]
  ```

- Create Payment entry:
  ```
  amount: 18500
  paymentMethod: "bank_transfer" (or card)
  status: "completed"
  date: [signature date]
  ```

---

## How to Present to Mike

**The Pitch:**
> "Mike, look - you're running Superior Staffing across what, 6-7 different systems? You're spending $2,640/year on software and probably another $5,000-7,000 in lost time manually entering data.
>
> With ORBIT, everything runs from your phone. One app. One login. CRM, payroll, invoicing, scheduling - all automated. No more juggling systems.
> 
> I'm offering you the franchise for **$18,500 one-time**. Buy it once, own it forever. White-labeled completely as Superior Staffing. You run it however you want.
>
> By year 2, you've saved more than the investment in software costs alone. And that doesn't count the 20 hours a month you'll get back in your life."

---

## Technical Implementation

### 1. Create Franchise License (Backend)
```typescript
POST /api/licenses/create
{
  companyId: "mike-superior-staffing-id",
  licenseType: "franchise",
  licenseTier: "enterprise",
  oneTimeFee: 18500,
  maxWorkers: 100,
  whiteLabel: true,
  apiAccess: true,
  dedicatedSupport: true,
  customBranding: true,
  status: "active",
  expiryDate: null  // Perpetual
}
```

### 2. Record Payment (Backend)
```typescript
POST /api/payments/record
{
  companyId: "mike-superior-staffing-id",
  amount: 18500,
  description: "Superior Staffing Franchise License - Perpetual",
  paymentMethod: "bank_transfer",
  notes: "Signed franchise agreement [date], white-label setup included"
}
```

### 3. Activate White-Label (Frontend)
```typescript
// Update company branding
{
  whiteLabel: true,
  customBranding: "Superior Staffing",
  logo: [custom logo URL],
  domain: "superior-staffing.replit.dev" // or custom domain
}
```

---

## Ongoing Support Options (Post-Sale)

### Included (First 12 Months)
- Email support (48-hour response)
- Phone support (1 call/month)
- Bug fixes
- Platform updates

### Optional Annual Support ($2,000/year after Year 1)
- Priority email support (24-hour response)
- Phone support (unlimited)
- Custom feature requests
- Dedicated account manager

### Custom Development (If Needed)
- Custom integrations with his other systems: $3,000-10,000
- Mobile app customization: $5,000+
- Billing integration with accounting software: $2,000-5,000

---

## Why This Works

### For You:
- ✅ $18,500 one-time revenue (high margin)
- ✅ Proves white-label model works
- ✅ Reference customer (Mike's a known business owner)
- ✅ Low maintenance (he's self-sufficient)
- ✅ Potential upsell (annual support, custom dev, referrals)

### For Mike:
- ✅ Consolidates 6-7 systems into 1
- ✅ Saves $8-10k/year in software costs
- ✅ Saves 20+ hours/month in manual work
- ✅ Owns it forever (no recurring fees)
- ✅ White-labeled as his brand
- ✅ Supports up to 100 employees

### For ORBIT:
- ✅ Validates the white-label franchise model
- ✅ Creates a success story for sales
- ✅ Builds credibility for similar deals
- ✅ Low support overhead (experienced business owner)

---

## Next Steps

1. **Schedule Call with Mike**
   - Show him the demo
   - Walk through features
   - Discuss his pain points
   - Present the $18,500 franchise option

2. **Get Agreement**
   - Simple one-page franchise agreement
   - Lists what's included, support terms, payment terms

3. **Complete Setup**
   - Create company account
   - Record license in system
   - Record payment
   - White-label branding
   - Hand off with training

4. **Track Success**
   - How many workers he onboards
   - If he upgrades to larger capacity
   - Potential referrals (other staffing agencies)

---

## Database Schema (Already Implemented)

```typescript
// Licenses table - stores franchise/subscription info
licenses {
  licenseType: "franchise" | "subscription" | "enterprise"
  oneTimeFee: 18500
  monthlyFee: null (for franchise)
  whiteLabel: true
  apiAccess: true
  dedicatedSupport: true
  status: "active"
  expiryDate: null (perpetual for franchise)
}

// Payments table - tracks all transactions
payments {
  companyId: mike's company ID
  amount: 18500
  paymentMethod: "bank_transfer"
  status: "completed"
  description: "Superior Staffing Franchise License"
  date: [when paid]
}
```

---

## API Ready to Go

You can already:
- `POST /api/licenses/create` → Create franchise license
- `POST /api/payments/record` → Record payment
- `GET /api/licenses/company/:companyId` → Check license status
- `GET /api/payments/company/:companyId` → See payment history
- `PATCH /api/licenses/:id` → Update license (white-label settings, etc)

All ready for Stripe integration when you decide to add it.

---

## Summary

**Fair Franchise Price for Mike: $18,500 - $20,000**

This is:
- ✅ Fair market value for what he gets
- ✅ Below comparable custom software ($20k-50k dev cost)
- ✅ Reflects 1-2 year ROI on his current software spend
- ✅ Respects your relationship (relationship discount vs strangers would be $22k-25k)
- ✅ Sustainable for ORBIT (high margin, low support)
- ✅ Attractive for him (perpetual ownership, white-label)

**My Recommendation: Quote him $19,000**
- Shows you've thought about it
- Slightly above middle (shows confidence in value)
- Easy to negotiate down to $18,500 if he pushes
- Firm enough to show it's serious business

Go close this deal. 🚀
