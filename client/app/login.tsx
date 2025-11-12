import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { signInWithGoogle } from "@/services/auth-service";
import { isAxiosError } from "axios";

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
        const res = await signInWithGoogle(idToken);

        console.log(res.data);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(error.response);
      }
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
