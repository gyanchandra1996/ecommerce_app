import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Layers } from "lucide-react-native";
import { apiClient } from "../../src/services/api";

const ICON_MAP: Record<string, string> = {
  electronics: "📱",
  fashion: "👕",
  womens: "👗",
  "kids-fashion": "🧸",
  "health-beauty": "✨",
  pharmacy: "💊",
  groceries: "🛒",
  "luxury-item": "💎",
  sportshoes: "👟",
};

const DEFAULT_CATEGORIES = [
  { id: "cat_electronics", name: "Electronics", slug: "electronics", icon: "📱", desc: "Flagship phones, laptops, audio", productCount: 5 },
  { id: "cat_fashion", name: "Fashion", slug: "fashion", icon: "👕", desc: "Men's apparel, shoes, jackets", productCount: 5 },
  { id: "cat_womens", name: "Women's", slug: "womens", icon: "👗", desc: "Ethnic wear, handbags, dresses", productCount: 5 },
  { id: "cat_kids_fashion", name: "Kids' Fashion", slug: "kids-fashion", icon: "🧸", desc: "Toys, babywear, school shoes", productCount: 5 },
  { id: "cat_health_beauty", name: "Health & Beauty", slug: "health-beauty", icon: "✨", desc: "Skincare, fragrance, personal care", productCount: 5 },
  { id: "cat_pharmacy", name: "Pharmacy", slug: "pharmacy", icon: "💊", desc: "Wellness, vitamins, first-aid", productCount: 5 },
  { id: "cat_groceries", name: "Groceries", slug: "groceries", icon: "🛒", desc: "Daily pantry, teas, superfoods", productCount: 5 },
  { id: "cat_luxury_item", name: "Luxury Item", slug: "luxury-item", icon: "💎", desc: "Chronographs, diamond jewelry", productCount: 5 },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/categories");
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        const mapped = res.data.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug || cat.id,
          icon: ICON_MAP[cat.slug] || cat.icon || "🛍️",
          desc: cat.description || "Explore verified department products",
          productCount: typeof cat.productCount === "number" ? cat.productCount : 5,
        }));
        setCategories(mapped);
      }
    } catch {
      // Retain default categories on network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Layers size={20} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#0F172A" }}>e-Shop Categories</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
          Explore {categories.length} shopping departments with verified prices
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/category/${cat.slug}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              backgroundColor: "#F8FAFC",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#0F172A" }}>{cat.name}</Text>
                {cat.productCount !== undefined && (
                  <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: "#2563EB" }}>
                      {cat.productCount} {cat.productCount === 1 ? "item" : "items"}
                    </Text>
                  </View>
                )}
              </View>
              <Text numberOfLines={1} style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>
                {cat.desc}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
