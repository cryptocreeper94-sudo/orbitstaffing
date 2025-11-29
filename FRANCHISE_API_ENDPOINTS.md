# ORBIT Franchise API Endpoints

## 🔐 Franchise Management (Master Admin Only)

### Create New Franchise
```
POST /api/franchises
{
  "name": "Superior Staffing",
  "ownerId": "user-id-here",
  "logoUrl": "https://example.com/logo.png",
  "customDomain": "superiortaffing.orbitstaffing.io",
  "brandColor": "#FF6B35",
  "billingModel": "fixed",
  "monthlyFee": 499.00,
  "maxWorkers": 500,
  "maxClients": 50,
  "licenseStatus": "active"
}
```

Response:
```json
{
  "id": "superior-staffing-001",
  "name": "Superior Staffing",
  "ownerId": "user-id",
  "licenseStatus": "active",
  "createdAt": "2025-11-23T..."
}
```

### List All Franchises
```
GET /api/franchises
```

Response: Array of franchise objects

### Get Franchise Details
```
GET /api/franchises/:franchiseId
```

### Update Franchise Settings
```
PATCH /api/franchises/:franchiseId
{
  "brandColor": "#FF6B35",
  "maxWorkers": 1000,
  "billingModel": "revenue_share",
  "revenueSharePercentage": 3.5
}
```

### Update License Status
```
PATCH /api/franchises/:franchiseId/license
{
  "licenseStatus": "paused",  // or "active", "expired"
  "licenseEndDate": "2026-11-23"
}
```

---

## 👤 Franchisee Admin Access

### Get Franchisee's Company Data (Isolated)
```
GET /api/franchises/:franchiseId/company
```

Response: Only that franchisee's company data

### Get Franchisee's Workers
```
GET /api/franchises/:franchiseId/workers
```

Response: Only that franchisee's workers

### Get Franchisee's Jobs
```
GET /api/franchises/:franchiseId/jobs
```

Response: Only that franchisee's jobs

### Get Franchisee's Analytics
```
GET /api/franchises/:franchiseId/analytics
{
  "period": "month",  // week, month, year
  "startDate": "2025-10-23",
  "endDate": "2025-11-23"
}
```

Response:
```json
{
  "totalWorkers": 142,
  "totalJobs": 18,
  "totalPayroll": "$45,230",
  "totalInvoices": "$67,500",
  "profitMargin": "28%"
}
```

---

## 🔄 Multi-Tenancy Endpoints

### Get Franchisee's Isolated Dataset
```
GET /api/franchises/:franchiseId/export
?format=json
```

Response: Complete JSON export of franchisee's data (for backups/migration)

### Verify Data Isolation
```
GET /api/franchises/:franchiseId/audit-trail
?days=30
```

Response: All data access logs for that franchisee (proves isolation)

---

## 💳 Billing & License Management

### Get Franchise Billing Info
```
GET /api/franchises/:franchiseId/billing
```

Response:
```json
{
  "billingModel": "fixed",
  "monthlyFee": 499,
  "nextBillingDate": "2025-12-23",
  "paymentStatus": "active",
  "totalRevenueSoFar": "$12,450"
}
```

### Pause License (Temporary)
```
POST /api/franchises/:franchiseId/pause
{
  "reason": "Payment pending",
  "duration": "7 days"
}
```

### Terminate Franchise
```
POST /api/franchises/:franchiseId/terminate
{
  "reason": "Contract ended",
  "dataExport": true  // export their data before termination
}
```

---

## 🔐 Environment Configuration

### Get Franchise Environment Variables
```
GET /api/franchises/:franchiseId/env-config
```

Response: (for their .env setup)
```json
{
  "VITE_FRANCHISE_NAME": "Superior Staffing",
  "VITE_FRANCHISE_ID": "superior-staffing-001",
  "VITE_BRAND_COLOR": "#FF6B35",
  "VITE_CUSTOM_DOMAIN": "superiorstaffing.orbitstaffing.io",
  "VITE_ADMIN_PIN": "7777",
  "COMPLIANCE_STATE": "TN",
  "BILLING_MODEL": "fixed"
}
```

### Update Franchise Environment
```
PATCH /api/franchises/:franchiseId/env-config
{
  "VITE_BRAND_COLOR": "#00FF00",
  "COMPLIANCE_STATE": "KY"
}
```

---

## 📊 Reporting & Compliance

### Get Franchise Compliance Report
```
GET /api/franchises/:franchiseId/compliance
?state=TN
```

Response: State-specific compliance audit

### Get Revenue Report (For You)
```
GET /api/admin/revenue-report
?franchiseId=all
&period=month
```

Response: All franchises' revenue combined

---

## 🚀 Auto-Update Management

### Check for Updates
```
GET /api/franchises/:franchiseId/updates/available
```

Response:
```json
{
  "hasUpdate": true,
  "version": "1.2.0",
  "changes": ["GPS verification fix", "Stripe integration"],
  "releaseDate": "2025-11-23"
}
```

### Pull Latest Update
```
POST /api/franchises/:franchiseId/updates/pull
```

Response:
```json
{
  "status": "updating",
  "currentVersion": "1.1.0",
  "newVersion": "1.2.0",
  "estimatedTime": "30 seconds"
}
```

### Check Update Status
```
GET /api/franchises/:franchiseId/updates/status
```

---

## 🎯 Implementation Priority

**Immediate (MVP):**
1. Create franchise
2. List franchises
3. Get franchise details
4. Get franchisee's isolated company/workers/jobs

**Short-term (v1.1):**
1. Billing management
2. License status updates
3. Analytics per franchisee

**Medium-term (v1.2):**
1. Auto-update system
2. Data export/backup
3. Compliance reporting

**Long-term (v2.0):**
1. Revenue reporting (aggregated)
2. Advanced analytics
3. White-label customization UI

