import { RADIUS_OPTIONS } from "@/constants/search";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface RadiusSelectorProps {
  selectedRadius: number;
  onRadiusChange: (radius: number) => void;
  loading?: boolean;
}

export function RadiusSelector({
  selectedRadius,
  onRadiusChange,
  loading = false,
}: RadiusSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Search Radius</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {RADIUS_OPTIONS.map((radiusOption) => (
          <Pressable
            key={radiusOption}
            onPress={() => onRadiusChange(radiusOption)}
            disabled={loading}
            style={[
              styles.button,
              selectedRadius === radiusOption && styles.buttonSelected,
              loading && styles.buttonDisabled,
            ]}>
            <Text
              style={[
                styles.buttonText,
                selectedRadius === radiusOption && styles.buttonTextSelected,
              ]}>
              {radiusOption % 1 === 0
                ? `${radiusOption}km`
                : `${radiusOption * 1000}m`}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#555",
  },
  buttonSelected: {
    backgroundColor: "rgb(249 218 71)",
    borderColor: "rgb(249 218 71)",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  buttonTextSelected: {
    color: "#000",
    fontWeight: "700",
  },
});
