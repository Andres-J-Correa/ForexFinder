import { useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { GoogleMaps } from "expo-maps";
import { useImage } from "expo-image";
import BottomSheet from "@gorhom/bottom-sheet";
import type { NearbyShop } from "@/types/shop-service.types";
import { formatDistance } from "@/utils/map-helpers";

interface ShopMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  shops: NearbyShop[];
  zoom: number;
  onMarkerPress: (shop: NearbyShop) => void;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

export function ShopMap({
  userLocation,
  shops,
  zoom,
  onMarkerPress,
  bottomSheetRef,
}: ShopMapProps) {
  const mapRef = useRef<GoogleMaps.MapView>(null);
  const storeIcon = useImage(require("../assets/images/store.png"));

  const handleMarkerClick = useCallback(
    (marker: { id?: string }) => {
      const shop = shops.find(
        (s, idx) => `shop-marker-${s.id}-${idx}` === marker.id
      );
      if (shop) {
        onMarkerPress(shop);
      }
    },
    [shops, onMarkerPress]
  );

  return (
    <View style={styles.container}>
      <GoogleMaps.View
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        cameraPosition={{
          coordinates: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          zoom: zoom,
        }}
        properties={{
          isMyLocationEnabled: true,
          mapType: GoogleMaps.MapType.NORMAL,
          minZoomPreference: zoom,
        }}
        uiSettings={{
          myLocationButtonEnabled: true,
          scrollGesturesEnabled: true,
          zoomGesturesEnabled: true,
          zoomControlsEnabled: true,
          rotationGesturesEnabled: true,
          tiltGesturesEnabled: false,
          mapToolbarEnabled: true,
        }}
        markers={shops.map((shop, index) => {
          const isBestRate = index === 0; // First shop in list is the best rate
          const title = isBestRate ? `⭐ ${shop.name}` : shop.name;
          return {
            id: `shop-marker-${shop.id}-${index}`,
            coordinates: {
              latitude: shop.coordinates.latitude,
              longitude: shop.coordinates.longitude,
            },
            icon: storeIcon ? storeIcon : undefined,
            title: title,
            snippet: `${formatDistance(
              shop.distance
            )} • Buy: ${shop.rates.buyRate.toFixed(
              4
            )} • Sell: ${shop.rates.sellRate.toFixed(4)}`,
          };
        })}
        onMarkerClick={handleMarkerClick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

