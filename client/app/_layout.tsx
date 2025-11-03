import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ["openid"],
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID,
    });
  }, []);

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "rgb(56 56 58)" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "rgb(56 56 58)" },
        drawerActiveTintColor: "rgb(249 218 71)",
        drawerInactiveTintColor: "#fff",
      }}>
      <Drawer.Screen name="index" options={{ title: "Map" }} />
      <Drawer.Screen name="login" options={{ title: "Login" }} />
      <Drawer.Screen name="add-shop" options={{ title: "Add Shop" }} />
    </Drawer>
  );
}
