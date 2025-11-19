import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgb(56 56 58)",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  toggleButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgb(249, 218, 71)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
});
