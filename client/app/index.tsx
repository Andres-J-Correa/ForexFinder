import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: "rgb(56 56 58)" }}>
      {/* Map placeholder */}
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#1f1f1f",
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "rgb(249 218 71)",
          }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>Map Placeholder</Text>
          <Text style={{ color: "#fff", marginTop: 8 }}>
            (Google Maps integration will be added later)
          </Text>
        </View>
      </View>
    </View>
  );
}
