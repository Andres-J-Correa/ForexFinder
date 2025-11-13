import { UserProvider, useUser } from "@/contexts/UserContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Drawer } from "expo-router/drawer";
import { useEffect, useMemo } from "react";

import { CustomDrawerContent } from "@/components/CustomDrawerContent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { requireEnv } from "@/utils/env-validation";

function DrawerNavigator() {
  const { user, isLoading } = useUser();

  const loginOptions = useMemo(
    () => ({
      title: "Login",
      drawerItemStyle: {
        display: isLoading || user ? "none" : "flex",
      } as const,
    }),
    [user, isLoading]
  );

  const addShopOptions = useMemo(
    () => ({
      title: "Add Shop",
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
      <Drawer.Screen name="login" options={loginOptions} />
      <Drawer.Screen name="add-shop" options={addShopOptions} />
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
        <DrawerNavigator />
      </UserProvider>
    </ErrorBoundary>
  );
}
