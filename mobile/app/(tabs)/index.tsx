import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MapPin,
  Search,
  LocateFixed,
  X,
  Plus,
  Flame,
  ChevronRight,
  Star,
  Check,
} from "lucide-react-native";
import { useLocationStore, POPULAR_INDIAN_HUBS } from "../../src/store/locationStore";
import { useCartStore } from "../../src/store/cartStore";
import { apiClient, API_BASE_URL } from "../../src/services/api";

const TOP_CATEGORIES = [
  { id: "cat_electronics", name: "Electronics", slug: "electronics", icon: "📱" },
  { id: "cat_fashion", name: "Fashion", slug: "fashion", icon: "👕" },
  { id: "cat_womens", name: "Women's", slug: "womens", icon: "👗" },
  { id: "cat_kids", name: "Kids' Fashion", slug: "kids-fashion", icon: "🧸" },
  { id: "cat_beauty", name: "Health & Beauty", slug: "health-beauty", icon: "✨" },
  { id: "cat_pharmacy", name: "Pharmacy", slug: "pharmacy", icon: "💊" },
  { id: "cat_groceries", name: "Groceries", slug: "groceries", icon: "🛒" },
  { id: "cat_luxury", name: "Luxury Item", slug: "luxury-item", icon: "💎" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentLocation, selectLocation, detectGPSLocation, isDetecting } = useLocationStore();
  const addToCart = useCartStore((s) => s.addToCart);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pinSearch, setPinSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await apiClient.get("/api/products?limit=10");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setProducts(res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    setAddingId(productId);
    await addToCart(productId, undefined, 1);
    setAddingId(null);
  };

  const filteredHubs = pinSearch.trim()
    ? POPULAR_INDIAN_HUBS.filter(
        (h) =>
          h.pincode.includes(pinSearch.trim()) ||
          h.city.toLowerCase().includes(pinSearch.toLowerCase())
      )
    : POPULAR_INDIAN_HUBS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* 1. Header with Brand & Flipkart Location Pill */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontSize: 24, fontWeight: "900", color: "#0F172A", letterSpacing: -0.5 }}>
              g-store
            </Text>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2563EB", marginLeft: 2 }} />
          </View>

          {/* Flipkart-Style Location Trigger */}
          <TouchableOpacity
            onPress={() => setIsLocationModalOpen(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              maxWidth: 190,
            }}
          >
            <MapPin size={14} color="#2563EB" style={{ marginRight: 5 }} />
            <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: "700", color: "#1E293B", flexShrink: 1 }}>
              {currentLocation.pincode ? `PIN ${currentLocation.pincode}` : "Select Location"}
            </Text>
            <Text style={{ fontSize: 10, color: "#64748B", marginLeft: 4 }}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 42,
            marginTop: 10,
          }}
        >
          <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search electronics, fashion, deals..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* 2. Hero Banner Promo Card */}
        <View style={{ margin: 16, borderRadius: 16, backgroundColor: "#0F172A", overflow: "hidden", padding: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Flame size={16} color="#F59E0B" style={{ marginRight: 5 }} />
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#F59E0B", textTransform: "uppercase" }}>
              Festival Mega Sale
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFFFFF", lineHeight: 26 }}>
            Samsung Galaxy S24 Ultra &amp; Top Electronics
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
            Up to 50% Off with instant Indian bank discounts
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/category/electronics")}
            style={{
              backgroundColor: "#2563EB",
              alignSelf: "flex-start",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Top 8 Categories Horizontal Scrollable Pills */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A", marginBottom: 12 }}>
            Featured Departments
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TOP_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => router.push(`/category/${cat.slug}`)}
                activeOpacity={0.7}
                style={{
                  alignItems: "center",
                  marginRight: 14,
                  width: 76,
                }}
              >
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, fontWeight: "600", color: "#334155", textAlign: "center" }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. Live Deals & Flagship Products Grid */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Flame size={18} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                Live Deals &amp; Best Sellers
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/deals")}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>View All &rarr;</Text>
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 30 }} />
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {products.map((prod) => {
                const isAdding = addingId === prod.id;
                const imageUrl = prod.mainImage
                  ? prod.mainImage.startsWith("http")
                    ? prod.mainImage
                    : `${API_BASE_URL}${prod.mainImage}`
                  : "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=200";

                return (
                  <TouchableOpacity
                    key={prod.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/products/${prod.id}`)}
                    style={{
                      width: "48%",
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "#F1F5F9",
                      padding: 10,
                      marginBottom: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      resizeMode="contain"
                      style={{ width: "100%", height: 130, borderRadius: 8, marginBottom: 8 }}
                    />
                    <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: "700", color: "#0F172A", minHeight: 32 }}>
                      {prod.name}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginLeft: 3 }}>
                        {prod.rating || 4.5}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: "900", color: "#2563EB" }}>
                        ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                      </Text>
                      {prod.comparePrice ? (
                        <Text style={{ fontSize: 10, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }}>
                          ₹{Number(prod.comparePrice).toLocaleString("en-IN")}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleQuickAdd(prod.id)}
                      disabled={isAdding}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: "#F0FDF4",
                        borderWidth: 1,
                        borderColor: "#BBF7D0",
                        paddingVertical: 6,
                        borderRadius: 8,
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="#16A34A" />
                      ) : (
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#16A34A" }}>
                          + Add to Cart
                        </Text>
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 5. Flipkart-Style Delivery Address Selector Modal */}
      <Modal visible={isLocationModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "85%",
              paddingBottom: 30,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                Select delivery address
              </Text>
              <TouchableOpacity onPress={() => setIsLocationModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 20, paddingTop: 14 }}>
              {/* Search input */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F8FAFC",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  paddingHorizontal: 12,
                  height: 44,
                  marginBottom: 14,
                }}
              >
                <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  value={pinSearch}
                  onChangeText={setPinSearch}
                  placeholder="Search by area, street name, pin code"
                  placeholderTextColor="#94A3B8"
                  style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
                />
              </View>

              {/* Use My Current Location */}
              <TouchableOpacity
                onPress={async () => {
                  const success = await detectGPSLocation();
                  if (success) setIsLocationModalOpen(false);
                }}
                disabled={isDetecting}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 14,
                  backgroundColor: "#EFF6FF",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#DBEAFE",
                  marginBottom: 18,
                }}
              >
                <LocateFixed size={20} color="#2563EB" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#2563EB" }}>
                    {isDetecting ? "Detecting GPS Location..." : "Use my current location"}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                    Allow access to location for fastest delivery pin
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Popular Delivery Hubs */}
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>
                Popular Delivery Hubs
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 }}>
                {filteredHubs.map((hub) => (
                  <TouchableOpacity
                    key={hub.pincode}
                    onPress={() => {
                      selectLocation({
                        label: `Deliver to ${hub.city} - ${hub.pincode}`,
                        pincode: hub.pincode,
                        city: hub.city,
                        state: hub.state,
                      });
                      setIsLocationModalOpen(false);
                    }}
                    style={{
                      width: "48%",
                      padding: 10,
                      backgroundColor: "#F8FAFC",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#0F172A" }}>{hub.city}</Text>
                    <Text style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>PIN {hub.pincode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
