# ORBIT Staffing OS - Database Schema

## Overview
Complete PostgreSQL schema for ORBIT platform with all necessary tables for full-cycle staffing operations.

---

## Core Tables

### 1. Users (Authentication & Accounts)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'worker', 'admin', 'manager', 'client'
  company_id UUID REFERENCES companies(id),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Companies (Business Accounts)
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100), -- 'staffing', 'healthcare', 'construction', 'hospitality', 'trades', 'events'
  email VARCHAR(255),
  phone VARCHAR(20),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. State Compliance Config
```sql
CREATE TABLE state_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_code VARCHAR(2) NOT NULL UNIQUE, -- 'TN', 'KY', etc.
  state_name VARCHAR(100),
  
  -- Tax Information
  state_tax_rate DECIMAL(5,3),
  unemployment_rate DECIMAL(5,3),
  workers_comp_rate DECIMAL(5,3),
  
  -- Prevailing Wage
  prevailing_wage_enabled BOOLEAN,
  prevailing_wage_rates JSONB, -- {job_type: hourly_rate}
  
  -- I-9 Requirements
  i9_requirements_text TEXT,
  i9_valid_documents JSONB,
  
  -- Labor Laws
  minimum_wage DECIMAL(5,2),
  overtime_threshold INTEGER,
  meal_break_required BOOLEAN,
  meal_break_duration INTEGER, -- minutes
  rest_break_required BOOLEAN,
  rest_break_duration INTEGER,
  
  -- Compliance Notes
  special_requirements TEXT,
  last_updated TIMESTAMP DEFAULT NOW()
);
```

### 4. Workers
```sql
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  
  -- Personal Info
  ssn_encrypted VARCHAR(255), -- encrypted storage
  date_of_birth DATE,
  drivers_license VARCHAR(50),
  
  -- Skills & Work Info
  skills JSONB, -- ['electrician', 'plumber', etc.]
  hourly_wage DECIMAL(8,2),
  availability_status VARCHAR(50), -- 'available', 'on_assignment', 'on_leave'
  
  -- Compliance
  i9_verified BOOLEAN DEFAULT false,
  i9_verified_date TIMESTAMP,
  background_check_status VARCHAR(50), -- 'pending', 'approved', 'failed'
  background_check_date TIMESTAMP,
  e_verify_status VARCHAR(50), -- 'not_started', 'in_progress', 'verified', 'failed'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Clients (Company Customers)
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  
  -- Client Info
  business_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  
  -- Geofencing
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  geofence_radius_feet INTEGER DEFAULT 250,
  
  -- Billing
  billing_address VARCHAR(255),
  payment_terms VARCHAR(50), -- 'net_15', 'net_30', 'net_45'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  
  -- Job Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  job_category VARCHAR(100),
  skill_required VARCHAR(100),
  
  -- Rates
  worker_wage DECIMAL(8,2), -- what we pay worker
  bill_rate DECIMAL(8,2), -- what we charge client
  markup_multiplier DECIMAL(5,2), -- typically 1.35
  
  -- Schedule
  start_date DATE,
  end_date DATE,
  job_status VARCHAR(50), -- 'open', 'assigned', 'in_progress', 'completed'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7. Assignments (Worker → Job Placement)
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  worker_id UUID REFERENCES workers(id),
  client_id UUID REFERENCES clients(id),
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  
  -- Status
  status VARCHAR(50), -- 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled'
  confirmation_required BOOLEAN DEFAULT true,
  confirmed_by_worker BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP,
  
  -- Rates
  worker_rate DECIMAL(8,2),
  bill_rate DECIMAL(8,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8. Timesheets
```sql
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  assignment_id UUID REFERENCES assignments(id),
  worker_id UUID REFERENCES workers(id),
  
  -- Clock In/Out
  clock_in_time TIMESTAMP,
  clock_in_latitude DECIMAL(9,6),
  clock_in_longitude DECIMAL(9,6),
  clock_in_verified BOOLEAN,
  
  clock_out_time TIMESTAMP,
  clock_out_latitude DECIMAL(9,6),
  clock_out_longitude DECIMAL(9,6),
  clock_out_verified BOOLEAN,
  
  -- Breaks
  lunch_start TIMESTAMP,
  lunch_end TIMESTAMP,
  lunch_duration_minutes INTEGER,
  
  breaks JSONB, -- [{start, end, duration}]
  
  -- Totals
  total_hours_worked DECIMAL(8,2),
  break_hours DECIMAL(8,2),
  billable_hours DECIMAL(8,2),
  
  -- Status
  status VARCHAR(50), -- 'draft', 'submitted', 'approved', 'rejected'
  submitted_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 9. Payroll
```sql
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  worker_id UUID REFERENCES workers(id),
  
  -- Period
  pay_period_start DATE,
  pay_period_end DATE,
  
  -- Calculations
  gross_pay DECIMAL(10,2),
  federal_tax DECIMAL(10,2),
  state_tax DECIMAL(10,2),
  fica_tax DECIMAL(10,2),
  other_deductions DECIMAL(10,2),
  net_pay DECIMAL(10,2),
  
  -- Status
  status VARCHAR(50), -- 'pending', 'processed', 'paid'
  processed_date TIMESTAMP,
  paid_date TIMESTAMP,
  
  -- Payment Method
  payment_method VARCHAR(50), -- 'direct_deposit', 'check'
  bank_account_last_four VARCHAR(4),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 10. Invoices
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  
  -- Period
  invoice_number VARCHAR(50) UNIQUE,
  invoice_date DATE,
  due_date DATE,
  
  -- Amounts
  subtotal DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  
  -- Status
  status VARCHAR(50), -- 'draft', 'sent', 'overdue', 'paid'
  sent_date TIMESTAMP,
  paid_date TIMESTAMP,
  payment_amount DECIMAL(10,2),
  
  -- Line Items (stored as JSONB)
  line_items JSONB, -- [{assignment_id, description, hours, rate, amount}]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 11. Feedback/Suggestions
```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  
  feedback_text TEXT NOT NULL,
  email VARCHAR(255),
  category VARCHAR(100),
  
  status VARCHAR(50), -- 'new', 'reviewed', 'implemented', 'rejected'
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 12. Messages (Internal Communication)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  
  subject VARCHAR(255),
  content TEXT,
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  attachment_url VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. Time Off Requests
```sql
CREATE TABLE time_off_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  worker_id UUID REFERENCES workers(id),
  
  request_date DATE,
  start_date DATE,
  end_date DATE,
  
  reason VARCHAR(255),
  status VARCHAR(50), -- 'pending', 'approved', 'rejected'
  
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Indexes (Performance)

```sql
-- Critical lookup indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_workers_company_id ON workers(company_id);
CREATE INDEX idx_assignments_worker_id ON assignments(worker_id);
CREATE INDEX idx_assignments_job_id ON assignments(job_id);
CREATE INDEX idx_timesheets_assignment_id ON timesheets(assignment_id);
CREATE INDEX idx_timesheets_worker_id ON timesheets(worker_id);
CREATE INDEX idx_payroll_worker_id ON payroll(worker_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- Date-based queries
CREATE INDEX idx_assignments_start_date ON assignments(start_date);
CREATE INDEX idx_timesheets_clock_in_time ON timesheets(clock_in_time);
CREATE INDEX idx_payroll_pay_period ON payroll(pay_period_start, pay_period_end);
```

---

## API Endpoints (Will be built in Phase 2)

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Workers
- `GET /api/workers` - List all workers for company
- `POST /api/workers` - Create new worker (onboarding)
- `PATCH /api/workers/:id` - Update worker
- `GET /api/workers/:id` - Get worker details

### Assignments & Jobs
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments
- `PATCH /api/assignments/:id` - Update status

### Timesheets
- `POST /api/timesheets/clock-in` - Clock in with GPS
- `POST /api/timesheets/clock-out` - Clock out with GPS
- `GET /api/timesheets` - List timesheets
- `PATCH /api/timesheets/:id/approve` - Approve timesheet

### Payroll
- `POST /api/payroll/process` - Process payroll
- `GET /api/payroll` - View payroll history

### Invoices
- `POST /api/invoices/generate` - Generate from timesheets
- `GET /api/invoices` - List invoices

### State Compliance
- `GET /api/compliance/states` - List all states
- `GET /api/compliance/states/:code` - Get state-specific compliance data
- `PATCH /api/compliance/states/:code` - Update state data (admin only)

---

## Security Notes

1. **SSN Storage:** Always encrypt at rest using AES-256
2. **GPS Data:** Store with timezone info, validate against geofence
3. **Payroll:** Audit log all modifications
4. **Access Control:** Role-based (worker can only see own data, managers see team, admins see all)
5. **Compliance:** Immutable audit trail for I-9, background checks, tax filings

---

**Schema Version:** 1.0  
**Last Updated:** November 23, 2025  
**Author:** ORBIT Development Team
