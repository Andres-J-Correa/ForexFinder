import { UserProvider, useUser } from "@/contexts/UserContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Drawer } from "expo-router/drawer";
import { useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { CustomDrawerContent } from "@/components/CustomDrawerContent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { requireEnv } from "@/utils/env-validation";

// Authenticated stack - only shown when user is logged in
function AuthenticatedStack() {
  const { user, isLoading } = useUser();

  const addShopOptions = useMemo(
    () => ({
      title: "Register Shop",
      drawerItemStyle: {
        display: isLoading || !user ? "none" : "flex",
      } as const,
    }),
    [user, isLoading]
  );

  const adminOptions = useMemo(
    () => ({
      title: "Admin",
      drawerItemStyle: {
        display: isLoading || user?.role !== "admin" ? "none" : "flex",
      } as const,
    }),
    [user, isLoading]
  );

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "rgb(56 56 58)" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "rgb(56 56 58)" },
        drawerActiveTintColor: "rgb(249 218 71)",
        drawerInactiveTintColor: "#fff",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Map" }} />
      <Drawer.Screen name="add-shop" options={addShopOptions} />
      <Drawer.Screen
        name="shop/rates"
        options={{
          title: "My Shop Rates",
          drawerItemStyle: {
            display: isLoading || !user ? "none" : "flex",
          } as const,
        }}
      />
      <Drawer.Screen
        name="admin/index"
        options={{ ...adminOptions, title: "Admin Dashboard" }}
      />
      <Drawer.Screen
        name="admin/generate-token"
        options={{ ...adminOptions, title: "Generate Token" }}
      />
      <Drawer.Screen
        name="admin/tokens-list"
        options={{ ...adminOptions, title: "Tokens List" }}
      />
    </Drawer>
  );
}

// Unauthenticated stack - only shown when user is not logged in
function UnauthenticatedStack() {
  return (
    <Drawer
      key="unauthenticated" // Key ensures remount on auth state change
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "rgb(56 56 58)" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "rgb(56 56 58)" },
        drawerActiveTintColor: "rgb(249 218 71)",
        drawerInactiveTintColor: "#fff",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Map" }} />
      <Drawer.Screen
        name="login"
        options={{
          title: "Login",
          drawerItemStyle: {
            display: "flex",
          } as const,
        }}
      />
    </Drawer>
  );
}

// Main navigator that conditionally renders stacks based on auth state
function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useUser();

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "rgb(56 56 58)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="rgb(249 218 71)" />
      </View>
    );
  }

  // Conditionally render authenticated or unauthenticated stack
  // Key includes user ID to force complete remount when different user logs in
  // This ensures all state is cleared when switching users
  if (isAuthenticated && user) {
    return <AuthenticatedStack key={`auth-${user.firstName}-${user.lastName}-${user.picture}`} />;
  }
  
  return <UnauthenticatedStack />;
}

export default function RootLayout() {
  useEffect(() => {
    const webClientId = requireEnv(
      "EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID",
      process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
      "Google OAuth Web Client ID for authentication"
    );

    GoogleSignin.configure({
      scopes: ["openid"],
      webClientId,
    });
  }, []);

  return (
    <ErrorBoundary>
      <UserProvider>
        <RootNavigator />
      </UserProvider>
    </ErrorBoundary>
  );
}
