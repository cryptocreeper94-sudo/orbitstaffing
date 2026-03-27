# ORBIT Staffing OS

Enterprise staffing operations platform — workforce management, shift scheduling, employee onboarding, time tracking, payroll integration, and compliance.

**Live:** [orbitstaffing.io](https://orbitstaffing.io)

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite 7 (Radix UI) |
| Backend | Express + TypeScript |
| Database | PostgreSQL (Drizzle ORM) |
| Payments | Stripe |
| Auth | Trust Layer SSO |
| Deployment | Render (Ohio) |

## Structure

```
orbitstaffing/
├── server/
│   └── routes.ts     # 16,788 lines — API routes
├── client/           # React SPA
├── shared/           # Drizzle schema
└── render.yaml
```

## Development

```bash
npm install
npm run dev
npm run db:push
```
