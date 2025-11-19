import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoadingIndicator } from "@/components/LoadingIndicator";
import { LocationPermissionPrompt } from "@/components/LocationPermissionPrompt";
import { SearchForm } from "@/components/SearchForm";
import { ShopDetailSheet } from "@/components/ShopDetailSheet";
import { ShopListOverlay } from "@/components/ShopListOverlay";
import { ShopMap, type ShopMapRef } from "@/components/ShopMap";
import { type Currency } from "@/constants/currencies";
import {
  DEFAULT_FROM_CURRENCY,
  DEFAULT_RADIUS,
  DEFAULT_TO_CURRENCY,
} from "@/constants/search";
import { useLocation } from "@/hooks/useLocation";
import { useMapCamera } from "@/hooks/useMapCamera";
import { useShopSearch } from "@/hooks/useShopSearch";
import { styles } from "@/styles/index.styles";
import type { NearbyShop } from "@/types/shop-service.types";

export default function Index() {
  const [fromCurrency, setFromCurrency] = useState<Currency>(
    DEFAULT_FROM_CURRENCY
  );
  const [toCurrency, setToCurrency] = useState<Currency>(DEFAULT_TO_CURRENCY);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [selectedShop, setSelectedShop] = useState<NearbyShop | null>(null);

  const mapRef = useRef<ShopMapRef>(null);

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

  // Handle shop click from overlay - focus map and open detail sheet
  const handleShopPress = useCallback((shop: NearbyShop) => {
    // Focus map on the selected shop
    mapRef.current?.focusShop(shop);
    setIsOverlayVisible(false);
    setSelectedShop(shop);
  }, []);

  const handleMarkerPress = useCallback((shop: NearbyShop) => {
    // Focus map on the selected shop
    mapRef.current?.focusShop(shop);
    setIsOverlayVisible(false);
    setSelectedShop(shop);
  }, []);

  // Handle radius change
  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
  }, []);

  // Toggle overlay visibility
  const toggleOverlay = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation();
    setIsOverlayVisible((prev) => !prev);
  }, []);

  const locationAvailable = !!(latitude && longitude);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
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

      {locationLoading && <LoadingIndicator message="Loading location..." />}

      {!locationPermission && !locationLoading && (
        <LocationPermissionPrompt
          onRequestPermission={requestLocationPermission}
          loading={locationLoading}
        />
      )}

      {userLocation && !locationLoading && (
        <View style={styles.mapContainer}>
          <ShopMap
            ref={mapRef}
            userLocation={userLocation}
            shops={shops}
            zoom={currentZoom}
            onMarkerPress={handleMarkerPress}
          />

          {/* Toggle Button for Overlay */}
          {shops.length > 0 && !isOverlayVisible && (
            <Pressable style={styles.toggleButton} onPress={toggleOverlay}>
              <Text style={styles.toggleButtonText}>Show List</Text>
            </Pressable>
          )}

          {/* Shop List Overlay */}
          <ShopListOverlay
            shops={shops}
            visible={isOverlayVisible}
            onShopPress={handleShopPress}
            onToggle={toggleOverlay}
          />
        </View>
      )}

      {selectedShop && (
        <ShopDetailSheet
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
        />
      )}
    </SafeAreaView>
  );
}
