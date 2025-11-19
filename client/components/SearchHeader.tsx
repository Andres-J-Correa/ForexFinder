import { StyleSheet, Text, View } from "react-native";

export function SearchHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Currencies and Find Shops</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
});
