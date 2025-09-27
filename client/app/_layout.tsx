import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
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
