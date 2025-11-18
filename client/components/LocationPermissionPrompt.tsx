import { Pressable, Text, View, ActivityIndicator, StyleSheet } from "react-native";

interface LocationPermissionPromptProps {
  onRequestPermission: () => void;
  loading: boolean;
}

export function LocationPermissionPrompt({
  onRequestPermission,
  loading,
}: LocationPermissionPromptProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Required</Text>
      <Text style={styles.description}>
        We need your location to find nearby currency exchange shops
      </Text>
      <Pressable
        onPress={onRequestPermission}
        disabled={loading}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Use My Location</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: "#1f1f1f",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    zIndex: 1000,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    color: "#999",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    padding: 16,
    backgroundColor: "rgb(249 218 71)",
    borderRadius: 12,
    minWidth: 200,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});

