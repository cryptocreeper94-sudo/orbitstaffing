# ORBIT Staffing OS - Admin Roles & Access Control Policy

**Effective Date:** November 22, 2025  
**Owner:** Jason / DarkWave Studios LLC

---

## 1. OVERVIEW

ORBIT has a **strict, hierarchical admin role system**:
- **Only Jason (CEO/Owner)** can assign, modify, or remove admin roles
- **Admin roles are LIMITED** - No coding, system changes, or architecture modifications
- **Role hierarchy is fixed** - Cannot be changed by admins themselves
- **Access is audited** - All admin actions logged and reviewed

---

## 2. ROLE HIERARCHY

### **Level 0: Owner (Jason)**
**Only Role:** CEO/Founder  
**Can:**
- ✅ Assign any admin role
- ✅ Remove admin roles
- ✅ Modify system code and architecture
- ✅ Create new features and integrations
- ✅ Change policies and procedures
- ✅ Override any decision
- ✅ Access all data (confidential, worker, client, financial)
- ✅ Modify role permissions
- ✅ Change pricing and billing
- ✅ Approve franchise licenses

**Cannot:**
- Nothing. Owner has full control.

---

### **Level 1: Operations Manager**
**Who:** 1-2 trusted staff managing day-to-day operations  
**Can:**
- ✅ Assign workers to jobs
- ✅ Approve/deny conversion requests
- ✅ Manage worker and client disputes
- ✅ Generate reports (revenue, payroll, compliance)
- ✅ Access worker and client data (non-financial)
- ✅ Approve invoice corrections
- ✅ Send notifications to workers/clients
- ✅ Track GPS verification and hours

**Cannot:**
- ❌ Access financial data (pricing, payment terms)
- ❌ Access CEO confidential information
- ❌ Modify system code or features
- ❌ Change pricing or billing models
- ❌ Create new admin accounts
- ❌ Change franchise terms
- ❌ Override CEO decisions
- ❌ Export confidential data

---

### **Level 2: Compliance Manager**
**Who:** 1-2 staff handling worker/client compliance  
**Can:**
- ✅ Track I-9 verification status
- ✅ Monitor prevailing wage compliance
- ✅ Review audit trails
- ✅ Generate compliance reports
- ✅ Access worker compliance data
- ✅ Review conversion eligibility
- ✅ Track GPS/timesheet accuracy

**Cannot:**
- ❌ Modify compliance rules or policies
- ❌ Override GPS verification data
- ❌ Change worker or client status without approval
- ❌ Access financial or pricing data
- ❌ Approve invoices or payments
- ❌ Modify system code
- ❌ Change admin roles

---

### **Level 3: Support/HR Manager**
**Who:** 1-2 staff handling worker communications  
**Can:**
- ✅ Respond to worker inquiries
- ✅ Send shift notifications and reminders
- ✅ Track worker availability
- ✅ Process worker onboarding
- ✅ Manage worker profile information
- ✅ Send employment verification letters
- ✅ Handle basic worker complaints

**Cannot:**
- ❌ Access client financial or confidential data
- ❌ Approve/deny worker conversions
- ❌ Modify compliance tracking
- ❌ Override assignment decisions
- ❌ Change billing or pricing
- ❌ Access system code or architecture
- ❌ Create admin accounts

---

### **Level 4: Franchise Manager** (Optional)
**Who:** Manager overseeing franchisee operations  
**Can:**
- ✅ View franchise agency's dashboard
- ✅ Access franchise agency's workers/clients (not other franchises)
- ✅ Approve franchise assignments
- ✅ Track franchise compliance
- ✅ Generate franchise reports

**Cannot:**
- ❌ Access other franchise data
- ❌ Access parent company confidential data
- ❌ Modify franchise terms or pricing
- ❌ Override parent company decisions
- ❌ Assign roles or modify permissions
- ❌ Access system code

---

### **Level 5: Read-Only Access**
**Who:** Sales reps, accountants, or external advisors  
**Can:**
- ✅ View general dashboards (no financial data)
- ✅ View non-confidential reports
- ✅ Read documentation and policies
- ✅ Access public feature requests

**Cannot:**
- ❌ Make any changes
- ❌ View confidential information
- ❌ Access worker/client data
- ❌ Generate custom reports
- ❌ Export data
- ❌ Assign roles

---

## 3. ADMIN ASSIGNMENT PROCESS

### **Only Jason Can Assign Roles**

**Process:**
1. Jason identifies candidate for admin role
2. Candidate signs **NDA** (absolute requirement)
3. Jason assigns role through admin panel
4. System sends notification to new admin
5. New admin receives role-specific access
6. All actions logged with timestamp

### **Role Removal**
- Jason can remove any admin role at any time
- No notice required
- All access immediately revoked
- Data access audit trail preserved
- Confidential documents become inaccessible

---

## 4. ABSOLUTE RESTRICTIONS

### **No Admin Can:**
❌ Modify system code or architecture  
❌ Access database directly (no SQL queries)  
❌ Create new features or integrations  
❌ Change password policies or security settings  
❌ Assign or remove other admin roles  
❌ Delete or hide audit trails  
❌ Export confidential data without approval  
❌ Override Jason's decisions  
❌ Modify pricing, billing, or franchise terms  
❌ Change compliance rules or policies  

### **Violations Result In:**
- Immediate role removal
- Account access revoked
- Legal action for breach of confidentiality
- Potential criminal charges (depending on severity)

---

## 5. CONFIDENTIAL DOCUMENT ACCESS

### **Documents with Admin-Only Access:**
- NDA_AGREEMENT.md
- ADMIN_ROLES_POLICY.md (this file)
- CSA_CLIENT_SERVICE_AGREEMENT.md (Section 15: System Disclaimer)
- MIKE_FRANCHISE_OFFER.md
- Financial records and pricing strategies
- Worker payment history (except for your assigned workers)
- Client payment terms and contracts

### **Who Can Access What:**

| Document | Owner | Ops Manager | Compliance | Support | Franchise Mgr |
|----------|-------|-------------|-----------|---------|---------------|
| NDA | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin Policy | ✅ | ❌ | ❌ | ❌ | ❌ |
| CSA Full | ✅ | ✅ | ✅ | ❌ | ❌ |
| Franchise Offers | ✅ | ❌ | ❌ | ❌ | ❌ |
| Worker Payment | ✅ | ✅ | ❌ | Limited | Limited |
| Client Contracts | ✅ | ✅ | ✅ | ❌ | Limited |
| Compliance Rules | ✅ | ✅ | ✅ | Limited | Limited |

---

## 6. AUDIT LOGGING

### **All Admin Activity is Logged:**
- ✅ Who accessed what data
- ✅ When they accessed it
- ✅ What changes they made
- ✅ Login/logout timestamps
- ✅ Failed access attempts
- ✅ Data exports or downloads

### **Jason Can Review:**
- Daily admin activity summaries
- Suspicious access patterns
- Data export history
- Failed authentication attempts
- Role assignment history

### **Logs Cannot Be Deleted**
- Admins cannot modify or delete audit logs
- Logs stored in secure database
- Backups preserved for 7 years
- Tampering detected and alerts Jason immediately

---

## 7. ROLE-SPECIFIC RESPONSIBILITIES

### **Operations Manager Duties:**
- Monitor daily assignments and worker availability
- Review GPS verification data for discrepancies
- Approve conversion requests with CEO
- Resolve scheduling conflicts
- Generate weekly operational reports
- Ensure timely shift notifications to workers

### **Compliance Manager Duties:**
- Track I-9 and employment verification status
- Monitor prevailing wage compliance
- Review audit trails for compliance issues
- Generate monthly compliance reports
- Flag any regulatory violations
- Maintain compliance documentation

### **Support/HR Manager Duties:**
- Respond to worker inquiries within 24 hours
- Send shift reminders and notifications
- Process new worker onboarding
- Update worker profile information
- Handle basic complaints and questions
- Manage worker scheduling requests

---

## 8. REMOTE ACCESS & SECURITY

### **Admin Security Requirements:**
1. **Strong passwords:** Minimum 16 characters, mixed case, numbers, symbols
2. **Two-factor authentication:** Mandatory for all admin accounts
3. **VPN required:** All access through company VPN only
4. **Device encryption:** Personal devices must be encrypted
5. **No public Wi-Fi:** Admin access only on secure networks
6. **Session timeout:** 30 minutes of inactivity = automatic logout
7. **Laptop locking:** Lock computer when away from desk

### **Violations:**
- Immediate suspension of admin privileges
- Potential security review
- Legal action if confidential data accessed

---

## 9. TERMINATION & OFFBOARDING

### **When Admin Leaves:**
1. Jason removes role immediately
2. All access revoked within 1 hour
3. Passwords reset
4. Two-factor authentication disabled
5. VPN access removed
6. Confidential documents marked inaccessible
7. Final audit of their activity
8. Exit interview regarding confidentiality

### **Post-Termination:**
- Cannot access ORBIT systems
- Still bound by NDA indefinitely
- Cannot disclose information learned on the job
- Violations result in legal action

---

## 10. ESCALATION & COMPLAINTS

### **If You Witness Abuse:**
- Report to Jason immediately
- Provide evidence of violation
- Include timestamps and details
- Do not confront the person directly
- Do not discuss with other staff

### **Consequence Framework:**
| Violation | Consequence |
|-----------|-------------|
| Accessing unauthorized data (1x) | Warning + retraining |
| Accessing unauthorized data (2x) | Suspension for 1 week |
| Accessing unauthorized data (3x+) | Immediate termination + legal action |
| Sharing confidential info | Immediate termination + legal action |
| Attempting code changes | Immediate termination + legal action |
| Helping others bypass access | Immediate termination + legal action |

---

## 11. POLICY UPDATES

**This policy is effective immediately.**

Jason will update this policy as ORBIT grows. All admins will be notified of changes.

Current version: 1.0  
Last updated: November 22, 2025  
Next review: June 22, 2026

---

**CONFIDENTIAL - ADMIN ONLY**

This document must not be shared with non-admin staff.  
Sharing this policy with unauthorized persons is a violation of your NDA.  
All admins acknowledge receipt and understanding of this policy.
