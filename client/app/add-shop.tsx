import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUser } from "@/contexts/UserContext";
import { registerShop } from "@/services/shop-service";
import { handleError } from "@/utils/error-handler";

export default function RegisterShop() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [token, setToken] = useState("");
  const [shopName, setShopName] = useState("");
  const [contact, setContact] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

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

  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    if (!token.trim()) {
      Alert.alert("Error", "Please enter a location token");
      return;
    }

    if (!shopName.trim()) {
      Alert.alert("Error", "Please enter a shop name");
      return;
    }

    try {
      setLoading(true);
      await registerShop({
        token: token.trim(),
        shopName: shopName.trim(),
        contact: contact.trim() || undefined,
        hours: hours.trim() || undefined,
      });

      // Clear form fields after successful registration
      setToken("");
      setShopName("");
      setContact("");
      setHours("");

      Alert.alert("Success", "Shop registered successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Refresh shops list and navigate to rates
            router.replace("/shop/rates");
          },
        },
      ]);
    } catch (error) {
      handleError(
        error,
        "RegisterShop.handleSubmit",
        "Failed to register shop"
      );
      Alert.alert(
        "Error",
        "Failed to register shop. Please check your token and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: "rgb(56 56 58)" }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "rgb(56 56 58)" }}
        contentContainerStyle={{ padding: 16 }}>
        <Text
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 8,
          }}>
          Register Your Shop
        </Text>
        <Text style={{ color: "#999", fontSize: 14, marginBottom: 24 }}>
          Enter the location token provided by the admin to register your shop
          at the specified location.
        </Text>

        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}>
            <Text style={{ color: "#fff", fontSize: 16, flex: 1 }}>
              Location Token *
            </Text>
            <Pressable
              onPress={() => setShowTokenHelp(true)}
              style={{
                padding: 6,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 999,
                backgroundColor: "#2a2a2a",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Text style={{ color: "rgb(249 218 71)", fontWeight: "700" }}>
                ?
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={token}
            onChangeText={setToken}
            placeholder="Enter location token"
            placeholderTextColor="#999"
            style={{
              backgroundColor: "#1f1f1f",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#333",
            }}
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
            Shop Name *
          </Text>
          <TextInput
            value={shopName}
            onChangeText={setShopName}
            placeholder="Enter shop name"
            placeholderTextColor="#999"
            style={{
              backgroundColor: "#1f1f1f",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#333",
            }}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
            Contact Information (optional)
          </Text>
          <TextInput
            value={contact}
            onChangeText={setContact}
            placeholder="Email, phone, etc."
            placeholderTextColor="#999"
            style={{
              backgroundColor: "#1f1f1f",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#333",
            }}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#fff", marginBottom: 8, fontSize: 16 }}>
            Working Hours (optional)
          </Text>
          <TextInput
            value={hours}
            onChangeText={setHours}
            placeholder="e.g., 9am-5pm, Mon-Fri"
            placeholderTextColor="#999"
            style={{
              backgroundColor: "#1f1f1f",
              color: "#fff",
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#333",
            }}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={{
            padding: 16,
            backgroundColor: "rgb(249 218 71)",
            borderRadius: 12,
            marginBottom: 16,
            opacity: loading ? 0.6 : 1,
          }}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={{
                color: "#000",
                fontSize: 18,
                fontWeight: "700",
                textAlign: "center",
              }}>
              Register Shop
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={{
            padding: 12,
            backgroundColor: "#1f1f1f",
            borderRadius: 8,
          }}>
          <Text
            style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
            Cancel
          </Text>
        </Pressable>
      </ScrollView>
      {/* Help modal for location token */}
      <Modal
        visible={showTokenHelp}
        animationType="fade"
        transparent
        onRequestClose={() => setShowTokenHelp(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}>
          <View
            style={{
              backgroundColor: "#121212",
              padding: 20,
              borderRadius: 12,
              width: "100%",
              maxWidth: 420,
            }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 8,
              }}>
              Location token
            </Text>
            <Text style={{ color: "#ddd", marginBottom: 16 }}>
              To get a location token, email the app administrator to request
              one. Please send your shop name, google maps location, and
              business permit.
              {"\n\n"}
              Your request will be responded to within 24 hours.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable
                onPress={() => setShowTokenHelp(false)}
                style={{
                  marginRight: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}>
                <Text style={{ color: "#fff" }}>Close</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const mail =
                    "mailto:andresj.correas@gmail.com?subject=ForexFinder%20Location%20Token%20Request";
                  try {
                    await Linking.openURL(mail);
                  } catch {
                    Alert.alert("Error", "Unable to open mail app.");
                  }
                }}
                style={{
                  backgroundColor: "rgb(249 218 71)",
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}>
                <Text style={{ color: "#000", fontWeight: "700" }}>
                  Email Admin
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
