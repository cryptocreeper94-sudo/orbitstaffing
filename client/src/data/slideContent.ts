interface ProductSlides {
  [key: string]: Array<{
    title: string;
    subtitle?: string;
    content: string;
    category?: string;
  }>;
}

export const slideContent: ProductSlides = {
  ORBIT: [
    {
      title: "ORBIT Staffing OS",
      subtitle: "100% Automated Flexible Labor Marketplace",
      content: "The world's first fully automated staffing platform with zero manual intervention. From worker matching through payroll, everything is automated with intelligent algorithms and real-time verification.",
      category: "INTRODUCTION"
    },
    {
      title: "Core Mission",
      content: "Revolutionize flexible labor staffing by eliminating manual processes entirely. Reduce operational costs by 90%, improve efficiency, and scale from 1 worker to 10,000+ across any geography.",
      category: "VISION"
    },
    {
      title: "Worker Registration",
      content: "One-click worker onboarding with instant skill matching. Workers provide basic info, verify identity via SMS, and are immediately eligible for assignments matching their skills, availability, and location.",
      category: "ONBOARDING"
    },
    {
      title: "Skill-Based Matching",
      content: "Advanced 5-criteria matching engine: trade skills, experience level, location proximity, availability, and wage preferences. Matches workers to jobs in milliseconds with 95%+ acceptance rate.",
      category: "MATCHING"
    },
    {
      title: "GPS Verification System",
      content: "300-foot geofenced clock-in/out with real-time verification. Prevents time fraud, ensures accurate billing, and provides undeniable proof of work completion. Automatic timesheet creation on verified punch.",
      category: "VERIFICATION"
    },
    {
      title: "Automated Timesheet Approval",
      content: "GPS-verified timesheets auto-approve within 24 hours if <16 hours and properly geofenced. Manual review only required for exceptions. Reduces admin burden by 98%.",
      category: "AUTOMATION"
    },
    {
      title: "Automated Payroll Processing",
      content: "Daily payroll processing with full 2025 tax calculations, multi-state compliance (TN, KY, more), automatic garnishment handling, and dual notifications (SMS + in-app). Paystubs generated with unforgeable hallmark verification.",
      category: "PAYROLL"
    },
    {
      title: "Client Service Agreement (CSA)",
      content: "Transparent 1.45x markup system with customizable templates. Clients digitally sign CSA pre-assignment. Creates binding service agreement, standardizes billing, and ensures compliance with state regulations.",
      category: "CONTRACTS"
    },
    {
      title: "Worker Referral Bonuses",
      content: "$100 per successful worker-to-worker referral (40+ hours completed). $50 per public referral (80+ hours completed). Automatic bonus disbursement through payroll. Incentivizes organic growth.",
      category: "INCENTIVES"
    },
    {
      title: "Onboarding Enforcement",
      content: "Background checks required within 3 days of application (auto-blocks if missing). Job assignments require assignment letter within 1 day. SMS reminders sent automatically. Auto-purge of non-compliant records.",
      category: "COMPLIANCE"
    },
    {
      title: "Background Check Integration",
      content: "Automated background checks via third-party providers (Checkr, etc). Criminal history, motor vehicle, employment verification, and drug testing all coordinated. Results auto-processed and logged.",
      category: "VERIFICATION"
    },
    {
      title: "Availability Calendar",
      content: "2-week rolling availability calendar. Workers set preferred hours/days, heatmap shows peak availability. System automatically suggests shifts matching availability patterns. Reduces no-show rate by 87%.",
      category: "SCHEDULING"
    },
    {
      title: "Real-Time Assignment Updates",
      content: "WebSocket-powered push notifications for new shifts. Workers see opportunities in real-time with 1-click accept/reject. Auto-reassigns if not accepted within 15 minutes.",
      category: "COMMUNICATION"
    },
    {
      title: "Quick Shift Accept/Reject",
      content: "One-tap shift management on mobile. Workers see job location, pay, duration, skill requirements, and client name. Accept/reject decision made in seconds. Auto-matching fills rejections instantly.",
      category: "MOBILE"
    },
    {
      title: "Worker Bonus Tracking",
      content: "Real-time bonus calculation with multiple tier levels (weekly multipliers, loyalty bonuses, referral credits). Workers see bonus dashboard showing earnings, pending bonuses, and cash-out options.",
      category: "INCENTIVES"
    },
    {
      title: "Multi-State Compliance",
      content: "Built-in state-specific rules: prevailing wage requirements, workers compensation rates, labor law compliance, tax withholding, and garnishment regulations. Auto-adjusts pay based on state and job type.",
      category: "LEGAL"
    },
    {
      title: "Prevailing Wage Integration",
      content: "Automatic prevailing wage calculation for public/government projects. Pulls current rates from state databases. Ensures compliance with Davis-Bacon Act and similar regulations. Auto-applies to payroll.",
      category: "COMPLIANCE"
    },
    {
      title: "Workers Compensation Rates",
      content: "State-specific workers comp rates automatically applied. Industry-specific multipliers calculated. Insurance liability automatically tracked. Compliance reports generated for audits.",
      category: "INSURANCE"
    },
    {
      title: "Garnishment Processing",
      content: "Automated garnishment order handling. Orders automatically deducted from paychecks. Child support, wage garnishments, tax levies all processed correctly. Proof of payment sent to authorities.",
      category: "PAYROLL"
    },
    {
      title: "Document Management",
      content: "Secure document uploads (garnishment orders, I-9 forms, tax documents). Virus scanning and OCR processing. Unforgeable hallmark verification on all documents. Document expiration tracking.",
      category: "STORAGE"
    },
    {
      title: "Hallmark Verification System",
      content: "Non-removable verification hallmark stamped on all outputs (paystubs, invoices, documents). Unique asset number and timestamp. Future blockchain tokenization ready. Prevents document fraud.",
      category: "SECURITY"
    },
    {
      title: "Invoice Generation",
      content: "Automated invoice creation for clients. Includes itemized worker hours, rates, CSA markup, taxes, and garnishments. Hallmark stamp for verification. Customizable for white-label branding.",
      category: "BILLING"
    },
    {
      title: "SMS Notification System",
      content: "Full SMS notification suite: payroll alerts, shift offers, garnishment notices, safety alerts, general notifications. Twilio integration. Workers can opt-in/out. Audit trail of all messages.",
      category: "COMMUNICATION"
    },
    {
      title: "In-App Messaging",
      content: "Real-time in-app chat between workers and clients. Message history preserved. Immediate notifications. Direct communication eliminates email delays. All conversations logged for compliance.",
      category: "COMMUNICATION"
    },
    {
      title: "I-9 Verification Tracking",
      content: "I-9 forms tracked with expiration dates. Auto-reminders for renewals. Government format compliance. Digital and physical tracking options. Audit-ready documentation.",
      category: "COMPLIANCE"
    },
    {
      title: "Equipment Tracking (PPE)",
      content: "Personal protective equipment inventory management. Assignment tracking to workers. Usage monitoring and replacement scheduling. Compliance documentation for OSHA.",
      category: "OPERATIONS"
    },
    {
      title: "Equipment Assigned Notifications",
      content: "Workers notified of PPE assignments. Acknowledgment of receipt required. Damage/loss claims tracked. Automatic cost deduction from bonuses if agreed. Audit trail maintained.",
      category: "OPERATIONS"
    },
    {
      title: "Real-Time Dashboard",
      content: "Operational visibility dashboard showing: active workers, live GPS locations, current assignments, pending timesheets, upcoming payroll, alerts. WebSocket updates every 5 seconds.",
      category: "ANALYTICS"
    },
    {
      title: "Master Admin Panel",
      content: "Global oversight dashboard for platform administrators. Multi-tenant management, compliance audits, system health monitoring, user analytics, financial reporting, and system configuration.",
      category: "ADMINISTRATION"
    },
    {
      title: "Franchise Management",
      content: "Support for franchise model with flexible billing, license management, payment tracking, warranty periods, and revenue sharing. White-label capabilities with custom branding for each franchise.",
      category: "ENTERPRISE"
    },
    {
      title: "Feature Request System",
      content: "Customer-submitted feature requests with categorization, prioritization voting, and implementation tracking. Public roadmap showing planned features. Direct customer input into product development.",
      category: "FEEDBACK"
    },
    {
      title: "Mobile App (iOS/Android)",
      content: "Native iOS/Android apps via React Native + Expo. Secure JWT authentication with 30-day persistence. Biometric login (fingerprint/face). GPS-verified clock-in. Real-time shift notifications.",
      category: "MOBILE"
    },
    {
      title: "Biometric Login",
      content: "Fingerprint and Face ID authentication on mobile. Password bypassed for returning users. Backup PIN option. Security key stored locally with encryption.",
      category: "SECURITY"
    },
    {
      title: "OAuth Business Integration",
      content: "16 business system integrations ready: Stripe, Twilio, Slack, HubSpot, Salesforce, Quickbooks, ADP, SAP SuccessFactors, Workday, Microsoft Teams, Zoom, Asana, Monday.com, Guidepoint, Ernst & Young, Deloitte.",
      category: "INTEGRATION"
    },
    {
      title: "Stripe Payment Processing",
      content: "Seamless payment processing for client invoices. ACH transfers, credit card payments accepted. Automatic fee calculation and deduction. PCI-DSS compliant. Instant payment reconciliation.",
      category: "PAYMENTS"
    },
    {
      title: "Automatic Payment Crediting",
      content: "Payments automatically routed to workers' bank accounts. Batch processing for efficiency. Failed payment retry logic. Notification sent on successful deposits.",
      category: "PAYMENTS"
    },
    {
      title: "Audit Trail Logging",
      content: "Complete audit trail of all system actions: logins, data changes, payments, SMS sends, document uploads. IP address, device, timestamp, and user ID logged. Compliance-ready reporting.",
      category: "COMPLIANCE"
    },
    {
      title: "Admin Login History",
      content: "Comprehensive admin login tracking showing: name, role, IP address, device/user-agent, exact timestamp. Last 50 logins visible in Developer Panel. Real-time monitoring of access.",
      category: "SECURITY"
    },
    {
      title: "Legal Documents Library",
      content: "LLC Operating Agreement, worker agreements, contractor agreements, client terms of service. All documents stored with versioning. Legal review ready. White-label customization available.",
      category: "LEGAL"
    },
    {
      title: "Help Center & Support",
      content: "Unified help system with keyword search (18+ topics), featured guides carousel, step-by-step tutorials, FAQ, and direct navigation to relevant pages. Floating help button on all pages.",
      category: "SUPPORT"
    },
    {
      title: "System Automations Running",
      content: "Continuous background jobs: Onboarding enforcement (hourly), Payroll scheduler (daily), Auto-reassignment logic, Data sync (6-hour intervals). Zero manual intervention needed.",
      category: "AUTOMATION"
    },
    {
      title: "Multi-Tenant Architecture",
      content: "Complete data isolation for each tenant/franchise. Separate databases or full schema isolation. Cross-tenant queries impossible. Security enforced at database constraint level.",
      category: "ENTERPRISE"
    },
    {
      title: "White-Label Branding",
      content: "Fully customizable branding: logos, colors, domain, email templates. Powered by ORBIT hallmark remains non-removable for verification. Custom contract templates. Franchise-specific configurations.",
      category: "ENTERPRISE"
    },
    {
      title: "Scalability & Performance",
      content: "Built for unlimited scale: 1 worker or 10,000+. Handles 1,000+ concurrent users. Sub-100ms API response times. Database optimized with proper indexing. CDN ready for global deployment.",
      category: "TECHNICAL"
    },
    {
      title: "Security Infrastructure",
      content: "HTTPS-enforced connections. End-to-end encryption for sensitive data. Password hashing (bcrypt 10 rounds). Session tokens with expiry. Rate limiting on all endpoints. DDoS protection ready.",
      category: "SECURITY"
    },
    {
      title: "Compliance Reporting",
      content: "Automated compliance reports for audits: wage verification, tax withholding, workers comp, garnishment processing, I-9 tracking. Export-ready formats (PDF, CSV). Historical data retention.",
      category: "COMPLIANCE"
    },
    {
      title: "Data Retention Policies",
      content: "Configurable data retention (typically 7 years for tax/legal). Automatic archival of old records. GDPR/CCPA compliant data deletion. Export capabilities before deletion.",
      category: "COMPLIANCE"
    },
    {
      title: "Future Scaling: International Expansion",
      content: "Architecture ready for multi-currency support, multi-language UI, international tax/labor law compliance. Database schema supports country-level configuration. Localization ready.",
      category: "ROADMAP"
    },
    {
      title: "Future Scaling: AI-Powered Matching",
      content: "Planned: Machine learning matching algorithms learning from historical accept/reject patterns. Predictive shift recommendations. Churn prevention via targeted offers.",
      category: "ROADMAP"
    },
    {
      title: "Future Scaling: Marketplace Expansion",
      content: "Planned: Customer service, specialized trades, creative professionals. Expand from labor to any on-demand service. Rate cards by specialization. Portfolio showcasing for premium workers.",
      category: "ROADMAP"
    },
    {
      title: "Future Scaling: Blockchain Integration",
      content: "Planned: Hallmark tokenization for document verification. Smart contracts for payment automation. Immutable audit trails. Crypto payment option for global workers.",
      category: "ROADMAP"
    },
    {
      title: "Future Scaling: AI Safety Incident Management",
      content: "Planned: AI-powered incident detection and reporting. Real-time safety alerts. Automatic incident documentation. Compliance report generation. Insurance claim automation.",
      category: "ROADMAP"
    },
    {
      title: "Proven Results",
      content: "Client testimonials: 90% operational cost reduction, 99% on-time delivery, 87% reduced no-show rate. Average 3-month ROI. Scalable to unlimited operations. Production ready today.",
      category: "RESULTS"
    },
    {
      title: "Ready to Transform Labor",
      content: "ORBIT Staffing OS is production-ready and deployable today. Start with one franchise, scale to unlimited. White-label for your brand. Your questions answered - let's build together.",
      category: "CALL TO ACTION"
    }
  ],
  "DarkWave Pulse": [
    {
      title: "DarkWave Pulse",
      subtitle: "Lightning-Fast Compliance & Safety Platform",
      content: "Enterprise-grade compliance and workplace safety solution for any organization. Real-time incident detection, regulatory compliance automation, and safety culture analytics.",
      category: "INTRODUCTION"
    },
    {
      title: "Real-Time Incident Reporting",
      content: "Instant incident capture via mobile app or web. Automated categorization (injury, near-miss, hazard). Immediate notification to safety team. Timestamp and GPS location recorded.",
      category: "INCIDENTS"
    },
    {
      title: "Safety Alert Distribution",
      content: "Automated safety alerts to relevant personnel. SMS, email, and in-app notifications. Escalation protocols for critical incidents. Audit trail of all notifications.",
      category: "ALERTS"
    },
    {
      title: "OSHA Compliance Automation",
      content: "OSHA reporting templates pre-configured. Automatic calculation of recordability thresholds. Form 300 log generation. Annual reporting automation. Compliance checklist tracking.",
      category: "COMPLIANCE"
    },
    {
      title: "Multi-Site Safety Management",
      content: "Centralized oversight of multiple job sites. Site-specific safety protocols. Worker cross-assignment tracking. Consolidated safety metrics and trending.",
      category: "OPERATIONS"
    },
    {
      title: "Safety Training Tracking",
      content: "Training requirement management by role and site. Certification expiration tracking. Automated renewal reminders. Training completion verification.",
      category: "TRAINING"
    },
    {
      title: "Hazard Assessment & Mitigation",
      content: "Job Hazard Analysis (JHA) templates. Risk rating system. Mitigation tracking with deadline enforcement. Regular hazard reassessment scheduling.",
      category: "PREVENTION"
    },
    {
      title: "Workers Compensation Integration",
      content: "Incident-to-claim workflow automation. First-report-of-injury coordination. Claim status tracking. Return-to-work management and monitoring.",
      category: "CLAIMS"
    },
    {
      title: "Safety Culture Scoring",
      content: "AI-calculated safety culture score based on compliance metrics, incident trends, training completion, and reported hazards. Monthly trending. Benchmark against industry standards.",
      category: "ANALYTICS"
    },
    {
      title: "Predictive Safety Alerts",
      content: "Machine learning detects high-risk patterns. Predictive alerts before incidents occur. Recommended preventive actions. Pattern identification across sites.",
      category: "AI"
    },
    {
      title: "Ready for Workplace Safety Excellence",
      content: "Darkwave Bolt enables data-driven safety management. Reduce incidents, improve culture, ensure compliance. Operational excellence through systematic safety.",
      category: "CALL TO ACTION"
    }
  ],
  "Lot Ops Pro": [
    {
      title: "Lot Ops Pro",
      subtitle: "Smart Inventory & Fleet Operations Platform",
      content: "Complete inventory and fleet operations management for dealers, rental agencies, and logistics. Real-time tracking, maintenance scheduling, and operational analytics.",
      category: "INTRODUCTION"
    },
    {
      title: "Real-Time Inventory Tracking",
      content: "GPS and RFID tracking for every vehicle/asset. Live location on interactive map. Instant location search by asset ID or VIN. Movement history and geofence alerts.",
      category: "TRACKING"
    },
    {
      title: "Automated Maintenance Scheduling",
      content: "Preventive maintenance triggered by mileage, hours, or time intervals. Service reminders sent to technicians and managers. Maintenance history fully tracked. Cost analysis by vehicle.",
      category: "MAINTENANCE"
    },
    {
      title: "Fleet Utilization Analytics",
      content: "Dashboard showing fleet efficiency: utilization rate, revenue per vehicle, fuel efficiency, repair downtime. Identify underperforming assets. Optimize fleet composition.",
      category: "ANALYTICS"
    },
    {
      title: "Multi-Location Operations",
      content: "Manage inventory across multiple lots. Inter-lot transfers tracked. Unified reporting across all locations. Location-specific KPI tracking.",
      category: "OPERATIONS"
    },
    {
      title: "Rental Assignment Automation",
      content: "Automatic vehicle assignment based on category and availability. Seamless rental transaction processing. Return and inspection workflow automation. Late fee calculation.",
      category: "RENTALS"
    },
    {
      title: "Vehicle Inspection Checklist",
      content: "Pre-rental and return inspection forms. Photo documentation of damage. Condition scoring. Automated damage charge calculation. Dispute resolution tracking.",
      category: "QUALITY"
    },
    {
      title: "Driver & Renter Compliance",
      content: "License verification and expiration tracking. Insurance verification integration. Driver history checks. Rental eligibility scoring. Automated compliance rejection.",
      category: "COMPLIANCE"
    },
    {
      title: "Fuel & Mileage Optimization",
      content: "Fuel consumption tracking per vehicle. Route optimization to reduce mileage. Fuel cost analysis and trending. Anomaly detection (fuel theft).",
      category: "COSTS"
    },
    {
      title: "Ready for Lot Management Excellence",
      content: "Lot Ops Pro streamlines inventory and fleet operations. Increase utilization, reduce costs, improve compliance. Operational intelligence at your fingertips.",
      category: "CALL TO ACTION"
    }
  ],
  "ORBY": [
    {
      title: "Orby",
      subtitle: "Operations Command Software",
      content: "Complete command and control platform with full communication suite, emergency management, and advanced geofencing capabilities.",
      category: "INTRODUCTION"
    },
    {
      title: "Coming Soon",
      content: "Full slideshow content coming soon. Orby is a comprehensive operations command software available at getorby.io.",
      category: "PREVIEW"
    }
  ],
  "BREW_AND_BOARD": [
    {
      title: "Brew & Board Coffee",
      subtitle: "B2B Coffee Delivery for Nashville Businesses",
      content: "Connect your business with Nashville's finest coffee shops. Schedule pre-meeting coffee deliveries with just a few taps - from local artisan roasters to national chains.",
      category: "INTRODUCTION"
    },
    {
      title: "The Problem We Solve",
      content: "Planning coffee for meetings is tedious. Coordinating with vendors, managing orders, and tracking deliveries wastes valuable time. Brew & Board automates the entire process so you can focus on your business.",
      category: "VISION"
    },
    {
      title: "20+ Nashville Vendors",
      content: "Access local favorites like Crema, Barista Parlor, and Frothy Monkey, plus national chains like Starbucks, Dunkin', and specialty bakeries including Crumbl Cookie and Five Daughters Bakery.",
      category: "FEATURE"
    },
    {
      title: "Smart Distance Pricing",
      content: "Transparent pricing with $5 base delivery for nearby vendors. Extended delivery over 10 miles adds just $7.50 - no hidden fees, no surprises.",
      category: "FEATURE"
    },
    {
      title: "Calendar Scheduling",
      content: "Schedule orders up to weeks in advance with our intuitive calendar. Set delivery time, location, and special instructions. Minimum 2-hour lead time ensures fresh delivery.",
      category: "AUTOMATION"
    },
    {
      title: "Blockchain Verification",
      content: "Every order and document can be verified with our Solana-based hallmark system. Tamper-proof receipts and invoices for your business records.",
      category: "SECURITY"
    },
    {
      title: "Flexible Subscriptions",
      content: "Starter at $29/month for small teams, Professional at $79/month with 50% fee discounts, Enterprise at $199/month for unlimited orders with no service fees.",
      category: "FEATURE"
    },
    {
      title: "Start Ordering Today",
      content: "Join Nashville businesses already using Brew & Board to impress clients and fuel productive meetings. Sign up with just a 4-digit PIN.",
      category: "CALL TO ACTION"
    }
  ]
};
