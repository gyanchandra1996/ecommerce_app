import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  MapPin,
  Search,
  LocateFixed,
  X,
  Flame,
  ChevronRight,
  Star,
  Check,
  ShoppingCart,
  Sparkles,
} from "lucide-react-native";
import { useLocationStore, POPULAR_INDIAN_HUBS } from "../../src/store/locationStore";
import { useCartStore } from "../../src/store/cartStore";
import { apiClient, getFullImageUrl, API_BASE_URL } from "../../src/services/api";

const TOP_CATEGORIES = [
  { id: "cat_electronics", name: "Electronics", slug: "electronics", icon: "📱" },
  { id: "cat_fashion", name: "Fashion", slug: "fashion", icon: "👕" },
  { id: "cat_womens", name: "Women's", slug: "womens", icon: "👗" },
  { id: "cat_kids_fashion", name: "Kids' Fashion", slug: "kids-fashion", icon: "🧸" },
  { id: "cat_health_beauty", name: "Health & Beauty", slug: "health-beauty", icon: "✨" },
  { id: "cat_pharmacy", name: "Pharmacy", slug: "pharmacy", icon: "💊" },
  { id: "cat_groceries", name: "Groceries", slug: "groceries", icon: "🛒" },
  { id: "cat_luxury_item", name: "Luxury Item", slug: "luxury-item", icon: "💎" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentLocation, selectLocation, detectGPSLocation, isDetecting } = useLocationStore();
  const { addToCart, totalItems } = useCartStore();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pinSearch, setPinSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      setLoadError(null);
      const res = await apiClient.get("/api/products?limit=20");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setProducts(res.data.data);
      }
    } catch (err: any) {
      setLoadError(err.message || "Failed to load products from server.");
    } finally {
      setLoadingProducts(false);
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

  const filteredHubs = pinSearch.trim()
    ? POPULAR_INDIAN_HUBS.filter(
        (h) =>
          h.pincode.includes(pinSearch.trim()) ||
          h.city.toLowerCase().includes(pinSearch.toLowerCase())
      )
    : POPULAR_INDIAN_HUBS;

  const displayProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : products;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* 1. Clean Non-Overlapping Mobile Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
        }}
      >
        {/* Top Line: Brand Name + Cart Button */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>🛍️</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#0F172A", letterSpacing: -0.5 }}>
                  G-
                </Text>
                <Text style={{ fontSize: 22, fontWeight: "900", color: "#2563EB", letterSpacing: -0.5 }}>
                  Mart
                </Text>
              </View>
              <Text style={{ fontSize: 9, fontWeight: "700", color: "#16A34A", marginTop: -2 }}>
                Superstore • Express Delivery
              </Text>
            </View>
          </View>

          {/* Cart Icon with Live Badge */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cart")}
            activeOpacity={0.7}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCart size={19} color="#0F172A" />
            {totalItems > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  backgroundColor: "#2563EB",
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "900" }}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Second Line: Flipkart-Style Delivery Destination Pill */}
        <TouchableOpacity
          onPress={() => setIsLocationModalOpen(true)}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F8FAFC",
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            marginBottom: 8,
          }}
        >
          <MapPin size={14} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 11, color: "#64748B", marginRight: 4 }}>Delivering to:</Text>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: "800", color: "#0F172A", flex: 1 }}>
            {currentLocation.city || "Mumbai"} ({currentLocation.pincode || "400001"})
          </Text>
          <Text style={{ fontSize: 10, color: "#2563EB", fontWeight: "800", marginLeft: 4 }}>Change ▼</Text>
        </TouchableOpacity>

        {/* Third Line: Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F5F9",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 40,
          }}
        >
          <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search 40+ products, electronics, fashion..."
            placeholderTextColor="#94A3B8"
            style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
              <X size={15} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* 2. Hero Banner Promo Card */}
        <View style={{ margin: 16, borderRadius: 16, backgroundColor: "#0F172A", overflow: "hidden", padding: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Flame size={16} color="#F59E0B" style={{ marginRight: 5 }} />
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#F59E0B", textTransform: "uppercase" }}>
              Festival Mega Sale • G-Mart
            </Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#FFFFFF", lineHeight: 26 }}>
            Samsung Galaxy S24 Ultra &amp; Top Tech
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
            Up to 50% Off with instant Indian bank discounts &amp; free shipping
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
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Shop Electronics &rarr;</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Top 8 Categories Horizontal Scrollable Pills */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0F172A" }}>
              Explore Departments
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/categories")}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>All &rarr;</Text>
            </TouchableOpacity>
          </View>

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
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 11, fontWeight: "700", color: "#334155", textAlign: "center" }}
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
                {searchQuery ? `Search Results (${displayProducts.length})` : "Live Deals & Best Sellers"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/deals")}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>View Deals &rarr;</Text>
            </TouchableOpacity>
          </View>

          {loadingProducts ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 30 }} />
          ) : loadError ? (
            <View style={{ backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#DBEAFE", borderRadius: 12, padding: 14, alignItems: "center", marginVertical: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#1E3A8A", marginBottom: 4 }}>
                Connecting to G-Mart Backend
              </Text>
              <Text style={{ fontSize: 11, color: "#3B82F6", textAlign: "center", marginBottom: 10 }}>
                Server: {API_BASE_URL}
              </Text>
              <TouchableOpacity
                onPress={loadFeaturedProducts}
                style={{ backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>Tap to Retry</Text>
              </TouchableOpacity>
            </View>
          ) : displayProducts.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 30 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#64748B" }}>No products found</Text>
              <Text style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Try searching for electronics, fashion, or groceries</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {displayProducts.map((prod) => {
                const isAdding = addingId === prod.id;
                const isAdded = addedId === prod.id;
                const imageUrl = getFullImageUrl(prod.mainImage);

                return (
                  <TouchableOpacity
                    key={prod.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/products/${prod.id}`)}
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
                    }}
                  >
                    <View style={{ width: "100%", height: 130, backgroundColor: "#F8FAFC", borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                      <Image
                        source={{ uri: imageUrl }}
                        resizeMode="contain"
                        style={{ width: "90%", height: "90%" }}
                      />
                    </View>

                    <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "800", color: "#2563EB", textTransform: "uppercase" }}>
                      {prod.brand || "G-Mart"}
                    </Text>

                    <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: "700", color: "#0F172A", minHeight: 32, marginTop: 2 }}>
                      {prod.name}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginLeft: 4 }}>
                        {prod.rating || 4.5}
                      </Text>
                      <Text style={{ fontSize: 10, color: "#94A3B8", marginLeft: 4 }}>
                        ({prod.reviewsCount || 40})
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6 }}>
                      <Text style={{ fontSize: 15, fontWeight: "900", color: "#0F172A" }}>
                        ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                      </Text>
                      {prod.comparePrice ? (
                        <Text style={{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }}>
                          ₹{Number(prod.comparePrice).toLocaleString("en-IN")}
                        </Text>
                      ) : null}
                    </View>

                    {/* Quick Add to Cart Button */}
                    <TouchableOpacity
                      onPress={() => handleQuickAdd(prod.id)}
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
        </View>
      </ScrollView>

      {/* 5. Flipkart-Style Delivery Address Slide-over Modal */}
      <Modal visible={isLocationModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 17, fontWeight: "900", color: "#0F172A" }}>Select Delivery Address</Text>
                <Text style={{ fontSize: 12, color: "#64748B" }}>Express doorstep shipping across India</Text>
              </View>
              <TouchableOpacity onPress={() => setIsLocationModalOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Indian PIN / City Search */}
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", paddingHorizontal: 12, height: 42, marginBottom: 12 }}>
              <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                value={pinSearch}
                onChangeText={setPinSearch}
                placeholder="Search area, city, or 6-digit PIN code"
                placeholderTextColor="#94A3B8"
                style={{ flex: 1, fontSize: 13, color: "#0F172A" }}
              />
            </View>

            {/* GPS Auto-Detect Button */}
            <TouchableOpacity
              onPress={async () => {
                await detectGPSLocation();
                setIsLocationModalOpen(false);
              }}
              disabled={isDetecting}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#EFF6FF",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#BFDBFE",
                marginBottom: 16,
              }}
            >
              <LocateFixed size={18} color="#2563EB" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#1D4ED8" }}>
                  {isDetecting ? "Detecting GPS Location..." : "Use My Current Location"}
                </Text>
                <Text style={{ fontSize: 11, color: "#3B82F6" }}>Autofill state, city, and nearest postal hub</Text>
              </View>
            </TouchableOpacity>

            <Text style={{ fontSize: 12, fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: 8 }}>
              Popular Indian Hubs
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredHubs.map((hub) => (
                <TouchableOpacity
                  key={hub.pincode}
                  onPress={() => {
                    selectLocation({
                      pincode: hub.pincode,
                      city: hub.city,
                      state: hub.state,
                      label: `${hub.city}, ${hub.state} (${hub.pincode})`,
                    });
                    setIsLocationModalOpen(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F1F5F9",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin size={16} color="#64748B" style={{ marginRight: 10 }} />
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#0F172A" }}>
                        {hub.city}, {hub.state}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#64748B" }}>PIN: {hub.pincode}</Text>
                    </View>
                  </View>
                  {currentLocation.pincode === hub.pincode && (
                    <Text style={{ fontSize: 11, fontWeight: "800", color: "#2563EB" }}>Selected</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
