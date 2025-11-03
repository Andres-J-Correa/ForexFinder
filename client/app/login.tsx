import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { signInWithGoogle } from "@/services/auth-service";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;

        if (!idToken) throw new Error("empty token");
        console.log(idToken);
        const res = await signInWithGoogle(idToken);

        console.log(res);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "rgb(56 56 58)", padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => handleGoogleSignIn()}
          disabled={isLoading}
        />
      )}
    </View>
  );
}
