import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { useUser } from "@/contexts/UserContext";
import { handleError } from "@/utils/error-handler";

export function CustomDrawerContent(props: any) {
  const { logout, user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    if (!user) return;

    try {
      // Sign out from Google
      await GoogleSignin.signOut();
      // Clear tokens and user state
      await logout();
      // Close drawer and redirect to login
      router.replace("/login");
    } catch (error) {
      handleError(
        error,
        "CustomDrawerContent.handleLogout",
        "Error during logout"
      );
      // Still logout even if Google sign out fails
      await logout();
      router.replace("/login");
    }
  };

  // Filter drawer items based on authentication state
  const filteredState = useMemo(() => {
    if (!props.state || !props.state.routes) {
      return props.state;
    }

    const filteredRoutes = props.state.routes.filter((route: any) => {
      const routeName = route.name;

      // If authenticated, hide login
      if (isAuthenticated && routeName === "login") {
        return false;
      }

      // If not authenticated, hide authenticated routes
      if (!isAuthenticated) {
        // Only show public routes (index) and login
        if (routeName === "index" || routeName === "login") {
          return true;
        }
        // Hide all authenticated routes
        if (
          routeName === "add-shop" ||
          routeName.startsWith("shop/") ||
          routeName.startsWith("admin/")
        ) {
          return false;
        }
      }

      // If authenticated but not admin, hide admin routes
      if (isAuthenticated && user?.role !== "admin") {
        if (routeName.startsWith("admin/")) {
          return false;
        }
      }

      return true;
    });

    return {
      ...props.state,
      routes: filteredRoutes,
      index: Math.min(
        props.state.index || 0,
        Math.max(0, filteredRoutes.length - 1)
      ),
    };
  }, [props.state, isAuthenticated, user?.role]);

  const filteredProps = {
    ...props,
    state: filteredState,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "rgb(56 56 58)" }}>
      <DrawerContentScrollView
        {...filteredProps}
        contentContainerStyle={{ flex: 1 }}>
        {!isLoading && user && (
          <View
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#333",
              alignItems: "center",
            }}>
            <Image
              source={{ uri: user.picture }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: "rgb(249 218 71)",
              }}
            />
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "600",
                textAlign: "center",
              }}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
        )}
        <DrawerItemList {...filteredProps} />
        {!isLoading && user && (
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#333" }}>
            <Pressable
              onPress={handleLogout}
              style={{
                padding: 12,
                backgroundColor: "transparent",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "rgb(249 218 71)",
              }}>
              <Text
                style={{
                  color: "rgb(249 218 71)",
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "center",
                }}>
                Logout
              </Text>
            </Pressable>
          </View>
        )}
      </DrawerContentScrollView>
    </View>
  );
}

