import { UserProvider, useUser } from "@/contexts/UserContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Drawer } from "expo-router/drawer";
import { useEffect, useMemo } from "react";

import { CustomDrawerContent } from "@/components/CustomDrawerContent";

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
    </Drawer>
  );
}

export default function RootLayout() {
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["openid"],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
    });
  }, []);

  return (
    <UserProvider>
      <DrawerNavigator />
    </UserProvider>
  );
}
