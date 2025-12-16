import { BRANDING } from './src/config/branding';

export default {
  expo: {
    name: BRANDING.appName,
    slug: "orbit-worker-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: BRANDING.primaryColor
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.orbitworker",
      config: {
        usesNonExemptEncryption: false
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "We need your location to verify clock-in at job sites.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "We need your location to verify clock-in at job sites."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: BRANDING.primaryColor
      },
      package: "com.yourcompany.orbitworker",
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiBaseUrl: BRANDING.apiBaseUrl,
      eas: {
        projectId: "your-eas-project-id"
      }
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location for GPS clock-in verification."
        }
      ]
    ]
  }
};
