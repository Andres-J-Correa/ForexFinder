import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { useUser } from "@/contexts/UserContext";
import { signInWithGoogle } from "@/services/auth-service";
import { handleError } from "@/utils/error-handler";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticated, user, isLoading: isUserLoading } = useUser();
  const router = useRouter();

  // Redirect to index if already authenticated
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace("/");
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data.idToken;

        if (!idToken) throw new Error("empty token");
        const res = await signInWithGoogle(idToken);

        // Set authenticated to true after successful login
        // This will trigger the useEffect in UserContext to fetch the current user
        if (res.data?.accessToken) {
          setAuthenticated(true);
          // Redirect to home after successful login
          router.replace("/");
        }
      }
    } catch (error) {
      handleError(
        error,
        "Login.handleGoogleSignIn",
        "Failed to sign in with Google"
      );
      // Note: User feedback could be added here using a toast/alert
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if already authenticated (will redirect)
  if (isUserLoading || user) {
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
