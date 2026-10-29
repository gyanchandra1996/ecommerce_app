import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star, ArrowLeft } from "lucide-react-native";
import { apiClient, getFullImageUrl } from "../../src/services/api";
import { useCartStore } from "../../src/store/cartStore";

export default function CategoryProductsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addToCart);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCategoryProducts();
    }
  }, [slug]);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      // Fetch category products
      const res = await apiClient.get(`/api/products?limit=30`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        // Filter by category slug if provided
        const filtered = res.data.data.filter(
          (p: any) =>
            !slug ||
            (p.categoryNames && p.categoryNames.toLowerCase().includes(slug.replace("-", " ").toLowerCase())) ||
            (p.categoryIds && p.categoryIds.toLowerCase().includes(slug.replace("-", "_").toLowerCase()))
        );
        setProducts(filtered.length > 0 ? filtered : res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (productId: string) => {
    setAddingId(productId);
    await addToCart(productId, undefined, 1);
    setAddingId(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", textTransform: "capitalize" }}>
            {slug ? slug.replace("-", " ") : "Category Products"}
          </Text>
          <Text style={{ fontSize: 11, color: "#64748B" }}>{products.length} products found</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={{ marginTop: 10, fontSize: 12, color: "#64748B" }}>Loading catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 14 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => {
            const imageUrl = getFullImageUrl(item.mainImage);
            const isAdding = addingId === item.id;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/products/${item.id}`)}
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
                  {item.name}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#475569", marginLeft: 3 }}>
                    {item.rating || 4.5}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: "#2563EB" }}>
                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                  </Text>
                  {item.comparePrice ? (
                    <Text style={{ fontSize: 10, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 6 }}>
                      ₹{Number(item.comparePrice).toLocaleString("en-IN")}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={() => handleQuickAdd(item.id)}
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
          }}
        />
      )}
    </SafeAreaView>
  );
}
