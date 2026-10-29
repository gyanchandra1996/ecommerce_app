import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { X, User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { apiClient } from "../../src/services/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithGoogle, isLoading, error } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    apiClient
      .get("/api/settings/auth/oauth")
      .then((res) => {
        if (res.data?.success && res.data?.data?.google) {
          setGoogleEnabled(Boolean(res.data.data.google.enabled));
        }
      })
      .catch(() => {});
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) return;
    const ok = await register(name, email, password);
    if (ok) {
      router.back();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const targetEmail = email.trim() || "mobile.customer@example.com";
    const ok = await loginWithGoogle(targetEmail, name.trim() || targetEmail.split("@")[0]);
    setGoogleLoading(false);
    if (ok) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>Create Customer Account</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <X size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 24, marginTop: 10 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <UserPlus size={28} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#0F172A" }}>Join G-Store</Text>
          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Enjoy exclusive discounts and express tracking
          </Text>
        </View>

        {error && (
          <View style={{ backgroundColor: "#FEF2F2", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#FCA5A5", marginBottom: 14 }}>
            <Text style={{ fontSize: 12, color: "#B91C1C", fontWeight: "600" }}>{error}</Text>
          </View>
        )}

        {/* Full Name */}
        <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
          Full Name
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 46, marginBottom: 14 }}>
          <User size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Vikram Sharma"
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
          />
        </View>

        {/* Email Address */}
        <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
          Email Address
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 46, marginBottom: 14 }}>
          <Mail size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="customer@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
          />
        </View>

        {/* Password */}
        <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
          Password (min. 6 characters)
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 46, marginBottom: 18 }}>
          <Lock size={16} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
          style={{ backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14, marginRight: 6 }}>
                Create Account
              </Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Google Sign Up */}
        {googleEnabled && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
              <Text style={{ marginHorizontal: 12, fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" }}>
                Or sign up with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
            </View>

            <TouchableOpacity
              onPress={handleGoogle}
              disabled={googleLoading || isLoading}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <>
                  <Text style={{ fontSize: 15, marginRight: 8 }}>🌐</Text>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E293B" }}>Sign up with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            Already have an account?{" "}
            <Text onPress={() => router.replace("/(auth)/login")} style={{ fontWeight: "800", color: "#2563EB" }}>
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
