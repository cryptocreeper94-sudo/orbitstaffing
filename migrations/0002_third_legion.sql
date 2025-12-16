CREATE TABLE "accounting_connections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"provider" varchar(20) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"realm_id" varchar(255),
	"xero_tenant_id" varchar(255),
	"company_name" varchar(255),
	"is_active" boolean DEFAULT true,
	"connection_status" varchar(50) DEFAULT 'connected',
	"last_error" text,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "accounting_sync_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"connection_id" varchar NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"record_count" integer DEFAULT 0,
	"success_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'pending',
	"error_message" text,
	"started_at" timestamp DEFAULT NOW(),
	"completed_at" timestamp,
	"details" jsonb
);
--> statement-breakpoint
CREATE TABLE "blockchain_anchor_batches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merkle_root" varchar(128) NOT NULL,
	"transaction_signature" varchar(128),
	"hash_count" integer DEFAULT 0 NOT NULL,
	"mode" varchar(20) DEFAULT 'simulation',
	"explorer_url" varchar(255),
	"anchored_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "blockchain_hash_queue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hallmark_id" varchar NOT NULL,
	"content_hash" varchar(128) NOT NULL,
	"asset_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'queued',
	"merkle_root" varchar(128),
	"batch_id" varchar,
	"queued_at" timestamp DEFAULT NOW(),
	"anchored_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crm_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"subject" varchar(255),
	"description" text,
	"email_from" varchar(255),
	"email_to" varchar(255),
	"email_opened" boolean DEFAULT false,
	"email_opened_at" timestamp,
	"email_clicked" boolean DEFAULT false,
	"email_clicked_at" timestamp,
	"call_duration" integer,
	"call_outcome" varchar(50),
	"call_recording_url" varchar(500),
	"meeting_start_time" timestamp,
	"meeting_end_time" timestamp,
	"meeting_location" varchar(255),
	"meeting_attendees" text[],
	"metadata" jsonb,
	"created_by" varchar,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_chat_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"visitor_id" varchar(255),
	"visitor_name" varchar(255),
	"visitor_email" varchar(255),
	"visitor_phone" varchar(20),
	"entity_type" varchar(50),
	"entity_id" varchar,
	"assigned_to" varchar,
	"status" varchar(20) DEFAULT 'active',
	"source" varchar(50) DEFAULT 'website',
	"page_url" varchar(500),
	"message_count" integer DEFAULT 0,
	"rating" integer,
	"feedback" text,
	"started_at" timestamp DEFAULT NOW(),
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"sender_type" varchar(20) NOT NULL,
	"sender_id" varchar,
	"sender_name" varchar(255),
	"message_type" varchar(20) DEFAULT 'text',
	"content" text NOT NULL,
	"attachment_url" varchar(500),
	"attachment_name" varchar(255),
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_custom_field_values" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"custom_field_id" varchar NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar NOT NULL,
	"value" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_custom_fields" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"entity_type" varchar(50) NOT NULL,
	"field_name" varchar(100) NOT NULL,
	"field_label" varchar(255) NOT NULL,
	"field_type" varchar(50) NOT NULL,
	"options" jsonb,
	"is_required" boolean DEFAULT false,
	"default_value" text,
	"display_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"section" varchar(100),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_deals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" varchar(255) NOT NULL,
	"description" text,
	"stage" varchar(50) DEFAULT 'lead' NOT NULL,
	"stage_order" integer DEFAULT 0,
	"value" numeric(15, 2),
	"currency" varchar(3) DEFAULT 'USD',
	"probability" integer DEFAULT 0,
	"company_id" varchar,
	"client_id" varchar,
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"expected_close_date" date,
	"actual_close_date" date,
	"owner_id" varchar,
	"source" varchar(100),
	"custom_fields" jsonb,
	"lost_reason" varchar(255),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_duplicates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"entity_type" varchar(50) NOT NULL,
	"primary_entity_id" varchar NOT NULL,
	"duplicate_entity_id" varchar NOT NULL,
	"confidence_score" integer NOT NULL,
	"match_reasons" jsonb,
	"status" varchar(20) DEFAULT 'pending',
	"merged_at" timestamp,
	"merged_by" varchar,
	"surviving_entity_id" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_email_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"email_id" varchar(255) NOT NULL,
	"subject" varchar(500),
	"to_email" varchar(255) NOT NULL,
	"from_email" varchar(255),
	"entity_type" varchar(50),
	"entity_id" varchar,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"bounced_at" timestamp,
	"unsubscribed_at" timestamp,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"clicked_links" jsonb,
	"campaign_id" varchar,
	"user_agent" varchar(500),
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "crm_email_tracking_email_id_unique" UNIQUE("email_id")
);
--> statement-breakpoint
CREATE TABLE "crm_meetings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"timezone" varchar(50) DEFAULT 'America/New_York',
	"location_type" varchar(20) DEFAULT 'virtual',
	"location" varchar(500),
	"meeting_url" varchar(500),
	"organizer_id" varchar,
	"attendees" jsonb,
	"entity_type" varchar(50),
	"entity_id" varchar,
	"deal_id" varchar,
	"status" varchar(20) DEFAULT 'scheduled',
	"reminder_minutes" integer DEFAULT 15,
	"reminder_sent" boolean DEFAULT false,
	"notes" text,
	"outcome" varchar(255),
	"external_calendar_id" varchar(255),
	"external_event_id" varchar(255),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false,
	"color" varchar(20) DEFAULT 'default',
	"created_by" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_workflow_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"workflow_id" varchar NOT NULL,
	"status" varchar(20) NOT NULL,
	"triggered_by" varchar(50),
	"entity_type" varchar(50),
	"entity_id" varchar,
	"started_at" timestamp DEFAULT NOW(),
	"completed_at" timestamp,
	"actions_executed" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "crm_workflows" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"name" varchar(255) NOT NULL,
	"description" text,
	"trigger_type" varchar(50) NOT NULL,
	"trigger_event" varchar(100),
	"trigger_conditions" jsonb,
	"schedule" varchar(100),
	"actions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"run_count" integer DEFAULT 0,
	"last_run_at" timestamp,
	"last_run_status" varchar(20),
	"created_by" varchar,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "customer_hallmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" varchar,
	"stripe_customer_id" varchar(255) NOT NULL,
	"hallmark_name" varchar(255) NOT NULL,
	"hallmark_description" text,
	"primary_color" varchar(7) DEFAULT '#06B6D4' NOT NULL,
	"secondary_color" varchar(7) DEFAULT '#8B5CF6' NOT NULL,
	"accent_color" varchar(7),
	"logo_url" text,
	"favicon" text,
	"company_website" varchar(255),
	"support_email" varchar(255),
	"support_phone" varchar(20),
	"social_media" text,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"ownership_mode" varchar(50) DEFAULT 'subscriber_managed',
	"franchise_id" varchar(100),
	"franchise_tier_id" integer,
	"territory_exclusive" boolean DEFAULT false,
	"territory_region" varchar(255),
	"franchise_fee" varchar(50),
	"royalty_percent" varchar(10),
	"royalty_type" varchar(50),
	"royalty_amount" varchar(50),
	"support_tier" varchar(50),
	"support_monthly_fee" varchar(50),
	"nft_revenue_share_percent" integer DEFAULT 0,
	"franchise_agreement_url" text,
	"franchise_start_date" timestamp,
	"custody_owner" varchar(255) DEFAULT 'orbit',
	"custody_transfer_date" timestamp,
	"previous_owner" varchar(255),
	"serial_prefix" varchar(20),
	"next_serial_number" integer DEFAULT 1,
	"total_serials_issued" integer DEFAULT 0,
	"solana_wallet_address" varchar(255),
	"nft_collection_address" varchar(255),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "customer_hallmarks_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "ecosystem_activity_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar,
	"app_name" varchar(100),
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resource_id" varchar(100),
	"details" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "ecosystem_code_snippets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_app_id" varchar,
	"source_app_name" varchar(100),
	"name" varchar(100) NOT NULL,
	"description" text,
	"code" text NOT NULL,
	"language" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"tags" text[] DEFAULT '{}',
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"version" varchar(20) DEFAULT '1.0.0',
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "ecosystem_connected_apps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_name" varchar(100) NOT NULL,
	"app_slug" varchar(50) NOT NULL,
	"app_url" varchar(255),
	"description" text,
	"logo_url" varchar(255),
	"api_key" varchar(100) NOT NULL,
	"api_secret_hash" text NOT NULL,
	"permissions" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"sync_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "ecosystem_connected_apps_app_slug_unique" UNIQUE("app_slug"),
	CONSTRAINT "ecosystem_connected_apps_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "ecosystem_data_syncs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_app_id" varchar,
	"source_app_name" varchar(100),
	"sync_type" varchar(50) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"record_count" integer DEFAULT 0,
	"data_payload" jsonb,
	"status" varchar(20) DEFAULT 'pending',
	"error_message" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "ecosystem_external_hubs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hub_name" varchar(100) NOT NULL,
	"hub_url" varchar(255) NOT NULL,
	"api_key" varchar(100),
	"api_secret_encrypted" text,
	"permissions" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"auto_sync" boolean DEFAULT false,
	"sync_frequency" varchar(20) DEFAULT 'manual',
	"last_sync_at" timestamp,
	"last_sync_status" varchar(20),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchise_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(20),
	"website" varchar(255),
	"business_type" varchar(100),
	"current_locations" integer DEFAULT 1,
	"estimated_workers_per_month" integer,
	"current_software" varchar(255),
	"requested_tier_id" integer,
	"requested_territory_region" varchar(255),
	"requested_territory_state" varchar(2),
	"existing_stripe_customer_id" varchar(255),
	"existing_hallmark_id" integer,
	"is_upgrade" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'pending',
	"review_notes" text,
	"reviewed_by" varchar(255),
	"reviewed_at" timestamp,
	"converted_to_hallmark_id" integer,
	"converted_at" timestamp,
	"source" varchar(100),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchise_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_id" varchar,
	"tenant_id" varchar,
	"name" varchar(100) NOT NULL,
	"location_code" varchar(20) NOT NULL,
	"location_type" varchar(50) DEFAULT 'branch',
	"address_line1" varchar(255) NOT NULL,
	"address_line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(10) NOT NULL,
	"country" varchar(50) DEFAULT 'USA',
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"phone" varchar(20),
	"email" varchar(255),
	"manager_name" varchar(100),
	"manager_id" varchar,
	"is_active" boolean DEFAULT true,
	"operating_hours" jsonb,
	"service_radius" integer DEFAULT 25,
	"max_workers" integer DEFAULT 50,
	"total_workers" integer DEFAULT 0,
	"total_jobs" integer DEFAULT 0,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchise_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"hallmark_id" integer NOT NULL,
	"tenant_id" varchar,
	"stripe_customer_id" varchar(255),
	"payment_type" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd',
	"period_start" timestamp,
	"period_end" timestamp,
	"worker_count" integer,
	"placement_count" integer,
	"stripe_payment_intent_id" varchar(255),
	"stripe_invoice_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"paid_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchise_territories" (
	"id" serial PRIMARY KEY NOT NULL,
	"hallmark_id" integer NOT NULL,
	"tenant_id" varchar,
	"territory_name" varchar(255) NOT NULL,
	"territory_type" varchar(50) NOT NULL,
	"state" varchar(2),
	"city" varchar(255),
	"county" varchar(255),
	"zip_codes" text,
	"geo_json_boundary" text,
	"is_exclusive" boolean DEFAULT true,
	"valid_from" timestamp DEFAULT NOW(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "franchise_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier_code" varchar(50) NOT NULL,
	"tier_name" varchar(100) NOT NULL,
	"description" text,
	"franchise_fee" integer NOT NULL,
	"royalty_percent" varchar(10) NOT NULL,
	"royalty_type" varchar(50) DEFAULT 'percentage',
	"royalty_per_unit" integer,
	"support_monthly_fee" integer NOT NULL,
	"transfer_fee" integer NOT NULL,
	"stripe_support_price_id_monthly" varchar(255),
	"stripe_franchise_fee_product_id" varchar(255),
	"max_locations" integer DEFAULT 1,
	"territory_exclusive" boolean DEFAULT false,
	"territory_level" varchar(50),
	"support_response_hours" integer DEFAULT 48,
	"nft_revenue_share_percent" integer DEFAULT 70,
	"whitelabel_app" boolean DEFAULT false,
	"dedicated_account_manager" boolean DEFAULT false,
	"sub_franchise_rights" boolean DEFAULT false,
	"custom_api_access" boolean DEFAULT false,
	"priority_feature_requests" boolean DEFAULT false,
	"branding_control" varchar(50) DEFAULT 'basic',
	"data_ownership" varchar(50) DEFAULT 'shared',
	"all_modules_included" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "franchise_tiers_tier_code_unique" UNIQUE("tier_code")
);
--> statement-breakpoint
CREATE TABLE "hallmark_custody_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"hallmark_id" integer NOT NULL,
	"tenant_id" varchar,
	"stripe_customer_id" varchar(255) NOT NULL,
	"transfer_type" varchar(100) NOT NULL,
	"from_mode" varchar(50) NOT NULL,
	"to_mode" varchar(50) NOT NULL,
	"from_owner" varchar(255) NOT NULL,
	"to_owner" varchar(255) NOT NULL,
	"transfer_fee" varchar(50),
	"franchise_fee_agreed" varchar(50),
	"royalty_terms" text,
	"workers_transferred" integer,
	"jobs_transferred" integer,
	"serial_systems_transferred" integer,
	"audit_history_included" boolean DEFAULT true,
	"requested_at" timestamp DEFAULT NOW(),
	"requested_by" varchar(255),
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"customer_accepted" boolean DEFAULT false,
	"customer_accepted_at" timestamp,
	"legal_agreement_signed" boolean DEFAULT false,
	"legal_agreement_url" text,
	"status" varchar(50) DEFAULT 'pending',
	"completed_at" timestamp,
	"stripe_payment_intent_id" varchar(255),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "license_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"license_id" varchar,
	"invoice_type" varchar(20) NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"invoice_date" date NOT NULL,
	"due_date" date NOT NULL,
	"paid_date" date,
	"status" varchar(20) DEFAULT 'pending',
	"stripe_payment_intent_id" varchar(100),
	"stripe_invoice_id" varchar(100),
	"payment_method" varchar(50),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "license_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "meeting_presentations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"user_id" varchar,
	"template_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"meeting_date" varchar(20),
	"meeting_time" varchar(20),
	"notes" text,
	"document_ids" text[] DEFAULT '{}',
	"attendee_emails" text[] DEFAULT '{}',
	"attendee_names" text[] DEFAULT '{}',
	"shareable_link" varchar(100),
	"status" varchar(20) DEFAULT 'draft',
	"sent_at" timestamp,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "meeting_presentations_shareable_link_unique" UNIQUE("shareable_link")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text DEFAULT 'orbit',
	"page" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"ip_hash" text,
	"session_id" text,
	"device_type" text,
	"browser" text,
	"country" text,
	"city" text,
	"duration" integer,
	"created_at" timestamp DEFAULT NOW() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_api_credentials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"franchise_id" varchar,
	"tenant_id" varchar,
	"name" varchar(100) NOT NULL,
	"description" text,
	"api_key" varchar(64) NOT NULL,
	"api_secret_hash" text NOT NULL,
	"environment" varchar(20) DEFAULT 'production',
	"scopes" text[] DEFAULT ARRAY['workers:read']::text[],
	"rate_limit_per_minute" integer DEFAULT 60,
	"rate_limit_per_day" integer DEFAULT 10000,
	"request_count" integer DEFAULT 0,
	"request_count_daily" integer DEFAULT 0,
	"last_used_at" timestamp,
	"last_reset_at" timestamp DEFAULT NOW(),
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_by" varchar(100),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "partner_api_credentials_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "partner_api_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credential_id" varchar,
	"franchise_id" varchar,
	"tenant_id" varchar,
	"method" varchar(10) NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"query_params" jsonb,
	"request_body" jsonb,
	"status_code" integer,
	"response_time_ms" integer,
	"response_size" integer,
	"error_code" varchar(50),
	"error_message" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "pay_card_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" varchar NOT NULL,
	"tenant_id" varchar,
	"status" varchar(50) DEFAULT 'pending',
	"first_name" varchar(100),
	"last_name" varchar(100),
	"date_of_birth" date,
	"ssn_last_4" varchar(4),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"stripe_cardholder_id" varchar(100),
	"stripe_card_id" varchar(100),
	"card_status" varchar(50),
	"card_last_4" varchar(4),
	"approved_at" timestamp,
	"activated_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "pay_card_waitlist" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"worker_id" varchar,
	"tenant_id" varchar,
	"source" varchar(50) DEFAULT 'website',
	"status" varchar(50) DEFAULT 'pending',
	"notified_at" timestamp,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "platform_modules" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"monthly_price" numeric(10, 2) DEFAULT '0',
	"annual_price" numeric(10, 2) DEFAULT '0',
	"stripe_price_id_monthly" varchar(255),
	"stripe_price_id_annual" varchar(255),
	"is_required" boolean DEFAULT false,
	"is_addon" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"icon_emoji" varchar(10),
	"features" jsonb,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "pto_balances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"vacation_balance" numeric(8, 2) DEFAULT '0',
	"sick_balance" numeric(8, 2) DEFAULT '0',
	"personal_balance" numeric(8, 2) DEFAULT '0',
	"vacation_accrual_rate" numeric(6, 4) DEFAULT '0',
	"sick_accrual_rate" numeric(6, 4) DEFAULT '0',
	"personal_accrual_rate" numeric(6, 4) DEFAULT '0',
	"vacation_max_carryover" numeric(8, 2) DEFAULT '40',
	"sick_max_carryover" numeric(8, 2) DEFAULT '40',
	"ytd_vacation_used" numeric(8, 2) DEFAULT '0',
	"ytd_sick_used" numeric(8, 2) DEFAULT '0',
	"ytd_personal_used" numeric(8, 2) DEFAULT '0',
	"accrual_start_date" date,
	"last_accrual_date" date,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "pto_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"pto_type" varchar(20) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"hours_requested" numeric(8, 2) NOT NULL,
	"reason" text,
	"status" varchar(20) DEFAULT 'pending',
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"review_notes" text,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "release_packages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" varchar,
	"app_slug" varchar(50) NOT NULL,
	"app_name" varchar(100) NOT NULL,
	"version" varchar(20) NOT NULL,
	"release_type" varchar(10) NOT NULL,
	"changelog" text,
	"release_notes" text,
	"breaking_changes" boolean DEFAULT false,
	"dependencies" jsonb,
	"release_hash" varchar(64),
	"solana_tx" varchar(100),
	"solana_explorer_url" text,
	"published_at" timestamp DEFAULT NOW(),
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "software_licenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"licensee_company_name" varchar(255) NOT NULL,
	"licensee_contact_name" varchar(255) NOT NULL,
	"licensee_email" varchar(255) NOT NULL,
	"licensee_phone" varchar(20),
	"licensee_address" text,
	"licensee_domain" varchar(255),
	"product_name" varchar(100) NOT NULL,
	"license_fee" numeric(10, 2) NOT NULL,
	"monthly_support_fee" numeric(10, 2) NOT NULL,
	"effective_date" date NOT NULL,
	"term_years" integer DEFAULT 1,
	"signed_by_licensee" varchar(255),
	"signed_by_licensor" varchar(255),
	"signed_date" timestamp,
	"status" varchar(20) DEFAULT 'draft',
	"stripe_customer_id" varchar(100),
	"stripe_license_payment_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "software_licenses_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"tagline" varchar(255),
	"monthly_price" numeric(10, 2) NOT NULL,
	"annual_price" numeric(10, 2) NOT NULL,
	"stripe_price_id_monthly" varchar(255),
	"stripe_price_id_annual" varchar(255),
	"included_modules" jsonb NOT NULL,
	"max_workers" integer DEFAULT 100,
	"max_admins" integer DEFAULT 5,
	"storage_gb" integer DEFAULT 10,
	"is_popular" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"badge_text" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "tenant_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"source" varchar(50) DEFAULT 'plan',
	"stripe_price_id" varchar(255),
	"stripe_subscription_item_id" varchar(255),
	"expires_at" timestamp,
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar NOT NULL,
	"event" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"status_code" integer,
	"response_body" text,
	"error_message" text,
	"attempt_count" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 4,
	"next_retry_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "webhook_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credential_id" varchar NOT NULL,
	"url" text NOT NULL,
	"secret" varchar(64) NOT NULL,
	"events" text[] DEFAULT ARRAY[]::text[],
	"is_active" boolean DEFAULT true,
	"description" text,
	"total_deliveries" integer DEFAULT 0,
	"successful_deliveries" integer DEFAULT 0,
	"failed_deliveries" integer DEFAULT 0,
	"last_delivery_at" timestamp,
	"last_success_at" timestamp,
	"last_failure_at" timestamp,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_benefits_enrollment" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"has_401k" boolean DEFAULT false,
	"contribution_401k_percent" numeric(5, 2) DEFAULT '0',
	"contribution_401k_flat" numeric(10, 2) DEFAULT '0',
	"employer_match_percent" numeric(5, 2) DEFAULT '0',
	"employer_match_limit" numeric(10, 2),
	"vesting_percent" numeric(5, 2) DEFAULT '0',
	"has_health_insurance" boolean DEFAULT false,
	"health_plan_tier" varchar(50),
	"health_deduction_per_paycheck" numeric(10, 2) DEFAULT '0',
	"has_dental_insurance" boolean DEFAULT false,
	"dental_deduction_per_paycheck" numeric(10, 2) DEFAULT '0',
	"has_vision_insurance" boolean DEFAULT false,
	"vision_deduction_per_paycheck" numeric(10, 2) DEFAULT '0',
	"has_hsa" boolean DEFAULT false,
	"hsa_contribution_per_paycheck" numeric(10, 2) DEFAULT '0',
	"has_fsa" boolean DEFAULT false,
	"fsa_contribution_per_paycheck" numeric(10, 2) DEFAULT '0',
	"has_life_insurance" boolean DEFAULT false,
	"life_insurance_deduction" numeric(10, 2) DEFAULT '0',
	"total_pre_tax_deductions" numeric(10, 2) DEFAULT '0',
	"enrollment_date" date,
	"effective_date" date,
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW()
);
--> statement-breakpoint
CREATE TABLE "worker_payment_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" varchar NOT NULL,
	"tenant_id" varchar,
	"preferred_method" varchar(50) DEFAULT 'direct_deposit',
	"bank_account_id" varchar(100),
	"bank_account_last_4" varchar(4),
	"bank_name" varchar(100),
	"routing_number" varchar(9),
	"account_type" varchar(20),
	"pay_card_enabled" boolean DEFAULT false,
	"pay_card_id" varchar,
	"instant_pay_enabled" boolean DEFAULT false,
	"instant_pay_fee" numeric(5, 2),
	"stripe_connect_account_id" varchar(100),
	"stripe_account_status" varchar(50),
	"created_at" timestamp DEFAULT NOW(),
	"updated_at" timestamp DEFAULT NOW(),
	CONSTRAINT "worker_payment_preferences_worker_id_unique" UNIQUE("worker_id")
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "crypto_charge_code" varchar(100);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "crypto_charge_url" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "crypto_payment_status" varchar(50);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "crypto_currency" varchar(20);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "crypto_amount_paid" numeric(20, 8);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "crypto_transaction_id" varchar(255);--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "tenant_id" varchar;--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "subscription_type" varchar(50) DEFAULT 'bundle';--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "stripe_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "stripe_subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "stripe_price_id" varchar(255);--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "enabled_tools" jsonb;--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "last_backup_at" timestamp;--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "orbit_support_access" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "current_period_start" timestamp;--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD COLUMN "canceled_at" timestamp;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "regular_hours" numeric(8, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "overtime_hours" numeric(8, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "hourly_rate" numeric(8, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "regular_pay" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "overtime_pay" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "ytd_gross_pay" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "ytd_federal_tax" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "ytd_state_tax" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "ytd_social_security" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "ytd_medicare" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "ytd_net_pay" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "retirement_401k" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "health_insurance" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "dental_insurance" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "vision_insurance" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "hsa_contribution" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "fsa_contribution" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "total_benefits_deductions" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "is_correction" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "original_payroll_record_id" varchar;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "correction_reason" text;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD COLUMN "corrected_by" varchar;--> statement-breakpoint
ALTER TABLE "talent_exchange_employers" ADD COLUMN "is_founding_member" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "talent_exchange_employers" ADD COLUMN "founding_member_since" timestamp;--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_in_photo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_in_face_match_score" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_in_face_verified" boolean;--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_in_face_status" varchar(20);--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_out_photo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_out_face_match_score" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_out_face_verified" boolean;--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_out_face_status" varchar(20);--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_in_weather" jsonb;--> statement-breakpoint
ALTER TABLE "timesheets" ADD COLUMN "clock_out_weather" jsonb;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "is_founding_member" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "founding_member_since" timestamp;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "onboarding_status" varchar(50) DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "profile_photo_url" varchar(500);--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "profile_photo_uploaded_at" timestamp;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "profile_photo_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "accounting_connections" ADD CONSTRAINT "accounting_connections_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounting_sync_logs" ADD CONSTRAINT "accounting_sync_logs_connection_id_accounting_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."accounting_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_chat_conversations" ADD CONSTRAINT "crm_chat_conversations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_chat_conversations" ADD CONSTRAINT "crm_chat_conversations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_chat_messages" ADD CONSTRAINT "crm_chat_messages_conversation_id_crm_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."crm_chat_conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_custom_field_values" ADD CONSTRAINT "crm_custom_field_values_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_custom_field_values" ADD CONSTRAINT "crm_custom_field_values_custom_field_id_crm_custom_fields_id_fk" FOREIGN KEY ("custom_field_id") REFERENCES "public"."crm_custom_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_custom_fields" ADD CONSTRAINT "crm_custom_fields_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_duplicates" ADD CONSTRAINT "crm_duplicates_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_duplicates" ADD CONSTRAINT "crm_duplicates_merged_by_users_id_fk" FOREIGN KEY ("merged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_email_tracking" ADD CONSTRAINT "crm_email_tracking_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_meetings" ADD CONSTRAINT "crm_meetings_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_meetings" ADD CONSTRAINT "crm_meetings_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_meetings" ADD CONSTRAINT "crm_meetings_deal_id_crm_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."crm_deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_workflow_logs" ADD CONSTRAINT "crm_workflow_logs_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_workflow_logs" ADD CONSTRAINT "crm_workflow_logs_workflow_id_crm_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."crm_workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_workflows" ADD CONSTRAINT "crm_workflows_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_workflows" ADD CONSTRAINT "crm_workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_hallmarks" ADD CONSTRAINT "customer_hallmarks_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_activity_logs" ADD CONSTRAINT "ecosystem_activity_logs_app_id_ecosystem_connected_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."ecosystem_connected_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_code_snippets" ADD CONSTRAINT "ecosystem_code_snippets_source_app_id_ecosystem_connected_apps_id_fk" FOREIGN KEY ("source_app_id") REFERENCES "public"."ecosystem_connected_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecosystem_data_syncs" ADD CONSTRAINT "ecosystem_data_syncs_source_app_id_ecosystem_connected_apps_id_fk" FOREIGN KEY ("source_app_id") REFERENCES "public"."ecosystem_connected_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_applications" ADD CONSTRAINT "franchise_applications_requested_tier_id_franchise_tiers_id_fk" FOREIGN KEY ("requested_tier_id") REFERENCES "public"."franchise_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_locations" ADD CONSTRAINT "franchise_locations_franchise_id_franchises_id_fk" FOREIGN KEY ("franchise_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_locations" ADD CONSTRAINT "franchise_locations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_locations" ADD CONSTRAINT "franchise_locations_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_payments" ADD CONSTRAINT "franchise_payments_hallmark_id_customer_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."customer_hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_payments" ADD CONSTRAINT "franchise_payments_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_territories" ADD CONSTRAINT "franchise_territories_hallmark_id_customer_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."customer_hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "franchise_territories" ADD CONSTRAINT "franchise_territories_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallmark_custody_transfers" ADD CONSTRAINT "hallmark_custody_transfers_hallmark_id_customer_hallmarks_id_fk" FOREIGN KEY ("hallmark_id") REFERENCES "public"."customer_hallmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallmark_custody_transfers" ADD CONSTRAINT "hallmark_custody_transfers_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_invoices" ADD CONSTRAINT "license_invoices_license_id_software_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."software_licenses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_presentations" ADD CONSTRAINT "meeting_presentations_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_presentations" ADD CONSTRAINT "meeting_presentations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_api_credentials" ADD CONSTRAINT "partner_api_credentials_franchise_id_franchises_id_fk" FOREIGN KEY ("franchise_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_api_credentials" ADD CONSTRAINT "partner_api_credentials_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_api_logs" ADD CONSTRAINT "partner_api_logs_credential_id_partner_api_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."partner_api_credentials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_api_logs" ADD CONSTRAINT "partner_api_logs_franchise_id_franchises_id_fk" FOREIGN KEY ("franchise_id") REFERENCES "public"."franchises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_api_logs" ADD CONSTRAINT "partner_api_logs_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_card_applications" ADD CONSTRAINT "pay_card_applications_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_card_applications" ADD CONSTRAINT "pay_card_applications_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_card_waitlist" ADD CONSTRAINT "pay_card_waitlist_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_card_waitlist" ADD CONSTRAINT "pay_card_waitlist_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_balances" ADD CONSTRAINT "pto_balances_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_balances" ADD CONSTRAINT "pto_balances_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pto_requests" ADD CONSTRAINT "pto_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_packages" ADD CONSTRAINT "release_packages_app_id_ecosystem_connected_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."ecosystem_connected_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_module_id_platform_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."platform_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery_logs" ADD CONSTRAINT "webhook_delivery_logs_subscription_id_webhook_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."webhook_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_subscriptions" ADD CONSTRAINT "webhook_subscriptions_credential_id_partner_api_credentials_id_fk" FOREIGN KEY ("credential_id") REFERENCES "public"."partner_api_credentials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_benefits_enrollment" ADD CONSTRAINT "worker_benefits_enrollment_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_benefits_enrollment" ADD CONSTRAINT "worker_benefits_enrollment_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_payment_preferences" ADD CONSTRAINT "worker_payment_preferences_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_payment_preferences" ADD CONSTRAINT "worker_payment_preferences_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_payment_preferences" ADD CONSTRAINT "worker_payment_preferences_pay_card_id_pay_card_applications_id_fk" FOREIGN KEY ("pay_card_id") REFERENCES "public"."pay_card_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounting_conn_tenant" ON "accounting_connections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_accounting_conn_provider" ON "accounting_connections" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_accounting_conn_tenant_provider" ON "accounting_connections" USING btree ("tenant_id","provider");--> statement-breakpoint
CREATE INDEX "idx_accounting_conn_active" ON "accounting_connections" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_accounting_sync_connection" ON "accounting_sync_logs" USING btree ("connection_id");--> statement-breakpoint
CREATE INDEX "idx_accounting_sync_status" ON "accounting_sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_accounting_sync_type" ON "accounting_sync_logs" USING btree ("sync_type");--> statement-breakpoint
CREATE INDEX "idx_accounting_sync_started" ON "accounting_sync_logs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_blockchain_batch_mode" ON "blockchain_anchor_batches" USING btree ("mode");--> statement-breakpoint
CREATE INDEX "idx_blockchain_batch_anchored" ON "blockchain_anchor_batches" USING btree ("anchored_at");--> statement-breakpoint
CREATE INDEX "idx_blockchain_queue_status" ON "blockchain_hash_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_blockchain_queue_hallmark" ON "blockchain_hash_queue" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_blockchain_queue_batch" ON "blockchain_hash_queue" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_tenant" ON "crm_activities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_entity" ON "crm_activities" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_type" ON "crm_activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_crm_activities_created" ON "crm_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_tenant" ON "crm_chat_conversations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_visitor" ON "crm_chat_conversations" USING btree ("visitor_id");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_assigned" ON "crm_chat_conversations" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_status" ON "crm_chat_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_entity" ON "crm_chat_conversations" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_msg_conversation" ON "crm_chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_msg_sender" ON "crm_chat_messages" USING btree ("sender_type","sender_id");--> statement-breakpoint
CREATE INDEX "idx_crm_chat_msg_created" ON "crm_chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_crm_field_values_tenant" ON "crm_custom_field_values" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_field_values_entity" ON "crm_custom_field_values" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_field_values_field" ON "crm_custom_field_values" USING btree ("custom_field_id");--> statement-breakpoint
CREATE INDEX "idx_crm_custom_fields_tenant" ON "crm_custom_fields" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_custom_fields_entity" ON "crm_custom_fields" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_crm_custom_fields_name" ON "crm_custom_fields" USING btree ("tenant_id","entity_type","field_name");--> statement-breakpoint
CREATE INDEX "idx_crm_deals_tenant" ON "crm_deals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_deals_stage" ON "crm_deals" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "idx_crm_deals_owner" ON "crm_deals" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_crm_deals_close_date" ON "crm_deals" USING btree ("expected_close_date");--> statement-breakpoint
CREATE INDEX "idx_crm_duplicates_tenant" ON "crm_duplicates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_duplicates_entity" ON "crm_duplicates" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "idx_crm_duplicates_status" ON "crm_duplicates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_crm_duplicates_primary" ON "crm_duplicates" USING btree ("primary_entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_duplicates_duplicate" ON "crm_duplicates" USING btree ("duplicate_entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_email_tracking_tenant" ON "crm_email_tracking" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_email_tracking_email" ON "crm_email_tracking" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "idx_crm_email_tracking_to" ON "crm_email_tracking" USING btree ("to_email");--> statement-breakpoint
CREATE INDEX "idx_crm_email_tracking_entity" ON "crm_email_tracking" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_email_tracking_sent" ON "crm_email_tracking" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_crm_meetings_tenant" ON "crm_meetings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_meetings_organizer" ON "crm_meetings" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "idx_crm_meetings_start" ON "crm_meetings" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_crm_meetings_status" ON "crm_meetings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_crm_meetings_entity" ON "crm_meetings" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_notes_tenant" ON "crm_notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_notes_entity" ON "crm_notes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_crm_notes_pinned" ON "crm_notes" USING btree ("is_pinned");--> statement-breakpoint
CREATE INDEX "idx_crm_workflow_logs_tenant" ON "crm_workflow_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_workflow_logs_workflow" ON "crm_workflow_logs" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "idx_crm_workflow_logs_status" ON "crm_workflow_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_crm_workflow_logs_created" ON "crm_workflow_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_crm_workflows_tenant" ON "crm_workflows" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_crm_workflows_active" ON "crm_workflows" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_crm_workflows_trigger" ON "crm_workflows" USING btree ("trigger_type","trigger_event");--> statement-breakpoint
CREATE INDEX "idx_customer_hallmarks_tenant" ON "customer_hallmarks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_customer_hallmarks_stripe" ON "customer_hallmarks" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_customer_hallmarks_franchise" ON "customer_hallmarks" USING btree ("franchise_id");--> statement-breakpoint
CREATE INDEX "idx_customer_hallmarks_ownership" ON "customer_hallmarks" USING btree ("ownership_mode");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_logs_app" ON "ecosystem_activity_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_logs_action" ON "ecosystem_activity_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_logs_created" ON "ecosystem_activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_snippets_source" ON "ecosystem_code_snippets" USING btree ("source_app_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_snippets_category" ON "ecosystem_code_snippets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_snippets_language" ON "ecosystem_code_snippets" USING btree ("language");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_snippets_public" ON "ecosystem_code_snippets" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_apps_api_key" ON "ecosystem_connected_apps" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_apps_slug" ON "ecosystem_connected_apps" USING btree ("app_slug");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_apps_active" ON "ecosystem_connected_apps" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_syncs_source" ON "ecosystem_data_syncs" USING btree ("source_app_id");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_syncs_type" ON "ecosystem_data_syncs" USING btree ("sync_type");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_syncs_status" ON "ecosystem_data_syncs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_ecosystem_syncs_direction" ON "ecosystem_data_syncs" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "idx_external_hubs_name" ON "ecosystem_external_hubs" USING btree ("hub_name");--> statement-breakpoint
CREATE INDEX "idx_external_hubs_active" ON "ecosystem_external_hubs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_franchise_applications_status" ON "franchise_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_franchise_applications_email" ON "franchise_applications" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "idx_franchise_applications_tier" ON "franchise_applications" USING btree ("requested_tier_id");--> statement-breakpoint
CREATE INDEX "idx_franchise_loc_franchise" ON "franchise_locations" USING btree ("franchise_id");--> statement-breakpoint
CREATE INDEX "idx_franchise_loc_tenant" ON "franchise_locations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_franchise_loc_code" ON "franchise_locations" USING btree ("location_code");--> statement-breakpoint
CREATE INDEX "idx_franchise_loc_active" ON "franchise_locations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_franchise_loc_city_state" ON "franchise_locations" USING btree ("city","state");--> statement-breakpoint
CREATE INDEX "idx_franchise_payments_hallmark" ON "franchise_payments" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_franchise_payments_status" ON "franchise_payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_franchise_payments_type" ON "franchise_payments" USING btree ("payment_type");--> statement-breakpoint
CREATE INDEX "idx_franchise_territories_hallmark" ON "franchise_territories" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_franchise_territories_state" ON "franchise_territories" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_franchise_territories_active" ON "franchise_territories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_franchise_tiers_code" ON "franchise_tiers" USING btree ("tier_code");--> statement-breakpoint
CREATE INDEX "idx_franchise_tiers_active" ON "franchise_tiers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_franchise_tiers_sort" ON "franchise_tiers" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_custody_transfers_hallmark" ON "hallmark_custody_transfers" USING btree ("hallmark_id");--> statement-breakpoint
CREATE INDEX "idx_custody_transfers_status" ON "hallmark_custody_transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_custody_transfers_stripe" ON "hallmark_custody_transfers" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_license_invoices_number" ON "license_invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_license_invoices_license" ON "license_invoices" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "idx_license_invoices_status" ON "license_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_meeting_presentations_tenant" ON "meeting_presentations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_meeting_presentations_user" ON "meeting_presentations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_meeting_presentations_status" ON "meeting_presentations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_meeting_presentations_link" ON "meeting_presentations" USING btree ("shareable_link");--> statement-breakpoint
CREATE INDEX "idx_page_views_tenant" ON "page_views" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_page_views_page" ON "page_views" USING btree ("page");--> statement-breakpoint
CREATE INDEX "idx_page_views_session" ON "page_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_page_views_created_at" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_partner_api_key" ON "partner_api_credentials" USING btree ("api_key");--> statement-breakpoint
CREATE INDEX "idx_partner_api_franchise" ON "partner_api_credentials" USING btree ("franchise_id");--> statement-breakpoint
CREATE INDEX "idx_partner_api_tenant" ON "partner_api_credentials" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_partner_api_active" ON "partner_api_credentials" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_partner_log_credential" ON "partner_api_logs" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "idx_partner_log_franchise" ON "partner_api_logs" USING btree ("franchise_id");--> statement-breakpoint
CREATE INDEX "idx_partner_log_tenant" ON "partner_api_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_partner_log_endpoint" ON "partner_api_logs" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "idx_partner_log_status" ON "partner_api_logs" USING btree ("status_code");--> statement-breakpoint
CREATE INDEX "idx_partner_log_created" ON "partner_api_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_pay_card_app_worker" ON "pay_card_applications" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_pay_card_app_tenant" ON "pay_card_applications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pay_card_app_status" ON "pay_card_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pay_card_app_stripe_ch" ON "pay_card_applications" USING btree ("stripe_cardholder_id");--> statement-breakpoint
CREATE INDEX "idx_pay_card_waitlist_email" ON "pay_card_waitlist" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_pay_card_waitlist_worker" ON "pay_card_waitlist" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_pay_card_waitlist_status" ON "pay_card_waitlist" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_platform_modules_category" ON "platform_modules" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_platform_modules_sort" ON "platform_modules" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_pto_tenant" ON "pto_balances" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pto_worker" ON "pto_balances" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_pto_request_tenant" ON "pto_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pto_request_worker" ON "pto_requests" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_pto_request_status" ON "pto_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pto_request_dates" ON "pto_requests" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_releases_app_slug" ON "release_packages" USING btree ("app_slug");--> statement-breakpoint
CREATE INDEX "idx_releases_version" ON "release_packages" USING btree ("version");--> statement-breakpoint
CREATE INDEX "idx_releases_published" ON "release_packages" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_software_licenses_number" ON "software_licenses" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "idx_software_licenses_email" ON "software_licenses" USING btree ("licensee_email");--> statement-breakpoint
CREATE INDEX "idx_software_licenses_product" ON "software_licenses" USING btree ("product_name");--> statement-breakpoint
CREATE INDEX "idx_software_licenses_status" ON "software_licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_active" ON "subscription_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_sort" ON "subscription_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_tenant_modules_tenant" ON "tenant_modules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tenant_modules_module" ON "tenant_modules" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "idx_tenant_modules_unique" ON "tenant_modules" USING btree ("tenant_id","module_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_log_subscription" ON "webhook_delivery_logs" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_log_status" ON "webhook_delivery_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_webhook_log_event" ON "webhook_delivery_logs" USING btree ("event");--> statement-breakpoint
CREATE INDEX "idx_webhook_log_created" ON "webhook_delivery_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_webhook_log_retry" ON "webhook_delivery_logs" USING btree ("next_retry_at");--> statement-breakpoint
CREATE INDEX "idx_webhook_sub_credential" ON "webhook_subscriptions" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "idx_webhook_sub_active" ON "webhook_subscriptions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_webhook_sub_created" ON "webhook_subscriptions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_benefits_enrollment_tenant" ON "worker_benefits_enrollment" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_benefits_enrollment_worker" ON "worker_benefits_enrollment" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_worker_pay_pref_worker" ON "worker_payment_preferences" USING btree ("worker_id");--> statement-breakpoint
CREATE INDEX "idx_worker_pay_pref_tenant" ON "worker_payment_preferences" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_worker_pay_pref_method" ON "worker_payment_preferences" USING btree ("preferred_method");--> statement-breakpoint
ALTER TABLE "monthly_subscription_customers" ADD CONSTRAINT "monthly_subscription_customers_tenant_id_companies_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_corrected_by_users_id_fk" FOREIGN KEY ("corrected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_subscription_tenant" ON "monthly_subscription_customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_stripe" ON "monthly_subscription_customers" USING btree ("stripe_customer_id");