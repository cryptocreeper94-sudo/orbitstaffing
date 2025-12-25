# ORBIT Financial Hub Integration Guide

## Overview
The ORBIT Financial Hub is the central financial processing engine for DarkWave Studios. It tracks revenue, expenses, royalty splits, and generates statements across all connected products.

## Connection Details

**Authentication:** HMAC-SHA256 signature

**Environment Variables Required:**
```
ORBIT_FINANCIAL_HUB_URL=<production-url-provided-by-jason>
ORBIT_FINANCIAL_HUB_KEY=<api-key-provided-by-jason>
ORBIT_FINANCIAL_HUB_SECRET=<api-secret-provided-by-jason>
```

> **Important:** Contact Jason Andrews for all credentials. Never commit API keys to your repository.

---

## API Endpoints

### 1. Check Hub Status (Public)
```
GET /api/financial-hub/status
```

**Response:**
```json
{
  "hub": "ORBIT Financial Hub",
  "version": "1.0.0",
  "status": "operational",
  "summary": {
    "totalPartners": 2,
    "totalEvents": 0,
    "revenueThisMonth": 0
  }
}
```

---

### 2. Ingest Financial Event (Authenticated)
```
POST /api/financial-hub/ingest
```

**Headers:**
```
Content-Type: application/json
X-Orbit-Api-Key: <your-api-key>
X-Orbit-Signature: <hmac-sha256-signature>
```

**Request Body:**
```json
{
  "sourceSystem": "PaintPros.io",
  "sourceAppId": "paintpros_prod",
  "externalRef": "INV-2025-001",
  "idempotencyKey": "paintpros_inv_2025_001",
  "eventType": "revenue",
  "productCode": "PAINTING_JOB",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "eventDate": "2025-01-15T00:00:00Z",
  "grossAmount": 5000.00,
  "netAmount": 4500.00,
  "currency": "USD",
  "description": "Nashville residential painting - 123 Main St",
  "invoiceIds": ["INV-2025-001"],
  "metadata": {
    "clientName": "John Smith",
    "projectType": "interior",
    "sqft": 2500
  }
}
```

**Event Types:**
- `revenue` - Income from completed jobs
- `expense` - Business expenses (materials, labor, etc.)
- `payout` - Partner payment records
- `adjustment` - Corrections or adjustments

**Response:**
```json
{
  "success": true,
  "eventId": "abc123...",
  "status": "processed",
  "royaltySplits": [
    {
      "partnerId": "jason-id",
      "partnerName": "Jason Andrews",
      "splitPercentage": 50,
      "grossAmount": 2500.00,
      "netAmount": 2500.00,
      "taxWithholding": 0
    },
    {
      "partnerId": "sidonie-id",
      "partnerName": "Sidonie Summers",
      "splitPercentage": 50,
      "grossAmount": 2500.00,
      "netAmount": 2500.00,
      "taxWithholding": 0
    }
  ],
  "message": "Financial event ingested and 2 royalty splits calculated"
}
```

---

## HMAC Signature Generation

```typescript
import crypto from 'crypto';

function generateSignature(payload: object, secret: string): string {
  const body = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

// Usage
const payload = {
  sourceSystem: "PaintPros.io",
  eventType: "revenue",
  grossAmount: 5000.00
  // ... other fields
};

const signature = generateSignature(payload, process.env.ORBIT_FINANCIAL_HUB_SECRET!);

// Make request
fetch(`${process.env.ORBIT_FINANCIAL_HUB_URL}/api/financial-hub/ingest`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Orbit-Api-Key': process.env.ORBIT_FINANCIAL_HUB_KEY!,
    'X-Orbit-Signature': signature
  },
  body: JSON.stringify(payload)
});
```

---

## Integration Client (Copy to Your App)

```typescript
// financialHubClient.ts
import crypto from 'crypto';

const FINANCIAL_HUB_URL = process.env.ORBIT_FINANCIAL_HUB_URL;
if (!FINANCIAL_HUB_URL) throw new Error('ORBIT_FINANCIAL_HUB_URL not set');
const API_KEY = process.env.ORBIT_FINANCIAL_HUB_KEY;
const API_SECRET = process.env.ORBIT_FINANCIAL_HUB_SECRET;

interface FinancialEventInput {
  sourceSystem: string;
  sourceAppId?: string;
  externalRef?: string;
  idempotencyKey?: string;
  eventType: 'revenue' | 'expense' | 'payout' | 'adjustment';
  productCode?: string;
  periodStart?: string;
  periodEnd?: string;
  grossAmount: number;
  netAmount?: number;
  currency?: string;
  description?: string;
  invoiceIds?: string[];
  metadata?: Record<string, any>;
}

function generateSignature(payload: string): string {
  if (!API_SECRET) throw new Error('ORBIT_FINANCIAL_HUB_SECRET not set');
  return crypto.createHmac('sha256', API_SECRET).update(payload).digest('hex');
}

export async function pushFinancialEvent(event: FinancialEventInput) {
  if (!API_KEY) throw new Error('ORBIT_FINANCIAL_HUB_KEY not set');
  
  const body = JSON.stringify(event);
  const signature = generateSignature(body);
  
  const response = await fetch(`${FINANCIAL_HUB_URL}/api/financial-hub/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Orbit-Api-Key': API_KEY,
      'X-Orbit-Signature': signature
    },
    body
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to push financial event');
  }
  
  return response.json();
}

export async function getHubStatus() {
  const response = await fetch(`${FINANCIAL_HUB_URL}/api/financial-hub/status`);
  return response.json();
}

// Example usage:
// 
// await pushFinancialEvent({
//   sourceSystem: 'PaintPros.io',
//   eventType: 'revenue',
//   productCode: 'PAINTING_JOB',
//   grossAmount: 5000.00,
//   description: 'Nashville residential painting job',
//   idempotencyKey: `paintpros_job_${jobId}`
// });
```

---

## Partner Split Calculation

When a financial event is ingested:

1. The hub looks up all active partners
2. Each partner's `defaultSplitPercentage` is applied
3. Tax withholding is calculated (24% for 1099 without W-9 on file)
4. Ledger entries are created with full audit trail
5. Results are returned to the calling app

**Current Partners:**
| Partner | Split | Tax Type |
|---------|-------|----------|
| Jason Andrews | 50% | 1099 |
| Sidonie Summers | 50% | Dual (1099/W-2) |

---

## Statement Generation

Statements are generated via the admin API:

```
POST /api/admin/financial-hub/statements/generate
```

```json
{
  "partnerId": "<partner-uuid>",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31"
}
```

This aggregates all ledger entries for the period and generates a statement with:
- Total gross revenue
- Total expenses
- Net profit
- Partner share (based on split percentage)
- Tax withholding
- Amount due

---

## Idempotency

Use the `idempotencyKey` field to prevent duplicate events:

```json
{
  "idempotencyKey": "paintpros_invoice_2025_001"
}
```

If the same key is sent twice, the hub returns the existing event without creating a duplicate.

---

## Connected Products

| Product | Status | Integration |
|---------|--------|-------------|
| ORBIT Staffing OS | Active | Hub Host |
| PaintPros.io | Pending | This Guide |
| Brew & Board Coffee | Pending | Coming Soon |
| Lot Ops Pro | Planned | - |
| DarkWave Pulse | Planned | - |

---

## Support

For API credentials or integration assistance:
- **Jason Andrews** - jason@darkwavestudios.io
- **Admin Dashboard:** `/admin/financial-hub`

---

*Powered by ORBIT Staffing OS - DarkWave Studios 2025*
