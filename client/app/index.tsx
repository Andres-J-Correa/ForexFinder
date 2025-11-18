import { useState, useCallback, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";

import { SearchHeader } from "@/components/SearchHeader";
import { SearchForm } from "@/components/SearchForm";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ShopMap } from "@/components/ShopMap";
import { ShopDetailSheet } from "@/components/ShopDetailSheet";
import { useLocation } from "@/hooks/useLocation";
import { useMapCamera } from "@/hooks/useMapCamera";
import { useShopSearch } from "@/hooks/useShopSearch";
import { DEFAULT_RADIUS, DEFAULT_FROM_CURRENCY, DEFAULT_TO_CURRENCY } from "@/constants/search";
import type { NearbyShop } from "@/types/shop-service.types";
import { styles } from "@/styles/index.styles";
import { type Currency } from "@/constants/currencies";

export default function Index() {
  const [fromCurrency, setFromCurrency] = useState<Currency>(DEFAULT_FROM_CURRENCY);
  const [toCurrency, setToCurrency] = useState<Currency>(DEFAULT_TO_CURRENCY);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [selectedShop, setSelectedShop] = useState<NearbyShop | null>(null);

  const bottomSheetRef = useRef<BottomSheet | null>(null);

  const {
    userLocation,
    latitude,
    longitude,
    locationPermission,
    locationLoading,
    requestLocationPermission,
  } = useLocation();

  const { currentZoom, setZoomFromRadius } = useMapCamera(
    radius,
    userLocation?.latitude
  );

  const { shops, loading } = useShopSearch({
    userLocation,
    radius,
    fromCurrency,
    toCurrency,
    enabled: !!userLocation && !!latitude && !!longitude,
  });

  // Update zoom when radius or location changes
  useEffect(() => {
    if (userLocation) {
      setZoomFromRadius(radius, userLocation.latitude);
    }
  }, [radius, userLocation, setZoomFromRadius]);

  // Handle marker press - open bottom sheet
  const handleMarkerPress = useCallback((shop: NearbyShop) => {
    setSelectedShop(shop);
    bottomSheetRef.current?.expand();
  }, []);

  // Handle radius change
  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
  }, []);

  const locationAvailable = !!(latitude && longitude);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <SearchHeader />

      <SearchForm
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        onFromCurrencyChange={setFromCurrency}
        onToCurrencyChange={setToCurrency}
        radius={radius}
        onRadiusChange={handleRadiusChange}
        locationAvailable={locationAvailable}
        loading={loading}
      />

      {locationLoading && (
        <LoadingIndicator message="Loading location..." />
      )}

      {!locationPermission && !locationLoading && (
        <LocationPermissionPrompt
          onRequestPermission={requestLocationPermission}
          loading={locationLoading}
        />
      )}

      {userLocation && !locationLoading && (
        <ShopMap
          userLocation={userLocation}
          shops={shops}
          zoom={currentZoom}
          onMarkerPress={handleMarkerPress}
          bottomSheetRef={bottomSheetRef}
        />
      )}

      <ShopDetailSheet
        shop={selectedShop}
        bottomSheetRef={bottomSheetRef}
        onClose={() => setSelectedShop(null)}
      />
    </SafeAreaView>
  );
}
