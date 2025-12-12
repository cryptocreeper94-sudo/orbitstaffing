/**
 * Developer Panel
 * Full technical access to system APIs, configurations, and developer tools
 * Everything non-business-sensitive for developers and tech partners
 */
import React, { useState, useEffect, useRef } from 'react';
import { Code, Lock, LogOut, AlertCircle, CheckCircle2, Key, Database, Zap, Shield, Eye, Copy, BarChart3, MessageCircle, ExternalLink, AlertTriangle, Camera, Calendar, ArrowRight, Scale, FileText, Edit, Clock, Target, Trophy, Building2, Users, Briefcase, Bot, Megaphone, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { HallmarkWatermark, HallmarkBadge } from '@/components/HallmarkWatermark';
import { DigitalEmployeeCard } from '@/components/DigitalEmployeeCard';
import PersonalCardGenerator from '@/components/PersonalCardGenerator';
import EnhancedAdminMessaging from '@/components/EnhancedAdminMessaging';
import WeatherNewsWidget from '@/components/WeatherNewsWidget';
import { BugReportWidget } from '@/components/BugReportWidget';
import HourCounter from '@/components/HourCounter';
import UniversalEmployeeRegistry from '@/components/UniversalEmployeeRegistry';
import { AdminWorkerAvailabilityManager } from './AdminWorkerAvailabilityManager';
import { getValidSession, setSessionWithExpiry, clearSession, isMobileDevice, shouldBypassMobileLogin } from '@/lib/sessionUtils';
import { AssetTracker } from '@/components/AssetTracker';
import { shouldBypassDeveloperLogin, enableBypassOnThisDevice, disableBypassOnThisDevice, isBypassDeviceEnabled } from '@/lib/deviceFingerprint';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BusinessValuationDashboard } from '@/components/BusinessValuationDashboard';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLoginHistory } from '@/components/AdminLoginHistory';
import { LegalDocs } from '@/components/LegalDocs';
import { FloatingHelpButton } from '@/components/HelpCenter';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { BentoGrid, BentoTile } from '@/components/ui/bento-grid';
import { CarouselRail, CarouselRailItem } from '@/components/ui/carousel-rail';
import { SectionHeader, PageHeader } from '@/components/ui/section-header';
import { OrbitCard, OrbitCardHeader, OrbitCardTitle, OrbitCardDescription, OrbitCardContent, StatCard, ActionCard } from '@/components/ui/orbit-card';

const DEVELOPER_SESSION_KEY = 'developer';

// OAuth Provider Configuration with Setup Links
const OAUTH_PROVIDERS = [
  {
    type: 'quickbooks',
    name: 'QuickBooks',
    setupLink: 'https://developer.intuit.com/app/developer/qbo/docs/get-started',
    fields: ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'],
  },
  {
    type: 'adp',
    name: 'ADP',
    setupLink: 'https://developers.adp.com/getting-started',
    fields: ['ADP_CLIENT_ID', 'ADP_CLIENT_SECRET'],
  },
  {
    type: 'paychex',
    name: 'Paychex',
    setupLink: 'https://developer.paychex.com/',
    fields: ['PAYCHEX_CLIENT_ID', 'PAYCHEX_CLIENT_SECRET'],
  },
  {
    type: 'gusto',
    name: 'Gusto',
    setupLink: 'https://dev.gusto.com/docs/api/',
    fields: ['GUSTO_CLIENT_ID', 'GUSTO_CLIENT_SECRET'],
  },
  {
    type: 'rippling',
    name: 'Rippling',
    setupLink: 'https://developer.rippling.com/',
    fields: ['RIPPLING_CLIENT_ID', 'RIPPLING_CLIENT_SECRET'],
  },
  {
    type: 'workday',
    name: 'Workday',
    setupLink: 'https://community.workday.com/dev',
    fields: ['WORKDAY_CLIENT_ID', 'WORKDAY_CLIENT_SECRET'],
  },
  {
    type: 'paylocity',
    name: 'Paylocity',
    setupLink: 'https://www.paylocity.com/api/',
    fields: ['PAYLOCITY_CLIENT_ID', 'PAYLOCITY_CLIENT_SECRET'],
  },
  {
    type: 'onpay',
    name: 'OnPay',
    setupLink: 'https://api.onpay.com/',
    fields: ['ONPAY_CLIENT_ID', 'ONPAY_CLIENT_SECRET'],
  },
  {
    type: 'bullhorn',
    name: 'Bullhorn',
    setupLink: 'https://bullhorn.github.io/rest-api-docs/',
    fields: ['BULLHORN_CLIENT_ID', 'BULLHORN_CLIENT_SECRET'],
  },
  {
    type: 'wurknow',
    name: 'WurkNow',
    setupLink: 'https://www.wurknow.com/api',
    fields: ['WURKNOW_CLIENT_ID', 'WURKNOW_CLIENT_SECRET'],
  },
  {
    type: 'ukgpro',
    name: 'UKG Pro',
    setupLink: 'https://developer.ukg.com/',
    fields: ['UKGPRO_CLIENT_ID', 'UKGPRO_CLIENT_SECRET'],
  },
  {
    type: 'bamboohr',
    name: 'BambooHR',
    setupLink: 'https://documentation.bamboohr.com/docs',
    fields: ['BAMBOOHR_CLIENT_ID', 'BAMBOOHR_CLIENT_SECRET'],
  },
  {
    type: 'google',
    name: 'Google Workspace',
    setupLink: 'https://console.cloud.google.com/apis/credentials',
    fields: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    type: 'microsoft',
    name: 'Microsoft 365',
    setupLink: 'https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
    fields: ['MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'],
  },
];

// Jason's To-Do List Data - Comprehensive Production Setup
const TODO_TASKS = [
  {
    id: 'theme-system',
    name: '🎨 Theme System (150+ Themes)',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'White-label branding, sports team themes, light/dark modes for Sid',
    setupGuide: '/settings',
    action: 'Theme system fully implemented',
    notes: [
      '✅ COMPLETED! 150+ professional themes live',
      '',
      '🎯 THEME CATEGORIES:',
      '• Light/Dark base modes',
      '• NFL Teams (all 32 teams)',
      '• NBA Teams (all 30 teams)',
      '• MLB Teams (all 30 teams)',
      '• NHL Teams (all 32 teams)',
      '• College Teams (50+ schools)',
      '• Custom brand colors',
      '',
      '⚙️ ACCESS: Settings → Theme Gallery',
    ],
  },
  {
    id: 'darkwave-ecosystem',
    name: '🌐 DarkWave Ecosystem Hub',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'Cross-product data syncing, GarageBot & Brew & Board connections',
    setupGuide: '/dev-portal',
    action: 'Ecosystem hub live with connected apps',
    notes: [
      '✅ COMPLETED! Ecosystem Hub is live',
      '',
      '🔗 CONNECTED APPS:',
      '• GarageBot - Active (syncing workers/contractors)',
      '• Brew & Board Coffee - Active',
      '• Lot Ops Pro - Ready to connect',
      '• DarkWave Pulse - Ready to connect',
      '',
      '📡 API FEATURES:',
      '• HMAC-SHA256 authentication',
      '• Worker/contractor sync',
      '• Payroll data exchange',
      '• Activity logging',
    ],
  },
  {
    id: 'orby-assistant',
    name: '🪐 Orby AI Assistant',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'AI-powered help for users, voice-enabled, context-aware',
    setupGuide: '/dashboard',
    action: 'Orby integrated into footer',
    notes: [
      '✅ COMPLETED! Orby AI is live in footer',
      '',
      '🎯 FEATURES:',
      '• Footer-integrated (non-blocking)',
      '• Auto-minimizes after 3s greeting',
      '• Voice input/output support',
      '• Male/female voice toggle',
      '• Context-aware staffing responses',
      '• Powered by OpenAI GPT-4',
    ],
  },
  {
    id: 'pwa-mobile',
    name: '📱 PWA Mobile App',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'Install on phone like native app, offline support, push notifications',
    setupGuide: '/dashboard',
    action: 'PWA fully configured',
    notes: [
      '✅ COMPLETED! PWA ready for installation',
      '',
      '🎯 FEATURES:',
      '• Full-color Orby mascot icon',
      '• Splash screen on launch',
      '• Smart install prompt (7-day cooldown)',
      '• Service worker for offline caching',
      '• Works on iOS & Android',
    ],
  },
  {
    id: 'stripe-payments',
    name: '💳 Stripe Payment Processing',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'CSA billing ($39/$99/$249 plans), garnishment payments, worker payouts',
    setupGuide: 'https://dashboard.stripe.com/apikeys',
    action: 'Connected to DarkWave Stripe account',
    notes: [
      '✅ COMPLETED! Connected to your DarkWave Stripe account',
      '',
      '📦 PRODUCTS CREATED:',
      '• ORBIT Starter - $39/month (price_1SYoQkPQpkkF93FKsLEssZzb)',
      '• ORBIT Growth - $99/month (price_1SYoQlPQpkkF93FKh9pRxrdL)',
      '• ORBIT Professional - $249/month (price_1SYoQlPQpkkF93FKaNLqc6T6)',
      '',
      '🔑 SECRETS CONFIGURED: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY',
    ],
  },
  {
    id: 'stripe-webhook',
    name: '🔔 Stripe Webhook',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'Payment confirmations, subscription updates, failed payment alerts',
    setupGuide: 'https://dashboard.stripe.com/webhooks',
    action: 'Webhook configured for orbitstaffing.io',
    notes: [
      '✅ COMPLETED! Webhook active',
      '',
      '🔗 ENDPOINT: https://orbitstaffing.io/api/payments/stripe/webhook',
      '🔑 SECRET CONFIGURED: STRIPE_WEBHOOK_SECRET',
      '',
      '📡 LISTENING FOR: Subscription events, billing, invoices, customers',
    ],
  },
  {
    id: 'stripe-issuing',
    name: '💳 Stripe Issuing - Worker Pay Cards',
    priority: 'HIGH',
    priorityBadge: '🔥 GAME CHANGER',
    priorityColor: 'red',
    why: '90% of temp workers dont have bank accounts - pay cards = HUGE competitive advantage',
    setupGuide: 'https://stripe.com/issuing',
    action: 'Apply for Stripe Issuing',
    notes: [
      '✅ STATUS: Requires Stripe account first',
      '',
      '📋 STEP-BY-STEP:',
      '1. Complete basic Stripe setup first',
      '2. Go to: https://dashboard.stripe.com/issuing',
      '3. Click "Get started with Issuing"',
      '4. Fill out business application (takes 1-3 days approval)',
      '5. Once approved, Issuing features activate automatically',
      '',
      '💰 COST: Virtual cards $0.10 each, Physical cards included free',
      '🎯 VALUE: Daily pay, instant payouts, branded cards',
    ],
  },
  {
    id: 'twilio-sms',
    name: '📱 Twilio SMS Notifications',
    priority: 'MEDIUM',
    priorityBadge: '⚡ IMPORTANT',
    priorityColor: 'orange',
    why: 'Worker shift offers, payroll alerts, safety notifications, clock-in reminders',
    setupGuide: 'https://console.twilio.com/',
    action: 'Get Twilio credentials',
    notes: [
      '✅ STATUS: Code ready, just needs credentials',
      '',
      '📋 STEP-BY-STEP:',
      '1. Go to: https://www.twilio.com/try-twilio (create free account)',
      '2. Verify your phone number',
      '3. From Console dashboard, copy:',
      '   - Account SID (starts with AC)',
      '   - Auth Token (click to reveal)',
      '4. Go to: Phone Numbers → Buy a Number',
      '5. Buy a local number ($1/month)',
      '6. In Replit Secrets add:',
      '   - TWILIO_ACCOUNT_SID = ACxxxxxxx',
      '   - TWILIO_AUTH_TOKEN = your_token',
      '   - TWILIO_PHONE_NUMBER = +1XXXXXXXXXX',
      '',
      '💰 COST: $1/month per number + $0.0079 per SMS',
      '🎁 FREE: $15 trial credit included',
    ],
  },
  {
    id: 'coinbase-commerce',
    name: '₿ Coinbase Commerce (Crypto Payments)',
    priority: 'MEDIUM',
    priorityBadge: '⚡ OPTIONAL',
    priorityColor: 'orange',
    why: 'Accept Bitcoin/crypto for franchise payments, garnishment creditors, premium features',
    setupGuide: 'https://commerce.coinbase.com/',
    action: 'Get Coinbase Commerce API key',
    notes: [
      '✅ STATUS: Already have key configured!',
      '',
      '📋 IF NEED NEW KEY:',
      '1. Go to: https://commerce.coinbase.com/signin',
      '2. Sign in with Coinbase account (or create one)',
      '3. Go to Settings → API keys',
      '4. Create new API key',
      '5. In Replit Secrets: COINBASE_API_KEY = your_key',
      '',
      '💰 COST: 1% transaction fee',
      '🎯 VALUE: No chargebacks, instant settlement',
    ],
  },
  {
    id: 'email-service',
    name: '📧 Email Service (SendGrid)',
    priority: 'MEDIUM',
    priorityBadge: '⚡ FOR CAMPAIGNS',
    priorityColor: 'orange',
    why: 'Mass email campaigns, payroll notifications, compliance reminders, job broadcasts',
    setupGuide: 'https://sendgrid.com/',
    action: 'Get SendGrid API key',
    notes: [
      '✅ STATUS: Email templates ready in code',
      '',
      '📋 STEP-BY-STEP:',
      '1. Go to: https://signup.sendgrid.com/',
      '2. Create free account (100 emails/day free)',
      '3. Complete sender verification (verify your domain)',
      '4. Go to: Settings → API Keys → Create API Key',
      '5. Name it "ORBIT Production"',
      '6. Select "Full Access"',
      '7. Copy the key (only shown once!)',
      '8. In Replit Secrets: SENDGRID_API_KEY = SG.xxxxx',
      '',
      '💰 COST: Free tier = 100/day, $19.95/mo = 50,000/mo',
    ],
  },
  {
    id: 'domain-setup',
    name: '🌐 Custom Domain (orbitstaffing.io)',
    priority: 'LOW',
    priorityBadge: '📌 WHEN READY',
    priorityColor: 'blue',
    why: 'Professional branding, better SEO, custom email addresses',
    setupGuide: 'https://docs.replit.com/hosting/custom-domains',
    action: 'Connect domain to Replit deployment',
    notes: [
      '✅ STATUS: Domain owned, needs connection',
      '',
      '📋 STEP-BY-STEP:',
      '1. Deploy app on Replit first',
      '2. In Replit: Go to Deployments → Settings',
      '3. Click "Link a domain"',
      '4. Enter: orbitstaffing.io',
      '5. Copy the CNAME record shown',
      '6. Go to your domain registrar (GoDaddy, Namecheap, etc.)',
      '7. Add CNAME record pointing to Replit',
      '8. Wait 15-30 min for DNS propagation',
      '9. SSL certificate auto-generated',
    ],
  },
  {
    id: 'google-play',
    name: '📱 Google Play Store Submission',
    priority: 'LOW',
    priorityBadge: '📌 AFTER TESTING',
    priorityColor: 'blue',
    why: 'Android app for workers - clock in/out, view shifts, accept assignments',
    setupGuide: 'https://play.google.com/console/',
    action: 'Submit ORBIT Worker app to Google Play',
    notes: [
      '✅ STATUS: App code ready',
      '',
      '📋 STEP-BY-STEP:',
      '1. Go to: https://play.google.com/console/',
      '2. Pay $25 one-time developer fee',
      '3. Create new app listing',
      '4. Run: npx expo build:android',
      '5. Upload APK/AAB file',
      '6. Fill out store listing (screenshots, description)',
      '7. Complete content rating questionnaire',
      '8. Submit for review (2-7 days)',
      '',
      '💰 COST: $25 one-time',
    ],
  },
  {
    id: 'apple-store',
    name: '🍎 Apple App Store Submission',
    priority: 'LOW',
    priorityBadge: '📌 AFTER TESTING',
    priorityColor: 'blue',
    why: 'iOS app for workers - same features as Android',
    setupGuide: 'https://developer.apple.com/',
    action: 'Submit ORBIT Worker app to App Store',
    notes: [
      '✅ STATUS: App code ready',
      '',
      '📋 STEP-BY-STEP:',
      '1. Go to: https://developer.apple.com/programs/enroll/',
      '2. Enroll in Apple Developer Program ($99/year)',
      '3. Need a Mac for final build (or use Expo EAS)',
      '4. Run: npx expo build:ios',
      '5. Upload to App Store Connect',
      '6. Fill out app listing',
      '7. Submit for review (1-3 days)',
      '',
      '💰 COST: $99/year',
    ],
  },
  {
    id: 'openai-api',
    name: '🤖 OpenAI API (AI Features)',
    priority: 'DONE',
    priorityBadge: '✅ COMPLETE',
    priorityColor: 'green',
    why: 'Enhanced AI matching, chatbot support, smart resume parsing',
    setupGuide: 'https://platform.openai.com/api-keys',
    action: 'OpenAI API connected and active',
    notes: [
      '✅ COMPLETED! OpenAI API is live and powering Orby AI',
      '',
      '🎯 FEATURES ACTIVE:',
      '• Orby AI Chat Assistant (footer integration)',
      '• Voice-enabled with male/female options',
      '• Context-aware responses for staffing questions',
      '• Auto-minimizes to footer after greeting',
      '',
      '🔑 SECRET CONFIGURED: OPENAI_API_KEY',
    ],
  },
  {
    id: 'checkr-api',
    name: '🔍 Checkr (Background Checks)',
    priority: 'FUTURE',
    priorityBadge: '💡 PHASE 2',
    priorityColor: 'blue',
    why: 'Automated criminal background checks for worker onboarding',
    setupGuide: 'https://checkr.com/',
    action: 'Apply for Checkr API access',
    notes: [
      '✅ STATUS: Manual process works for now',
      '',
      '📋 STEP-BY-STEP (when ready):',
      '1. Go to: https://checkr.com/pricing',
      '2. Contact sales for API access',
      '3. Complete account verification',
      '4. Get API key from dashboard',
      '5. In Replit Secrets: CHECKR_API_KEY = xxx',
      '',
      '💰 COST: $35-85 per background check',
    ],
  },
  {
    id: 'google-maps-api',
    name: '🗺️ Google Maps API (Weather Radar)',
    priority: 'MEDIUM',
    priorityBadge: '⚡ ENHANCEMENT',
    priorityColor: 'orange',
    why: 'Enable Google Maps base layer for weather radar - see job sites with weather overlay',
    setupGuide: 'https://console.cloud.google.com/google/maps-apis/credentials',
    action: 'Get Google Maps JavaScript API key',
    notes: [
      '✅ STATUS: Weather radar works with OpenStreetMap, Google Maps adds premium features',
      '',
      '📋 STEP-BY-STEP:',
      '1. Go to: https://console.cloud.google.com/',
      '2. Create a new project (or select existing)',
      '3. Go to: APIs & Services → Enable APIs and Services',
      '4. Search for "Maps JavaScript API" and ENABLE it',
      '5. Go to: APIs & Services → Credentials',
      '6. Click "Create Credentials" → API Key',
      '7. (Optional) Restrict key to your domain for security',
      '8. Copy the API key',
      '9. In Replit Secrets: GOOGLE_MAPS_API_KEY = AIzaXXXXX',
      '',
      '💰 COST: $200/month free credit, then $7 per 1000 map loads',
      '🎯 VALUE: Street view, satellite imagery, job site visualization',
    ],
  },
  // ========== AFFILIATE & PARTNERSHIP OPPORTUNITIES ==========
  {
    id: 'affiliate-insurance',
    name: '🛡️ Insurance Affiliate Programs',
    priority: 'HIGH',
    priorityBadge: '💰 REVENUE',
    priorityColor: 'green',
    why: 'Every franchise needs workers comp & general liability - earn referral fees on policies',
    setupGuide: 'https://www.nextinsurance.com/partners/',
    action: 'Apply for insurance affiliate programs',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 NEXT INSURANCE (Recommended):',
      '1. Go to: https://www.nextinsurance.com/partners/',
      '2. Apply as a referral partner',
      '3. Earn $50-$200 per policy sold',
      '4. Great for small business workers comp',
      '',
      '🏆 SIMPLY BUSINESS:',
      '1. Go to: https://www.simplybusiness.com/partners',
      '2. Apply for referral partnership',
      '3. Earn commissions on all policies',
      '',
      '🏆 INSUREON:',
      '1. Go to: https://www.insureon.com/partner-with-us',
      '2. Apply as technology partner',
      '3. White-label insurance quoting',
      '',
      '💡 ADD TO ORBIT: Add insurance quote widget to onboarding flow',
    ],
  },
  {
    id: 'affiliate-payroll',
    name: '💵 Payroll & Banking Affiliates',
    priority: 'HIGH',
    priorityBadge: '💰 REVENUE',
    priorityColor: 'green',
    why: 'Franchises need payroll processing & banking - earn ongoing commissions',
    setupGuide: 'https://gusto.com/partners',
    action: 'Apply for payroll affiliate programs',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 GUSTO PAYROLL (Top Pick):',
      '1. Go to: https://gusto.com/partners',
      '2. Apply as referral partner',
      '3. Earn $100+ per signup + ongoing rev share',
      '4. Perfect for small staffing agencies',
      '',
      '🏆 RELAY BUSINESS BANKING:',
      '1. Go to: https://relayfi.com/partners',
      '2. Apply for referral program',
      '3. Earn $100+ per new business account',
      '4. Free business checking for franchises',
      '',
      '🏆 MERCURY BANKING:',
      '1. Go to: https://mercury.com/partners',
      '2. Partner application',
      '3. Great for tech-forward franchises',
      '',
      '💡 ADD TO ORBIT: Add banking recommendations to franchise onboarding',
    ],
  },
  {
    id: 'affiliate-accounting',
    name: '📊 Accounting Software Affiliates',
    priority: 'MEDIUM',
    priorityBadge: '💰 REVENUE',
    priorityColor: 'orange',
    why: 'Every business needs accounting - earn commissions on software referrals',
    setupGuide: 'https://quickbooks.intuit.com/partners/',
    action: 'Apply for accounting software affiliates',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 QUICKBOOKS:',
      '1. Go to: https://quickbooks.intuit.com/partners/',
      '2. Join the ProAdvisor Program',
      '3. Earn commissions + volume bonuses',
      '4. Integration already built in ORBIT!',
      '',
      '🏆 FRESHBOOKS:',
      '1. Go to: https://www.freshbooks.com/affiliate-program',
      '2. Apply through Impact affiliate network',
      '3. Earn recurring commissions',
      '',
      '🏆 WAVE (FREE):',
      '1. Go to: https://www.waveapps.com/partners',
      '2. Refer free accounting software',
      '3. Earn on premium add-ons',
      '',
      '💡 ADD TO ORBIT: Recommend during franchise setup wizard',
    ],
  },
  {
    id: 'affiliate-jobboards',
    name: '📋 Job Board Affiliates',
    priority: 'MEDIUM',
    priorityBadge: '💰 REVENUE',
    priorityColor: 'orange',
    why: 'Staffing agencies post jobs constantly - earn on job credits and subscriptions',
    setupGuide: 'https://www.indeed.com/hire/partners',
    action: 'Apply for job board affiliate programs',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 INDEED:',
      '1. Go to: https://www.indeed.com/hire/partners',
      '2. Apply as technology partner',
      '3. API integration for job posting',
      '4. Earn on sponsored job credits',
      '',
      '🏆 ZIPRECRUITER:',
      '1. Go to: https://www.ziprecruiter.com/partners',
      '2. Partner application',
      '3. Bulk posting discounts for franchises',
      '',
      '🏆 LINKEDIN JOBS:',
      '1. Go to: https://business.linkedin.com/talent-solutions/partners',
      '2. Become a LinkedIn partner',
      '3. Premium job posting referrals',
      '',
      '💡 ADD TO ORBIT: Integrate job cross-posting feature',
    ],
  },
  {
    id: 'affiliate-background',
    name: '🔎 Background Check Affiliates',
    priority: 'MEDIUM',
    priorityBadge: '💰 REVENUE',
    priorityColor: 'orange',
    why: 'Every worker needs background check - high volume = significant commissions',
    setupGuide: 'https://checkr.com/partners',
    action: 'Apply for background check affiliate programs',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 CHECKR (Top Pick):',
      '1. Go to: https://checkr.com/partners',
      '2. Apply as integration partner',
      '3. Volume-based pricing + referral fees',
      '4. API integration ready in ORBIT!',
      '',
      '🏆 GOODHIRE:',
      '1. Go to: https://www.goodhire.com/partners',
      '2. Partner program application',
      '3. Earn on each background check',
      '',
      '🏆 STERLING:',
      '1. Go to: https://sterlingcheck.com/partners/',
      '2. Enterprise partner program',
      '3. Good for high-volume franchises',
      '',
      '💡 ADD TO ORBIT: Already built-in - just need affiliate tracking',
    ],
  },
  {
    id: 'affiliate-drugtesting',
    name: '🧪 Drug Testing Affiliates',
    priority: 'MEDIUM',
    priorityBadge: '💰 REVENUE',
    priorityColor: 'orange',
    why: 'Required for many industries - consistent revenue stream',
    setupGuide: 'https://www.questdiagnostics.com/business-solutions',
    action: 'Apply for drug testing affiliate programs',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 QUEST DIAGNOSTICS:',
      '1. Go to: https://www.questdiagnostics.com/business-solutions',
      '2. Contact for partnership pricing',
      '3. Nationwide testing locations',
      '4. Already in ORBIT compliance flow!',
      '',
      '🏆 LABCORP:',
      '1. Go to: https://www.labcorp.com/organizations',
      '2. Corporate partnership inquiry',
      '3. Competitive volume pricing',
      '',
      '🏆 HEALTH STREET:',
      '1. Go to: https://www.health-street.net/resellers/',
      '2. Reseller/affiliate program',
      '3. Easy online ordering integration',
      '',
      '💡 ADD TO ORBIT: Add drug test ordering to compliance dashboard',
    ],
  },
  {
    id: 'affiliate-uniforms',
    name: '👕 Uniform & Safety Gear Affiliates',
    priority: 'LOW',
    priorityBadge: '💰 BONUS',
    priorityColor: 'blue',
    why: 'Workers need uniforms, PPE, safety gear - earn on bulk orders',
    setupGuide: 'https://www.uline.com/Corporate/Reseller',
    action: 'Apply for uniform/safety affiliate programs',
    notes: [
      '💰 AFFILIATE OPPORTUNITIES:',
      '',
      '🏆 ULINE:',
      '1. Go to: https://www.uline.com/Corporate/Reseller',
      '2. Apply for corporate/reseller account',
      '3. Bulk pricing + referral bonuses',
      '',
      '🏆 GRAINGER:',
      '1. Go to: https://www.grainger.com/content/partners',
      '2. Business partner program',
      '3. Safety equipment specialists',
      '',
      '🏆 AMAZON BUSINESS:',
      '1. Go to: https://business.amazon.com/en/discover-more/become-a-partner',
      '2. Partner program',
      '3. Wide selection + Prime shipping',
      '',
      '💡 ADD TO ORBIT: Add equipment ordering to franchise dashboard',
    ],
  },
  {
    id: 'ecosystem-hub',
    name: '🌐 DarkWave Ecosystem Hub - Connect Products',
    priority: 'HIGH',
    priorityBadge: '🔗 INTEGRATION',
    priorityColor: 'cyan',
    why: 'Connect all DarkWave products to share workers, timesheets, 1099 data, and code snippets',
    setupGuide: '/ecosystem-hub',
    action: 'Register remaining DarkWave products',
    notes: [
      '✅ COMPLETED: ORBIT Staffing OS & Brew & Board Coffee registered',
      '',
      '📋 PRODUCTS TO REGISTER:',
      '• Lot Ops Pro (lotopspro.io) - Vehicle lot management',
      '• GarageBot (garagebot.io) - Auto shop assistant',
      '• DarkWave Pulse - Analytics dashboard',
      '• Orby (getorby.io) - AI mascot platform',
      '',
      '🔑 CREDENTIALS SAVED:',
      '• ORBIT: dw_app_4347af9... (sync:all)',
      '• Brew & Board: dw_app_54bf4a7... (workers, timesheets, 1099, code)',
      '',
      '💡 NEXT: When building other products, use Ecosystem Client to connect',
    ],
  },
];

// Integration status mapping to task IDs
const INTEGRATION_MAP: Record<string, string> = {
  'stripe-payments': 'stripe',
  'stripe-webhook': 'stripe',
  'twilio-sms': 'twilio',
  'coinbase-commerce': 'coinbase',
  'email-service': 'sendgrid',
  'openai-api': 'openai',
  'checkr-api': 'checkr',
};

interface IntegrationStatus {
  status: {
    stripe: { configured: boolean; webhook: boolean };
    twilio: { configured: boolean };
    coinbase: { configured: boolean };
    sendgrid: { configured: boolean };
    openai: { configured: boolean };
    checkr: { configured: boolean };
    solana: { configured: boolean };
    helius: { configured: boolean };
    database: { configured: boolean };
    github: { configured: boolean };
  };
  summary: {
    criticalReady: boolean;
    optionalConfigured: number;
    totalOptional: number;
    readyForProduction: boolean;
  };
  lastChecked: string;
}

// Jason's To-Do List Component
function JasonsTodoList() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jasons-todo-completed');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch integration status from API
  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/system/integration-status');
      if (response.ok) {
        const data = await response.json();
        setIntegrationStatus(data);
        setLastRefresh(new Date());
        
        // Auto-update completed tasks based on live status
        const newCompleted = new Set(completedTasks);
        
        // Stripe payments
        if (data.status.stripe.configured) {
          newCompleted.add('stripe-payments');
        }
        // Stripe webhook
        if (data.status.stripe.webhook) {
          newCompleted.add('stripe-webhook');
        }
        // Twilio
        if (data.status.twilio.configured) {
          newCompleted.add('twilio-sms');
        }
        // Coinbase
        if (data.status.coinbase.configured) {
          newCompleted.add('coinbase-commerce');
        }
        // SendGrid
        if (data.status.sendgrid.configured) {
          newCompleted.add('email-service');
        }
        // OpenAI
        if (data.status.openai.configured) {
          newCompleted.add('openai-api');
        }
        // Checkr
        if (data.status.checkr.configured) {
          newCompleted.add('checkr-api');
        }
        
        setCompletedTasks(newCompleted);
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchIntegrationStatus();
    const interval = setInterval(fetchIntegrationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jasons-todo-completed', JSON.stringify(Array.from(completedTasks)));
    }

    // Check if all tasks are complete
    if (completedTasks.size === TODO_TASKS.length && completedTasks.size > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [completedTasks]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const completionPercentage = Math.round((completedTasks.size / TODO_TASKS.length) * 100);

  const getPriorityColor = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'orange':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'blue':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'green':
        return 'bg-green-500/20 text-green-400 border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, setupGuide: string) => {
    if (setupGuide === '#secrets') {
      e.preventDefault();
      // Scroll to secrets manager section
      const secretsSection = document.getElementById('secrets-manager');
      if (secretsSection) {
        secretsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-900/40 via-orange-900/30 to-red-800/40 border-2 border-orange-600/60 rounded-lg p-6 relative overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 animate-pulse" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-8 h-8 text-orange-400 animate-pulse" />
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">🎯 Jason's To-Do List - Production Setup</h2>
          </div>
          <p className="text-orange-100 mb-2">
            Critical items to get ORBIT fully operational
          </p>
          
          {/* Live Status Indicator */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-cyan-500/30">
              <div className={`w-2 h-2 rounded-full ${integrationStatus ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-xs text-cyan-300">
                {integrationStatus ? 'Live Status' : 'Checking...'}
              </span>
              {lastRefresh && (
                <span className="text-xs text-gray-400">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button
              onClick={fetchIntegrationStatus}
              className="flex items-center gap-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-cyan-500/30"
            >
              <Clock className="w-3 h-3" />
              Refresh Status
            </button>
            {integrationStatus?.summary.readyForProduction && (
              <span className="bg-green-600/30 text-green-300 px-3 py-1.5 rounded-full text-xs font-bold border border-green-500/50">
                ✅ Production Ready
              </span>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">
                {completedTasks.size} of {TODO_TASKS.length} tasks complete
              </span>
              <span className={`text-lg font-bold ${completionPercentage === 100 ? 'text-green-400' : 'text-orange-400'}`}>
                {completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completionPercentage === 100
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Celebration Message */}
          {showCelebration && (
            <div className="mt-4 bg-green-600 text-white p-4 rounded-lg text-center font-bold animate-bounce">
              🎉 Congratulations! All tasks complete! ORBIT is production-ready! 🚀
            </div>
          )}
        </div>
      </div>

      {/* Tasks Accordion */}
      <Accordion type="multiple" className="space-y-3">
        {TODO_TASKS.map((task, index) => {
          const isComplete = completedTasks.has(task.id);
          
          return (
            <AccordionItem
              key={task.id}
              value={task.id}
              className={`bg-slate-800 border-2 rounded-lg overflow-hidden transition-all ${
                isComplete
                  ? 'border-green-500/50 bg-green-900/10'
                  : 'border-slate-700 hover:border-orange-500/50'
              }`}
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid={`accordion-trigger-${task.id}`}>
                <div className="flex items-center gap-4 w-full">
                  {/* Checkbox */}
                  <Checkbox
                    checked={isComplete}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="border-2 border-orange-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    data-testid={`checkbox-task-${task.id}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Task Number */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isComplete ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                  }`}>
                    {isComplete ? '✓' : index + 1}
                  </div>

                  {/* Task Name and Priority */}
                  <div className="flex-1 text-left">
                    <div className={`font-bold text-lg ${isComplete ? 'text-green-400 line-through' : 'text-white'}`}>
                      {task.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(task.priorityColor)}`}>
                        {task.priorityBadge}
                      </span>
                      {isComplete && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold">
                          ✅ COMPLETE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4 pt-2">
                  {/* Why It's Needed */}
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Why It's Needed
                    </h4>
                    <p className="text-gray-300 text-sm">{task.why}</p>
                  </div>

                  {/* Action Required */}
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Action Required
                    </h4>
                    <p className="text-gray-300 text-sm">{task.action}</p>
                  </div>

                  {/* Notes */}
                  {task.notes.length > 0 && (
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <h4 className="font-bold text-purple-400 mb-2">📝 Notes</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {task.notes.map((note, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Setup Guide Link */}
                  <a
                    href={task.setupGuide}
                    target={task.setupGuide.startsWith('#') ? undefined : '_blank'}
                    rel={task.setupGuide.startsWith('#') ? undefined : 'noopener noreferrer'}
                    onClick={(e) => handleLinkClick(e, task.setupGuide)}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                    data-testid={`link-setup-guide-${task.id}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>
                      {task.setupGuide.startsWith('#') ? 'Go to Secrets Manager Section' : 'Open Setup Guide'}
                    </span>
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Help Section */}
      <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-orange-300 mb-2">💡 Getting Help</h4>
            <p className="text-sm text-orange-100">
              Each task above includes setup documentation links. Click "Open Setup Guide" for detailed instructions. 
              Your progress is automatically saved and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Secrets Manager Component
function SecretsManager() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerConnections, setCustomerConnections] = useState<any>({});
  const [showCustomerView, setShowCustomerView] = useState(false);

  // Fetch which providers are already configured
  useEffect(() => {
    loadConfiguredProviders();
    loadCustomerConnections();
  }, []);

  async function loadConfiguredProviders() {
    try {
      const res = await fetch('/api/developer/secrets/status', {
        headers: {
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setConfiguredProviders(data.configured || []);
      }
    } catch (err) {
      console.error('Failed to load secrets status:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerConnections() {
    try {
      const res = await fetch('/api/developer/customer-oauth-summary', {
        headers: {
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerConnections(data || {});
      }
    } catch (err) {
      console.error('Failed to load customer connections:', err);
    }
  }

  const currentProvider = OAUTH_PROVIDERS.find(p => p.type === selectedProvider);
  const isConfigured = configuredProviders.includes(selectedProvider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Key className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Secrets Manager</h2>
        </div>
        <p className="text-gray-300">
          Securely store OAuth credentials for external integrations. These are saved as encrypted secrets and will be used automatically when customers connect their accounts.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          Select OAuth Provider
        </h3>

        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-400"
          data-testid="select-oauth-provider"
        >
          <option value="">-- Select a provider --</option>
          {OAUTH_PROVIDERS.map(provider => (
            <option key={provider.type} value={provider.type}>
              {provider.name} {configuredProviders.includes(provider.type) ? '✓ Configured' : ''}
            </option>
          ))}
        </select>

        {/* Provider Status Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {OAUTH_PROVIDERS.map(provider => (
            <div
              key={provider.type}
              className={`p-3 rounded-lg border ${
                configuredProviders.includes(provider.type)
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="text-sm font-bold text-gray-300">{provider.name}</div>
              <div className={`text-xs mt-1 ${
                configuredProviders.includes(provider.type) ? 'text-green-400' : 'text-gray-500'
              }`}>
                {configuredProviders.includes(provider.type) ? '✓ Configured' : 'Not configured'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials Form */}
      {currentProvider && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              {currentProvider.name} Credentials
            </h3>
            {isConfigured && (
              <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">
                ✓ CONFIGURED
              </div>
            )}
          </div>

          {/* Setup Link */}
          <a
            href={currentProvider.setupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            data-testid="link-oauth-setup"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">
              Click here to set up {currentProvider.name} OAuth credentials
            </span>
          </a>

          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
            <p className="text-sm text-purple-200">
              <strong>Setup Instructions:</strong>
              <br />1. Click the link above to open {currentProvider.name}'s developer portal
              <br />2. Create a new OAuth application called "ORBIT Staffing OS"
              <br />3. Set the redirect URI to: <code className="bg-black/30 px-2 py-1 rounded">https://yourdomain.com/api/oauth/{currentProvider.type}/callback</code>
              <br />4. Copy the Client ID and Client Secret below
            </p>
          </div>

          {/* Action Instructions */}
          <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-4">
            <h4 className="font-bold text-cyan-300 mb-2">📋 What You Need:</h4>
            <ol className="text-sm text-cyan-100 space-y-1 list-decimal list-inside">
              <li>Go to the developer portal (link above)</li>
              <li>Create an OAuth app called "ORBIT Staffing OS"</li>
              <li>Copy the Client ID and Client Secret</li>
              <li>Come back and add them as secrets in Replit</li>
            </ol>
          </div>

          {/* Manual Instructions */}
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
            <h4 className="font-bold text-purple-300 mb-2">🔐 Add Secrets Manually:</h4>
            <p className="text-sm text-purple-100 mb-3">
              Open Replit's Secrets pane (Tools → Secrets) and add these two secrets:
            </p>
            <div className="bg-black/30 rounded p-3 font-mono text-xs text-green-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>{currentProvider.fields[0]}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentProvider.fields[0]);
                    alert('Copied to clipboard!');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>{currentProvider.fields[1]}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentProvider.fields[1]);
                    alert('Copied to clipboard!');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 ml-2"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Click the copy icon to copy the secret name, then paste your credentials from {currentProvider.name}
            </p>
          </div>

          {/* Refresh Status Button */}
          <Button
            onClick={() => loadConfiguredProviders()}
            className="w-full bg-cyan-600 hover:bg-cyan-700 py-3 font-bold text-lg"
            data-testid="button-refresh-status"
          >
            🔄 Refresh Status
          </Button>

          {isConfigured && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-sm text-green-200">
                {currentProvider.name} credentials are configured! OAuth connections will work automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-white mb-2">Security Notes</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Credentials are stored as encrypted secrets in Replit</li>
              <li>• They are never exposed in the frontend or logs</li>
              <li>• Each customer's OAuth connection is separate and tenant-isolated</li>
              <li>• You only need to set these up once per provider</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Customer OAuth Connections Statistics */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Customer OAuth Statistics
          </h3>
          <Button
            onClick={() => setShowCustomerView(!showCustomerView)}
            variant="outline"
            className="text-sm"
            data-testid="button-toggle-customer-view"
          >
            {showCustomerView ? 'Hide' : 'Show'}
          </Button>
        </div>

        {showCustomerView && (
          <div className="space-y-3">
            {Object.keys(customerConnections.providerCounts || {}).length === 0 ? (
              <p className="text-gray-400 text-sm">No customer OAuth connections yet. Statistics will appear here when customers connect their external systems.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(customerConnections.providerCounts || {}).map(([provider, stats]: [string, any]) => (
                    <div
                      key={provider}
                      className="p-4 rounded-lg border bg-slate-700/50 border-slate-600"
                    >
                      <div className="font-bold text-white text-sm mb-2">
                        {provider.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-bold text-cyan-400">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connected:</span>
                          <span className="font-bold text-green-400">{stats.connected}</span>
                        </div>
                        {stats.error > 0 && (
                          <div className="flex justify-between">
                            <span>Errors:</span>
                            <span className="font-bold text-red-400">{stats.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-3">
                  <p className="text-sm text-cyan-100">
                    <strong>Total Connections:</strong> {customerConnections.totalConnections || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ✓ Aggregate statistics only. No personal or tenant data is exposed.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Legal / CSA Manager Component
function LegalCSAManager() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const res = await fetch('/api/csa/templates', {
        headers: {
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        const active = data.find((t: any) => t.isActive);
        if (active) {
          setActiveTemplate(active);
          setEditContent(active.templateContent);
          setEditVersion(active.version);
        }
      }
    } catch (err) {
      console.error('Failed to load CSA templates:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!confirm('Publish this version as the active CSA template? This will deactivate the current version.')) {
      return;
    }

    try {
      const res = await fetch('/api/csa/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
        body: JSON.stringify({
          version: editVersion,
          templateContent: editContent,
          effectiveDate: new Date().toISOString().split('T')[0],
          isActive: true,
        }),
      });

      if (res.ok) {
        alert('CSA template published successfully!');
        setIsEditing(false);
        loadTemplates();
      } else {
        alert('Failed to publish template');
      }
    } catch (err) {
      console.error('Failed to publish template:', err);
      alert('Error publishing template');
    }
  }

  async function handleUpdate() {
    if (!activeTemplate) return;
    
    if (!confirm('Update the current active template?')) {
      return;
    }

    try {
      const res = await fetch(`/api/csa/templates/${activeTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': process.env.ADMIN_PIN || '',
        },
        body: JSON.stringify({
          templateContent: editContent,
        }),
      });

      if (res.ok) {
        alert('CSA template updated successfully!');
        setIsEditing(false);
        loadTemplates();
      } else {
        alert('Failed to update template');
      }
    } catch (err) {
      console.error('Failed to update template:', err);
      alert('Error updating template');
    }
  }

  if (loading) {
    return <div className="text-gray-300">Loading CSA templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Scale className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Legal / CSA Management</h2>
        </div>
        <p className="text-gray-300">
          Manage Client Service Agreement (CSA) templates, versions, and legal protections for ORBIT Staffing OS.
        </p>
      </div>

      {/* Active Template Info */}
      {activeTemplate && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-400" />
              Current Active CSA Template
            </h3>
            <div className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">
              VERSION {activeTemplate.version}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Effective Date</div>
              <div className="text-white font-bold">{new Date(activeTemplate.effectiveDate).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Conversion Fee</div>
              <div className="text-white font-bold">${activeTemplate.conversionFeeDollars}</div>
            </div>
            <div>
              <div className="text-gray-400">Conversion Period</div>
              <div className="text-white font-bold">{activeTemplate.conversionPeriodMonths} months / {activeTemplate.conversionPeriodHours} hours</div>
            </div>
            <div>
              <div className="text-gray-400">Markup</div>
              <div className="text-white font-bold">{activeTemplate.defaultMarkupMultiplier}x</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 ${isEditing ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
          data-testid="button-toggle-csa-edit"
        >
          <Edit className="w-4 h-4" />
          {isEditing ? 'Cancel Editing' : 'Edit CSA Template'}
        </Button>
        
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          className="flex items-center gap-2"
          data-testid="button-toggle-csa-preview"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Hide Preview' : 'Preview CSA'}
        </Button>
      </div>

      {/* Editor */}
      {isEditing && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Edit CSA Template</h3>
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Version</label>
            <input
              type="text"
              value={editVersion}
              onChange={(e) => setEditVersion(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="e.g., 1.0, 1.1, 2.0"
              data-testid="input-csa-version"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Template Content (Markdown)</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-600 rounded text-white font-mono text-sm"
              placeholder="# CLIENT SERVICE AGREEMENT..."
              data-testid="textarea-csa-content"
            />
            <p className="text-xs text-gray-400 mt-2">
              Use Markdown syntax. Variables: {"{{effectiveDate}}, {{clientName}}, {{state}}, {{paymentTerms}}, etc."}
            </p>
          </div>

          <div className="flex gap-4">
            {activeTemplate ? (
              <Button
                onClick={handleUpdate}
                className="bg-cyan-600 hover:bg-cyan-700 font-bold"
                data-testid="button-update-csa"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Update Current Template
              </Button>
            ) : null}
            
            <Button
              onClick={handlePublish}
              className="bg-green-600 hover:bg-green-700 font-bold"
              data-testid="button-publish-csa"
            >
              <Zap className="w-4 h-4 mr-2" />
              Publish as New Version
            </Button>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">CSA Preview</h3>
          <div className="bg-white text-black p-8 rounded max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm">{editContent || activeTemplate?.templateContent}</pre>
          </div>
        </div>
      )}

      {/* Version History */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          CSA Version History
        </h3>
        
        {templates.length === 0 ? (
          <p className="text-gray-400 text-sm">No CSA templates found. Create your first template above.</p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border ${
                  template.isActive
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-slate-700/50 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">
                      Version {template.version}
                      {template.isActive && (
                        <span className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs">ACTIVE</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Effective: {new Date(template.effectiveDate).toLocaleDateString()}
                      {template.jurisdiction && ` | State: ${template.jurisdiction}`}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-300">
                      Fee: ${template.conversionFeeDollars} | {template.conversionPeriodMonths}mo / {template.conversionPeriodHours}hrs
                    </div>
                    <div className="text-gray-400">
                      Markup: {template.defaultMarkupMultiplier}x | Interest: {template.latePaymentInterestRate}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-yellow-300 mb-2">⚖️ Legal Disclaimer</h4>
            <p className="text-sm text-yellow-100">
              This CSA is a preliminary agreement. ORBIT Staffing OS strongly recommends review by legal counsel before use. 
              This template is not a substitute for professional legal advice tailored to your specific business needs and applicable state laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Background Job Monitoring Component
function BackgroundJobMonitoring() {
  const [status, setStatus] = useState<any>(null);
  const [approaching, setApproaching] = useState<any>(null);
  const [overdue, setOverdue] = useState<any>(null);
  const [reassignments, setReassignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function loadMonitoringData() {
    try {
      const [statusRes, approachingRes, overdueRes, reassignRes] = await Promise.all([
        fetch('/api/background-jobs/status'),
        fetch('/api/background-jobs/approaching-deadlines'),
        fetch('/api/background-jobs/overdue-workers'),
        fetch('/api/background-jobs/recent-reassignments'),
      ]);

      if (statusRes.ok) setStatus(await statusRes.json());
      if (approachingRes.ok) setApproaching(await approachingRes.json());
      if (overdueRes.ok) setOverdue(await overdueRes.json());
      if (reassignRes.ok) setReassignments(await reassignRes.json());
    } catch (err) {
      console.error('Failed to load monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerManualCheck() {
    try {
      const res = await fetch('/api/background-jobs/check-now', {
        method: 'POST',
      });
      if (res.ok) {
        alert('Manual deadline check initiated. Check console logs for results.');
        setTimeout(loadMonitoringData, 2000); // Reload data after 2 seconds
      }
    } catch (err) {
      console.error('Failed to trigger manual check:', err);
    }
  }

  if (loading) {
    return <div className="text-gray-300">Loading monitoring data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Onboarding Deadline Enforcement</h2>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold ${
            status?.running
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {status?.running ? '✓ RUNNING' : '⚠ STOPPED'}
          </div>
        </div>
        <p className="text-gray-300">
          Automated enforcement of onboarding deadlines (3 business days for applications, 1 business day for assignments)
        </p>
        {status?.nextCheck && (
          <p className="text-sm text-cyan-300 mt-2">
            Next check: {new Date(status.nextCheck).toLocaleString()}
          </p>
        )}
      </div>

      {/* Manual Trigger */}
      <div className="flex gap-4">
        <Button
          onClick={triggerManualCheck}
          className="bg-cyan-600 hover:bg-cyan-700"
          data-testid="button-trigger-deadline-check"
        >
          <Zap className="w-4 h-4 mr-2" />
          Trigger Manual Check Now
        </Button>
        <Button
          onClick={loadMonitoringData}
          variant="outline"
          data-testid="button-refresh-monitoring"
        >
          Refresh Data
        </Button>
      </div>

      {/* Workers Approaching Deadlines */}
      <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-300 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Workers Approaching Deadlines (Next 1 Business Day)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Application Deadlines:</div>
            <div className="bg-slate-800 rounded p-3">
              {approaching?.application?.length > 0 ? (
                <div className="space-y-2">
                  {approaching.application.map((worker: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="font-bold text-white">{worker.fullName}</div>
                      <div className="text-xs text-gray-400">
                        Deadline: {new Date(worker.applicationDeadline).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-400">No approaching deadlines</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Assignment Deadlines:</div>
            <div className="bg-slate-800 rounded p-3">
              {approaching?.assignment?.length > 0 ? (
                <div className="space-y-2">
                  {approaching.assignment.map((worker: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="font-bold text-white">{worker.fullName}</div>
                      <div className="text-xs text-gray-400">
                        Deadline: {new Date(worker.assignmentOnboardingDeadline).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-400">No approaching deadlines</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Workers */}
      <div className="bg-red-900/20 border border-red-600 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Overdue Workers (Auto-Reassignment Triggered)
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Overdue Applications:</div>
            <div className="bg-slate-800 rounded p-3">
              {overdue?.applications?.length > 0 ? (
                <div className="space-y-2">
                  {overdue.applications.map((worker: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="font-bold text-red-300">{worker.fullName}</div>
                      <div className="text-xs text-gray-400">
                        Deadline missed: {new Date(worker.applicationDeadline).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-400">No overdue applications</div>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Overdue Assignments:</div>
            <div className="bg-slate-800 rounded p-3">
              {overdue?.assignments?.length > 0 ? (
                <div className="space-y-2">
                  {overdue.assignments.map((assignment: any, i: number) => (
                    <div key={i} className="text-sm">
                      <div className="font-bold text-red-300">{assignment.workerName}</div>
                      <div className="text-xs text-gray-400">
                        Request: {assignment.requestNumber}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-green-400">No overdue assignments</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reassignments */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Recent Auto-Reassignments (Last 24 Hours)
        </h3>
        {reassignments.length > 0 ? (
          <div className="space-y-2">
            {reassignments.map((item: any, i: number) => (
              <div key={i} className="bg-slate-700 rounded p-3 text-sm">
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold text-white">{item.worker?.fullName}</div>
                    <div className="text-xs text-gray-400">
                      Request: {item.request?.requestNumber} | {item.request?.jobTitle}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(item.match?.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400">No reassignments in the last 24 hours</div>
        )}
      </div>

      {/* Payroll Automation Settings */}
      <PayrollAutomationSettings />
    </div>
  );
}

// Payroll Automation Settings Component
function PayrollAutomationSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [payDay, setPayDay] = useState(0);
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/payroll/automation-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setFrequency(data.frequency || 'weekly');
        setPayDay(data.payDay || 0);
        setAutoRun(data.autoRun !== false); // Default to true if not set
      }
    } catch (err) {
      console.error('Failed to load payroll automation settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch('/api/payroll/automation-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency,
          payDay,
          autoRun,
        }),
      });
      
      if (res.ok) {
        alert('Payroll automation settings saved successfully!');
        loadSettings();
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return <div className="text-gray-300">Loading payroll automation settings...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-700/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">💰 Payroll Automation Settings</h2>
      </div>
      <p className="text-gray-300 mb-6">
        Automated payroll processing runs on schedule without human intervention - completing the 100% automation chain!
      </p>

      <div className="space-y-4">
        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            Payroll Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-green-400"
            data-testid="select-payroll-frequency"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-Weekly (Every 2 weeks)</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Pay Day Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            Pay Day
          </label>
          <select
            value={payDay}
            onChange={(e) => setPayDay(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-green-400"
            data-testid="select-payroll-day"
          >
            {dayNames.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-Run Toggle */}
        <div className="flex items-center gap-3 p-4 bg-slate-800 rounded">
          <input
            type="checkbox"
            id="auto-run-payroll"
            checked={autoRun}
            onChange={(e) => setAutoRun(e.target.checked)}
            className="w-5 h-5"
            data-testid="checkbox-auto-run-payroll"
          />
          <label htmlFor="auto-run-payroll" className="text-white font-bold cursor-pointer">
            Enable Automatic Payroll
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-green-900/20 border border-green-600 rounded p-4">
          <p className="text-sm text-green-100">
            When enabled, payroll runs automatically on <strong>{dayNames[payDay]}</strong> every{' '}
            {frequency === 'weekly' ? 'week' : frequency === 'biweekly' ? '2 weeks' : 'month'} for all workers with approved timesheets.
          </p>
          <p className="text-xs text-green-200 mt-2">
            ✓ Workers receive SMS + in-app notification<br />
            ✓ Paystub generated with hallmark verification<br />
            ✓ Full audit trail logged<br />
            ✓ 100% AUTOMATION - No manual intervention required!
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
          data-testid="button-save-payroll-settings"
        >
          {saving ? 'Saving...' : 'Save Payroll Automation Settings'}
        </Button>
      </div>

      {/* Current Status */}
      {settings && (
        <div className="mt-6 pt-6 border-t border-green-700/50">
          <h3 className="text-sm font-bold text-gray-300 mb-2">Current Configuration:</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <div>Frequency: <span className="text-white font-bold">{settings.frequency || 'weekly'}</span></div>
            <div>Pay Day: <span className="text-white font-bold">{dayNames[settings.payDay || 0]}</span></div>
            <div>Status: <span className={`font-bold ${settings.autoRun !== false ? 'text-green-400' : 'text-red-400'}`}>
              {settings.autoRun !== false ? '✓ ENABLED' : '✗ DISABLED'}
            </span></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeveloperPanel() {
  const [, setLocation] = useLocation();
  const [showBypassOption, setShowBypassOption] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [bypassEnabled, setBypassEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return isBypassDeviceEnabled();
    }
    return false;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check if this device has complete bypass enabled
      if (shouldBypassDeveloperLogin()) {
        return true;
      }
      
      // Check for valid persistent session (30 days)
      const session = getValidSession(DEVELOPER_SESSION_KEY);
      if (session?.authenticated) {
        return true;
      }
      // Fallback to old localStorage flag for migration
      return localStorage.getItem('developerAuthenticated') === 'true';
    }
    return false;
  });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [openCategory, setOpenCategory] = useState<string>('main');
  const [copied, setCopied] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([
    { role: 'ai', text: 'Hey! I\'m your AI assistant. What can I help you with?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Set 30-day persistent session
      setSessionWithExpiry(DEVELOPER_SESSION_KEY, { authenticated: true });
      localStorage.setItem('developerAuthenticated', 'true'); // Migrate old flag
    }
  }, [isAuthenticated]);

  // Auto-bypass login on mobile if session exists
  useEffect(() => {
    if (shouldBypassMobileLogin(DEVELOPER_SESSION_KEY) && !isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [isAuthenticated]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        // Set 30-day persistent session
        setSessionWithExpiry(DEVELOPER_SESSION_KEY, { authenticated: true });
        localStorage.setItem('developerAuthenticated', 'true'); // Migrate old flag
        setIsAuthenticated(true);
        setPin('');
        // Show bypass option after successful login
        setShowBypassOption(true);
      } else {
        setError('Invalid PIN.');
        setPin('');
      }
    } catch (err) {
      setError('Failed to verify PIN. Please try again.');
      setPin('');
    }
  };

  const handleLogout = () => {
    // Clear both old and new session formats
    clearSession(DEVELOPER_SESSION_KEY);
    localStorage.removeItem('developerAuthenticated');
    setIsAuthenticated(false);
    setLocation('/');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const res = await fetch('/api/developer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage,
          role: 'user',
          sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'ai', text: data.aiMessage }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I had trouble processing your message. Try again.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute top-6 left-6">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
            data-testid="button-back-home"
          >
            ← Back
          </Button>
        </div>
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="flex items-center justify-center mb-6">
            <Code className="w-8 h-8 text-purple-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Developer Access</h1>
          </div>

          <p className="text-gray-400 text-sm mb-6 text-center">
            Enter your access code to access technical APIs and developer tools
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Please enter 7 digit access code</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="•••••••"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple-400"
                autoFocus
                data-testid="input-developer-pin"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold text-lg"
              data-testid="button-developer-login"
            >
              Access Developer Panel
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            For technical team members and API integrations
          </p>

          {/* Bypass Option Modal */}
          {showBypassOption && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-purple-500/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-bold text-purple-300">Device Bypass Setup</h2>
                </div>
                
                <p className="text-gray-300 mb-6">
                  Enable complete bypass on this device? You'll go straight to the Developer tab without logging in again.
                </p>
                
                <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-3 mb-6">
                  <p className="text-sm text-purple-200">
                    ✓ You can always disable this in settings
                    <br />✓ Only works on this specific device/browser
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      enableBypassOnThisDevice();
                      setShowBypassOption(false);
                    }}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    data-testid="button-enable-bypass"
                  >
                    Enable Bypass
                  </Button>
                  <Button
                    onClick={() => setShowBypassOption(false)}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-skip-bypass"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 relative">
      {/* AI Chat Widget */}
      {showChat && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[400px] md:h-[500px] bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-500 rounded-xl shadow-2xl flex flex-col z-50 glow-cyan">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-cyan-100 hover:text-white text-xl"
              data-testid="button-close-chat"
            >
              ✕
            </button>
          </div>
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-700 text-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-100 rounded-lg rounded-bl-none px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-slate-700 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-cyan-400"
                data-testid="input-chat-message"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-3 py-2 rounded text-white font-bold text-sm transition-opacity"
                data-testid="button-send-message"
              >
                {chatLoading ? '...' : 'Send'}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center">Chat with AI for field support</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Developer Panel"
          subtitle="Technical APIs, integrations, and configuration"
          breadcrumb={
            <button
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
              data-testid="button-back-arrow"
            >
              <ArrowRight className="w-4 h-4 transform rotate-180" />
              Back
            </button>
          }
          actions={
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
          }
        />

        {/* Navigation Buttons - Desktop Grid / Mobile Carousel */}
        <div className="hidden md:block mb-8">
          <BentoGrid cols={4} gap="md">
            {/* REPLIT AGENT - Talk to Me Button (PRIORITY) */}
            <a
              href="https://replit.com/@JasonDark/ORBIT-Staffing-OS"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-24 md:h-28 bg-gradient-to-br from-cyan-600 to-blue-700 border-2 border-cyan-400 hover:border-cyan-300 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/40 hover:scale-105 hover:-translate-y-1 group animate-pulse"
              data-testid="button-replit-agent"
            >
              <Bot className="w-7 h-7 md:w-8 md:h-8 text-white group-hover:text-cyan-100 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-white group-hover:text-cyan-100 transition-colors text-center leading-tight">Talk to Agent</span>
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">LIVE</span>
            </a>

            {/* Admin Button */}
            <button
              onClick={() => navigateTo('/admin')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-cyan-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-to-admin"
            >
              <Shield className="w-6 h-6 md:w-7 md:h-7 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Admin</span>
            </button>

            {/* Employee Hub Button */}
            <button
              onClick={() => navigateTo('/employee-hub')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-blue-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-employee-hub"
            >
              <Users className="w-6 h-6 md:w-7 md:h-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Employee</span>
            </button>

            {/* Owner Hub Button */}
            <button
              onClick={() => navigateTo('/owner-hub')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-violet-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-owner-hub"
            >
              <Briefcase className="w-6 h-6 md:w-7 md:h-7 text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Owner</span>
            </button>

            {/* Marketing Hub Button */}
            <button
              onClick={() => navigateTo('/marketing')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-pink-700 to-purple-800 border border-pink-600 hover:border-pink-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-marketing"
            >
              <Megaphone className="w-6 h-6 md:w-7 md:h-7 text-pink-400 group-hover:text-pink-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Marketing</span>
            </button>

            {/* App Button */}
            <button
              onClick={() => navigateTo('/dashboard')}
              className="relative h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-green-400 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-to-app"
            >
              <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Dashboard</span>
            </button>

            {/* Device Settings Button */}
            <BentoTile className="p-0">
              <button
                onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                className="relative w-full h-24 md:h-28 bg-gradient-to-br from-slate-700 to-slate-800 hover:border-purple-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group"
                data-testid="button-device-settings"
              >
                <Key className="w-6 h-6 md:w-7 md:h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-xs md:text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Settings</span>
              </button>
            </BentoTile>
          </BentoGrid>

          {/* Second Row - More Actions */}
          <BentoGrid cols={4} gap="md" className="mt-4">
            {/* Incidents Button - goes to Employee Hub Report tab */}
            <button
              onClick={() => navigateTo('/employee-hub')}
              className="relative h-20 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-red-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-incident-report"
            >
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-400 group-hover:text-red-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Incidents</span>
            </button>

            {/* Workers Comp Button - goes to Compliance Monitor */}
            <button
              onClick={() => navigateTo('/admin/compliance-monitor')}
              className="relative h-20 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-orange-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-workers-comp"
            >
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Workers Comp</span>
            </button>

            {/* Bug Report Button */}
            <button
              onClick={() => setShowBugReport(true)}
              className="relative h-20 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-amber-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-report-bug"
            >
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Report Bug</span>
            </button>

            {/* Emergency Runbook Button - Quick Access to Contingency Plans */}
            <button
              onClick={() => navigateTo('/admin?tab=contingency')}
              className="relative h-20 md:h-24 bg-gradient-to-br from-red-900/50 to-slate-800 border border-red-600/50 hover:border-red-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-emergency-runbook"
            >
              <Scale className="w-5 h-5 md:w-6 md:h-6 text-red-400 group-hover:text-red-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Emergency</span>
            </button>

            {/* Talent Exchange Button */}
            <button
              onClick={() => navigateTo('/talent-exchange')}
              className="relative h-20 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-emerald-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-talent-exchange"
            >
              <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Talent Exchange</span>
            </button>

            {/* Job Board Button */}
            <button
              onClick={() => navigateTo('/jobs')}
              className="relative h-20 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-teal-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-dev-job-board"
            >
              <Database className="w-5 h-5 md:w-6 md:h-6 text-teal-400 group-hover:text-teal-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Job Board</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="relative h-20 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 hover:border-red-400 rounded-lg p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 hover:-translate-y-1 group"
              data-testid="button-developer-logout"
            >
              <LogOut className="w-5 h-5 md:w-6 md:h-6 text-red-400 group-hover:text-red-300 transition-colors" />
              <span className="text-[10px] md:text-xs font-bold text-gray-300 group-hover:text-white transition-colors text-center leading-tight">Logout</span>
            </button>
          </BentoGrid>
        </div>

        {/* Mobile Carousel Navigation */}
        <div className="md:hidden mb-6">
          <CarouselRail title="Quick Actions" showArrows={false} gap="sm" itemWidth="sm">
            <ActionCard
              title="Talk to Agent"
              icon={<Bot className="w-5 h-5" />}
              onClick={() => window.open('https://replit.com/@JasonDark/ORBIT-Staffing-OS', '_blank')}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Admin"
              icon={<Shield className="w-5 h-5" />}
              onClick={() => navigateTo('/admin')}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Employee"
              icon={<Users className="w-5 h-5" />}
              onClick={() => navigateTo('/employee-hub')}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Owner"
              icon={<Briefcase className="w-5 h-5" />}
              onClick={() => navigateTo('/owner-hub')}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Marketing"
              icon={<Megaphone className="w-5 h-5" />}
              onClick={() => navigateTo('/marketing')}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Dashboard"
              icon={<BarChart3 className="w-5 h-5" />}
              onClick={() => navigateTo('/dashboard')}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Settings"
              icon={<Key className="w-5 h-5" />}
              onClick={() => setShowDeviceSettings(true)}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Report Bug"
              icon={<AlertCircle className="w-5 h-5" />}
              onClick={() => setShowBugReport(true)}
              className="min-w-[140px]"
            />
            <ActionCard
              title="Logout"
              icon={<LogOut className="w-5 h-5" />}
              onClick={handleLogout}
              className="min-w-[140px]"
            />
          </CarouselRail>
        </div>

        {/* Device Settings Modal */}
        {showDeviceSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-slate-600 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-slate-400" />
                  Device Settings
                </h2>
                <button
                  onClick={() => setShowDeviceSettings(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                  data-testid="button-close-settings"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">Complete Bypass</h3>
                      <p className="text-sm text-gray-400">Go straight to Developer tab (no login)</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      bypassEnabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {bypassEnabled ? 'ACTIVE' : 'OFF'}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    ✓ This device only
                    <br />✓ Can be disabled anytime
                  </p>

                  {bypassEnabled ? (
                    <Button
                      onClick={() => {
                        disableBypassOnThisDevice();
                        setBypassEnabled(false);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700"
                      data-testid="button-disable-bypass"
                    >
                      Disable Bypass
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        enableBypassOnThisDevice();
                        setBypassEnabled(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="button-enable-bypass-settings"
                    >
                      Enable Bypass
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() => setShowDeviceSettings(false)}
                  variant="outline"
                  className="w-full"
                  data-testid="button-close-device-settings"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Accordion Navigation - Mobile Friendly */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden mb-8">
          <Accordion type="single" collapsible value={openCategory} onValueChange={setOpenCategory} className="w-full">
            <AccordionItem value="main" className="border-b border-slate-700">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/50 transition-colors" data-testid="accordion-dev-main">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white">Main</span>
                  <span className="text-xs text-gray-500 ml-2">(3)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-900/50 px-2 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                    { id: 'apis', label: 'API Endpoints', icon: <Code className="w-4 h-4" /> },
                    { id: 'examples', label: 'Examples & Assets', icon: <Zap className="w-4 h-4" /> },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${activeTab === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                      data-testid={`btn-dev-${item.id}`}>
                      {item.icon}<span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security" className="border-b border-slate-700">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/50 transition-colors" data-testid="accordion-dev-security">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-white">Security</span>
                  <span className="text-xs text-gray-500 ml-2">(3)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-900/50 px-2 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'secrets', label: 'Secrets Manager', icon: <Key className="w-4 h-4" /> },
                    { id: 'login-logs', label: 'Login History', icon: <Shield className="w-4 h-4" /> },
                    { id: 'messaging', label: 'Secure Messaging', icon: <MessageCircle className="w-4 h-4" /> },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${activeTab === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                      data-testid={`btn-dev-${item.id}`}>
                      {item.icon}<span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="documents" className="border-b border-slate-700">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/50 transition-colors" data-testid="accordion-dev-documents">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-white">Documents</span>
                  <span className="text-xs text-gray-500 ml-2">(3)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-900/50 px-2 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'legal', label: 'CSA Manager', icon: <FileText className="w-4 h-4" /> },
                    { id: 'llc-docs', label: 'LLC Docs', icon: <Building2 className="w-4 h-4" /> },
                    { id: 'receipts', label: 'Receipt Scanner', icon: <FileText className="w-4 h-4" /> },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${activeTab === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                      data-testid={`btn-dev-${item.id}`}>
                      {item.icon}<span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="operations" className="border-b border-slate-700">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/50 transition-colors" data-testid="accordion-dev-operations">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-white">Operations</span>
                  <span className="text-xs text-gray-500 ml-2">(1)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-900/50 px-2 py-2">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'monitoring', label: 'Background Jobs', icon: <Clock className="w-4 h-4" /> },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${activeTab === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                      data-testid={`btn-dev-${item.id}`}>
                      {item.icon}<span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="intelligence" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/50 transition-colors bg-gradient-to-r from-purple-900/20 to-cyan-900/20" data-testid="accordion-dev-intelligence">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white">Business Intelligence & Valuation</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full ml-2">NEW</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-slate-900/50 px-2 py-2">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'valuation', label: 'Valuation & Growth Tracking', icon: <TrendingUp className="w-4 h-4" /> },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${activeTab === item.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                      data-testid={`btn-dev-${item.id}`}>
                      {item.icon}<span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* AI Chat Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded transition-all text-sm flex items-center gap-2"
            data-testid="button-tab-ask-ai"
          >
            <MessageCircle className="w-4 h-4" />
            Ask AI
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Jason's To-Do List - Production Setup */}
            <JasonsTodoList />

            {/* Widgets */}
            <SectionHeader
              title="Dashboard Widgets"
              subtitle="Weather, hours tracking, and team overview"
              size="sm"
            />
            <BentoGrid cols={3} gap="md">
              <BentoTile span={1}>
                <WeatherNewsWidget userRole="dev" zipCode="37201" />
              </BentoTile>
              <BentoTile span={2}>
                <HourCounter userRole="dev" />
              </BentoTile>
            </BentoGrid>

            {/* Universal Employee Registry */}
            <div className="mt-8">
              <SectionHeader
                title="Employee Registry"
                subtitle="Universal employee directory across all systems"
                size="sm"
              />
              <OrbitCard variant="default" className="p-0">
                <UniversalEmployeeRegistry userRole="dev" />
              </OrbitCard>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB - OLD CONTENT */}
        {activeTab === 'overview' && (
          <div className="space-y-6 hidden">
            {/* Quick Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Replit IDE Link */}
              <a 
                href="https://replit.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gradient-to-br from-purple-600 to-purple-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition-all flex items-start gap-4"
                data-testid="link-replit-ide"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Replit IDE
                  </h3>
                  <p className="text-purple-100 text-sm">Open the development environment</p>
                </div>
                <ExternalLink className="w-5 h-5 text-purple-200 flex-shrink-0 mt-1" />
              </a>

              {/* AI Agent Link */}
              <a 
                href="javascript:void(0)" 
                onClick={() => {
                  alert('AI Agent: Right-click on any page → "Ask AI" to open the chat interface. Or press the purple "Ask AI" button on the screen.');
                }}
                className="bg-gradient-to-br from-cyan-600 to-cyan-800 border border-cyan-500 rounded-lg p-6 hover:border-cyan-400 transition-all flex items-start gap-4 cursor-pointer"
                data-testid="link-ai-agent"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    AI Assistant
                  </h3>
                  <p className="text-cyan-100 text-sm">Chat for field support & debugging</p>
                </div>
                <ExternalLink className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-1" />
              </a>

              {/* App Link */}
              <a 
                href="/" 
                className="bg-gradient-to-br from-green-600 to-green-800 border border-green-500 rounded-lg p-6 hover:border-green-400 transition-all flex items-start gap-4"
                data-testid="link-main-app"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Main App
                  </h3>
                  <p className="text-green-100 text-sm">View the staffing platform</p>
                </div>
                <ExternalLink className="w-5 h-5 text-green-200 flex-shrink-0 mt-1" />
              </a>
            </div>

            {/* Developer Access Info */}
            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Developer Access
              </h2>
              <p className="text-gray-300 mb-4">
                This panel provides full access to technical APIs, integrations, and configuration. All endpoints are documented with examples and authentication details.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Full REST API documentation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  WebSocket endpoints for real-time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Database schema reference
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Authentication & rate limiting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Code examples (Node, Python, cURL)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Webhook configurations
                </li>
              </ul>
            </div>

            {/* Core Systems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Workers API */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Workers System
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ CRUD operations for workers</li>
                  <li>✓ Skills & availability management</li>
                  <li>✓ Background check tracking</li>
                  <li>✓ I-9 verification status</li>
                  <li>✓ Digital Hallmark generation</li>
                  <li>✓ Avatar/photo uploads</li>
                </ul>
              </div>

              {/* Collections & Payments */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-green-400" />
                  Collections & Payments
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Payment method management</li>
                  <li>✓ Dunning sequence automation</li>
                  <li>✓ Collection status tracking</li>
                  <li>✓ Service suspension/restoration</li>
                  <li>✓ Overdue amount calculations</li>
                  <li>✓ Payment arrangement tracking</li>
                </ul>
              </div>

              {/* Database Access */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  Database
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ PostgreSQL via Neon</li>
                  <li>✓ Drizzle ORM integration</li>
                  <li>✓ Real-time backups enabled</li>
                  <li>✓ Full transaction support</li>
                  <li>✓ Schema versioning</li>
                  <li>✓ Query optimization tools</li>
                </ul>
              </div>

              {/* Security & Auth */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Security
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>✓ Session-based auth</li>
                  <li>✓ Role-based access control</li>
                  <li>✓ PIN-based admin login</li>
                  <li>✓ Data isolation per tenant</li>
                  <li>✓ Encryption for sensitive data</li>
                  <li>✓ Audit trail logging</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* APIs TAB */}
        {activeTab === 'apis' && (
          <div className="space-y-6">
            {/* Payment Methods APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Payment Methods API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/payment-methods</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/payment-methods</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-orange-400">PATCH</div>
                  <div className="text-gray-300">/api/payment-methods/:methodId/set-primary</div>
                </div>
              </div>
            </div>

            {/* Collections APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Collections & Dunning API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/collections</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/collections</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-blue-400">GET</div>
                  <div className="text-gray-300">/api/companies/:companyId/overdue-amount</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-orange-400">PATCH</div>
                  <div className="text-gray-300">/api/collections/:collectionId</div>
                </div>
              </div>
            </div>

            {/* Service Suspension APIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Service Management API</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-red-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/suspend-services</div>
                </div>
                <div className="bg-slate-900/50 rounded p-3 font-mono">
                  <div className="text-green-400">POST</div>
                  <div className="text-gray-300">/api/companies/:companyId/unsuspend-services</div>
                </div>
              </div>
            </div>

            {/* Example Request */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-bold text-lg mb-4">Example Request</h3>
              <div className="bg-slate-900 rounded p-4 font-mono text-xs text-gray-300 overflow-x-auto mb-4">
{`curl -X POST http://localhost:5000/api/companies/comp-123/collections \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5000,
    "dueDate": "2025-12-01",
    "status": "overdue",
    "severity": "warning"
  }'`}
              </div>
              <Button
                onClick={() => copyToClipboard('curl example', 'api-example')}
                className="bg-purple-600 hover:bg-purple-700 text-xs"
              >
                {copied === 'api-example' ? '✓ Copied' : 'Copy Example'}
              </Button>
            </div>
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <div className="space-y-8">
            {/* Digital Employee Card Example */}
            <SectionHeader
              eyebrow="Design System"
              title="Digital Employee Card with Hallmark"
              subtitle="Click to flip the card and see back side with verification code"
              size="sm"
            />
            <OrbitCard variant="glass">
              <div className="flex justify-center py-4">
                <DigitalEmployeeCard
                  workerId="WRK-2024-45892"
                  employeeNumber="EMP-0892"
                  fullName="John Michael Rodriguez"
                  company="Superior Staffing"
                  status="active"
                  role="Electrician & HVAC"
                  skills={['Electrician', 'HVAC', 'General Labor']}
                  joinDate="Mar 15, 2024"
                  phone="+1 (615) 555-0892"
                  email="john@superior-staffing.com"
                  verificationCode="ORBIT-XK9M2Q7W8P"
                  avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                />
              </div>
            </OrbitCard>

            {/* Hallmark Examples */}
            <SectionHeader
              title="Hallmark Watermark Sizes & Usage"
              size="sm"
            />
            <BentoGrid cols={3} gap="md">
              <BentoTile>
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="small" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Small</p>
                  <p className="text-xs text-gray-400 text-center">Emails, badges, inline notifications</p>
                </div>
              </BentoTile>
              <BentoTile>
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="medium" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Medium</p>
                  <p className="text-xs text-gray-400 text-center">Credentials, certificates, cards</p>
                </div>
              </BentoTile>
              <BentoTile>
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <HallmarkWatermark size="large" opacity={50} />
                  </div>
                  <p className="font-bold text-cyan-300 text-center mb-2">Large</p>
                  <p className="text-xs text-gray-400 text-center">Document watermarks, backgrounds</p>
                </div>
              </BentoTile>
            </BentoGrid>

            {/* Developer Business Card */}
            <OrbitCard variant="default">
              <OrbitCardHeader icon={<Code className="w-5 h-5 text-purple-400" />}>
                <OrbitCardTitle>Developer Profile Card (ORBIT-0001)</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
                <PersonalCardGenerator userId="orbit-0001" userName="Jason Andrews" cardType="dev" />
              </OrbitCardContent>
            </OrbitCard>

            {/* Assets Available */}
            <OrbitCard variant="default">
              <OrbitCardHeader icon={<CheckCircle2 className="w-5 h-5 text-cyan-400" />}>
                <OrbitCardTitle>Available Assets & Deliverables</OrbitCardTitle>
              </OrbitCardHeader>
              <OrbitCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Digital Employee Card</p>
                    <p className="text-xs text-gray-500">Worker ID with photo, employee number, skills, status</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Hallmark Watermark</p>
                    <p className="text-xs text-gray-500">3 sizes: small, medium, large with adjustable opacity</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">QR Code Integration</p>
                    <p className="text-xs text-gray-500">Every credential links to live verification database</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Invoice Watermarking</p>
                    <p className="text-xs text-gray-500">Automatic Hallmark stamping on all official documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">Email Headers</p>
                    <p className="text-xs text-gray-500">Hallmark badge in system communications</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-300">White-Label Assets</p>
                    <p className="text-xs text-gray-500">Customizable for franchise partners</p>
                  </div>
                </div>
              </div>
              </OrbitCardContent>
            </OrbitCard>
          </div>
        )}

        {/* MESSAGING TAB */}
        {activeTab === 'messaging' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <EnhancedAdminMessaging
              currentUserId="dev-master-001"
              currentUserName="Dev Master"
              currentUserRole="dev"
            />
          </div>
        )}

        {/* SECRETS MANAGER TAB */}
        {activeTab === 'secrets' && (
          <div id="secrets-manager">
            <SecretsManager />
          </div>
        )}

        {/* CSA MANAGER TAB */}
        {activeTab === 'legal' && <LegalCSAManager />}

        {/* LLC OPERATING AGREEMENT TAB */}
        {activeTab === 'llc-docs' && <LegalDocs />}
        
        {/* BACKGROUND JOB MONITORING TAB */}
        {activeTab === 'monitoring' && <BackgroundJobMonitoring />}

        {/* ADMIN LOGIN HISTORY TAB */}
        {activeTab === 'login-logs' && (
          <div>
            <AdminLoginHistory />
          </div>
        )}

        {/* RECEIPT SCANNER TAB */}
        {activeTab === 'receipts' && (
          <div>
            <ReceiptScanner />
          </div>
        )}

        {/* BUSINESS INTELLIGENCE & VALUATION TAB */}
        {activeTab === 'valuation' && (
          <BusinessValuationDashboard isPartnerView={false} />
        )}
      </div>

      {/* Bug Report Widget */}
      <BugReportWidget 
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
        userEmail="developer@orbitstaffing.io"
        userName="Developer"
      />
    </div>
  );
}
