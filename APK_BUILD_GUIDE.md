# Building & Submitting Android APK to Google Play Store

## Prerequisites
- ✅ Mobile app built and tested locally
- ✅ Google Play Developer Account created
- ✅ Identity verification approved by Google
- ✅ Expo CLI installed: `npm install -g expo-cli`
- ✅ EAS CLI installed: `npm install -g eas-cli`

## Step 1: Configure EAS Build (First Time Only)

```bash
cd /home/runner/workspace/mobile

# Initialize EAS project
eas build:configure

# Select platform: Android
# Use default settings for most options
```

This creates `eas.json` with build configuration.

## Step 2: Build APK for Production

### Option A: Cloud Build (Recommended)

```bash
cd /home/runner/workspace/mobile

# Build and auto-submit to Play Store
npm run build:android

# Or manually:
eas build --platform android --auto-submit
```

This will:
1. Build APK in Expo cloud
2. Sign with your certificate
3. Automatically submit to Play Store

### Option B: Local Build

```bash
cd /home/runner/workspace/mobile

eas build --platform android \
  --local \
  --clear \
  --production
```

## Step 3: Create Signing Certificate

**If you haven't created one yet:**

```bash
eas credentials

# Follow prompts:
# 1. Select Android
# 2. Choose "Keystore"
# 3. Let EAS generate new keystore
# 4. Save credentials securely
```

**Important**: Save your keystore credentials! You'll need them for future app updates.

```
📝 Store securely:
- Keystore password
- Key alias
- Key password
```

## Step 4: Monitor Build Progress

```bash
# Check build status
eas build:list

# View specific build logs
eas build:view --id <build-id>
```

Building takes **10-20 minutes** in Expo cloud.

## Step 5: Manual Submission (if not auto-submitted)

If your build completed but wasn't auto-submitted:

1. Download signed APK from Expo dashboard
2. Go to **Google Play Console** → Your app
3. Navigate to **Release** → **Production**
4. Click **"Create new release"**
5. Upload APK:
   - Click **"Browse files"**
   - Select your signed APK
   - Click **"Upload"**

## Step 6: Fill App Release Form

Before submitting for review, fill out:

### Release Notes
```
Version 1.0.0 - Production Release

Key Features:
✓ GPS-Verified Check-In
✓ Real-Time Job Assignments
✓ Instant Worker Payment
✓ Loyalty Bonus Tracking
✓ Secure Biometric Login
✓ Real-Time Earnings Dashboard

Bug Fixes:
- Improved location accuracy
- Enhanced error handling
- Performance optimizations
```

### Review Questionnaire
- **Content Rating**: PEGI 3 (12+)
- **Privacy Policy**: Link to your policy
- **Support Email**: support@orbitstaffing.io
- **Target Audience**: Workers in staffing industry

## Step 7: Submit for Review

1. Check all required fields are filled
2. Click **"Save"** → **"Send for review"**
3. Confirm submission

**Review Time**: Typically **24-48 hours**

## Monitoring Review Status

1. Go to **Google Play Console**
2. Select your app
3. Look for **Review status** indicator
4. You'll receive email when review completes

### If Rejected:
1. Read rejection reason carefully
2. Make necessary fixes
3. Increment version code (e.g., 1 → 2)
4. Rebuild APK
5. Resubmit

## APK Versioning

Each submission needs new version code in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    }
  }
}
```

When rebuilding:
- **Major update**: `version: "1.1.0"`, `versionCode: 2`
- **Minor fix**: `version: "1.0.1"`, `versionCode: 3`

## Build Troubleshooting

### Build Fails with "Credentials Not Found"
```bash
eas credentials
# Regenerate credentials and retry
```

### "Keystore not found"
```bash
eas credentials --platform android
# Select "Keystore" and create new
```

### Build Takes Too Long
- Normal: 10-20 minutes
- Check build status: `eas build:list`
- View logs: `eas build:view --id <build-id>`

## After Approval

### App Published! ✅

1. **Update app store listing** with real data
2. **Monitor analytics** in Play Console
3. **Set up crash reporting**:
   - Firebase Crashlytics (automatic)
   - Google Play Console crashes tab

### Marketing Materials
- Promote in app stores
- Share screenshots on social media
- Use the 3 graphics we generated

## Security Best Practices

- ✅ APK signed automatically by EAS
- ✅ Private keystore stored securely
- ✅ Credentials encrypted in Expo
- ✅ Version control: Don't commit `.env` files
- ✅ Never share keystore password

## Version History

Keep track of all submissions:

| Version | Code | Date | Status | Notes |
|---------|------|------|--------|-------|
| 1.0.0 | 1 | 2025-11-23 | Submitted | Initial release |
| 1.0.1 | 2 | TBD | - | Bug fixes |

## Additional Resources

- **EAS Build Docs**: https://docs.expo.dev/eas-update/introduction/
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer
- **Expo Build Guide**: https://docs.expo.dev/build/setup/

## Quick Reference Commands

```bash
# Build and submit
npm run build:android

# Check build status
eas build:list

# View build logs
eas build:view --id <build-id>

# Create signing certificate
eas credentials

# Clean rebuild
eas build --platform android --clear --production
```

## Done! 🎉

Your app is now live on Google Play Store!

Next steps:
- Monitor user reviews
- Track crash reports
- Plan feature updates
- Engage with user feedback
