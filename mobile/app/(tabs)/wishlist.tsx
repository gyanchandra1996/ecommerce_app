import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Heart, ShoppingBag, ArrowRight, Sparkles, Trash2 } from "lucide-react-native";
import { useWishlistStore, WishlistItem } from "../../src/store/wishlistStore";
import { useCartStore } from "../../src/store/cartStore";
import { getFullImageUrl } from "../../src/services/api";

export default function WishlistScreen() {
  const router = useRouter();
  const { items, removeItem, clearWishlist, loadWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movedId, setMovedId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleMoveToBag = async (item: WishlistItem) => {
    setMovingId(item.id);
    const ok = await addToCart(item.id, undefined, 1);
    setMovingId(null);
    if (ok) {
      setMovedId(item.id);
      setTimeout(async () => {
        await removeItem(item.id);
        setMovedId(null);
      }, 700);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Top Header matching Inspiration Screenshot */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: "#0F172A",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Wishlist
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            {items.length} {items.length === 1 ? "saved item" : "saved items"}
          </Text>
        </View>

        {items.length > 0 && (
          <TouchableOpacity
            onPress={() => clearWishlist()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FEF2F2",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Trash2 size={13} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#EF4444" }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        /* Empty State matching Image 2 Screen 3 */
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          {/* Stylized Gift Box Icon Container */}
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "#F5F3FF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#EDE9FE",
            }}
          >
            <Text style={{ fontSize: 48 }}>🎁</Text>
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: "#0F172A",
              marginBottom: 6,
            }}
          >
            Your wishlist is empty
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#64748B",
              textAlign: "center",
              lineHeight: 18,
              marginBottom: 24,
            }}
          >
            Explore trending smartphones, fashion apparel, sneakers &amp; daily deals and tap the heart icon to save them.
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#2563EB",
              paddingHorizontal: 24,
              paddingVertical: 13,
              borderRadius: 14,
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>
              Discover Products
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Wishlist Items Grid matching Image 2 Screen 3 */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {items.map((item) => {
              const isMoving = movingId === item.id;
              const isMoved = movedId === item.id;
              const discountPercent =
                item.discountPercentage ||
                (item.comparePrice && item.comparePrice > item.price
                  ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
                  : 20);

              return (
                <View
                  key={item.id}
                  style={{
                    width: "48.5%",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    padding: 12,
                    marginBottom: 14,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Top Badges: Discount Pill + Heart Action */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#FEF08A",
                        paddingHorizontal: 7,
                        paddingVertical: 2,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: "900", color: "#854D0E" }}>
                        {discountPercent}%
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#FEE2E2",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={14} color="#EF4444" fill="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Product Image */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push(`/products/${item.id}`)}
                    style={{
                      height: 125,
                      backgroundColor: "#F8FAFC",
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    {(() => {
                      const rawImg =
                        item.image ||
                        item.mainImage ||
                        (item as any).images?.[0] ||
                        (item as any).assets?.[0]?.url;
                      const displayUri = failedImages[item.id]
                        ? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
                        : getFullImageUrl(rawImg);

                      return (
                        <Image
                          source={{ uri: displayUri }}
                          resizeMode="contain"
                          onError={() => {
                            if (!failedImages[item.id]) {
                              setFailedImages((prev) => ({ ...prev, [item.id]: true }));
                            }
                          }}
                          style={{ width: "90%", height: "90%" }}
                        />
                      );
                    })()}
                  </TouchableOpacity>

                  {/* Product Title & Brand */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 10,
                      fontWeight: "800",
                      color: "#64748B",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.brand || "e-Shop"}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: "#0F172A",
                      marginTop: 2,
                    }}
                  >
                    {item.name}
                  </Text>

                  {/* Price Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      marginTop: 4,
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "900", color: "#0F172A" }}>
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </Text>
                    {item.comparePrice ? (
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#94A3B8",
                          textDecorationLine: "line-through",
                          marginLeft: 6,
                        }}
                      >
                        ₹{Number(item.comparePrice).toLocaleString("en-IN")}
                      </Text>
                    ) : null}
                  </View>

                  {/* Move to bag Pill Button matching Image 2 Screen 3 */}
                  <TouchableOpacity
                    onPress={() => handleMoveToBag(item)}
                    disabled={isMoving || isMoved}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isMoved ? "#16A34A" : "#F1F5F9",
                      paddingVertical: 9,
                      borderRadius: 10,
                    }}
                  >
                    {isMoving ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : isMoved ? (
                      <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 11 }}>
                        Added to Bag! ✓
                      </Text>
                    ) : (
                      <>
                        <ShoppingBag size={13} color="#0F172A" style={{ marginRight: 5 }} />
                        <Text style={{ fontSize: 11, fontWeight: "800", color: "#0F172A" }}>
                          Move to bag
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
