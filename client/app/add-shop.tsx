import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useUser } from "@/contexts/UserContext";

export default function AddShop() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "rgb(56 56 58)",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <ActivityIndicator size="large" color="rgb(249 218 71)" />
      </View>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "rgb(56 56 58)", padding: 16 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 12,
        }}>
        Add Shop
      </Text>
      <Text style={{ color: "#fff", marginBottom: 24 }}>
        Add Shop form will be implemented here. This is a placeholder.
      </Text>
      <Pressable
        onPress={() => router.back()}
        style={{
          padding: 12,
          backgroundColor: "rgb(249 218 71)",
          borderRadius: 8,
        }}>
        <Text style={{ color: "#000", fontWeight: "700" }}>Close</Text>
      </Pressable>
    </View>
  );
}
