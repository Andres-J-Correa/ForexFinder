export default {
  expo: {
    owner: "andres_dev94",
    name: "ForexFinder",
    slug: "ForexFinder",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "client",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "ForexFinder needs your location to find nearby currency exchange shops.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "ForexFinder needs your location to find nearby currency exchange shops.",
      },
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      adaptiveIcon: {
        backgroundColor: "#38383a",
        foregroundImage: "./assets/images/forex-finder-icon.png",
        monochromeImage: "./assets/images/forex-finder-icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.andres_dev94.ForexFinder",
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/forex-finder-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#38383a",
          dark: {
            backgroundColor: "#38383a",
          },
        },
      ],
      "@react-native-google-signin/google-signin",
      "expo-web-browser",
      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
          faceIDPermission:
            "Allow ForexFinder to access your Face ID biometric data.",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow ForexFinder to use your location.",
        },
      ],
      [
        "expo-maps",
        {
          requestLocationPermission: true,
          locationPermission: "Allow ForexFinder to use your location",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "8c189a4a-e01c-4565-a8d1-ed58d4441bb1",
      },
    },
    updates: {
      url: "https://u.expo.dev/8c189a4a-e01c-4565-a8d1-ed58d4441bb1",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
