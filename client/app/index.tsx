import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';

import { CurrencyDropdown } from '@/components/CurrencyDropdown';
import { ShopDetailSheet } from '@/components/ShopDetailSheet';
import { getNearbyShops } from '@/services/shop-service';
import type { NearbyShop } from '@/types/shop-service.types';
import { handleError } from '@/utils/error-handler';
import {
  calculateRadiusFromRegion,
  formatDistance,
} from '@/utils/map-helpers';

// Common currency codes
const CURRENCIES = [
  'USD',
  'EUR',
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

const RADIUS_OPTIONS = [1, 2, 5, 10, 20]; // in kilometers

type ViewMode = 'list' | 'map';

export default function Index() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [radius, setRadius] = useState(5); // default 5km
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );
  const [selectedShop, setSelectedShop] = useState<NearbyShop | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const regionChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to find nearby shops. Please enable it in your device settings.',
        );
      }
    } catch (error) {
      handleError(
        error,
        'Index.requestLocationPermission',
        'Failed to request location permission',
      );
      Alert.alert('Error', 'Failed to request location permission.');
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

      // Update map region if in map view
      if (viewMode === 'map' && mapRef.current) {
        const region: Region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.05, // ~5km
          longitudeDelta: 0.05,
        };
        setMapRegion(region);
        mapRef.current.animateToRegion(region, 1000);
      }
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

  const searchShops = useCallback(
    async (searchRadius?: number, searchLat?: number, searchLng?: number) => {
      if (!fromCurrency || !toCurrency) {
        Alert.alert('Error', 'Please select both currencies');
        return;
      }

      if (fromCurrency === toCurrency) {
        Alert.alert('Error', 'From and to currencies must be different');
        return;
      }

      const lat = searchLat ?? parseFloat(latitude);
      const lng = searchLng ?? parseFloat(longitude);
      const searchRadiusValue = searchRadius ?? radius;

      if (isNaN(lat) || lat < -90 || lat > 90) {
        Alert.alert('Error', 'Please enter a valid latitude (-90 to 90)');
        return;
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        Alert.alert('Error', 'Please enter a valid longitude (-180 to 180)');
        return;
      }

      try {
        setLoading(true);
        const results = await getNearbyShops({
          lat,
          lng,
          radius: searchRadiusValue,
          fromCurrency,
          toCurrency,
        });
        setShops(results);

        if (results.length === 0 && viewMode === 'list') {
          Alert.alert(
            'No Shops Found',
            `No shops found within ${searchRadiusValue.toFixed(1)}km for ${fromCurrency} to ${toCurrency}. Try increasing the search radius or check a different currency pair.`,
          );
        }
      } catch (error) {
        handleError(error, 'Index.searchShops', 'Failed to search shops');
        if (viewMode === 'list') {
          Alert.alert('Error', 'Failed to search shops. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [latitude, longitude, radius, fromCurrency, toCurrency, viewMode],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await searchShops();
    setRefreshing(false);
  }, [searchShops]);

  // Handle map region change with debouncing
  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setMapRegion(region);

      // Clear existing timeout
      if (regionChangeTimeoutRef.current) {
        clearTimeout(regionChangeTimeoutRef.current);
      }

      // Debounce the search - wait 800ms after user stops moving/zooming
      regionChangeTimeoutRef.current = setTimeout(() => {
        if (!fromCurrency || !toCurrency) return;

        // Calculate radius from visible map area
        const calculatedRadius = calculateRadiusFromRegion(region);

        // Update radius state
        setRadius(calculatedRadius);

        // Search shops with new region center and calculated radius
        searchShops(calculatedRadius, region.latitude, region.longitude);
      }, 800);
    },
    [fromCurrency, toCurrency, searchShops],
  );

  // Manual refresh for map view
  const handleManualRefresh = useCallback(() => {
    if (!mapRegion) return;
    const calculatedRadius = calculateRadiusFromRegion(mapRegion);
    setRadius(calculatedRadius);
    searchShops(calculatedRadius, mapRegion.latitude, mapRegion.longitude);
  }, [mapRegion, searchShops]);

  // Handle marker press - open bottom sheet
  const handleMarkerPress = useCallback((shop: NearbyShop) => {
    setSelectedShop(shop);
    bottomSheetRef.current?.expand();
  }, []);

  // Initialize map region when location is set or when switching to map view
  useEffect(() => {
    if (latitude && longitude && viewMode === 'map') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        // If no region set, or if switching to map view, initialize/update region
        if (!mapRegion || viewMode === 'map') {
          const region: Region = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setMapRegion(region);
          // Animate to region if map ref exists
          if (mapRef.current) {
            mapRef.current.animateToRegion(region, 500);
          }
        }
      }
    }
  }, [latitude, longitude, viewMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (regionChangeTimeoutRef.current) {
        clearTimeout(regionChangeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
      {/* Header with Toggle */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#333',
        }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: '#fff',
              fontSize: 24,
              fontWeight: '700',
              marginBottom: 4,
            }}>
            Find Currency Exchange Shops
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#1f1f1f',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#333',
            overflow: 'hidden',
          }}>
          <Pressable
            onPress={() => setViewMode('list')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: viewMode === 'list' ? 'rgb(249 218 71)' : 'transparent',
            }}>
            <Text
              style={{
                color: viewMode === 'list' ? '#000' : '#fff',
                fontWeight: viewMode === 'list' ? '700' : '400',
              }}>
              List
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('map')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: viewMode === 'map' ? 'rgb(249 218 71)' : 'transparent',
            }}>
            <Text
              style={{
                color: viewMode === 'map' ? '#000' : '#fff',
                fontWeight: viewMode === 'map' ? '700' : '400',
              }}>
              Map
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search Form - Always visible */}
      <ScrollView
        style={{ maxHeight: viewMode === 'map' ? 300 : undefined }}
        contentContainerStyle={{ padding: 16 }}
        nestedScrollEnabled={true}>

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

        {/* Radius Selection - Only show in list view */}
        {viewMode === 'list' && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
              Search Radius: {radius.toFixed(1)}km
            </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}>
            {RADIUS_OPTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setRadius(r)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  backgroundColor: radius === r ? 'rgb(249 218 71)' : '#1f1f1f',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: radius === r ? 'rgb(249 218 71)' : '#333',
                }}>
                <Text
                  style={{
                    color: radius === r ? '#000' : '#fff',
                    fontWeight: radius === r ? '700' : '400',
                  }}>
                  {r}km
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          </View>
        )}

        {/* Location Status - First step */}
        {!latitude || !longitude ? (
          <View
            style={{
              backgroundColor: '#1f1f1f',
              padding: 24,
              borderRadius: 12,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#333',
              alignItems: 'center',
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
          </View>
        ) : viewMode === 'list' && (
          <View style={{ marginBottom: 24 }}>
            <Pressable
              onPress={getCurrentLocation}
              disabled={locationLoading}
              style={{
                padding: 8,
                backgroundColor: '#333',
                borderRadius: 8,
                opacity: locationLoading ? 0.6 : 1,
              }}>
              {locationLoading ? (
                <ActivityIndicator color="rgb(249 218 71)" size="small" />
              ) : (
                <Text
                  style={{
                    color: 'rgb(249 218 71)',
                    fontSize: 12,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                  Update Location
                </Text>
              )}
            </Pressable>
            </View>
        )}

        {/* Map View Radius Info */}
        {viewMode === 'map' && mapRegion && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#999', fontSize: 12 }}>
              Visible area radius: {calculateRadiusFromRegion(mapRegion).toFixed(1)}km
            </Text>
          </View>
        )}

        {/* Search Button */}
        <Pressable
          onPress={() => searchShops()}
          disabled={loading || !latitude || !longitude}
          style={{
            padding: 16,
            backgroundColor: 'rgb(249 218 71)',
            borderRadius: 12,
            marginBottom: viewMode === 'list' ? 24 : 0,
            opacity: loading || !latitude || !longitude ? 0.6 : 1,
          }}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text
              style={{
                color: '#000',
                fontSize: 18,
                fontWeight: '700',
                textAlign: 'center',
              }}>
              {!latitude || !longitude
                ? 'Set Location First'
                : 'Search Shops'}
            </Text>
          )}
        </Pressable>

        {viewMode === 'list' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="rgb(249 218 71)"
            />
          }>
          {/* Results */}
        {shops.length > 0 && (
          <View>
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 16,
              }}>
              Found {shops.length} Shop{shops.length !== 1 ? 's' : ''}
            </Text>
            {shops.map((shop) => (
              <Pressable
                key={shop.id}
                onPress={() => {
                  setSelectedShop(shop);
                  bottomSheetRef.current?.expand();
                }}
                style={{
                  backgroundColor: '#1f1f1f',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#333',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}>
                  <Text
                    style={{
                      color: 'rgb(249 218 71)',
                      fontSize: 18,
                      fontWeight: '700',
                      flex: 1,
                    }}>
                    {shop.name}
                  </Text>
                  <Text
                    style={{
                      color: '#999',
                      fontSize: 14,
                      marginLeft: 8,
                    }}>
                    {formatDistance(shop.distance)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    marginBottom: 8,
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>
                      Buy Rate
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      {shop.rates.buyRate.toFixed(4)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>
                      Sell Rate
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      {shop.rates.sellRate.toFixed(4)}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                  {shop.rates.fromCurrency} → {shop.rates.toCurrency} • Rate
                  Age: {shop.rates.rateAge.toFixed(1)} days
                </Text>

                {shop.contact && (
                  <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    Contact: {shop.contact}
                  </Text>
                )}

                {shop.hours && (
                  <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                    Hours: {shop.hours}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {shops.length === 0 && !loading && (
          <View
            style={{
              padding: 24,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#999', fontSize: 16 }}>
              No results yet. Use the search above to find nearby shops.
            </Text>
          </View>
        )}
        </ScrollView>
      )}
      </ScrollView>

      {/* Map View */}
      {viewMode === 'map' && mapRegion && !locationLoading && (
        <View style={{ flex: 1}}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              initialRegion={mapRegion}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation={true}
              showsMyLocationButton={true}
              mapType="standard">
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  pinColor="blue"
                />
              )}

              {/* Shop Markers */}
              {shops.map((shop) => (
                <Marker
                  key={shop.id}
                  coordinate={{
                    latitude: shop.coordinates.latitude,
                    longitude: shop.coordinates.longitude,
                  }}
                  title={shop.name}
                  description={`${formatDistance(shop.distance)} • ${shop.rates.fromCurrency} → ${shop.rates.toCurrency}`}
                  onPress={() => handleMarkerPress(shop)}
                  pinColor="rgb(249 218 71)"
                />
              ))}
            </MapView>

          {/* Manual Refresh Button for Map */}
          {mapRegion && (
            <Pressable
              onPress={handleManualRefresh}
              disabled={loading}
              style={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                backgroundColor: 'rgb(249 218 71)',
                width: 56,
                height: 56,
                borderRadius: 28,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                opacity: loading ? 0.6 : 1,
              }}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={{ color: '#000', fontSize: 24 }}>↻</Text>
              )}
            </Pressable>
          )}
        </View>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="rgb(249 218 71)"
            />
          }>
          {/* Results */}
        {shops.length > 0 && (
          <View>
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 16,
              }}>
              Found {shops.length} Shop{shops.length !== 1 ? 's' : ''}
            </Text>
            {shops.map((shop) => (
              <Pressable
                key={shop.id}
                onPress={() => {
                  setSelectedShop(shop);
                  bottomSheetRef.current?.expand();
                }}
                style={{
                  backgroundColor: '#1f1f1f',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#333',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}>
                  <Text
                    style={{
                      color: 'rgb(249 218 71)',
                      fontSize: 18,
                      fontWeight: '700',
                      flex: 1,
                    }}>
                    {shop.name}
                  </Text>
                  <Text
                    style={{
                      color: '#999',
                      fontSize: 14,
                      marginLeft: 8,
                    }}>
                    {formatDistance(shop.distance)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    marginBottom: 8,
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>
                      Buy Rate
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      {shop.rates.buyRate.toFixed(4)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#999', fontSize: 12 }}>
                      Sell Rate
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 16 }}>
                      {shop.rates.sellRate.toFixed(4)}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                  {shop.rates.fromCurrency} → {shop.rates.toCurrency} • Rate
                  Age: {shop.rates.rateAge.toFixed(1)} days
                </Text>

                {shop.contact && (
                  <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                    Contact: {shop.contact}
                  </Text>
                )}

                {shop.hours && (
                  <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
                    Hours: {shop.hours}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {shops.length === 0 && !loading && (
          <View
            style={{
              padding: 24,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#999', fontSize: 16 }}>
              No results yet. Use the search above to find nearby shops.
            </Text>
          </View>
        )}
        </ScrollView>
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
