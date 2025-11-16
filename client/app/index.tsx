import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getNearbyShops } from '@/services/shop-service';
import type { NearbyShop } from '@/types/shop-service.types';
import { handleError } from '@/utils/error-handler';

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

export default function Index() {
  const router = useRouter();
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

  // Request location permission on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      handleError(
        error,
        'Index.checkLocationPermission',
        'Failed to check location permission',
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
          'Location Permission Denied',
          'Please enable location permission in your device settings to use this feature.',
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

      setLatitude(location.coords.latitude.toString());
      setLongitude(location.coords.longitude.toString());
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

  const searchShops = useCallback(async () => {
    if (!fromCurrency || !toCurrency) {
      Alert.alert('Error', 'Please select both currencies');
      return;
    }

    if (fromCurrency === toCurrency) {
      Alert.alert('Error', 'From and to currencies must be different');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

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
        radius,
        fromCurrency,
        toCurrency,
      });
      setShops(results);

      if (results.length === 0) {
        Alert.alert(
          'No Shops Found',
          `No shops found within ${radius}km for ${fromCurrency} to ${toCurrency}. Try increasing the search radius or check a different currency pair.`,
        );
      }
    } catch (error) {
      handleError(error, 'Index.searchShops', 'Failed to search shops');
      Alert.alert('Error', 'Failed to search shops. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius, fromCurrency, toCurrency]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await searchShops();
    setRefreshing(false);
  }, [searchShops]);

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
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
        <Text
          style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 8,
          }}>
          Find Currency Exchange Shops
        </Text>
        <Text style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>
          Search for nearby shops offering currency exchange rates
        </Text>

        {/* Currency Selection */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
            From Currency *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}>
            {CURRENCIES.map((currency) => (
              <Pressable
                key={currency}
                onPress={() => setFromCurrency(currency)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  backgroundColor:
                    fromCurrency === currency
                      ? 'rgb(249 218 71)'
                      : '#1f1f1f',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    fromCurrency === currency ? 'rgb(249 218 71)' : '#333',
                }}>
                <Text
                  style={{
                    color: fromCurrency === currency ? '#000' : '#fff',
                    fontWeight: fromCurrency === currency ? '700' : '400',
                  }}>
                  {currency}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
            To Currency *
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}>
            {CURRENCIES.map((currency) => (
              <Pressable
                key={currency}
                onPress={() => setToCurrency(currency)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  backgroundColor:
                    toCurrency === currency ? 'rgb(249 218 71)' : '#1f1f1f',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    toCurrency === currency ? 'rgb(249 218 71)' : '#333',
                }}>
                <Text
                  style={{
                    color: toCurrency === currency ? '#000' : '#fff',
                    fontWeight: toCurrency === currency ? '700' : '400',
                  }}>
                  {currency}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Location Input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
            Location *
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <TextInput
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Latitude"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={{
                flex: 1,
                backgroundColor: '#1f1f1f',
                color: '#fff',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#333',
              }}
            />
            <TextInput
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Longitude"
              placeholderTextColor="#999"
              keyboardType="numeric"
              style={{
                flex: 1,
                backgroundColor: '#1f1f1f',
                color: '#fff',
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#333',
              }}
            />
          </View>
          <Pressable
            onPress={getCurrentLocation}
            disabled={locationLoading}
            style={{
              padding: 12,
              backgroundColor: '#1f1f1f',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: 'rgb(249 218 71)',
              opacity: locationLoading ? 0.6 : 1,
            }}>
            {locationLoading ? (
              <ActivityIndicator color="rgb(249 218 71)" />
            ) : (
              <Text
                style={{
                  color: 'rgb(249 218 71)',
                  fontWeight: '700',
                  textAlign: 'center',
                }}>
                Use My Location
              </Text>
            )}
          </Pressable>
        </View>

        {/* Radius Selection */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
            Search Radius: {radius}km
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

        {/* Search Button */}
        <Pressable
          onPress={searchShops}
          disabled={loading}
          style={{
            padding: 16,
            backgroundColor: 'rgb(249 218 71)',
            borderRadius: 12,
            marginBottom: 24,
            opacity: loading ? 0.6 : 1,
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
              Search Shops
            </Text>
          )}
        </Pressable>

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
                  // TODO: Navigate to shop details or show on map
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
    </SafeAreaView>
  );
}
