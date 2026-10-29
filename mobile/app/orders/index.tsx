import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react-native";
import { apiClient } from "../../src/services/api";
import { useAuthStore } from "../../src/store/authStore";

export default function MyOrdersScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/api/customer/orders");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status = "PROCESSING") => {
    const s = status.toUpperCase();
    if (s === "DELIVERED") {
      return { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0", icon: CheckCircle2 };
    }
    if (s === "SHIPPED") {
      return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", icon: Truck };
    }
    if (s === "CANCELLED") {
      return { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5", icon: XCircle };
    }
    return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", icon: Clock };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>My Orders &amp; Tracking</Text>
          <Text style={{ fontSize: 11, color: "#64748B" }}>{orders.length} orders on file</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 10, fontSize: 12, color: "#64748B" }}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Package size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>No Orders Yet</Text>
          <Text style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginTop: 4, marginBottom: 16 }}>
            When you place orders, their delivery tracking and digital invoices will appear here.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={{ backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Browse Deals</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id || String(Math.random())}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            const Icon = badge.icon;
            const itemsCount = item.items ? item.items.length : 1;

            return (
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: "900", color: "#0F172A", fontFamily: "monospace" }}>
                    #{item.orderNumber || item.id}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: badge.bg,
                      borderWidth: 1,
                      borderColor: badge.border,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Icon size={12} color={badge.text} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 10, fontWeight: "800", color: badge.text }}>
                      {item.status || "PROCESSING"}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>
                  {itemsCount} item(s) • {item.paymentMethod || "Razorpay / UPI"} •{" "}
                  <Text style={{ color: item.paymentStatus === "Paid" ? "#16A34A" : "#D97706", fontWeight: "700" }}>
                    {item.paymentStatus || "Pending"}
                  </Text>
                </Text>

                <View style={{ height: 1, backgroundColor: "#E2E8F0", marginVertical: 6 }} />

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
                  <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: "900", color: "#2563EB" }}>
                    ₹{Number(item.totalPrice || item.totalAmount || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
