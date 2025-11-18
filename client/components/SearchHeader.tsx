import { Text, View, StyleSheet } from "react-native";

export function SearchHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Currencies and Find Shops</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
});

