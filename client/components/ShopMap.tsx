import type { NearbyShop } from "@/types/shop-service.types";
import { formatDistance } from "@/utils/map-helpers";
import { useImage } from "expo-image";
import { GoogleMaps, type CameraPosition } from "expo-maps";
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";

interface ShopMapProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  shops: NearbyShop[];
  zoom: number;
  onMarkerPress: (shop: NearbyShop) => void;
}

export interface ShopMapRef {
  focusShop: (shop: NearbyShop) => void;
}

export const ShopMap = React.forwardRef<ShopMapRef, ShopMapProps>(
  ({ userLocation, shops, zoom, onMarkerPress }, ref) => {
    const mapRef = useRef<GoogleMaps.MapView>(null);
    const storeIcon = useImage(require("../assets/images/store.png"));
    const [cameraPosition, setCameraPosition] = useState<CameraPosition>({
      coordinates: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      zoom: zoom,
    });

    const shopIdPrefix: string = "shop-marker";

    const shopsHashMap = useMemo(
      () => new Map(shops.map((s, i) => [`${shopIdPrefix}-${s.id}-${i}`, s])),
      [shops]
    );

    // Update camera position when userLocation or zoom changes
    useEffect(() => {
      setCameraPosition({
        coordinates: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        zoom: zoom,
      });
    }, [userLocation.latitude, userLocation.longitude, zoom]);

    // Expose focusShop method via ref
    useImperativeHandle(ref, () => ({
      focusShop: (shop: NearbyShop) => {
        // Focus on shop with a closer zoom level
        const focusZoom = 15; // Closer zoom for individual shop
        setCameraPosition({
          coordinates: {
            latitude: shop.coordinates.latitude,
            longitude: shop.coordinates.longitude,
          },
          zoom: focusZoom,
        });
      },
    }));

    const handleMarkerClick = useCallback(
      ({ id }: { id?: string }) => {
        if (!id) return;
        const shop = shopsHashMap.get(id);

        if (!shop) return;

        onMarkerPress(shop);
      },
      [shopsHashMap, onMarkerPress]
    );

    return (
      <View style={styles.container}>
        <GoogleMaps.View
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          cameraPosition={cameraPosition}
          properties={{
            isMyLocationEnabled: true,
            mapType: GoogleMaps.MapType.NORMAL,
            minZoomPreference: zoom,
          }}
          onMarkerClick={handleMarkerClick}
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
              id: `${shopIdPrefix}-${shop.id}-${index}`,
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
        />
      </View>
    );
  }
);

ShopMap.displayName = "ShopMap";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
