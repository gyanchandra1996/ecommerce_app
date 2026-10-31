import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react-native";
import { useCartStore } from "../../src/store/cartStore";
import { useAuthStore } from "../../src/store/authStore";
import { API_BASE_URL, apiClient } from "../../src/services/api";

export default function CartScreen() {
  const router = useRouter();
  const { items, totalItems, subtotal, discount, couponCode, updateQuantity, removeFromCart, applyCoupon, clearCart } =
    useCartStore();
  const user = useAuthStore((s) => s.user);

  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleUpdateQty = async (productId: string, qty: number) => {
    setActionLoadingId(productId);
    await updateQuantity(productId, qty);
    setActionLoadingId(null);
  };

  const handleRemove = async (productId: string) => {
    setActionLoadingId(productId);
    await removeFromCart(productId);
    setActionLoadingId(null);
  };

  const handleOpenDirectPaymentLink = async () => {
    try {
      const res = await apiClient.post("/api/payments/razorpay/payment-link", {
        totalPrice: finalTotal > 0 ? finalTotal : 161.10,
        customerName: user?.name || "Customer",
        customerPhone: user?.phone || "+91 98765 43211",
      });
      const url = res.data?.shortUrl || "https://rzp.io/rzp/CTfYhMl";
      await Linking.openURL(url);
    } catch {
      await Linking.openURL("https://rzp.io/rzp/CTfYhMl");
    }
  };

  const handleApply = async () => {
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim().toUpperCase());
    setCouponMsg(res.message);
  };

  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>e-Shop Cart</Text>
          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{totalItems} items in cart</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => clearCart()}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#EF4444" }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <ShoppingCart size={36} color="#94A3B8" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#0F172A" }}>Your Cart is Empty</Text>
          <Text style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginTop: 4, marginBottom: 20 }}>
            Discover flagship smartphones, fashion labels, and household essentials.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/checkout")}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#2563EB",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <ShieldCheck size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>
              Open Razorpay Checkout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleOpenDirectPaymentLink}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#16A34A",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <ExternalLink size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>
              Pay via Razorpay Link (Direct)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            activeOpacity={0.8}
            style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: "#0F172A", fontWeight: "700", fontSize: 13 }}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* Cart Item Rows */}
          {items.map((it) => {
            const imgUrl = it.product?.mainImage
              ? it.product.mainImage.startsWith("http")
                ? it.product.mainImage
                : `${API_BASE_URL}${it.product.mainImage}`
              : "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=100";

            return (
              <View
                key={it.id}
                style={{
                  flexDirection: "row",
                  padding: 12,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  marginBottom: 10,
                }}
              >
                <Image
                  source={{ uri: imgUrl }}
                  resizeMode="contain"
                  style={{ width: 64, height: 64, borderRadius: 8, marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>
                    {it.product?.name || "Product Item"}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#2563EB", marginTop: 4 }}>
                    ₹{Number(it.product?.price || 0).toLocaleString("en-IN")}
                  </Text>

                  {/* Quantity controls & Loader */}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    {actionLoadingId === it.productId ? (
                      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                        <ActivityIndicator size="small" color="#2563EB" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#2563EB" }}>Updating...</Text>
                      </View>
                    ) : (
                      <>
                        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" }}>
                          <TouchableOpacity
                            onPress={() => handleUpdateQty(it.productId, it.quantity - 1)}
                            style={{ padding: 6 }}
                          >
                            <Minus size={14} color="#64748B" />
                          </TouchableOpacity>
                          <Text style={{ paddingHorizontal: 10, fontSize: 12, fontWeight: "800", color: "#0F172A" }}>
                            {it.quantity}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleUpdateQty(it.productId, it.quantity + 1)}
                            style={{ padding: 6 }}
                          >
                            <Plus size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleRemove(it.productId)}
                          style={{ padding: 4 }}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {/* Coupon Input */}
          <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", marginTop: 10, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Tag size={16} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>Have a Promo Coupon?</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                value={couponInput}
                onChangeText={setCouponInput}
                placeholder="e.g. WELCOME10, EMOX20"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 42,
                  fontSize: 12,
                  fontWeight: "700",
                  marginRight: 8,
                }}
              />
              <TouchableOpacity
                onPress={handleApply}
                activeOpacity={0.8}
                style={{ backgroundColor: "#2563EB", paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Apply</Text>
              </TouchableOpacity>
            </View>
            {couponMsg && (
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#16A34A", marginTop: 6 }}>
                {couponMsg}
              </Text>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: "#64748B" }}>Subtotal</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>
                ₹{subtotal.toLocaleString("en-IN")}
              </Text>
            </View>
            {discount > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={{ fontSize: 12, color: "#16A34A" }}>Coupon Discount</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>
                  -₹{discount.toLocaleString("en-IN")}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: "#64748B" }}>Estimated Delivery</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>FREE</Text>
            </View>
            <View style={{ height: 1, backgroundColor: "#E2E8F0", marginVertical: 8 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>Total Payable</Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#2563EB" }}>
                ₹{finalTotal.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          {/* Checkout CTA */}
          <TouchableOpacity
            onPress={() => router.push("/checkout")}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#2563EB",
              paddingVertical: 14,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 18,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14, marginRight: 8 }}>
              Proceed to Checkout
            </Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Direct Razorpay Hosted Link CTA */}
          <TouchableOpacity
            onPress={handleOpenDirectPaymentLink}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#F0FDF4",
              borderWidth: 1.5,
              borderColor: "#16A34A",
              paddingVertical: 13,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExternalLink size={16} color="#16A34A" style={{ marginRight: 8 }} />
            <Text style={{ color: "#14532D", fontWeight: "800", fontSize: 13 }}>
              Pay via Razorpay Link (Direct & Easy)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
