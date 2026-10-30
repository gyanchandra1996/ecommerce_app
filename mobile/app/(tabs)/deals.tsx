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
import { Flame, Sparkles, Tag, Star, Check, Zap, ArrowRight } from "lucide-react-native";
import { apiClient, getFullImageUrl } from "../../src/services/api";
import { useCartStore } from "../../src/store/cartStore";

export default function DealsScreen() {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/products?limit=20");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setProducts(res.data.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    setAddingId(productId);
    const ok = await addToCart(productId, undefined, 1);
    setAddingId(null);
    if (ok) {
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Flame size={22} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>e-Shop Live Deals</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
          Handpicked festival discounts with guaranteed lowest prices
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Deal Coupons Strip */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ backgroundColor: "#EFF6FF", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#DBEAFE", marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Sparkles size={16} color="#2563EB" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: "900", color: "#1E40AF" }}>COUPON: WELCOME10</Text>
              </View>
              <View style={{ backgroundColor: "#2563EB", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#FFFFFF" }}>10% OFF</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: "#3B82F6" }}>Flat 10% instant discount on your order at checkout.</Text>
          </View>

          <View style={{ backgroundColor: "#FDF2F8", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#FCE7F3" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Sparkles size={16} color="#DB2777" style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: "900", color: "#9D174D" }}>COUPON: FREESHIP</Text>
              </View>
              <View style={{ backgroundColor: "#DB2777", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#FFFFFF" }}>FREE SHIPPING</Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: "#EC4899" }}>Free priority express delivery across India on orders above ₹499.</Text>
          </View>
        </View>

        {/* Live Deals Grid */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Zap size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#0F172A" }}>
              Flash Sale Highlights ({products.length})
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 30 }} />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {products.map((item) => {
              const imageUrl = getFullImageUrl(item.mainImage);
              const isAdding = addingId === item.id;
              const isAdded = addedId === item.id;

              const priceNum = Number(item.price || 0);
              const comparePriceNum = item.comparePrice
                ? Number(item.comparePrice)
                : Math.round(priceNum * 1.3);
              const discountPercent =
                comparePriceNum > priceNum
                  ? Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100)
                  : 25;
              const savingsAmount = comparePriceNum - priceNum;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/products/${item.id}`)}
                  style={{
                    width: "48.5%",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    padding: 10,
                    marginBottom: 14,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 3,
                    elevation: 2,
                    position: "relative",
                  }}
                >
                  {/* Top-Left Offer Badge */}
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 10,
                      backgroundColor: "#16A34A",
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>
                      {discountPercent}% OFF
                    </Text>
                  </View>

                  <View style={{ width: "100%", height: 130, backgroundColor: "#F8FAFC", borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                    <Image
                      source={{ uri: imageUrl }}
                      resizeMode="contain"
                      style={{ width: "90%", height: "90%" }}
                    />
                  </View>

                  <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "800", color: "#2563EB", textTransform: "uppercase" }}>
                    {item.brand || "e-Shop Deal"}
                  </Text>

                  <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: "700", color: "#0F172A", minHeight: 32, marginTop: 2 }}>
                    {item.name}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginLeft: 4 }}>
                      {item.rating || 4.5}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6, flexWrap: "wrap" }}>
                    <Text style={{ fontSize: 15, fontWeight: "900", color: "#0F172A" }}>
                      ₹{priceNum.toLocaleString("en-IN")}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }}>
                      ₹{comparePriceNum.toLocaleString("en-IN")}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: "900", color: "#16A34A", marginLeft: 6 }}>
                      {discountPercent}% off
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Tag size={11} color="#16A34A" style={{ marginRight: 4 }} />
                    <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "800", color: "#16A34A" }}>
                      Save ₹{savingsAmount.toLocaleString("en-IN")}
                    </Text>
                  </View>

                  {/* Add to Cart */}
                  <TouchableOpacity
                    onPress={() => handleQuickAdd(item.id)}
                    disabled={isAdding}
                    activeOpacity={0.8}
                    style={{
                      backgroundColor: isAdded ? "#16A34A" : "#EFF6FF",
                      borderWidth: 1,
                      borderColor: isAdded ? "#16A34A" : "#BFDBFE",
                      paddingVertical: 7,
                      borderRadius: 8,
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 8,
                      flexDirection: "row",
                    }}
                  >
                    {isAdding ? (
                      <ActivityIndicator size="small" color="#2563EB" />
                    ) : isAdded ? (
                      <>
                        <Check size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 11, fontWeight: "800", color: "#FFFFFF" }}>Added</Text>
                      </>
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: "800", color: "#2563EB" }}>+ Add to Cart</Text>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
