# ORBIT Staffing OS - External API Integration Strategy

**Date:** November 22, 2025  
**Subject:** Integrating Indeed, LinkedIn, and Other Job Databases

---

## 1. THE OPPORTUNITY

**Jason's Question:** "How can we utilize Indeed/Glass Door databases without shooting ourselves in the foot?"

**Answer:** We become a **PARTNER** to Indeed/LinkedIn, not a competitor.

### Current Situation:
- Indeed has 250M+ job seekers and employers
- LinkedIn has 900M+ professionals
- These platforms already have candidate databases
- They actively recruit employers and jobs

### ORBIT's Advantage:
- We're a **specialized staffing OS** (not a general job board)
- We focus on **temporary/contract work** (their secondary market)
- We offer **direct integration** for staffing agencies
- We provide **managed placements** (not just listings)

---

## 2. PARTNERSHIP MODEL (No Cannibalization)

### **How It Works:**

**Step 1: White-Label Indeed/LinkedIn Search**
- ORBIT workers can search Indeed within our app
- We embed Indeed's job search widget
- Workers find jobs, we don't compete with Indeed
- Indeed benefits from usage data

**Step 2: Cross-Referencing & Verification**
- Worker searches for "Electrician Nashville"
- Indeed shows results
- ORBIT shows complementary ORBIT jobs
- Worker chooses where to apply
- No competition—mutual benefit

**Step 3: Candidate Pool Integration (Optional)**
- Indeed has job seekers constantly applying
- ORBIT partners with Indeed to source candidates
- We PAY for qualified leads (commission-based)
- Indeed gets revenue, ORBIT gets workers

### **Revenue Impact:**
- ✅ Indeed/LinkedIn gets commission on our ORBIT placements
- ✅ ORBIT doesn't compete—we compliment them
- ✅ Workers see more opportunities
- ✅ No "shooting ourselves in the foot"—actually helping them

---

## 3. API INTEGRATION ROADMAP

### **Phase 1: Job Search Integration (Easy, Low-Risk)**

**What:** Embed Indeed job search in ORBIT app

**Implementation:**
- Indeed API: `jobs/search` endpoint
- Filter by: location (user's location), job type, salary
- Display in ORBIT app alongside our jobs
- Link goes to Indeed (they handle the application)

**Advantages:**
- Workers stay in ORBIT app longer
- ORBIT doesn't process the job application
- No direct competition with Indeed
- Indeed sees increased traffic from ORBIT

**Code Example:**
```typescript
// Embedded Indeed Job Search
<div>
  <h2>Jobs on Indeed (Your Area)</h2>
  <IndeedJobSearchWidget 
    location={userLocation}
    jobType="temporary"
    apiKey={INDEED_API_KEY}
  />
  <p className="text-sm">These jobs are on Indeed.com</p>
</div>
```

**Timeline:** 2-4 weeks  
**Cost:** Free (Indeed API requires affiliate agreement, revenue share)

---

### **Phase 2: LinkedIn Job Search (Medium Complexity)**

**What:** Allow workers to search LinkedIn jobs from ORBIT

**Implementation:**
- LinkedIn API: Job Search endpoint
- Filter by: title, location, job level
- Display with "Posted on LinkedIn" badge
- Link to LinkedIn application

**Why This Works:**
- LinkedIn focuses on professional/permanent roles
- ORBIT focuses on temporary/contract work
- Both benefit from cross-promotion
- No direct competition

**Timeline:** 3-6 weeks  
**Cost:** LinkedIn Premium API access ($50-200/month)

---

### **Phase 3: Candidate Sourcing (Higher Complexity)**

**What:** Source pre-qualified candidates from Indeed/LinkedIn

**How It Works:**
1. ORBIT posts job to our system
2. We search Indeed API for relevant job seekers
3. We extract public candidate data (job titles, skills, location)
4. We PAY commission to Indeed for qualified hires
5. Candidates are invited to ORBIT

**Revenue Model:**
- Indeed charges per qualified lead ($5-15 per candidate)
- We only pay when hiring
- Win for Indeed (revenue), win for ORBIT (pre-qualified workers)
- Win for candidates (more opportunities)

**Timeline:** 2-3 months  
**Cost:** $5-15 per hired candidate (commission-based)

---

### **Phase 4: Glassdoor Integration (Optional)**

**What:** Cross-reference company reviews and ratings

**Implementation:**
- Glassdoor API: Company reviews endpoint
- Show company rating when ORBIT shows job
- Workers can read reviews before applying
- Better matching = better placements

**Example:**
```
Client: ABC Manufacturing
Rating: 3.8/5 (450 reviews on Glassdoor)
"Good pay, flexible scheduling" - Recent review
```

**Timeline:** 4-6 weeks  
**Cost:** Glassdoor API partnership fee (custom pricing)

---

## 4. WHY THIS ISN'T CANNIBALIZATION

### **Indeed's Perspective:**
- ORBIT drives traffic to Indeed jobs
- ORBIT helps source workers for Indeed-posted jobs
- ORBIT pays commission for leads
- Win: Additional revenue stream

### **ORBIT's Perspective:**
- Workers find jobs they wouldn't find on ORBIT
- We complement (not compete with) Indeed
- Workers stay in our app longer
- Permanent job placement = conversion to full-time (not bad—they're still our resource while temporary)
- Win: Better customer experience

### **Worker Perspective:**
- More jobs to choose from
- Stay in one app (ORBIT) instead of jumping to Indeed
- One-click application through ORBIT
- Win: Convenience and more options

### **Client Perspective:**
- ORBIT finds better-qualified workers
- We source from proven job databases
- Better matching = better placements
- Win: Higher quality temporary workers

---

## 5. TECHNICAL REQUIREMENTS

### **Authentication & Keys**
- Indeed API Key (request from Indeed)
- LinkedIn OAuth 2.0 credentials
- Glassdoor API Key (partner agreement)
- All stored as environment variables (never hardcoded)

### **Rate Limits**
- Indeed API: 1,000 requests/day (free tier)
- LinkedIn: Custom limits per partnership tier
- Glassdoor: Custom limits

### **Data Privacy**
- ✅ Only display public job postings
- ✅ Only use public candidate data if sourcing
- ✅ Never scrape data (violates ToS)
- ✅ Comply with GDPR/CCPA
- ✅ Get explicit consent from candidates before sourcing

### **Caching**
- Cache Indeed search results for 1 hour
- Cache LinkedIn results for 2 hours
- Reduces API calls, improves performance

---

## 6. IMPLEMENTATION PRIORITY

### **Do First (High Impact, Low Risk):**
1. ✅ Indeed job search integration
2. ✅ Workers can search local jobs without leaving ORBIT
3. ✅ Show alongside ORBIT jobs
4. ✅ Track which workers click Indeed vs. ORBIT jobs

### **Do Second (Medium Impact, Medium Risk):**
1. LinkedIn job search integration
2. Company review ratings (Glassdoor)
3. Cross-referencing for worker verification

### **Do Third (Higher Risk, Requires Partnership):**
1. Candidate sourcing from Indeed/LinkedIn
2. Commission-based lead system
3. Custom API partnerships

---

## 7. COMPETITIVE ADVANTAGE

**This Strategy Makes ORBIT Stand Out:**

| Feature | Indeed | LinkedIn | Staffing Software | ORBIT |
|---------|--------|----------|-------------------|-------|
| Job search | ✅ | ✅ | ❌ | ✅ |
| Job posting | ✅ | ✅ | ✅ | ✅ |
| Candidate sourcing | ✅ | ✅ | ❌ | ✅ |
| Payroll | ❌ | ❌ | ✅ | ✅ |
| GPS verification | ❌ | ❌ | ❌ | ✅ |
| All-in-one platform | ❌ | ❌ | ❌ | ✅ |

**Result:** ORBIT is the **only platform that combines job search + payroll + GPS + conversions**.

---

## 8. LEGAL CONSIDERATIONS

### **Before Integration:**
- ✅ Request API access from Indeed/LinkedIn/Glassdoor
- ✅ Review Terms of Service
- ✅ Get written partnership agreement
- ✅ Ensure data privacy compliance
- ✅ Get legal review of integration

### **Partner Agreements Should Cover:**
- Data usage rights
- Revenue sharing terms
- Rate limits and SLAs
- Termination clauses
- Exclusivity (if any)
- Branding guidelines

### **ORBIT's Obligations:**
- Don't scrape data
- Don't misuse API keys
- Show proper attribution ("Jobs powered by Indeed")
- Comply with platform ToS
- Maintain user privacy

---

## 9. REVENUE OPPORTUNITY

### **Commission-Based Model Example:**

**Scenario:** ORBIT sources 100 candidates from Indeed per month
- Cost per lead: $10
- 50% hire rate: 50 workers hired
- Total cost: $500/month (to Indeed)
- ORBIT value: 50 new temporary workers/month
- ROI: Each worker generates $100-500/month for ORBIT
- **Break-even: Month 1, profit: Month 2+**

### **Glassdoor Ratings Revenue:**
- Show company reviews to workers
- Better matches = higher retention
- Reduced churn = increased revenue
- Cost: Shared revenue agreement

---

## 10. NEXT STEPS

**Immediate (This Month):**
1. Research Indeed API documentation
2. Request API access from Indeed
3. Design Indeed integration UI
4. Estimate implementation timeline

**Short-term (Next Month):**
1. Implement Indeed job search
2. Test with pilot group of workers
3. Measure usage and engagement
4. Iterate based on feedback

**Medium-term (Next Quarter):**
1. Add LinkedIn integration
2. Add Glassdoor company ratings
3. Begin partnerships for candidate sourcing

**Long-term (Next Year):**
1. Commission-based candidate sourcing
2. Custom partnership agreements
3. Revenue sharing with Indeed/LinkedIn

---

## CONCLUSION

**ORBIT doesn't need to compete with Indeed—we should partner with them.**

By integrating their job search and candidate database into ORBIT, we:
- ✅ Provide workers more opportunities
- ✅ Find better-qualified temporary workers
- ✅ Generate additional revenue from commissions
- ✅ Create a truly all-in-one staffing platform
- ✅ Don't cannibalize Indeed (actually help them)

This is win-win-win: Indeed wins (revenue), ORBIT wins (better experience), workers win (more opportunities).

---

**Status:** Strategy Document  
**Owner:** Jason (CEO)  
**Next Review:** December 2025
