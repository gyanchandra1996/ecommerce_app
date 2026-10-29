import React from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { Flame, Sparkles } from "lucide-react-native";

export default function DealsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Flame size={20} color="#EA580C" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>Live Deals &amp; Discounts</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Handpicked deals with verified lowest prices in India</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: "#EFF6FF", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#DBEAFE", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Sparkles size={16} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E40AF" }}>COUPON: WELCOME10</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#3B82F6" }}>Flat 10% instant discount on your first mobile order.</Text>
        </View>

        <View style={{ backgroundColor: "#FDF2F8", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#FCE7F3", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <Sparkles size={16} color="#DB2777" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#9D174D" }}>COUPON: FREESHIP</Text>
          </View>
          <Text style={{ fontSize: 12, color: "#EC4899" }}>Free priority express delivery across India on orders above ₹499.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
