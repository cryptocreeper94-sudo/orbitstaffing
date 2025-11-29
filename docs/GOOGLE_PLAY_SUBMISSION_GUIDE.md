# Google Play Store Submission Guide - ORBIT Staffing OS

**Timeline:** Submit this week, live by end of next week

---

## STEP 1: PREPARE GOOGLE ACCOUNT (Done if you have one)

### 1.1 Google Play Developer Account
- [ ] Go to: https://play.google.com/console/
- [ ] Click "Create account"
- [ ] Pay one-time $25 fee
- [ ] Verify identity (2-3 business days)
- [ ] Set up payment method

**Timeline:** 5 minutes (instant if existing account)

---

## STEP 2: CREATE APP LISTING

### 2.1 Basic Information
- [ ] App name: **ORBIT Staffing OS**
- [ ] Short description (80 chars): "Staffing automation platform for modern agencies"
- [ ] Full description: Copy from `APP_STORE_DESCRIPTION.md`
- [ ] Category: **Business**
- [ ] Content rating: **12+** (or answer questionnaire for auto-rating)

### 2.2 Graphics & Screenshots
- [ ] App icon (512x512 px, PNG) - Use ORBIT logo
- [ ] Feature graphic (1024x500 px) - Create banner showing key features
- [ ] Screenshots (1080x1920 px, up to 8) - Upload generated mockups:
  - Worker assignment dashboard
  - Drug testing compliance
  - Admin dashboard with ROI
  - Incident reporting

**Graphics to Create:**
- App icon (if you don't have one): Create minimal, modern icon
- Banner: "ORBIT - Staffing Automation Platform"

### 2.3 Pricing & Distribution
- [ ] Pricing: **Free**
- [ ] Supported devices: Android 8.0+ (API 26+)
- [ ] Countries: Select markets (USA minimum, expand later)
- [ ] Content rating: Select "Business"

### 2.4 Privacy & Security
- [ ] Privacy policy: Link to `/docs/PRIVACY_POLICY.md` URL
- [ ] Terms: Mention that Terms of Service available in app
- [ ] Data safety: Complete questionnaire:
  - [ ] Collect: Personal info (name, email, phone)
  - [ ] Collect: Health data (drug test results, workers comp)
  - [ ] Collect: Location (GPS)
  - [ ] Collect: Device ID
  - [ ] Share: None (all data kept private)
  - [ ] Encrypt: Yes, TLS in transit, AES-256 at rest
  - [ ] Delete: Yes, upon request or 30 days after account deletion

---

## STEP 3: BUILD & UPLOAD APK

### 3.1 Build for Android (If Using Expo)

**Option A: EAS Build (Recommended, Easy)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build Android APK
eas build --platform android --type apk

# Download APK from build page
# Upload to Google Play Console
```

**Option B: Local Build (If Not Using Expo)**
```bash
# Install Android Studio & SDK
# Set ANDROID_HOME environment variable
# Run:
cd client
npm run build:android
# Upload APK from: android/app/build/outputs/apk/
```

**Timeline:** 5-10 minutes (depends on build time)

### 3.2 Prepare Web Version for HTML5 Export

If you want web-based delivery (in addition to Android):
```bash
# Build React app
npm run build

# Upload to hosting (Replit publish or custom domain)
# Share URL in app listing under "Contact"
```

---

## STEP 4: CONTENT RATING QUESTIONNAIRE

Google Play requires you to answer:

**Q1: Your app contains:**
- [ ] Personal information (name, email, phone) → YES
- [ ] Health info (drug test results, medical) → YES
- [ ] Location data (GPS) → YES
- [ ] Payment info → NO (handled by Stripe)
- [ ] Sensitive personal info → YES

**Q2: Targeted age group:**
- [ ] 3-4 years old → NO
- [ ] 5-8 years old → NO
- [ ] 9-12 years old → NO
- [ ] 13+ (adolescents) → YES (targeting business users)
- [ ] 18+ (adults only) → Optional

**Result:** Rating = **12+** or **16+**

**Timeline:** 5 minutes

---

## STEP 5: FILL STORE LISTING

### 5.1 Title & Tagline
- **Title:** ORBIT Staffing OS
- **Tagline:** "Staffing automation platform for modern agencies"

### 5.2 Description
See `APP_STORE_DESCRIPTION.md` - Already written, copy-paste

### 5.3 Categories
- **Primary:** Business
- **Secondary:** Productivity

### 5.4 Contact Information
- **Website:** orbitstaffing.io (after DNS configured)
- **Email:** support@orbitstaffing.io
- **Phone:** [Your contact number]

### 5.5 Links
- [ ] Privacy Policy: https://orbitstaffing.io/privacy
- [ ] Terms: https://orbitstaffing.io/terms

---

## STEP 6: SUBMIT FOR REVIEW

### 6.1 Pre-Submit Checklist
- [ ] All required fields filled
- [ ] APK/AAB uploaded
- [ ] Screenshots added (minimum 2)
- [ ] Icon added
- [ ] Privacy policy link working
- [ ] Content rating selected
- [ ] No placeholder text remaining

### 6.2 Review Process
1. Click **"Submit"** in Google Play Console
2. Google reviews (usually 24-48 hours, can be up to 7 days)
3. Status checks:
   - "Processing" = Under review
   - "Approved" = Live on Play Store
   - "Rejected" = Check feedback, fix, resubmit

### 6.3 Common Rejection Reasons & Fixes

| Reason | Fix | Timing |
|--------|-----|--------|
| Missing privacy policy | Ensure URL accessible, not placeholder | Immediate |
| Unclear app purpose | Improve description, be specific | Immediate |
| Too many permissions requested | Audit which are necessary | 1-2 hours |
| Health/drug testing not clear | Add disclaimer in description | Immediate |
| Payment issues | Ensure Stripe integration correct | 1-2 hours |
| Misleading content | Remove vague claims | Immediate |

**If Rejected:**
1. Read feedback carefully
2. Make changes
3. Resubmit (usually approved second try)
4. **Timeline:** +24-48 hours

---

## STEP 7: POST-LAUNCH TASKS

### 7.1 After App Goes Live
- [ ] Share Play Store link with Mike, Dan, friend
- [ ] Update website with "Download on Play Store" button
- [ ] Announce launch on social media (LinkedIn, Twitter)
- [ ] Create beta tester group (get 5-10 initial reviews)
- [ ] Monitor reviews & ratings daily
- [ ] Respond to user feedback quickly

### 7.2 Ongoing Maintenance
- [ ] Update screenshots as features add
- [ ] Update description with new features
- [ ] Monitor crash reports (Google Play Console)
- [ ] Release updates monthly (bug fixes + features)
- [ ] Respond to reviews (aim for 48-hour response)

---

## TIMELINE: Submit → Live

| Step | Timeline | Deadline |
|------|----------|----------|
| Finalize description | Today | Tonight ✅ DONE |
| Create screenshots | Today | Tonight ✅ DONE |
| Set up Google Play account | Today | Tonight |
| Build & upload APK | Today-Tomorrow | Tomorrow |
| Submit for review | Tomorrow | Tomorrow |
| **Google review period** | **24-48 hours** | **Wed-Thu** |
| **App goes live** | **Wed/Thu** | **End of week** |

---

## WHAT YOU NEED RIGHT NOW

### ✅ Already Created
- Privacy Policy (`docs/PRIVACY_POLICY.md`)
- Terms of Service (`docs/TERMS_OF_SERVICE.md`)
- App Store Description (`docs/APP_STORE_DESCRIPTION.md`)
- Mockup Screenshots (4 images generated)
- Legal Checklist (`docs/LEGAL_CHECKLIST.md`)
- Version 2 Roadmap (`docs/VERSION_2_ROADMAP.md`)

### 🔨 Still Need to Create
1. **App Icon** (512x512 PNG) - 30 minutes
   - Design simple, modern icon with "O" or orbit symbol
   - Tool: Canva, Adobe Express, or Figma
   
2. **Feature Banner** (1024x500 PNG) - 30 minutes
   - Title: "ORBIT Staffing OS"
   - Subtitle: "Automate. Comply. Scale."
   - Background: Dark theme with accent colors

3. **Build APK** - 10-15 minutes
   - Follow Step 3.1 above
   - If web-only, skip this (use Replit deployment)

### ⚠️ Before Submitting
- [ ] Google Play Developer Account ($25)
- [ ] Privacy policy URL accessible (need domain or Replit URL)
- [ ] App icon (PNG)
- [ ] Screenshots (4-8, 1080x1920 px each)
- [ ] Feature banner (1024x500 px)

---

## QUICK START: SUBMIT TONIGHT

**If you want to submit TODAY:**

1. **This hour:** 
   - Create app icon (use Canva template: "App Icon, 512px")
   - Create feature banner (Canva: "Google Play Feature Banner")

2. **Next hour:**
   - Register Google Play Developer Account (if not done)
   - Start Play Console app creation

3. **Within 2 hours:**
   - Fill in all text from `APP_STORE_DESCRIPTION.md`
   - Upload screenshots (use generated mockups)
   - Upload icon & banner
   - Complete content rating questionnaire

4. **Final step:**
   - Build APK (or use web version)
   - Upload
   - Click "Submit for Review"
   - Wait 24-48 hours for approval

**You'll be live by Wednesday/Thursday.**

---

## SUBMISSION CHECKLIST (Print This)

### Graphics
- [ ] App icon (512x512 PNG)
- [ ] Feature banner (1024x500 PNG)
- [ ] 4+ screenshots (1080x1920 each)

### Text
- [ ] App title: ORBIT Staffing OS
- [ ] Short description (from provided)
- [ ] Full description (copy from provided)
- [ ] Keywords/tags (staffing, management, compliance, etc.)

### Account
- [ ] Google Play Developer Account
- [ ] Payment method on file
- [ ] Privacy policy URL
- [ ] Terms URL

### App
- [ ] APK/AAB built and uploaded
- [ ] Version number set (1.0.0)
- [ ] Target API level: 34+ (Android 14+)
- [ ] Minimum API level: 26 (Android 8.0+)

### Compliance
- [ ] Content rating questionnaire filled
- [ ] Data safety section completed
- [ ] Target age: 12+ or 16+
- [ ] Category: Business

---

## SUCCESS CRITERIA

**App approved when:**
1. ✅ Shows in Google Play search for "staffing"
2. ✅ Installable on Android devices
3. ✅ Rating 4.5+ stars (build this with beta testers)
4. ✅ 50+ downloads in first week
5. ✅ Zero critical crashes in first month

---

## POST-LAUNCH GROWTH

**First Week Goals:**
- 50+ downloads
- 5+ 5-star reviews
- 0 crashes
- 2-3 active beta testers (Mike, Dan, others)

**First Month Goals:**
- 500+ downloads
- 4.5+ average rating
- 10+ active users
- Feedback to prioritize features

**Timeline:** If you submit tomorrow, you'll hit these by early January 2026

---

## SUPPORT DURING SUBMISSION

If rejected:
1. Read Google's feedback carefully
2. Make required changes
3. Resubmit (usually approved on second try)
4. Most common: Just need to clarify description or add privacy policy link

**You've got this.** The app is solid, the docs are ready, you just need to package it. 🚀
