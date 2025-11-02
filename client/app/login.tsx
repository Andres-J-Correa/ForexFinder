import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Login() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "rgb(56 56 58)", padding: 16 }}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => {
          // initiate sign in
        }}
      />
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
