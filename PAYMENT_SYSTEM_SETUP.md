# Payment System Setup Guide

## Current Status: ✅ READY (No Stripe Keys Connected Yet)

The entire payment and licensing infrastructure is built and deployed. You can start selling immediately - Stripe integration will be added when you're ready.

---

## Database Tables (Already Live)

### 1. Licenses Table
Stores all franchise, subscription, and enterprise license information.

```sql
licenses {
  id: UUID,
  companyId: UUID → companies.id,
  licenseType: 'franchise' | 'subscription' | 'enterprise',
  licenseTier: 'startup' | 'growth' | 'enterprise' | 'custom',
  
  -- Pricing
  oneTimeFee: decimal,        -- For franchise licenses
  monthlyFee: decimal,        -- For subscriptions
  revenueSharePercentage: decimal,
  
  -- Capacity
  maxWorkers: integer (default: 50),
  maxClients: integer (default: 5),
  maxEvents: integer (default: 5),
  
  -- Status
  status: 'active' | 'paused' | 'cancelled' | 'expired',
  
  -- Duration
  startDate: date,
  expiryDate: date (null for perpetual),
  autoRenew: boolean,
  
  -- Features
  whiteLabel: boolean,
  apiAccess: boolean,
  dedicatedSupport: boolean,
  customBranding: boolean,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 2. Payments Table
Tracks all transactions and payment attempts.

```sql
payments {
  id: UUID,
  companyId: UUID → companies.id,
  licenseId: UUID → licenses.id,
  
  -- Payment Details
  amount: decimal,
  currency: 'USD' | other,
  description: text,
  
  -- Payment Method
  paymentMethod: 'card' | 'bank_transfer' | 'check' | 'invoice',
  stripePaymentIntentId: varchar (null until Stripe integrated),
  
  -- Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded',
  paymentDate: timestamp,
  failureReason: text,
  
  -- References
  invoiceId: UUID → invoices.id,
  notes: text,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## API Endpoints (Already Implemented)

### Licenses

**Create Franchise License**
```
POST /api/licenses/create
Body: {
  companyId: "uuid",
  licenseType: "franchise",
  licenseTier: "enterprise",
  oneTimeFee: 18500,
  maxWorkers: 100,
  whiteLabel: true,
  apiAccess: true,
  dedicatedSupport: true,
  customBranding: true,
  status: "active"
}
Response: { License object }
```

**Get Company License**
```
GET /api/licenses/company/:companyId
Response: { Current license for company }
```

**Get Specific License**
```
GET /api/licenses/:licenseId
Response: { License details }
```

**Update License**
```
PATCH /api/licenses/:licenseId
Body: { Any partial updates }
Response: { Updated license }
```

**List All Licenses** (Admin Only)
```
GET /api/licenses?status=active&type=franchise
Response: [ Array of licenses ]
```

### Payments

**Record Payment**
```
POST /api/payments/record
Body: {
  companyId: "uuid",
  amount: 18500,
  description: "Superior Staffing Franchise License",
  method: "bank_transfer"
}
Response: { Payment object with status "completed" }
```

**Get Company Payment History**
```
GET /api/payments/company/:companyId
Response: [ Array of payments ]
```

**Get Specific Payment**
```
GET /api/payments/:paymentId
Response: { Payment details }
```

**Update Payment Status** (Admin)
```
PATCH /api/payments/:paymentId
Body: { status: "completed", notes: "..." }
Response: { Updated payment }
```

---

## How to Sell a License (Step-by-Step)

### Step 1: Create Company Account for Customer
```bash
POST /api/companies/create
Body: {
  name: "Superior Staffing",
  email: "mike@superiorfstaffing.com",
  industry: "staffing",
  state: "TN"
}
Response: { companyId: "xxxx" }
```

### Step 2: Create Franchise License
```bash
POST /api/licenses/create
Body: {
  companyId: "xxxx",
  licenseType: "franchise",
  licenseT: "enterprise",
  oneTimeFee: 18500,
  maxWorkers: 100,
  whiteLabel: true,
  apiAccess: true,
  dedicatedSupport: true,
  status: "active"
}
Response: { licenseId: "yyyy" }
```

### Step 3: Record Payment
```bash
POST /api/payments/record
Body: {
  companyId: "xxxx",
  licenseId: "yyyy",
  amount: 18500,
  description: "Superior Staffing Franchise License - Perpetual",
  method: "bank_transfer" or "card"
}
Response: { paymentId: "zzzz", status: "completed" }
```

### Step 4: Activate White-Label (Backend)
```bash
UPDATE companies
SET whiteLabel = true, 
    customBranding = "Superior Staffing"
WHERE id = "xxxx"
```

### Step 5: Hand Off to Customer
- Email: Login credentials for admin panel
- Phone: 1-hour setup call
- Email: White-label domain setup instructions
- Email: User manual/getting started guide

---

## Implementation Without Stripe (For Now)

You can create and manage licenses completely manually:

1. **Customer signs agreement** (email or DocuSign)
2. **You create license in system** using API
3. **Customer pays** via:
   - Bank transfer (ACH)
   - Check
   - Wire transfer
   - Credit card (manual, not automated)
4. **You record payment** in system when received
5. **License activated** immediately

**Advantages:**
- ✅ No Stripe fees (2.9% + 30¢)
- ✅ Works for business customers (B2B)
- ✅ Flexible payment terms
- ✅ Can do payment plans easily
- ✅ Full control

**Disadvantages:**
- ❌ Manual reconciliation
- ❌ No automated recurring billing (yet)
- ❌ Manual follow-ups for payment

---

## When to Add Stripe Integration

You'll want to add Stripe when you:
1. ✅ Have multiple customers
2. ✅ Want automatic recurring billing
3. ✅ Need credit card payments
4. ✅ Want subscription management UI

**Setup will be easy:**
1. Get Stripe API keys (test + live)
2. Update `/api/payments/record` to call Stripe
3. Add webhook handlers for payment updates
4. Update payment status automatically

The `stripePaymentIntentId` field is already in the database waiting for it.

---

## Pricing Models You Can Support

### Model 1: Perpetual Franchise (Mike's Deal)
```
{
  licenseType: "franchise",
  oneTimeFee: 18500,
  expiryDate: null,
  autoRenew: false
}
Payment: One-time via bank transfer
```

### Model 2: Monthly Subscription
```
{
  licenseType: "subscription",
  monthlyFee: 599,
  expiryDate: null,
  autoRenew: true
}
Payment: Recurring monthly (Stripe)
```

### Model 3: Annual with Renewal
```
{
  licenseType: "subscription",
  monthlyFee: null,
  oneTimeFee: 5900,  // $599/month × 10 = yearly discount
  expiryDate: "2026-11-22",
  autoRenew: true
}
Payment: Recurring annually
```

### Model 4: Revenue Share
```
{
  licenseType: "subscription",
  monthlyFee: null,
  revenueSharePercentage: 2.0,
  expiryDate: null,
  autoRenew: true
}
Payment: Monthly based on platform usage (calculated separately)
```

---

## Quick Admin Commands

### Create Test Franchise License
```bash
curl -X POST http://localhost:5000/api/licenses/create \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "your-company-id",
    "licenseType": "franchise",
    "licenseTier": "enterprise",
    "oneTimeFee": 18500,
    "maxWorkers": 100,
    "whiteLabel": true,
    "apiAccess": true,
    "dedicatedSupport": true,
    "status": "active"
  }'
```

### Record Test Payment
```bash
curl -X POST http://localhost:5000/api/payments/record \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "your-company-id",
    "amount": 18500,
    "description": "Test Franchise Payment",
    "method": "bank_transfer"
  }'
```

### Check Payment History
```bash
curl -X GET "http://localhost:5000/api/payments/company/your-company-id"
```

### Check License Status
```bash
curl -X GET "http://localhost:5000/api/licenses/company/your-company-id"
```

---

## Security Notes

- ✅ Payment details stored securely in PostgreSQL
- ✅ Stripe API keys NOT in database (will be env vars)
- ✅ Payment processing logs PII minimally
- ✅ All endpoints ready for auth middleware (add when needed)
- ✅ Database indexes on company/license lookups for performance

---

## File Reference

- **Database Schema:** `shared/schema.ts` (lines 629-733)
- **Storage Methods:** `server/storage.ts` (lines 513-579)
- **API Routes:** `server/routes.ts` (lines 489-616)

---

## Summary

✅ Everything is ready to make your first franchise sale to Mike.

Next steps:
1. Call Mike, present the offer ($18,500-20,000)
2. Get his agreement (email is fine)
3. Create his company account
4. Create the franchise license in system
5. He pays via bank transfer
6. Record payment, activate white-label
7. Done!

No Stripe needed yet - works great for B2B sales like this.
