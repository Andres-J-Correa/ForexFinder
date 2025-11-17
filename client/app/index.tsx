import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleMaps } from 'expo-maps';
import BottomSheet from '@gorhom/bottom-sheet';

import { CurrencyDropdown } from '@/components/CurrencyDropdown';
import { ShopDetailSheet } from '@/components/ShopDetailSheet';
import { getNearbyShops } from '@/services/shop-service';
import type { NearbyShop } from '@/types/shop-service.types';
import { handleError } from '@/utils/error-handler';
import { formatDistance, calculateZoomFromRadius } from '@/utils/map-helpers';

// Common currency codes
const CURRENCIES = [
  'USD',
  'EUR',
  'PHP',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR',
  'MXN',
  'BRL',
  'ZAR',
  'SGD',
  'HKD',
  'NZD',
  'KRW',
  'TRY',
  'RUB',
  'AED',
  'SAR',
];

export default function Index() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [radius, setRadius] = useState(0.1); // default 100m
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );
  const [selectedShop, setSelectedShop] = useState<NearbyShop | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(13);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<GoogleMaps.MapView>(null);

  // Available radius options in km
  const RADIUS_OPTIONS = [0.1, 0.5, 1, 3, 5, 10, 20];

  // Request location permission on mount
  useEffect(() => {
    requestLocationOnMount();
  }, []);

  const requestLocationOnMount = async () => {
    try {
      // Check current permission status
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();

      if (currentStatus === 'granted') {
        setLocationPermission(true);
        // Automatically get location if permission already granted
        await getCurrentLocation();
      } else {
        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
        if (status === 'granted') {
          await getCurrentLocation();
        }
      }
    } catch (error) {
      handleError(
        error,
        'Index.requestLocationOnMount',
        'Failed to request location permission',
      );
      setLocationPermission(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);

      // First check current permission status
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();

      // If already granted, just get location
      if (currentStatus === 'granted') {
        setLocationPermission(true);
        await getCurrentLocation();
        return;
      }

      // Request permission (this will show the dialog if not permanently denied)
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        // Permission denied - guide user to settings
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to find nearby shops. Please enable it in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                await Linking.openSettings();
              },
            },
          ],
        );
      }
    } catch (error) {
      handleError(
        error,
        'Index.requestLocationPermission',
        'Failed to request location permission',
      );
      Alert.alert('Error', 'Failed to request location permission.');
    } finally {
      setLocationLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      // Check if permission is granted
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        await requestLocationPermission();
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setLatitude(lat.toString());
      setLongitude(lng.toString());
      setUserLocation({ latitude: lat, longitude: lng });

      // Initialize map camera position with default radius zoom
      const initialZoom = calculateZoomFromRadius(radius, lat);
      setCurrentZoom(initialZoom);
    } catch (error) {
      handleError(
        error,
        'Index.getCurrentLocation',
        'Failed to get current location',
      );
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle marker press - open bottom sheet
  const handleMarkerPress = useCallback((shop: NearbyShop) => {
    setSelectedShop(shop);
    bottomSheetRef.current?.expand();
  }, []);

  // Handle radius change - update map zoom and search shops
  const handleRadiusChange = useCallback(
    async (newRadius: number) => {
      if (!userLocation || !fromCurrency || !toCurrency) {
        return;
      }

      if (fromCurrency === toCurrency) {
        Alert.alert('Error', 'From and to currencies must be different');
        return;
      }

      setRadius(newRadius);

      // Calculate and update zoom level
      const newZoom = calculateZoomFromRadius(newRadius, userLocation.latitude);
      setCurrentZoom(newZoom);

    },
    [userLocation, fromCurrency, toCurrency],
  );

  useEffect(() => {
    if(userLocation && latitude && longitude) {
      const searchShops = async () => {
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
          handleError(error, 'Index.handleRadiusChange', 'Failed to search shops');
        } finally {
          setLoading(false);
        }
      }

      searchShops();
    }
  }, [currentZoom, userLocation, latitude, longitude, radius, fromCurrency, toCurrency]);

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
      {/* Header */}
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#333',
        }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 4,
          }}>
          Select Currencies and Find Shops
        </Text>
      </View>

      {/* Search Form */}
      <ScrollView
        style={{ maxHeight: 180 }}
        contentContainerStyle={{ padding: 12 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}>

        {/* Currency Selection - Disabled until location is available */}
        {!latitude || !longitude ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
              Set your location first to select currencies
            </Text>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
            opacity: latitude && longitude ? 1 : 0.5,
          }}>
          <CurrencyDropdown
            label="From"
            selectedCurrency={fromCurrency}
            currencies={CURRENCIES}
            onSelect={setFromCurrency}
            disabled={!latitude || !longitude}
          />
          <CurrencyDropdown
            label="To"
            selectedCurrency={toCurrency}
            currencies={CURRENCIES}
            onSelect={setToCurrency}
            disabled={!latitude || !longitude}
          />
        </View>

        {/* Radius Selection Buttons */}
        {latitude && longitude && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
              }}>
              Search Radius
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 12 }}>
              {RADIUS_OPTIONS.map((radiusOption) => (
                <Pressable
                  key={radiusOption}
                  onPress={() => handleRadiusChange(radiusOption)}
                  disabled={loading}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    backgroundColor:
                      radius === radiusOption
                        ? 'rgb(249 218 71)'
                        : '#333',
                    borderWidth: 1,
                    borderColor:
                      radius === radiusOption
                        ? 'rgb(249 218 71)'
                        : '#555',
                    opacity: loading ? 0.6 : 1,
                  }}>
                  <Text
                    style={{
                      color: radius === radiusOption ? '#000' : '#fff',
                      fontSize: 12,
                      fontWeight: radius === radiusOption ? '700' : '500',
                    }}>
                    {radiusOption % 1 === 0 ? `${radiusOption}km` : `${radiusOption * 1000}m`}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {locationLoading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 16 }}>
            Loading location...
          </Text>
        </View>
      )}

      {!locationPermission && !locationLoading && <View
        style={{
          marginTop: 24,
          backgroundColor: '#1f1f1f',
          padding: 24,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#333',
          alignItems: 'center',
          zIndex: 1000,
        }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 8,
            textAlign: 'center',
          }}>
          Location Required
        </Text>
        <Text
          style={{
            color: '#999',
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
          }}>
          We need your location to find nearby currency exchange shops
        </Text>
        <Pressable
          onPress={requestLocationPermission}
          disabled={locationLoading}
          style={{
            padding: 16,
            backgroundColor: 'rgb(249 218 71)',
            borderRadius: 12,
            minWidth: 200,
            opacity: locationLoading ? 0.6 : 1,
          }}>
          {locationLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={{
                color: '#000',
                fontSize: 16,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              Use My Location
            </Text>
          )}
        </Pressable>
      </View>}

      {/* Map View */}
      {userLocation && !locationLoading && (
        <View style={{ flex: 1 }}>
          <GoogleMaps.View
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            cameraPosition={{
              coordinates: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              zoom: currentZoom,
            }}
            properties={{
              isMyLocationEnabled: true,
              mapType: GoogleMaps.MapType.NORMAL,
              minZoomPreference: currentZoom,
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
                title: title,
                snippet: `${formatDistance(shop.distance)} • Buy: ${shop.rates.buyRate.toFixed(4)} • Sell: ${shop.rates.sellRate.toFixed(4)}`,
              };
            })}
            onMarkerClick={(marker) => {
              const shop = shops.find((s, idx) => `shop-marker-${s.id}-${idx}` === marker.id);
              if (shop) {
                handleMarkerPress(shop);
              }
            }}
          />
        </View>
      )}

      {/* Bottom Sheet for Shop Details */}
      <ShopDetailSheet
        shop={selectedShop}
        bottomSheetRef={bottomSheetRef}
        onClose={() => setSelectedShop(null)}
      />
    </SafeAreaView>
  );
}
