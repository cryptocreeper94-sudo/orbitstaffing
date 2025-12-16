# ORBIT Worker Mobile App Template

A white-label React Native mobile app template for ORBIT Staffing franchisees. This template provides a fully-functional worker mobile app that can be customized with your branding.

## Features

- **Worker Login** - Secure phone + PIN authentication
- **Dashboard** - View upcoming shifts and earnings
- **GPS Timeclock** - Clock in/out with GPS verification
- **Paystubs** - View pay history and deductions
- **Profile** - Update contact information

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (for building)

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI for building
npm install -g eas-cli
```

## Quick Start

### 1. Install Dependencies

```bash
cd orbit-worker-app
npm install
```

### 2. Customize Branding

Edit `src/config/branding.ts` to customize your app:

```typescript
export const BRANDING = {
  appName: 'Your Company Worker',      // App display name
  primaryColor: '#00CED1',             // Your brand color
  secondaryColor: '#1a1a2e',           // Secondary color
  logoUrl: 'https://...',              // Your logo URL (optional)
  apiBaseUrl: 'https://your-tenant.orbitstaffing.io/api'
};
```

### 3. Update App Configuration

Edit `app.config.js` to update:

- iOS Bundle Identifier: `ios.bundleIdentifier`
- Android Package Name: `android.package`
- EAS Project ID: `extra.eas.projectId`

### 4. Add Your Assets

Replace placeholder images in `assets/`:

- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `splash.png` - Splash screen (1284x2778)
- `favicon.png` - Web favicon (48x48)

### 5. Run Development

```bash
# Start development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

## Customization Guide

### Colors

Edit the `THEME` object in `src/config/branding.ts`:

```typescript
export const THEME = {
  colors: {
    primary: '#00CED1',      // Main brand color
    secondary: '#1a1a2e',    // Secondary color
    background: '#f5f5f5',   // App background
    surface: '#ffffff',      // Card backgrounds
    text: '#1a1a1a',         // Primary text
    textSecondary: '#666',   // Secondary text
    success: '#22c55e',      // Success states
    warning: '#f59e0b',      // Warning states
    error: '#ef4444',        // Error states
  },
  // ...
};
```

### Logo

1. Upload your logo to a public URL
2. Update `logoUrl` in branding config
3. Or replace the placeholder in LoginScreen

### API URL

Update `apiBaseUrl` to point to your ORBIT tenant:

```typescript
apiBaseUrl: 'https://your-company.orbitstaffing.io/api'
```

## Building for Production

### Setup EAS Build

```bash
# Login to Expo
eas login

# Configure your project
eas build:configure
```

### Build for iOS

```bash
# Create iOS build
npm run build:ios

# Or for App Store
eas build --platform ios --profile production
```

### Build for Android

```bash
# Create Android APK
npm run build:android

# Or for Play Store (AAB)
eas build --platform android --profile production
```

## Publishing to App Stores

### iOS App Store

1. Build production iOS binary
2. Upload to App Store Connect using Transporter
3. Submit for review through App Store Connect

Required for App Store:
- Apple Developer Account ($99/year)
- App Store Connect access
- Privacy Policy URL
- App screenshots (6.5" and 5.5" iPhone)

### Google Play Store

1. Build production Android App Bundle (AAB)
2. Create app listing in Google Play Console
3. Upload AAB and submit for review

Required for Play Store:
- Google Play Developer Account ($25 one-time)
- Privacy Policy URL
- App screenshots and feature graphic
- Content rating questionnaire

## API Endpoints

Your ORBIT backend provides these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/worker/login` | POST | Authenticate worker |
| `/worker/dashboard` | GET | Get dashboard data |
| `/worker/timeclock/status` | GET | Get clock status |
| `/worker/timeclock/clock-in` | POST | Clock in with GPS |
| `/worker/timeclock/clock-out` | POST | Clock out with GPS |
| `/worker/paystubs` | GET | Get pay history |
| `/worker/profile` | GET/PUT | Get/update profile |

## Support

For technical support:
- Email: support@orbitstaffing.io
- Documentation: https://docs.orbitstaffing.io/mobile

## License

This template is provided under the ORBIT Partner License. 
Redistribution requires an active ORBIT franchise agreement.

---

Powered by ORBIT Staffing Platform
