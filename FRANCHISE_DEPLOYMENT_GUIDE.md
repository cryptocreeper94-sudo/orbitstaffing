# ORBIT Franchisee Deployment Guide

## 🚀 Quick Start (New Franchisee Setup)

### Step 1: Create Franchisee Replit Team Workspace
1. Go to Replit.com
2. Create new Team: "Superior Staffing - ORBIT"
3. Create new workspace from this repo: `orbitstaffing/orbit-core`
4. Team now has their own isolated instance

### Step 2: Configure Environment
1. Copy `.env.franchisee.example` → `.env.local`
2. Fill in these values:
```
VITE_FRANCHISE_NAME="Superior Staffing"
VITE_FRANCHISE_ID="superior-staffing-001"
VITE_BRAND_COLOR="#FF6B35"  (Their brand color)
VITE_CUSTOM_DOMAIN="superiorfstaffing.orbitstaffing.net"
DATABASE_URL="..." (Replit provides this automatically)
VITE_ADMIN_PIN="7777"  (Their admin PIN)
```

3. Run database migration:
```bash
npm run db:push
```

### Step 3: Seed Demo Data
```bash
npm run seed
```

### Step 4: Configure Branding
Update `client/index.html`:
- App title → "Superior Staffing - Powered by ORBIT"
- Meta tags → Their company info
- Logo → Replace with their logo

### Step 5: Launch
```bash
npm run dev
```

They now have their own ORBIT instance with:
- ✅ Isolated database (only their data)
- ✅ White-label branding
- ✅ Same ORBIT core features
- ✅ Full operational independence

---

## 📊 What Each Franchisee Gets

```
Superior Staffing Team Workspace
├── Code (from ORBIT master repo)
├── Database (isolated, only their data)
├── Admin Panel (their PIN: 7777)
├── Owner Dashboard (their operations)
├── Worker Portal (their employees)
└── Billing System (their revenue)
```

**Data Isolation:**
- Superior Staffing workers ≠ Memphis Temps workers
- Superior Staffing jobs ≠ Memphis Temps jobs
- Completely separate databases

---

## 🔄 Managing Updates

### When ORBIT Adds Features

**Scenario:** You add Stripe payment processing to core ORBIT

**Step 1:** Test in your master workspace
```bash
# Your repo (this one)
npm run dev
# Test Stripe integration
```

**Step 2:** Push to GitHub
```bash
git commit -m "Add Stripe payment processing"
git push origin main
```

**Step 3:** Each Franchisee Pulls Updates
```bash
# Superior Staffing Workspace (Replit)
git pull origin main
npm run db:push  (if schema changed)
npm run dev
```

**Result:** All franchisees instantly have Stripe payments

---

## 🐛 Support & Remote Access

### If Superior Staffing Reports a Bug

**Option 1: They Message You**
> "Our GPS clock-in isn't working in Ohio"

**Option 2: You Remote In**
1. Ask for workspace collaboration invite
2. They accept (like you do with developers)
3. You can edit their code live
4. You test the fix in their workspace
5. You commit fix to central repo
6. All other franchises get it next update

---

## 💰 Billing & Contracts

### Superior Staffing Franchise Terms

| Item | Value |
|------|-------|
| Franchise Fee | $499/month (fixed) or 2% revenue share |
| Workers Supported | 500 max |
| Clients Supported | 50 max |
| License Period | 1 year renewable |
| Support Period | 1 year warranty included |
| Updates | Automatic (they pull when ready) |
| Data | Completely isolated to them |

---

## 📋 Franchise Onboarding Checklist

- [ ] Create Replit Team workspace
- [ ] Clone ORBIT repo
- [ ] Configure .env.local with their settings
- [ ] Update branding (colors, logo, name)
- [ ] Run database migration (`npm run db:push`)
- [ ] Seed demo data (`npm run seed`)
- [ ] Create initial admin user with their PIN
- [ ] Test all core workflows (job creation, worker assignment, payroll)
- [ ] Train their team on ORBIT
- [ ] Set up billing/contract
- [ ] Enable auto-update notifications
- [ ] Provide support contact info

---

## 🎯 Multiple Franchises Management

```
ORBIT Master Repo (Your Repository)
    ↓
    ├─ Superior Staffing Workspace (Their Replit Team)
    │  └─ data: isolated
    │
    ├─ Memphis Temps Workspace (Their Replit Team)
    │  └─ data: isolated
    │
    └─ Nashville Staffing Group Workspace (Their Replit Team)
       └─ data: isolated
```

**When you update master repo:**
1. All franchises see the update available
2. They can pull when ready
3. No disruption to running businesses
4. Zero downtime updates

---

## 🔒 Security & Compliance

Each franchisee workspace has:
- ✅ Own database (data isolation)
- ✅ Own admin PIN (access control)
- ✅ Own SSL certificate (HTTPS)
- ✅ Audit trails (activity logging)
- ✅ State compliance (configured per franchise)
- ✅ Encrypted passwords (bcrypt)
- ✅ GDPR-ready (data export/deletion)

---

## 💡 Cost Breakdown per Franchisee

| Item | Cost | Notes |
|------|------|-------|
| Replit Team Workspace | $10-50/mo | Hosting + compute |
| Database | Included | Neon PostgreSQL |
| Your Support | Varies | Remote access billable |
| **Total to You** | **~$15-60/mo** | **Very low overhead** |
| **Franchisee Pays You** | **$499/mo** | **Fixed model** |
| **Your Margin** | **~87%** | **Highly profitable** |

---

## 🚀 Ready to Deploy Your First Franchise?

1. ✅ You have the master ORBIT repo (this one)
2. ✅ You have the franchises database table
3. ✅ You have the environment template
4. ✅ You have the deployment guide

**Next step:** When you're ready to sell to Superior Staffing:
1. Create their Replit Team
2. Clone your repo
3. They follow this guide
4. 1 hour later: They're live with ORBIT

---

## 📞 Support Questions?

**Q: What if they want custom features?**
- A: You add to core ORBIT, they pull update, everyone gets it

**Q: What if they want their own server?**
- A: They can self-host, but lose automatic updates

**Q: What if they stop paying?**
- A: Disable their license in franchises table, their workspace still runs but with warnings

**Q: Can they see other franchisees' data?**
- A: No. Complete data isolation per Replit workspace + database

---

## 🎉 You're Ready to Scale to 50+ Franchises

Each one:
- Independent Replit workspace
- Same ORBIT code
- Isolated data
- Automatic updates
- Minimal your overhead

**$13M ARR with minimal operational cost = achievable** ✅
