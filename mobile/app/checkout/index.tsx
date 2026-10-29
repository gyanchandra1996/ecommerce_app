import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, CreditCard, CheckCircle2, ShieldCheck } from "lucide-react-native";
import { useCartStore } from "../../src/store/cartStore";
import { useAuthStore } from "../../src/store/authStore";
import { useLocationStore } from "../../src/store/locationStore";
import { apiClient } from "../../src/services/api";

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, discount, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const currentLocation = useLocationStore((s) => s.currentLocation);

  const [recipientName, setRecipientName] = useState(user?.name || "Customer");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "+91 98765 43210");
  const [streetAddress, setStreetAddress] = useState("Flat 402, Hill Road");
  const [city, setCity] = useState(currentLocation.city || "Mumbai");
  const [state, setState] = useState(currentLocation.state || "Maharashtra");
  const [pincode, setPincode] = useState(currentLocation.pincode || "400001");
  const [gateway, setGateway] = useState<"COD" | "Razorpay">("Razorpay");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const finalAmount = Math.max(0, subtotal - discount);

  const handlePlaceOrder = async () => {
    if (!recipientName || !recipientPhone || !streetAddress || !pincode) {
      Alert.alert("Missing Details", "Please fill in all delivery address fields.");
      return;
    }

    try {
      setIsPlacing(true);
      const orderPayload = {
        customerName: recipientName,
        customerEmail: user?.email || "customer@example.com",
        customerPhone: recipientPhone,
        shippingAddress: `${streetAddress}, ${city}, ${state} ${pincode}`,
        paymentMethod: gateway === "Razorpay" ? "Razorpay / UPI" : "Cash on Delivery (COD)",
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          name: it.product?.name || "Product",
          price: it.product?.price || 0,
          quantity: it.quantity,
        })),
        totalPrice: finalAmount,
      };

      const res = await apiClient.post("/api/orders", orderPayload);
      if (res.data?.success && res.data?.data) {
        setPlacedOrder(res.data.data);
        await clearCart();
      } else {
        throw new Error(res.data?.error || "Order placement failed");
      }
    } catch (err: any) {
      Alert.alert("Order Failed", err.message || "Failed to place order.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <CheckCircle2 size={64} color="#16A34A" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 22, fontWeight: "900", color: "#0F172A", textAlign: "center" }}>
          Order Confirmed!
        </Text>
        <Text style={{ fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 6, marginBottom: 20 }}>
          Thank you for shopping on G-Store. Your order has been placed successfully.
        </Text>

        <View style={{ width: "100%", backgroundColor: "#F8FAFC", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: "#64748B" }}>Order Number</Text>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A", fontFamily: "monospace" }}>
              #{placedOrder.orderNumber || placedOrder.id}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: "#64748B" }}>Amount Paid</Text>
            <Text style={{ fontSize: 13, fontWeight: "900", color: "#2563EB" }}>
              ₹{Number(placedOrder.totalPrice || finalAmount).toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12, color: "#64748B" }}>Payment Method</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>
              {placedOrder.gateway || gateway}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={{ width: "100%", backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>Continue Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>Express Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100 }}>
        {/* Delivery Address Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <MapPin size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>Delivery Destination</Text>
          </View>

          <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0" }}>
            <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Full Name</Text>
            <TextInput
              value={recipientName}
              onChangeText={setRecipientName}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
              style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 10, height: 40, fontSize: 12, marginBottom: 10 }}
            />

            <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Phone (+91)</Text>
            <TextInput
              value={recipientPhone}
              onChangeText={setRecipientPhone}
              placeholder="+91 Mobile Number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 10, height: 40, fontSize: 12, marginBottom: 10 }}
            />

            <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Street Address</Text>
            <TextInput
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="Flat/House No, Building, Street"
              placeholderTextColor="#94A3B8"
              style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 10, height: 40, fontSize: 12, marginBottom: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: "31%" }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>PIN</Text>
                <TextInput
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="PIN"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 8, height: 40, fontSize: 12 }}
                />
              </View>
              <View style={{ width: "31%" }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>City</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor="#94A3B8"
                  style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 8, height: 40, fontSize: 12 }}
                />
              </View>
              <View style={{ width: "31%" }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>State</Text>
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  placeholderTextColor="#94A3B8"
                  style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 8, height: 40, fontSize: 12 }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Payment Gateway Selector */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <CreditCard size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>Payment Method</Text>
          </View>

          <TouchableOpacity
            onPress={() => setGateway("Razorpay")}
            activeOpacity={0.8}
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: gateway === "Razorpay" ? "#2563EB" : "#E2E8F0",
              backgroundColor: gateway === "Razorpay" ? "#EFF6FF" : "#F8FAFC",
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: gateway === "Razorpay" ? "#2563EB" : "#94A3B8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              {gateway === "Razorpay" && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#2563EB" }} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>Razorpay / UPI / Cards</Text>
              <Text style={{ fontSize: 11, color: "#64748B" }}>Google Pay, PhonePe, Paytm, Credit &amp; Debit Cards</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setGateway("COD")}
            activeOpacity={0.8}
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: gateway === "COD" ? "#2563EB" : "#E2E8F0",
              backgroundColor: gateway === "COD" ? "#EFF6FF" : "#F8FAFC",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: gateway === "COD" ? "#2563EB" : "#94A3B8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              {gateway === "COD" && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#2563EB" }} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#0F172A" }}>Cash on Delivery (COD)</Text>
              <Text style={{ fontSize: 11, color: "#64748B" }}>Pay in cash upon doorstep delivery</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={{ backgroundColor: "#F8FAFC", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: "#64748B" }}>Subtotal ({items.length} items)</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>₹{subtotal.toLocaleString("en-IN")}</Text>
          </View>
          {discount > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: "#16A34A" }}>Discount Applied</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>-₹{discount.toLocaleString("en-IN")}</Text>
            </View>
          )}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: "#64748B" }}>Shipping Charges</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#16A34A" }}>FREE</Text>
          </View>
          <View style={{ height: 1, backgroundColor: "#E2E8F0", marginVertical: 6 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>Total Payable</Text>
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#2563EB" }}>₹{finalAmount.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* Place Order CTA */}
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#2563EB",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {isPlacing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
              Confirm &amp; Place Order (₹{finalAmount.toLocaleString("en-IN")})
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
