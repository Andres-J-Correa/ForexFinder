import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Login() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "rgb(56 56 58)", padding: 16 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: "700",
          marginBottom: 12,
        }}>
        Login
      </Text>
      <Text style={{ color: "#fff", marginBottom: 24 }}>
        OAuth login with Google will be added later. This is a placeholder.
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
