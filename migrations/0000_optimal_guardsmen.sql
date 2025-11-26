CREATE TABLE "assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"job_posting_id" varchar,
	"worker_id" varchar,
	"company_id" varchar,
	"assignment_status" varchar(50) DEFAULT 'pending',
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"scheduled_start_time" timestamp,
	"scheduled_end_time" timestamp,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"worker_rating" integer,
	"worker_feedback" text,
	"client_rating" integer,
	"client_feedback" text,
	"hallmark_id" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "background_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"check_type" varchar(50) NOT NULL,
	"requested_date" timestamp DEFAULT NOW(),
	"completed_date" timestamp,
	"status" varchar(50) DEFAULT 'pending',
	"result_status" varchar(50),
	"result_details" jsonb,
	"expiry_date" date,
	"report_url" varchar(255),
	"external_id" varchar(100),
	"external_status" varchar(50),
	"requested_by" varchar,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "billing_confirmations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_request_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"rate_confirmation_id" varchar NOT NULL,
	"hallmark_id" varchar NOT NULL,
	"worker_hourly_rate" numeric(8, 2) NOT NULL,
	"markup_percentage" numeric(5, 2) NOT NULL,
	"billing_hourly_rate" numeric(8, 2) NOT NULL,
	"payment_terms_days" integer DEFAULT 30 NOT NULL,
	"billing_period_start" date NOT NULL,
	"billing_period_end" date NOT NULL,
	"estimated_hours" numeric(8, 2),
	"estimated_invoice_amount" numeric(12, 2),
	"status" varchar(50) DEFAULT 'pending',
	"signed_date" timestamp,
	"signature_data" jsonb,
	"document_content" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "bug_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_by_email" varchar(255) NOT NULL,
	"reported_by_name" varchar(255),
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"error_message" text,
	"stack_trace" text,
	"page_url" varchar(255),
	"user_agent" text,
	"browser_console" text,
	"screenshot_base64" text,
	"screenshot_url" varchar(255),
	"severity" varchar(50) DEFAULT 'medium',
	"category" varchar(100),
	"status" varchar(50) DEFAULT 'new',
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"name" varchar(255) NOT NULL,
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"industry" varchar(100),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"job_types" jsonb,
	"estimated_monthly_spend" numeric(10, 2),
	"status" varchar(50) DEFAULT 'active',
	"csa_status" varchar(50) DEFAULT 'not_signed',
	"csa_signed_date" timestamp,
	"csa_version" varchar(10),
	"csa_document_url" varchar(500),
	"csa_expiration_date" date,
	"csa_signer_name" varchar(255),
	"csa_signature_data" jsonb,
	"csa_signature_ip_address" varchar(100),
	"csa_signature_device" varchar(255),
	"csa_accepted_terms" jsonb,
	"account_owner_id" varchar,
	"account_owner_assigned_date" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"industry" varchar(100),
	"email" varchar(255),
	"phone" varchar(20),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"owner_id" varchar,
	"billing_model" varchar(50) DEFAULT 'fixed',
	"billing_tier" varchar(50) DEFAULT 'startup',
	"revenue_share_percentage" numeric(5, 2) DEFAULT '2.00',
	"monthly_flat_fee" numeric(10, 2) DEFAULT '0',
	"ein" varchar(20),
	"license_number" varchar(100),
	"license_expiration" date,
	"max_workers" integer DEFAULT 100,
	"sms_enabled" boolean DEFAULT false,
	"gps_enabled" boolean DEFAULT true,
	"equipment_tracking_enabled" boolean DEFAULT true,
	"payroll_enabled" boolean DEFAULT true,
	"default_markup_percentage" numeric(5, 2) DEFAULT '1.45',
	"payment_terms_days" integer DEFAULT 30,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "company_hallmarks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"hallmark_prefix" varchar(20) NOT NULL,
	"next_serial_number" integer DEFAULT 1,
	"brand_color" varchar(7) DEFAULT '#06B6D4',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "company_hallmarks_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "company_insurance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"insurance_type" varchar(100) NOT NULL,
	"policy_number" varchar(100) NOT NULL,
	"carrier" varchar(255) NOT NULL,
	"effective_date" date NOT NULL,
	"expiry_date" date NOT NULL,
	"coverage_amount" numeric(12, 2),
	"deductible" numeric(10, 2),
	"annual_premium" numeric(10, 2),
	"covered_states" jsonb,
	"section_3a_endorsements" jsonb,
	"experience_mod_rate" numeric(5, 2),
	"pay_as_you_go" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'active',
	"renewal_date" date,
	"auto_renew" boolean DEFAULT false,
	"certificate_issued" boolean DEFAULT false,
	"certificate_issued_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "compliance_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"check_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"compliance_status" varchar(50),
	"completed_date" timestamp,
	"expiry_date" date,
	"renewal_reminder_sent" boolean DEFAULT false,
	"completed_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "csa_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" varchar(20) NOT NULL,
	"template_content" text NOT NULL,
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"is_active" boolean DEFAULT false,
	"jurisdiction" varchar(2),
	"created_by" varchar,
	"approved_by" varchar,
	"approved_at" timestamp,
	"conversion_fee_dollars" numeric(10, 2) DEFAULT '5000.00',
	"conversion_period_months" integer DEFAULT 6,
	"conversion_period_hours" integer DEFAULT 480,
	"default_markup_multiplier" numeric(5, 2) DEFAULT '1.45',
	"late_payment_interest_rate" numeric(5, 2) DEFAULT '1.50',
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "customer_document_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"preferred_signature_method" varchar(20) DEFAULT 'digital',
	"prefer_invoice_digital" boolean DEFAULT true,
	"prefer_invoice_paper" boolean DEFAULT false,
	"prefer_csa_digital" boolean DEFAULT true,
	"prefer_csa_paper" boolean DEFAULT false,
	"contact_email" varchar(255),
	"special_documentation_requests" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "customer_file_backups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monthly_customer_id" varchar NOT NULL,
	"backup_name" varchar(255) NOT NULL,
	"backup_size_mb" integer NOT NULL,
	"file_count" integer NOT NULL,
	"storage_location" varchar(255),
	"checksum_sha256" varchar(64),
	"status" varchar(50) DEFAULT 'completed',
	"backed_up_at" timestamp DEFAULT NOW(),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "customer_service_agreements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"hallmark_id" varchar NOT NULL,
	"version" varchar(10) DEFAULT '1.0',
	"status" varchar(50) DEFAULT 'draft',
	"markup_percentage" numeric(5, 2) DEFAULT '1.45' NOT NULL,
	"payment_terms_days" integer DEFAULT 30 NOT NULL,
	"signatory_name" varchar(255),
	"signatory_title" varchar(100),
	"signature_method" varchar(20),
	"signed_date" timestamp,
	"signature_data" jsonb,
	"document_content" text,
	"effective_date" date,
	"expiration_date" date,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "developer_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bug_report_id" varchar,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"context" jsonb,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "document_signatures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"csa_id" varchar,
	"nda_id" varchar,
	"signer_name" varchar(255) NOT NULL,
	"signer_email" varchar(255),
	"signer_role" varchar(100),
	"signature_method" varchar(20) NOT NULL,
	"signature_hash" text,
	"ip_address" varchar(45),
	"device_info" varchar(255),
	"paper_upload_url" varchar(500),
	"paper_upload_date" timestamp,
	"signed_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"verified_by" varchar,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "drug_tests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"test_type" varchar(50) NOT NULL,
	"requested_date" timestamp DEFAULT NOW(),
	"completed_date" timestamp,
	"status" varchar(50) DEFAULT 'pending',
	"result" varchar(50),
	"test_details" jsonb,
	"expiry_date" date,
	"report_url" varchar(255),
	"external_id" varchar(100),
	"external_status" varchar(50),
	"requested_by" varchar,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "employee_w4_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"filling_status" varchar(20) NOT NULL,
	"dependents" integer DEFAULT 0,
	"other_income" numeric(10, 2) DEFAULT '0',
	"standard_deduction" boolean DEFAULT true,
	"claimable_deductions" numeric(10, 2) DEFAULT '0',
	"extra_withheld_per_paycheck" numeric(8, 2) DEFAULT '0',
	"effective_year" integer NOT NULL,
	"effective_date" date,
	"is_current_w4" boolean DEFAULT true,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"name" varchar(255) NOT NULL,
	"equipment_type" varchar(100),
	"sku" varchar(100),
	"serial_number" varchar(100),
	"purchase_cost" numeric(10, 2),
	"replacement_cost" numeric(10, 2),
	"daily_rental_cost" numeric(10, 2),
	"status" varchar(50) DEFAULT 'available',
	"condition" varchar(50),
	"assigned_to_worker_id" varchar,
	"assignment_date" timestamp,
	"return_date" timestamp,
	"location_latitude" numeric(9, 6),
	"location_longitude" numeric(9, 6),
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "equipment_sku_unique" UNIQUE("sku"),
	CONSTRAINT "equipment_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'general',
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchisee_team_crm" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"job_title" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"company" varchar(255),
	"address" text,
	"website" varchar(255),
	"linked_in" varchar(255),
	"ocr_confidence" numeric(3, 2),
	"source_image" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchises" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" varchar,
	"parent_franchise_id" varchar,
	"industry" varchar(100),
	"email" varchar(255),
	"phone" varchar(20),
	"website" varchar(255),
	"brand_color" varchar(7) DEFAULT '#06B6D4',
	"logo_url" varchar(255),
	"theme" varchar(50) DEFAULT 'dark',
	"license_key" varchar(100),
	"license_expiration" date,
	"license_status" varchar(50) DEFAULT 'active',
	"territory" varchar(255),
	"exclusivity" boolean DEFAULT true,
	"hallmark_prefix" varchar(20),
	"next_hallmark_serial" integer DEFAULT 1,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "franchises_license_key_unique" UNIQUE("license_key"),
	CONSTRAINT "franchises_hallmark_prefix_unique" UNIQUE("hallmark_prefix")
);
--> statement-breakpoint
CREATE TABLE "garnishment_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"garnishment_order_id" varchar NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_type" varchar(20) NOT NULL,
	"file_size" integer,
	"hallmark_asset_number" varchar(100),
	"uploaded_date" timestamp DEFAULT NOW(),
	"verification_status" varchar(50) DEFAULT 'pending',
	"source_creditor" varchar(255),
	"uploaded_by" varchar,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "garnishment_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"employee_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"creditor_name" varchar(255),
	"order_number" varchar(100),
	"case_number" varchar(100),
	"amount_fixed" numeric(10, 2),
	"amount_percentage" numeric(5, 2),
	"effective_date" date NOT NULL,
	"expiry_date" date,
	"payment_instructions" text,
	"remittance_address" text,
	"status" varchar(50) DEFAULT 'active',
	"priority" integer DEFAULT 4,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "garnishment_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"payroll_record_id" varchar NOT NULL,
	"garnishment_order_id" varchar NOT NULL,
	"employee_id" varchar NOT NULL,
	"payment_date" date,
	"amount_paid" numeric(10, 2) NOT NULL,
	"recipient_name" varchar(255),
	"recipient_type" varchar(50),
	"remittance_address" text,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"confirmed_at" timestamp,
	"failure_reason" text,
	"check_number" varchar(50),
	"wire_reference" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "hallmark_audit" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hallmark_id" varchar NOT NULL,
	"action" varchar(50) NOT NULL,
	"performed_by" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "hallmarks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hallmark_number" varchar(50) NOT NULL,
	"asset_type" varchar(50) NOT NULL,
	"reference_id" varchar(255),
	"created_by" varchar(255),
	"recipient_name" varchar(255),
	"recipient_role" varchar(50),
	"content_hash" varchar(64),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT NOW(),
	"expires_at" timestamp,
	"verified_at" timestamp,
	"search_terms" varchar(1000),
	CONSTRAINT "hallmarks_hallmark_number_unique" UNIQUE("hallmark_number")
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"assignment_id" varchar,
	"worker_id" varchar,
	"title" varchar(255) NOT NULL,
	"description" text,
	"incident_type" varchar(100),
	"severity" varchar(50) DEFAULT 'medium',
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"status" varchar(50) DEFAULT 'open',
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "insurance_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_insurance_id" varchar,
	"company_insurance_id" varchar,
	"worker_id" varchar,
	"company_id" varchar,
	"document_type" varchar(100) NOT NULL,
	"document_name" varchar(255) NOT NULL,
	"document_url" varchar(500),
	"file_url" varchar(500),
	"file_name" varchar(255),
	"file_type" varchar(20),
	"file_size" integer,
	"mime_type" varchar(100),
	"uploaded_date" timestamp,
	"hallmark_id" varchar,
	"hallmark_asset_number" varchar(100),
	"hallmark_issued" boolean DEFAULT false,
	"hallmark_issued_at" timestamp,
	"hallmark_verifiable" boolean DEFAULT true,
	"verification_status" varchar(50) DEFAULT 'pending',
	"rejection_reason" text,
	"virus_scan_status" varchar(50) DEFAULT 'pending',
	"uploaded_by" varchar,
	"verified_by" varchar,
	"verified_at" timestamp,
	"expiry_date" date,
	"expiry_reminder_sent" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'pending_review',
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "insurance_documents_hallmark_id_unique" UNIQUE("hallmark_id")
);
--> statement-breakpoint
CREATE TABLE "integration_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"integration_type" varchar(50) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text,
	"realm_id" varchar(255),
	"last_synced_at" timestamp,
	"connection_status" varchar(50) DEFAULT 'connected',
	"last_error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "internal_ndas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"hallmark_id" varchar NOT NULL,
	"nda_version" varchar(10) DEFAULT '1.0',
	"status" varchar(50) DEFAULT 'pending',
	"signatory_name" varchar(255) NOT NULL,
	"signatory_title" varchar(100),
	"non_solicitation_months" integer DEFAULT 12,
	"signed_date" timestamp,
	"signature_data" jsonb,
	"document_content" text,
	"expiration_date" date,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"client_id" varchar,
	"invoice_number" varchar(50),
	"invoice_date" date,
	"due_date" date,
	"line_items" jsonb,
	"subtotal" numeric(10, 2),
	"tax" numeric(10, 2),
	"total" numeric(10, 2),
	"status" varchar(50) DEFAULT 'draft',
	"paid_at" timestamp,
	"payment_method" varchar(50),
	"hallmark_id" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"client_id" varchar,
	"job_title" varchar(255) NOT NULL,
	"description" text,
	"required_skills" jsonb,
	"qualifications" text,
	"job_type" varchar(50),
	"start_date" timestamp,
	"end_date" timestamp,
	"duration" varchar(100),
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"geofence_radius" integer DEFAULT 300,
	"hourly_rate" numeric(8, 2),
	"minimum_hours" integer,
	"maximum_hours" integer,
	"status" varchar(50) DEFAULT 'open',
	"positions_available" integer DEFAULT 1,
	"positions_filled" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "monthly_subscription_customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(20),
	"subscription_plan" varchar(50) NOT NULL,
	"monthly_price" numeric(10, 2) NOT NULL,
	"auto_backup_enabled" boolean DEFAULT true,
	"backup_frequency" varchar(50) DEFAULT 'weekly',
	"file_storage_quota_mb" integer DEFAULT 5120,
	"file_storage_used_mb" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'active',
	"billing_status" varchar(50) DEFAULT 'current',
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "orbid_admin_crm" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_member_id" varchar NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"job_title" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"company" varchar(255),
	"address" text,
	"website" varchar(255),
	"linked_in" varchar(255),
	"ocr_confidence" numeric(3, 2),
	"source_image" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "orbit_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_number" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"franchisee_id" varchar,
	"customer_id" varchar,
	"metadata" jsonb,
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "orbit_assets_asset_number_unique" UNIQUE("asset_number")
);
--> statement-breakpoint
CREATE TABLE "payroll" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"worker_id" varchar,
	"pay_period_start" date,
	"pay_period_end" date,
	"gross_pay" numeric(10, 2),
	"federal_tax" numeric(10, 2),
	"state_tax" numeric(10, 2),
	"fica_tax" numeric(10, 2),
	"other_deductions" numeric(10, 2),
	"net_pay" numeric(10, 2),
	"status" varchar(50) DEFAULT 'pending',
	"processed_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "payroll_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"employee_id" varchar NOT NULL,
	"payroll_id" varchar,
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"pay_date" date,
	"gross_pay" numeric(10, 2) NOT NULL,
	"federal_income_tax" numeric(10, 2) DEFAULT '0',
	"social_security_tax" numeric(10, 2) DEFAULT '0',
	"medicare_tax" numeric(10, 2) DEFAULT '0',
	"additional_medicare_tax" numeric(10, 2) DEFAULT '0',
	"state_tax" numeric(10, 2) DEFAULT '0',
	"local_tax" numeric(10, 2) DEFAULT '0',
	"total_mandatory_deductions" numeric(10, 2) DEFAULT '0',
	"disposable_earnings" numeric(10, 2) DEFAULT '0',
	"garnishments_applied" jsonb,
	"total_garnishments" numeric(10, 2) DEFAULT '0',
	"net_pay" numeric(10, 2) DEFAULT '0',
	"w4_data_id" varchar,
	"work_state" varchar(2),
	"work_city" varchar(100),
	"breakdown" jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"processed_at" timestamp,
	"paid_at" timestamp,
	"notes" text,
	"paystub_pdf_url" varchar(255),
	"paystub_file_name" varchar(255),
	"hallmark_asset_number" varchar(100),
	"qr_code_url" varchar(255),
	"stripe_payment_id" varchar(100),
	"payment_status" varchar(50),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "paystubs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"payroll_id" varchar,
	"worker_id" varchar,
	"company_id" varchar,
	"paystub_number" varchar(50),
	"pay_date" date,
	"hours_worked" numeric(8, 2),
	"hourly_rate" numeric(8, 2),
	"gross_pay" numeric(10, 2),
	"federal_income_tax" numeric(10, 2),
	"state_income_tax" numeric(10, 2),
	"fica_tax" numeric(10, 2),
	"other_deductions" numeric(10, 2),
	"net_pay" numeric(10, 2),
	"hallmark_id" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "paystubs_paystub_number_unique" UNIQUE("paystub_number")
);
--> statement-breakpoint
CREATE TABLE "prevailing_wages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" varchar(2) NOT NULL,
	"job_classification" varchar(100) NOT NULL,
	"skill_level" varchar(50),
	"base_hourly_rate" numeric(8, 2) NOT NULL,
	"fringe" numeric(8, 2) DEFAULT '0.00',
	"total_hourly_rate" numeric(8, 2) NOT NULL,
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"source" varchar(255),
	"applicable_project_types" varchar(255),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "rate_confirmations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_request_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"hallmark_id" varchar NOT NULL,
	"hourly_rate" numeric(8, 2) NOT NULL,
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"estimated_hours" numeric(8, 2),
	"status" varchar(50) DEFAULT 'pending',
	"customer_signed_date" timestamp,
	"customer_signature_data" jsonb,
	"worker_accepted_date" timestamp,
	"worker_acceptance_data" jsonb,
	"document_content" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "scanned_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monthly_customer_id" varchar NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"job_title" varchar(255),
	"email" varchar(255),
	"phone" varchar(20),
	"company" varchar(255),
	"address" text,
	"website" varchar(255),
	"linked_in" varchar(255),
	"ocr_confidence" numeric(3, 2),
	"source_image" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "scanned_contacts_audit" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scanned_contact_id" varchar,
	"monthly_customer_id" varchar,
	"action" varchar(50) NOT NULL,
	"performed_by" varchar(255),
	"details" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "standard_pay_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position" varchar(100) NOT NULL,
	"position_category" varchar(100),
	"skill_level" varchar(50) DEFAULT 'entry',
	"state" varchar(2) NOT NULL,
	"city" varchar(100),
	"region" varchar(50),
	"hourly_rate" numeric(8, 2) NOT NULL,
	"min_rate" numeric(8, 2),
	"max_rate" numeric(8, 2),
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"source" varchar(255) DEFAULT 'Market Survey',
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "state_compliance_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" varchar(2) NOT NULL,
	"min_wage_per_hour" numeric(8, 2) NOT NULL,
	"workers_comp_required" boolean DEFAULT true,
	"background_check_required" boolean DEFAULT false,
	"license_requirements_per_trade" jsonb,
	"prevailing_wage_applies" boolean DEFAULT false,
	"special_requirements" text,
	"department_of_labor_url" varchar(500),
	"last_updated" timestamp NOT NULL,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "state_compliance_rules_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"integration_type" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"sync_status" varchar(50) DEFAULT 'pending',
	"records_processed" integer DEFAULT 0,
	"records_succeeded" integer DEFAULT 0,
	"records_failed" integer DEFAULT 0,
	"error_message" text,
	"sync_started_at" timestamp,
	"sync_completed_at" timestamp,
	"next_sync_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "synced_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"integration_type" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"orbit_id" varchar(255),
	"source_data" jsonb NOT NULL,
	"normalized_data" jsonb,
	"synced_at" timestamp DEFAULT NOW(),
	"external_updated_at" timestamp,
	"local_updated_at" timestamp,
	"conflict" boolean DEFAULT false,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "timesheets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"assignment_id" varchar,
	"worker_id" varchar,
	"clock_in_time" timestamp,
	"clock_in_latitude" numeric(9, 6),
	"clock_in_longitude" numeric(9, 6),
	"clock_in_verified" boolean,
	"clock_out_time" timestamp,
	"clock_out_latitude" numeric(9, 6),
	"clock_out_longitude" numeric(9, 6),
	"clock_out_verified" boolean,
	"lunch_start" timestamp,
	"lunch_end" timestamp,
	"lunch_duration_minutes" integer,
	"breaks" jsonb,
	"total_hours_worked" numeric(8, 2),
	"break_hours" numeric(8, 2),
	"billable_hours" numeric(8, 2),
	"status" varchar(50) DEFAULT 'draft',
	"submitted_at" timestamp,
	"approved_by" varchar,
	"approved_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'worker' NOT NULL,
	"tenant_id" varchar,
	"company_id" varchar,
	"franchise_id" varchar,
	"admin_pin" varchar(4),
	"full_name" varchar(255),
	"phone" varchar(20),
	"verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"nda_signed_date" timestamp,
	"nda_version" varchar(10),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wage_scales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"region" varchar(50) NOT NULL,
	"industry" varchar(100) NOT NULL,
	"job_category" varchar(100) NOT NULL,
	"skill_level" varchar(50) NOT NULL,
	"hourly_rate" numeric(8, 2) NOT NULL,
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"source" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_acceptances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_request_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"acceptance_status" varchar(50) NOT NULL,
	"accepted_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"accepted_hourly_rate" numeric(8, 2),
	"acceptance_method" varchar(50),
	"acceptance_ip_address" varchar(45),
	"acceptance_device_info" varchar(255),
	"acknowledged_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_bonuses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"week_start_date" date NOT NULL,
	"week_end_date" date NOT NULL,
	"base_bonus" numeric(10, 2) DEFAULT '0',
	"attendance_bonus" numeric(10, 2) DEFAULT '0',
	"hours_bonus" numeric(10, 2) DEFAULT '0',
	"referral_bonus" numeric(10, 2) DEFAULT '0',
	"total_bonus" numeric(10, 2) DEFAULT '0',
	"attendance_streak" integer DEFAULT 0,
	"total_hours_worked" numeric(8, 2) DEFAULT '0',
	"jobs_completed" integer DEFAULT 0,
	"referrals_made" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'pending',
	"approved_by" varchar,
	"approved_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_insurance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"workers_comp_policy_number" varchar(100),
	"workers_comp_carrier" varchar(255),
	"workers_comp_effective_date" date,
	"workers_comp_expiry_date" date,
	"workers_comp_class_code" varchar(20),
	"workers_comp_state" varchar(2),
	"liability_policy_number" varchar(100),
	"liability_carrier" varchar(255),
	"liability_effective_date" date,
	"liability_expiry_date" date,
	"liability_coverage" numeric(12, 2),
	"has_health_insurance" boolean DEFAULT false,
	"health_provider" varchar(255),
	"health_plan_type" varchar(100),
	"health_enrollment_date" date,
	"health_policy_number" varchar(100),
	"has_dental_insurance" boolean DEFAULT false,
	"dental_provider" varchar(255),
	"dental_enrollment_date" date,
	"dental_policy_number" varchar(100),
	"has_indemnity_plan" boolean DEFAULT false,
	"indemnity_provider" varchar(255),
	"indemnity_plan_name" varchar(255),
	"indemnity_enrollment_date" date,
	"indemnity_member_number" varchar(100),
	"indemnity_monthly_premium" numeric(8, 2),
	"has_vision_insurance" boolean DEFAULT false,
	"vision_provider" varchar(255),
	"state_endorsements" jsonb,
	"compliance_flags" jsonb,
	"insurance_status" varchar(50) DEFAULT 'pending',
	"last_verified_date" timestamp,
	"verified_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_referral_bonuses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"referrer_type" varchar(50) DEFAULT 'worker' NOT NULL,
	"referrer_id" varchar,
	"public_referrer_name" varchar(255),
	"public_referrer_phone" varchar(20),
	"public_referrer_email" varchar(255),
	"payment_method" varchar(50),
	"payment_details" text,
	"payment_status" varchar(50) DEFAULT 'pending',
	"referred_worker_id" varchar,
	"referred_worker_name" varchar(255),
	"referred_worker_phone" varchar(20),
	"referred_worker_email" varchar(255),
	"relationship" varchar(100),
	"notes" text,
	"bonus_amount" numeric(10, 2) DEFAULT '100.00',
	"bonus_status" varchar(50) DEFAULT 'pending',
	"hours_worked_by_referred" numeric(8, 2) DEFAULT '0',
	"minimum_hours_required" numeric(8, 2) DEFAULT '40.00',
	"eligibility_met" boolean DEFAULT false,
	"referral_date" timestamp DEFAULT NOW(),
	"worker_applied_date" timestamp,
	"worker_approved_date" timestamp,
	"bonus_earned_date" timestamp,
	"bonus_paid_date" timestamp,
	"payroll_cycle_id" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_request_matches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"tenant_id" varchar NOT NULL,
	"match_score" integer,
	"match_reason" jsonb,
	"skills_match" boolean DEFAULT false,
	"availability_match" boolean DEFAULT false,
	"insurance_match" boolean DEFAULT false,
	"location_match" boolean DEFAULT false,
	"experience_match" boolean DEFAULT false,
	"match_status" varchar(50) DEFAULT 'suggested',
	"selected_at" timestamp,
	"assigned_at" timestamp,
	"rejected_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"client_id" varchar NOT NULL,
	"request_number" varchar(50),
	"job_title" varchar(255) NOT NULL,
	"job_description" text,
	"industry_type" varchar(100),
	"skills_required" jsonb,
	"certifications_required" jsonb,
	"experience_level" varchar(50),
	"workers_needed" integer DEFAULT 1 NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" varchar(10),
	"end_time" varchar(10),
	"shift_type" varchar(50),
	"work_location" varchar(255),
	"address_line1" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"pay_rate" numeric(8, 2),
	"pay_rate_type" varchar(20) DEFAULT 'hourly',
	"billing_rate" numeric(8, 2),
	"workers_comp_required" boolean DEFAULT true,
	"liability_required" boolean DEFAULT false,
	"minimum_coverage" numeric(12, 2),
	"state_specific_requirements" jsonb,
	"background_check_required" boolean DEFAULT false,
	"drug_test_required" boolean DEFAULT false,
	"uniforms" varchar(255),
	"ppe_required" jsonb,
	"special_instructions" text,
	"status" varchar(50) DEFAULT 'pending',
	"matched_at" timestamp,
	"assigned_at" timestamp,
	"completed_at" timestamp,
	"auto_matched_worker_ids" jsonb,
	"match_score" jsonb,
	"assigned_worker_ids" jsonb,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"assigned_by" varchar,
	"priority" varchar(20) DEFAULT 'normal',
	"urgent" boolean DEFAULT false,
	"hallmark_id" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "worker_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"tenant_id" varchar NOT NULL,
	"company_id" varchar,
	"full_name" varchar(255),
	"phone" varchar(20),
	"email" varchar(255),
	"ssn_encrypted" varchar(255),
	"date_of_birth" date,
	"drivers_license" varchar(50),
	"drivers_license_state" varchar(2),
	"street_address" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"emergency_contact_name" varchar(255),
	"emergency_contact_phone" varchar(20),
	"emergency_contact_relationship" varchar(100),
	"skills" jsonb,
	"other_skills" text,
	"hourly_wage" numeric(8, 2),
	"availability_status" varchar(50) DEFAULT 'available',
	"years_experience" varchar(20),
	"license_number" varchar(100),
	"license_issuing_state" varchar(2),
	"license_expiration_date" date,
	"certification_document_url" varchar(500),
	"available_to_start" varchar(50),
	"preferred_shift" varchar(50),
	"days_available" jsonb,
	"willing_to_work_weekends" boolean,
	"transportation" varchar(50),
	"status" varchar(50) DEFAULT 'pending_review',
	"background_check_consent" boolean DEFAULT false,
	"background_check_consent_date" timestamp,
	"mvr_check_consent" boolean DEFAULT false,
	"mvr_check_consent_date" timestamp,
	"certification_accuracy_consent" boolean DEFAULT false,
	"certification_accuracy_consent_date" timestamp,
	"signature_name" varchar(255),
	"signature_date" timestamp,
	"signature_ip_address" varchar(100),
	"referred_by" varchar,
	"i9_verified" boolean DEFAULT false,
	"i9_verified_date" timestamp,
	"background_check_status" varchar(50),
	"background_check_date" timestamp,
	"employee_number" varchar(50),
	"onboarding_completed" boolean DEFAULT false,
	"onboarding_completed_date" timestamp,
	"application_started_date" timestamp,
	"application_deadline" timestamp,
	"assignment_date" timestamp,
	"assignment_onboarding_deadline" timestamp,
	"onboarding_timed_out" boolean DEFAULT false,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "workers_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
CREATE TABLE "workers_comp_rates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" varchar(2) NOT NULL,
	"industry_classification" varchar(100) NOT NULL,
	"risk_level" varchar(50),
	"percentage_of_payroll" numeric(8, 4) NOT NULL,
	"minimum_premium_per_employee" numeric(10, 2),
	"coverage_required" boolean DEFAULT true,
	"minimum_coverage" numeric(12, 2),
	"effective_date" date NOT NULL,
	"expiration_date" date,
	"governing_body" varchar(100),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_confirmations" ADD CONSTRAINT "billing_confirmations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_confirmations" ADD CONSTRAINT "billing_confirmations_worker_request_id_worker_requests_id_fk" FOREIGN KEY ("worker_request_id") REFERENCES "public"."worker_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_confirmations" ADD CONSTRAINT "billing_confirmations_customer_id_clients_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_confirmations" ADD CONSTRAINT "billing_confirmations_rate_confirmation_id_rate_confirmations_id_fk" FOREIGN KEY ("rate_confirmation_id") REFERENCES "public"."rate_confirmations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_confirmations" ADD CONSTRAINT "billing_confirmations_hallmark_id_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_owner_id_users_id_fk" FOREIGN KEY ("account_owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_hallmarks" ADD CONSTRAINT "company_hallmarks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_insurance" ADD CONSTRAINT "company_insurance_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_insurance" ADD CONSTRAINT "company_insurance_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csa_templates" ADD CONSTRAINT "csa_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "csa_templates" ADD CONSTRAINT "csa_templates_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_document_preferences" ADD CONSTRAINT "customer_document_preferences_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_document_preferences" ADD CONSTRAINT "customer_document_preferences_customer_id_clients_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_file_backups" ADD CONSTRAINT "customer_file_backups_monthly_customer_id_monthly_subscription_customers_id_fk" FOREIGN KEY ("monthly_customer_id") REFERENCES "public"."monthly_subscription_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_service_agreements" ADD CONSTRAINT "customer_service_agreements_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_service_agreements" ADD CONSTRAINT "customer_service_agreements_customer_id_clients_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_service_agreements" ADD CONSTRAINT "customer_service_agreements_hallmark_id_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developer_messages" ADD CONSTRAINT "developer_messages_bug_report_id_bug_reports_id_fk" FOREIGN KEY ("bug_report_id") REFERENCES "public"."bug_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_csa_id_customer_service_agreements_id_fk" FOREIGN KEY ("csa_id") REFERENCES "public"."customer_service_agreements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_nda_id_internal_ndas_id_fk" FOREIGN KEY ("nda_id") REFERENCES "public"."internal_ndas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_tests" ADD CONSTRAINT "drug_tests_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_tests" ADD CONSTRAINT "drug_tests_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_tests" ADD CONSTRAINT "drug_tests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drug_tests" ADD CONSTRAINT "drug_tests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_w4_data" ADD CONSTRAINT "employee_w4_data_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_w4_data" ADD CONSTRAINT "employee_w4_data_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_assigned_to_worker_id_workers_id_fk" FOREIGN KEY ("assigned_to_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchisee_team_crm" ADD CONSTRAINT "franchisee_team_crm_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchisee_team_crm" ADD CONSTRAINT "franchisee_team_crm_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchises" ADD CONSTRAINT "franchises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchises" ADD CONSTRAINT "franchises_parent_franchise_id_franchises_id_fk" FOREIGN KEY ("parent_franchise_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_documents" ADD CONSTRAINT "garnishment_documents_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_documents" ADD CONSTRAINT "garnishment_documents_garnishment_order_id_garnishment_orders_id_fk" FOREIGN KEY ("garnishment_order_id") REFERENCES "public"."garnishment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_documents" ADD CONSTRAINT "garnishment_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_orders" ADD CONSTRAINT "garnishment_orders_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_orders" ADD CONSTRAINT "garnishment_orders_employee_id_workers_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_payments" ADD CONSTRAINT "garnishment_payments_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_payments" ADD CONSTRAINT "garnishment_payments_payroll_record_id_payroll_records_id_fk" FOREIGN KEY ("payroll_record_id") REFERENCES "public"."payroll_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_payments" ADD CONSTRAINT "garnishment_payments_garnishment_order_id_garnishment_orders_id_fk" FOREIGN KEY ("garnishment_order_id") REFERENCES "public"."garnishment_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garnishment_payments" ADD CONSTRAINT "garnishment_payments_employee_id_workers_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallmark_audit" ADD CONSTRAINT "hallmark_audit_hallmark_id_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_worker_insurance_id_worker_insurance_id_fk" FOREIGN KEY ("worker_insurance_id") REFERENCES "public"."worker_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_company_insurance_id_company_insurance_id_fk" FOREIGN KEY ("company_insurance_id") REFERENCES "public"."company_insurance"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_documents" ADD CONSTRAINT "insurance_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_tokens" ADD CONSTRAINT "integration_tokens_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_ndas" ADD CONSTRAINT "internal_ndas_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_ndas" ADD CONSTRAINT "internal_ndas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_ndas" ADD CONSTRAINT "internal_ndas_hallmark_id_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_assets" ADD CONSTRAINT "orbit_assets_franchisee_id_franchises_id_fk" FOREIGN KEY ("franchisee_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orbit_assets" ADD CONSTRAINT "orbit_assets_customer_id_monthly_subscription_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."monthly_subscription_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll" ADD CONSTRAINT "payroll_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employee_id_workers_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_payroll_id_payroll_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payroll"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_w4_data_id_employee_w4_data_id_fk" FOREIGN KEY ("w4_data_id") REFERENCES "public"."employee_w4_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystubs" ADD CONSTRAINT "paystubs_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystubs" ADD CONSTRAINT "paystubs_payroll_id_payroll_id_fk" FOREIGN KEY ("payroll_id") REFERENCES "public"."payroll"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystubs" ADD CONSTRAINT "paystubs_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paystubs" ADD CONSTRAINT "paystubs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_confirmations" ADD CONSTRAINT "rate_confirmations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_confirmations" ADD CONSTRAINT "rate_confirmations_worker_request_id_worker_requests_id_fk" FOREIGN KEY ("worker_request_id") REFERENCES "public"."worker_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_confirmations" ADD CONSTRAINT "rate_confirmations_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_confirmations" ADD CONSTRAINT "rate_confirmations_customer_id_clients_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_confirmations" ADD CONSTRAINT "rate_confirmations_hallmark_id_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scanned_contacts" ADD CONSTRAINT "scanned_contacts_monthly_customer_id_monthly_subscription_customers_id_fk" FOREIGN KEY ("monthly_customer_id") REFERENCES "public"."monthly_subscription_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scanned_contacts_audit" ADD CONSTRAINT "scanned_contacts_audit_scanned_contact_id_scanned_contacts_id_fk" FOREIGN KEY ("scanned_contact_id") REFERENCES "public"."scanned_contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scanned_contacts_audit" ADD CONSTRAINT "scanned_contacts_audit_monthly_customer_id_monthly_subscription_customers_id_fk" FOREIGN KEY ("monthly_customer_id") REFERENCES "public"."monthly_subscription_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synced_data" ADD CONSTRAINT "synced_data_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_franchise_id_franchises_id_fk" FOREIGN KEY ("franchise_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wage_scales" ADD CONSTRAINT "wage_scales_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_acceptances" ADD CONSTRAINT "worker_acceptances_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_acceptances" ADD CONSTRAINT "worker_acceptances_worker_request_id_worker_requests_id_fk" FOREIGN KEY ("worker_request_id") REFERENCES "public"."worker_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_acceptances" ADD CONSTRAINT "worker_acceptances_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_bonuses" ADD CONSTRAINT "worker_bonuses_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_bonuses" ADD CONSTRAINT "worker_bonuses_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_bonuses" ADD CONSTRAINT "worker_bonuses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_bonuses" ADD CONSTRAINT "worker_bonuses_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_insurance" ADD CONSTRAINT "worker_insurance_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_insurance" ADD CONSTRAINT "worker_insurance_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_insurance" ADD CONSTRAINT "worker_insurance_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_referral_bonuses" ADD CONSTRAINT "worker_referral_bonuses_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_referral_bonuses" ADD CONSTRAINT "worker_referral_bonuses_referrer_id_workers_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_referral_bonuses" ADD CONSTRAINT "worker_referral_bonuses_referred_worker_id_workers_id_fk" FOREIGN KEY ("referred_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_request_matches" ADD CONSTRAINT "worker_request_matches_request_id_worker_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."worker_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_request_matches" ADD CONSTRAINT "worker_request_matches_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_request_matches" ADD CONSTRAINT "worker_request_matches_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_requests" ADD CONSTRAINT "worker_requests_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_requests" ADD CONSTRAINT "worker_requests_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_requests" ADD CONSTRAINT "worker_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_requests" ADD CONSTRAINT "worker_requests_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_referred_by_workers_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assignments_tenant" ON "assignments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_job_posting" ON "assignments" USING btree ("job_posting_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_worker" ON "assignments" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_company" ON "assignments" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_assignments_status" ON "assignments" USING btree ("assignment_status");--> statement-breakpoint
CREATE INDEX "idx_bg_check_tenant" ON "background_checks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_bg_check_worker" ON "background_checks" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_bg_check_type" ON "background_checks" USING btree ("check_type");--> statement-breakpoint
CREATE INDEX "idx_bg_check_status" ON "background_checks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bg_check_result_status" ON "background_checks" USING btree ("result_status");--> statement-breakpoint
CREATE INDEX "idx_bg_check_expiry" ON "background_checks" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_bg_check_external_id" ON "background_checks" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_billing_conf_tenant" ON "billing_confirmations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_billing_conf_request" ON "billing_confirmations" USING btree ("worker_request_id");--> statement-breakpoint
CREATE INDEX "idx_billing_conf_hallmark" ON "billing_confirmations" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_billing_conf_status" ON "billing_confirmations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bug_email" ON "bug_reports" USING btree ("reported_by_email");--> statement-breakpoint
CREATE INDEX "idx_bug_status" ON "bug_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_bug_severity" ON "bug_reports" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_bug_created_at" ON "bug_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_clients_tenant_id" ON "clients" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_clients_company_id" ON "clients" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_clients_name" ON "clients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_companies_owner" ON "companies" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_companies_name" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_company_hallmarks_company" ON "company_hallmarks" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_company_hallmarks_prefix" ON "company_hallmarks" USING btree ("hallmark_prefix");--> statement-breakpoint
CREATE INDEX "idx_company_insurance_company" ON "company_insurance" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_company_insurance_tenant" ON "company_insurance" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_company_insurance_type" ON "company_insurance" USING btree ("insurance_type");--> statement-breakpoint
CREATE INDEX "idx_company_insurance_status" ON "company_insurance" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_company_insurance_expiry" ON "company_insurance" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_compliance_check_tenant" ON "compliance_checks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_compliance_check_worker" ON "compliance_checks" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_compliance_check_type" ON "compliance_checks" USING btree ("check_type");--> statement-breakpoint
CREATE INDEX "idx_compliance_check_status" ON "compliance_checks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_compliance_check_compliance" ON "compliance_checks" USING btree ("compliance_status");--> statement-breakpoint
CREATE INDEX "idx_compliance_check_expiry" ON "compliance_checks" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_csa_version" ON "csa_templates" USING btree ("version");--> statement-breakpoint
CREATE INDEX "idx_csa_active" ON "csa_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_csa_effective" ON "csa_templates" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_csa_jurisdiction" ON "csa_templates" USING btree ("jurisdiction");--> statement-breakpoint
CREATE INDEX "idx_pref_tenant" ON "customer_document_preferences" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pref_customer" ON "customer_document_preferences" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_backup_customer" ON "customer_file_backups" USING btree ("monthly_customer_id");--> statement-breakpoint
CREATE INDEX "idx_backup_status" ON "customer_file_backups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_backup_backed_up_at" ON "customer_file_backups" USING btree ("backed_up_at");--> statement-breakpoint
CREATE INDEX "idx_csa_tenant" ON "customer_service_agreements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_csa_customer" ON "customer_service_agreements" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_csa_hallmark" ON "customer_service_agreements" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_csa_status" ON "customer_service_agreements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_csa_signed_date" ON "customer_service_agreements" USING btree ("signed_date");--> statement-breakpoint
CREATE INDEX "idx_dev_msg_bug" ON "developer_messages" USING btree ("bug_report_id");--> statement-breakpoint
CREATE INDEX "idx_dev_msg_role" ON "developer_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_dev_msg_created_at" ON "developer_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_sig_tenant" ON "document_signatures" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_sig_csa" ON "document_signatures" USING btree ("csa_id");--> statement-breakpoint
CREATE INDEX "idx_sig_nda" ON "document_signatures" USING btree ("nda_id");--> statement-breakpoint
CREATE INDEX "idx_sig_signed_at" ON "document_signatures" USING btree ("signed_at");--> statement-breakpoint
CREATE INDEX "idx_sig_method" ON "document_signatures" USING btree ("signature_method");--> statement-breakpoint
CREATE INDEX "idx_drug_test_tenant" ON "drug_tests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_drug_test_worker" ON "drug_tests" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_drug_test_type" ON "drug_tests" USING btree ("test_type");--> statement-breakpoint
CREATE INDEX "idx_drug_test_status" ON "drug_tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_drug_test_result" ON "drug_tests" USING btree ("result");--> statement-breakpoint
CREATE INDEX "idx_drug_test_expiry" ON "drug_tests" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_drug_test_external_id" ON "drug_tests" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_w4_tenant" ON "employee_w4_data" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_w4_worker" ON "employee_w4_data" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_w4_current" ON "employee_w4_data" USING btree ("is_current_w4");--> statement-breakpoint
CREATE INDEX "idx_equipment_tenant" ON "equipment" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_equipment_company" ON "equipment" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_equipment_sku" ON "equipment" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_equipment_status" ON "equipment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_equipment_worker" ON "equipment" USING btree ("assigned_to_worker_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_email" ON "feedback" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_feedback_type" ON "feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_franchisee_crm_tenant" ON "franchisee_team_crm" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_franchisee_crm_company" ON "franchisee_team_crm" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_franchisee_crm_email" ON "franchisee_team_crm" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_franchisee_crm_created_at" ON "franchisee_team_crm" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_franchises_owner" ON "franchises" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_franchises_license_key" ON "franchises" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "idx_franchises_hallmark_prefix" ON "franchises" USING btree ("hallmark_prefix");--> statement-breakpoint
CREATE INDEX "idx_garnishment_docs_tenant" ON "garnishment_documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_docs_garnishment" ON "garnishment_documents" USING btree ("garnishment_order_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_docs_verification" ON "garnishment_documents" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_garnishment_docs_uploaded" ON "garnishment_documents" USING btree ("uploaded_date");--> statement-breakpoint
CREATE INDEX "idx_garnishment_tenant" ON "garnishment_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_employee" ON "garnishment_orders" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_type" ON "garnishment_orders" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_garnishment_status" ON "garnishment_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_garnishment_priority" ON "garnishment_orders" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_garnishment_payment_tenant" ON "garnishment_payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_payment_payroll" ON "garnishment_payments" USING btree ("payroll_record_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_payment_order" ON "garnishment_payments" USING btree ("garnishment_order_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_payment_employee" ON "garnishment_payments" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_garnishment_payment_status" ON "garnishment_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_garnishment_payment_date" ON "garnishment_payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "idx_audit_hallmark_id" ON "hallmark_audit" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "hallmark_audit" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_created_at" ON "hallmark_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_hallmarks_number" ON "hallmarks" USING btree ("hallmark_number");--> statement-breakpoint
CREATE INDEX "idx_hallmarks_asset_type" ON "hallmarks" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "idx_hallmarks_reference_id" ON "hallmarks" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX "idx_hallmarks_recipient_name" ON "hallmarks" USING btree ("recipient_name");--> statement-breakpoint
CREATE INDEX "idx_hallmarks_created_at" ON "hallmarks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_hallmarks_search_terms" ON "hallmarks" USING btree ("search_terms");--> statement-breakpoint
CREATE INDEX "idx_incidents_tenant" ON "incidents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_incidents_company" ON "incidents" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_incidents_worker" ON "incidents" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_incidents_status" ON "incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_tenant" ON "insurance_documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_worker_ins" ON "insurance_documents" USING btree ("worker_insurance_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_company_ins" ON "insurance_documents" USING btree ("company_insurance_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_worker" ON "insurance_documents" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_company" ON "insurance_documents" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_hallmark" ON "insurance_documents" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_type" ON "insurance_documents" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_status" ON "insurance_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_insurance_docs_expiry" ON "insurance_documents" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_tokens_tenant" ON "integration_tokens" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tokens_type" ON "integration_tokens" USING btree ("integration_type");--> statement-breakpoint
CREATE INDEX "idx_tokens_tenant_type" ON "integration_tokens" USING btree ("tenant_id","integration_type");--> statement-breakpoint
CREATE INDEX "idx_nda_tenant" ON "internal_ndas" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_nda_user" ON "internal_ndas" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_nda_hallmark" ON "internal_ndas" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_nda_status" ON "internal_ndas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_nda_signed_date" ON "internal_ndas" USING btree ("signed_date");--> statement-breakpoint
CREATE INDEX "idx_nda_expiration" ON "internal_ndas" USING btree ("expiration_date");--> statement-breakpoint
CREATE INDEX "idx_invoices_tenant" ON "invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_company" ON "invoices" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_client" ON "invoices" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_number" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_postings_tenant" ON "job_postings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_job_postings_company" ON "job_postings" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_job_postings_client" ON "job_postings" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_job_postings_status" ON "job_postings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_postings_start_date" ON "job_postings" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_customer_email" ON "monthly_subscription_customers" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "idx_customer_status" ON "monthly_subscription_customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_orbid_staff_member" ON "orbid_admin_crm" USING btree ("staff_member_id");--> statement-breakpoint
CREATE INDEX "idx_orbid_email" ON "orbid_admin_crm" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_orbid_created_at" ON "orbid_admin_crm" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_orbit_assets_number" ON "orbit_assets" USING btree ("asset_number");--> statement-breakpoint
CREATE INDEX "idx_orbit_assets_franchisee" ON "orbit_assets" USING btree ("franchisee_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_tenant" ON "payroll" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_company" ON "payroll" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_worker" ON "payroll" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_period" ON "payroll" USING btree ("pay_period_start");--> statement-breakpoint
CREATE INDEX "idx_payroll_record_tenant" ON "payroll_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_record_employee" ON "payroll_records" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "idx_payroll_record_period" ON "payroll_records" USING btree ("pay_period_start");--> statement-breakpoint
CREATE INDEX "idx_payroll_record_status" ON "payroll_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payroll_record_paystub_url" ON "payroll_records" USING btree ("paystub_pdf_url");--> statement-breakpoint
CREATE INDEX "idx_payroll_record_hallmark" ON "payroll_records" USING btree ("hallmark_asset_number");--> statement-breakpoint
CREATE INDEX "idx_paystubs_tenant" ON "paystubs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_paystubs_payroll" ON "paystubs" USING btree ("payroll_id");--> statement-breakpoint
CREATE INDEX "idx_paystubs_worker" ON "paystubs" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_paystubs_company" ON "paystubs" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_paystubs_number" ON "paystubs" USING btree ("paystub_number");--> statement-breakpoint
CREATE INDEX "idx_prevailing_state" ON "prevailing_wages" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_prevailing_classification" ON "prevailing_wages" USING btree ("job_classification");--> statement-breakpoint
CREATE INDEX "idx_prevailing_effective" ON "prevailing_wages" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_rate_conf_tenant" ON "rate_confirmations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_rate_conf_request" ON "rate_confirmations" USING btree ("worker_request_id");--> statement-breakpoint
CREATE INDEX "idx_rate_conf_worker" ON "rate_confirmations" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_rate_conf_hallmark" ON "rate_confirmations" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_rate_conf_status" ON "rate_confirmations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_scanned_customer" ON "scanned_contacts" USING btree ("monthly_customer_id");--> statement-breakpoint
CREATE INDEX "idx_scanned_email" ON "scanned_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_scanned_created_at" ON "scanned_contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_scanned_audit_contact" ON "scanned_contacts_audit" USING btree ("scanned_contact_id");--> statement-breakpoint
CREATE INDEX "idx_scanned_audit_customer" ON "scanned_contacts_audit" USING btree ("monthly_customer_id");--> statement-breakpoint
CREATE INDEX "idx_scanned_audit_action" ON "scanned_contacts_audit" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_std_pay_position_state" ON "standard_pay_rates" USING btree ("position","state");--> statement-breakpoint
CREATE INDEX "idx_std_pay_state" ON "standard_pay_rates" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_std_pay_category" ON "standard_pay_rates" USING btree ("position_category");--> statement-breakpoint
CREATE INDEX "idx_std_pay_effective" ON "standard_pay_rates" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_compliance_state" ON "state_compliance_rules" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_tenant" ON "sync_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_integration" ON "sync_logs" USING btree ("integration_type");--> statement-breakpoint
CREATE INDEX "idx_sync_logs_status" ON "sync_logs" USING btree ("sync_status");--> statement-breakpoint
CREATE INDEX "idx_synced_tenant" ON "synced_data" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_synced_integration_entity" ON "synced_data" USING btree ("integration_type","entity_type");--> statement-breakpoint
CREATE INDEX "idx_synced_external_id" ON "synced_data" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_tenant_id" ON "timesheets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_company_id" ON "timesheets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_assignment_id" ON "timesheets" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_worker_id" ON "timesheets" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_timesheets_clock_in_time" ON "timesheets" USING btree ("clock_in_time");--> statement-breakpoint
CREATE INDEX "idx_users_tenant_id" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_users_company_id" ON "users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_wage_scales_tenant" ON "wage_scales" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_wage_scales_region_industry" ON "wage_scales" USING btree ("region","industry");--> statement-breakpoint
CREATE INDEX "idx_wage_scales_skill" ON "wage_scales" USING btree ("skill_level");--> statement-breakpoint
CREATE INDEX "idx_wage_scales_effective" ON "wage_scales" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_acceptance_tenant" ON "worker_acceptances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_acceptance_request" ON "worker_acceptances" USING btree ("worker_request_id");--> statement-breakpoint
CREATE INDEX "idx_acceptance_worker" ON "worker_acceptances" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_acceptance_status" ON "worker_acceptances" USING btree ("acceptance_status");--> statement-breakpoint
CREATE INDEX "idx_acceptance_accepted_at" ON "worker_acceptances" USING btree ("accepted_at");--> statement-breakpoint
CREATE INDEX "idx_bonuses_tenant" ON "worker_bonuses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_bonuses_worker" ON "worker_bonuses" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_bonuses_company" ON "worker_bonuses" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_bonuses_period" ON "worker_bonuses" USING btree ("week_start_date");--> statement-breakpoint
CREATE INDEX "idx_bonuses_status" ON "worker_bonuses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_worker_insurance_worker" ON "worker_insurance" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_worker_insurance_tenant" ON "worker_insurance" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_worker_insurance_status" ON "worker_insurance" USING btree ("insurance_status");--> statement-breakpoint
CREATE INDEX "idx_worker_insurance_wc_expiry" ON "worker_insurance" USING btree ("workers_comp_expiry_date");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_tenant" ON "worker_referral_bonuses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_referrer" ON "worker_referral_bonuses" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_referred_worker" ON "worker_referral_bonuses" USING btree ("referred_worker_id");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_status" ON "worker_referral_bonuses" USING btree ("bonus_status");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_type" ON "worker_referral_bonuses" USING btree ("referrer_type");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_public_email" ON "worker_referral_bonuses" USING btree ("public_referrer_email");--> statement-breakpoint
CREATE INDEX "idx_referral_bonuses_referred_phone" ON "worker_referral_bonuses" USING btree ("referred_worker_phone");--> statement-breakpoint
CREATE INDEX "idx_request_matches_request" ON "worker_request_matches" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_request_matches_worker" ON "worker_request_matches" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_request_matches_tenant" ON "worker_request_matches" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_request_matches_status" ON "worker_request_matches" USING btree ("match_status");--> statement-breakpoint
CREATE INDEX "idx_request_matches_score" ON "worker_request_matches" USING btree ("match_score");--> statement-breakpoint
CREATE INDEX "idx_worker_requests_tenant" ON "worker_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_worker_requests_client" ON "worker_requests" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_worker_requests_status" ON "worker_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_worker_requests_start_date" ON "worker_requests" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_worker_requests_number" ON "worker_requests" USING btree ("request_number");--> statement-breakpoint
CREATE INDEX "idx_worker_requests_priority" ON "worker_requests" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_workers_tenant_id" ON "workers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_workers_company_id" ON "workers" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_workers_user_id" ON "workers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_workers_employee_number" ON "workers" USING btree ("employee_number");--> statement-breakpoint
CREATE INDEX "idx_workers_status" ON "workers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_workers_phone" ON "workers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_workers_referred_by" ON "workers" USING btree ("referred_by");--> statement-breakpoint
CREATE INDEX "idx_wc_state" ON "workers_comp_rates" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_wc_industry" ON "workers_comp_rates" USING btree ("industry_classification");--> statement-breakpoint
CREATE INDEX "idx_wc_effective" ON "workers_comp_rates" USING btree ("effective_date");