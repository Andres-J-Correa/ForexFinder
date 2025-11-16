import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUser } from '@/contexts/UserContext';
import { getMyShops } from '@/services/shop-service';
import { createOrUpdateRate, getShopRates } from '@/services/rate-service';
import type { Rate } from '@/types/rate-service.types';
import type { Shop } from '@/types/shop-service.types';
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

export default function ShopRates() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);

  // Form state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
      return;
    }
  }, [user, isLoading, router]);

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      const shopsData = await getMyShops();
      setShops(shopsData);

      // If user has shops, select the first one by default (newest shop)
      if (shopsData.length > 0) {
        // If no shop selected yet, or selected shop no longer exists, select first
        const selectedShopExists = shopsData.some(
          (s) => s.id === selectedShopId,
        );
        if (!selectedShopId || !selectedShopExists) {
          setSelectedShopId(shopsData[0].id);
        }
        // Keep current selection if it still exists
      } else {
        // No shops, show registration prompt
        Alert.alert(
          'No Shops Found',
          'You need to register a shop first.',
          [
            {
              text: 'Register Shop',
              onPress: () => router.replace('/add-shop'),
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      }
    } catch (error) {
      handleError(
        error,
        'ShopRates.loadShops',
        'Failed to load shops',
      );
      if ((error as any)?.response?.status === 404) {
        Alert.alert(
          'No Shops Found',
          'You need to register a shop first.',
          [
            {
              text: 'Register Shop',
              onPress: () => router.replace('/add-shop'),
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user, router, selectedShopId]);

  // Refresh shops when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user && !isLoading) {
        loadShops();
      }
    }, [user, isLoading, loadShops]),
  );

  useEffect(() => {
    if (selectedShopId && shops.length > 0) {
      const shop = shops.find((s) => s.id === selectedShopId);
      if (shop) {
        setSelectedShop(shop);
        loadRates(shop.id);
      }
    }
  }, [selectedShopId, shops]);

  const loadRates = async (shopId: number) => {
    try {
      const ratesData = await getShopRates(shopId);
      setRates(ratesData);
    } catch (error) {
      handleError(
        error,
        'ShopRates.loadRates',
        'Failed to load rates',
      );
      Alert.alert('Error', 'Failed to load rates. Please try again.');
    }
  };

  const handleAddRate = () => {
    setEditingRate(null);
    setFromCurrency('USD');
    setToCurrency('EUR');
    setBuyRate('');
    setSellRate('');
    setShowForm(true);
  };

  const handleEditRate = (rate: Rate) => {
    setEditingRate(rate);
    setFromCurrency(rate.fromCurrency);
    setToCurrency(rate.toCurrency);
    setBuyRate(rate.buyRate.toString());
    setSellRate(rate.sellRate.toString());
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!selectedShop) return;

    if (!fromCurrency || !toCurrency) {
      Alert.alert('Error', 'Please select both currencies');
      return;
    }

    if (fromCurrency === toCurrency) {
      Alert.alert('Error', 'From and to currencies must be different');
      return;
    }

    const buy = parseFloat(buyRate);
    const sell = parseFloat(sellRate);

    if (isNaN(buy) || buy < 0) {
      Alert.alert('Error', 'Please enter a valid buy rate');
      return;
    }

    if (isNaN(sell) || sell < 0) {
      Alert.alert('Error', 'Please enter a valid sell rate');
      return;
    }

    try {
      setSubmitting(true);
      await createOrUpdateRate(selectedShop.id, {
        fromCurrency,
        toCurrency,
        buyRate: buy,
        sellRate: sell,
      });

      Alert.alert('Success', 'Rate saved successfully!');
      setShowForm(false);
      if (selectedShop.id) {
        await loadRates(selectedShop.id);
      }
    } catch (error) {
      handleError(
        error,
        'ShopRates.handleSubmit',
        'Failed to save rate',
      );
      Alert.alert('Error', 'Failed to save rate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgb(56 56 58)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="rgb(249 218 71)" />
      </View>
    );
  }

  if (!selectedShop || shops.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgb(56 56 58)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}>
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>
          No shops found
        </Text>
        <Pressable
          onPress={() => router.replace('/add-shop')}
          style={{
            padding: 12,
            backgroundColor: 'rgb(249 218 71)',
            borderRadius: 8,
          }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>
            Register Shop
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgb(56 56 58)' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {shops.length > 1 && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 8,
              }}>
              Select Shop
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}>
              {shops.map((shop) => (
                <Pressable
                  key={shop.id}
                  onPress={() => setSelectedShopId(shop.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginRight: 8,
                    backgroundColor:
                      selectedShopId === shop.id
                        ? 'rgb(249 218 71)'
                        : '#1f1f1f',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor:
                      selectedShopId === shop.id ? 'rgb(249 218 71)' : '#333',
                  }}>
                  <Text
                    style={{
                      color: selectedShopId === shop.id ? '#000' : '#fff',
                      fontWeight: selectedShopId === shop.id ? '700' : '400',
                    }}>
                    {shop.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <Text
          style={{
            color: '#fff',
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 8,
          }}>
          {selectedShop.name}
        </Text>
        <Text style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>
          Manage your exchange rates
        </Text>

        {!showForm ? (
          <>
            <Pressable
              onPress={handleAddRate}
              style={{
                padding: 16,
                backgroundColor: 'rgb(249 218 71)',
                borderRadius: 12,
                marginBottom: 24,
              }}>
              <Text
                style={{
                  color: '#000',
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                }}>
                Add New Rate
              </Text>
            </Pressable>

            {rates.length === 0 ? (
              <View
                style={{
                  padding: 24,
                  alignItems: 'center',
                }}>
                <Text style={{ color: '#999', fontSize: 16 }}>
                  No rates yet. Add your first rate!
                </Text>
              </View>
            ) : (
              rates.map((rate) => (
                <Pressable
                  key={rate.id}
                  onPress={() => handleEditRate(rate)}
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
                      alignItems: 'center',
                      marginBottom: 8,
                    }}>
                    <Text
                      style={{
                        color: 'rgb(249 218 71)',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                      {rate.fromCurrency} → {rate.toCurrency}
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
                        {rate.buyRate.toFixed(4)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#999', fontSize: 12 }}>
                        Sell Rate
                      </Text>
                      <Text style={{ color: '#fff', fontSize: 16 }}>
                        {rate.sellRate.toFixed(4)}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ color: '#666', fontSize: 12 }}>
                    Updated: {formatDate(rate.createdAt)}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        ) : (
          <View>
            <Text
              style={{
                color: '#fff',
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 16,
              }}>
              {editingRate ? 'Edit Rate' : 'Add New Rate'}
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
                From Currency
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
                To Currency
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
                        toCurrency === currency
                          ? 'rgb(249 218 71)'
                          : '#1f1f1f',
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

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
                Buy Rate
              </Text>
              <TextInput
                value={buyRate}
                onChangeText={setBuyRate}
                placeholder="0.0000"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: '#1f1f1f',
                  color: '#fff',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#333',
                }}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: '#fff', marginBottom: 8, fontSize: 16 }}>
                Sell Rate
              </Text>
              <TextInput
                value={sellRate}
                onChangeText={setSellRate}
                placeholder="0.0000"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: '#1f1f1f',
                  color: '#fff',
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#333',
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: 'rgb(249 218 71)',
                  borderRadius: 12,
                  opacity: submitting ? 0.6 : 1,
                }}>
                {submitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 18,
                      fontWeight: '700',
                      textAlign: 'center',
                    }}>
                    Save
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setEditingRate(null);
                }}
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: '#1f1f1f',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#333',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

