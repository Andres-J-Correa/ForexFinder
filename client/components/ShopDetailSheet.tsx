import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { NearbyShop } from '@/types/shop-service.types';
import { formatDistance } from '@/utils/map-helpers';

interface ShopDetailSheetProps {
  shop: NearbyShop | null;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  onClose?: () => void;
}

export function ShopDetailSheet({
  shop,
  bottomSheetRef,
  onClose,
}: ShopDetailSheetProps) {
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1 && onClose) {
        onClose();
      }
    },
    [onClose],
  );

  if (!shop) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: 'rgb(56 56 58)' }}
      handleIndicatorStyle={{ backgroundColor: 'rgb(249 218 71)' }}>
      <BottomSheetView style={{ flex: 1, padding: 16, paddingBottom: 24 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                color: 'rgb(249 218 71)',
                fontSize: 24,
                fontWeight: '700',
                marginBottom: 8,
              }}>
              {shop.name}
            </Text>
            <Text
              style={{
                color: '#999',
                fontSize: 16,
                marginBottom: 16,
              }}>
              {formatDistance(shop.distance)} away
            </Text>
          </View>

          {/* Exchange Rates */}
          <View
            style={{
              backgroundColor: '#1f1f1f',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 12,
              }}>
              Exchange Rates
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#999', fontSize: 12 }}>From</Text>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  {shop.rates.fromCurrency}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#999', fontSize: 12 }}>To</Text>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  {shop.rates.toCurrency}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#999', fontSize: 12 }}>Buy Rate</Text>
                <Text
                  style={{
                    color: 'rgb(249 218 71)',
                    fontSize: 20,
                    fontWeight: '700',
                  }}>
                  {shop.rates.buyRate.toFixed(4)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#999', fontSize: 12 }}>Sell Rate</Text>
                <Text
                  style={{
                    color: 'rgb(249 218 71)',
                    fontSize: 20,
                    fontWeight: '700',
                  }}>
                  {shop.rates.sellRate.toFixed(4)}
                </Text>
              </View>
            </View>
            <Text style={{ color: '#666', fontSize: 12, marginTop: 12 }}>
              Rate Age: {shop.rates.rateAge.toFixed(1)} days
            </Text>
          </View>

          {/* Contact Information */}
          {shop.contact && (
            <View
              style={{
                backgroundColor: '#1f1f1f',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 8,
                }}>
                Contact
              </Text>
              <Text style={{ color: '#999', fontSize: 14 }}>{shop.contact}</Text>
            </View>
          )}

          {/* Working Hours */}
          {shop.hours && (
            <View
              style={{
                backgroundColor: '#1f1f1f',
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 8,
                }}>
                Working Hours
              </Text>
              <Text style={{ color: '#999', fontSize: 14 }}>{shop.hours}</Text>
            </View>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

