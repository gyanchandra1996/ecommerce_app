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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus, MapPin, Trash2, Check, CheckCircle2, Home, Building2 } from "lucide-react-native";
import { apiClient } from "../../src/services/api";
import { useAuthStore } from "../../src/store/authStore";
import { useLocationStore } from "../../src/store/locationStore";

export default function AddressesScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { selectLocation } = useLocationStore();

  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [postalCode, setPostalCode] = useState("400001");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/addresses");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setAddresses(res.data.data);
      } else {
        setAddresses([]);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!name.trim() || !phone.trim() || !streetAddress.trim() || !city.trim() || !postalCode.trim()) {
      Alert.alert("Incomplete", "Please complete all required address fields.");
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient.post("/api/addresses", {
        name: name.trim(),
        phone: phone.trim(),
        addressLine1: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: "India",
        type: "shipping",
        isDefault,
      });

      if (res.data?.success) {
        setIsModalOpen(false);
        setStreetAddress("");
        await loadAddresses();
      } else {
        Alert.alert("Error", res.data?.error || "Failed to save address");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/api/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      Alert.alert("Error", "Could not delete address");
    }
  };

  const handleSelectDelivery = (addr: any) => {
    selectLocation({
      pincode: addr.postalCode,
      city: addr.city,
      state: addr.state,
      label: `${addr.addressLine1 || addr.streetAddress}, ${addr.city}`,
    });
    Alert.alert("Delivery Set", `Orders will now be delivered to ${addr.city} (${addr.postalCode})`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>Saved Addresses</Text>
            <Text style={{ fontSize: 11, color: "#64748B" }}>Manage your shipping destinations</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
          style={{
            backgroundColor: "#2563EB",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
          }}
        >
          <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Add New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 10, fontSize: 12, color: "#64748B" }}>Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <MapPin size={48} color="#94A3B8" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>No Addresses Saved</Text>
          <Text style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginTop: 4, marginBottom: 16 }}>
            Add your primary shipping and delivery address for speedy 1-click checkout.
          </Text>
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            style={{ backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Add Delivery Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {addresses.map((addr) => (
            <View
              key={addr.id}
              style={{
                backgroundColor: "#F8FAFC",
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A", marginRight: 8 }}>
                    {addr.name}
                  </Text>
                  {addr.isDefault && (
                    <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 9, fontWeight: "800", color: "#2563EB" }}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 12, color: "#475569", lineHeight: 18, marginBottom: 4 }}>
                {addr.addressLine1 || addr.streetAddress}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
              </Text>
              <Text style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>
                {addr.city}, {addr.state} - <Text style={{ fontWeight: "700" }}>{addr.postalCode}</Text>
              </Text>
              <Text style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>
                Phone: {addr.phone}
              </Text>

              <TouchableOpacity
                onPress={() => handleSelectDelivery(addr)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#2563EB",
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#2563EB", fontWeight: "800", fontSize: 12 }}>
                  Deliver to this Address
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Address Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 17, fontWeight: "900", color: "#0F172A" }}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={{ fontSize: 14, color: "#64748B", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Recipient Full Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Gyan Chandra"
                style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 12 }}
              />

              <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Mobile Number *</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 12 }}
              />

              <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>Flat, House No, Street Address *</Text>
              <TextInput
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="e.g. 402 Crystal Tower, Linking Road"
                style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 12 }}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>City *</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="Mumbai"
                    style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 10, fontSize: 13 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>PIN Code *</Text>
                  <TextInput
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                    placeholder="400001"
                    style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 10, fontSize: 13 }}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginBottom: 4 }}>State / Province *</Text>
              <TextInput
                value={state}
                onChangeText={setState}
                placeholder="Maharashtra"
                style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 16 }}
              />

              <TouchableOpacity
                onPress={handleAddAddress}
                disabled={saving}
                style={{ backgroundColor: "#2563EB", paddingVertical: 13, borderRadius: 10, alignItems: "center", marginBottom: 20 }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
