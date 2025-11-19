import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Currency } from "@/constants/currencies";

interface CurrencyDropdownProps {
  label: string;
  selectedCurrency: Currency;
  currencies: Currency[];
  onSelect: (currency: Currency) => void;
  disabled?: boolean;
}

export function CurrencyDropdown({
  label,
  selectedCurrency,
  currencies,
  onSelect,
  disabled = false,
}: CurrencyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}>
        <Text
          style={[
            styles.dropdownText,
            disabled && styles.dropdownTextDisabled,
          ]}>
          {selectedCurrency || "Select..."}
        </Text>
        <Text style={[styles.arrow, disabled && styles.arrowDisabled]}>▼</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.currencyList}>
              {currencies.map((currency) => (
                <Pressable
                  key={currency}
                  onPress={() => handleSelect(currency)}
                  style={[
                    styles.currencyItem,
                    selectedCurrency === currency &&
                      styles.currencyItemSelected,
                  ]}>
                  <Text
                    style={[
                      styles.currencyText,
                      selectedCurrency === currency &&
                        styles.currencyTextSelected,
                    ]}>
                    {currency}
                  </Text>
                  {selectedCurrency === currency && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1f1f1f",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownTextDisabled: {
    color: "#999",
  },
  arrow: {
    color: "#999",
    fontSize: 12,
  },
  arrowDisabled: {
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "rgb(56 56 58)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    color: "#999",
    fontSize: 24,
    fontWeight: "300",
  },
  currencyList: {
    maxHeight: 400,
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  currencyItemSelected: {
    backgroundColor: "rgba(249, 218, 71, 0.1)",
  },
  currencyText: {
    color: "#fff",
    fontSize: 16,
  },
  currencyTextSelected: {
    color: "rgb(249 218 71)",
    fontWeight: "700",
  },
  checkmark: {
    color: "rgb(249 218 71)",
    fontSize: 18,
    fontWeight: "700",
  },
});
