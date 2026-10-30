import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Mail, Lock, LogIn, ArrowRight } from "lucide-react-native";
import { useAuthStore } from "../../src/store/authStore";
import { apiClient } from "../../src/services/api";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Check dynamic setting table
    apiClient
      .get("/api/settings/auth/oauth")
      .then((res) => {
        if (res.data?.success && res.data?.data?.google) {
          setGoogleEnabled(Boolean(res.data.data.google.enabled));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return;
    const ok = await login(email, password);
    if (ok) {
      router.back();
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const targetEmail = email.trim() || "mobile.google.user@example.com";
    const ok = await loginWithGoogle(targetEmail, targetEmail.split("@")[0]);
    setGoogleLoading(false);
    if (ok) {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>Customer Sign In</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <X size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 24, marginTop: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#0F172A", letterSpacing: -0.5 }}>
              e-
            </Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: "#2563EB", letterSpacing: -0.5 }}>
              Shop
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Sign in to track orders, addresses &amp; express checkout
          </Text>
        </View>

        {error && (
          <View style={{ backgroundColor: "#FEF2F2", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#FCA5A5", marginBottom: 14 }}>
            <Text style={{ fontSize: 12, color: "#B91C1C", fontWeight: "600" }}>{error}</Text>
          </View>
        )}

        {/* Email Input */}
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

        {/* Password Input */}
        <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
          Password
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

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
          style={{ backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14, marginRight: 6 }}>Sign In</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Dynamic Social Login Button (Controlled by Setting Table context: auth_oauth) */}
        {googleEnabled && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
              <Text style={{ marginHorizontal: 12, fontSize: 11, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase" }}>
                Or continue with
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
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E293B" }}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 12, color: "#64748B" }}>
            New to e-Shop?{" "}
            <Text onPress={() => router.push("/(auth)/register")} style={{ fontWeight: "800", color: "#2563EB" }}>
              Create an Account
            </Text>
          </Text>
        </View>

        {/* Demo Credentials Helper */}
        <View style={{ marginTop: 30, padding: 14, backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Quick Demo Fill:</Text>
          <TouchableOpacity
            onPress={() => {
              setEmail("gyanchandranist@gmail.com");
              setPassword("password123");
            }}
          >
            <Text style={{ fontSize: 11, color: "#2563EB", fontWeight: "600" }}>
              Fill: gyanchandranist@gmail.com / password123
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
