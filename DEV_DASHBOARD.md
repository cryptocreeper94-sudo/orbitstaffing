# Developer Dashboard - ORBIT Staffing OS

Quick reference for all development tasks and configurations.

---

## GitHub Repository

**Repository URL:** `https://github.com/cryptocreeper94-sudo/orbitstaffing.git`

**Quick Push to GitHub:**

```bash
git add .
git commit -m "your message here"
git push https://$(git config user.name):$ORBIT_GITHUB_TOKEN@github.com/Cryptocreeper94-sudo/orbitstaffing.git main
```

**Or as one-liner:**
```bash
git add . && git commit -m "your message" && git push https://$(git config user.name):$ORBIT_GITHUB_TOKEN@github.com/Cryptocreeper94-sudo/orbitstaffing.git main
```

**GitHub Token:** Stored in Replit Secrets as `ORBIT_GITHUB_TOKEN`

---

## Application Info

**Application Name:** ORBIT Staffing OS  
**Company:** DarkWave Studios  
**Environment:** Development (Replit)  
**Database:** PostgreSQL (Neon) via `DATABASE_URL`

---

## Running the App

**Start Development Server:**
```bash
npm run dev
```

**Application runs on:** `http://localhost:5000`

---

## Key Secrets Available

| Secret Name | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ORBIT_GITHUB_TOKEN` | GitHub push access |
| `PGHOST` | Database host |
| `PGPORT` | Database port |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
| `PGDATABASE` | Database name |
| `ADMIN_PIN` | Developer panel PIN (0424) |
| `ORBIT_DEV_PIN` | Sidonie's PIN (4444) |

---

## Login Credentials

| User | PIN | Purpose |
|---|---|---|
| Developer | 0424 | Developer panel access |
| Sidonie | 4444 | Master admin access |

---

## Recent Documentation Created

**Investor-Facing Documents:**
- `docs/INVESTOR_ROADMAP.md` - Complete investment guide with SAFE terms, valuation, exit strategy, and social media marketing tactics
- `docs/EXECUTIVE_SUMMARY.md` - Updated with investor section
- `docs/VERSION_2_ROADMAP.md` - Product roadmap including ISO 20022
- `docs/ISO_20022_IMPLEMENTATION.md` - Enterprise banking compliance roadmap

**Marketing Strategy:**
- Dual approach: User marketing (staffing agencies) + Investor marketing (VCs, angels)
- LinkedIn: 3x/week posts (50% metrics, 30% industry insights, 20% founder story)
- Twitter/X: Daily hot takes and thought leadership
- TechCrunch: Quarterly press releases

---

## Development Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Wouter |
| Backend | Express.js + Node.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| UI Components | Radix UI + Tailwind CSS |
| Real-time | WebSocket |
| Mobile | React Native + Expo |

---

## Database Operations

**Run Migrations:**
```bash
npm run db:push
```

**Generate Migration:**
```bash
npm run db:generate
```

**Reset Database:**
```bash
npm run db:reset
```

---

## Package Management

**Install Dependencies:**
```bash
npm install
```

**Install Specific Package:**
```bash
npm install package-name
```

---

## File Structure Overview

```
/
├── client/              # React frontend
│   └── src/
│       ├── pages/      # Wouter routes
│       └── components/ # React components
├── server/              # Express backend
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Database interface
│   └── index-dev.ts    # Dev server entry
├── shared/              # Shared types
│   └── schema.ts       # Drizzle schema & Zod types
├── docs/                # Documentation (DO NOT EDIT without permission)
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

---

## Important Notes

⚠️ **DO NOT EDIT** without explicit instruction:
- `replit.md` - User preferences and architecture
- `docs/` folder - Investor and compliance documentation

✅ **CAN EDIT:**
- Client components and pages
- Server routes and storage
- Database schema (via Drizzle)
- Package dependencies

---

## Last Updated

**Date:** November 28, 2025  
**Changes:** Added complete investor roadmap, dual marketing strategy, GitHub push command

---

## Quick Links

- **Landing Page:** `/`
- **Developer Panel:** PIN 0424
- **Admin Panel:** PIN 4444 (Sidonie)
- **GitHub:** https://github.com/cryptocreeper94-sudo/orbitstaffing
- **Investor Roadmap:** `docs/INVESTOR_ROADMAP.md`
