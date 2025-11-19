import type { NearbyShop } from "@/types/shop-service.types";
import { formatDistance } from "@/utils/map-helpers";
import { getFormattedAge } from "@/utils/time-helpers";
import {
  type GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ShopListOverlayProps {
  shops: NearbyShop[];
  visible: boolean;
  onShopPress: (shop: NearbyShop) => void;
  onToggle: (event: GestureResponderEvent) => void;
}

export function ShopListOverlay({
  shops,
  visible,
  onShopPress,
  onToggle,
}: ShopListOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.backdrop} onPress={onToggle}>
      <View
        style={styles.container}
        onStartShouldSetResponder={() => true}
        onTouchEnd={(e) => e.stopPropagation()}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Top 10 Best Rates</Text>
          <Pressable onPress={onToggle} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        {/* Shop List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}>
          {shops.map((shop, index) => {
            const isBestRate = index === 0;
            const rank = index + 1;

            return (
              <Pressable
                key={shop.id}
                style={[styles.shopItem, isBestRate && styles.shopItemBest]}
                onPress={() => onShopPress(shop)}>
                {/* Rank Badge */}
                <View
                  style={[
                    styles.rankBadge,
                    isBestRate && styles.rankBadgeBest,
                  ]}>
                  {isBestRate ? (
                    <Text style={styles.rankBadgeText}>⭐</Text>
                  ) : (
                    <Text style={styles.rankBadgeText}>{rank}</Text>
                  )}
                </View>

                {/* Shop Info */}
                <View style={styles.shopInfo}>
                  <Text
                    style={[styles.shopName, isBestRate && styles.shopNameBest]}
                    numberOfLines={1}>
                    {shop.name}
                  </Text>
                  <Text style={styles.shopDistance}>
                    {formatDistance(shop.distance)} away
                  </Text>
                  <View style={styles.ratesRow}>
                    <View style={styles.rateItem}>
                      <Text style={styles.rateLabel}>Buy</Text>
                      <Text style={styles.rateValue}>
                        {shop.rates.buyRate.toFixed(4)}
                      </Text>
                    </View>
                    <View style={styles.rateItem}>
                      <Text style={styles.rateLabel}>Sell</Text>
                      <Text style={styles.rateValue}>
                        {shop.rates.sellRate.toFixed(4)}
                      </Text>
                    </View>
                    <Text style={styles.rateAge}>
                      {getFormattedAge(shop.rates.rateAge)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    width: "100%",
    zIndex: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    marginLeft: "auto",
    width: 300,
    backgroundColor: "rgba(56, 56, 58, 0.95)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  shopItem: {
    flexDirection: "row",
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  shopItemBest: {
    borderColor: "rgb(249, 218, 71)",
    borderWidth: 2,
    backgroundColor: "rgba(249, 218, 71, 0.1)",
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankBadgeBest: {
    backgroundColor: "rgb(249, 218, 71)",
  },
  rankBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  shopNameBest: {
    color: "rgb(249, 218, 71)",
  },
  shopContact: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  shopHours: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  shopDistance: {
    color: "#999",
    fontSize: 12,
    marginBottom: 8,
  },
  ratesRow: {
    flexDirection: "row",
    gap: 16,
  },
  rateItem: {
    flex: 1,
  },
  rateLabel: {
    color: "#666",
    fontSize: 10,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  rateValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  rateAge: {
    color: "#999",
    fontSize: 12,
    marginTop: "auto",
    textAlign: "right",
  },
});
