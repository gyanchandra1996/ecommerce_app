import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, ArrowLeft, ShoppingCart, Check } from "lucide-react-native";
import { apiClient, getFullImageUrl } from "../../src/services/api";
import { useCartStore } from "../../src/store/cartStore";

const CATEGORY_TITLES: Record<string, string> = {
  electronics: "Electronics & Tech",
  fashion: "Men's & Casual Fashion",
  womens: "Women's Fashion & Ethnic",
  "kids-fashion": "Kids' Fashion & Toys",
  "health-beauty": "Health & Beauty",
  pharmacy: "Pharmacy & Wellness",
  groceries: "Daily Groceries & Pantry",
  "luxury-item": "Luxury Jewelry & Watches",
};

export default function CategoryProductsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { addToCart, totalItems } = useCartStore();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCategoryProducts();
    }
  }, [slug]);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      // Query backend with categoryId / slug directly
      const res = await apiClient.get(`/api/products?categoryId=${slug}`);
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setProducts(res.data.data);
      } else {
        // Fallback: fetch general products and filter cleanly
        const fallbackRes = await apiClient.get(`/api/products`);
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data?.data)) {
          const normSlug = (slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          const filtered = fallbackRes.data.data.filter((p: any) => {
            const catNames = Array.isArray(p.categoryNames)
              ? p.categoryNames
              : typeof p.categoryNames === "string"
              ? [p.categoryNames]
              : [];
            const catIds = Array.isArray(p.categoryIds)
              ? p.categoryIds
              : typeof p.categoryIds === "string"
              ? [p.categoryIds]
              : [];

            return (
              catNames.some((c: string) => String(c).toLowerCase().replace(/[^a-z0-9]/g, "").includes(normSlug)) ||
              catIds.some((cid: string) => String(cid).toLowerCase().replace(/[^a-z0-9]/g, "").includes(normSlug))
            );
          });
          setProducts(filtered.length > 0 ? filtered : fallbackRes.data.data);
        }
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
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

  const displayName =
    (slug && CATEGORY_TITLES[slug]) ||
    (slug ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Products");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Clean Mobile App Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#F1F5F9",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#FFFFFF",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#F8FAFC",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginRight: 12,
            }}
          >
            <ArrowLeft size={18} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "900", color: "#0F172A" }}>
              {displayName}
            </Text>
            <Text style={{ fontSize: 11, color: "#64748B" }}>
              {loading ? "Searching catalog..." : `${products.length} products available`}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/cart")}
          style={{
            position: "relative",
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#F8FAFC",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <ShoppingCart size={18} color="#0F172A" />
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 12, fontSize: 13, color: "#64748B", fontWeight: "600" }}>
            Loading {displayName}...
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 6 }}>
            No Products Found
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", textAlign: "center", marginBottom: 18 }}>
            No products match this department yet. Explore our other featured collections.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/categories")}
            style={{ backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 13 }}>Browse Categories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => {
            const imageUrl = getFullImageUrl(item.mainImage);
            const isAdding = addingId === item.id;
            const isAdded = addedId === item.id;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/products/${item.id}`)}
                style={{
                  width: "48.5%",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  padding: 10,
                  marginBottom: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View style={{ width: "100%", height: 135, backgroundColor: "#F8FAFC", borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                  <Image
                    source={{ uri: imageUrl }}
                    resizeMode="contain"
                    style={{ width: "90%", height: "90%" }}
                  />
                </View>

                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "800", color: "#2563EB", textTransform: "uppercase" }}>
                  {item.brand || "G-Mart"}
                </Text>

                <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: "700", color: "#0F172A", minHeight: 32, marginTop: 2 }}>
                  {item.name}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontSize: 11, fontWeight: "800", color: "#475569", marginLeft: 4 }}>
                    {item.rating || 4.5}
                  </Text>
                  <Text style={{ fontSize: 10, color: "#94A3B8", marginLeft: 4 }}>
                    ({item.reviewsCount || 42})
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: "900", color: "#0F172A" }}>
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                  </Text>
                  {item.comparePrice ? (
                    <Text style={{ fontSize: 11, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }}>
                      ₹{Number(item.comparePrice).toLocaleString("en-IN")}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() => handleQuickAdd(item.id)}
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
          }}
        />
      )}
    </SafeAreaView>
  );
}
