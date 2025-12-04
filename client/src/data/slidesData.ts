export interface Slide {
  id: number;
  title: string;
  section: string;
  duration: number;
  content: {
    type: 'hero' | 'problem' | 'solution' | 'feature' | 'comparison' | 'cta' | 'closing';
    headline: string;
    subheadline?: string;
    description?: string;
    bullets?: string[];
  };
}

export const slidesData: Slide[] = [
  {
    id: 1,
    title: "Lot Ops Pro",
    section: "Opening & Hook",
    duration: 8,
    content: {
      type: 'hero',
      headline: 'Lot Ops Pro',
      subheadline: 'Transform your lot operations with autonomous inventory & fleet management'
    }
  },
  {
    id: 2,
    title: "The Challenge",
    section: "Problem Statement",
    duration: 8,
    content: {
      type: 'problem',
      headline: 'The Lot Management Crisis',
      bullets: [
        'Manual tracking = Lost vehicles and wasted time',
        'No real-time visibility = Decision paralysis',
        'Maintenance chaos = Unexpected downtime',
        'Multi-site operations = Operational nightmare',
        'Customer frustration = Lost business'
      ]
    }
  },
  {
    id: 3,
    title: "Meet Lot Ops Pro",
    section: "Solution Overview",
    duration: 8,
    content: {
      type: 'solution',
      headline: 'Lot Ops Pro - The Solution',
      bullets: [
        'Real-time GPS tracking on every vehicle',
        'Automated maintenance scheduling & alerts',
        'Unified multi-location dashboard',
        'Predictive analytics for optimization',
        'Zero manual tracking = Complete automation'
      ]
    }
  },
  {
    id: 4,
    title: "Real-Time Vehicle Tracking",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'GPS & RFID Vehicle Tracking',
      subheadline: 'Know exactly where every vehicle is, 24/7',
      description: 'Live GPS positioning with interactive map display. Track location history, receive geofence alerts, and identify missing vehicles instantly.',
      bullets: [
        'Live location updates every 30 seconds',
        'Movement history and route playback',
        'Geofence alerts for unauthorized movement',
        'Mobile app tracking for lot attendants',
        'Integration with insurance for claims verification'
      ]
    }
  },
  {
    id: 5,
    title: "Automated Maintenance",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Preventive Maintenance Automation',
      subheadline: 'Never miss a service interval again',
      description: 'Maintenance triggers based on mileage, hours, or calendar. Automatic reminders, service tracking, and predictive alerts.',
      bullets: [
        'Mileage-based triggers (oil changes at 5k miles)',
        'Time-based triggers (inspections every 30 days)',
        'Automatic technician notifications',
        'Service history fully tracked & documented',
        'Cost analysis per vehicle and fleet-wide'
      ]
    }
  },
  {
    id: 6,
    title: "Fleet Utilization Analytics",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Fleet Performance Dashboard',
      subheadline: 'Maximize revenue, minimize costs',
      description: 'Real-time metrics showing utilization rate, revenue per vehicle, fuel efficiency, and repair downtime. Identify underperforming assets instantly.',
      bullets: [
        'Daily utilization rates with trends',
        'Revenue per vehicle & profit margins',
        'Fuel consumption & efficiency benchmarks',
        'Downtime tracking by vehicle & category',
        'Predictive recommendations for fleet optimization'
      ]
    }
  },
  {
    id: 7,
    title: "Multi-Location Operations",
    section: "Enterprise Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Unified Multi-Site Management',
      subheadline: 'Manage unlimited locations from one dashboard',
      description: 'Centralized inventory management across all lots. Inter-lot transfers tracked. Location-specific KPIs and performance metrics.',
      bullets: [
        'Central dashboard for all locations',
        'Real-time transfer status tracking',
        'Location-specific performance metrics',
        'Cross-lot resource allocation',
        'Consolidated reporting for finance teams'
      ]
    }
  },
  {
    id: 8,
    title: "Rental Assignment Automation",
    section: "Revenue Operations",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Automated Rental Processing',
      subheadline: '90% faster customer turnaround',
      description: 'Intelligent vehicle assignment based on category and availability. Seamless transaction processing and automated rental workflow.',
      bullets: [
        'AI-powered vehicle category matching',
        'Instant availability detection',
        'Automated rental agreement generation',
        'Digital signature capture',
        'One-click checkout & payment processing'
      ]
    }
  },
  {
    id: 9,
    title: "Vehicle Inspection System",
    section: "Quality Assurance",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Smart Inspection Checklists',
      subheadline: 'Protect against damage claims & disputes',
      description: 'Pre-rental and return inspections with photo documentation. Condition scoring and automated damage charge calculations.',
      bullets: [
        'Digital inspection forms with photos',
        'Before/after damage documentation',
        'AI-powered damage detection',
        'Automated damage cost calculation',
        'Dispute resolution with evidence trail'
      ]
    }
  },
  {
    id: 10,
    title: "Compliance & Verification",
    section: "Risk Management",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Automated Compliance Checks',
      subheadline: 'Reduce liability and regulatory risk',
      description: 'License verification, insurance validation, and automated compliance rejections. Eligibility scoring for renters.',
      bullets: [
        'Real-time license validation integration',
        'Insurance verification checks',
        'Automated eligibility scoring',
        'Compliance rejection workflow',
        'Audit trail for regulatory reporting'
      ]
    }
  },
  {
    id: 11,
    title: "Fuel & Cost Optimization",
    section: "Cost Management",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Fuel & Mileage Intelligence',
      subheadline: 'Reduce waste, increase profitability',
      description: 'Track fuel consumption per vehicle. Route optimization to reduce mileage. Anomaly detection for fuel theft.',
      bullets: [
        'Fuel economy tracking per vehicle',
        'Trip distance analysis & trends',
        'Fuel theft detection alerts',
        'Route optimization recommendations',
        'Cost per mile metrics & benchmarking'
      ]
    }
  },
  {
    id: 12,
    title: "Insurance Integration",
    section: "Enterprise Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Insurance & Claims Integration',
      subheadline: 'Streamlined claims & reduced fraud',
      description: 'Automatic accident detection via GPS data. Damage photos integrated with claim documentation. Fraud prevention.',
      bullets: [
        'GPS accident detection triggers',
        'Damage photo integration',
        'Automated claim submission',
        'Accident history tracking',
        'Insurance rate optimization analysis'
      ]
    }
  },
  {
    id: 13,
    title: "Mobile App Features",
    section: "Mobile Operations",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Lot Attendant Mobile App',
      subheadline: 'Empower your team with instant information',
      description: 'Real-time vehicle location, quick inspections, transfer coordination. Everything your lot team needs on mobile.',
      bullets: [
        'Live GPS map of all vehicles',
        'Quick vehicle search & filters',
        'Mobile inspection forms with photos',
        'Transfer coordination workflow',
        'Offline mode for poor connectivity areas'
      ]
    }
  },
  {
    id: 14,
    title: "Key Use Cases",
    section: "Applications",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Built for Multiple Industries',
      subheadline: 'Rental agencies, dealers, fleet operators, and logistics',
      description: 'Lot Ops Pro adapts to any organization managing vehicle inventory and operations.',
      bullets: [
        'Car rental agencies: Utilization & revenue optimization',
        'Auto dealers: Inventory tracking & inspection automation',
        'Fleet operators: Maintenance scheduling & cost control',
        'Logistics companies: Real-time asset tracking',
        'Equipment rental: Cross-category inventory management'
      ]
    }
  },
  {
    id: 15,
    title: "ROI & Results",
    section: "Business Impact",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Proven Results',
      subheadline: 'Real data from real customers',
      description: 'Organizations using Lot Ops Pro see immediate improvements in efficiency, utilization, and profitability.',
      bullets: [
        '35% increase in fleet utilization rates',
        '45% reduction in maintenance-related downtime',
        '60% faster rental processing',
        '25% reduction in fuel costs',
        '3-4 month ROI on average'
      ]
    }
  },
  {
    id: 16,
    title: "Future Roadmap",
    section: "Innovation",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Future Capabilities',
      subheadline: 'Advanced features coming soon',
      description: 'We\'re constantly innovating to keep Lot Ops Pro ahead of industry needs.',
      bullets: [
        'AI-powered predictive maintenance (Q2 2025)',
        'Autonomous vehicle fleet management (Q3 2025)',
        'Blockchain warranty tracking (Q4 2025)',
        'Advanced pricing optimization (Q1 2026)',
        'Integration with autonomous vehicle services'
      ]
    }
  },
  {
    id: 17,
    title: "Security & Compliance",
    section: "Trust & Safety",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Enterprise-Grade Security',
      subheadline: 'Your data is protected',
      description: 'Bank-level encryption, compliance with automotive regulations, and continuous security monitoring.',
      bullets: [
        'End-to-end encryption for all data',
        'SOC 2 Type II compliant',
        'GDPR & CCPA compliance',
        'Regular security audits & penetration testing',
        'Disaster recovery & 99.99% uptime SLA'
      ]
    }
  },
  {
    id: 18,
    title: "Seamless Integration",
    section: "Technical",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'API-First Architecture',
      subheadline: 'Connects with your existing systems',
      description: 'RESTful APIs and webhooks for easy integration with your CRM, accounting, and fleet management systems.',
      bullets: [
        'REST & GraphQL APIs',
        'Webhook support for real-time events',
        'Pre-built integrations (QuickBooks, ADP, Salesforce)',
        'Custom integration support',
        'Comprehensive API documentation'
      ]
    }
  },
  {
    id: 19,
    title: "Pricing & Plans",
    section: "Commercial",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Flexible Pricing',
      subheadline: 'Scales with your business',
      description: 'Pay only for what you use. No hidden fees. Annual discounts available.',
      bullets: [
        'Per-vehicle monthly pricing',
        'Add-on modules for advanced features',
        'Volume discounts for 100+ vehicles',
        'Enterprise custom pricing',
        'No setup fees or long-term contracts'
      ]
    }
  },
  {
    id: 20,
    title: "Customer Success",
    section: "Support",
    duration: 8,
    content: {
      type: 'feature',
      headline: '24/7 Expert Support',
      subheadline: 'We\'re here to help you succeed',
      description: 'Dedicated support team, comprehensive training, and continuous optimization.',
      bullets: [
        'Phone, email, chat support available 24/7',
        'Dedicated account manager for enterprise',
        'Training programs for your team',
        'Quarterly business reviews',
        'Pro tips & optimization recommendations'
      ]
    }
  },
  {
    id: 21,
    title: "Getting Started",
    section: "Implementation",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Quick 30-Day Implementation',
      subheadline: 'From signup to operations in one month',
      description: 'Streamlined onboarding process with minimal disruption to your operations.',
      bullets: [
        'Week 1: Setup & vehicle tagging',
        'Week 2: Team training & integration',
        'Week 3: Live pilot with 10% of fleet',
        'Week 4: Full rollout & optimization',
        'Ongoing: Continuous improvement'
      ]
    }
  },
  {
    id: 22,
    title: "Competitive Advantage",
    section: "Differentiation",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Why Lot Ops Pro Stands Out',
      subheadline: 'Unique capabilities competitors don\'t offer',
      description: 'We\'ve built features specifically for automotive lot operations, not generic fleet management.',
      bullets: [
        'Rental-focused inspection workflows',
        'Multi-category inventory optimization',
        'Damage prediction algorithms',
        'Rental agreement automation',
        'Industry-specific compliance rules'
      ]
    }
  },
  {
    id: 23,
    title: "Case Study: Rental Company",
    section: "Success Stories",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Enterprise Rental Agency Success',
      subheadline: 'From chaos to control',
      description: 'A leading rental company with 5,000 vehicles across 50 locations transformed their operations.',
      bullets: [
        '40% reduction in administrative overhead',
        '25% increase in daily rental rates',
        '50% faster vehicle-to-customer time',
        'Real-time visibility across all 50 locations',
        'Saved $2.3M in first year alone'
      ]
    }
  },
  {
    id: 24,
    title: "Case Study: Auto Dealer",
    section: "Success Stories",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Regional Auto Dealer Achievement',
      subheadline: 'Inventory chaos solved',
      description: 'Medium-sized dealer with 300-vehicle inventory improved operations dramatically.',
      bullets: [
        '95% accuracy in inventory counts',
        '60% reduction in inspection time per vehicle',
        'Zero lost vehicles (previously 3-5 per month)',
        'Integrated damage documentation for finance',
        'Customers could verify vehicle history instantly'
      ]
    }
  },
  {
    id: 25,
    title: "Lot Ops Pro vs Competitors",
    section: "Comparison",
    duration: 8,
    content: {
      type: 'comparison',
      headline: 'Why We\'re Different',
      bullets: [
        'Built specifically for lot operations (not generic fleet tools)',
        'Fastest implementation (30 days vs 90+ days)',
        'Best customer support (24/7 dedicated team)',
        'Most intuitive mobile app (loved by lot attendants)',
        'Transparent pricing with no hidden fees'
      ]
    }
  },
  {
    id: 26,
    title: "The Darkwave Advantage",
    section: "Company",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Built by Automotive Experts',
      subheadline: 'Founded by people who understand lot operations',
      description: 'Lot Ops Pro comes from Darkwave Studios - the same team behind ORBIT Staffing OS and DarkWave Pulse.',
      bullets: [
        '15+ years automotive industry experience',
        'Proven track record with enterprise clients',
        'Continuous innovation & feature releases',
        'Part of integrated ecosystem of solutions',
        'Commitment to automotive excellence'
      ]
    }
  },
  {
    id: 27,
    title: "Security Certifications",
    section: "Compliance",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Certified & Audited',
      subheadline: 'Enterprise-grade security standards',
      description: 'Lot Ops Pro meets the highest security and compliance standards in the industry.',
      bullets: [
        'SOC 2 Type II certified',
        'ISO 27001 information security',
        'PCI DSS Level 1 compliant',
        'GDPR & CCPA fully compliant',
        'Annual third-party security audits'
      ]
    }
  },
  {
    id: 28,
    title: "Free Trial",
    section: "Offer",
    duration: 8,
    content: {
      type: 'cta',
      headline: 'Start Your Free 30-Day Trial Today',
      description: 'No credit card required. No setup fees. Experience the Lot Ops Pro difference risk-free.'
    }
  },
  {
    id: 29,
    title: "Customization Options",
    section: "Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Built to Customize',
      subheadline: 'Adapt to your unique workflows',
      description: 'Every organization is different. Lot Ops Pro is highly customizable to your specific needs.',
      bullets: [
        'Custom inspection checklists',
        'Brand customization & white-label options',
        'Workflow automation rules',
        'Custom report builders',
        'API access for custom integrations'
      ]
    }
  },
  {
    id: 30,
    title: "Scalability Proof",
    section: "Enterprise",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Proven at Enterprise Scale',
      subheadline: 'From startup to 50,000+ vehicles',
      description: 'Lot Ops Pro handles operations of any size - from a single lot to global fleet management.',
      bullets: [
        'Handles 10,000+ concurrent users',
        'Manages 100,000+ vehicle records',
        'Multi-country support with localization',
        'Sub-second API response times',
        'Scales horizontally for infinite growth'
      ]
    }
  },
  {
    id: 31,
    title: "Environmental Impact",
    section: "Sustainability",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Drive Sustainability',
      subheadline: 'Reduce emissions through optimization',
      description: 'Lot Ops Pro\'s route optimization and utilization improvements directly reduce carbon footprint.',
      bullets: [
        'Route optimization reduces miles by 20%',
        'Predictive maintenance extends vehicle life',
        'Utilization tracking reduces excess vehicles',
        'Environmental impact dashboard',
        'Carbon credit tracking & reporting'
      ]
    }
  },
  {
    id: 32,
    title: "Training & Certification",
    section: "Support",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Train Your Team Properly',
      subheadline: 'Certification programs available',
      description: 'We offer comprehensive training and certification programs to ensure your team gets maximum value.',
      bullets: [
        'Onsite & remote training available',
        'Lot Ops Pro Certified specialist program',
        'Video training library & tutorials',
        'Best practices guide (150+ pages)',
        'Monthly webinars & Q&A sessions'
      ]
    }
  },
  {
    id: 33,
    title: "Ready to Transform?",
    section: "Action",
    duration: 8,
    content: {
      type: 'cta',
      headline: 'Transform Your Lot Operations Today',
      description: 'Join hundreds of companies using Lot Ops Pro to revolutionize their operations. Schedule a demo now.'
    }
  },
  {
    id: 34,
    title: "Contact Information",
    section: "Details",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Get in Touch',
      description: 'Ready to learn more? Our team is here to help.',
      bullets: [
        'Sales: sales@darkwavestudios.io',
        'Support: support@darkwavestudios.io',
        'Phone: 1-800-LOT-OPSPRO',
        'Website: www.darkwavestudios.io',
        'Demo: Schedule at darkwavestudios.io/demo'
      ]
    }
  },
  {
    id: 35,
    title: "Thank You",
    section: "Closing",
    duration: 12,
    content: {
      type: 'closing',
      headline: 'Thank You for Exploring Lot Ops Pro',
      description: 'Transform your lot operations with the power of automation, analytics, and intelligence.'
    }
  }
];

export const orbitSlides: Slide[] = [
  {
    id: 1,
    title: "ORBIT Staffing OS",
    section: "Opening & Hook",
    duration: 8,
    content: {
      type: 'hero',
      headline: 'ORBIT Staffing OS',
      subheadline: 'Eliminate manual staffing workflows. 100% automation from hire to payroll.'
    }
  },
  {
    id: 2,
    title: "The Staffing Crisis",
    section: "Problem Statement",
    duration: 8,
    content: {
      type: 'problem',
      headline: 'Staffing Agencies Face Critical Challenges',
      bullets: [
        'Manual matching = Lost time and wrong placements',
        'No compliance tracking = Regulatory risks and fines',
        'Broken payroll workflows = Worker dissatisfaction',
        'Zero visibility = Can\'t scale operations',
        'Outdated systems = Losing business to competitors'
      ]
    }
  },
  {
    id: 3,
    title: "ORBIT Solution",
    section: "Solution Overview",
    duration: 8,
    content: {
      type: 'solution',
      headline: 'ORBIT - Complete Staffing Automation',
      bullets: [
        'AI-powered worker matching - find perfect fit instantly',
        'Fully automated payroll - 2025 tax compliance built-in',
        'GPS-verified check-ins - 300ft geofencing accuracy',
        'Real-time dashboards - complete operational visibility',
        'Zero manual entry - 100% automation, zero errors'
      ]
    }
  },
  {
    id: 4,
    title: "Intelligent Matching",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'AI-Powered Worker Matching',
      subheadline: 'Automate recruitment and placement',
      description: 'Machine learning algorithms analyze skills, availability, and preferences to match workers with perfect opportunities instantly.',
      bullets: [
        'Skill-based matching engine',
        'Automatic candidate screening',
        'Real-time availability checking',
        'Preference-aware assignments',
        'Bias-free objective matching'
      ]
    }
  },
  {
    id: 5,
    title: "Automated Payroll",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Fully Automated Payroll',
      subheadline: '2025 tax compliance built-in',
      description: 'Process payroll in minutes. Multi-state tax handling, garnishment processing, and W-2 generation all automated.',
      bullets: [
        'One-click payroll processing',
        'Multi-state tax compliance',
        'Automatic garnishment routing',
        'PDF paystub generation',
        'Direct deposit & check processing'
      ]
    }
  },
  {
    id: 6,
    title: "GPS Verification",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'GPS-Verified Clock-In/Out',
      subheadline: '300ft geofencing with biometric security',
      description: 'Know exactly when and where workers are. Prevent time theft. Verify assignments with location data.',
      bullets: [
        '300ft geofencing accuracy',
        'Real-time GPS tracking',
        'Biometric verification',
        'Photo timestamp capture',
        'Automatic time corrections'
      ]
    }
  },
  {
    id: 7,
    title: "Real-Time Dashboard",
    section: "Enterprise Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Operational Intelligence',
      subheadline: 'Live visibility across all operations',
      description: 'WebSocket-powered real-time dashboard. See assignments, timesheets, payroll status, and worker performance live.',
      bullets: [
        'Live worker locations on map',
        'Real-time assignment status',
        'Active timesheet monitoring',
        'Instant notification alerts',
        'Mobile app for on-the-go'
      ]
    }
  },
  {
    id: 8,
    title: "Compliance & Security",
    section: "Compliance",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Enterprise-Grade Security',
      subheadline: 'Compliance ready, audit-proof',
      description: 'I-9 verification, background checks, drug testing, prevailing wage, and complete audit trails.',
      bullets: [
        'I-9 E-Verify integration',
        'Background check automation',
        'Prevailing wage compliance',
        'Complete audit trails',
        'Encrypted SSN storage'
      ]
    }
  },
  {
    id: 9,
    title: "Dual Referral System",
    section: "Growth Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Built-In Growth Incentives',
      subheadline: 'Viral worker referrals + public marketplace',
      description: 'Worker-to-worker referrals ($100 per 40hrs) and public marketplace referrals ($50 per 80hrs) drive organic growth.',
      bullets: [
        'Worker-to-worker: $100 per 40 hours',
        'Public marketplace: $50 per 80 hours',
        'Real-time referral tracking',
        'Automatic bonus calculations',
        'Viral growth mechanics'
      ]
    }
  },
  {
    id: 10,
    title: "Transparent Pricing",
    section: "Pricing",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Customer Service Agency (CSA) Model',
      subheadline: '1.45x transparent markup',
      description: 'Simple, fair pricing. Charge clients 1.45x worker cost. No hidden fees. No complexity.',
      bullets: [
        '1.45x transparent markup to clients',
        'Worker wages paid in full',
        'Your margin: 31% of worker cost',
        'Fixed monthly fee or revenue-share options',
        'White-label available for agencies'
      ]
    }
  },
  {
    id: 11,
    title: "Ready to Transform?",
    section: "Action",
    duration: 8,
    content: {
      type: 'cta',
      headline: 'Transform Your Staffing Today',
      description: 'Join agencies nationwide using ORBIT to eliminate manual work and scale operations. Start your free trial.'
    }
  },
  {
    id: 12,
    title: "Thank You",
    section: "Closing",
    duration: 12,
    content: {
      type: 'closing',
      headline: 'Thank You for Exploring ORBIT Staffing OS',
      description: 'The future of staffing is automated, compliant, and infinitely scalable.'
    }
  }
];

export const brewAndBoardSlides: Slide[] = [
  {
    id: 1,
    title: "Brew & Board Coffee",
    section: "Opening & Hook",
    duration: 8,
    content: {
      type: 'hero',
      headline: 'Brew & Board Coffee',
      subheadline: 'B2B Coffee Delivery for Nashville Businesses'
    }
  },
  {
    id: 2,
    title: "The Challenge",
    section: "Problem Statement",
    duration: 8,
    content: {
      type: 'problem',
      headline: 'Meeting Coffee is a Headache',
      bullets: [
        'Coordinating with multiple coffee vendors wastes time',
        'No easy way to schedule deliveries in advance',
        'Hidden fees and unreliable delivery times',
        'Tracking orders across different platforms is chaotic'
      ]
    }
  },
  {
    id: 3,
    title: "The Solution",
    section: "Solution Overview",
    duration: 8,
    content: {
      type: 'solution',
      headline: 'Brew & Board - Coffee Concierge',
      bullets: [
        'One platform for 20+ Nashville coffee vendors',
        'Schedule deliveries days or weeks in advance',
        'Transparent pricing with distance-based fees',
        'Real-time order tracking and status updates'
      ]
    }
  },
  {
    id: 4,
    title: "Nashville Vendors",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Local Favorites & National Chains',
      subheadline: 'The best of Nashville coffee in one place',
      description: 'Access Crema, Barista Parlor, Frothy Monkey, plus Starbucks, Dunkin, and specialty bakeries.',
      bullets: [
        'Artisan local roasters',
        'National chains with multiple locations',
        'Specialty bakeries like Crumbl and Five Daughters',
        'Smoothie shops for health-conscious teams'
      ]
    }
  },
  {
    id: 5,
    title: "Smart Pricing",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Distance-Based Delivery',
      subheadline: 'Fair and transparent pricing',
      description: 'Pay based on actual distance, not flat rates that overcharge nearby orders.',
      bullets: [
        '$5 base delivery for vendors within 10 miles',
        '+$7.50 premium for extended delivery areas',
        '15% service fee on one-time orders',
        'Subscription discounts up to 100% on fees'
      ]
    }
  },
  {
    id: 6,
    title: "Easy Scheduling",
    section: "Core Features",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Calendar-Based Ordering',
      subheadline: 'Plan ahead with confidence',
      description: 'Visual calendar interface makes scheduling multiple deliveries simple.',
      bullets: [
        'Schedule orders days or weeks ahead',
        '2-hour minimum lead time guarantee',
        'Recurring order support for regular meetings',
        'Special instructions for each delivery'
      ]
    }
  },
  {
    id: 7,
    title: "Blockchain Hallmarks",
    section: "Security",
    duration: 8,
    content: {
      type: 'feature',
      headline: 'Verified with Blockchain',
      subheadline: 'Tamper-proof document verification',
      description: 'Every receipt and invoice can be permanently verified on Solana blockchain.',
      bullets: [
        'Unique hallmark codes for each document',
        'QR code verification for instant validation',
        'Permanent record that cannot be altered',
        'Professional credibility for your business'
      ]
    }
  },
  {
    id: 8,
    title: "Subscription Plans",
    section: "Pricing",
    duration: 8,
    content: {
      type: 'comparison',
      headline: 'Plans for Every Business Size',
      bullets: [
        'Starter $29/mo - 10 orders, 10% fee discount',
        'Professional $79/mo - 50 orders, 50% discount, free delivery',
        'Enterprise $199/mo - Unlimited orders, no fees, priority service'
      ]
    }
  },
  {
    id: 9,
    title: "Get Started",
    section: "Call to Action",
    duration: 8,
    content: {
      type: 'cta',
      headline: 'Fuel Your Next Meeting',
      subheadline: 'Sign up at brewandboard.coffee'
    }
  }
];
