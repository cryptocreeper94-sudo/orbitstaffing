# ORBIT Staffing OS - Legal & Compliance Checklist

## ⚠️ CRITICAL LEGAL CONSIDERATIONS BEFORE LAUNCH

### SECTION 1: DATA PRIVACY & SECURITY

**Compliance Requirements:**
- [ ] Privacy Policy created and accessible in app ✅ DONE
- [ ] Terms of Service created ✅ DONE
- [ ] Data retention policy established ✅ DONE
- [ ] GDPR compliance (if EU users) - Plan for CCPA, GDPR data deletion
- [ ] State-specific data law compliance (varies by state)

**Action Items:**
- [ ] Consult privacy attorney (CRITICAL) - $500-$2K initial review
  - Focus: Data handling for health info, SSN, location data
  - Deliverable: Legal memo on compliance gaps
  
- [ ] Implement data deletion workflow (for GDPR/CCPA compliance)
  - On-demand data export for users
  - Automatic deletion after retention periods
  - Audit trails for all deletions

**Timeline:** Before Google Play submission ← RECOMMEND THIS WEEK

---

### SECTION 2: DRUG TESTING COMPLIANCE

**Federal Requirements:**
- [ ] DOT regulations compliance (if any DOT work)
- [ ] SAMHSA chain of custody procedures documented
- [ ] Lab certifications verified (CLIA/CAP)
- [ ] Results handling per federal guidelines

**State Requirements (VARIES by STATE):**
- [ ] TN (Tennessee): State-specific drug testing laws reviewed
- [ ] KY (Kentucky): State-specific drug testing laws reviewed
- [ ] FL (Florida): State-specific drug testing laws reviewed
- [ ] Other states: Document requirements as you expand

**Action Items:**
- [ ] Employment law attorney review drug testing procedures
  - Cost: $1,500-$3K for state-specific review
  - Deliverable: Compliance memo per state
  
- [ ] Verify drug test provider certifications (Concentra, Fast Pace, etc.)
  - Check CLIA/CAP certifications
  - Ensure chain of custody documentation
  - Verify result accuracy procedures

**Timeline:** Before Mike/Dan beta test (next week)

**Key Risk:** Improper drug testing = worker lawsuits + penalties up to $10K+ per violation

---

### SECTION 3: BACKGROUND CHECKS

**FCRA (Fair Credit Reporting Act) Compliance:**
- [ ] Applicant consent obtained before checks
- [ ] Adverse action notice if candidate disqualified
- [ ] Right to dispute process clear
- [ ] Privacy of check results protected

**Action Items:**
- [ ] Review FCRA compliance with background check provider
- [ ] Ensure consent process built into app
- [ ] Create adverse action notice template

**Timeline:** Before beta testing

---

### SECTION 4: WORKERS COMPENSATION

**Health Information Handling:**
- [ ] Incident reports properly secured (HIPAA-like protection)
- [ ] Medical records encrypted at rest/transit
- [ ] Claims data segregated from worker data
- [ ] Only authorized users access health data

**State-Specific Requirements:**
- [ ] TN workers comp regulations reviewed
- [ ] KY workers comp regulations reviewed
- [ ] FL workers comp regulations reviewed
- [ ] Incident reporting timelines met

**Action Items:**
- [ ] Consult workers compensation attorney
  - Cost: $1,000-$2K
  - Deliverable: Compliance checklist per state
  
- [ ] Ensure incident-to-drug-test workflow is legally sound
  - Verify timing (when to order test after incident)
  - Confirm authorization requirements

**Timeline:** Before production use with real incidents

**Key Risk:** Improper incident handling = workers comp liability, fines, worker lawsuits

---

### SECTION 5: EMPLOYMENT LAW

**Federal Requirements:**
- [ ] Wage & Hour compliance (minimum wage, overtime)
- [ ] EEOC non-discrimination policies
- [ ] ADA accommodations documented
- [ ] I-9 verification process defined
- [ ] Independent contractor vs employee classification

**State Requirements:**
- [ ] State minimum wage compliance
- [ ] State overtime rules
- [ ] State break/rest period rules
- [ ] State leave laws (sick leave, family leave, etc.)

**Action Items:**
- [ ] Create guidance for franchise owners on legal requirements
  - NOT legal advice, but "best practices"
  - Document requirements by state
  - Make it visible in platform

- [ ] Consult employment law attorney on multi-state compliance
  - Cost: $2,000-$5K
  - Deliverable: Compliance guide by state

**Timeline:** Before Mike/Dan use (to help them avoid legal issues)

---

### SECTION 6: GPS TRACKING & LOCATION DATA

**Privacy Concerns:**
- [ ] User consent for GPS tracking obtained
- [ ] Location data only used for clock-in/geofencing
- [ ] Location data encrypted in transit/at rest
- [ ] Automatic location data deletion after X days
- [ ] Workers can access their own location history

**State Laws:**
- [ ] TN employee tracking laws reviewed
- [ ] KY employee tracking laws reviewed
- [ ] FL employee tracking laws reviewed
- [ ] Biometric data laws (if fingerprint/facial ID used)

**Action Items:**
- [ ] Add GPS consent to worker onboarding
- [ ] Create location data retention policy
- [ ] Implement location history deletion (default: 90 days)

**Timeline:** Before beta testing

---

### SECTION 7: PAYMENT & FINANCIAL COMPLIANCE

**PCI-DSS Compliance (Stripe):**
- [ ] Stripe handles payment processing (we don't store cards)
- [ ] No card data in our database
- [ ] PCI-DSS compliance delegated to Stripe ✅

**Employment Tax Issues:**
- [ ] 1099 vs W2 determination guidance
- [ ] Tax withholding requirements explained
- [ ] Payment processing timing for tax filing

**Action Items:**
- [ ] Add disclaimer: "You are responsible for tax withholding & compliance"
- [ ] Create tax requirements guide (link to IRS)

**Timeline:** Before payroll features used

---

### SECTION 8: LIABILITY WAIVERS

**What We Need:**
- [ ] Liability limitation clause (in Terms) ✅ DONE
- [ ] ORBIT not responsible for user compliance issues ✅ DONE
- [ ] Drug test lab errors not ORBIT's liability ✅ DONE
- [ ] GPS accuracy disclaimer (if applicable)
- [ ] Data breach liability cap

**Action Items:**
- [ ] Have attorney review liability clauses
- [ ] Ensure Terms clearly state user responsibilities

**Timeline:** Before launch

---

### SECTION 9: INSURANCE & INDEMNIFICATION

**Business Insurance Needed:**
- [ ] General Liability ($1M minimum)
- [ ] Professional Liability / E&O ($1M minimum)
- [ ] Cyber Liability / Data Breach ($1M minimum)
- [ ] Employment Practices Liability (for workers using platform)

**Cost:** $2,000-$5,000/year for startups

**Action Items:**
- [ ] Purchase cyber liability insurance BEFORE launch
  - Add ORBIT as insured
  - Ensure data breach coverage
  
- [ ] Get insurance certificate of insurance (required for enterprise clients)

**Timeline:** Before Mike/Dan beta (ASAP)

---

### SECTION 10: GOOGLE PLAY STORE COMPLIANCE

**App Store Requirements:**
- [ ] Privacy Policy visible in app ✅ DONE
- [ ] Terms of Service link in app ✅ DONE
- [ ] Age rating: Select 12+ or 16+ (not 18+)
- [ ] No malware/security issues
- [ ] No copyright infringement

**Drug Testing Content:**
- [ ] Clearly state this is for compliance purposes
- [ ] No marketing of drug testing (it's a tool, not a service)
- [ ] Compliance disclaimer

**Action Items:**
- [ ] Add privacy & terms links to app footer
- [ ] Ensure no objectionable content
- [ ] Set age rating appropriately (likely 12+)

**Timeline:** This week for submission

---

### SECTION 11: STATE LICENSING & REGISTRATION

**May be required:**
- [ ] Staffing agency license (varies by state)
- [ ] Drug testing facility registration (if we conduct tests—we don't)
- [ ] Employment agency bond (some states)
- [ ] Professional license (if applicable)

**Action Items:**
- [ ] Research licensing requirements for TN, KY, FL
  - Contact: State Department of Labor
  - Cost: $200-$500 per state
  
- [ ] Register as software vendor (varies by state)

**Timeline:** After launch (can be post-submission)

---

### SECTION 12: DATA BREACH RESPONSE PLAN

**Required:**
- [ ] Breach notification procedures documented
- [ ] Timeline: Notify users within 30 days (federal minimum)
- [ ] Insurance company notification process
- [ ] Law enforcement contact plan
- [ ] Public disclosure plan (if required by state)

**Action Items:**
- [ ] Create incident response plan document
- [ ] Add it to your operations manual

**Timeline:** Before launch

---

## RECOMMENDED IMMEDIATE ACTIONS (Before Google Play Submission)

### TIER 1 (MUST DO - This Week)
1. ✅ Privacy Policy created
2. ✅ Terms of Service created
3. ✅ Add Privacy/Terms links to app
4. ✅ Purchase cyber liability insurance

### TIER 2 (SHOULD DO - Before Beta)
5. Consult privacy attorney ($500-$1K) - review Privacy Policy + data handling
6. Consult employment law attorney ($1-2K) - review compliance features
7. Verify drug test provider certifications
8. Create state-specific compliance guide (TN/KY/FL)

### TIER 3 (NICE TO DO - Post-Launch)
9. SOC 2 Type II certification ($5-10K)
10. State licensing/registration (varies)
11. Incident response plan documentation

---

## ESTIMATED LEGAL COSTS

| Item | Cost | Timeline |
|------|------|----------|
| Privacy attorney review | $500-$1K | This week |
| Employment law review | $1-2K | Before beta |
| Workers comp attorney | $1-2K | Before beta |
| Cyber liability insurance | $2-5K/year | ASAP |
| **TOTAL** | **$4.5-10K** | **Before live use** |

---

## CRITICAL RISKS TO DISCLOSE TO MIKE/DAN

When presenting the platform, be transparent:

1. **You Are Responsible for Compliance**
   - ORBIT provides tools; YOU must use them correctly
   - Talk to an employment law attorney about your state
   - ORBIT is not a substitute for legal advice

2. **Drug Testing Must Follow State/Federal Law**
   - Improper testing = worker lawsuits
   - We handle the logistics; you handle the compliance
   - Verify lab certifications before testing

3. **Data Must Be Protected**
   - You're responsible for worker data security
   - We encrypt it, but you must access securely
   - Report breaches to us immediately

4. **Workers Comp Claims Are Complex**
   - Use ORBIT to track/document incidents
   - Contact insurance carrier for claim handling
   - We're not liable for claim denials

---

## ATTORNEY CONSULTATION TEMPLATE

When contacting attorneys, say:

*"We're launching a SaaS platform for staffing agencies. It handles worker management, background checks, drug testing coordination, payroll, and GPS-verified clock-in. We operate in [TN/KY/FL]. What compliance issues should we address before launch?"*

Then ask specifically about:
1. Drug testing compliance in your states
2. Workers compensation incident reporting
3. Employee data privacy requirements
4. Multi-state employment law issues
5. Liability protection for our platform

---

**Bottom Line:** You're legally on solid ground for a beta launch, but hire an attorney for a 1-2 hour review ($500-$1K) to catch state-specific issues before Mike/Dan go live. That $500 saves you from potential $10K+ liability later.
