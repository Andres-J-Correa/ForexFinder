import { CurrencyDropdown } from "@/components/CurrencyDropdown";
import { RadiusSelector } from "@/components/RadiusSelector";
import { CURRENCIES, type Currency } from "@/constants/currencies";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface SearchFormProps {
  fromCurrency: Currency;
  toCurrency: Currency;
  onFromCurrencyChange: (currency: Currency) => void;
  onToCurrencyChange: (currency: Currency) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  locationAvailable: boolean;
  loading?: boolean;
}

export function SearchForm({
  fromCurrency,
  toCurrency,
  onFromCurrencyChange,
  onToCurrencyChange,
  radius,
  onRadiusChange,
  locationAvailable,
  loading = false,
}: SearchFormProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}>
      {!locationAvailable && (
        <View style={styles.locationHint}>
          <Text style={styles.locationHintText}>
            Set your location first to select currencies
          </Text>
        </View>
      )}
      <View
        style={[
          styles.currencyRow,
          !locationAvailable && styles.currencyRowDisabled,
        ]}>
        <CurrencyDropdown
          label="From"
          selectedCurrency={fromCurrency}
          currencies={[...CURRENCIES]}
          onSelect={onFromCurrencyChange}
          disabled={!locationAvailable}
        />
        <CurrencyDropdown
          label="To"
          selectedCurrency={toCurrency}
          currencies={[...CURRENCIES]}
          onSelect={onToCurrencyChange}
          disabled={!locationAvailable}
        />
      </View>

      {locationAvailable && (
        <RadiusSelector
          selectedRadius={radius}
          onRadiusChange={onRadiusChange}
          loading={loading}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 170,
  },
  contentContainer: {
    padding: 12,
  },
  locationHint: {
    marginBottom: 16,
  },
  locationHintText: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  currencyRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  currencyRowDisabled: {
    opacity: 0.5,
  },
});
