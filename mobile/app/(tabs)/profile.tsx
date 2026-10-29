import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { User, Package, MapPin, Shield, LogOut, ChevronRight } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>My Account</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {user ? (
          <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFFFFF" }}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>{user.name}</Text>
                <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{user.email}</Text>
                <View style={{ alignSelf: "flex-start", backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#2563EB" }}>VERIFIED BUYER</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: "#EFF6FF", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#DBEAFE", alignItems: "center", marginBottom: 20 }}>
            <User size={36} color="#2563EB" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#1E3A8A" }}>Sign in to your account</Text>
            <Text style={{ fontSize: 12, color: "#3B82F6", textAlign: "center", marginTop: 4, marginBottom: 14 }}>
              Track shipments, manage delivery addresses, and enjoy 1-click checkout.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.8}
              style={{ backgroundColor: "#2563EB", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={{ backgroundColor: "#F8FAFC", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" }}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}
          >
            <Package size={18} color="#2563EB" style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>My Orders &amp; Tracking</Text>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}
          >
            <MapPin size={18} color="#2563EB" style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>Saved Delivery Addresses</Text>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}
          >
            <Shield size={18} color="#2563EB" style={{ marginRight: 12 }} />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: "#0F172A" }}>Security &amp; Privacy</Text>
            <ChevronRight size={16} color="#94A3B8" />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              onPress={() => logout()}
              style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
            >
              <LogOut size={18} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 13, fontWeight: "700", color: "#EF4444" }}>Log Out</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Server Connection Information */}
        <View style={{ marginTop: 20, padding: 14, backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>
            Backend API Server:
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB", fontFamily: "monospace" }}>
            http://10.196.90.130:3000
          </Text>
          <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
            Connected over Wi-Fi with API Key and auto JWT session injection.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
