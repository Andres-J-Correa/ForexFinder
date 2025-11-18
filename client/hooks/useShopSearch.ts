import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { getNearbyShops } from "@/services/shop-service";
import type { NearbyShop } from "@/types/shop-service.types";
import { handleError } from "@/utils/error-handler";

interface UseShopSearchParams {
  userLocation: { latitude: number; longitude: number } | null;
  radius: number;
  fromCurrency: string;
  toCurrency: string;
  enabled: boolean;
}

interface UseShopSearchReturn {
  shops: NearbyShop[];
  loading: boolean;
  searchShops: () => Promise<void>;
}

export function useShopSearch({
  userLocation,
  radius,
  fromCurrency,
  toCurrency,
  enabled,
}: UseShopSearchParams): UseShopSearchReturn {
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(false);

  const searchShops = useCallback(async () => {
    if (!userLocation || !fromCurrency || !toCurrency || !enabled) {
      return;
    }

    if (fromCurrency === toCurrency) {
      Alert.alert("Error", "From and to currencies must be different");
      return;
    }

    try {
      setLoading(true);
      const results = await getNearbyShops({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: radius,
        fromCurrency,
        toCurrency,
      });
      setShops(results);
    } catch (error) {
      handleError(error, "useShopSearch.searchShops", "Failed to search shops");
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius, fromCurrency, toCurrency, enabled]);

  useEffect(() => {
    if (enabled && userLocation && fromCurrency && toCurrency) {
      searchShops();
    }
  }, [enabled, userLocation, radius, fromCurrency, toCurrency, searchShops]);

  return {
    shops,
    loading,
    searchShops,
  };
}

